// ヘッダー固定（02、03 の 7 章）。1080px 以上で 46px スクロールすると is-fixed が付く
import { type Page } from '@playwright/test'
import { expect, test } from './fixtures'

const fixed = (page: Page) =>
  page.evaluate(() =>
    ['.header', '.header__inner'].map((s) =>
      document.querySelector(s)!.classList.contains('is-fixed'),
    ),
  )

// 判定は requestAnimationFrame の中なので、2 フレーム待ってから見る
const scrollPage = (page: Page, y: number) =>
  page.evaluate(
    (y) =>
      new Promise((resolve) => {
        window.scrollTo(0, y)
        requestAnimationFrame(() => requestAnimationFrame(resolve))
      }),
    y,
  )

test.beforeEach(async ({ page }) => {
  await page.goto('/tip/method-control/')
})

test('1080px では 46px で付き、45px で外れる', async ({ page }) => {
  expect(await fixed(page)).toEqual([false, false])
  await scrollPage(page, 46)
  expect(await fixed(page)).toEqual([true, true])
  await scrollPage(page, 45)
  expect(await fixed(page)).toEqual([false, false])
})

for (const width of [768, 1079]) {
  test(`${width}px では付かない`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 })
    await scrollPage(page, 200)
    expect(await fixed(page)).toEqual([false, false])
  })
}
