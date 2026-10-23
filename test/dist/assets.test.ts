// 無限スクロールの JSON、アイキャッチの SVG、OGP の PNG（08 の 1.5）。容量は size.test.ts
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, test } from 'vitest'
import { EYECATCH_KEYS } from '../../src/lib/primary-tag'
import { load, valid } from '../content/load'
import { DIST, distFiles, readDist } from './dist.ts'

const entries = valid(load('src/content').posts)

describe('無限スクロールの JSON', () => {
  const lists = Map.groupBy(distFiles('data/**/*.json'), (file) =>
    file.replace(/\/\d+\.json$/, ''),
  )

  test('type 3 つとターム 289 個（tips 107、clips 156、labs 26）の一覧がある', () => {
    expect(lists.size).toBe(3 + 107 + 156 + 26)
  })

  describe.each([...lists])('%s', (list, files) => {
    type Page = {
      items: { path: string; eyecatch: string }[]
      page: number
      last: number
      total: number
    }
    const pages = files
      .map((file) => JSON.parse(readDist(file)) as Page)
      .sort((a, b) => a.page - b.page)

    test('1 から last までのページがそろい、total が載っている記事の数と一致する', () => {
      expect(pages.map(({ page }) => page)).toEqual(
        Array.from({ length: pages[0].last }, (_, i) => i + 1),
      )
      const paths = pages.flatMap(({ items }) => items.map(({ path }) => path))
      expect(new Set(paths).size).toBe(paths.length)
      expect(pages.every(({ total }) => total === paths.length)).toBe(true)
    })

    test('アイキャッチの SVG が dist/ にある', () => {
      const missing = pages
        .flatMap(({ items }) => items.map(({ eyecatch }) => eyecatch))
        .filter((path) => !existsSync(join(DIST, path)))
      expect(missing).toEqual([])
    })
  })
})

test('アイキャッチの SVG は記事ごとに通常とナビ用の 2 枚で、ほかにない', () => {
  const expected = entries
    .flatMap(({ data }) => [
      `eyecatch/${data.type}/${data.id}.svg`,
      `eyecatch/${data.type}/${data.id}-nav.svg`,
    ])
    .sort()
  expect(distFiles('eyecatch/**/*.svg')).toEqual(expected)
})

test('OGP の PNG はカテゴリごとの 23 枚', () => {
  expect(distFiles('og/*.png')).toEqual(
    EYECATCH_KEYS.map((key) => `og/${key}.png`).sort(),
  )
})
