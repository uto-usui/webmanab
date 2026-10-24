// シェアボタン（02 の 9.1、08 の 1.6、2.4 の A-5、A-6）。細かい分岐はカタログ（07）が見る
import { type Page } from '@playwright/test'
import { expect, test } from './fixtures'

const PATH = '/tip/method-control/'

const canonical = (page: Page) =>
  page.locator('link[rel="canonical"]').getAttribute('href')

const dataset = (page: Page) =>
  page.locator('.entry-sns__target').evaluate((el) => ({
    title: (el as HTMLElement).dataset.shareTitle,
    url: (el as HTMLElement).dataset.shareUrl,
  }))

test('navigator.share があれば、title と canonical で呼ぶ', async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'share', {
      value: (data: ShareData) => {
        ;(window as unknown as { shared: ShareData }).shared = data
        return Promise.resolve()
      },
    })
  })
  await page.goto(PATH)
  await expect(page.locator('.entry-sns__label')).toHaveText('share this page')
  await page.click('.entry-sns__target')
  const shared = await page.evaluate(
    () => (window as unknown as { shared: ShareData }).shared,
  )
  const expected = await dataset(page)
  expect(shared).toEqual(expected)
  expect(shared.url).toBe(await canonical(page))
  expect(shared.title).toBeTruthy()
})

test('navigator.share がなければ canonical をコピーし、2 秒で元に戻る', async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'share', { value: undefined })
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: (text: string) => {
          ;(window as unknown as { copied: string }).copied = text
          return Promise.resolve()
        },
      },
    })
  })
  await page.goto(PATH)
  const label = page.locator('.entry-sns__label')
  const status = page.locator('.entry-sns [role="status"]')
  await expect(label).toHaveText('copy link')
  await page.click('.entry-sns__target')
  expect(
    await page.evaluate(() => (window as unknown as { copied: string }).copied),
  ).toBe(await canonical(page))
  await expect(label).toHaveText('copied')
  await expect(status).not.toBeEmpty()
  await expect(label).toHaveText('copy link', { timeout: 3000 })
  await expect(status).toBeEmpty()
})

test('Tab で来たボタンにフォーカスの枠が出る（A-5）', async ({ page }) => {
  await page.goto(PATH)
  const button = page.locator('.entry-sns__target')
  for (let i = 0; i < 200; i++) {
    await page.keyboard.press('Tab')
    if (await button.evaluate((el) => el === document.activeElement)) break
  }
  const outline = await button.evaluate((el) => {
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
