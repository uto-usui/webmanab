# 03 アーキテクチャ: Nuxt 2 から Astro 7.4 への移行設計

前提は `00-brief.md` に従う。ここでは Astro 側の構成、データの流れ、ビルドの設定、テスト、作業順を決める。

確かめ方の表記:

- 「試作で確認」: scratchpad の試作（`scratchpad/architecture/proto/`、astro 7.4.2 / Node v26.12.1 / pnpm 11.28.6）で実際にビルドやテストを走らせて確かめたこと。
- 「旧データで確認」: `.snapshot/` の HTML・`__NUXT__`・sitemap、または稼働中の `webmanab.netlify.app` で確かめたこと。
- 「未確認」: 確かめられなかったこと。
- 「公式ドキュメント」: docs.astro.build（v7 版）の記述。

## 0. 先に決めておく大きな方針

1. Markdown の処理は Astro 7 の既定である Sätteri を使う。v7 から remark / rehype は既定ではなくなり、`@astrojs/markdown-remark` を別に入れたときだけ使える（公式ドキュメント「Upgrade to Astro v7」）。Sätteri には生 HTML を要素として解析し直す `features.rawHtml` があり、必要なプラグインは 2 つだけなので、Sätteri の hast プラグインとして書く（試作で確認）。
2. コードのハイライトは、旧サイトがブラウザでやっていたことをビルド時に同じ版でやり直す。旧サイトは highlight.js 10.1.1 の `highlightBlock(pre)` を全ての `<pre>` に対して実行していた。言語は `<code class>` を見ずに自動判定する。記事のコードブロックは fenced code で持ち、info string を旧来の `<code class>` に戻してから 10.1.1 をかける。新しい版（10.7.3、11.12.0）では自動判定の結果が 100〜165 ブロック変わるので、10.1.1 を固定で使う（詳細は 2.4）。
3. 動く部分は素の `<script>`（Astro が処理するもの）をコンポーネントごとに置く。Astro はそのコンポーネントを使ったページにだけ script を入れ、同じページで重複したら 1 回にまとめる（公式ドキュメント「Scripts and event handling」）。
4. 全ページ静的出力。ページ遷移は通常のページ読み込みで、View Transitions は入れない。

## 1. ディレクトリ構成と対応表

### 1.1 新しいディレクトリ構成

```
astro.config.mjs
package.json / pnpm-lock.yaml / tsconfig.json / vitest.config.ts / .nvmrc (26)
public/
  ads.txt  favicon.ico  apple-touch-icon.png  icon.png  ogp.png   (static/ から移動)
  sw.js                     旧 Service Worker を消すためのもの（6.7）
  og/                       OGP 用 PNG（ビルド前に生成。6.6）
scripts/
  build-og.mjs              アイキャッチのカテゴリ単位の OGP 用 PNG を作る（アイキャッチ担当）
src/
  content.config.ts
  content/
    posts/{tip,clip,lab}/*.md
    terms/{tips,clips,labs}.json
  layouts/
    Default.astro           旧 layouts/default.vue + 旧 nuxt.config.js の head
  components/               旧 components/*.vue を .astro にしたもの（対応表）
    Head.astro              title / description / OGP / canonical / GA4
    AdScript.astro          AdSense の読み込み（本番だけ）
  pages/
    index.astro
    tip/index.astro   tip/[slug].astro
    clip/index.astro  clip/[slug].astro
    lab/index.astro   lab/[slug].astro
    tips/[id].astro   clips/[id].astro   labs/[id].astro
    data/[type]/[page].json.ts
    data/[tax]/[id]/[page].json.ts
    eyecatch/[type]/[id].svg.ts   記事ごとのアイキャッチ SVG（アイキャッチ担当）
    feed.xml.ts
    sitemap.xml.ts
    404.astro
  lib/
    site.ts                 サイト名、説明文、SITE_URL、postTypes
    posts.ts                取得、並び替え、前後、関連、ページ分割、パス生成
    terms.ts                ターム一覧の読み込みと並び替え
    date.ts                 日付表示（Asia/Tokyo 固定）
    primary-tag.ts          primaryTag の正規化（関連記事とアイキャッチで共有。5.1）
    eyecatch/               アイキャッチの生成関数（アイキャッチ担当）
    markdown/hljs.mjs       ハイライト用 hast プラグイン
    markdown/heading-ids.mjs 見出し id 用 hast プラグイン
  scripts/                  ブラウザで動く小さな script（7 章）
    menu.ts  header-fixed.ts  toc.ts  image-fade.ts  infinite-list.ts  share.ts
  styles/
    foundation/ object/     旧 assets/sass をそのまま移す
    global.scss             旧 layouts/default.vue の unscoped style の中身
test/
  fixtures/legacy-urls.txt  旧サイトの URL 一覧（コミットはリーダーの判断で可。10 章）
  *.test.ts
```

ページを `[type]/[slug].astro` 1 本にまとめず、type ごとにファイルを分ける。理由は 2 つある。旧 `pages/` と 1 対 1 で対応が追いやすいこと、tip / clip / lab で並べる部品が違うこと（tip だけ目次・demo・下部広告、clip だけ外部リンク）。共通部分は `lib/posts.ts` の `staticPathsFor(type)` と部品に寄せるので、各ページは 30 行程度になる見込み。`[type]/[slug]` と `[tax]/[id]` のように 2 段の動的ルートを並べると、どちらが先に当たるかを読む必要が出るので避ける。

`astro.config.mjs` に `prerenderConflictBehavior: 'error'` を入れ、同じ URL を 2 つのルートが出したらビルドを止める（公式ドキュメント）。

### 1.2 ページの対応

| 旧 | 新 | 補足 |
| --- | --- | --- |
| `pages/index.vue` | `src/pages/index.astro` | tip / clip / lab の新しい 8 件ずつ。無限スクロールなし（旧も `infinite` を渡していない） |
| `pages/{tip,clip,lab}/index.vue` | `src/pages/{tip,clip,lab}/index.astro` | 8 件 + 無限スクロール |
| `pages/{tip,clip,lab}/_id.vue` | `src/pages/{tip,clip,lab}/[slug].astro` | |
| `pages/{tips,clips,labs}/_id.vue` | `src/pages/{tips,clips,labs}/[id].astro` | 8 件 + 無限スクロール |
| （なし。Netlify 既定の 404） | `src/pages/404.astro` | 3.4 を参照 |
| `layouts/default.vue` | `src/layouts/Default.astro` | Bar ×4、Header、本文、Menu。`Icon` は廃止 |

### 1.3 コンポーネントの対応

| 旧 | 新 | 補足 |
| --- | --- | --- |
| `Article.vue` | `Article.astro` | 画像はアイキャッチ（アイキャッチ担当）。無限スクロールで複製する `<template>` もこの部品で出す（4.3） |
| `ArticleList.vue` | `ArticleList.astro` + `scripts/infinite-list.ts` | |
| `Bar.vue` | `Bar.astro` | |
| `EntryAd.vue` | `EntryAd.astro` | style は旧来 unscoped なので `is:global` |
| `EntryAdFoot.vue` | `EntryAdFoot.astro` | Amazon のリンク画像は外部画像なので残す（「画像は復元しない」は WP の画像のこと、と解釈。ユーザー確認） |
| `EntryClipFullImage.vue` | 廃止 | `clipImage` は WP の画像で復元しないため |
| `EntryClipLink.vue` | `EntryClipLink.astro` | 中の画像はアイキャッチ |
| `EntryContent.vue` | `EntryContent.astro` | hljs の実行と目次作成はビルド時へ。hljs の CSS と本文の CSS は `is:global` |
| `EntryDemo.vue` | `EntryDemo.astro` | `demoUrl` があるときだけ。tip のページでだけ使う（旧 lab ページも使っていない） |
| `EntryHead.vue` | `EntryHead.astro` | |
| `EntryNav.vue` | `EntryNav.astro` | 背景画像は旧 WP 画像だった。前後記事のアイキャッチ SVG（`/eyecatch/{type}/{id}.svg`）を背景にする案。見え方はアートディレクション担当と調整 |
| `EntryRelated.vue` | `EntryRelated.astro` | ビルド時に計算（5.1） |
| `EntrySns.vue` | `EntryShare.astro` + `scripts/share.ts` | Web Share API のボタン 1 つ（7.6） |
| `EntryTag.vue` | `EntryTag.astro` | |
| `EntryToc.vue` | `EntryToc.astro` + `scripts/toc.ts` | 目次はビルド時に HTML で出す |
| `Header.vue` | `Header.astro` + `scripts/header-fixed.ts` | style は unscoped だったので `is:global` |
| `Icon.vue` | 廃止 | SNS アイコンの SVG 定義だけで、シェアボタン廃止により不要 |
| `LazyImage.vue` | `<img loading="lazy">` を直接書く | 旧 LazyImage にはフェードの CSS がない |
| `Loader.vue` | `Loader.astro` | 20 個の span。`@keyframes temp` は Astro ではスコープされない（試作で確認）。名前の衝突だけ気にする |
| `Logo.vue` | 廃止 | どこからも使われていない（`test/Logo.spec.js` だけが参照） |
| `Menu.vue` | `Menu.astro` + `scripts/menu.ts` | ターム一覧はビルド時に HTML で出す |
| `MenuList.vue` / `MenuTitle.vue` | `MenuList.astro` / `MenuTitle.astro` | unscoped なので `is:global` |
| `SectionEntry.vue` / `SectionList.vue` | 同名 `.astro` | |
| `Title1.vue` / `Title2.vue` | 同名 `.astro` | Title1 のリンクは旧来 `/${text}`（末尾スラッシュなし）だったが、`/tip/` の形に直す（3.3） |
| `Wrapper.vue` | `Wrapper.astro` | |

