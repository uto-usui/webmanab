import { expect, test, type Page } from '@playwright/test'

// 静的 JSON（03 の 4.2）とアイキャッチの SVG はほかの担当が作るルートなので、ここでは形だけを決めてモックする。
// 一覧の部品と script が、その形を正しく描くかを見る
type Item = {
  type: string
  slug: string
  path: string
  title: string
  date: string
  dateLabel: string
  primaryTag: string
  clipUrl?: string
  eyecatch: string
}

const SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360" width="640" height="360"><rect width="640" height="360" fill="#ffd740"/></svg>'

const items = (type: string, count: number): Item[] =>
  Array.from({ length: count }, (_, i) => ({
    type,
    slug: `mock-${i}`,
    path: `/${type}/mock-${i}/`,
    title: `mock ${type} ${i}`,
    date: '2001-01-01T00:00:00+09:00',
    dateLabel: '2001-01-01',
    primaryTag: 'mock',
    ...(type === 'clip' ? { clipUrl: `https://example.com/${i}` } : {}),
    eyecatch: `/eyecatch/${type}/${9000 + i}.svg`,
  }))

const cards = (page: Page) =>
  page.locator('.article-list__inner > .article-item')
const container = (page: Page) => page.locator('.infinite-loading-container')
const end = (page: Page) => page.locator('[data-infinite-end]')
const scrollToBottom = (page: Page) =>
  page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight))

test.beforeEach(async ({ page }) => {
  await page.route('**/eyecatch/**/*.svg', (route) =>
    route.fulfill({ contentType: 'image/svg+xml', body: SVG }),
  )
})

test('一覧のタイトルの実体参照が文字で出る', async ({ page }) => {
  await page.goto('/clips/69/')
  await expect(cards(page).last()).toContainText(
    'Website of the Year 2017 – CSS Design Awards',
  )
  expect(await page.content()).not.toContain('&amp;#8211;')
})

test('トップは 3 つの一覧に 8 件ずつで、無限スクロールがない', async ({
  page,
}) => {
  await page.goto('/')
  const lists = page.locator('.article-list')
  await expect(lists).toHaveCount(3)
  for (const list of await lists.all()) {
    await expect(list.locator('.article-item')).toHaveCount(8)
  }
  await expect(container(page)).toHaveCount(0)
})

test('/clip/ で下までスクロールすると 8 件増え、読み込み中は Loader が出る', async ({
  page,
}) => {
  let release = () => {}
  const held = new Promise<void>((resolve) => (release = resolve))
  await page.route('**/data/clip/2.json', async (route) => {
    await held
    await route.fulfill({
      json: { items: items('clip', 8), page: 2, last: 103, total: 817 },
    })
  })
  // 足したあとに読み込み口がまだ画面内なら 3 ページ目も読みにいく。件数が変わらないように止めておく
  await page.route('**/data/clip/3.json', (route) =>
    route.fulfill({ status: 500, body: '' }),
  )

  await page.goto('/clip/')
  await expect(cards(page)).toHaveCount(8)
  const loader = page.locator('.loader')
  await expect(loader).toBeHidden()

  await scrollToBottom(page)
  await expect(loader).toBeVisible()
  release()

  await expect(cards(page)).toHaveCount(16)
  await expect(loader).toBeHidden()
  // 次のページがあるので読み込み口は残り、End は出ない
  await expect(container(page)).toHaveCount(1)
  await expect(end(page)).toBeHidden()

  // 足したカードの中身。clip のタイトルは外部サイトへ新しいタブで開く
  const added = cards(page).nth(8)
  await expect(added.locator('.article-item__tag')).toHaveText('mock')
  await expect(added.locator('.article-item__img-wrap')).toHaveAttribute(
    'href',
    '/clip/mock-0/',
  )
  const title = added.locator('.article-item__target')
  await expect(title).toHaveText('mock clip 0')
  await expect(title).toHaveAttribute('href', 'https://example.com/0')
  await expect(title).toHaveAttribute('target', '_blank')
  await expect(added.locator('time')).toHaveAttribute('datetime', '2001-01-01')
  await added.scrollIntoViewIfNeeded()
  await expect(added.locator('img')).toHaveAttribute('data-lazy', 'loaded')
})

test('合計が 8 の倍数のタームは、最後のページのあとに End が出る', async ({
  page,
}) => {
  await page.route('**/data/labs/212/2.json', (route) =>
    route.fulfill({
      json: { items: items('lab', 8), page: 2, last: 2, total: 16 },
    }),
  )
  await page.goto('/labs/212/')
  const list = page.locator('.article-list')
  await expect(list).toHaveAttribute('data-last-page', '2')
  await expect(end(page)).toBeHidden()

  await scrollToBottom(page)
  await expect(cards(page)).toHaveCount(16)
  await expect(end(page)).toBeVisible()
  await expect(end(page)).toHaveText('End')
})

test('合計が 8 の倍数でないタームは、最後のページのあとに読み込み口が消える', async ({
  page,
}) => {
  await page.route('**/data/labs/173/2.json', (route) =>
    route.fulfill({
      json: { items: items('lab', 3), page: 2, last: 2, total: 11 },
    }),
  )
  await page.goto('/labs/173/')
  await expect(container(page)).toHaveCount(1)

  await scrollToBottom(page)
  await expect(cards(page)).toHaveCount(11)
  await expect(container(page)).toHaveCount(0)
})

test('8 件に満たない一覧には読み込み口がない', async ({ page }) => {
  await page.goto('/labs/213/')
  await expect(cards(page)).toHaveCount(4)
  await expect(container(page)).toHaveCount(0)
})

test('0 件の /labs/332/ は最初から End が出て、JSON を読みにいかない', async ({
  page,
}) => {
  const requests: string[] = []
  page.on('request', (req) => {
    if (req.url().includes('/data/')) requests.push(req.url())
  })
  await page.goto('/labs/332/')
  await expect(cards(page)).toHaveCount(0)
  await expect(end(page)).toBeVisible()
  expect(requests).toEqual([])
})

test('2 ページ目の JSON が 500 でも、画面が壊れず読み込み口が残る', async ({
  page,
}) => {
  await page.route('**/data/clip/2.json', (route) =>
    route.fulfill({ status: 500, body: '' }),
  )
  await page.goto('/clip/')
  const response = page.waitForResponse('**/data/clip/2.json')
  await scrollToBottom(page)
  await response

  await expect(page.locator('.loader')).toBeHidden()
  await expect(cards(page)).toHaveCount(8)
  await expect(container(page)).toHaveCount(1)
  await expect(end(page)).toBeHidden()
})

test('一覧のサムネイルは読み込み後に data-lazy="loaded" になる', async ({
  page,
}) => {
  await page.goto('/tip/')
  const img = cards(page).first().locator('.article-item__img > img')
  await expect(img).toHaveAttribute('data-lazy', 'loaded')
  await expect(img).toHaveCSS('opacity', '1')
})

test('サムネイルが読み込めないときは data-lazy="error" になる', async ({
  page,
}) => {
  await page.route('**/eyecatch/**/*.svg', (route) =>
    route.fulfill({ status: 404, body: '' }),
  )
  await page.goto('/tip/')
  const img = cards(page).first().locator('.article-item__img > img')
  await expect(img).toHaveAttribute('data-lazy', 'error')
})
