import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const MIME_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8'
};

async function isFile(path) {
  try {
    return (await stat(path)).isFile();
  } catch {
    return false;
  }
}

function safeRequestPath(root, pathname) {
  const decoded = decodeURIComponent(pathname);
  const relativePath = decoded.replace(/^\/+/, '');
  const candidate = resolve(root, relativePath);
  if (candidate !== root && !candidate.startsWith(`${root}${sep}`)) return null;
  return candidate;
}

async function listen(server, host, initialPort) {
  let port = initialPort;
  while (true) {
    try {
      await new Promise((resolveListen, rejectListen) => {
        const onError = (error) => rejectListen(error);
        server.once('error', onError);
        server.listen(port, host, () => {
          server.off('error', onError);
          resolveListen();
        });
      });
      return server.address().port;
    } catch (error) {
      if (error.code !== 'EADDRINUSE' || port === 0) throw error;
      port += 1;
    }
  }
}

export async function startStaticServer({ rootDir = resolve('dist'), host = '127.0.0.1', port = 4173, log = true } = {}) {
  const root = resolve(rootDir);
  const notFoundPath = join(root, '404.html');
  const server = createServer(async (request, response) => {
    try {
      if (!['GET', 'HEAD'].includes(request.method)) {
        response.writeHead(405, { Allow: 'GET, HEAD' });
        response.end();
        return;
      }

      const url = new URL(request.url, `http://${host}`);
      let path = safeRequestPath(root, url.pathname);
      if (path && (url.pathname.endsWith('/') || !extname(path))) path = join(path, 'index.html');

      let statusCode = 200;
      if (!path || !(await isFile(path))) {
        statusCode = 404;
        path = notFoundPath;
      }
      if (!(await isFile(path))) {
        response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        response.end('Not found');
        return;
      }

      const body = await readFile(path);
      response.writeHead(statusCode, {
        'Content-Type': MIME_TYPES[extname(path).toLowerCase()] || 'application/octet-stream',
        'Content-Length': body.length,
        'Cache-Control': 'no-store'
      });
      response.end(request.method === 'HEAD' ? undefined : body);
    } catch (error) {
      response.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end(`Preview server error: ${error.message}`);
    }
  });

  const selectedPort = await listen(server, host, port);
  const url = `http://${host}:${selectedPort}/`;
  if (log) console.log(`Preview available at ${url}`);
  return { server, url, port: selectedPort, rootDir: root };
}

const invokedPath = process.argv[1] ? resolve(process.argv[1]) : '';
if (invokedPath === fileURLToPath(import.meta.url)) {
  await startStaticServer({ rootDir: process.argv[2] ? resolve(process.argv[2]) : resolve('dist') });
}