### 1.4 mixin・store・その他の行き先

| 旧 | 新 | 消える理由・補足 |
| --- | --- | --- |
| `mixins/Archive.vue` | 各 `index.astro` + `lib/posts.ts` | API 取得と store 書き込みが仕事だった。ビルド時に `getCollection` で済む |
| `mixins/Term.vue` | `{tips,clips,labs}/[id].astro` + `lib/posts.ts` | 同上 |
| `mixins/Single.vue` | `{tip,clip,lab}/[slug].astro` | 同上 |
| `mixins/Head.vue` | `components/Head.astro` | head の組み立てだけを部品に移す |
| `mixins/Date.vue` | `lib/date.ts` | dayjs は不要。`Intl.DateTimeFormat` で Asia/Tokyo 固定 |
| `store/*`（index / state / getters / mutations / actions、tip / clip / lab / tax） | なし | Vuex は SPA の画面遷移と追加読み込みのために API の結果をためておく場所だった。静的 HTML と静的 JSON に置き換わるので、ためておく先がいらない |
| `store` の `menuOpen` | `scripts/menu.ts` の DOM クラス | ページごとに読み込み直すので、ページをまたぐ状態がいらない |
| `store` の `meta` / `domain` / `postTypes` | `lib/site.ts` の定数 | `domain` は `SITE_URL` に置き換え |
| `modules/api/*`、`api.config.js` | なし | WP がもうない |
| `plugins/console.js` | なし | デバッグ用 |
| `plugins/scrollTo.js`（vue-scrollto） | `scripts/toc.ts` | |
| `plugins/vue-lazyload.client.js` | `loading="lazy"` + `scripts/image-fade.ts` | |
| `nuxt.config.js` | `astro.config.mjs`、`Default.astro`、`feed.xml.ts`、`sitemap.xml.ts`、`public/sw.js` | |
| `static/*` | `public/*` | |
| `assets/sass/**` | `src/styles/**` | 中身は変えない（8 章） |
| `.babelrc` `jest.config.js` `webpack.config.js` `index.d.ts` `vue.d.ts` `process.d.ts` `test/Logo.spec.js` `yarn.lock` | 削除 | `pnpm-lock.yaml` と `tsconfig.json` に替わる |
| `.eslintrc.js` `.stylelintrc.js` `.prettierrc` | 案: Prettier（`prettier-plugin-astro`）と Stylelint だけ残す | 決めていない。インフラ担当と合わせる |

## 2. Content Collections と Markdown

### 2.1 記事コレクション

```ts
// src/content.config.ts
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const term = z.object({ id: z.number().int(), name: z.string(), slug: z.string() });

const posts = defineCollection({
  loader: glob({
    base: './src/content/posts',
    pattern: '{tip,clip,lab}/*.md',
    generateId: ({ data }) => `${data.type}/${data.slug}`,
  }),
  schema: z
    .object({
      id: z.number().int(),
      type: z.enum(['tip', 'clip', 'lab']),
      slug: z.string().min(1),
      title: z.string().min(1),
      date: z.coerce.date(),
      excerpt: z.string(),
      primaryTag: z.string(),
      terms: z.array(term),
      clipUrl: z.string().min(1).optional(),
      demoUrl: z.url().optional(),
      legacy: z.object({ prev: z.string().nullable(), next: z.string().nullable() }).optional(),
    })
    .strict()
    .refine((d) => d.type === 'clip' || d.clipUrl === undefined, 'clipUrl は clip だけ')
    .refine((d) => d.type === 'tip' || d.demoUrl === undefined, 'demoUrl は tip だけ'),
});

export const collections = { posts };
```

- glob loader は frontmatter の `slug` を見つけると、それをエントリの id に使う（公式ドキュメント「Defining custom IDs」）。type をまたいで同じ slug があると id がぶつかるので、`generateId` で `type/slug` にする。現状の 1030 件に type をまたぐ重複はない（旧データで確認）。`generateId` を渡しても `data.slug` は残る（試作で確認）。
- `legacy` は省略できるようにする。日本語 slug の 2 記事は旧ページが 404 で、旧来の前後記事の値が残っていないため（3.2）。
- `primaryTag` は空文字を許す。空の記事が 2 件ある（旧データで確認）。
- `.strict()` と `.refine()` を付けたスキーマで、clip 以外に `demoUrl` を書いた記事がビルドエラーになることを確かめた（試作で確認）。
- `clipUrl` を `z.url()` にしないのは、旧データに `v` という値が 1 件、空が 2 件あるため（旧データで確認）。空はエクスポーターが出さない、`v` はそのまま通すことを想定している。扱いはエクスポーター担当と決める。
- `date` はエクスポーターが `+09:00` 付きで出す。表示は `lib/date.ts` で `timeZone: 'Asia/Tokyo'` に固定する。Netlify のビルド環境のタイムゾーンは UTC の想定（未確認）で、その場合は固定しないと `2020-03-22T00:26:34+09:00` が `2020-03-21` になる（`TZ=UTC` で Vitest を走らせて確認。試作で確認）。旧サイトは WP の日時文字列（タイムゾーンなし）の先頭 10 文字と同じ日付を出していた。

### 2.2 ターム一覧の読み方

`src/content/terms/{tips,clips,labs}.json` はコレクションにせず、`lib/terms.ts` で JSON を import して zod で検証する。`file()` loader で読むと `getCollection` の返り順がファイルの順にならなかった（試作で確認）ので、並び順を自分で決める必要がある。それなら import して並べるほうが単純になる。

並び順は WP API の既定（名前順）に合わせ、`name.toLowerCase()` で比べる。旧 sitemap に残る `/tips/<id>` の順（API の返り順）と、小文字比較・`Intl.Collator('en', { sensitivity: 'base' })` の並びが tips / clips / labs の 3 つとも一致した（旧データで確認。ただし名前不明の labs 2 件を除く）。

ターム一覧は「メニュー」と「ターム一覧ページのルート」の 2 か所で使う。投稿が 0 件のタームもルートに出す（旧 sitemap に `/labs/332/` `/labs/333/` があり、旧ページも 0 件で生成されていた。旧データで確認）。

### 2.3 Markdown → HTML の設定

```js
// astro.config.mjs（抜粋）
import { satteri } from '@astrojs/markdown-satteri';
import { hljsPlugin } from './src/lib/markdown/hljs.mjs';
import { headingIdsPlugin } from './src/lib/markdown/heading-ids.mjs';

markdown: {
  syntaxHighlight: false,
  processor: satteri({
    features: { rawHtml: true, smartPunctuation: false },
    hastPlugins: [hljsPlugin, headingIdsPlugin],
  }),
},
```

