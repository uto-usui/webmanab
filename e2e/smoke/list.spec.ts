import { expect, test, type Page } from '@playwright/test'
import { termWhere, type TermList } from './terms'

type ListPage = {
  items: {
    path: string
    title: string
    dateLabel: string
    clipUrl?: string
    eyecatch: string
  }[]
  page: number
  last: number
  total: number
}

const cards = (page: Page) =>
  page.locator('.article-list__inner > .article-item')
const container = (page: Page) => page.locator('.infinite-loading-container')
const end = (page: Page) => page.locator('[data-infinite-end]')
const scrollToBottom = (page: Page) =>
  page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight))
const getJson = async (page: Page, path: string) =>
  (await (await page.request.get(path)).json()) as ListPage

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
  const next = await getJson(page, '/data/clip/2.json')
  let release = () => {}
  const held = new Promise<void>((resolve) => (release = resolve))
  await page.route('**/data/clip/2.json', async (route) => {
    await held
    await route.continue()
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

  // 足したカードの中身が JSON の 1 件目と同じ。clip のタイトルは外部サイトへ新しいタブで開く
  const [item] = next.items
  const added = cards(page).nth(8)
  await expect(added.locator('.article-item__img-wrap')).toHaveAttribute(
    'href',
    item.path,
  )
  const title = added.locator('.article-item__target')
  await expect(title).toHaveText(item.title)
  await expect(title).toHaveAttribute('href', item.clipUrl ?? '')
  await expect(title).toHaveAttribute('target', '_blank')
  await expect(added.locator('time')).toHaveAttribute(
    'datetime',
    item.dateLabel,
  )
  await added.scrollIntoViewIfNeeded()
  await expect(added.locator('img')).toHaveAttribute('data-lazy', 'loaded')
})

test('HTML の最初の 8 件が JSON の 1 ページ目と同じ', async ({ page }) => {
  const first = await getJson(page, '/data/tips/29/1.json')
  await page.goto('/tips/29/')
  const hrefs = await page
    .locator('.article-list__inner .article-item__img-wrap')
    .evaluateAll((els) => els.map((el) => el.getAttribute('href')))
  expect(hrefs).toEqual(first.items.map((item) => item.path))
})

test('clipUrl のない clip はタイトルが記事ページへつながる', async ({
  page,
}) => {
  const isPlainClip = (item: TermList['items'][number]) =>
    item.path.startsWith('/clip/') && !item.clipUrl
  const term = termWhere(({ items }) => items.some(isPlainClip))
  test.skip(!term, '1 ページ目に clipUrl のない clip があるタームがない')
  const item = term.items.find(isPlainClip)!
  await page.goto(term.path)
  const title = page.locator(`.article-item__target[href="${item.path}"]`)
  await expect(title).toHaveCount(1)
  await expect(title).not.toHaveAttribute('target', /.*/)
})

test('足したカードは複製元の状態を引き継がない', async ({ page }) => {
  // 複製元の 1 件目は clip で target 付き、画像は loaded。clipUrl のない clip を足すと target が外れ、画像は loading から始まる
  const next = await getJson(page, '/data/clip/2.json')
  const [item] = next.items
  await page.route('**/data/clip/2.json', (route) =>
    route.fulfill({
      json: {
        ...next,
        items: [{ ...item, clipUrl: undefined }, ...next.items.slice(1)],
      },
    }),
  )
  await page.route('**/data/clip/3.json', (route) =>
    route.fulfill({ status: 500, body: '' }),
  )
  let release = () => {}
  const held = new Promise<void>((resolve) => (release = resolve))
  await page.route(`**${item.eyecatch}`, async (route) => {
    await held
    await route.continue()
  })

  await page.goto('/clip/')
  await expect(cards(page).first().locator('img')).toHaveAttribute(
    'data-lazy',
    'loaded',
  )
  await scrollToBottom(page)
  await expect(cards(page)).toHaveCount(16)

  const added = cards(page).nth(8)
  const title = added.locator('.article-item__target')
  await expect(title).toHaveAttribute('href', item.path)
  await expect(title).not.toHaveAttribute('target', /.*/)
  await expect(title).not.toHaveAttribute('rel', /.*/)
  await added.scrollIntoViewIfNeeded()
  const img = added.locator('img')
  await expect(img).toHaveAttribute('data-lazy', 'loading')
  release()
  await expect(img).toHaveAttribute('data-lazy', 'loaded')
})

// 最後のページまで 1 ページずつスクロールして読み込む
const scrollToLast = async (page: Page, { total, last }: TermList) => {
  for (let shown = 1; shown < last; shown++) {
    await expect(end(page)).toBeHidden()
    await scrollToBottom(page)
    await expect(cards(page)).toHaveCount(Math.min((shown + 1) * 8, total))
  }
}

test('合計が 8 の倍数のタームは、最後のページのあとに End が出る', async ({
  page,
}) => {
  const term = termWhere(({ total }) => total > 8 && total % 8 === 0)
  test.skip(!term, '合計が 8 の倍数で 2 ページ以上のタームがない')
  await page.goto(term.path)
  const list = page.locator('.article-list')
  await expect(list).toHaveAttribute('data-last-page', String(term.last))

  await scrollToLast(page, term)
  await expect(end(page)).toBeVisible()
  await expect(end(page)).toHaveText('End')
})

test('合計が 8 の倍数でないタームは、最後のページのあとに読み込み口が消える', async ({
  page,
}) => {
  const term = termWhere(({ total }) => total > 8 && total % 8 !== 0)
  test.skip(!term, '合計が 8 の倍数でなく 2 ページ以上のタームがない')
  await page.goto(term.path)
  await expect(container(page)).toHaveCount(1)

  await scrollToLast(page, term)
  await expect(container(page)).toHaveCount(0)
})

test('8 件に満たない一覧には読み込み口がない', async ({ page }) => {
  const term = termWhere(({ total }) => total > 0 && total < 8)
  test.skip(!term, '8 件に満たないタームがない')
  await page.goto(term.path)
  await expect(cards(page)).toHaveCount(term.total)
  await expect(container(page)).toHaveCount(0)
})

test('0 件のタームは最初から End が出て、JSON を読みにいかない', async ({
  page,
}) => {
  const term = termWhere(({ total }) => total === 0)
  test.skip(!term, '0 件のタームがない')
  const requests: string[] = []
  page.on('request', (req) => {
    if (req.url().includes('/data/')) requests.push(req.url())
  })
  await page.goto(term.path)
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
