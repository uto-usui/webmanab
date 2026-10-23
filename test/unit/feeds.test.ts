import { describe, expect, test } from 'vitest'
import {
  absolutizeLinks,
  feedItems,
  lastModified,
  robotsTxt,
  sitemapEntries,
  sitemapXml,
} from '../../src/lib/feeds'
import { sitePaths } from '../../src/lib/posts'

const site = new URL('https://webmanab.netlify.app')

const entry = (
  slug: string,
  date: string,
  {
    type = 'tip',
    modified = undefined as string | undefined,
    terms = [] as number[],
  } = {},
) => ({
  data: {
    type: type as 'tip' | 'clip' | 'lab',
    slug,
    title: `title ${slug}`,
    date: new Date(date),
    ...(modified === undefined ? {} : { modified: new Date(modified) }),
    terms: terms.map((id) => ({ id, name: `t${id}`, slug: `t${id}` })),
  },
})

describe('lastModified', () => {
  test('modified と date の新しいほう', () => {
    expect(
      lastModified(
        entry('a', '2020-01-01', { modified: '2020-02-01' }),
      ).toISOString(),
    ).toBe('2020-02-01T00:00:00.000Z')
    expect(
      lastModified(
        entry('a', '2020-03-01', { modified: '2020-02-01' }),
      ).toISOString(),
    ).toBe('2020-03-01T00:00:00.000Z')
    expect(lastModified(entry('a', '2020-03-01')).toISOString()).toBe(
      '2020-03-01T00:00:00.000Z',
    )
  })
})

describe('sitemap', () => {
  const entries = [
    entry('a', '2020-01-01T00:00:00+09:00', {
      modified: '2020-05-01T00:00:00+09:00',
      terms: [1],
    }),
    entry('b', '2020-03-01T00:00:00+09:00', { terms: [1] }),
    entry('ね - nt', '2020-02-01T00:00:00+09:00', { type: 'clip' }),
  ]
  const terms = { tips: [{ id: 1 }], clips: [], labs: [{ id: 332 }] }

  test('URL の並びは sitePaths と同じ', () => {
    expect(sitemapEntries(entries, terms).map((e) => e.path)).toEqual(
      sitePaths(entries, terms),
    )
  })

  test('記事は自分の lastmod、一覧は載っている記事の最新。0 件のタームには付けない', () => {
    const lastmod = Object.fromEntries(
      sitemapEntries(entries, terms).map(({ path, lastmod }) => [
        path,
        lastmod?.toISOString(),
      ]),
    )
    expect(lastmod).toEqual({
      '/': '2020-04-30T15:00:00.000Z',
      '/tip/': '2020-04-30T15:00:00.000Z',
      '/clip/': '2020-01-31T15:00:00.000Z',
      '/lab/': undefined,
      '/tip/a/': '2020-04-30T15:00:00.000Z',
      '/tip/b/': '2020-02-29T15:00:00.000Z',
      '/clip/%E3%81%AD%E2%80%AF-%E2%80%AFnt/': '2020-01-31T15:00:00.000Z',
      '/tips/1/': '2020-04-30T15:00:00.000Z',
      '/labs/332/': undefined,
    })
  })

  test('XML は SITE_URL からの絶対 URL と +09:00 の lastmod で出す', () => {
    const xml = sitemapXml(sitemapEntries(entries, terms), site)
    expect(xml).toMatch(/^<\?xml version="1.0" encoding="UTF-8"\?>\n<urlset /)
    expect(xml).toContain(
      '<url><loc>https://webmanab.netlify.app/tip/a/</loc><lastmod>2020-05-01T00:00:00+09:00</lastmod></url>',
    )
    expect(xml).toContain(
      '<url><loc>https://webmanab.netlify.app/labs/332/</loc></url>',
    )
    expect(xml.match(/<url>/g)).toHaveLength(9)
  })
})

test('robots.txt に sitemap の行がある', () => {
  expect(robotsTxt(site)).toBe(
    'User-agent: *\nAllow: /\n\nSitemap: https://webmanab.netlify.app/sitemap.xml\n',
  )
})

describe('feed', () => {
  test('サイト内リンクだけを絶対 URL にし、外部・アンカー・コードの中は変えない', () => {
    const html = [
      '<p><a href="/tip/macos-gulp-init/">a</a>',
      '<a href="https://example.com/" target="_blank" rel="noopener">b</a>',
      '<a href="//jsfiddle.net/x/">c</a>',
      '<a href="#a0">d</a>',
      '<code>&lt;a href="/x/"&gt;</code></p>',
      '<iframe src="/demo/"></iframe>',
    ].join('')
    expect(absolutizeLinks(html, site)).toBe(
      [
        '<p><a href="https://webmanab.netlify.app/tip/macos-gulp-init/">a</a>',
        '<a href="https://example.com/" target="_blank" rel="noopener">b</a>',
        '<a href="//jsfiddle.net/x/">c</a>',
        '<a href="#a0">d</a>',
        '<code>&lt;a href="/x/"&gt;</code></p>',
        '<iframe src="https://webmanab.netlify.app/demo/"></iframe>',
      ].join(''),
    )
  })

  test('50 件まで。link は絶対 URL、excerpt がなければ description を出さない', () => {
    const entries = Array.from({ length: 52 }, (_, i) => ({
      data: {
        type: 'tip' as const,
        slug: `s${i}`,
        title: `t${i}`,
        date: new Date(2020, 0, 52 - i),
        ...(i === 1 ? {} : { excerpt: `e${i}` }),
      },
      rendered: { html: '<p><a href="/tip/x/">x</a></p>' },
    }))
    const items = feedItems(entries, site)
    expect(items).toHaveLength(50)
    expect(items[0]).toEqual({
      title: 't0',
      link: 'https://webmanab.netlify.app/tip/s0/',
      pubDate: entries[0].data.date,
      description: 'e0',
      content: '<p><a href="https://webmanab.netlify.app/tip/x/">x</a></p>',
    })
    expect('description' in items[1]).toBe(false)
  })
})
