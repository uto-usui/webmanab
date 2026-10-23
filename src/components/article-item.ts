// ブラウザの script（infinite-list.ts）からも読むので、型のほかは astro:content を引き込むものを import しない
import type { ListItem } from '../lib/list-json'

/** clip のタイトルは外部サイトへ新しいタブで。clipUrl のない clip 2 件（form、the-wing）は記事ページへ */
export const titleLink = (item: Pick<ListItem, 'path' | 'clipUrl'>) =>
  item.clipUrl
    ? { href: item.clipUrl, external: true }
    : { href: item.path, external: false }
