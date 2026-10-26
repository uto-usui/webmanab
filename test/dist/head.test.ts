// head と構造化データ（08 の 1.5、06）。1323 ページをまとめて見て、外れたページを出す
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { expect, test } from 'vitest'
import { toIsoJst } from '../../src/lib/date'
import { lastModified } from '../../src/lib/feeds'
import { SITE_DESCRIPTION } from '../../src/lib/site'
import { load, valid } from '../content/load'
import { isLegacy } from '../content/pages'
import {
  DIST,
  distFiles,
  pagePath,
  readDist,
  SITE_URL,
  startTags,
} from './dist.ts'

const decode = (value: string) =>
  value
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')

// 404.html はどの URL にも同じ中身を返すので、canonical と OGP を持たない（#47）
const pages = distFiles('**/*.html')
  .filter((file) => file !== '404.html')
  .map((file) => {
    const html = readDist(file)
    const tags = startTags(html.slice(0, html.indexOf('</head>')))
    const attr = (tag: string, name: string) => {
      const value = tag.match(new RegExp(`\\s${name}="([^"]*)"`))?.[1]
      return value === undefined ? undefined : decode(value)
    }
    const meta = (key: 'name' | 'property', value: string) =>
      tags
        .filter((tag) => tag.startsWith('<meta') && attr(tag, key) === value)
        .map((tag) => attr(tag, 'content') ?? '')
    return {
      file,
      path: pagePath(file),
      canonicals: tags
        .filter((tag) => /^<link\s[^>]*rel="canonical"/.test(tag))
        .map((tag) => attr(tag, 'href') ?? ''),
      meta,
      nameOg: tags.filter((tag) => /^<meta\s[^>]*name="og:/.test(tag)),
      jsonLd: [
        ...html.matchAll(
          /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g,
        ),
      ].map((m) => m[1]),
    }
  })

// canonical はエンコード済みのパス。dist/ のディレクトリ名はデコードした文字
const canonicalOf = ({ path }: { path: string }) =>
  SITE_URL + path.split('/').map(encodeURIComponent).join('/')

const failing = (check: (page: (typeof pages)[number]) => unknown) =>
  pages.filter((page) => !check(page)).map(({ file }) => file)

test('全ページで canonical がちょうど 1 つで、SITE_URL と自分のパス', () => {
  expect(
    failing(
      (page) =>
        page.canonicals.length === 1 &&
        decodeURIComponent(page.canonicals[0]) === SITE_URL + page.path,
    ),
  ).toEqual([])
})

test('canonical のパスは postPath() と同じエンコード（大文字の %XX）', () => {
  expect(failing((page) => page.canonicals[0] === canonicalOf(page))).toEqual(
    [],
  )
})

const entries = new Map(
  valid(load('src/content').posts).map((entry) => [
    `/${entry.data.type}/${entry.data.slug}/`,
    entry,
  ]),
)

test('記事の description は excerpt（なければサイトの説明文）', () => {
  expect(
    failing((page) => {
      const entry = entries.get(page.path)
      return (
        !entry ||
        page.meta('name', 'description')[0] ===
          (entry.data.excerpt ?? SITE_DESCRIPTION)
      )
    }),
  ).toEqual([])
})

// 記事の excerpt は本文のコードの文字（<meta …>、=>、&#9312; など）をそのまま含むことがあるので、記事以外で見る
test('記事以外の description が空でなく、タグや文字参照が残っていない', () => {
  expect(
    failing((page) => {
      if (entries.has(page.path)) return true
      const [description] = page.meta('name', 'description')
      return description?.trim() && !/[<>]|&#?\w+;/.test(description)
    }),
  ).toEqual([])
})

test('og:url が canonical と同じで、OGP は property="og:*" だけで出す', () => {
  expect(
    failing(
      (page) =>
        page.meta('property', 'og:url')[0] === page.canonicals[0] &&
        page.nameOg.length === 0,
    ),
  ).toEqual([])
})

test('og:image は絶対 URL で、その画像が dist/ にある', () => {
  expect(
    failing((page) => {
      const image = page.meta('property', 'og:image')[0] ?? ''
      return (
        /^\/(og\/[\w-]+\.png|ogp\.png)$/.test(image.slice(SITE_URL.length)) &&
        image.startsWith(`${SITE_URL}/`) &&
        existsSync(join(DIST, image.slice(SITE_URL.length)))
      )
    }),
  ).toEqual([])
})

test('twitter:card は summary_large_image', () => {
  expect(
    failing(
      (page) => page.meta('name', 'twitter:card')[0] === 'summary_large_image',
    ),
  ).toEqual([])
})

test('BlogPosting は記事ページだけに、1 つずつある', () => {
  const isArticle = (path: string) => /^\/(tip|clip|lab)\/[^/]+\/$/.test(path)
  expect(
    failing(({ path, jsonLd }) => {
      const posting = jsonLd.filter((json) =>
        /"@type":"BlogPosting"/.test(json),
      )
      return isArticle(path)
        ? jsonLd.length === 1 && posting.length === 1
        : posting.length === 0
    }),
  ).toEqual([])
})

test('記事の BlogPosting は frontmatter と canonical に合う（06 の 2.5）', () => {
  const found = pages.flatMap((page) => {
    const entry = entries.get(page.path)
    if (!entry) return []
    const data = JSON.parse(page.jsonLd[0])
    const problems = [
      data['@type'] !== 'BlogPosting' && '@type',
      data.headline !== entry.data.title && 'headline',
      data.datePublished !== toIsoJst(entry.data.date) && 'datePublished',
      data.dateModified !== toIsoJst(lastModified(entry)) && 'dateModified',
      !data.author?.name && 'author.name',
      (data.mainEntityOfPage?.['@id'] ?? data.url) !== page.canonicals[0] &&
        'mainEntityOfPage',
      !String(data.image ?? '').startsWith(`${SITE_URL}/`) && 'image',
    ].filter(Boolean)
    return problems.length ? [`${page.file}: ${problems.join(', ')}`] : []
  })
  expect([...entries.values()].filter(isLegacy)).toHaveLength(1030)
  expect(found).toEqual([])
})
