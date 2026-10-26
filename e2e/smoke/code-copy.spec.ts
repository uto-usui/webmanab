// コードブロックのコピー（#49）
import { expect, test } from './fixtures'

const PATH = '/tip/sass-pickup/'

test('コードブロックごとに copy があり、押すとそのコードを写して 2 秒で戻る', async ({
  page,
}) => {
  await page.addInitScript(() => {
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
  const blocks = page.locator('.entry-content__inner pre:has(> code)')
  const buttons = page.locator(
    '.entry-content__inner .code-copy-wrap > .code-copy',
  )
  await expect(buttons).toHaveCount(await blocks.count())

  const second = buttons.nth(1)
  await expect(second).toHaveCSS('opacity', '0')
  await page.locator('.code-copy-wrap').nth(1).hover()
  await expect(second).toHaveCSS('opacity', '1')
  await second.click()
  expect(
    await page.evaluate(() => (window as unknown as { copied: string }).copied),
  ).toBe(await blocks.nth(1).locator('code').textContent())
  await expect(second).toHaveText('copied')
  const status = page.locator('.entry-content > [role="status"]')
  await expect(status).toHaveText('コードをコピーしました')
  await expect(second).toHaveText('copy', { timeout: 3000 })
  await expect(status).toBeEmpty()
})

test('クリップボードを使えないときはボタンを出さない', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', { value: undefined })
  })
  await page.goto(PATH)
  await expect(page.locator('.code-copy')).toHaveCount(0)
})

test.describe('タッチの端末', () => {
  test.use({ hasTouch: true })

  test('ブロックをタップするとボタンが出る', async ({ page }) => {
    await page.goto(PATH)
    const wrap = page.locator('.code-copy-wrap').first()
    await expect(wrap.locator('.code-copy')).toHaveCSS('opacity', '0')
    await wrap.locator('pre').tap()
    await expect(wrap).toHaveClass(/\bis-active\b/)
    await expect(wrap.locator('.code-copy')).toHaveCSS('opacity', '1')
  })
})
