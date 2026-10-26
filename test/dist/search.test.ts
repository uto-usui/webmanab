// 検索の索引（#46）。動きは e2e/smoke/search.spec.ts が見る
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { expect, test } from 'vitest'
import { listItem } from '../../src/lib/list-json'
import { entryPath } from '../../src/lib/posts'
import { load, valid } from '../content/load'
import { DIST, distFiles, readDist } from './dist.ts'

const entries = valid(load('src/content').posts)

test('pagefind.js があり、索引に入ったのは記事のページだけ', () => {
  expect(existsSync(join(DIST, 'pagefind/pagefind.js'))).toBe(true)
  const entry = JSON.parse(readDist('pagefind/pagefind-entry.json'))
  expect(entry.languages.ja.page_count).toBe(entries.length)
})

test('data-pagefind-body があるのは記事のページだけ', () => {
  const found = distFiles('**/*.html')
    .filter((file) => !/^(tip|clip|lab)\/[^/]+\/index\.html$/.test(file))
    .filter((file) => readDist(file).includes('data-pagefind-body'))
  expect(found).toEqual([])
})

test('記事のページは、一覧と同じカードの値を索引に渡す', () => {
  const unescape = (value: string) =>
    value
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
  const mismatched = entries.filter((entry) => {
    const file = `${decodeURIComponent(entryPath(entry)).slice(1)}index.html`
    const content = readDist(file).match(
      /<meta name="webmanab:search-item" content="([^"]*)"/,
    )?.[1]
    return (
      !content ||
      JSON.stringify(JSON.parse(unescape(content))) !==
        JSON.stringify(listItem(entry))
    )
  })
  expect(mismatched.map(({ data }) => `${data.type}/${data.slug}`)).toEqual([])
})
