import { getCollection, type CollectionEntry } from 'astro:content'
import type { PostData } from './schema'
import {
  PER_PAGE,
  POST_TYPES,
  TAXONOMIES,
  TAXONOMY_OF,
  type PostType,
  type Taxonomy,
} from './site'
import { getAllTerms, termPath } from './terms'

export type PostEntry = CollectionEntry<'posts'>

// 下の関数は entry の data のうち使うものだけを要求する。テストから素のオブジェクトを渡すため
type EntryWith<K extends keyof PostData> = { data: Pick<PostData, K> }
type Sortable = EntryWith<'type' | 'slug' | 'date'>

/** サイト内のリンク・sitemap・RSS・canonical はすべてこれで作る。日本語 slug はエンコードする */
export const postPath = (type: PostType, slug: string) =>
  `/${type}/${encodeURIComponent(slug)}/`

export const entryPath = (entry: EntryWith<'type' | 'slug'>) =>
  postPath(entry.data.type, entry.data.slug)

export const byDateDesc = (a: Sortable, b: Sortable) =>
  b.data.date.getTime() - a.data.date.getTime()

export const sortByDateDesc = <T extends Sortable>(entries: readonly T[]) =>
  [...entries].sort(byDateDesc)

const isSame = (a: Sortable, b: Sortable) =>
  a.data.type === b.data.type && a.data.slug === b.data.slug

/** 前後記事。prev は 1 つ古い記事、next は 1 つ新しい記事（同じ type の中で日付順） */
export const neighbors = <T extends Sortable>(
  all: readonly T[],
  post: T,
): { prev: T | null; next: T | null } => {
  const list = sortByDateDesc(all.filter((p) => p.data.type === post.data.type))
  const i = list.findIndex((p) => isSame(p, post))
  if (i < 0) {
    throw new Error(`${post.data.type}/${post.data.slug} が一覧にない`)
  }
  return { prev: list[i + 1] ?? null, next: list[i - 1] ?? null }
}

/**
 * 関連記事。同じ type で primaryTag のキーが同じ記事を新しい順に返す。自分自身は除く（README 3 章の 7）。
 * キーの作り方（空白・大文字小文字・打ち間違いの寄せ方）は primary-tag.ts の primaryTagKey を渡す。
 */
export const related = <T extends Sortable & EntryWith<'primaryTag'>>(
  all: readonly T[],
  post: T,
  key: (primaryTag: string) => string,
  limit = 3,
): T[] => {
  const k = key(post.data.primaryTag)
  if (k === '') return []
  return sortByDateDesc(
    all.filter(
      (p) =>
        p.data.type === post.data.type &&
        !isSame(p, post) &&
        key(p.data.primaryTag) === k,
    ),
  ).slice(0, limit)
}

/** ターム一覧ページの記事。新しい順 */
export const postsInTerm = <T extends Sortable & EntryWith<'terms'>>(
  all: readonly T[],
  tax: Taxonomy,
  id: number,
) =>
  sortByDateDesc(
    all.filter(
      (p) =>
        TAXONOMY_OF[p.data.type] === tax &&
        p.data.terms.some((term) => term.id === id),
    ),
  )

/** 8 件ずつに分ける。0 件でも 1 ページ目（空）を返す */
export const paginate = <T>(items: readonly T[], perPage = PER_PAGE): T[][] => {
  const pages: T[][] = []
  for (let i = 0; i < items.length; i += perPage) {
    pages.push(items.slice(i, i + perPage))
  }
  return pages.length > 0 ? pages : [[]]
}

/**
 * 無限スクロールの出し分け。旧 ArticleList は表示中の件数が 8 の倍数のときだけ読み込み口を置き、
 * 次のページがないと分かったときに End を出していた。
 */
export const infiniteListState = (total: number, perPage = PER_PAGE) => ({
  lastPage: Math.max(1, Math.ceil(total / perPage)),
  /** 1 ページ目の件数が 8 の倍数（0 件を含む）のときだけ読み込み口を出す */
  hasLoader: Math.min(total, perPage) % perPage === 0,
  /** 最後のページを読んだあと End を出すか。出さないときは読み込み口ごと消す */
  showEndAfterLast: total % perPage === 0,
})

/** `[type]/[slug].astro` の getStaticPaths 用。params.slug はデコード済みの文字列 */
export const postStaticPaths = <T extends EntryWith<'type' | 'slug'>>(
  entries: readonly T[],
  type: PostType,
) =>
  entries
    .filter((entry) => entry.data.type === type)
    .map((entry) => ({ params: { slug: entry.data.slug }, props: { entry } }))

/** 出すページの一覧（404 と /data/ を除く）。sitemap と URL の一致テストで共有する */
export const sitePaths = (
  entries: readonly Sortable[],
  terms: Readonly<Record<Taxonomy, readonly { id: number }[]>>,
) => [
  '/',
  ...POST_TYPES.map((type) => `/${type}/`),
  ...sortByDateDesc(entries).map(entryPath),
  ...TAXONOMIES.flatMap((tax) => terms[tax].map(({ id }) => termPath(tax, id))),
]

/** 記事を新しい順で返す。type を渡すとその type だけ */
export const getPosts = async (type?: PostType): Promise<PostEntry[]> =>
  sortByDateDesc(
    await getCollection('posts', (entry) =>
      type === undefined ? true : entry.data.type === type,
    ),
  )

export const getSitePaths = async () =>
  sitePaths(await getPosts(), getAllTerms())
