import { expect, isExternal, test } from './fixtures'
import { readFileSync } from 'node:fs'

// 日本語 slug は旧サイトの URL（小文字の %e3…）と postPath()（大文字の %E3…）の両方で開ける
const japanese = readFileSync('test/fixtures/legacy-urls.txt', 'utf8')
  .split('\n')
  .filter((url) => url.includes('%'))

// 一覧とターム一覧は手順 8 で足す（08 の 1.6）
const paths = [
  '/',
  '/tip/method-control/',
  '/clip/2016-jsconf-is/',
  '/lab/createjs-node-motion/',
  '/clip/_prefix/',
  ...japanese,
  ...japanese.map((url) =>
    url.replace(/%[0-9a-f]{2}/g, (s) => s.toUpperCase()),
  ),
]

for (const path of paths) {
  test(`${path} が 200 で、コンソールにエラーがない`, async ({
    page,
    baseURL,
  }) => {
    const errors: string[] = []
    page.on('console', (msg) => {
      // 止めた外のサイトの読み込みの失敗は数えない
      const from = msg.location().url
      if (from && isExternal(from, baseURL!)) return
      if (msg.type() === 'error') errors.push(msg.text())
    })
    page.on('pageerror', (err) => errors.push(err.message))
    const res = await page.goto(path)
    expect(res?.status()).toBe(200)
    expect(errors).toEqual([])
  })
}

// 中身は astro preview と Netlify で違うので見ない
test('存在しないパスが 404 を返す', async ({ page }) => {
  const res = await page.goto('/this-page-does-not-exist/')
  expect(res?.status()).toBe(404)
})
