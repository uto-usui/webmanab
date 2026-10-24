// 記事の frontmatter の見本。実データから極端な値を選んで写した（07 の 8.1）。元は各項目の type/slug で、
// excerpt は先頭だけ、legacy は省いた。スキーマが変わると astro check で型エラーになり、読み込むと postSchema にも通す
import type { z } from 'astro/zod'
import type { PostEntry } from '../../lib/posts'
import { postSchema, type PostData } from '../../lib/schema'

export const post = (raw: z.input<typeof postSchema>): PostData =>
  postSchema.parse(raw)

/** 部品が受け取る getCollection() の 1 件の形にする */
export const toEntry = (data: PostData): PostEntry => ({
  id: `${data.type}/${data.slug}`,
  collection: 'posts',
  data,
})

export const posts = {
  // tip/2016-2017-css-font: 日本語のタイトルと『』
  tip: post({
    id: 828,
    type: 'tip',
    slug: '2016-2017-css-font',
    title:
      'コピペできるフォントスタイルシート。2017年に向けたCSSで出来る最強のフォント指定をひととおりまとめ -『CSS』',
    date: '2016-12-10T17:18:33+09:00',
    modified: '2017-02-13T21:42:38+09:00',
    excerpt:
      '2017年に向けたCSSで出来る最強のフォント指定をひととおりまとめ CSSでのタイポグラフ表現で2017年にふさわしいベターな指定をまとめます。',
    primaryTag: 'font',
    terms: [
      { id: 3, name: 'css', slug: 'css' },
      { id: 232, name: 'font', slug: 'font' },
      { id: 6, name: 'sass', slug: 'sass' },
      { id: 233, name: 'typograph', slug: 'typograph' },
    ],
  }),
  // clip/monopo-tokyo-…: いちばん長いタイトル（110 文字）
  clipLongTitle: post({
    id: 1588,
    type: 'clip',
    slug: 'monopo-tokyo-based-creative-agency-branding-design-digital-experience-video-production-adverstising',
    title:
      'monopo | Tokyo-based creative agency | Branding, Design, Digital Experience, Video production, Adverstising.',
    date: '2017-06-26T19:41:46+09:00',
    modified: '2017-12-01T20:27:49+09:00',
    excerpt: '一貫性のあるタイポアクション 彩度の低い美しいグラデーション',
    primaryTag: 'studio',
    terms: [
      { id: 60, name: 'animation', slug: 'animation' },
      { id: 22, name: 'gradation', slug: 'gradation' },
      { id: 62, name: 'japan', slug: 'japan' },
      { id: 193, name: 'slider', slug: 'slider' },
      { id: 59, name: 'studio', slug: 'studio' },
      { id: 20, name: 'typography', slug: 'typography' },
      { id: 108, name: 'wordpress', slug: 'wordpress' },
    ],
    clipUrl: 'https://monopo.co.jp/',
  }),
  // clip/logo-wt-en: primaryTag が空の 2 件のうちの 1 件
  clipEmptyPrimaryTag: post({
    id: 1830,
    type: 'clip',
    slug: 'logo-wt-en',
    title: 'logo-wt-en',
    date: '2017-09-30T17:53:40+09:00',
    modified: '2017-12-26T18:50:36+09:00',
    excerpt: '美しいミニマルデザインと罫線を使ったレイアウト',
    primaryTag: '',
    terms: [
      { id: 68, name: 'art', slug: 'art' },
      { id: 169, name: 'favorite', slug: 'favorite' },
      { id: 145, name: 'layout', slug: 'layout' },
      { id: 228, name: 'line', slug: 'line' },
      { id: 24, name: 'minimal', slug: 'minimal' },
      { id: 279, name: 'sound', slug: 'sound' },
    ],
    clipUrl: 'https://viennesemodernism2018.info/en/',
  }),
  // clip/truetopia: タームがいちばん多い（19 件）
  clipManyTerms: post({
    id: 2809,
    type: 'clip',
    slug: 'truetopia',
    title: 'Truetopia',
    date: '2020-02-17T14:26:43+09:00',
    modified: '2020-02-17T14:26:43+09:00',
    excerpt: 'アニメーションのイージングの使い分けが素敵',
    primaryTag: 'studio',
    terms: [
      { id: 60, name: 'animation', slug: 'animation' },
      { id: 166, name: 'dark', slug: 'dark' },
      { id: 343, name: 'fade', slug: 'fade' },
      { id: 169, name: 'favorite', slug: 'favorite' },
      { id: 13, name: 'gallery', slug: 'gallery' },
      { id: 71, name: 'hover', slug: 'hover' },
      { id: 49, name: 'interaction', slug: 'interaction' },
      { id: 145, name: 'layout', slug: 'layout' },
      { id: 144, name: 'loading', slug: 'loading' },
      { id: 24, name: 'minimal', slug: 'minimal' },
      { id: 12, name: 'parallax', slug: 'parallax' },
      { id: 33, name: 'responsive', slug: 'responsive' },
      { id: 77, name: 'scroll', slug: 'scroll' },
      { id: 193, name: 'slider', slug: 'slider' },
      { id: 298, name: 'spa', slug: 'spa' },
      { id: 59, name: 'studio', slug: 'studio' },
      { id: 36, name: 'svg', slug: 'svg' },
      { id: 20, name: 'typography', slug: 'typography' },
      { id: 315, name: 'video', slug: 'video' },
    ],
    clipUrl: 'https://www.truetopia.it',
    image: {
      src: '/images/clip/2809.webp',
      width: 1200,
      height: 675,
      thumb: '/images/clip/2809-640.webp',
    },
  }),
  // lab/processing-js-line-and-point: demoUrl あり、primaryTag に記号
  lab: post({
    id: 984,
    type: 'lab',
    slug: 'processing-js-line-and-point',
    title: '点と線を描く -『processing.js』',
    date: '2017-01-31T17:55:03+09:00',
    modified: '2017-01-31T17:55:16+09:00',
    excerpt: 'processing.jsで点と線を描きます。',
    primaryTag: 'processing.js',
    terms: [
      { id: 174, name: 'canvas', slug: 'canvas' },
      { id: 259, name: 'processing.js', slug: 'processing-js' },
    ],
    demoUrl: 'https://jsfiddle.net/yutousui/d2y41xkn/',
  }),
} satisfies Record<string, PostData>
