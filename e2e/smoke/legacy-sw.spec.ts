// 旧 Service Worker の撤去（01 の 3 章）。旧 SW を入れたブラウザで、配信を dist/ に切り替えて開き直すと、
// 新しい /sw.js が自分とキャッシュを消して、新しいページが出る
import { expect, test } from '@playwright/test'
import { readFile } from 'node:fs/promises'
import { createServer } from 'node:http'
import type { AddressInfo } from 'node:net'
import { extname, join } from 'node:path'

const DIST = join(import.meta.dirname, '../../dist')
const LEGACY_SW = join(import.meta.dirname, '../../test/fixtures/legacy-sw.js')
const TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
}

// 同じオリジンのまま、旧サイトから dist/ に配信を切り替えられるサーバー
function startServer() {
  let mode: 'legacy' | 'dist' = 'legacy'
  const server = createServer(async (req, res) => {
    const path = decodeURIComponent(new URL(req.url!, 'http://x').pathname)
    try {
      if (mode === 'legacy') {
        const body =
          path === '/sw.js'
            ? await readFile(LEGACY_SW)
            : '<!doctype html><title>legacy</title><p id="legacy">legacy</p>'
        res.writeHead(200, {
          'content-type': TYPES[path === '/sw.js' ? '.js' : '.html'],
        })
        return res.end(body)
      }
      const file = join(DIST, path.endsWith('/') ? `${path}index.html` : path)
      res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? '' })
      res.end(await readFile(file))
    } catch {
      res.writeHead(404).end()
    }
  })
  return new Promise<{ url: string; toDist: () => void; close: () => void }>(
    (resolve) =>
      server.listen(0, 'localhost', () =>
        resolve({
          url: `http://localhost:${(server.address() as AddressInfo).port}/`,
          toDist: () => (mode = 'dist'),
          close: () => server.close(),
        }),
      ),
  )
}

test('旧 SW が入ったブラウザで、SW とキャッシュが消えて新しいページが出る', async ({
  page,
}) => {
  const server = await startServer()
  try {
    await page.goto(server.url)
    await page.evaluate(async () => {
      await navigator.serviceWorker.register('/sw.js')
      await navigator.serviceWorker.ready
    })
    await page.reload()
    // 前提: 旧 SW が制御していて、ページをキャッシュしている
    expect(
      await page.evaluate(async () => ({
        controlled: !!navigator.serviceWorker.controller,
        caches: (await caches.keys()).length,
      })),
    ).toEqual({ controlled: true, caches: 1 })

    server.toDist()
    await page.reload()
    // waitForFunction は async の関数の Promise を真とみなして待たないので、evaluate を繰り返す
    await expect
      .poll(() =>
        page.evaluate(async () => ({
          registrations: (await navigator.serviceWorker.getRegistrations())
            .length,
          caches: (await caches.keys()).length,
          newPage: !!document.querySelector('.header'),
        })),
      )
      .toEqual({ registrations: 0, caches: 0, newPage: true })
  } finally {
    server.close()
  }
})
