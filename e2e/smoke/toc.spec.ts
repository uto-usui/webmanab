// 目次（03 の 7.2、08 の 1.6、2.4 の A-3、A-10）
import { type Page } from '@playwright/test'
import { expect, test } from './fixtures'

const PATH = '/tip/method-control/'

const isOpen = (page: Page) =>
  page.evaluate(() => ({
    open: document.querySelector('.entry-toc')!.classList.contains('is-open'),
    inert: document.querySelector<HTMLElement>('.entry-toc__list')!.inert,
  }))

// Tab を押して、目次の項目に止まった回数を数える（先頭に戻るまで）
async function tabStopsInToc(page: Page) {
  let first: string | undefined
  let stops = 0
  for (let i = 0; i < 1000; i++) {
    await page.keyboard.press('Tab')
    const where = await page.evaluate(() => {
      const el = document.activeElement
      if (!el || el === document.body) return { id: 'body', inToc: false }
      return {
        id: el.outerHTML.slice(0, 120),
        inToc: !!el.closest('.entry-toc__list'),
      }
    })
    if (where.id === first) break
    first ??= where.id
    if (where.inToc) stops++
  }
  return stops
}

test.beforeEach(async ({ page }) => {
  await page.goto(PATH)
})

test('見出しの押下で開閉し、閉じている一覧は inert', async ({ page }) => {
  expect(await isOpen(page)).toEqual({ open: false, inert: true })
  await page.click('.entry-toc__title')
  expect(await isOpen(page)).toEqual({ open: true, inert: false })
  await page.click('.entry-toc__title')
  expect(await isOpen(page)).toEqual({ open: false, inert: true })
})

test('閉じているとき Tab で項目に止まらず、開くと届く（A-3）', async ({
  page,
}) => {
  expect(await tabStopsInToc(page)).toBe(0)
  await page.click('.entry-toc__title')
  await page.evaluate(() => (document.activeElement as HTMLElement).blur())
  expect(await tabStopsInToc(page)).toBeGreaterThan(0)
})

test('項目を押すと、1 秒前後で見出しの上端が画面の上から 65px に来る', async ({
  page,
}) => {
  await page.click('.entry-toc__title')
  // 開くあいだは一覧が伸びて見出しの位置が動くので、開き終わってから押す
  await page.waitForFunction(() =>
    document.getAnimations().every((a) => a.playState !== 'running'),
  )
  const target = page.locator('.entry-toc__target').first()
  const id = (await target.getAttribute('href'))!.slice(1)
  await target.click()
  await expect
    .poll(
      () =>
        page.evaluate(
          (id) =>
            Math.round(
              document.getElementById(id)!.getBoundingClientRect().top,
            ),
          id,
        ),
      { timeout: 3000 },
    )
    .toBe(65)
})

test('見出しのない tip でも目次の枠が出る', async ({ page }) => {
  await page.goto('/tip/30-seconds-of-code/')
  await expect(page.locator('.entry-toc__item')).toHaveCount(0)
  await expect(page.locator('.entry-toc')).toBeVisible()
})

test.describe('JS なし', () => {
  test.use({ javaScriptEnabled: false })

  // 項目の href は実際の見出しの id（A-10）なので、JS がなくてもその位置へ行ける
  test('#a0 で見出しに飛べる', async ({ page }) => {
    await page.goto(`${PATH}#a0`)
    const top = await page
      .locator('#a0')
      .evaluate((el) => el.getBoundingClientRect().top)
    expect(Math.abs(top)).toBeLessThan(1)
  })
})
