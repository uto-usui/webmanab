// 実データで、無限スクロールの JSON に抜けも重複もないことを確かめる（08 の 1.5 の「無限スクロール」を lib の段階で）
import { existsSync } from 'node:fs'
import { describe, expect, test } from 'vitest'
import {
  termDataStaticPaths,
  typeDataStaticPaths,
} from '../../src/lib/list-json'
import { entryPath, postsInTerm } from '../../src/lib/posts'
import { termListSchema } from '../../src/lib/schema'
import { POST_TYPES, TAXONOMIES } from '../../src/lib/site'
import { load, valid } from './load'

describe.skipIf(!existsSync('src/content/posts'))(
  'src/content の一覧 JSON',
  () => {
    const { posts, terms: rawTerms } = load('src/content')
    const entries = valid(posts)
    const terms = {
      tips: termListSchema.parse(rawTerms.tips),
      clips: termListSchema.parse(rawTerms.clips),
      labs: termListSchema.parse(rawTerms.labs),
    }

    const covers = (
      pages: { body: { items: { path: string }[]; total: number } }[],
      expected: string[],
    ) => {
      const paths = pages.flatMap(({ body }) =>
        body.items.map((item) => item.path),
      )
      expect(pages.every(({ body }) => body.total === expected.length)).toBe(
        true,
      )
      expect(paths).toEqual(expected)
    }

    test('type ごとの JSON は、その type の全記事を新しい順に 1 回ずつ含む', () => {
      const all = typeDataStaticPaths(entries)
      for (const type of POST_TYPES) {
        const expected = entries
          .filter(({ data }) => data.type === type)
          .sort((a, b) => b.data.date.getTime() - a.data.date.getTime())
          .map(entryPath)
        covers(
          all
            .filter(({ params }) => params.type === type)
            .map(({ props }) => props),
          expected,
        )
      }
    })

    test('タームごとの JSON は、そのタームの全記事を 1 回ずつ含む', () => {
      const all = termDataStaticPaths(entries, terms)
      for (const tax of TAXONOMIES) {
        for (const { id } of terms[tax]) {
          covers(
            all
              .filter(
                ({ params }) => params.tax === tax && params.id === String(id),
              )
              .map(({ props }) => props),
            postsInTerm(entries, tax, id).map(entryPath),
          )
        }
      }
    })
  },
)
