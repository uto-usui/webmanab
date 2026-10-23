// シェアボタンの分岐（07 の 12 章）と、08 の 2.4 の A-5 をシェアの story で確かめる
import { expect, test } from '@playwright/test'
import { findStory, openStory, tabTo } from './story'

test.describe('entry-share', () => {
  test('A-5: Tab で来たときフォーカスの枠が出る', async ({ page }) => {
    await openStory(page, findStory('entry-share/supported'))
    await tabTo(page, '.entry-sns__target')
    const outline = await page.locator('.entry-sns__target').evaluate((el) => {
      const style = getComputedStyle(el)
      return { style: style.outlineStyle, width: style.outlineWidth }
    })
    expect(outline.style).not.toBe('none')
    expect(outline.width).not.toBe('0px')
  })

  test('共有の画面を閉じた（AbortError）ときは何も変わらない', async ({
    page,
  }) => {
    const errors: Error[] = []
    page.on('pageerror', (error) => errors.push(error))
    await openStory(page, {
      ...findStory('entry-share/supported'),
      mocks: ['share-abort'],
    })
    await page.click('.entry-sns__target')
    await expect(page.locator('.entry-sns__label')).toHaveText(
      'share this page',
    )
    await expect(page.locator('.entry-sns__target')).not.toHaveClass(
      /\bis-copied\b/,
    )
    expect(errors).toEqual([])
  })
})