- `syntaxHighlight: false` で Shiki も Prism も入らない。出力に `astro-code` クラスやインラインの色指定が出ないことを確認した（試作で確認）。
- `smartPunctuation: false` は必須。Astro は既定で引用符を曲がった引用符に、`--` をダッシュに、`...` を三点リーダーに変える（公式ドキュメント「Smart punctuation」）。旧本文の文字を変えないために切る。`"SSR" -- や...` がそのまま出ることを確認した（試作で確認）。
- `rawHtml: true` で、Markdown に残った生 HTML（`<dl>`、`<iframe>` など）が要素として解析し直され、hast プラグインから見えるようになる。切ったままだと生 HTML は中身を解析しない `raw` ノードのままで、生 HTML の中の `<pre>` にハイライトがかからず、生の `<h2>` に id が付かなかった（試作で確認）。コードブロックと見出しは Markdown で書く方針なので普段は関係しないが、生 HTML の中に残ったものも同じ処理を受けられるように入れておく。`<iframe>` の属性（`allowfullscreen="true"` や `style`）、`<dl>`、`<input type="checkbox" checked disabled>` はそのまま出る（試作で確認）。
- `@astrojs/markdown-satteri` は astro の依存として入るが、設定で `satteri()` を import するので `package.json` に直接入れる（pnpm は直接の依存しか import できない）。`satteri` も `defineHastPlugin` を使うので直接入れる。

#### 生 HTML が残る部分についてのエクスポーターへの条件（試作で確認）

方針は「全部 Markdown に抽出する」で、コードブロックも fenced code にする（2.4）。Markdown に対応する書き方がない `<dl>` や `<iframe>` などだけが生 HTML で残る。

旧本文の HTML をそのまま Markdown として通すと、95 記事で構造が崩れた。原因は CommonMark の HTML ブロックの規則で、`<p>` などで始まった HTML ブロックは空行で終わり、続く 4 スペース字下げの行がコードブロックとして解釈される。生 HTML が残る部分については次を守ってもらう。

- 生 HTML のブロックは前後に空行を入れて、1 つずつ独立させる。
- 生 HTML ブロック（`<dl>` など）の中に空行を入れない。
- 確認には、出力した Markdown を本設計と同じ設定（`features: { rawHtml: true, smartPunctuation: false }` とこの章のプラグイン）の `satteri` の `markdownToHtml` で HTML にし、元の WP HTML と DOM を比べるのが確実。

### 2.4 コードのハイライト

#### 旧サイトの実際の動き

`webmanab.netlify.app/tip/nuxt-static-site-tips/` をブラウザで開いて確認した（旧データで確認）。

- 出力は `<pre class="hljs bash"><code class="bath"><br><span class="hljs-built_in">cd</span> ./your-title …</code></pre>` の形。
- `<pre>` に `hljs` と、判定した言語名のクラスが付く。判定できなかったブロックは `hljs` だけになる。
- `<code class="bath">` と先頭の `<br>` は残る。`<br>` は `<pre>` の中なので 1 行目の空行として見えている。旧本文の `<pre>` 761 件のうち 569 件が `<br />` で始まる（旧データで確認）。
- 言語の指定（`code` の class）は使われない。v10 の `highlightBlock` は `<pre>` 自身と親要素の class しか見ず、どちらにも class がないので、登録した 7 言語（javascript, scss, typescript, xml, bash, php, yaml）から自動判定する。`bath` のような未登録の名前でも、`js` のような正しい名前でも同じ扱いになる。

#### エクスポーターの出力（リーダーの決定）

- fenced code（```）にする。info string には元の `code` の class の文字列をそのまま書く（`bath` も直さない）。class がなければ info string は空。
- `<pre>` の中の `<br />` は改行文字にする。先頭の空行も中身として残す。
- `<code>` の textContent が元と完全に一致することを往復検証の条件にする。
- 末尾の改行はエクスポーターと描画側で分担する（リーダーの決定）。fenced code は描画すると中身が必ず改行で終わるので、元の中身が改行で終わらないブロック（`tip/divide-retina` の 1 つ）だけ改行が 1 つ増えてしまう。そこでエクスポーターは元の中身の最後の改行を外さずにそのまま書き、その後ろで改行してから閉じのフェンスを書く。描画すると中身は必ず「元の中身 + 改行 1 つ」になるので、描画側で全ブロックの末尾の改行を 1 つ外す。

#### 新しい描画の処理

Sätteri は fenced code を `<pre><code class="language-bath">` で出す。info string の大文字小文字はそのまま残り（`HTML` は `language-HTML`）、info string が空なら class なしの `<code>` になる。先頭の空行も中身に残る（試作で確認）。

この上で 1 つの hast プラグインが次をする。

1. `<code>` の `language-` を外して、旧サイトと同じ `class="bath"` に戻す。言語なしなら class を付けない。
2. 中身の末尾の改行を 1 つ外す（上の分担）。
3. 中身の先頭の改行をいったん外し、残りを highlight.js 10.1.1 の `highlightBlock(pre)` にかける。DOM 実装は `linkedom` を使い、旧サイトと同じく `<div class="entry-content__inner">` の中に置く。
4. 外した先頭の改行を `<code>` の頭に戻す。

3 で先頭の改行を外すのは、旧サイトでは先頭の `<br>` が判定の入力（textContent）に入っていなかったため。改行のまま判定にかけると、行頭の `methods:` に `hljs-attr` が付くなど、8 ブロックで span の付き方が変わった（試作で確認）。

```js
// src/lib/markdown/hljs.mjs（試作のコードをほぼそのまま使う）
// 旧サイトはブラウザで highlight.js 10.1.1 の highlightBlock(pre) を実行していた。
// 言語は <code class> を見ずに自動判定する。同じ結果を出すため、ビルド時に同じ版を DOM 実装の上で動かす。
const hljs = require('highlight.js/lib/core'); // 10.1.1 に固定。7 言語を registerLanguage

export const hljsPlugin = defineHastPlugin({
  name: 'webmanab-hljs',
  element: {
    filter: ['pre'],
    visit(node, ctx) {
      const code = node.children.find((c) => c.type === 'element' && c.tagName === 'code');
      if (!code) return;
      // fenced code の info string は language-<元の class> になるので、旧サイトの class に戻す
      const lang = (code.properties?.className ?? []).find((c) => String(c).startsWith('language-'));
      const cls = lang ? ` class="${escapeHtml(String(lang).slice('language-'.length))}"` : '';
      // fenced code は中身が必ず改行で終わるので、エクスポーターは元の中身の後ろに改行を 1 つ足して書く。ここでその 1 つを外す
      const text = ctx.textContent(code).replace(/\n$/, '');
      // 旧本文の先頭の <br /> はエクスポーターで改行になる。旧サイトは <br> を判定の入力に含めていなかったので、
      // 先頭の改行は外して判定し、あとで戻す
      const [, head, body] = text.match(/^(\n*)([\s\S]*)$/);
      const { document } = parseHTML(
        `<!doctype html><html><body><div class="entry-content__inner"><pre><code${cls}>${escapeHtml(body)}</code></pre></div></body></html>`,
      );
      const pre = document.querySelector('pre');
      // highlightBlock は内部で document.createElement を呼ぶ
      globalThis.document = document;
      try {
        hljs.highlightBlock(pre);
      } finally {
        delete globalThis.document;
      }
      pre.querySelector('code').prepend(head);
      ctx.replaceNode(node, { type: 'raw', value: pre.outerHTML });
    },
  },
});
```

#### 試作で確かめたこと

- 旧サイトで見た 3 ブロックを fenced code（info string `bath`、先頭に空行）にして Astro でビルドした。出力は `<pre class="hljs"><code class="bath">`、`<pre class="hljs bash"><code class="bath">`、`<pre class="hljs scss"><code class="bath">` で、中の span も旧サイトと同じだった（試作で確認）。`bath` は未登録の言語名だが、旧サイトと同じ自動判定の結果になっている。
- エクスポーターの最新の出力（`scratchpad/md-exporter/out-v4/`、末尾の改行の分担を入れたもの）をそのまま描画し、本文のある 861 記事の `<pre>` 762 個を 1 個ずつ、旧サイトの処理（元の WP HTML をそのまま DOM にして `highlightBlock`）と比べた（試作で確認。比べたスクリプトは試作の `verify-v3.mjs`）。
  - ブロックの数は全記事で一致した。
  - 757 個は、`<code>` の textContent、`<pre>` と `<code>` の class、ハイライト後の `<code>` の中身（旧サイトの `<br>` を改行に置き換えたもの）がすべて完全に一致した。`tip/divide-retina` も末尾の改行まで一致している。
  - 残る 5 個は、エクスポーターが意図して直したもの（04 の 4.、リーダー決定済み）。`tip/frontnote` の 1 個（コードの中の生の `<h1>` を文字として見せる）、`tip/gulp-imagemin-2018` の 2 個と `tip/javascript-es6` の 2 個（二重にエスケープされていた絵文字を直す）。中身が変わるので、このうち 2 個は自動判定の言語も変わる（`frontnote` は `php` → `xml`、`javascript-es6` の 1 個は `xml` → `javascript`）。直した結果として受け入れる。
- 末尾の改行の分担を入れる前の出力（out-v3）でも、同じ規則に直してから比べて同じ結果になった（試作で確認）。
- 旧サイトとの HTML 上の違いは、先頭の `<br>` が改行文字になる点だけ。どちらも `<pre>` の中の 1 行目の空行として表示される。
- 全 859 本文の変換は 1 秒未満だった（試作で確認）。

#### 版を固定する理由と注意

- 自動判定の言語は 10.1.1 と比べて、10.7.3 で 100 件、11.12.0 で 165 件変わる。出力 HTML が完全に同じだったのは 10.7.3 で 567 件、11.12.0 で 224 件だけだった（試作で確認）。見た目を変えないためには 10.1.1 を固定するしかない。
- 10.1.1 は npm で非推奨で、既知の脆弱性（ReDoS など）がある。ビルド時に自分の記事だけを処理し、ブラウザには届かない。ビルド時だけ使うことはリーダーの判断で可になった。
- 依存は `highlight.js@10.1.1`（完全固定）と `linkedom`。
- 旧サイトのハイライト用 CSS（`EntryContent.vue` の `.hljs*`）はそのまま global で持ってくる。

### 2.5 見出しの id と目次

旧サイトは本文の `h2` / `h3` を上から数え、`h2` に `a0, a1, …`、`h3` に `a{h2番号}{h3番号}`（`a00, a01, a10…`）を振っていた（`EntryContent.vue` の `createToc`。稼働中の旧サイトでも `H2#a0, H3#a00, H2#a1, H3#a10…` を確認。旧データで確認）。tip 以外のページでも id は振られていた。

