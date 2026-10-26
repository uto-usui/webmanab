// <head> に出す値をページの種類ごとに作る。Head.astro はこの結果をタグにするだけ。
// 絶対 URL はすべて SITE_URL（Astro.site）から作り、旧ドメインを書き込まない
import { toIsoJst } from './date'
import { eyecatchFor } from './eyecatch/index.ts'
import { lastModified } from './feeds'
import { entryPath } from './posts'
import type { PostData } from './schema'
import {
  archiveDescription,
  pageTitle,
  POST_TYPE_OF,
  SITE_DESCRIPTION,
  SITE_NAME,
  type PostType,
  type Taxonomy,
} from './site'
import { termPath } from './terms'

export const AUTHOR_NAME = 'uto usui'
export const TWITTER_SITE = '@uto_ao'
export const DEFAULT_OG_IMAGE = '/ogp.png'

export type HeadInput =
  | { kind: 'top' }
  | { kind: 'search' }
  | { kind: 'type'; type: PostType }
  | { kind: 'term'; tax: Taxonomy; id: number }
  | {
      kind: 'post'
      entry: {
        data: Pick<
          PostData,
          | 'id'
          | 'type'
          | 'slug'
          | 'title'
          | 'date'
          | 'modified'
          | 'excerpt'
          | 'primaryTag'
          | 'terms'
        >
      }
    }

export type MetaTag = ({ name: string } | { property: string }) & {
  content: string
}

export type HeadData = {
  title: string
  description: string
  canonical: string
  meta: MetaTag[]
  /** 記事ページだけ。<script type="application/ld+json"> の中身（エスケープ済み） */
  jsonLd?: string
}

const pageOf = (
  input: HeadInput,
  site: URL,
): { title: string; description: string; path: string; image?: string } => {
  switch (input.kind) {
    case 'top':
      return { title: pageTitle(), description: SITE_DESCRIPTION, path: '/' }
    case 'search':
      return {
        title: pageTitle('search'),
        description: 'search page',
        path: '/search/',
      }
    case 'type':
      return {
        title: pageTitle(input.type),
        description: archiveDescription(input.type),
        path: `/${input.type}/`,
      }
    case 'term': {
      // ターム一覧も title と description は tips ではなく tip（旧サイトと同じ）
      const type = POST_TYPE_OF[input.tax]
      return {
        title: pageTitle(type),
        description: archiveDescription(type),
        path: termPath(input.tax, input.id),
      }
    }
    case 'post': {
      const { data } = input.entry
      return {
        title: pageTitle(data.title),
        // excerpt のない記事（clip の多く）はサイトの説明文にする。旧サイトは空の <p> を入れていた
        description: data.excerpt ?? SITE_DESCRIPTION,
        path: entryPath(input.entry),
        image: new URL(eyecatchFor(data).og, site).href,
      }
    }
  }
}

/** JSON を <script> に埋めるときに `</script>` で閉じられないよう、< をエスケープする */
export const serializeJsonLd = (value: unknown) =>
  JSON.stringify(value).replace(/</g, '\\u003c')

export const blogPosting = (
  entry: Extract<HeadInput, { kind: 'post' }>['entry'],
  { canonical, image }: { canonical: string; image: string },
) => ({
  '@context': 'https://schema.org',
  '@type': 'BlogPosting',
  headline: entry.data.title,
  ...(entry.data.excerpt === undefined
    ? {}
    : { description: entry.data.excerpt }),
  datePublished: toIsoJst(entry.data.date),
  dateModified: toIsoJst(lastModified(entry)),
  author: { '@type': 'Person', name: AUTHOR_NAME },
  publisher: { '@type': 'Organization', name: SITE_NAME },
  mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
  url: canonical,
  image,
})

export const buildHead = (input: HeadInput, site: URL): HeadData => {
  const page = pageOf(input, site)
  const canonical = new URL(page.path, site).href
  const image = page.image ?? new URL(DEFAULT_OG_IMAGE, site).href
  const meta: MetaTag[] = [
    { name: 'description', content: page.description },
    // 旧サイトは name="og:*" と PWA モジュールの property="og:*" が重なっていた。property の 1 組だけにする
    { property: 'og:title', content: page.title },
    { property: 'og:description', content: page.description },
    { property: 'og:locale', content: 'ja_JP' },
    { property: 'og:type', content: 'website' },
    { property: 'og:site_name', content: SITE_NAME },
    { property: 'og:url', content: canonical },
    { property: 'og:image', content: image },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:site', content: TWITTER_SITE },
    { name: 'twitter:title', content: page.title },
    { name: 'twitter:description', content: page.description },
    { name: 'twitter:image', content: image },
  ]
  return {
    title: page.title,
    description: page.description,
    canonical,
    meta,
    ...(input.kind === 'post'
      ? {
          jsonLd: serializeJsonLd(
            blogPosting(input.entry, { canonical, image }),
          ),
        }
      : {}),
  }
}

/** GA4 の測定 ID があるときだけタグの中身を返す。ないときは何も出さない */
export const gtagTags = (id: string | undefined) =>
  id
    ? {
        src: `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`,
        inline: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config',${JSON.stringify(id).replace(/</g, '\\u003c')});`,
      }
    : null

/** AdSense のクライアント ID があるときだけ読み込みの URL を返す */
export const adsenseScriptSrc = (client: string | undefined) =>
  client
    ? `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(client)}`
    : null
