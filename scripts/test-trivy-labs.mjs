import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtemp, rm, writeFile, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash } from 'node:crypto';

const executable = process.env.TRIVY_BIN || 'trivy';
const temporary = await mkdtemp(join(tmpdir(), 'learn-trivy-labs-'));
const base = ['config', '--skip-check-update', '--skip-version-check', '--disable-telemetry', '--config', '', '--ignorefile', '', '--cache-dir', temporary, '--format', 'json'];
const versionRun = spawnSync(executable, ['--version'], { encoding: 'utf8' });
if (versionRun.error || versionRun.status !== 0) throw new Error('Install Trivy before running the optional lab tests.');
const version = versionRun.stdout.match(/^Version:\s*(\S+)/m)?.[1];
const observations = { recordedAt: new Date().toISOString(), trivyVersion: version, scope: 'Local configuration scans only. No images were pulled, no vulnerability DB was used, and no cluster was accessed.', ruleSha256: '', observations: [] };
const policy = await readFile('site/labs/team.rego');
observations.ruleSha256 = createHash('sha256').update(policy).digest('hex');
function scan(args) {
  const result = spawnSync(executable, [...base, ...args], { encoding: 'utf8', timeout: 60000, maxBuffer: 10 * 1024 * 1024 });
  if (result.error) throw result.error;
  return result;
}
try {
  for (const [name, expected] of [['missing', 1], ['passing', 0], ['blank', 1], ['unrelated', 0]]) {
    const fixture = `site/labs/team/${name}.yaml`;
    const result = scan(['--config-check', 'site/labs/team.rego', '--check-namespaces', 'user', fixture]);
    assert.equal(result.status, 0, result.stderr);
    const report = JSON.parse(result.stdout);
    const findings = (report.Results || []).flatMap(r => r.Misconfigurations || []);
    const matching = findings.filter(f => f.ID === 'ID001');
    assert.equal(matching.length, expected, `${fixture}: custom rule result`);
    if (expected) {
      assert.equal(matching[0].Severity, 'MEDIUM');
      assert.match(matching[0].Message, /nonempty metadata.labels.team/);
    }
    observations.observations.push({ fixture, fixtureSha256: createHash('sha256').update(await readFile(fixture)).digest('hex'), exitStatus: result.status, customFindingCount: matching.length, totalFindingCount: findings.length, findings: matching.map(f => ({ ID: f.ID, Severity: f.Severity, Message: f.Message, Status: f.Status })) });
  }
  const gate = scan(['--exit-code', '7', '--config-check', 'site/labs/team.rego', '--check-namespaces', 'user', 'site/labs/team/missing.yaml']);
  assert.equal(gate.status, 7, gate.stderr);
  observations.observations.push({ fixture: 'site/labs/team/missing.yaml', behavior: 'Findings gate with --exit-code 7', exitStatus: gate.status });
  const invalidPolicy = join(temporary, 'invalid.rego');
  await writeFile(invalidPolicy, 'package user.broken\ndeny[res] { this is not valid Rego !!! }');
  const invalid = scan(['--config-check', invalidPolicy, '--check-namespaces', 'user', 'site/labs/team/missing.yaml']);
  assert.notEqual(invalid.status, 0);
  assert.notEqual(invalid.status, 7);
  assert.match(invalid.stderr, /rego_parse_error|parse|compil/i);
  observations.observations.push({ behavior: 'Invalid rule compilation with default gate settings', exitStatus: invalid.status, stderrClassification: 'Rule compilation failure; exact temporary path omitted' });
  const privileged = scan(['site/labs/privileged-pod.yaml']);
  assert.equal(privileged.status, 0, privileged.stderr);
  const before = JSON.parse(privileged.stdout).Results.flatMap(r => r.Misconfigurations || []);
  const privilegedFinding = before.find(f => f.ID === 'KSV-0017');
  assert.ok(privilegedFinding, 'Expected embedded privileged-container rule KSV-0017');
  const changedPath = join(temporary, 'unprivileged-pod.yaml');
  await writeFile(changedPath, (await readFile('site/labs/privileged-pod.yaml', 'utf8')).replace('privileged: true', 'privileged: false'));
  const afterRun = scan([changedPath]);
  assert.equal(afterRun.status, 0, afterRun.stderr);
  const after = JSON.parse(afterRun.stdout).Results.flatMap(r => r.Misconfigurations || []);
  assert.ok(!after.some(f => f.ID === 'KSV-0017'));
  observations.observations.push({ fixture: 'site/labs/privileged-pod.yaml', behavior: 'Change privileged from true to false in a temporary copy', removedFinding: 'KSV-0017', beforeCount: before.length, afterCount: after.length });
  if (process.argv.includes('--record')) await writeFile('site/labs/verification.json', JSON.stringify(observations, null, 2) + '\n');
  console.log(JSON.stringify(observations, null, 2));
} finally {
  await rm(temporary, { recursive: true, force: true });
}