新しいプラグイン（試作のコード）:

```js
// src/lib/markdown/heading-ids.mjs
export const headingIdsPlugin = () => {
  let h2 = -1;
  let h3 = 0;
  return defineHastPlugin({
    name: 'webmanab-heading-ids',
    element: {
      filter: ['h2', 'h3'],
      visit(node, ctx) {
        if (node.tagName === 'h2') {
          h2 += 1;
          h3 = 0;
          ctx.setProperty(node, 'id', `a${h2}`);
        } else if (h2 >= 0) {
          ctx.setProperty(node, 'id', `a${h2}${h3}`);
          h3 += 1;
        }
      },
    },
  });
};
```

- 関数で包んでいるのは、Sätteri がプラグインの関数を文書ごとに呼ぶので、数え直しが文書ごとにリセットされるため（試作で 2 記事を続けてビルドして確認）。
- Astro は自分の見出し id プラグインをユーザーのプラグインの後に走らせ、既に id がある見出しは触らない（公式ドキュメント「Heading IDs and plugins」、`@astrojs/markdown-satteri` のソースでも確認）。そのため `h4` 以下と、最初の `h2` より前の `h3` には Astro が github-slugger の id を付ける。旧サイトにはない id が増えるが、見た目には関係しない。
- 目次のデータは `render(entry)` が返す `headings`（`{ depth, slug, text }[]`）から作る。プラグインで振った `a0` / `a00` がそのまま `headings` に入る（試作で確認）。`depth` が 2 か 3 で、`slug` が `/^a\d+$/` に合うものだけを使い、順に `h2` ごとにまとめる。`text` は要素の textContent で、旧実装（`el.textContent`）と同じく `<code>` などのタグは外れる（試作で確認）。
- 最初の `h2` より前に `h3` がある tip が 1 件ある（`os-x-el-capitan-appear-invisible-files`。旧データで確認）。旧実装はここで例外になり、以降の id 付けが止まっていた。新しい実装ではその `h3` だけを飛ばして続ける。
- `h2` が 10 個以上ある記事では旧来の形式どおり `a1`+`0` と `a10` が同じ id になりうる。旧サイトと同じなので変えない。
- 目次は tip のページだけに出す。旧サイトは見出しのない tip でも目次の枠を出していた（`v-if="toc && tocList"` の `tocList` は空配列でも真）ので、それに合わせる。見出しのない tip は 19 件（旧データで確認）。

### 2.6 キャッシュの注意（試作で確認）

Astro は Markdown の変換結果を `node_modules/.astro/data-store.json` にためる。`astro.config.mjs` が import しているプラグインのファイルを書き換えても、記事の `.md` が変わっていなければ前の変換結果が使われた。`astro build --force` で消える。開発中はプラグインを変えたら `--force` を付ける。Netlify が `node_modules` をビルド間で残すかどうかで本番にも同じ問題が起きうるので、インフラ担当と決める（案: `build` スクリプトを `astro build --force` にする。全 859 本文の変換が 1 秒未満なので時間の負担はほぼない）。

## 3. ルーティング

### 3.1 出す URL

| URL | 件数 | 出し方 |
| --- | --- | --- |
| `/` | 1 | `index.astro` |
| `/{tip,clip,lab}/` | 3 | `{type}/index.astro` |
| `/{tip,clip,lab}/<slug>/` | 165 + 817 + 48 | `{type}/[slug].astro` の `getStaticPaths` |
| `/{tips,clips,labs}/<term_id>/` | 107 + 156 + 26 | `{tax}/[id].astro` の `getStaticPaths` |
| `/data/{type}/{page}.json`、`/data/{tax}/{id}/{page}.json` | ページ数ぶん | 4 章 |
| `/feed.xml`、`/sitemap.xml` | 各 1 | 6 章 |
| `/404.html` | 1 | `404.astro` |

ページの合計は 1323 件で、旧 sitemap の 1323 件と同じになる（旧 sitemap の内訳から計算。tip/clip/lab の個別記事には本文がない clip 169 件・`_prefix`・日本語 slug の 2 件を含む）。エクスポーターが本文のない記事も漏らさず出すことが前提になる。

### 3.2 slug に日本語・エンコード済み文字列が入る記事

- 該当は 2 件。`/clip/%e3%81%ad%e2%80%af-%e2%80%afnt/`（「ね — NT」、U+202F を 2 つ含む）と `/lab/%e7%84%a1%e9%99%90…%e3%80%8f/`（「無限ループするニュースティッカー -『javascript』」）。
- 旧サイトではこの 2 件はどちらも 404 だった。小文字・大文字・二重エンコードの 3 通りで確認した（旧データで確認）。旧サイトの前後記事リンクからは 404 に飛んでいた。
- frontmatter の `slug` はデコード済みの文字列で持つ（ブリーフどおり）。`getStaticPaths` の `params.slug` にもデコード済みの文字列を渡す。Astro は `dist/clip/ね - nt/index.html` のように Unicode のディレクトリ名で出力し、`astro preview` で小文字・大文字どちらのエンコードでも 200 を返した（試作で確認）。`Astro.url.pathname` は大文字のエンコード形（`/clip/%E3%81%AD…/`）になる（試作で確認）。
- Netlify が `%e3…` の URL をこの Unicode 名のファイルに対応させるかは未確認。deploy ができないので、インフラ担当にドラフトでの確認を頼む。
- サイト内のリンク・sitemap・RSS・canonical はすべて `lib/posts.ts` の `postPath(type, slug)` で作る。中身は `/${type}/${encodeURIComponent(slug)}/`。ASCII の slug は変わらない。旧 sitemap は小文字の `%e3`、新しい出力は大文字の `%E3` になるが、パーセントエンコードの大文字小文字は同じ URL として扱われる（RFC 3986）。

### 3.3 build.format と末尾スラッシュ

- `build.format: 'directory'`（既定値）。`/tip/foo/index.html` の形で出る（試作で確認）。
- `trailingSlash: 'always'`。開発サーバーと `astro preview` でスラッシュなしを 404 にして、リンクの書き漏れに気づけるようにする。`astro preview` で `/tip/x` は 404、`/tip/x/` は 200 だった（試作で確認）。静的ページの末尾スラッシュはホスティングの扱いになる（公式ドキュメント）。Netlify がスラッシュなしを転送するかは未確認（インフラ担当）。
- 旧サイトのリンクは記事・タームとも末尾スラッシュ付き。Title1 だけ `/tip` のようにスラッシュなしだった。見た目に影響しないので `/tip/` に直す。

### 3.4 404 ページ

旧サイトは独自の 404 を持っておらず、Netlify 既定の「Page not found」が出ていた（`.snapshot/404.html` は Netlify のもの。旧データで確認）。新しく `src/pages/404.astro` を作り、Default レイアウトの中に Title1 と同じ見た目で `404` とトップへのリンクだけを置く案にする。見た目が増える変更なので、デザインはアートディレクション担当、出すかどうかはユーザー確認。Netlify が `/404.html` を自動で使うかはインフラ担当に確認してもらう。

