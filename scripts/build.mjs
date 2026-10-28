import { cp, mkdir, rm, readFile, writeFile, readdir } from 'node:fs/promises';
const root = new URL('../', import.meta.url);
await rm(new URL('dist/', root), { recursive: true, force: true });
await mkdir(new URL('dist/', root));
await cp(new URL('site/', root), new URL('dist/trivy/', root), { recursive: true });
await cp(new URL('hosting/index.html', root), new URL('dist/index.html', root));
const [html, css, content, app, favicon, deep, architecture] = await Promise.all([
  'site/index.html', 'site/styles.css', 'site/content.mjs', 'site/app.mjs', 'site/favicon.svg', 'site/deep-dives.mjs', 'site/architecture.mjs',
].map(path => readFile(new URL(path, root), 'utf8')));
const assets = {};
async function bundleDownloads(directory = 'labs/') {
  for (const entry of await readdir(new URL(`site/${directory}`, root), { withFileTypes: true })) {
    const path = directory + entry.name;
    if (entry.isDirectory()) await bundleDownloads(path + '/');
    else {
      const text = await readFile(new URL(`site/${path}`, root), 'utf8');
      const type = path.endsWith('.yaml') ? 'text/yaml' : path.endsWith('.json') ? 'application/json' : 'text/plain';
      assets[path] = `data:${type};charset=utf-8,${encodeURIComponent(text)}`;
    }
  }
}
await bundleDownloads();
const script = `globalThis.__TRIVY_DOWNLOADS__ = ${JSON.stringify(assets)};\n` +
  [deep, architecture, content, app].map(source => source.replace(/^export /gm, '').replace(/^import .*;\n/gm, '')).join('\n');
const standalone = html
  .replace('<link rel="stylesheet" href="./styles.css" />', () => `<style>${css}</style>`)
  .replace('<link rel="icon" type="image/svg+xml" href="./favicon.svg" />', () => `<link rel="icon" type="image/svg+xml" href="data:image/svg+xml,${encodeURIComponent(favicon)}" />`)
  .replace('    <script type="module" src="./app.mjs"></script>\n', '')
  .replace('</body>', () => `<script>${script.replace(/<\/script/gi, '<\\/script')}</script>\n</body>`);
await writeFile(new URL('dist/learn-trivy.html', root), standalone);
console.log('Built dist/trivy/ for /trivy/ and dist/learn-trivy.html for direct opening. Publish dist/ as the site root.');
