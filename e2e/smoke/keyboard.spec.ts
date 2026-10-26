// キーボードだけの操作（08 の 2.2 の手作業の確認のうち、自動で見られるもの）
import { type Page } from '@playwright/test'
import { expect, test } from './fixtures'

const PAGES = [
  '/',
  '/clip/',
  '/tips/29/',
  '/tip/method-control/',
  '/clip/2016-jsconf-is/',
  '/lab/createjs-node-motion/',
]

// 先頭に戻るまで Tab を押し、止まった要素ごとにフォーカスの枠と画面の中かを集める。
// 本文の iframe（jsfiddle）は外のサイトの中身なので数えない
async function walk(page: Page) {
  const problems: string[] = []
  const seen = new Set<string>()
  for (let i = 0; i < 500; i++) {
    await page.keyboard.press('Tab')
    const stop = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null
      if (!el || el === document.body || el.tagName === 'IFRAME') return null
      const style = getComputedStyle(el)
      const rect = el.getBoundingClientRect()
      return {
        key: el.outerHTML.slice(0, 120),
        name: `${el.tagName.toLowerCase()}.${el.className}`,
        ring:
          (style.outlineStyle !== 'none' &&
            parseFloat(style.outlineWidth) > 0) ||
          style.boxShadow !== 'none',
        inView:
          rect.width > 0 &&
          rect.height > 0 &&
          rect.bottom > 0 &&
          rect.right > 0 &&
          rect.top < innerHeight &&
          rect.left < innerWidth,
      }
    })
    if (!stop) continue
    if (seen.has(stop.key)) break
    seen.add(stop.key)
    if (!stop.ring) problems.push(`枠がない: ${stop.name}`)
    if (!stop.inView) problems.push(`画面の外: ${stop.name}`)
  }
  return { stops: seen.size, problems }
}

for (const width of [1080, 375]) {
  test.describe(`${width}px`, () => {
    test.use({ viewport: { width, height: 800 } })

    for (const path of PAGES) {
      test(`${path} を Tab だけで一周でき、止まった所に枠が出て画面の中にある`, async ({
        page,
      }) => {
        await page.goto(path)
        const { stops, problems } = await walk(page)
        expect(stops).toBeGreaterThan(0)
        expect(problems).toEqual([])
      })
    }
  })
}

test('メニューのボタンは Enter でも Space でも開閉できる', async ({ page }) => {
  await page.goto('/')
  const button = page.locator('.menu__btn')
  await button.focus()
  await page.keyboard.press('Enter')
  await expect(button).toHaveAttribute('aria-expanded', 'true')
  // 開くとフォーカスはメニューの中に移る（A11Y-13）ので、ボタンに戻してから押す
  await button.focus()
  await page.keyboard.press('Space')
  await expect(button).toHaveAttribute('aria-expanded', 'false')
})

test('目次の見出しは Enter でも Space でも開閉でき、状態を aria-expanded で伝える（A11Y-14）', async ({
  page,
}) => {
  await page.goto('/tip/method-control/')
  const title = page.locator('.entry-toc__title')
  await expect(title).toHaveAttribute('aria-expanded', 'false')
  await title.focus()
  await page.keyboard.press('Enter')
  await expect(page.locator('.entry-toc')).toHaveClass(/is-open/)
  await expect(title).toHaveAttribute('aria-expanded', 'true')
  await page.keyboard.press('Space')
  await expect(page.locator('.entry-toc')).not.toHaveClass(/is-open/)
  await expect(title).toHaveAttribute('aria-expanded', 'false')
})

// 1280px を 400% に拡大したときと同じ幅（WCAG 1.4.10）
test.describe('320px', () => {
  test.use({ viewport: { width: 320, height: 640 } })

  for (const path of PAGES) {
    test(`${path} に横スクロールが出ない`, async ({ page }) => {
      await page.goto(path)
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - innerWidth,
      )
      expect(overflow).toBeLessThanOrEqual(0)
    })
  }
})