## 4. 一覧と無限スクロール

### 4.1 旧実装の動き（`ArticleList.vue` と vue-infinite-loading 2.4.5 のソースから）

- 1 ページ 8 件。新しい順（tip / clip / lab の一覧は `orderby=date`、ターム一覧は指定なしで WP の既定の新しい順）。
- 監視するのは window のスクロール（`force-use-infinite-wrapper` の指定先が祖先にないので body まで遡って window になる）。読み込み口の上端が画面の下端から 100px 以内に入ったら次を読む。スクロールは 50ms で間引く。
- 読み込み中は Loader（`position: fixed` で画面中央に 20 本のバー）を出す。
- 読み込み口は `articles.length % 8 === 0` のときだけ存在する。読み込んだ後に件数が 8 の倍数でなくなると読み込み口ごと消え、「End」は出ない。
- 件数がちょうど 8 の倍数のときは、次のページを要求して WP がエラーを返し、`complete()` で「End」が出る。0 件のときも同じく「End」が出る。
- 外側は `<div class="infinite-loading-container">`（`clear: both; text-align: center`）、その中の `<div class="infinite-status-prompt">` に Loader または `<span><div>End</div></span>` が入る。slot に要素を渡しているので、既定の `color: #666; font-size: 14px; padding: 10px 0` は付かない。
- トップページは無限スクロールなし。

### 4.2 静的 JSON

- `/data/{type}/{page}.json`（type は tip / clip / lab）、`/data/{tax}/{id}/{page}.json`（tax は tips / clips / labs）を、1 ページ目から最後のページまで出す。0 件のタームは `1.json` に空の配列を出す。
- 中身は 1 件の表示に必要なものだけにする: `{ items: [{ type, slug, path, title, date, dateLabel, primaryTag, clipUrl?, eyecatch }], page, last, total }`。`path` は `postPath()` で作ってから入れる。`eyecatch` はアイキャッチ SVG の URL（`/eyecatch/{type}/{id}.svg`）の文字列。
- 試作で `src/pages/data/[type]/[page].json.ts` の `getStaticPaths` から JSON が出ることを確認した（試作で確認）。`/data/...` は sitemap に入れない。
- JSON の総量の目安: clip が 103 ページで最も多い。1 件 300 バイト程度として 1 ファイル 3KB 前後（未確認。実データで測る）。

### 4.3 ブラウザ側（`scripts/infinite-list.ts`）

- `ArticleList.astro` は 1 ページ目の 8 件を HTML で出す。無限スクロールを使う一覧では、さらに次を出す。
  - `Article.astro` を空のデータで描いた `<template data-article-template>`。Astro のスコープ用属性（`data-astro-cid-*`）が `<template>` の中身にも付き、複製した要素にコンポーネントの CSS が当たる想定（未確認。実装の最初に確かめ、付かない場合は `Article` の CSS だけ `is:global` にする）。
  - 旧来と同じ構造の `<div class="infinite-loading-container">` と、その中の Loader と End。
  - `data-endpoint="/data/tip/"`、`data-page="1"`、`data-total="165"` などの属性。
- script は `IntersectionObserver` を `rootMargin: '0px 0px 100px 0px'` で使い、旧来の「下端から 100px」に合わせる。読み込み中は Loader を出し、終わったら隠す。
- 出し分けは旧来の規則をそのまま再現する。
  - 1 ページ目の件数が 8 の倍数でないときは、読み込み口を出さない（ビルド時に決められる）。
  - 最後のページを読んだ後、合計件数が 8 の倍数なら End を出し、そうでなければ読み込み口を消す。
  - 0 件のタームは最初から End を出す。
- `Article` の HTML を script 側で組み立てないのは、マークアップを `Article.astro` の 1 か所にまとめておくため。

## 5. 関連記事、前後記事、メニューのターム一覧

### 5.1 関連記事

旧実装（`EntryRelated.vue`）: `GET /wp-json/wp/v2/{type}?orderby=date&custom_per_page=3&filter[meta_key]=primary-tag&filter[meta_value]={primary-tag}` をブラウザから呼んでいた。

src から読み取れる条件:

- 同じ type、ACF の `primary-tag` が同じ、日付の新しい順、3 件。
- 自分自身を除外する指定はない。自分が該当するので、3 件のうち 1 件は自分自身になっていたはず。
- `primary-tag` の比較で大文字小文字を区別したかは、WP の MySQL の照合順序しだいで未確認。WP の既定の照合順序なら区別しない。旧データには `javascript` / `JavaScript` / `javaScript`、`wordpress` / `WordPress`、`Createjs` / `CreateJs` / `createJS` などが混ざっている（旧データで確認）。
- `filter[...]` は rest-filter プラグインが前提（nuxt.config.js のコメント）。プラグインが有効だったかは未確認。無効なら絞り込みなしの新しい 3 件だった。

新しい実装（`lib/posts.ts` の `related(all, post)`）の既定: 同じ type、`primaryTagKey()` が一致、新しい順、3 件、自分自身を含める（旧挙動どおり）。`primaryTag` が空の記事は関連記事なし。

primaryTag の比較用の関数は、アイキャッチ担当の提案で `src/lib/primary-tag.ts` に置き、アイキャッチと共有する。ただし関連記事とアイキャッチでは粒度を分ける。

- `primaryTagKey(raw)`: 関連記事用。前後の空白を取り、小文字にし、打ち間違いの表（`TYPOS`）で直す。空白と大文字小文字の扱いは旧 WP の比較（MySQL の既定の照合順序なら大文字小文字を区別せず、末尾の空白も無視する。未確認）に近い。
- `normalizePrimaryTag(raw, termSlugs, type)`: アイキャッチ用。中で `primaryTagKey` を使い、20〜25 のカテゴリにまとめる。関連記事に使うと、別のタグの記事まで関連として出て旧来との差が大きくなるので使わない。
- `TYPOS` はアイキャッチ担当が、明らかな綴りの誤り 7 つ（`aniamtion`、`portpolio`、`typograph`、`edudation`、`holizon`、`spase`、`faniture`）に絞った。`sport` / `sports` のように別の語として通るものは入れていない。値の種類は、生の値 181、空白を取って小文字にすると 168、`primaryTagKey` で 163（アイキャッチ担当の集計）。
- 打ち間違いを関連記事でも同じタグとして扱うのは旧来から変わる点なので、ユーザー確認にする。案は「扱う」。扱わないことになった場合は、関連記事だけ `TYPOS` を通さない比較にする。
- frontmatter の `primaryTag` はエクスポーターが前後の空白だけ取った生の値で、カードの表示にはこの値をそのまま使う。

ユーザー確認: 自分自身を除外したほうが自然なので、除外する案も出す。除外すると、同じタグの記事がない記事では関連記事の枠が空になる（旧来も見出しだけ出る形はありえたので、空でも枠は出す）。

### 5.2 前後記事

- 旧サイトの `prev` は 1 つ古い記事、`next` は 1 つ新しい記事。同じ type の中で日付順。
- 旧ページに残る `prev` / `next` と「同じ type の日付降順で隣り合う記事」を比べると、tip 165 / 165、clip 816 / 816、lab 47 / 47 件で一致した。日本語 slug の 2 件は旧ページがないので比べられないが、2 件を並びに含めたときに他の記事の前後が一致するので、並びには入っていたことになる（旧データで確認）。同じ日時の記事はないので、同順位の扱いは考えなくてよい。
- 新しい実装は `neighbors(all, post)` で計算する。frontmatter の `legacy.prev` / `legacy.next` は表示には使わず、テストで計算結果と比べるためだけに使う（10 章）。
- 前後記事のタイトルは旧来どおり `v-html` 相当（`set:html`）ではなく文字列として出す。エクスポーターがタイトルの文字参照（`&#8217;` など）をデコード済みで出す前提。

### 5.3 メニューのターム一覧

- 旧実装（`Menu.vue`）は `/tips?page=1` などをブラウザから呼んでいた。
- ブリーフには「WP の既定は名前順の先頭 10 件」とあるが、この WP では当てはまらない。旧 `nuxt.config.js` の sitemap と generate は同じ `/tips`（パラメータなし）を呼んでいて、旧 sitemap にはタームが tips 107 / clips 156 / labs 26 件入っている（旧データで確認）。`page=1` だけの指定でも同じ件数が返っていたはずなので、旧メニューは全タームを出していたと考えるのが妥当。
- 新しい実装は全タームを名前順（2.2）で出す（リーダーの判断で決定）。旧 WP は投稿 0 件のタームも返していた（`hide_empty` の既定は false）が、該当するのは名前不明の下の 2 件だけで、これはメニューから外す。リンクは `/{tax}/{id}/`。
- labs の 332 と 333 は投稿 0 件で、名前がどこにも残っていない（旧データで確認。Wayback Machine は 429 で見られなかった）。リーダーの判断でメニューから外す。ページ `/labs/332/` `/labs/333/` は旧 URL なので 0 件の一覧として出す。
- 全ページに約 290 本のリンクが入る。1323 ページぶんの HTML が増えるが、1 ページあたり 30KB 前後の増加の見込み（未確認。実データで測る）。

