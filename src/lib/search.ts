// 検索ページ（#46）のうち、ブラウザの API に触らない部分
import type { ListItem } from './list-json'
import { POST_TYPES, type PostType } from './site'

/** 一覧と同じく 8 件ずつ出す */
export const SEARCH_PAGE_SIZE = 8

export type SearchQuery = { q: string; type?: PostType }

const isPostType = (value: string | null): value is PostType =>
  (POST_TYPES as readonly (string | null)[]).includes(value)

/** `?q=grid&type=clip` を読む。知らない type は絞り込まない */
export const readQuery = (search: string): SearchQuery => {
  const params = new URLSearchParams(search)
  const q = (params.get('q') ?? '').trim()
  const type = params.get('type')
  return isPostType(type) ? { q, type } : { q }
}

/** Pagefind の結果の meta（SearchMeta.astro）から、一覧のカードの値に戻す。読めなければ null */
export const itemFromMeta = (
  meta: Record<string, string | undefined>,
): ListItem | null => {
  try {
    const item: unknown = JSON.parse(meta.item ?? '')
    if (
      typeof item === 'object' &&
      item !== null &&
      'path' in item &&
      typeof item.path === 'string' &&
      'title' in item &&
      typeof item.title === 'string'
    )
      return item as ListItem
  } catch {
    // 下で null を返す
  }
  return null
}

/** 件数の表示。読み上げにも使う */
export const statusText = (count: number) =>
  count === 0 ? '見つかりませんでした' : `${count} 件`
