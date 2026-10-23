// メニュー（03 の 7 章、08 の 2.4 の A-1、A-2、A-5）
import { expect, test, type Page } from '@playwright/test'

const state = (page: Page) =>
  page.evaluate(() => ({
    open: document.querySelector('.menu')!.classList.contains('is-open'),
    expanded: document
      .querySelector('.menu__btn')!
      .getAttribute('aria-expanded'),
    inert: document.querySelector<HTMLElement>('.menu__inner')!.inert,
  }))

test.beforeEach(async ({ page }) => {
  await page.goto('/')
})

test('ボタンで開閉し、aria-expanded と inert が切り替わる（A-2）', async ({
  page,
}) => {
  expect(await state(page)).toEqual({
    open: false,
    expanded: 'false',
    inert: true,
  })
  await page.click('.menu__btn')
  expect(await state(page)).toEqual({
    open: true,
    expanded: 'true',
    inert: false,
  })
  await page.click('.menu__btn')
  expect(await state(page)).toEqual({
    open: false,
    expanded: 'false',
    inert: true,
  })
})

test('閉じているとき、Tab でメニューの中に止まらない（A-1）', async ({
  page,
}) => {
  const visited: string[] = []
  // 先頭に戻るまで Tab を押し続ける
  for (let i = 0; i < 500; i++) {
    await page.keyboard.press('Tab')
    const where = await page.evaluate(() => {
      const el = document.activeElement
      if (!el || el === document.body) return 'body'
      return el.closest('.menu__inner') ? 'menu' : el.outerHTML.slice(0, 80)
    })
    if (where === visited[0]) break
    visited.push(where)
  }
  expect(visited).toContain(
    await page.evaluate(() =>
      document.querySelector('.menu__btn')!.outerHTML.slice(0, 80),
    ),
  )
  expect(visited).not.toContain('menu')
})

test('Tab で来たボタンにフォーカスの枠が出る（A-5）', async ({ page }) => {
  for (let i = 0; i < 50; i++) {
    await page.keyboard.press('Tab')
    if (
      await page
        .locator('.menu__btn')
        .evaluate((el) => el === document.activeElement)
    )
      break
  }
  const outline = await page.locator('.menu__btn').evaluate((el) => {
    const style = getComputedStyle(el)
    return {
      focused: el === document.activeElement,
      style: style.outlineStyle,
      width: parseFloat(style.outlineWidth),
    }
  })
  expect(outline.focused).toBe(true)
  expect(outline.style).not.toBe('none')
  expect(outline.width).toBeGreaterThan(0)
})

// Playwright の Chromium は bfcache を使わない（BackForwardCacheDisabledForDelegate）ので、
// 復元のときに届く pageshow（persisted）を直接起こす
test('bfcache から戻ったときは閉じている', async ({ page }) => {
  await page.click('.menu__btn')
  await page.evaluate(() =>
    dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true })),
  )
  expect(await state(page)).toEqual({
    open: false,
    expanded: 'false',
    inert: true,
  })
})