## 6. head と SEO

### 6.1 タイトルと説明文（旧 HTML で確認）

| ページ | title | description |
| --- | --- | --- |
| トップ | `webmanab.html／ウェブまなぶ` | `ウェブ制作のあれこれについて学習したことをメモしたりクリップしたり気ままに綴っていきます。` |
| `/{type}/` | `{type} \| webmanab.html／ウェブまなぶ` | `{type} archive page` |
| `/{tax}/{id}/` | `{type} \| webmanab.html／ウェブまなぶ`（`tips` ではなく `tip`） | `{type} archive page` |
| 記事 | `{title} \| webmanab.html／ウェブまなぶ` | 抜粋 |

- 旧サイトの記事の description には `<p>…..more</p>` のように HTML がそのまま入っていた。新しくはエクスポーターが出すプレーンテキストの `excerpt` を使う。
- サイト名・説明文は `lib/site.ts` に定数で持つ。

### 6.2 OGP と Twitter

- 旧サイトは `name="og:*"` で出していて、さらに PWA モジュールが `property="og:*"` で別の値（`webmanab.html projexct` など）を重ねていた（旧データで確認）。新しくは `property="og:*"` で 1 組だけ出す。
- `og:title` / `og:description` は title / description と同じ。`og:locale` は `ja_JP`、`og:type` は旧来どおり全ページ `website`、`og:url` は canonical と同じ（旧来は常にトップの URL だった）。
- `og:image` / `twitter:image` は記事ページならその記事の OGP 画像（6.6）、それ以外は `/ogp.png`。どちらも `SITE_URL` からの絶対 URL。
- `twitter:card` は `summary_large_image`、`twitter:site` は `@uto_ao`（旧来どおり）。

### 6.3 canonical と SITE_URL

- `astro.config.mjs` で `site: process.env.SITE_URL ?? 'https://webmanab.netlify.app'`。設定ファイルでは `process.env` が使える（公式ドキュメント）。
- canonical は `new URL(Astro.url.pathname, Astro.site)`。日本語 slug でもエンコード済みのパスになる（試作で確認）。
- サイト内の絶対 URL（OGP、RSS、sitemap、シェア）はすべて `Astro.site` から作り、`webmanab-html.com` を書き込まない。

### 6.4 RSS

- `src/pages/feed.xml.ts` で `@astrojs/rss` を使い、`/feed.xml` に出す（旧来と同じパス）。tip の新しい 50 件。
- 項目: `title`、`link`（`postPath()`）、`pubDate`、`description`（`excerpt`）、`content`（本文の HTML）。本文の HTML は `entry.rendered.html` で取れて、ハイライトと見出し id が入った状態になっている（試作で確認）。`content` は `content:encoded` として出る（試作で確認）。
- 旧 feed にあった `category: frontend` と contributor は `customData` で足す。
- 本文中のサイト内リンクが相対パスだと RSS リーダーで切れる。エクスポーターがサイト内リンクをどう書くかによる（未確認。調整事項）。

### 6.5 sitemap

- `@astrojs/sitemap` は使わない。この統合は `sitemap-index.xml` と `sitemap-0.xml` を出し、旧来の `/sitemap.xml` にならない（公式ドキュメント、試作で確認）。
- `src/pages/sitemap.xml.ts` で自分で出す。中身は 3.1 のページ一覧（404 と `/data/` を除く）で、URL は `postPath()` と `Astro.site` から作る。ページ一覧を作る関数は `getStaticPaths` と共有して、ずれが起きないようにする。

### 6.6 OGP 画像の受け口

- SNS は SVG を読まないので PNG が必要。アイキャッチ担当の SVG をビルド前に PNG にする。
- 置き場所: `public/og/{category}.png`。カテゴリ単位で作る（アイキャッチ担当の試作では 23 枚）。記事ごとには作らない。生成物なので `public/og/` は `.gitignore` に入れる。
- 変換は `scripts/build-og.mjs` を `prebuild` で走らせる。pnpm 11.28.6 で `prebuild` が `pnpm run build` の前に走ることは確かめた（試作で確認）。変換の道具は `@resvg/resvg-js` を第一候補にする（統合計画 README.md の決定）。Netlify のビルドで動かなかったときは `@resvg/resvg-wasm` に差し替える。wasm 版では、Node 26 で `.mjs` から `src/lib` の `.ts` を直接 import して 23 枚出ることをアイキャッチ担当が確かめている。サイズは 05-eyecatch.md に従う。
- 記事ごとのアイキャッチ SVG は、アイキャッチ担当が `src/pages/eyecatch/[type]/[id].svg.ts`（静的エンドポイント、`getStaticPaths` で全記事）でビルド時に出す。SVG はコミットしない。URL は WP の post id を使った `/eyecatch/{type}/{id}.svg`。slug は日本語を含むものがあるので使わない。post id は type をまたいでも重複しない（旧データで確認）。`src/pages/eyecatch/[type]/[id].svg.ts` から `dist/eyecatch/tip/2883.svg` のようにファイルとして出ることを確かめた（試作で確認）。
- サイト側は `src/lib/eyecatch/`（アイキャッチ担当が用意）の `eyecatchFor(post)` を呼ぶ。入力は `{ type, primaryTag, terms: [{ slug }], id }`、戻り値は `{ category, svg: '/eyecatch/{type}/{id}.svg', og: '/og/{category}.png' }`。`svg` は `<img src loading="lazy">` に、`og` は `og:image` に使う（`Astro.site` で絶対 URL にする）。

### 6.7 旧 Service Worker の後始末

旧 `sw.js` は Workbox で、`/` を含む全リクエストを NetworkFirst で扱っていた（旧データで確認）。同じパスに次の内容を置く。

```js
// public/sw.js
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    for (const key of await caches.keys()) await caches.delete(key);
    await self.registration.unregister();
    for (const client of await self.clients.matchAll({ type: 'window' })) client.navigate(client.url);
  })());
});
```

ブラウザが更新を確かめるときに `sw.js` がキャッシュされていないよう、`Cache-Control: no-cache` をインフラ担当に設定してもらう。実際に旧 SW が外れるかは未確認（本番で旧 SW を登録したブラウザでしか確かめられない）。

## 7. ブラウザ側の script

どれも `src/scripts/` に置き、使う部品の中で `<script>import '../scripts/xxx';</script>` と書く。Astro がそのページにだけ入れ、小さければ HTML に埋め込む（公式ドキュメント）。

| script | 読むページ | 内容 |
| --- | --- | --- |
| `menu.ts` | 全ページ | `.menu__btn` で `.menu` の `is-open` を切り替える。`pageshow` で `event.persisted` のとき（戻るボタンで bfcache から戻ったとき）は閉じる |
| `header-fixed.ts` | 全ページ | 旧来の条件 `innerWidth >= 1080 && scrollY > 45` で `.header` と `.header__inner` に `is-fixed` を付け外しする。旧来は毎フレーム調べていたが、`scroll` と `resize`（passive）を rAF でまとめる形にする |
| `toc.ts` | tip | 目次の開閉（`is-open`）と、項目を押したときのスクロール。旧来の vue-scrollto の設定（1000ms、`cubic-bezier(1, 0, 0, 1)`、上に 65px 余白）を rAF とベジェ曲線の計算で再現する |
| `image-fade.ts` | 一覧のあるページ | `Article` の画像が読み終わったら属性を `loading` から `loaded` に変え、旧 CSS の `opacity` の切り替えを効かせる |
| `infinite-list.ts` | `/{type}/`、`/{tax}/{id}/` | 4.3 |
| `share.ts` | 記事 | 7.6 |

### 7.1 ページ遷移でメニューを閉じる旧挙動

旧サイトは SPA の画面遷移の `leave` でメニューを閉じていた。新しくはリンクを押すと毎回ページを読み込み直すので、メニューは閉じた状態で始まる。追加の処理は bfcache から戻ったときの対応だけでよい。

### 7.2 目次のリンク

