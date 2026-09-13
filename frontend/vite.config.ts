import { copyFileSync, existsSync, mkdirSync, readFileSync, statSync } from 'node:fs'
import type { IncomingMessage, ServerResponse } from 'node:http'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig, type ViteDevServer } from 'vite'

const frontendDir = path.dirname(fileURLToPath(import.meta.url))
const userSideDir = path.resolve(frontendDir, '../user-side')
const userSideFiles = new Set([
  'index.html',
  'styles.css',
  'app.js',
  'data.js',
  'allocation.js',
  'payment-demo.js',
  'config.js',
  'charity-data.html',
  'charity-data.js',
])
const mime: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
}

function sendUserSide(req: IncomingMessage, res: ServerResponse, next: () => void): void {
  const url = req.url?.split('?')[0] ?? ''
  if (!url.startsWith('/user-side')) {
    next()
    return
  }
  const relative = url === '/user-side' || url === '/user-side/' ? 'index.html' : decodeURIComponent(url.slice('/user-side/'.length))
  if (!userSideFiles.has(relative)) {
    res.statusCode = 404
    res.end('Not found')
    return
  }
  const file = path.resolve(userSideDir, relative)
  if (!file.startsWith(userSideDir) || !existsSync(file) || statSync(file).isDirectory()) {
    res.statusCode = 404
    res.end('Not found')
    return
  }
  res.setHeader('Content-Type', mime[path.extname(file)] ?? 'application/octet-stream')
  res.setHeader('Cache-Control', 'no-store')
  res.end(readFileSync(file))
}

function serveUserSide() {
  return {
    name: 'serve-user-side',
    configureServer(server: ViteDevServer) {
      server.middlewares.use(sendUserSide)
    },
    configurePreviewServer(server: ViteDevServer) {
      server.middlewares.use(sendUserSide)
    },
    closeBundle() {
      const dest = path.resolve(frontendDir, 'dist/user-side')
      mkdirSync(dest, { recursive: true })
      for (const file of userSideFiles) {
        copyFileSync(path.resolve(userSideDir, file), path.join(dest, file))
      }
    },
  }
}

export default defineConfig({
  plugins: [react(), serveUserSide()],
  server: {
    port: 5175,
    strictPort: true,
    proxy: {
      '/api': { target: 'http://localhost:4000', changeOrigin: true },
      '/uploads': { target: 'http://localhost:4000', changeOrigin: true },
    },
  },
})
