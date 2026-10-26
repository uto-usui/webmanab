// ブラウザの script（infinite-list.ts）からも読むので、型のほかは astro:content を引き込むものを import しない
import type { ListItem } from '../lib/list-json'

/** clip のタイトルは外部サイトへ新しいタブで。clipUrl のない clip 2 件（form、the-wing）は記事ページへ */
export const titleLink = (item: Pick<ListItem, 'path' | 'clipUrl'>) =>
  item.clipUrl
    ? { href: item.clipUrl, external: true }
    : { href: item.path, external: false }

/**
 * サムネイルのリンク（A11Y-02）。行き先がタイトルと同じなら読み上げと Tab から外す。
 * clip のタイトルは外のサイトへ行くので、記事ページへ行くのはサムネイルだけになり、名前を付ける
 */
export const thumbLink = (item: Pick<ListItem, 'title' | 'clipUrl'>) =>
  item.clipUrl
    ? { 'aria-label': `${item.title} の記事` }
    : ({ tabindex: '-1', 'aria-hidden': 'true' } as const)
