import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const project = fileURLToPath(new URL('../', import.meta.url));
const types = { '.html': 'text/html', '.css': 'text/css', '.mjs': 'text/javascript', '.svg': 'image/svg+xml', '.json': 'application/json', '.yaml': 'text/plain' };

export function createHandler({ preview = false } = {}) {
  const root = resolve(project, preview ? 'dist' : 'site');
  return async (request, response) => {
    try {
      if (!['GET', 'HEAD'].includes(request.method)) {
        response.writeHead(405, { Allow: 'GET, HEAD' }).end(); return;
      }
      const url = new URL(request.url, 'http://localhost');
      const pathname = decodeURIComponent(url.pathname);
      if (['/', '/index.html', '/trivy'].includes(pathname)) {
        response.writeHead(308, { Location: `/trivy/${url.search}` }).end(); return;
      }
      if (!preview && !pathname.startsWith('/trivy/')) {
        response.writeHead(404, { 'Content-Type': 'text/plain' }).end(request.method === 'HEAD' ? undefined : 'Page not found.'); return;
      }
      let relative = preview ? pathname : pathname.slice('/trivy'.length);
      if (relative.endsWith('/')) relative += 'index.html';
      const file = resolve(root, '.' + relative);
      if (!file.startsWith(root + sep)) { response.writeHead(403).end(); return; }
      const body = await readFile(file);
      response.writeHead(200, { 'Content-Type': `${types[extname(file)] || 'application/octet-stream'}; charset=utf-8`, 'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff' });
      response.end(request.method === 'HEAD' ? undefined : body);
    } catch {
      response.writeHead(404, { 'Content-Type': 'text/plain' }).end(request.method === 'HEAD' ? undefined : 'Page not found.');
    }
  };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const portFlag = process.argv.indexOf('--port');
  const port = Number(portFlag > -1 ? process.argv[portFlag + 1] : process.env.PORT || 5173);
  const server = createServer(createHandler({ preview: process.argv.includes('--preview') }));
  server.on('error', error => {
    console.error(`Cannot start the local server: ${error.message}`);
    console.error('You can open dist/learn-trivy.html directly after npm run build.');
    process.exitCode = 1;
  });
  server.listen(port, '127.0.0.1', () => console.log(`Learn Trivy: http://localhost:${server.address().port}/trivy/`));
}
