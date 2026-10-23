// sitemap.xml、feed.xml、robots.txt（08 の 1.5）
import { describe, expect, test } from 'vitest'
import { toIsoJst } from '../../src/lib/date'
import { lastModified } from '../../src/lib/feeds'
import { entryPath } from '../../src/lib/posts'
import { load, valid } from '../content/load'
import { legacyPaths, readDist, SITE_URL } from './dist.ts'

const entries = valid(load('src/content').posts)

// 正規表現で取り出す。XML の妥当性は Search Console への送信で見る
const tagValues = (xml: string, tag: string) =>
  [
    ...xml.matchAll(new RegExp(`<${tag}(?:\\s[^>]*)?>([^<]*)</${tag}>`, 'g')),
  ].map((m) => m[1])

describe('sitemap.xml', () => {
  const xml = readDist('sitemap.xml')
  const urls = [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)].map(([, body]) => ({
    loc: tagValues(body, 'loc')[0],
    lastmod: tagValues(body, 'lastmod')[0] as string | undefined,
  }))

  test('XML の宣言と urlset がある', () => {
    expect(xml).toMatch(/^<\?xml version="1.0" encoding="UTF-8"\?>\s*<urlset /)
    expect(xml.trim()).toMatch(/<\/urlset>$/)
  })

  test('URL は SITE_URL の絶対 URL で末尾がスラッシュ、旧サイトの 1323 件と一致する', () => {
    expect(urls).toHaveLength(1323)
    expect(
      urls.filter(
        ({ loc }) => !loc.startsWith(`${SITE_URL}/`) || !loc.endsWith('/'),
      ),
    ).toEqual([])
    expect(
      new Set(
        urls.map(({ loc }) => decodeURIComponent(loc.slice(SITE_URL.length))),
      ),
    ).toEqual(legacyPaths)
  })

  test('lastmod は投稿 0 件のターム（/labs/332/、/labs/333/）以外のすべてにあり、+09:00 で書く', () => {
    const without = urls.filter(({ lastmod }) => !lastmod).map(({ loc }) => loc)
    expect(without).toEqual([`${SITE_URL}/labs/332/`, `${SITE_URL}/labs/333/`])
    expect(
      urls.filter(
        ({ lastmod }) =>
          lastmod && !/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\+09:00$/.test(lastmod),
      ),
    ).toEqual([])
  })

  test('記事の lastmod は modified と date の新しいほう', () => {
    const byLoc = new Map(urls.map(({ loc, lastmod }) => [loc, lastmod]))
    const mismatched = entries
      .map((entry) => ({
        loc: SITE_URL + entryPath(entry),
        expected: toIsoJst(lastModified(entry)),
      }))
      .filter(({ loc, expected }) => byLoc.get(loc) !== expected)
    expect(mismatched).toEqual([])
  })
})

describe('feed.xml', () => {
  const xml = readDist('feed.xml')
  const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(
    ([, body]) => body,
  )

  test('tip の新しい 50 件を、絶対 URL の link と guid で出す（03 の 6.4）', () => {
    const expected = entries
      .filter(({ data }) => data.type === 'tip')
      .sort((a, b) => b.data.date.getTime() - a.data.date.getTime())
      .slice(0, 50)
      .map((entry) => SITE_URL + entryPath(entry))
    expect(items.map((item) => tagValues(item, 'link')[0])).toEqual(expected)
    expect(items.map((item) => tagValues(item, 'guid')[0])).toEqual(expected)
  })

  // 相対のままだと RSS リーダーでリンクが切れる
  test('content:encoded の中の href / src が / で始まらない', () => {
    const relative = items.flatMap((item) =>
      [...item.matchAll(/(?:href|src)=(?:&quot;|")(\/[^/][^&"]*)/g)].map(
        (m) => m[1],
      ),
    )
    expect(relative).toEqual([])
  })
})

describe('robots.txt', () => {
  const txt = readDist('robots.txt')

  test('sitemap の行があり、全体を止めていない', () => {
    expect(txt).toContain(`Sitemap: ${SITE_URL}/sitemap.xml`)
    expect(txt).not.toMatch(/^Disallow:\s*\/\s*$/m)
  })
})
