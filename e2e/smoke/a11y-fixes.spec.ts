// 公開後の a11y の直し（docs/a11y.md の段階 1・2）
import { expect, test } from '@playwright/test'

const thumb = '.article-item__img-wrap'

test('A11Y-02: tip のサムネイルはタイトルと同じ行き先なので、読み上げと Tab から外す', async ({
  page,
}) => {
  await page.goto('/tip/')
  const first = page.locator(thumb).first()
  await expect(first).toHaveAttribute('tabindex', '-1')
  await expect(first).toHaveAttribute('aria-hidden', 'true')
  await expect(first).not.toHaveAttribute('aria-label')
})

test('A11Y-02: clip のサムネイルは記事ページへの唯一のリンクなので名前を付ける。足したカードも同じ', async ({
  page,
}) => {
  await page.goto('/clip/')
  const cards = page.locator('.article-list__inner > .article-item')
  const title = await cards.first().locator('.article-item__target').innerText()
  await expect(cards.first().locator(thumb)).toHaveAttribute(
    'aria-label',
    `${title} の記事`,
  )
  await expect(cards.first().locator(thumb)).not.toHaveAttribute('tabindex')

  await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight))
  await expect(cards).toHaveCount(16)
  const last = cards.last()
  const lastTitle = await last.locator('.article-item__target').innerText()
  await expect(last.locator(thumb)).toHaveAttribute(
    'aria-label',
    `${lastTitle} の記事`,
  )
})

test('A11Y-18: 無限スクロールで読み込んだ件数を role="status" で伝える', async ({
  page,
}) => {
  // 足したあとも読み込み口が画面内に残ると 3 ページ目も読みにいくので止めておく
  await page.route('**/data/tip/3.json', (route) =>
    route.fulfill({ status: 500, body: '' }),
  )
  await page.goto('/tip/')
  const status = page.locator('[data-infinite-status]')
  await expect(status).toHaveAttribute('role', 'status')
  await expect(status).toHaveText('')
  await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight))
  await expect(status).toHaveText('8 件読み込みました')
})

test('A11Y-19: 新しいタブで開くリンクは、そのことを aria-describedby で伝える', async ({
  page,
}) => {
  await page.goto('/clip/')
  const note = page.locator('#new-tab')
  await expect(note).toHaveText('新しいタブで開きます')
  await expect(note).toBeHidden()
  const external = page.locator('a[target="_blank"]')
  expect(await external.count()).toBeGreaterThan(0)
  for (const link of await external.all()) {
    await expect(link).toHaveAttribute('aria-describedby', 'new-tab')
  }
  await expect(
    page.locator('.article-item__target[target="_blank"]').first(),
  ).toHaveAccessibleDescription('新しいタブで開きます')
})

test('A11Y-16: Tab で来たリンクに枠が出て、ホバーでずらす部品は同じだけずれる', async ({
  page,
}) => {
  await page.goto('/tip/method-control/')
  const tag = page.locator('.entry-tag__target').first()
  const look = () =>
    tag.evaluate((el) => {
      const style = getComputedStyle(el)
      return { outline: style.outlineStyle, shadow: style.boxShadow }
    })
  expect((await look()).outline).toBe('none')

  // 1 つ前の要素から Tab で移る
  await tag.evaluate((el) => {
    const all = [...document.querySelectorAll<HTMLElement>('a[href], button')]
    all[all.indexOf(el as HTMLElement) - 1]?.focus()
  })
  await page.keyboard.press('Tab')
  await expect(tag).toBeFocused()
  await expect.poll(async () => (await look()).outline).toBe('solid')
  expect((await look()).shadow).toContain('5px 5px 0px')
})

test('A11Y-15: 最初の Tab で「本文へ移動」が左上に出て、押すと本文の最初のリンクへ進む', async ({
  page,
}) => {
  await page.goto('/tip/method-control/')
  const skip = page.locator('.skip-link')
  expect(await skip.boundingBox()).toMatchObject({ width: 1, height: 1 })
  await page.keyboard.press('Tab')
  await expect(skip).toBeFocused()
  const box = await skip.boundingBox()
  expect(box!.width).toBeGreaterThan(1)
  expect(box!.y).toBeLessThan(20)
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/#main$/)
  await page.keyboard.press('Tab')
  expect(
    await page.evaluate(() => !!document.activeElement?.closest('main#main')),
  ).toBe(true)
})

test.describe('A11Y-17: 動きを減らす設定', () => {
  test.use({ reducedMotion: 'reduce' })

  test('メニューは待たずに開き終わる', async ({ page }) => {
    await page.goto('/')
    await page.click('.menu__btn')
    // 動きがあると 0.85 秒かかる
    await expect
      .poll(
        () =>
          page
            .locator('.menu')
            .evaluate((el) => getComputedStyle(el).transform),
        { timeout: 200, intervals: [20] },
      )
      .toBe('matrix(1, 0, 0, 1, 0, 0)')
  })

  test('ローダーのバーは動き続けない', async ({ page }) => {
    await page.goto('/tip/')
    const running = await page.evaluate(() => {
      const bar = document.querySelector('.loader > span')!
      return getComputedStyle(bar).animationIterationCount
    })
    expect(running).toBe('1')
  })
})
