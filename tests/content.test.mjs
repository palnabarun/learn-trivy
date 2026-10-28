import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { Script } from 'node:vm';
import { createHash } from 'node:crypto';
import { createHandler } from '../scripts/serve.mjs';
import { lessons, byId, groups, sources, glossary, components, paths } from '../site/content.mjs';

const root = new URL('../', import.meta.url);
const routes = new Set(['overview', 'glossary', 'sources', ...lessons.map(l => l.id)]);

test('every lesson appears exactly once in navigation', () => {
  const ids = groups.flatMap(g => g.ids);
  assert.equal(new Set(ids).size, ids.length);
  assert.deepEqual(new Set(ids), routes);
  assert.equal(Object.keys(byId).length, lessons.length);
});

test('all learning paths, diagram links, and glossary links resolve', () => {
  for (const path of paths) for (const id of path.ids) assert.ok(byId[id], `${path.id} -> ${id}`);
  for (const component of Object.values(components)) assert.ok(byId[component.link]);
  for (const [, , id] of glossary) assert.ok(byId[id]);
  for (const lesson of lessons) for (const step of lesson.flow || []) assert.ok(byId[step.component]);
  for (const lesson of lessons) for (const section of lesson.sections) {
    for (const group of section.boundaryMap?.groups || []) for (const item of group.items) assert.ok(byId[item.link], `${lesson.id}: ${item.link}`);
  }
});

