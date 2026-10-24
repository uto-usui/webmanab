// 無限スクロールが読む静的 JSON（03 の 4.2）。1 件の表示に要るものだけを入れる
import { formatDate, toIsoJst } from './date'
import { entryPath, paginate, postsInTerm, sortByDateDesc } from './posts'
import { thumbnailFor } from './post-image'
import type { PostData } from './schema'
import { POST_TYPES, TAXONOMIES, type PostType, type Taxonomy } from './site'

type Entry = {
  data: Pick<
    PostData,
    | 'id'
    | 'type'
    | 'slug'
    | 'title'
    | 'date'
    | 'primaryTag'
    | 'terms'
    | 'clipUrl'
    | 'image'
  >
}

export type ListItem = {
  type: PostType
  slug: string
  path: string
  title: string
  /** `2020-03-22T00:26:34+09:00` */
  date: string
  /** `2020-03-22`。一覧に出す文字 */
  dateLabel: string
  primaryTag: string
  clipUrl?: string
  /** サムネイルの URL（clip のスクショか、アイキャッチ SVG） */
  eyecatch: string
}

export type ListPage = {
  items: ListItem[]
  page: number
  last: number
  total: number
}

export const listItem = ({ data }: Entry): ListItem => ({
  type: data.type,
  slug: data.slug,
  path: entryPath({ data }),
  title: data.title,
  date: toIsoJst(data.date),
  dateLabel: formatDate(data.date),
  primaryTag: data.primaryTag,
  ...(data.clipUrl === undefined ? {} : { clipUrl: data.clipUrl }),
  eyecatch: thumbnailFor(data),
})

/** 新しい順に 8 件ずつ。0 件でも 1 ページ目（items が空）を出す */
export const listPages = (entries: readonly Entry[]): ListPage[] => {
  const pages = paginate(sortByDateDesc(entries))
  return pages.map((items, i) => ({
    items: items.map(listItem),
    page: i + 1,
    last: pages.length,
    total: entries.length,
  }))
}

/** 一覧ページの data-endpoint に入れる値。`${endpoint}${page}.json` を読む */
export const typeDataEndpoint = (type: PostType) => `/data/${type}/`
export const termDataEndpoint = (tax: Taxonomy, id: number) =>
  `/data/${tax}/${id}/`

/** `data/[type]/[page].json.ts` の getStaticPaths 用 */
export const typeDataStaticPaths = (entries: readonly Entry[]) =>
  POST_TYPES.flatMap((type) =>
    listPages(entries.filter((entry) => entry.data.type === type)).map(
      (body) => ({
        params: { type, page: String(body.page) },
        props: { body },
      }),
    ),
  )

/** `data/[tax]/[id]/[page].json.ts` の getStaticPaths 用。投稿 0 件のタームも出す */
export const termDataStaticPaths = (
  entries: readonly Entry[],
  terms: Readonly<Record<Taxonomy, readonly { id: number }[]>>,
) =>
  TAXONOMIES.flatMap((tax) =>
    terms[tax].flatMap(({ id }) =>
      listPages(postsInTerm(entries, tax, id)).map((body) => ({
        params: { tax, id: String(id), page: String(body.page) },
        props: { body },
      })),
    ),
  )
