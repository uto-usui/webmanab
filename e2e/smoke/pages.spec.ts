import { expect, test } from '@playwright/test'

// ページの種類はできた手順ごとに足す（08 の 1.6）
const paths = ['/']

for (const path of paths) {
  test(`${path} が 200 で、コンソールにエラーがない`, async ({ page }) => {
    const errors: string[] = []
    page.on('console', (msg) => {
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
