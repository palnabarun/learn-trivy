import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtemp, rm, writeFile, readFile, cp, rename } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash } from 'node:crypto';

const executable = process.env.TRIVY_BIN || 'trivy';
const temporary = await mkdtemp(join(tmpdir(), 'learn-trivy-evidence-'));
const common = ['--skip-check-update', '--skip-version-check', '--disable-telemetry', '--config', '', '--ignorefile', '', '--cache-dir', join(temporary, 'cache')];
const versionRun = spawnSync(executable, ['--version'], { encoding: 'utf8' });
if (versionRun.error || versionRun.status !== 0) throw new Error('Install Trivy before running the optional lab tests.');
const record = {
  recordedAt: new Date().toISOString(),
  trivyVersion: versionRun.stdout.match(/^Version:\s*(\S+)/m)?.[1],
  scope: 'Synthetic local evidence. Inventory generation and NodeInfo policy evaluation only. No vulnerability matching, image pull, host collection, or cluster access.',
  fixtures: {}, inventory: [], nodeEvidence: [],
};
const fixtures = [
  'site/labs/inventory/rootfs/etc/os-release',
  'site/labs/inventory/rootfs/etc/alpine-release',
  'site/labs/inventory/rootfs/lib/apk/db/installed',
  ...['restricted', 'readable', 'absent'].map(name => `site/labs/node/${name}.json`),
];
function scan(target, args) {
  const result = spawnSync(executable, [target, ...common, ...args], { encoding: 'utf8', timeout: 60000, maxBuffer: 10 * 1024 * 1024 });
  if (result.error) throw result.error;
  assert.equal(result.status, 0, result.stderr);
  return JSON.parse(result.stdout);
}
try {
  for (const file of fixtures) record.fixtures[file] = createHash('sha256').update(await readFile(file)).digest('hex');
  const rootfs = join(temporary, 'rootfs');
  await cp('site/labs/inventory/rootfs', rootfs, { recursive: true });
  const packageFile = join(rootfs, 'lib/apk/db/installed');
  const original = await readFile(packageFile, 'utf8');
  function inventory(name) {
    const report = scan('rootfs', ['--offline-scan', '--skip-db-update', '--skip-java-db-update', '--format', 'cyclonedx', rootfs]);
    assert.equal(report.vulnerabilities?.length || 0, 0);
    const packages = (report.components || []).filter(c => c.type === 'library').map(c => ({
      name: c.name, version: c.version, purl: c.purl,
      sourceName: c.properties?.find(p => p.name === 'aquasecurity:trivy:SrcName')?.value,
      sourceVersion: c.properties?.find(p => p.name === 'aquasecurity:trivy:SrcVersion')?.value,
    }));
    record.inventory.push({ case: name, packages });
    return packages;
  }
  const initial = inventory('Original package metadata; no library binary');
  assert.equal(initial.length, 1);
  assert.deepEqual(initial[0], {
    name: 'libcrypto3', version: '3.3.2-r0',
    purl: 'pkg:apk/alpine/libcrypto3@3.3.2-r0?arch=aarch64&distro=3.20.3',
    sourceName: 'openssl', sourceVersion: '3.3.2-r0',
  });
  await writeFile(packageFile, original.replace('V:3.3.2-r0', 'V:3.3.2-r1'));
  const changed = inventory('Change only the package record to 3.3.2-r1');
  assert.equal(changed.length, 1);
  assert.equal(changed[0].version, '3.3.2-r1');
  assert.equal(changed[0].sourceVersion, '3.3.2-r1');
  assert.equal(changed[0].purl, 'pkg:apk/alpine/libcrypto3@3.3.2-r1?arch=aarch64&distro=3.20.3');
  await rename(packageFile, join(temporary, 'saved-installed'));
  assert.equal(inventory('Remove the package database from the rootfs').length, 0);
  for (const [name, failures] of [['restricted', 0], ['readable', 1], ['absent', 0]]) {
    const report = scan('config', ['--include-non-failures', '--format', 'json', `site/labs/node/${name}.json`]);
    const findings = (report.Results || []).flatMap(r => r.Misconfigurations || []).filter(f => f.ID === 'KCV-0073');
    assert.equal(findings.filter(f => f.Status === 'FAIL').length, failures);
    assert.equal(findings.length, 1, 'The selected rule must appear when non-failures are included');
    assert.equal(findings[0].Status, failures ? 'FAIL' : 'PASS');
    record.nodeEvidence.push({
      fixture: `site/labs/node/${name}.json`,
      values: JSON.parse(await readFile(`site/labs/node/${name}.json`, 'utf8')).info.kubeletConfFilePermissions.values,
      findings: findings.map(f => ({ ID: f.ID, Status: f.Status, Severity: f.Severity, Message: f.Message })),
    });
  }
  if (process.argv.includes('--record')) {
    await writeFile('site/labs/evidence-observations.json', JSON.stringify(record, null, 2) + '\n');
  } else {
    const saved = JSON.parse(await readFile('site/labs/evidence-observations.json', 'utf8'));
    assert.equal(record.trivyVersion, saved.trivyVersion, 'Recorded evidence requires the recorded Trivy version. Review changed results before recording another version.');
    for (const key of ['fixtures', 'inventory', 'nodeEvidence']) assert.deepEqual(record[key], saved[key], `Recorded ${key} must match this execution`);
  }
  console.log(JSON.stringify(record, null, 2));
} finally {
  await rm(temporary, { recursive: true, force: true });
}
