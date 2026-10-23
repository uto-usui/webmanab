// 実際の記事から作るもの（ページの一覧、カテゴリ、アイキャッチ）を全件で確かめる（03 の 10 章、08 の 1.2）。
// 関数ごとの細かい分岐は test/unit が見本の入力で見る
import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, test } from 'vitest'
import { eyecatchKey, renderEyecatch } from '../../src/lib/eyecatch'
import { sitePaths } from '../../src/lib/posts'
import { EYECATCH_KEYS, primaryTagKey } from '../../src/lib/primary-tag'
import { termListSchema } from '../../src/lib/schema'
import { load, valid } from './load'

describe.skipIf(!existsSync('src/content/posts'))(
  'src/content から作るもの',
  () => {
    const { posts, terms } = load('src/content')
    const entries = valid(posts).map(({ data }) => ({ data }))
    const name = ({ data }: (typeof entries)[number]) =>
      `${data.type}/${data.slug}`

    test('ページの一覧が旧サイトの URL 1323 件と一致する', () => {
      const paths = sitePaths(entries, {
        tips: termListSchema.parse(terms.tips),
        clips: termListSchema.parse(terms.clips),
        labs: termListSchema.parse(terms.labs),
      })
      // 旧一覧は小文字の %e3…、postPath() は大文字の %E3… なので、デコードしてから比べる
      const legacy = readFileSync('test/fixtures/legacy-urls.txt', 'utf8')
        .split('\n')
        .filter(Boolean)
        .map((url) => decodeURIComponent(url))
      expect(paths).toHaveLength(1323)
      expect(new Set(paths.map((path) => decodeURIComponent(path)))).toEqual(
        new Set(legacy),
      )
    })

    test('primaryTag の種類の数（空文字を含む）', () => {
      const raw = entries.map(({ data }) => data.primaryTag)
      expect(new Set(raw).size).toBe(179)
      expect(new Set(raw.map((tag) => tag.toLowerCase())).size).toBe(168)
      expect(new Set(raw.map(primaryTagKey)).size).toBe(163)
    })

    test('全記事が 23 のカテゴリのどれかに入り、URL の値と空の値は汎用になる', () => {
      expect(
        entries.filter(
          ({ data }) => !EYECATCH_KEYS.includes(eyecatchKey(data)),
        ),
      ).toEqual([])
      const odd = entries
        .filter(
          ({ data }) => data.primaryTag === '' || data.primaryTag.includes('/'),
        )
        .map((entry) => [name(entry), eyecatchKey(entry.data)])
      expect(odd).toEqual([
        ['clip/exclusieve-woningen-hondersalting-makelaars', 'generic-clip'],
        ['clip/humbert-poyet', 'generic-clip'],
        ['clip/logo-wt-en', 'generic-clip'],
      ])
    })

    describe('アイキャッチ', () => {
      // readdirSync の順は OS で変わるので、id 順に並べてから指紋を取る
      const svgs = [...entries]
        .sort((a, b) => a.data.id - b.data.id)
        .flatMap(({ data }) => [
          renderEyecatch(data),
          renderEyecatch(data, { variant: 'nav' }),
        ])

      test('1030 件の通常とナビ用がすべて違う絵', () => {
        expect(new Set(svgs).size).toBe(2060)
      })

      test('1 枚 8KB 以内', () => {
        expect(svgs.filter((svg) => svg.length > 8 * 1024)).toEqual([])
      })

      // 絵柄か記事を変えたときは、この値を更新する（mac と linux で同じ値になることは 05 で確かめてある）
      test('全件の指紋が変わっていない', () => {
        expect(createHash('sha256').update(svgs.join('\n')).digest('hex')).toBe(
          '3ba8189949ea01aa18774c90e779efe1806923fea80d2287a379287d4e7fd4c2',
        )
      })
    })
  },
)
