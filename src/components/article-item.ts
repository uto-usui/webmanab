// ブラウザの script（infinite-list.ts）からも読むので、astro:content を引き込むものは import しない
import type { PostType } from '../lib/site'

/**
 * 一覧のカード 1 件に要るもの。無限スクロールの静的 JSON の items（03 の 4.2）と同じ形にして、
 * ビルド時の最初の 8 件と、ブラウザで足す 9 件目以降を同じ値で描く
 */
export interface ArticleItem {
  type: PostType
  path: string
  title: string
  // 旧サイトは表示と <time datetime> の両方に YYYY-MM-DD を使っていた
  dateLabel: string
  primaryTag: string
  clipUrl?: string
  eyecatch: string
}

/** clip のタイトルは外部サイトへ新しいタブで。clipUrl のない clip 2 件は記事ページへ */
export const titleLink = (item: Pick<ArticleItem, 'path' | 'clipUrl'>) =>
  item.clipUrl
    ? { href: item.clipUrl, external: true }
    : { href: item.path, external: false }
