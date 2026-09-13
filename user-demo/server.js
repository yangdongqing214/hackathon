import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
import { listCharities, upsertCharity, saveAllocation, getAllocation } from './database.js';

const root = resolve(import.meta.dirname);
const port = Number(process.env.PORT) || 4173;
const publicFiles = new Set(['/index.html', '/styles.css', '/app.js', '/data.js', '/allocation.js', '/payment-demo.js', '/config.js', '/charity-data.html', '/charity-data.js']);
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8' };

function json(response, status, value) {
  response.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }).end(JSON.stringify(value));
}

async function readJson(request) {
  if (!(request.headers['content-type'] || '').startsWith('application/json')) throw new Error('Send JSON content');
  let body = '';
  for await (const chunk of request) {
    body += chunk;
    if (body.length > 1024 * 1024) throw new Error('Request is too large');
  }
  try { return JSON.parse(body); } catch { throw new Error('Invalid JSON'); }
}

createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://127.0.0.1').pathname);
    if (pathname === '/api/charities' && request.method === 'GET') return json(response, 200, { charities: listCharities() });
    if (pathname === '/api/admin/charities' && request.method === 'GET') return json(response, 200, { charities: listCharities(true) });
    const charityMatch = /^\/api\/admin\/charities\/([a-zA-Z0-9_-]{2,80})$/.exec(pathname);
    if (charityMatch && request.method === 'PUT') return json(response, 200, { charity: upsertCharity(charityMatch[1], await readJson(request)) });
    const allocationMatch = /^\/api\/allocations\/([a-zA-Z0-9_-]{8,80})$/.exec(pathname);
    if (allocationMatch && request.method === 'GET') {
      const allocation = getAllocation(allocationMatch[1]);
      return allocation ? json(response, 200, { allocation }) : json(response, 404, { error: 'No saved allocation yet' });
    }
    if (pathname === '/api/allocations' && request.method === 'POST') return json(response, 200, { allocation: saveAllocation(await readJson(request)) });
    if (pathname.startsWith('/api/')) return json(response, 404, { error: 'API route not found' });
    const filePath = pathname === '/' ? '/index.html' : pathname;
    if (request.method !== 'GET' || !publicFiles.has(filePath)) return response.writeHead(404).end('Not found');
    const content = await readFile(resolve(root, '.' + filePath));
    response.writeHead(200, { 'content-type': types[extname(filePath)], 'cache-control': 'no-store' }).end(content);
  } catch (error) {
    json(response, error?.code === 'ENOENT' ? 404 : 400, { error: error?.message || 'Request failed' });
  }
}).listen(port, '127.0.0.1', () => console.log(`Demo: http://127.0.0.1:${port}`));
