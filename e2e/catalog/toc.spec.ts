// 08 の 2.4 の A-3 を目次の story で確かめる。失敗したらマージを止める（07 の 10.4）
import { expect, test, type Page } from '@playwright/test'
import { findStory, openStory } from './story'

const insideList = (page: Page) =>
  page.evaluate(() => !!document.activeElement?.closest('.entry-toc__list'))

test.describe('entry-toc', () => {
  test('A-3: 閉じている間は項目のリンクに Tab が止まらない', async ({
    page,
  }) => {
    await openStory(page, findStory('entry-toc/closed'))
    await expect(page.locator('.entry-toc__list')).toHaveJSProperty(
      'inert',
      true,
    )
    const links = await page.locator('.entry-toc__list a').count()
    expect(links).toBeGreaterThan(0)

    let stops = 0
    for (let i = 0; i < links + 2; i++) {
      await page.keyboard.press('Tab')
      if (await insideList(page)) stops++
    }
    expect(stops).toBe(0)
  })

  test('A-3: 開くと項目のリンクに Tab が届く', async ({ page }) => {
    await openStory(page, findStory('entry-toc/open'))
    await page.locator('.entry-toc__title').focus()
    await page.keyboard.press('Tab')
    expect(await insideList(page)).toBe(true)
  })
})