旧来は `href="#"` で、クリックを止めて JS でスクロールしていた。新しくは `href="#a0"` のように実際のアンカーを書き、JS で既定の動きを止めてスクロールする。JS が動かなくても見出しに飛べる。見た目は変わらない。

### 7.3 画像のフェード

旧 CSS は `img[lazy='loading']` / `img[lazy='loaded']` という独自属性を見ている。`lazy` は HTML の属性として正しくないので、`data-lazy` に変え、CSS の属性セレクタも合わせて直す。動きは変わらない。アイキャッチは外部ファイルの SVG を `<img>` で読む形に決まったので、この script はそのまま使う。

### 7.4 ヘッダー固定の breakpoint

1080 は `$desktop` と同じ値。script に定数で書くか、`matchMedia('(min-width: 1080px)')` を使う。後者にする。

### 7.5 scroll 系の負荷

旧来は rAF を止めずに毎フレーム回していた。新しくはスクロールしたときだけ計算する。

### 7.6 Web Share API のボタン

- `navigator.share` があれば `{ title, url }` で開く。`AbortError`（利用者が閉じた）は無視する。
- なければ `navigator.clipboard.writeText(url)` で URL をコピーし、ボタンの文言を一定時間だけ変えて知らせる。文言とデザインはアートディレクション担当。
- `url` は canonical と同じもの。

## 8. スタイルの取り込み方

### 8.1 グローバル変数と mixin

旧来は `@nuxtjs/style-resources` で `_variable.scss` と `_mixin.scss` を全コンポーネントの先頭に足していた。Vite の設定で同じことをする（試作で確認）。

```js
// astro.config.mjs（抜粋）
vite: {
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "/src/styles/foundation/variable/_variable.scss", "/src/styles/foundation/mixin/_mixin.scss";\n`,
        silenceDeprecations: ['import', 'slash-div', 'global-builtin', 'color-functions', 'if-function'],
      },
    },
  },
},
```

- 旧 SCSS をそのまま `src/styles/` に置いた状態で、`get-line-height()`、`space-scalar()`、`@include sizes()`、`@include tablet`、`lighten()` / `darken()`、`@for` を使うコンポーネントがエラーなくビルドでき、`lighten($thirdry-color, 8%)` が `#34a296` になった（sass 1.106.1。試作で確認）。
- 旧 SCSS は `@import` と `/` の割り算と組み込み関数のグローバル呼び出しを使っていて、Dart Sass 3 で使えなくなる（sass の警告で確認）。今回は見た目を変えないことを優先して警告を止めるだけにし、`@use` への書き換えは別の作業として残す。
- `sass` は `package.json` に直接入れる。

### 8.2 scoped と unscoped

- `scopedStyleStrategy: 'attribute'`（v7 の既定値。設定ファイルにも明示する）。`data-astro-cid-*` 属性で範囲を絞る（試作で確認）。
- 旧 `<style scoped>` は `.astro` の `<style lang="scss">` に、旧 `<style>`（unscoped）は `<style lang="scss" is:global>` にする。unscoped だった部品: `EntryAd`、`EntryContent`、`EntryDemo`、`Header`、`Menu`、`MenuList`、`MenuTitle`。
- 旧 `layouts/default.vue` の unscoped style（`@font-face` と `_reset` / `_base` / `_utility` の読み込み）は `src/styles/global.scss` にして `Default.astro` から import する。
- Vue の scoped と Astro の scoped の違い:
  - Vue は子コンポーネントの根要素にも親のスコープ属性を付けた。Astro は付けない。親から `class` を渡して親の CSS を当てていた箇所は、子で `const { class: className, ...rest } = Astro.props` として `...rest` を根要素に広げる（公式ドキュメント「Passing a class to a child component」）。旧コードでこれに当たるのは `EntryClipFullImage` → `LazyImage` だけで、こちらは廃止になる。
  - Vue はセレクタの最後の要素にだけ属性を付けたが、Astro は各要素に付ける（試作の出力 `.loader[data-astro-cid-…]>span[data-astro-cid-…]` で確認）。`v-html` で入れた中身をスコープ付きの CSS で狙っている箇所があると当たらなくなる。旧コードでは本文の CSS は unscoped なので問題にならない。
  - `@keyframes` の名前は Astro ではスコープされない（試作で確認）。
- 空白の扱い: Astro 7 の既定 `compressHTML: 'jsx'` は要素の間の空白を消す（公式ドキュメント）。旧 HTML は `</li> <li>` や `previous <br>ー` のように空白を残していた（旧データで確認）。`compressHTML: true` にして HTML の規則で縮めると空白が残った（試作で確認）。こちらを使う。

### 8.3 フォント

旧来どおり Google Fonts の CSS（Open Sans、Source Code Pro）を `<link>` で読む。`MyYuGothicM` の `@font-face` は `global.scss` に入れる。フォントの扱いを変えるかはアートディレクション担当に任せる。

## 9. GA4 と AdSense

`astro:env` で型付きの環境変数を宣言する（公式ドキュメント）。この章の設定とタグは試作で動かしていない（未確認）。7 章の script も同じく未確認で、実装時に画面で確かめる。

```js
// astro.config.mjs（抜粋）
env: {
  schema: {
    GA4_ID: envField.string({ context: 'server', access: 'public', optional: true }),
    CONTEXT: envField.string({ context: 'server', access: 'public', optional: true }),
  },
},
```

- GA4: `Head.astro` で `GA4_ID` があるときだけ `gtag.js` の読み込みと初期化を出す。UA のタグは出さない。
- AdSense: `CONTEXT === 'production'` のときだけ出す。`CONTEXT` は Netlify がビルド時に入れる変数で、本番デプロイで `production` になる（Netlify の仕様。インフラ担当に確認）。ローカルとデプロイプレビューでは広告の枠（`.entry-ad` の二重線の箱）だけを出し、`<ins>` と読み込みは出さない。枠を残すのは、レイアウトの確認が本番と同じになるようにするため。
  - 読み込み: `AdScript.astro` を `Default.astro` の head に置き、`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2691922878827958` を `async` で読む。旧来の `enable_page_level_ads: false` の指定は今の AdSense のタグにはないので入れない（AdSense 側の自動広告の設定で管理する。未確認）。
  - 広告枠: `<ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-2691922878827958" data-ad-slot="…" data-ad-format="auto">` と `(adsbygoogle = window.adsbygoogle || []).push({})`。スロットは旧来どおり、本文の前が `6597241020`、本文の後と下部が `1102437429`（旧 HTML で確認）。下部（`EntryAdFoot`）は tip だけ。
- `public/ads.txt` はそのまま置く。

## 10. 型とテスト

- `tsconfig.json` は `astro/tsconfigs/strict` を継ぐ。`astro check` を `pnpm check` に入れる。
- Vitest 5 を `getViteConfig()` で設定する（公式ドキュメント。試作で Vitest 5.0.5 が動くことを確認）。テストは `TZ=UTC` を付けて走らせ、Netlify と同じ条件にする。
- テストの対象は、`astro:content` を通さずに書ける純粋な関数にする。記事は `src/content/posts/**/*.md` の frontmatter をテスト側で直接読み、同じ zod スキーマで検証してから関数に渡す。スキーマは `src/lib/schema.ts` に分けて、`content.config.ts` とテストの両方から import する。`astro/zod` から作ったスキーマを Vitest から import して使えることは確かめた（試作で確認）。

| テスト | 中身 |
| --- | --- |
| スキーマ | 全記事の frontmatter がスキーマを通る。`type` とディレクトリ名が一致する。`type/slug` が重複しない。ターム JSON がスキーマを通り、記事の `terms[].id` がターム JSON にある |
| ページ分割 | `paginate` が 8 件ずつ分ける。0 件で `[[]]`。「End を出すか」の判定が 4.3 の規則どおり |
| 前後記事 | `legacy` を持つ全記事で `neighbors()` の結果が `legacy.prev` / `legacy.next` と一致する。旧データでは 1028 件全部が一致している（旧データで確認）ので、ずれたらエクスポーターかこちらの不具合。`legacy` のない 2 件は比べない |
| 関連記事 | 同じ type だけ、大文字小文字を区別しない、新しい順 3 件、自分を含むかどうか（5.1 の決定に合わせる）、`primaryTag` が空なら 0 件 |
| 日付 | `+09:00` の日時を `TZ=UTC` で表示しても日付がずれない（試作で確認済みのテスト） |
| Markdown | `satteri` の `markdownToHtml` に本番と同じ設定とプラグインを渡し、info string `bath` の fenced code から `<pre class="hljs bash"><code class="bath">` と `<pre class="hljs scss"><code class="bath">` が旧サイトと同じ中身で出ること、言語なしで `<pre class="hljs"><code>` になること、元の中身が改行で終わらないブロックに改行が増えないこと、`a0` / `a00` の id、最初の h2 より前の h3 を飛ばすこと（すべて試作のテストで確認） |
| ルート一覧 | `getStaticPaths` と sitemap が使うパス一覧を作る関数の結果が、`test/fixtures/legacy-urls.txt`（旧 `urls.txt`）と一致する。旧一覧は小文字の `%e3…`、`postPath()` は大文字の `%E3…` なので、両側を `decodeURIComponent` してから集合として比べる |
| ビルド後の確認 | `pnpm build` の後に走らせるスクリプトで、`legacy-urls.txt` の全 URL をデコードして Unicode のパスに直し、対応する `index.html` が `dist/` にあることと、`dist/sitemap.xml` の URL 一覧（同じくデコードして比べる）と一致することを確かめる |

