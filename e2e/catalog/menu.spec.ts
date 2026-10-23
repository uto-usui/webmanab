// 08 の 2.4 の A-1・A-2・A-5 をメニューの story で確かめる。失敗したらマージを止める（07 の 10.4）
import { expect, test, type Page } from '@playwright/test'
import { findStory, openStory, tabTo } from './story'

const insideMenu = (page: Page) =>
  page.evaluate(() => !!document.activeElement?.closest('.menu__inner'))

test.describe('menu', () => {
  test('A-1: 閉じている間は .menu__inner の中に Tab が止まらない', async ({
    page,
  }) => {
    await openStory(page, findStory('menu/closed'))
    await expect(page.locator('.menu__inner')).toHaveJSProperty('inert', true)
    const links = await page.locator('.menu__inner a[href]').count()
    expect(links).toBeGreaterThan(0)

    let stops = 0
    for (let i = 0; i < links + 2; i++) {
      await page.keyboard.press('Tab')
      if (await insideMenu(page)) stops++
    }
    expect(stops).toBe(0)
  })

  test('A-1: 開くと中のリンクに Tab が届く', async ({ page }) => {
    await openStory(page, findStory('menu/open'))
    await expect(page.locator('.menu__inner')).toHaveJSProperty('inert', false)
    await page.locator('.menu__btn').focus()
    await page.keyboard.press('Tab')
    expect(await insideMenu(page)).toBe(true)
  })

  test('A-2: .menu__btn は button で、aria-expanded が開閉で変わる', async ({
    page,
  }) => {
    await openStory(page, findStory('menu/closed'))
    const button = page.locator('.menu__btn')
    expect(await button.evaluate((el) => el.tagName)).toBe('BUTTON')
    await expect(button).toHaveAttribute('type', 'button')
    const controls = await button.getAttribute('aria-controls')
    expect(controls).toBeTruthy()
    await expect(page.locator(`#${controls}`)).toHaveClass(/\bmenu__inner\b/)

    await expect(button).toHaveAttribute('aria-expanded', 'false')
    await button.click()
    await expect(button).toHaveAttribute('aria-expanded', 'true')
    await expect(page.locator('.menu')).toHaveClass(/\bis-open\b/)
    await button.click()
    await expect(button).toHaveAttribute('aria-expanded', 'false')
    await expect(page.locator('.menu__inner')).toHaveJSProperty('inert', true)
  })

  test('A-5: Tab で来たとき .menu__btn にフォーカスの枠が出る', async ({
    page,
  }) => {
    await openStory(page, findStory('menu/closed'))
    await tabTo(page, '.menu__btn')
    const outline = await page.locator('.menu__btn').evaluate((el) => {
      const style = getComputedStyle(el)
      return { style: style.outlineStyle, width: style.outlineWidth }
    })
    expect(outline.style).not.toBe('none')
    expect(outline.width).not.toBe('0px')
  })
})
