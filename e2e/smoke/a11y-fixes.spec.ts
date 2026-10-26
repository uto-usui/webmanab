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