test('lesson structure, question indices, and source references are internally consistent', () => {
  for (const lesson of lessons) {
    assert.ok(lesson.sections.length >= 3, lesson.id);
    assert.equal(new Set(lesson.sections.map(s => s.id)).size, lesson.sections.length, lesson.id);
    assert.ok(lesson.quiz.answer >= 0 && lesson.quiz.answer < lesson.quiz.options.length, lesson.id);
    assert.ok(lesson.quiz.explanation.length > 30, lesson.id);
    assert.ok(lesson.sources.length >= 2, lesson.id);
    for (const source of lesson.sources) assert.ok(sources[source], `${lesson.id} -> ${source}`);
    const content = JSON.stringify(lesson);
    for (const [, id] of content.matchAll(/\[\[([\w-]+)\|/g)) assert.ok(routes.has(id), `${lesson.id} -> ${id}`);
    assert.ok(!/TODO|lorem ipsum|coming soon/i.test(content), lesson.id);
  }
});

test('source URLs use HTTPS and known upstream documentation hosts', () => {
  const hosts = new Set(['trivy.dev', 'aquasecurity.github.io', 'learn.agentsubstrate.dev', 'specs.opencontainers.org', 'www.openpolicyagent.org', 'pkg.go.dev', 'pkgs.alpinelinux.org', 'security.alpinelinux.org']);
  for (const source of Object.values(sources)) {
    const url = new URL(source.url);
    assert.equal(url.protocol, 'https:');
    assert.ok(hosts.has(url.hostname));
  }
});

test('all downloadable fixtures exist and stay inside the site', async () => {
  for (const lesson of lessons) for (const section of lesson.sections) {
    for (const path of [section.download, ...(section.downloads || []).map(d => d.path)].filter(Boolean)) {
      assert.ok(!path.includes('..'));
      await access(new URL(`site/${path}`, root));
    }
  }
  const fixture = await readFile(new URL('site/labs/privileged-pod.yaml', root), 'utf8');
  assert.match(fixture, /privileged: true/);
  assert.match(fixture, /Do not apply/);
});

test('shell exercise blocks parse without executing any command', () => {
  for (const lesson of lessons) for (const section of lesson.sections) if (section.code?.language === 'shell') {
    execFileSync('/bin/sh', ['-n'], { input: section.code.text, stdio: ['pipe', 'pipe', 'pipe'] });
  }
});

test('offline exercise scans a local archive with a prepared cache', () => {
  const command = byId['air-gap'].sections.find(s => s.id === 'scan').code.text;
  assert.match(command, /--input \.\/alpine\.tar/);
  assert.match(command, /--cache-dir \.\/trivy-cache/);
  assert.match(command, /--skip-db-update/);
  assert.match(command, /--offline-scan/);
});

test('prototype properties are not valid lesson routes', () => {
  assert.equal(byId.__proto__, undefined);
  assert.equal(byId.constructor, undefined);
});

test('technical sections have valid evidence, tables, and sequence participants', () => {
  for (const lesson of lessons) for (const section of lesson.sections) {
    for (const ref of section.evidence || []) assert.ok(sources[ref], `${lesson.id}/${section.id}: ${ref}`);
    if (section.table) {
      assert.ok(section.table.caption);
      for (const row of section.table.rows) assert.equal(row.length, section.table.headers.length, section.id);
    }
    if (section.sequence) {
      assert.ok(section.evidence?.length, section.id);
      for (const [from, to, text] of section.sequence.messages) {
        assert.ok(section.sequence.actors[from] && section.sequence.actors[to], `${lesson.id}: invalid participant`);
        assert.ok(text.length > 0);
      }
    }
    if (section.code?.language === 'json') JSON.parse(section.code.text);
  }
});

test('recorded lab evidence agrees with its fixtures, policy, and displayed outcomes', async () => {
  const record = JSON.parse(await readFile(new URL('site/labs/verification.json', root), 'utf8'));
  const hash = data => createHash('sha256').update(data).digest('hex');
  assert.equal(record.ruleSha256, hash(await readFile(new URL('site/labs/team.rego', root))));
  const displayed = byId['custom-checks'].sections.find(s => s.id === 'rule').code.text;
  assert.equal(displayed.trim(), (await readFile(new URL('site/labs/team.rego', root), 'utf8')).trim());
  for (const observation of record.observations.filter(o => o.fixtureSha256)) {
    assert.equal(observation.fixtureSha256, hash(await readFile(new URL(observation.fixture, root))));
    assert.equal(observation.customFindingCount, observation.findings.length);
    assert.ok(observation.totalFindingCount >= observation.customFindingCount);
  }
  assert.deepEqual(record.observations.filter(o => o.fixtureSha256).map(o => [o.customFindingCount, o.totalFindingCount]), [[1,18],[0,17],[1,18],[0,0]]);
  assert.deepEqual(record.observations.filter(o => o.behavior && o.exitStatus !== undefined).map(o => o.exitStatus), [7,1]);
  const comparison = record.observations.find(o => o.removedFinding);
  assert.deepEqual([comparison.removedFinding, comparison.beforeCount, comparison.afterCount], ['KSV-0017',17,16]);
  const evidence = JSON.parse(await readFile(new URL('site/labs/evidence-observations.json', root), 'utf8'));
  for (const [fixture, expectedHash] of Object.entries(evidence.fixtures)) {
    assert.equal(hash(await readFile(new URL(fixture, root))), expectedHash, fixture);
  }
  const displayedNodeRows = byId['node-flow'].sections.find(s => s.id === 'observed').table.rows;
  assert.deepEqual(displayedNodeRows.map(row => row.slice(0, 2)), evidence.nodeEvidence.map(observation => [JSON.stringify(observation.values), observation.findings[0].Status]));
  const displayedInventory = JSON.parse(byId['image-scan'].sections.find(s => s.id === 'inventory').code.text);
  assert.deepEqual(displayedInventory, evidence.inventory[0].packages[0]);
});

test('operator observations occur before destructive lab cleanup', () => {
  const sections = byId['operator-lab'].sections.map(s => s.id);
  for (const id of ['owner-evidence','rescan-experiment','record']) assert.ok(sections.indexOf(id) < sections.indexOf('cleanup'));
  const command = byId['operator-lab'].sections.find(s => s.id === 'rescan-experiment').code.text;
  assert.match(command, /metadata.uid/);
  assert.match(command, /metadata.creationTimestamp/);
});

test('production build serves the subpath and keeps a self-contained, parseable edition', async () => {
  execFileSync(process.execPath, ['scripts/build.mjs'], { cwd: root, stdio: 'pipe' });
  const standalone = await readFile(new URL('dist/learn-trivy.html', root), 'utf8');
  assert.ok(!/<script[^>]+src=/.test(standalone));
  assert.ok(!/<link[^>]+rel="stylesheet"/.test(standalone));
  const script = standalone.match(/<script>([\s\S]*)<\/script>/)?.[1];
  assert.ok(script);
  new Script(script);
  assert.match(script, /data:text\/yaml;charset=utf-8,/);
  assert.ok(!/^import /m.test(script));
  assert.ok(!/^export /m.test(script));
  await access(new URL('dist/trivy/app.mjs', root));
  await access(new URL('dist/trivy/styles.css', root));
  await assert.rejects(access(new URL('dist/app.mjs', root)));

  const handler = createHandler({ preview: true });
  const request = async (url, method = 'GET') => {
    const result = {};
    await handler({ url, method }, {
      writeHead(status, headers = {}) { Object.assign(result, { status, headers }); return this; },
      end(body) { result.body = body?.toString(); return this; },
    });
    return result;
  };
  for (const path of ['/', '/trivy']) {
    const result = await request(`${path}?from=preview`);
    assert.equal(result.status, 308);
    assert.equal(result.headers.Location, '/trivy/?from=preview');
  }
  const page = await request('/trivy/');
  assert.equal(page.status, 200);
  assert.match(page.headers['Content-Type'], /text\/html/);
  assert.match(page.body, /id="app"/);

  const pageURL = new URL('https://learn.nabarun.dev/trivy/#/architecture');
  const pending = [];
  for (const [, value] of page.body.matchAll(/(?:src|href)="([^"#]+)"/g)) {
    const url = new URL(value, pageURL);
    assert.equal(url.origin, pageURL.origin);
    assert.ok(url.pathname.startsWith('/trivy/'), value);
    pending.push(url);
  }
  const visited = new Set();
  while (pending.length) {
    const url = pending.pop();
    if (visited.has(url.href)) continue;
    visited.add(url.href);
    const asset = await request(url.pathname);
    assert.equal(asset.status, 200, url.href);
    if (url.pathname.endsWith('.mjs')) {
      assert.match(asset.headers['Content-Type'], /text\/javascript/);
      for (const [, path] of asset.body.matchAll(/^import .* from '([^']+)'/gm)) pending.push(new URL(path, url));
    }
  }
  for (const lesson of lessons) for (const section of lesson.sections) {
    for (const path of [section.download, ...(section.downloads || []).map(download => download.path)].filter(Boolean)) {
      const result = await request(new URL('./' + path, pageURL).pathname);
      assert.equal(result.status, 200, path);
      assert.equal(result.body, await readFile(new URL(`site/${path}`, root), 'utf8'));
    }
  }
  for (const path of ['/trivy/missing.mjs', '/trivy/architecture', '/styles.css', '/trivially/']) {
    const result = await request(path);
    assert.equal(result.status, 404, path);
    assert.doesNotMatch(result.body, /id="app"/);
  }
  assert.equal((await request('/learn-trivy.html')).body, standalone);
  assert.equal((await request('/trivy/styles.css', 'HEAD')).body, undefined);
  assert.equal((await request('/trivy/', 'POST')).status, 405);
  const config = JSON.parse(await readFile(new URL('vercel.json', root), 'utf8'));
  assert.equal(config.outputDirectory, 'dist');
  assert.equal(config.trailingSlash, true);
  assert.deepEqual(config.redirects, [{ source: '/', destination: '/trivy/', permanent: true }]);
});