`legacy-urls.txt` は旧サイトの URL 一覧（33KB、本文は含まない）。`.snapshot/` はコミットしない決まりなので、この 1 ファイルだけをテストの材料としてコミットしてよいか、ユーザー確認にする。

## 11. 実装の順番とコミットの切り方

PR は 1 本。その中のコミットを次の単位で切る。各コミットの時点で `pnpm build` と `pnpm test` が通るようにする。

1. 旧ツール一式の削除と Astro の土台: `package.json`（astro 7.4.x、sass、vitest など）、`pnpm-lock.yaml`、`astro.config.mjs`（Markdown 以外）、`tsconfig.json`、`.nvmrc`、`static/` → `public/`。Nuxt 関連ファイル、`store/`、`mixins/`、`modules/`、`plugins/`、`api.config.js`、`yarn.lock` を消す。
2. スタイルの移設: `assets/sass` → `src/styles`、`global.scss`、`additionalData` の設定。
3. レイアウトと共通部品: `Default.astro`、`Head.astro`、Bar、Header、Wrapper、Title1/2、Menu（ターム一覧はまだ空）と script（menu / header-fixed）。
4. コンテンツの受け口: `content.config.ts`、`lib/schema.ts`、`lib/terms.ts`、`lib/posts.ts`、`lib/date.ts` とそのテスト。エクスポーターの出力がまだなら、テスト用の数件だけを置く。
5. Markdown パイプライン: `hljs.mjs`、`heading-ids.mjs`、satteri の設定とそのテスト。
6. 記事ページ: `{tip,clip,lab}/[slug].astro` と Entry 系の部品、目次、関連記事、前後記事、シェアボタン。
7. 一覧ページ: トップ、`{type}/index.astro`、`{tax}/[id].astro`、`Article`、`ArticleList`、Loader、静的 JSON、`infinite-list.ts`、`image-fade.ts`。
8. エクスポーターの出力（記事 Markdown とターム JSON）の取り込み。量が多いので単独のコミットにする。前後記事とルート一覧のテストをここで通す。
9. head まわり: OGP、canonical、`feed.xml.ts`、`sitemap.xml.ts`、404。
10. アイキャッチと OGP 画像: アイキャッチ担当のモジュールと `build-og.mjs` の組み込み。
11. 計測と広告: GA4、AdSense、`public/sw.js`。
12. Netlify の設定（インフラ担当の範囲）。

## 12. 他の担当との調整事項

### インフラ担当

- Netlify が `/clip/%e3%81%ad…/` を `dist/clip/ね - nt/index.html` に対応させるか（3.2）。
- スラッシュなしの URL を `/…/` に転送するか（3.3）、`/404.html` を自動で使うか（3.4）。
- `node_modules/.astro` のキャッシュを残すかどうかと、`astro build --force` にするか（2.6）。
- `CONTEXT` の値（9 章）、`GA4_ID` と `SITE_URL` の設定場所、`sw.js` の `Cache-Control`（6.7）。
- Lint と整形の道具（1.4）。

### Markdown エクスポーター担当

- コードブロックはリーダーの指示どおり fenced code。元の中身の最後の改行を外さずに書き、その後ろで改行してから閉じのフェンスを書く（描画側で 1 つ外す）。out-v4 を描画して、762 個中 757 個が旧サイトと同じ HTML（`<br>` が改行になる点を除く）になり、残り 5 個はエクスポーターが意図して直したものだけであることを確かめた（2.4）。
- 生 HTML で残る部分（`<dl>` など）は前後に空行を入れ、中に空行を入れない。出力は本設計と同じ satteri の設定で HTML に戻して、元の HTML と比べる（2.3）。
- 本文がない記事（clip 169 件、`_prefix`、日本語 slug の 2 件）も必ず出す（3.1、5.2）。
- 旧ページがない日本語 slug の 2 件は `legacy` を書かない（2.1）。
- `slug` はデコード済み、`date` は `+09:00` 付き、タイトルの文字参照はデコード済み、`excerpt` はプレーンテキスト。
- `clipUrl` の空 2 件と `v` 1 件、`primaryTag` の空 2 件の扱い（2.1）。
- labs 332 / 333 をターム JSON にどう書くか（メニューからは外し、ページは出す。5.3）。
- 本文中のサイト内リンク（`wp.webmanab-html.com` や `webmanab-html.com` を指すもの）をどう書き換えるか。相対にすると RSS で切れる（6.4）。

### アイキャッチ生成担当

- 合意済み: SVG はビルド時生成でコミットしない、URL は `/eyecatch/{type}/{id}.svg`、`<img>` で読む、OGP 用 PNG はカテゴリ単位、生成関数は `src/lib/eyecatch/`、primaryTag の正規化は `src/lib/primary-tag.ts` で共有（6.6、5.1）。
- 合意済み（追加）: `eyecatchFor(post)` の入力と戻り値、`primaryTagKey` / `normalizePrimaryTag` の分け方と `TYPOS` の範囲、PNG は `@resvg/resvg-js`（動かなければ wasm 版）で `public/og/` に出して `.gitignore`（5.1、6.6）。
- 残り: `/eyecatch/*` のキャッシュ設定（インフラ担当とも）、前後記事ナビの背景に SVG を使うか（1.3）。

### アートディレクション担当

- Web Share ボタンの見た目とコピーしたときの表示（7.6）。
- 404 ページの見た目（3.4）。
- `EntryClipFullImage` 廃止と、画像の代わりにアイキャッチが入る箇所（Article、tip の本文の後、clip のリンク、前後ナビ）の見え方。
- `compressHTML: true` で旧来と同じ空白になっているかを、画面の比較で確かめてもらう（8.2）。

## 13. ブリーフの受け渡し形式について変えたほうがいい点

- ターム JSON の並び順は意味を持たせない（サイト側で名前順に並べる）と明記する。並び順をファイルに頼ると、読み方によって崩れる（2.2）。
- 投稿 0 件で名前が分からないターム（labs 332 / 333）はメニューから外すことに決まった。ターム一覧のページ（`/labs/332/` など）は旧 URL なので出す。ターム JSON には名前なしで入れるか、別の一覧で持つかをエクスポーター担当と決める。
- 記事 frontmatter の `slug` は Astro の glob loader で特別な意味（エントリ id の上書き）を持つ。サイト側で `generateId` を使って避けるので形式は変えなくてよいが、ブリーフに注記しておく（2.1）。
- `legacy` は省略できるものにする。旧ページがない日本語 slug の 2 件には値がない。形はそのままでよく、前後記事のテストに使う。
- 本文の書き方の条件（コードブロックは fenced code で info string に元の class、生 HTML で残る部分の空行の入れ方）をブリーフに足す（2.3、2.4）。

## 14. ユーザーに確認が必要な点

リーダーの判断で決まったもの: メニューは全件を名前順、highlight.js 10.1.1 はビルド時だけ使ってよい、`test/fixtures/legacy-urls.txt` はコミットしてよい、labs 332 / 333 はメニューから外す。残りは次のとおり（関連記事、404、Amazon の画像は保留中）。

- 関連記事: 旧実装は自分自身を含めていたので、実装の既定は含める形にする。そのうえで、自分自身を除外する変更を提案する（5.1）。
- 関連記事で primaryTag の打ち間違い（`aniamtion` など）を同じタグとして扱うか。案は扱う（5.1）。
- 404 ページを新しく作るか（旧サイトは Netlify 既定のページだった）（3.4）。
- `EntryAdFoot` の Amazon の外部画像を残すか（1.3）。
