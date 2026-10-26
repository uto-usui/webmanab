// サイト内検索（#46）。索引は dist/pagefind/ を読む
import { expect, test } from './fixtures'

const cards = '[data-search-results] .article-item'

test('ヘッダーの search から検索ページに入れる', async ({ page }) => {
  await page.goto('/tip/method-control/')
  await page.getByRole('link', { name: 'search', exact: true }).click()
  await expect(page).toHaveURL(/\/search\/$/)
  await expect(page.getByRole('searchbox', { name: 'keyword' })).toBeVisible()
})

test('日本語の語で引け、最初の 8 件を出し、下まで来たら続きを出す', async ({
  page,
}) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  await page.goto(`/search/?q=${encodeURIComponent('変数')}`)
  await expect(page.locator('[data-search-status]')).toHaveText(/^\d+ 件$/)
  await expect(page.locator(cards)).toHaveCount(8)
  await expect(
    page.locator(`${cards} a[href="/tip/variable-javascript/"]`).first(),
  ).toBeVisible()
  await page.locator('[data-search-more]').scrollIntoViewIfNeeded()
  await expect(page.locator(cards)).toHaveCount(16)
  expect(errors).toEqual([])
})

test('type で絞り込み、選び直すと検索し直す', async ({ page }) => {
  await page.goto('/search/?q=grid&type=clip')
  await expect(page.locator(cards)).toHaveCount(8)
  const paths = await page
    .locator(`${cards} .article-item__img-wrap`)
    .evaluateAll((links) => links.map((a) => a.getAttribute('href')))
  expect(paths.every((path) => path?.startsWith('/clip/'))).toBe(true)
  await page.locator('label.search-form__type', { hasText: 'tip' }).click()
  await expect(page).toHaveURL(/type=tip/)
  await expect(page.getByRole('radio', { name: 'tip' })).toBeChecked()
})

test('0 件のときは一覧への入口を出す', async ({ page }) => {
  await page.goto('/search/?q=qwxzv')
  await expect(page.locator('[data-search-status]')).toHaveText(
    '見つかりませんでした',
  )
  await expect(page.locator('[data-search-empty]')).toBeVisible()
  await expect(page.locator(cards)).toHaveCount(0)
})

test('ない URL では 404 を返し、検索の入力欄から /search/ に送れる', async ({
  page,
}) => {
  const response = await page.goto('/no-such-page/')
  expect(response?.status()).toBe(404)
  await page.getByRole('searchbox', { name: 'keyword' }).fill('grid')
  await page.getByRole('button', { name: 'search' }).click()
  await expect(page).toHaveURL(/\/search\/\?q=grid/)
  await expect(page.locator(cards)).toHaveCount(8)
})
