// dist-catalog を配るだけの静的サーバー。astro preview はこの環境では起動するとすぐ裏に回って
// コマンドが終わり、Playwright の webServer に使えなかった（07 の 4.1）
import { readFile, stat } from 'node:fs/promises'
import { createServer } from 'node:http'
import { extname, join, normalize } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../../dist-catalog/', import.meta.url))
const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
}

createServer(async (req, res) => {
  // normalize で .. を畳んでから root の下に付けるので、root の外は読めない
  const pathname = decodeURIComponent(new URL(req.url, 'http://x').pathname)
  let path = join(root, normalize(pathname))
  if ((await stat(path).catch(() => null))?.isDirectory())
    path = join(path, 'index.html')
  try {
    const body = await readFile(path)
    res.writeHead(200, {
      'content-type': types[extname(path)] ?? 'application/octet-stream',
    })
    res.end(body)
  } catch {
    res.writeHead(404).end('not found')
  }
}).listen(Number(process.env.CATALOG_PORT ?? 4401))
