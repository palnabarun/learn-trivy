import test from 'node:test';
import assert from 'node:assert/strict';
import { createHandler } from '../scripts/serve.mjs';

const handler = createHandler();
async function request(url, method = 'GET') {
  const result = {};
  await handler({ url, method }, {
    writeHead(status, headers = {}) { Object.assign(result, { status, headers }); return this; },
    end(body) { result.body = body?.toString(); return this; },
  });
  return result;
}

test('development serves the same subpath, assets, and redirects as the deployment', async () => {
  for (const path of ['/', '/index.html', '/trivy']) {
    const result = await request(`${path}?theme=dark`);
    assert.equal(result.status, 308);
    assert.equal(result.headers.Location, '/trivy/?theme=dark');
  }
  assert.match((await request('/trivy/')).body, /id="app"/);
  assert.match((await request('/trivy/app.mjs')).headers['Content-Type'], /text\/javascript/);
  assert.match((await request('/trivy/styles.css')).headers['Content-Type'], /text\/css/);
  assert.equal((await request('/trivy/styles.css', 'HEAD')).body, undefined);
});

test('missing assets, unsupported methods, and paths outside the site do not return the app', async () => {
  for (const path of ['/trivy/missing.mjs', '/trivially/', '/app.mjs', '/trivy/%ZZ', '/trivy/../package.json']) {
    assert.equal((await request(path)).status, 404, path);
  }
  assert.equal((await request('/trivy/..%2fpackage.json')).status, 403);
  assert.equal((await request('/trivy/missing.mjs', 'HEAD')).body, undefined);
  const post = await request('/trivy/', 'POST');
  assert.equal(post.status, 405);
  assert.equal(post.headers.Allow, 'GET, HEAD');
});
