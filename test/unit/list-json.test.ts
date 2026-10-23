import { describe, expect, test } from 'vitest'
import { eyecatchFor } from '../../src/lib/eyecatch/index.ts'
import {
  listItem,
  listPages,
  termDataEndpoint,
  termDataStaticPaths,
  typeDataEndpoint,
  typeDataStaticPaths,
} from '../../src/lib/list-json'

const entry = (
  id: number,
  date: string,
  {
    type = 'tip',
    terms = [] as number[],
    clipUrl = undefined as string | undefined,
  } = {},
) => ({
  data: {
    id,
    type: type as 'tip' | 'clip' | 'lab',
    slug: `s${id}`,
    title: `title ${id}`,
    date: new Date(date),
    primaryTag: 'css',
    terms: terms.map((t) => ({ id: t, name: `t${t}`, slug: `t${t}` })),
    ...(clipUrl === undefined ? {} : { clipUrl }),
  },
})

describe('listItem', () => {
  test('表示に要る項目だけを入れる。日付は日本時間', () => {
    const e = entry(2883, '2020-03-22T00:26:34+09:00')
    expect(listItem(e)).toEqual({
      type: 'tip',
      slug: 's2883',
      path: '/tip/s2883/',
      title: 'title 2883',
      date: '2020-03-22T00:26:34+09:00',
      dateLabel: '2020-03-22',
      primaryTag: 'css',
      eyecatch: eyecatchFor(e.data).svg,
    })
  })

  test('clipUrl は clip にあるときだけ入れる', () => {
    const withUrl = entry(1, '2020-01-01', {
      type: 'clip',
      clipUrl: 'https://example.com/',
    })
    expect(listItem(withUrl).clipUrl).toBe('https://example.com/')
    expect(
      'clipUrl' in listItem(entry(2, '2020-01-01', { type: 'clip' })),
    ).toBe(false)
  })

  test('日本語 slug の path はエンコードする', () => {
    const e = entry(2831, '2020-02-25', { type: 'clip' })
    e.data.slug = 'ね - nt'
    expect(listItem(e).path).toBe('/clip/%E3%81%AD%E2%80%AF-%E2%80%AFnt/')
  })
})

describe('listPages', () => {
  test('新しい順に 8 件ずつ。page / last / total を入れる', () => {
    const entries = Array.from({ length: 17 }, (_, i) =>
      entry(i + 1, `2020-01-${String(i + 1).padStart(2, '0')}`),
    )
    const pages = listPages(entries)
    expect(pages.map((p) => [p.page, p.last, p.total, p.items.length])).toEqual(
      [
        [1, 3, 17, 8],
        [2, 3, 17, 8],
        [3, 3, 17, 1],
      ],
    )
    expect(pages[0].items[0].slug).toBe('s17')
    expect(pages[2].items[0].slug).toBe('s1')
  })

  test('0 件でも空の 1 ページ目を出す', () => {
    expect(listPages([])).toEqual([{ items: [], page: 1, last: 1, total: 0 }])
  })
})

describe('静的なパス', () => {
  const entries = [
    entry(1, '2020-01-01', { terms: [10] }),
    entry(2, '2020-01-02', { type: 'clip', terms: [10, 20] }),
  ]

  test('type ごとに出す。記事のない type も 1 ページ目を出す', () => {
    expect(
      typeDataStaticPaths(entries).map(({ params, props }) => [
        params.type,
        params.page,
        props.body.total,
      ]),
    ).toEqual([
      ['tip', '1', 1],
      ['clip', '1', 1],
      ['lab', '1', 0],
    ])
  })

  test('タームごとに、そのタクソノミーの type の記事だけで出す。0 件のタームも出す', () => {
    const paths = termDataStaticPaths(entries, {
      tips: [{ id: 10 }],
      clips: [{ id: 10 }, { id: 20 }],
      labs: [{ id: 332 }],
    })
    expect(
      paths.map(({ params, props }) => [
        `${params.tax}/${params.id}/${params.page}`,
        props.body.items.map((item) => item.slug),
      ]),
    ).toEqual([
      ['tips/10/1', ['s1']],
      ['clips/10/1', ['s2']],
      ['clips/20/1', ['s2']],
      ['labs/332/1', []],
    ])
  })

  test('data-endpoint の形', () => {
    expect(typeDataEndpoint('tip')).toBe('/data/tip/')
    expect(termDataEndpoint('labs', 332)).toBe('/data/labs/332/')
  })
})
