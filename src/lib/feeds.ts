// sitemap.xml / feed.xml / robots.txt の中身を作る。URL はすべて SITE_URL（Astro.site）から組み立てる
import { toIsoJst } from './date'
import { entryPath, postsInTerm, sitePaths } from './posts'
import type { PostData } from './schema'
import { POST_TYPES, TAXONOMIES, type Taxonomy } from './site'
import { termPath } from './terms'

type Dated = { data: Pick<PostData, 'type' | 'slug' | 'date' | 'modified'> }
type Entry = Dated & { data: Pick<PostData, 'terms'> }

/**
 * 記事が最後に変わった日時。101 本は modified が date より前（予約投稿で公開日のほうが後）なので、
 * 新しいほうを使う
 */
export const lastModified = ({ data }: Dated) =>
  data.modified && data.modified > data.date ? data.modified : data.date

const newest = (entries: readonly Dated[]) =>
  entries.reduce<Date | undefined>((latest, entry) => {
    const date = lastModified(entry)
    return latest === undefined || date > latest ? date : latest
  }, undefined)

export type SitemapEntry = { path: string; lastmod?: Date }

/**
 * sitemap の URL と lastmod。並びと URL は sitePaths() と同じ。一覧ページの lastmod は
 * 載っている記事のうち最新のもので、投稿 0 件のターム（labs 332 / 333）には付けない
 */
export const sitemapEntries = (
  entries: readonly Entry[],
  terms: Readonly<Record<Taxonomy, readonly { id: number }[]>>,
): SitemapEntry[] => {
  const byPath = new Map<string, Date | undefined>([
    ['/', newest(entries)],
    ...POST_TYPES.map(
      (type) =>
        [
          `/${type}/`,
          newest(entries.filter((e) => e.data.type === type)),
        ] as const,
    ),
    ...entries.map((entry) => [entryPath(entry), lastModified(entry)] as const),
    ...TAXONOMIES.flatMap((tax) =>
      terms[tax].map(
        ({ id }) =>
          [termPath(tax, id), newest(postsInTerm(entries, tax, id))] as const,
      ),
    ),
  ])
  return sitePaths(entries, terms).map((path) => {
    const lastmod = byPath.get(path)
    return lastmod === undefined ? { path } : { path, lastmod }
  })
}

const escapeXml = (s: string) =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

export const sitemapXml = (entries: readonly SitemapEntry[], site: URL) =>
  [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries.map(({ path, lastmod }) => {
      const loc = `<loc>${escapeXml(new URL(path, site).href)}</loc>`
      return lastmod === undefined
        ? `<url>${loc}</url>`
        : `<url>${loc}<lastmod>${toIsoJst(lastmod)}</lastmod></url>`
    }),
    '</urlset>',
    '',
  ].join('\n')

export const robotsTxt = (site: URL) =>
  `User-agent: *\nAllow: /\n\nSitemap: ${new URL('/sitemap.xml', site).href}\n`

/**
 * 本文の HTML のサイト内リンク（/ で始まる href と src）を絶対 URL にする。RSS リーダーでは
 * 相対のままだと切れる。開始タグの中だけを見るので、コードの中の文字（&lt; でエスケープ済み）は変えない
 */
export const absolutizeLinks = (html: string, site: URL) =>
  html.replace(/<[a-zA-Z][^>]*>/g, (tag) =>
    tag.replace(
      /(\s(?:href|src)=")(\/(?!\/)[^"]*)"/g,
      (_, attr: string, path: string) => `${attr}${new URL(path, site).href}"`,
    ),
  )

export const FEED_SIZE = 50

type FeedEntry = {
  data: Pick<PostData, 'type' | 'slug' | 'title' | 'date' | 'excerpt'>
  rendered?: { html: string }
}

/** feed.xml の項目。渡した順のまま、先頭から 50 件 */
export const feedItems = (entries: readonly FeedEntry[], site: URL) =>
  entries.slice(0, FEED_SIZE).map((entry) => ({
    title: entry.data.title,
    link: new URL(entryPath(entry), site).href,
    pubDate: entry.data.date,
    ...(entry.data.excerpt === undefined
      ? {}
      : { description: entry.data.excerpt }),
    ...(entry.rendered === undefined
      ? {}
      : { content: absolutizeLinks(entry.rendered.html, site) }),
  }))
