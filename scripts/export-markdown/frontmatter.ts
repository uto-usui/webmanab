// 記事 1 件の frontmatter とファイル名（04-markdown-exporter.md の 5. と 6.）
import { decodeHTML } from 'entities'
import { Document, isMap, isScalar, isSeq } from 'yaml'
import type { PostType, SnapshotPost } from './snapshot.ts'
import { collapseWhitespace, trimWhitespace } from './whitespace.ts'

export interface Term {
  id: number
  name: string
  slug: string
}

export interface Frontmatter {
  id: number
  type: PostType
  slug: string
  title: string
  navTitle?: string
  date: string
  modified?: string
  excerpt?: string
  primaryTag: string
  terms: Term[]
  clipUrl?: string
  demoUrl?: string
  legacy?: { prev: string | null; next: string | null }
}

export const TAXONOMY = { tip: 'tips', clip: 'clips', lab: 'labs' } as const

// 単一ページの images.alt に入っている WP REST API の生データのうち、使うもの
interface WpRaw {
  modified?: string
  date_gmt?: string
  modified_gmt?: string
}
export const wpRaw = (p: SnapshotPost): WpRaw => (p.images?.alt ?? {}) as WpRaw

const text = (s: unknown) =>
  trimWhitespace(collapseWhitespace(decodeHTML(String(s ?? ''))))
const plain = (html: unknown) =>
  text(String(html ?? '').replace(/<[^>]*>/g, ' '))

export function fileName(p: Pick<SnapshotPost, 'id' | 'slug'>): string {
  const slug = decodeURIComponent(p.slug)
  // 日本語や見えない文字（U+202F）をファイル名に入れない。先頭の _ は除外の書き方に引っかかりやすいので避ける
  return /^[a-z0-9][a-z0-9_-]*$/.test(slug) ? slug : `post-${p.id}`
}

const navSlug = (n: unknown) =>
  n && typeof n === 'object' && !Array.isArray(n) && 'slug' in n && n.slug
    ? decodeURIComponent(String(n.slug))
    : null

const postKey = (type: PostType, slug: string) =>
  `${type}/${decodeURIComponent(slug)}`

// 旧サイトの前後記事ナビは、隣の記事の state にある prev/next.title を v-html で出していた。
// これは WP の生の post_title で、wptexturize がかかっていない（' や - のまま）ので、
// 記事の title（title.rendered）と表示が違う記事がある
export function collectNavTitles(posts: SnapshotPost[]): Map<string, string> {
  const titles = new Map<string, string>()
  for (const p of posts) {
    for (const n of [p.prev, p.next]) {
      if (!n || typeof n !== 'object' || !('slug' in n) || !n.slug) continue
      const key = postKey(p.type, String(n.slug))
      const title = text('title' in n ? n.title : '')
      const seen = titles.get(key)
      if (seen !== undefined && seen !== title) {
        throw new Error(`前後記事のタイトルが食い違っています: ${key}`)
      }
      titles.set(key, title)
    }
  }
  return titles
}

export function frontmatter(
  p: SnapshotPost,
  navTitles: ReadonlyMap<string, string> = new Map(),
): Frontmatter {
  const title = text(p.title)
  const navTitle = navTitles.get(postKey(p.type, p.slug))
  const f = p.fields ?? {}
  // 単一ページの生データにしかないので、一覧からしか取れなかった 2 件にはない
  const { modified } = wpRaw(p)
  // WP が文字数で切ったあとに付けた ..more を外す
  const excerpt = trimWhitespace(plain(p.excerpt).replace(/\.\.more$/, ''))
  const terms = p.terms?.[TAXONOMY[p.type]]
  // clip/the-gigi は clip-url が空で、demo-url に同じ役割の URL が入っている
  const clipUrl =
    p.type === 'clip' ? String(f['clip-url'] || f['demo-url'] || '') : ''
  // lab/effects-to-youtube-videos は「https//」とコロンが抜けている
  const demoUrl =
    p.type !== 'clip' && f['demo-true'] && f['demo-url']
      ? String(f['demo-url']).replace(/^(https?)\/\//, '$1://')
      : ''
  return {
    id: p.id,
    type: p.type,
    slug: decodeURIComponent(p.slug),
    title,
    // 旧ナビの表示が title と違う記事にだけ出す
    ...(navTitle && navTitle !== title ? { navTitle } : {}),
    date: `${p.date}+09:00`,
    ...(modified ? { modified: `${modified}+09:00` } : {}),
    ...(excerpt ? { excerpt } : {}),
    // 旧一覧カードが文字列をそのまま表示していたので、前後の空白だけ詰める。表記ゆれはアイキャッチ側で寄せる
    primaryTag: trimWhitespace(String(f['primary-tag'] ?? '')),
    terms: (Array.isArray(terms) ? terms : []).map((t) => ({
      id: t.term_id,
      name: text(t.name),
      slug: decodeURIComponent(t.slug),
    })),
    // clip/the-wing の clip-url は「v」の 1 文字で入力ミス
    ...(/^https?:\/\//.test(clipUrl) ? { clipUrl } : {}),
    ...(demoUrl ? { demoUrl } : {}),
    // 記事ページがなかった 2 件は旧サイトの前後記事を確かめられないので出さない
    ...(p.source === 'single'
      ? { legacy: { prev: navSlug(p.prev), next: navSlug(p.next) } }
      : {}),
  }
}

export function toYaml(fm: Frontmatter): string {
  const doc = new Document(fm)
  const scalar = (node: unknown, type: 'QUOTE_DOUBLE' | 'PLAIN') => {
    if (isScalar(node)) node.type = type
  }
  // 記号（: # 「 など）が多く、913 のような数字だけの slug もあるので、文字列は常にダブルクォート
  for (const k of ['slug', 'title', 'navTitle', 'excerpt', 'primaryTag'])
    scalar(doc.get(k, true), 'QUOTE_DOUBLE')
  // 日付は YAML のタイムスタンプとして書く
  for (const k of ['date', 'modified']) scalar(doc.get(k, true), 'PLAIN')
  const terms = doc.get('terms', true)
  if (isSeq(terms)) {
    for (const item of terms.items) {
      if (!isMap(item)) continue
      item.flow = true
      scalar(item.get('name', true), 'QUOTE_DOUBLE')
      scalar(item.get('slug', true), 'QUOTE_DOUBLE')
    }
  }
  return doc.toString({ lineWidth: 0 })
}

export function postFile(fm: Frontmatter, md: string): string {
  return `---\n${toYaml(fm)}---\n${md ? `\n${md}` : ''}`
}
