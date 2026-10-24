// 一覧の見本。tip の新しい順の 16 件（2026-10-23 の src/content/posts/tip/）から写した。excerpt などは省いた。
// id は実在の記事のものにしてある。アイキャッチの URL（/eyecatch/tip/{id}.svg）がカタログのビルドにも出るため
import type { PostEntry } from '../../lib/posts'
import type { PostData } from '../../lib/schema'
import { post, toEntry as entry } from './posts'

const tips: PostData[] = [
  post({
    id: 2883,
    type: 'tip',
    slug: 'nuxt-static-site-tips',
    title:
      'Nuxt.js でアトミックデザインの静的サイトを作るまでの Tips 集 -『Nuxt』',
    date: '2020-03-22T00:26:34+09:00',
    primaryTag: 'Nuxt',
    terms: [
      { id: 366, name: 'nuxt', slug: 'nuxt' },
      { id: 294, name: 'Vue.js', slug: 'vue-js' },
    ],
  }),
  post({
    id: 2881,
    type: 'tip',
    slug: 'dart-sass-with-nuxt',
    title: 'Dart Sass を Nuxt に導入する -『Sass』',
    date: '2020-03-21T15:46:46+09:00',
    primaryTag: 'Sass',
    terms: [
      { id: 3, name: 'css', slug: 'css' },
      { id: 366, name: 'nuxt', slug: 'nuxt' },
      { id: 6, name: 'sass', slug: 'sass' },
      { id: 294, name: 'Vue.js', slug: 'vue-js' },
    ],
  }),
  post({
    id: 2880,
    type: 'tip',
    slug: 'typescript-type-safe',
    title: 'TypeScript を使いこなして手に入れる型安全 -『TypeScript』',
    date: '2020-03-16T22:56:26+09:00',
    primaryTag: 'typescript',
    terms: [
      { id: 29, name: 'javascript', slug: 'javascript' },
      { id: 365, name: 'typescript', slug: 'typescript' },
    ],
  }),
  post({
    id: 2828,
    type: 'tip',
    slug: 'typescript-basic',
    title: 'TypeScript の基本文法 -『TypeScript』',
    date: '2020-02-21T01:25:05+09:00',
    primaryTag: 'typescript',
    terms: [
      { id: 29, name: 'javascript', slug: 'javascript' },
      { id: 365, name: 'typescript', slug: 'typescript' },
    ],
  }),
  post({
    id: 2740,
    type: 'tip',
    slug: 'javascript-graphic-math',
    title: 'グラフィックプログラミングの公式とか概念について -『JavaScript』',
    date: '2020-01-22T18:17:38+09:00',
    primaryTag: 'JavaScript',
    terms: [
      { id: 2, name: 'animation', slug: 'animation' },
      { id: 238, name: 'frontend', slug: 'frontend' },
      { id: 128, name: 'interactive', slug: 'interactive' },
      { id: 29, name: 'javascript', slug: 'javascript' },
      { id: 79, name: 'math', slug: 'math' },
    ],
  }),
  post({
    id: 2727,
    type: 'tip',
    slug: 'css-redering-performance',
    title:
      'ピクセルパイプラインのCSSレンダリングパフォーマンスを考える -『CSS』',
    date: '2019-11-28T13:28:21+09:00',
    primaryTag: 'performance',
    terms: [
      { id: 3, name: 'css', slug: 'css' },
      { id: 238, name: 'frontend', slug: 'frontend' },
      { id: 358, name: 'performance', slug: 'performance' },
    ],
  }),
  post({
    id: 2725,
    type: 'tip',
    slug: 'git-sketch-plugin',
    title: 'Git Sketch Plugin を使ってデザインをバージョン管理する -『Sketch』',
    date: '2019-11-28T12:46:30+09:00',
    primaryTag: 'design',
    terms: [
      { id: 52, name: 'design', slug: 'design' },
      { id: 223, name: 'git', slug: 'git' },
      { id: 357, name: 'sketch', slug: 'sketch' },
    ],
  }),
  post({
    id: 2722,
    type: 'tip',
    slug: 'array-usage',
    title: 'さまざまな配列の処理をまとめる -『JavaScript』',
    date: '2019-11-14T13:21:07+09:00',
    primaryTag: 'javascript',
    terms: [
      { id: 356, name: 'array', slug: 'array' },
      { id: 238, name: 'frontend', slug: 'frontend' },
      { id: 29, name: 'javascript', slug: 'javascript' },
    ],
  }),
  post({
    id: 2721,
    type: 'tip',
    slug: 'css-grid-minmax',
    title: 'CSS Grid で使える minmax() 関数を理解する -『CSS』',
    date: '2019-11-13T17:59:04+09:00',
    primaryTag: 'grid',
    terms: [
      { id: 3, name: 'css', slug: 'css' },
      { id: 238, name: 'frontend', slug: 'frontend' },
      { id: 355, name: 'grid', slug: 'grid' },
    ],
  }),
  post({
    id: 2718,
    type: 'tip',
    slug: 'css-grid-for-ie',
    title: 'Autoprefixer を使って CSS Grid の IE 対応をやっていく -『CSS』',
    date: '2019-11-12T20:50:26+09:00',
    primaryTag: 'CSS',
    terms: [
      { id: 3, name: 'css', slug: 'css' },
      { id: 238, name: 'frontend', slug: 'frontend' },
      { id: 355, name: 'grid', slug: 'grid' },
      { id: 124, name: 'ie', slug: 'ie' },
    ],
  }),
  post({
    id: 2600,
    type: 'tip',
    slug: 'vs-code-markdown',
    title: 'VS code で最強の Markdown 環境をつくる方法 -『tool』',
    date: '2019-03-24T21:30:36+09:00',
    primaryTag: 'tool',
    terms: [
      { id: 238, name: 'frontend', slug: 'frontend' },
      { id: 80, name: 'tool', slug: 'tool' },
      { id: 353, name: 'VScode', slug: 'vscode' },
    ],
  }),
  post({
    id: 2597,
    type: 'tip',
    slug: 'redmine-image',
    title: 'Redmine のコメント上で画像をきれいに見せる方法 -『tool』',
    date: '2019-03-01T00:35:24+09:00',
    primaryTag: 'tool',
    terms: [{ id: 80, name: 'tool', slug: 'tool' }],
  }),
  post({
    id: 2345,
    type: 'tip',
    slug: 'javascript-select-dom',
    title: 'ES6 JavaScript での要素の取得と操作のまとめ -『JavaScript』',
    date: '2018-10-14T17:22:04+09:00',
    primaryTag: 'javascript',
    terms: [
      { id: 240, name: 'ES6', slug: 'es6' },
      { id: 29, name: 'javascript', slug: 'javascript' },
    ],
  }),
  post({
    id: 2343,
    type: 'tip',
    slug: 'javascript-mouse-position',
    title: 'マウス座標のいろいろな原点 -『Javascript』',
    date: '2018-10-11T00:24:50+09:00',
    primaryTag: 'mouse',
    terms: [
      { id: 2, name: 'animation', slug: 'animation' },
      { id: 128, name: 'interactive', slug: 'interactive' },
      { id: 29, name: 'javascript', slug: 'javascript' },
      { id: 344, name: 'mouse', slug: 'mouse' },
    ],
  }),
  post({
    id: 2326,
    type: 'tip',
    slug: 'fonts-that-people-actually-use',
    title:
      'スタートアップが利用するフォントを集めた 『Fonts That People Actually Use』',
    date: '2018-08-22T10:26:42+09:00',
    primaryTag: 'font',
    terms: [
      { id: 52, name: 'design', slug: 'design' },
      { id: 232, name: 'font', slug: 'font' },
      { id: 83, name: 'googlefonts', slug: 'googlefonts' },
      { id: 294, name: 'Vue.js', slug: 'vue-js' },
    ],
  }),
  post({
    id: 2308,
    type: 'tip',
    slug: 'sips',
    title: '複数の画像を手早くsipsコマンドで一括リサイズする -『Mac』',
    date: '2018-03-25T12:37:42+09:00',
    primaryTag: 'mac',
    terms: [
      { id: 52, name: 'design', slug: 'design' },
      { id: 238, name: 'frontend', slug: 'frontend' },
      { id: 53, name: 'mac', slug: 'mac' },
    ],
  }),
]

/** ArticleList に渡す一覧。件数で読み込み口と End の出し分けが変わる（03 の 4.3） */
export const lists = {
  /** 8 件。トップの形 */
  eight: tips.slice(0, 8).map(entry),
  /** 16 件。8 の倍数なので、2 ページ目を読んだあと End が出る */
  sixteen: tips.map(entry),
  /** 12 件。8 の倍数でないので、2 ページ目を読んだあと読み込み口ごと消える */
  twelve: tips.slice(0, 12).map(entry),
  empty: [] as PostEntry[],
}
