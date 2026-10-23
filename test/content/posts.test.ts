// 記事の Markdown とターム JSON を astro:content を通さずに読み、content.config.ts と同じスキーマで確かめる。
// fixtures では常に走らせ、src/content はエクスポーターの出力を取り込んだあとだけ走らせる
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { parseFrontmatter } from '@astrojs/internal-helpers/frontmatter'
import { describe, expect, test } from 'vitest'
import { neighbors } from '../../src/lib/posts'
import { postSchema, termListSchema, type PostData } from '../../src/lib/schema'
import { POST_TYPES, TAXONOMIES, TAXONOMY_OF } from '../../src/lib/site'

const load = (root: string) => {
  const posts = POST_TYPES.flatMap((dir) => {
    const path = join(root, 'posts', dir)
    if (!existsSync(path)) return []
    return readdirSync(path)
      .filter((file) => file.endsWith('.md'))
      .map((file) => {
        // glob loader と同じパーサー（YAML のタイムスタンプを Date にする）で読む
        const { frontmatter } = parseFrontmatter(
          readFileSync(join(path, file), 'utf8'),
        )
        return {
          dir,
          file,
          frontmatter,
          result: postSchema.safeParse(frontmatter),
        }
      })
  })
  const terms = Object.fromEntries(
    TAXONOMIES.map((tax) => {
      const path = join(root, 'terms', `${tax}.json`)
      return [
        tax,
        existsSync(path) ? JSON.parse(readFileSync(path, 'utf8')) : undefined,
      ]
    }),
  )
  return { posts, terms }
}

const valid = (posts: ReturnType<typeof load>['posts']) =>
  posts.flatMap(({ result }) => (result.success ? [{ data: result.data }] : []))

const describeContent = (name: string, root: string) =>
  describe(name, () => {
    const { posts, terms } = load(root)
    const entries = valid(posts)

    test('全記事がスキーマを通る', () => {
      const failures = posts
        .filter(({ result }) => !result.success)
        .map(({ dir, file, result }) => ({
          file: `${dir}/${file}`,
          issues: result.error?.issues,
        }))
      expect(failures).toEqual([])
    })

    test('type とディレクトリ名が一致する', () => {
      const mismatched = posts
        .filter(({ dir, result }) => result.success && result.data.type !== dir)
        .map(({ dir, file }) => `${dir}/${file}`)
      expect(mismatched).toEqual([])
    })

    test('id と type/slug が重複しない', () => {
      const dup = (keys: string[]) =>
        keys.filter((key, i) => keys.indexOf(key) !== i)
      expect(dup(entries.map(({ data }) => String(data.id)))).toEqual([])
      expect(
        dup(entries.map(({ data }) => `${data.type}/${data.slug}`)),
      ).toEqual([])
    })

    test('ファイル名は slug、使えない文字や先頭の _ があるときは post-<id>', () => {
      const expected = ({ slug, id }: PostData) =>
        /^[a-z0-9_-]+$/.test(slug) && !slug.startsWith('_')
          ? `${slug}.md`
          : `post-${id}.md`
      const mismatched = posts
        .filter(
          ({ file, result }) =>
            result.success && file !== expected(result.data),
        )
        .map(({ dir, file }) => `${dir}/${file}`)
      expect(mismatched).toEqual([])
    })

    test('ターム JSON がスキーマを通り、記事の terms がすべてそこにある', () => {
      for (const tax of TAXONOMIES) {
        expect(
          termListSchema.safeParse(terms[tax]).error?.issues,
        ).toBeUndefined()
      }
      const known = new Set(
        TAXONOMIES.flatMap((tax) =>
          termListSchema
            .parse(terms[tax])
            .map(({ id, name, slug }) => JSON.stringify([tax, id, name, slug])),
        ),
      )
      const missing = entries.flatMap(({ data }) =>
        data.terms
          .map(({ id, name, slug }) =>
            JSON.stringify([TAXONOMY_OF[data.type], id, name, slug]),
          )
          .filter((key) => !known.has(key))
          .map((key) => `${data.type}/${data.slug}: ${key}`),
      )
      expect(missing).toEqual([])
    })
  })

describeContent('fixtures', 'test/fixtures')

const hasContent = existsSync('src/content/posts')

describe.skipIf(!hasContent)('src/content', () => {
  describeContent('スキーマと形', 'src/content')

  const { posts, terms } = load('src/content')
  const entries = valid(posts)

  test('件数が旧データと同じ', () => {
    const count = (type: string) =>
      entries.filter(({ data }) => data.type === type).length
    expect(posts.length).toBe(1030)
    expect([count('tip'), count('clip'), count('lab')]).toEqual([165, 817, 48])
    expect(TAXONOMIES.map((tax) => terms[tax]?.length)).toEqual([107, 156, 26])
  })

  test('legacy を持つ記事は、計算した前後記事が旧サイトと一致する', () => {
    const withLegacy = entries.filter(({ data }) => data.legacy)
    const mismatched = withLegacy.flatMap((entry) => {
      const { prev, next } = neighbors(entries, entry)
      const actual = {
        prev: prev?.data.slug ?? null,
        next: next?.data.slug ?? null,
      }
      const { legacy } = entry.data
      return actual.prev === legacy?.prev && actual.next === legacy?.next
        ? []
        : [{ post: `${entry.data.type}/${entry.data.slug}`, actual, legacy }]
    })
    expect(withLegacy.length).toBe(1028)
    expect(mismatched).toEqual([])
  })
})
