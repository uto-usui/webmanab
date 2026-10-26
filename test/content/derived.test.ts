// 実際の記事から作るもの（ページの一覧、カテゴリ、アイキャッチ）を全件で確かめる（03 の 10 章、08 の 1.2）。
// 関数ごとの細かい分岐は test/unit が見本の入力で見る
import { createHash } from 'node:crypto'
import { existsSync } from 'node:fs'
import { describe, expect, test } from 'vitest'
import { eyecatchKey, renderEyecatch } from '../../src/lib/eyecatch'
import { sitePaths } from '../../src/lib/posts'
import { EYECATCH_KEYS, primaryTagKey } from '../../src/lib/primary-tag'
import { termListSchema } from '../../src/lib/schema'
import { load, valid } from './load'
import { allowedPaths, isLegacy, legacyPaths } from './pages'

describe.skipIf(!existsSync('src/content/posts'))(
  'src/content から作るもの',
  () => {
    const { posts, terms } = load('src/content')
    const all = valid(posts).map(({ data }) => ({ data }))
    // 件数と指紋は旧記事だけで固定する。新しい記事を足すたびに値を変えなくて済むように
    const entries = all.filter(isLegacy)
    const name = ({ data }: (typeof entries)[number]) =>
      `${data.type}/${data.slug}`

    test('ページの一覧に旧サイトの URL 1323 件がすべてあり、ほかは許したページだけ', () => {
      const paths = sitePaths(all, {
        tips: termListSchema.parse(terms.tips),
        clips: termListSchema.parse(terms.clips),
        labs: termListSchema.parse(terms.labs),
      })
      // 旧一覧は小文字の %e3…、postPath() は大文字の %E3… なので、デコードしてから比べる
      const decoded = new Set(paths.map((path) => decodeURIComponent(path)))
      expect(decoded.size).toBe(paths.length)
      expect([...legacyPaths].filter((path) => !decoded.has(path))).toEqual([])
      const allowed = allowedPaths(all, terms)
      expect([...decoded].filter((path) => !allowed.has(path))).toEqual([])
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

      test('旧記事 1030 件の通常とナビ用がすべて違う絵', () => {
        expect(new Set(svgs).size).toBe(2060)
      })

      test('新しい記事を含めても、すべて違う絵', () => {
        const every = all.flatMap(({ data }) => [
          renderEyecatch(data),
          renderEyecatch(data, { variant: 'nav' }),
        ])
        expect(new Set(every).size).toBe(all.length * 2)
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
