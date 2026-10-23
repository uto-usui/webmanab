# 02 アートディレクション: 見た目の仕様と基準

担当: アートディレクション。前提は `00-brief.md`。

この文書は、旧サイト（Nuxt 2.12）の見た目を正確に書き残し、Astro に移したあとも同じ見た目を保つための基準です。値はソースの変数やコメントから推測せず、次の 2 つを正として書いています。

1. `.snapshot/html/**/index.html` に入っている、ビルド済みのインライン CSS（`<style data-vue-ssr-id>`）と SSR の DOM
2. 本番（`https://webmanab.netlify.app`）を Chromium で開いて取った computed style と画面

ソースと出力が食い違う箇所は、出力のほうを書き、食い違いとして明記しました。

---

## 1. 基準スクリーンショット

### 1.1 置き場所と枚数

- 画像: `.snapshot/baseline/<page>-<width>.png` と `<page>-<state>-<width>.png`。64 枚。
- 要素ごとの computed style: `.snapshot/baseline/<page>-<width>.styles.json`。状態違いを除く 52 ページ分。
- 撮影条件の記録: `.snapshot/baseline/manifest-webmanab.netlify.app.json`（撮影時刻、Chromium 156.0.8078.4、macOS、各ページの HTTP ステータスと高さ）。
- 撮影スクリプト: `.snapshot/baseline/capture.ts`。`--base` で URL の基準を変えられるので、新サイトも同じスクリプトで撮る。

| ページ名 | パス | 選んだ理由 |
| --- | --- | --- |
| home | `/` | tip / clip / lab の 3 セクション |
| tip / clip / lab | `/tip/` など | 一覧（JavaScript を切って撮影。理由は 1.3） |
| tips-29 | `/tips/29/` | タームの一覧（javascript、64 件で最多） |
| tip-method-control | `/tip/method-control/` | dl 19 個、`h4 + dl`、pre、strong、目次 |
| tip-sass-pickup | `/tip/sass-pickup/` | demo リンク、jsfiddle の iframe、`h4 + pre` |
| tip-webgl-three-start | `/tip/webgl-three-start/` | ol、ul、h4、pre が多い |
| tip-dart-sass-with-nuxt | `/tip/dart-sass-with-nuxt/` | 本文で唯一の blockquote |
| clip-2016-jsconf-is | `/clip/2016-jsconf-is/` | 本文あり、clipImage あり |
| clip-a-is-for-albert | `/clip/a-is-for-albert/` | 本文なし |
| lab-createjs-node-motion | `/lab/createjs-node-motion/` | lab の記事 |
| 404 | `/baseline-not-found/` | Netlify 既定の 404 ページ（旧サイトに 404 はない） |

幅は 375 / 768 / 1080 / 1480。上の 13 ページ × 4 幅 = 52 枚がフルページです。tip は依頼の 3 本に、blockquote を含む唯一の記事を 1 本足して 4 本にしました。

状態違い（viewport の範囲だけ。fixed 要素が崩れないようにフルページにしていません）:

| ファイル | 撮り方 |
| --- | --- |
| `home-menu-open-{375,768,1080,1480}.png` | `.menu__btn` をクリックして 1.5 秒待つ |
| `tip-method-control-toc-open-{375,768,1080,1480}.png` | 目次の 120px 上までスクロールし、`.entry-toc__title` をクリックして 1 秒待つ |
| `home-header-fixed-{1080,1480}.png`、`tip-method-control-header-fixed-{1080,1480}.png` | 300px スクロールして 0.8 秒待つ |

合計 52 + 4 + 4 + 4 = 64 枚。

### 1.2 撮影条件（capture.ts に固定してある）

- 通信: base の host と `fonts.googleapis.com` / `fonts.gstatic.com` 以外は全部止める。WP の画像、AdSense、GA、Amazon、jsfiddle の iframe も止まる。
- Service Worker は block。旧サイトの PWA キャッシュが混ざらないようにするため。
- `deviceScaleFactor: 1`、viewport の高さは 375→812、768→1024、1080→900、1480→900。`locale: ja-JP`、`timezoneId: Asia/Tokyo`。
- `load` を待ったあと、ページを最後までスクロールして先頭に戻し、`document.fonts.ready` と 1.5 秒を待ってから `animations: 'disabled'` で撮る。
- `networkidle` は使わない。WP のホストへの通信が終わらず 60 秒でタイムアウトしたため。
- 同じ条件で 2 回撮って 52 枚をピクセル比較し、52 枚とも完全に一致することを確かめた。新旧の差分はそのまま見た目の差と考えてよい。

実行方法（playwright はリポジトリに入れない。今回は scratchpad に入れたが、scratchpad はセッションが終わると消える）:

```sh
mkdir -p <任意の作業ディレクトリ> && cd <任意の作業ディレクトリ>
pnpm add playwright@1.64.1      # 基準を撮ったバージョン。Chromium 156.0.8078.4 が入る
node .snapshot/baseline/capture.ts --base http://localhost:4321 --out <新サイトの保存先> --styles
```

capture.ts は cwd から playwright を探すので、playwright を入れたディレクトリで実行する。

capture.ts は旧サイトの class 名（`.menu__btn`、`.entry-toc__title`、`.entry-toc`）でクリック先を探します。新サイトでもこの class 名を保つ前提です。

### 1.3 撮影でわかった本番の今の状態

- 一覧ページ（確認したのは `/tip/` `/clip/` `/lab/` `/tips/29/` `/clips/69/` `/labs/173/`）は、読み込みから 2.5 秒以内に Nuxt の「Network Error」画面に置き換わる。生成済み HTML には本来の一覧（8 件）が入っているので、一覧の 16 枚は JavaScript を切って撮った。トップページ `/` はこの現象が起きない。原因は未確認（WP API への再取得が走っていると見ているが、コードでは確かめていない）。
- 画像はすべて読み込めない（`wp.webmanab-html.com` が名前解決できない）。一覧のサムネイルはグレーの箱、前後記事ナビの背景はグレーの半透明だけになる。
- メニューのターム一覧と関連記事は空。
- 目次は、閉じた状態では中身が空の `<ul>` だが、開くと中身が描画される（4.12 参照）。

---

## 2. デザイントークン

### 2.1 色

出力 CSS に実際に現れる色だけを挙げます（`_color.scss` には使われていない `$color-*` が多数あります）。

| 変数 | 値 | 主な使い道 |
| --- | --- | --- |
| `$primary-color` | `#f50057` | ずらした影（記事タイトル、関連記事、メニュー項目）、EntryHead 右下のコーナー影、demo のホバー文字色 |
| `$secondary-color` | `#ffd740` | メニューボタンの文字、メニュー見出し、一覧サムネイルのホバー影、Title1 ホバーの text-shadow |
| `$thirdry-color` | `#2a8379` | タグ・ターム項目のホバー影、メニューのオーバーレイ（`rgba(42,131,121,.85)`）、Title1 ホバーの text-shadow |
| `$white` / `$primary-bg-color` | `#eeeeee` | body の背景、暗い面の上の文字 |
| `$black` / `$text-color` | `#222831` | body の文字色、ストライプ、dl/ul の二重線（currentColor） |
| `$glay` | `#393e46` | 暗い面（EntryHead、タグ、記事タイトルの帯、メニュー、フレーム線） |
| `$color-black` | `#000` | `a` の既定色、`button` 等の文字色、選択色の文字 |
| `$color-gray-level4` | `#b9b9b9` | `::selection` の背景 |
| （直書き） | `rgba(255,255,0,.3)` | `strong` のマーカー |
| （直書き） | `#333` / `#fff` と hljs の 10 色 | コードブロック（7 章） |
| （Loader） | `#34a296` / `#287b72` | 無限スクロールのローダー。`lighten($thirdry-color, 8%)` / `darken($thirdry-color, 2%)` を計算した値 |

SNS ボタンのホバー影（`#455a9e` `#55acee` `#ea3033` `#00a4de` `#ee4256`）はシェアボタンの廃止で不要になります。

### 2.2 フォント

head で読み込んでいる Web フォント（Google Fonts の旧 API）:

```
https://fonts.googleapis.com/css?family=Open+Sans:400,400italic,700,700italic|Source+Code+Pro
```

| 用途 | font-family（出力） |
| --- | --- |
| body | `Open Sans, -apple-system, BlinkMacSystemFont, 游ゴシック体, Yu Gothic, YuGothic, ヒラギノ角ゴ Pro W3, Hiragino Kaku Gothic Pro, メイリオ, Meiryo, Helvetica Neue, Helvetica, Arial, ＭＳ Ｐゴシック, MS PGothic, sans-serif` |
| code | `Source Code Pro, monospace`（`.entry-content__inner code` だけ） |

- macOS の Chromium で実際に使われたフォントを DevTools Protocol（`CSS.getPlatformFontsForNode`）で確かめた結果: 英数字は Open Sans、日本語は YuGothic（YuGo-Medium / YuGo-Bold）、コードは Source Code Pro。Windows や Linux では日本語のフォントが変わる。基準画像は macOS で撮ったので、比較も macOS で行う。
- `font-weight: 600` が多く使われているが、読み込んでいるのは 400 と 700 だけなので、Open Sans は 700 の字形で描かれる（ヘッダーのロゴで `OpenSansRoman-Bold` を確認）。
- Google Fonts の URL を新しい API（`css2?family=`）に変えると、届くフォントファイルが変わる可能性がある。同じ URL をそのまま使う。
- `MyYuGothicM` の `@font-face`（`local()` だけ）が layout に定義されているが、font-family のどこからも参照されていない。消しても見た目は変わらない。
- body の `font-feature-settings` は、ソースでは `"palt"` だが、出力は `"palt", none` という無効な値になっていて捨てられ、reset の `"kern"` が効いている（computed で `"kern"` を確認）。つまりプロポーショナル詰めは効いていない。新サイトで `palt` を正しく書くと日本語の字間が詰まって見た目が変わるので、`font-feature-settings: "kern"` にそろえる。

### 2.3 modular scale

`_modular-scale.scss` のコメントにある表は `$line-height-unit: 0.25rem` 前提で、このサイトの実際の値とは違います。`_typograph.scss` で先に `$line-height-unit: 1rem * 0.8`（0.8rem）が定義され、`_modular-scale.scss` の `0.25rem !default` は効いていません。以下は 0.8rem で計算し、出力 CSS と突き合わせた表です（1rem = 16px）。

`sizes(d, l)` が出す値:

- font-size = `8 / (8 - d)` rem（d = 0 のときは `1rem`）
- line-height = `0.8rem × (k + l)`。k は font-size 以上になる最小の 0.8rem の倍数の係数。出力では `em` に換算された値になる。

| d | font-size | px | k | l=0 | l=1 | l=2 |
| --- | --- | --- | --- | --- | --- | --- |
| -3 | 0.72727rem | 11.64 | 1 | 12.8px | 25.6px | 38.4px |
| -2 | 0.8rem | 12.8 | 1 | 12.8px | 25.6px（`2em`） | 38.4px |
| -1 | 0.88889rem | 14.22 | 2 | 25.6px（`1.8em`） | 38.4px（`2.7em`） | 51.2px（`3.6em`） |
| 0 | 1rem | 16 | 2 | 25.6px（`1.6em`） | 38.4px（`2.4em`） | 51.2px |
| 1 | 1.14286rem | 18.29 | 2 | 25.6px | 38.4px（`2.1em`） | 51.2px |
| 2 | 1.33333rem | 21.33 | 2 | 25.6px（`1.2em`） | 38.4px | 51.2px |
| 3 | 1.6rem | 25.6 | 2 | 25.6px | 38.4px（`1.5em`） | 51.2px |
| 4 | 2rem | 32 | 3 | 38.4px | 51.2px（`1.6em`） | 64px |
| 5 | 2.66667rem | 42.67 | 4 | 51.2px | 64px | 76.8px |
| 7 | 8rem | 128 | 10 | 128px | 140.8px | 153.6px |

`get-line-height(d, l, n)` は上の line-height を root 基準の長さで返し、n 倍する。出力で確かめた例:

| 呼び出し | 出力 |
| --- | --- |
| `get-line-height(-2, 0, 1)` | 0.8rem |
| `get-line-height(-1, -1, 1)` | 0.8rem |
| `get-line-height(-1, 0, 1)` | 1.6rem |
| `get-line-height(-1, 0, 2)` | 3.2rem |
| `get-line-height(-1, 0, 3)` | 4.8rem |
| `get-line-height(0, 1, 1)` | 2.4rem |
| `get-line-height(0, 1, 2)` | 4.8rem |
| `get-line-height(0, 1, 3)` | 7.2rem |
| `get-line-height(7, -2, 1)` | 6.4rem |
| `get-line-height(7, 0, 1)` | 8rem |
| `get-line-height(7, 0, 2)` | 16rem |

縦のリズムは 0.8rem（12.8px）刻みです。本文の行の高さ 25.6px（1.6rem）がその 2 倍で、`pre` の 1 行も 25.6px になります。

`space-scalar(n)` = `n × 4px`。使われている値: 2→8px、4→16px、5→20px、6→24px、8→32px、10→40px、12→48px、14→56px、16→64px、30→120px、50→200px、75→300px、90→360px、232→928px。`space-scalar(-5)` は -20px。

`$space-*`（rem。0.4rem 単位のフィボナッチ）: `$space-unit` 0.4rem、`$space-1` 0.8rem、`$space-2` 1.2rem、`$space-3` 2rem、`$space-4` 3.2rem、`$space-5` 5.2rem、`$space-6` 8.4rem。`$font-size-l2` は 1.33333rem。

### 2.4 ブレークポイント

| 名前 | mixin | 出力された media query |
| --- | --- | --- |
| mobile | `@include mobile` | `screen and (max-width: 767px)` |
| tablet | `@include tablet` | `print, screen and (min-width: 768px)`（print を含む） |
| desktop | `@include desktop` | `screen and (min-width: 1080px)` |
| widescreen | `@include widescreen` | `screen and (min-width: 1480px)` |
| fullhd | `@include fullhd` | `screen and (min-width: 1700px)`（utility の `.is-*-fullhd` だけ。コンポーネントでは未使用） |

`tablet` に `print` が含まれるので、印刷時はタブレット以上のレイアウトになります。

### 2.5 イージング

使われているもの:

| 変数 | 値 | 使い道 |
| --- | --- | --- |
| `$easeOutQuart` | `cubic-bezier(.165,.84,.44,1)` | ずらした影のホバー全般（0.25s）、demo（0.45s） |
| `$easeOutQuint` | `cubic-bezier(.23,1,.32,1)` | 本文リンク（0.35s）、前後記事ナビ（0.3s / 0.35s） |
| `$easeInOutSine` | `cubic-bezier(.445,.05,.55,.95)` | ヘッダーロゴの縮小（0.3s）、目次の開閉（0.4s） |
| `$easeInOutQuint` | `cubic-bezier(.86,0,.07,1)` | メニュー本体のスライド（0.85s） |
| `$easeInOutExpo` | `cubic-bezier(1,0,0,1)` | メニュー内側の回転（0.85s）、オーバーレイ（0.4s） |
| `$easeOutSine` | `cubic-bezier(.39,.575,.565,1)` | メニューボタン（0.45s、遅延 0.35s） |
| `$easeInOutQuart` | `cubic-bezier(.77,0,.175,1)` | 目次の open/close 表示（0.2s） |
| `$easeInQuart` | `cubic-bezier(.895,.03,.685,.22)` | Title1 の「All View」（0.45s） |
| `$easeTitle` | `cubic-bezier(.54,-.7,.52,1.7)` | Title1 の角括弧の線（0.45s） |
| （Loader） | `cubic-bezier(.005,.56,.58,1.59)` | ローダーの棒（1s、無限） |
| （vue-scrollto） | `[1, 0, 0, 1]`、1000ms、offset -65 | 目次からの移動 |

`_timing.scss` のそれ以外（`$time*`、`$easeSmoothOut` など）は使われていません。

---

## 3. グローバル CSS

layout（`layouts/default.vue`）の unscoped な `<style>` で、reset → base → utility の順に読み込まれています。そのあとに Nuxt の `.nuxt-progress`（白、高さ 2px）が先頭に入っています。

### 3.1 reset と base で実際に効いているもの

- `* { padding:0; margin:0; font:inherit; text-decoration:none; vertical-align:baseline; list-style:none; border:0 }`、`*, ::before, ::after { box-sizing:border-box }`。見出しや pre を含め、全要素が親のフォントを継ぐ。pre が既定の等幅にならないのはこのため。
- `html { font-size: 62.5% }` のあとに base の `html { font-size: 16px }` が来るので、1rem = 16px。
- `body { line-height: 1; text-align: center; letter-spacing: .01em; color: #222831; background: #eee; -webkit-font-smoothing: antialiased; font-feature-settings: "kern" }`（palt は 2.2 のとおり無効）。
- `body` が `text-align: center` なので、何も指定していない要素は中央寄せになる（EntryHead、目次の見出し、demo リンクの行、メニュー見出し以外）。
- `a { color: #000; cursor: pointer }`。下線はない（reset の `text-decoration: none`）。
- `img, svg { vertical-align: bottom }`、`img { max-width: 100% }`、`br { display: block; line-height: 0 }`。
- `button, input, select, textarea` は見た目を全部消している（背景なし、枠なし、`outline: 0`、`appearance: none`、色 #000）。
- `::selection { color:#000; background:#b9b9b9 }`。
- `img[lazy=loading] { opacity:0 }`、`img[lazy=error] { opacity:1 }`、`img[lazy=loaded] { opacity:1; transition:.8s }`（vue-lazyload の状態属性。5.6 参照）。

### 3.2 utility

使われているもの: `.u-text-left`、`.u-text-right`（どちらも `!important`）、`.is-sr-only`（EntrySns の中）。

出力されているが DOM で使われていないもの: `.u-text-center`、`.u-text-justify`、`.u-left/.u-right`、`.u-m{b,l,r,t}--*` 全部、`.u-absolute`、`.u-relative`、`.is-clipped`、`.is-hidden*`、`.is-{block,flex,inline,inline-block,inline-flex}*`、`.is-marginless`、`.is-paddingless`、`.is-unselectable`。新サイトでは使っているものだけ移せばよい。

### 3.3 使われていない CSS（.snapshot の HTML 1321 ページで class が一度も出てこないもの）

- `.entry-sns__title`、`.entry-related__title`（Title2 に置き換わっている）
- `.article-list__inner.js-tab-item`
- `.wrapper.article--line` と `::after`
- `components/Logo.vue` 全体（Nuxt の雛形のロゴ。どこからも使われていない）
- `.entry-toc_title:hover .entry-toc__title::after`（class 名の打ち間違いで、どの要素にも当たらない）
- `.menu-list__target:hover::after`（`::after` に content がない）
- `_section.scss`、`_crip.scss`、`_opacity.scss`、`_bg.scss`、`_z-index.scss`、`_family.scss`、`object/component/framework/_flex.scss` の中身

---

## 4. レイアウトとコンポーネント

表記: [scoped] は Vue の scoped style（出力では末尾の compound に `[data-v-xxxx]` が付く）。[global] は scoped なしの `<style>`。

### 4.1 Layout（`layouts/default.vue`）

```html
<div class="default-layout {route名}">   <!-- 例: index, tip-id, tip, tips-id -->
  <div class="bar"></div> ×4
  <header class="header">…</header>
  <main class="wrapper">…ページ…</main>
  <div class="menu__wrapper">…</div>
  <svg class="defs">…symbol×5…</svg>
</div>
```

- `.default-layout` 自身に当たる CSS はない。route 名の class も CSS からは使われていない。
- `.bar` [scoped] はページの外周を囲む 2px の線。`position:fixed; z-index:99; background:#393e46; pointer-events:none`、margin は 16px / 32px（768〜）/ 40px（1080〜）。
- DOM の並びに依存: `.bar:nth-of-type(1)` が上辺、`(2)` が下辺、`(3)` が左辺、`(4)` が右辺。`.default-layout` の子の `div` の 1〜4 番目である必要がある。bar より前に `div` を置くとずれる。

### 4.2 Header [global]

```html
<header class="header [is-fixed]">
  <div class="header__inner [is-fixed]">
    <h1 class="header__title"><a href="/">webmanab.html</a></h1>
    <nav class="header__nav">
      <ul class="header__nav-list">
        <li class="header__nav-item"><a class="header__nav-target" href="/tip/">tip</a></li>
        …clip, lab, about（about は "/" へ）
      </ul>
    </nav>
  </div>
</header>
```

- 〜1079px: 縦積みで中央寄せ。`.header__inner` の padding は 16px（上・左右）、768〜は 32px 全周。`.header__title` は margin-top 8.4rem / margin-bottom 1.2rem。
- 1080〜: `.header__inner` が `position:absolute; top:0; left:0; right:0; z-index:99; display:flex; justify-content:space-between; align-items:center; padding:56px 40px 0`。`.header__title` は padding-left 24px、margin 0。`.header__nav` は padding-right 104px（メニューボタンの分）。
- ロゴ `.header__title > a`: weight 600、色 #393e46、2rem、`transform-origin: left center`、`transition: transform .3s $easeInOutSine`。
- ナビ `.header__nav-target`: italic、#393e46、1.14286rem。項目の間は 40px（1080〜は 48px）。`+` セレクタ（`.header__nav-item + .header__nav-item`）。
- 固定状態は 5.2。

### 4.3 Menu / MenuList / MenuTitle [global]

```html
<div class="menu__wrapper">
  <nav class="menu [is-open]">
    <a class="menu__btn" href="#">menu</a>
    <div class="menu__inner">
      <div class="menu-list__wrapper">
        <h2 class="menu-title">tip</h2>
        <ul class="menu-list">
          <li class="menu-list__item"><a class="menu-list__target" href="/tips/{id}/">{name}</a></li>…
        </ul>
      </div>
      …clip, lab
    </div>
  </nav>
  <div class="menu__overlay"></div>
</div>
```

- `.menu__wrapper`: fixed で全面、z-index 9999、`pointer-events: none`、perspective 800px。
- `.menu`: fixed、z-index 9999、flex、margin 16/32/40px、閉じているとき `translateX(100%)`。
- `.menu__btn`: 64×64px、背景 #393e46、文字 #ffd740 の italic 600 大文字 0.8rem。閉じているとき `translateX(-64px)` で画面右上のフレームの内側に出ている。
- `.menu__inner`: 幅 `calc(100% - 64px)`、背景 `rgba(57,62,70,.95)`、`rotateY(5deg)`、`transform-origin: 0 50%`、`overflow-y: auto`。
- `.menu__overlay`: z-index 999、`rgba(42,131,121,0)`、`rotateY(10deg) translateX(-100%)`。
- DOM の並びに依存: `.menu.is-open + .menu__overlay`（overlay は `.menu` の直後の兄弟である必要がある）。
- `.menu-title`: #ffd740、600、capitalize、左寄せ、2rem（768〜 2.66667rem）、下線 `1px solid rgba(238,238,238,.5)`。
- `.menu-list`: flex wrap、padding 16px（1080〜 32px）、margin-left -5px。〜767px は `max-height: 360px; overflow: auto`。
- `.menu-list__target`: #eee、大文字、0.8rem（1080〜 0.88889rem）、padding `.6em .8em`。ホバーで背景 #222831、`box-shadow: -5px 5px 0 #f50057`、`translate(5px,-5px)`。

### 4.4 Wrapper [scoped] と SectionEntry / SectionList [scoped]

- `main.wrapper > div.wrapper__inner`: padding 左右 16/32/40px、margin-top 64px（1080〜 0）、margin-bottom 120px（1080〜 200px）、`overflow-x: hidden`。1080〜 は padding-top 40px、`.wrapper__inner` に padding-top `calc(40px + 8rem)`。
- `article.entry`（SectionEntry）: max-width 928px（768〜 992px、1080〜 1008px）、padding 上下 40px、左右 0 / 32px / 40px、中央寄せ。
- `section.section-list`（トップの各セクション）: `z-index:1`、margin-bottom 8rem（1080〜 16rem）。`::after` に 45 度のストライプ（幅 30%、最大 300px、高さ 16px、`repeating-linear-gradient(45deg, transparent, transparent 4px, #222831 0, #222831 5px)`）をセクションの間の中央に置く。

### 4.5 Title1 [scoped]（一覧の大見出し）

```html
<h2 class="h1"><span class="h1__inner"><a href="/tip">tip</a></span></h2>
```

- `.h1`: italic、bold、capitalize、8rem（128px）。全幅で同じサイズ（レスポンシブの指定なし）。
- `.h1__inner::after` 左上に 50×50px の角括弧（上と左の 2px 線、`left: -40px`）、`::before` 右下に同じもの（右と下、`right: -40px`）。ホバーで両方が幅 100%・高さ 2px の線に変わる（0.45s `$easeTitle`）。
- `a`: #222831。ホバーで `text-shadow: 150px 3px 0 #2a8379, -150px 3px 0 #ffd740`、`letter-spacing: -.05em`、上に「All View」（1.33333rem italic）が `rotateX(180deg) scale(.6)` から起き上がる。
- リンク先は末尾スラッシュなしの `/tip`（Netlify のリダイレクトで `/tip/` に行く）。tips/clips/labs のターム一覧では文字が `tips` 等になる。

### 4.6 ArticleList / Article [scoped]（一覧のカード）

```html
<div class="article-list">
  <div class="article-list__inner" infinite-wrapper>
    <article class="article-item">
      <div class="article-item__inner">
        <strong class="article-item__tag">{primary-tag}</strong>
        <a class="article-item__img-wrap" href="/{type}/{slug}/">
          <div class="article-item__img"><img lazy="…" data-srcset="…"></div>
        </a>
        <h3 class="article-item__title">
          <a class="article-item__target" href="…">{title}</a>   <!-- clip は clip-url へ target=_blank -->
        </h3>
        <p class="u-text-right"><time class="article-item__time" datetime="YYYY-MM-DD">YYYY-MM-DD</time></p>
      </div>
    </article>…
  </div>
  <!-- client-only: InfiniteLoading（5.7） -->
</div>
```

- `.article-list`: margin-top 6.4rem（1080〜 8rem）。`.article-list__inner`: flex wrap。
- `.article-item`: 幅 100% / 50%（768〜）/ 33.3333333%（1080〜）/ 25%（1480〜）、margin-bottom 30px。768〜 は `border-left: 2px solid`（currentColor）。
- `.article-item__tag`: inline-block、min-width 100px、italic、#393e46、0.72727rem、下線 2px、padding `0 4px 4px 1.2rem`。`::first-letter` は 2.66667rem、bold、文字色 #eee に 4 方向の 1px と `2px 3px` の影（#222831）で白抜き文字にしている。
- `.article-item__img-wrap`: block、幅 `calc(100% - 2.4rem)`、margin `1.2rem auto`。ホバーで `translate(10px,-10px)` と `box-shadow: -10px 10px 0 #ffd740`（0.25s `$easeOutQuart`）。
- `.article-item__img`: 16:9（`padding-top: 56.25%`）、背景 #393e46、`overflow: hidden`。中の `img` は absolute で上下左右中央、幅 100%、`opacity: 0`。`[lazy=loaded]` で `opacity: 1; transition: opacity .25s`。
- `.article-item__title`: margin `-6px 1.2rem 1.2rem`、justify、1rem / line-height 2.4em。
- `.article-item__target`: inline のまま、#eee の文字に #393e46 の背景（行ごとの帯）、padding `.2em .1em`。ホバーで `top:-5px; left:5px` と `box-shadow: -5px 5px 0 #f50057`。
- `.article-item__time`: italic、0.8rem、下線 2px、右寄せ。
- 詳細度の注意: `.article-item__img > img[data-v]`（0,2,1）が global の `img[lazy=error]`（0,1,1）に勝つので、読み込みに失敗した画像は透明のまま。

### 4.7 EntryHead [scoped]

```html
<header class="entry-head">
  <time class="entry-head__time" datetime="…">YYYY-MM-DD</time>
  <h1 class="entry-head__title">{title}</h1>
  <ul class="entry-head__list">
    <li class="entry-head__item"><span class="entry-head__target">uto usui</span></li>
    <li class="entry-head__item">／／</li>
    <li class="entry-head__item"><a class="entry-head__target" href="/{type}s/{term_id}/">{name}</a></li>…
  </ul>
</header>
```

- 背景 #393e46、padding 20px（768〜 `32px 48px`）、margin-bottom 8px（768〜 40px）、`z-index: 1`。
- 768〜: `::after` が左上に 40×40px の白いコーナー（上と左に 10px #eee、`box-shadow: -5px -5px 0 #393e46`）、`::before` が右下に同じ形（右と下、`box-shadow: 5px 5px 0 #f50057`）。〜767px は大きさだけあって線がない。
- `.entry-head__time`: 箱の上 20px に中央寄せ、italic 0.8rem、上に 2px の線（`::after`、top -6px）。
- `.entry-head__title`: #eee、中央、1rem / 1.6em（768〜 1.6rem / 1.5em）。
- `.entry-head__target`: #eee、大文字、0.8rem（768〜 0.88889rem）、padding `6px 8px 4px`。ホバーで `top:-5px; left:5px` と `box-shadow: -5px 5px 0 #2a8379`。
- `+` セレクタ: `.entry-head__item + .entry-head__item { margin-left: 8px }`。

### 4.8 EntryAd [global] / EntryAdFoot [scoped]

- `.entry-ad`: padding 0.8rem、margin 上下 3.2rem、`border: 6px double #222831`。中は `<ins class="adsbygoogle" style="display:block">`。広告を止めた基準画像では、枠だけの細長い箱（高さ約 37.6px）になる。
- 記事 1 本に 2 か所（EntryHead の直後と、本文のあと）。
- `ul.Ads-list`（tip だけ、ページの最後）: flex、`justify-content: space-around`、margin-top 4rem（768〜 6rem）。`li.Ads-list_item` は幅 100%（768〜 40%）、min-width 330px、`6px double #222831`。1 つ目が AdSense、2 つ目が Amazon アソシエイトの書籍画像。〜767px は `:last-child` を隠す（DOM の並びに依存）。

### 4.9 EntryDemo [global]

```html
<div><a class="entry_demo" href="{demo-url}" target="_blank">demo</a></div>
```

- tip のうち `demo-true` が true の 17 本だけ。EntryAd の直後、本文の前。
- 5rem、bold、#222831、大文字、inline-block、margin-bottom 3rem（1080〜 -2rem）。親の `div` は body の `text-align: center` を継ぐので中央に置かれる。
- `::after` に 60×60px のドット（`radial-gradient(#222831 20%, transparent 0)` を 2 枚、10px 間隔）を 45 度回して文字の後ろに置く。ホバーで文字が #f50057、ドットが 200×200px の矢印形（clip-path）に変わる（0.45s）。

### 4.10 EntryContent [global]

```html
<div class="entry-content">
  <div class="entry-toc__wrap">…</div>   <!-- tip だけ -->
  <div class="entry-content__inner">{本文 HTML}</div>
</div>
```

- `.entry-content`: margin-bottom 3.2rem（768〜 8.4rem）。
- 本文のスタイルは 6 章。hljs は 7 章。
- global なのは、本文が `v-html` で入っていて scoped の属性が付かないため。Astro でも同じ理由で global にする必要がある（11 章）。

### 4.11 アイキャッチ（記事ページ）、EntryClipLink、EntryClipFullImage

- tip: `.entry-content` の直後に `<img alt="{title}のアイキャッチ画像">` が直接 `article.entry` の子として入る（LazyImage）。データが壊れていて src がなく、1×1px の透明 gif のまま `lazy="loading"`（opacity 0）。見た目は 1px の隙間だけ。
- clip: `.entry-content` の直後に

  ```html
  <a class="entry-clip__img" href="{clip-url}" target="_blank"><img alt="{title}のアイキャッチ画像"></a>
  <img class="entry__img-full" alt="{title} overview image">   <!-- clipImage があるときだけ -->
  ```

  - `.entry-clip__img` [scoped]: block、`z-index: 1`、45 度のストライプの背景、`clip-path: polygon(0 50%, 0 0, 99% 0, 100% 66%, 100% 100%, 50% 100%, 0 100%)`、`transition: 1s`。`::after` に「visit to」（5rem bold #eee 大文字）を `scale(.1)` で中央に置く。中の `img` は `z-index: 2`。ホバーで clip-path が下に吹き出しの付いた形に変わり、「visit to」が `scale(1)`、画像が `opacity: .05`。
  - 今は画像が 1px なので、高さ 16px のストライプの帯になっている（基準画像で確認）。
  - `.entry__img-full` [scoped]: margin-top 120px。1px の画像なので、121px の空きになっている。
- lab: アイキャッチの要素はない。

### 4.12 EntryToc [scoped]（tip だけ）

```html
<div class="entry-toc__wrap">
  <section class="entry-toc [is-open]">
    <a href="#" class="entry-toc__title">table of contents<br>ー</a>
    <ul class="entry-toc__list">
      <li class="entry-toc__item">
        <a href="#" class="entry-toc__target">{h2 の文字}</a>
        <ul><li class="toc-item__child"><a href="#">_{h3 の文字}</a></li>…</ul>
      </li>…
    </ul>
  </section>
</div>
```

- `.entry-toc__wrap`: 768〜 margin 上下 56px。
- `.entry-toc`: `max-height: 120px`（768〜 140px）、`overflow: hidden`、padding `16px 8px`（768〜 左右 3.2rem）、上に `6px double`、下に `6px solid`（どちらも currentColor）。`transition: .4s $easeInOutSine`。
- `.is-open`: `max-height: 1400px; padding-bottom: 4.5rem`。項目が多い記事は 1400px で切れる。
- `.entry-toc__title`: block、大文字、`letter-spacing: .2em`、1rem / 1.6em（1080〜 1.33333rem / 1.2em）、中央寄せ（body を継ぐ）。`::after` で「open」/「close」を箱の下端（bottom 16px）の中央に italic で出す。
- `.entry-toc__list`: padding-left 2rem、`opacity: 0`（開くと 1、遅延 0.2s）。
- `.entry-toc__item`: `list-style-type: decimal`、左寄せ、`letter-spacing: .1em`、0.88889rem / 1.8em（768〜 1rem / 1.6em）。`+` で間隔 24px（768〜 32px）。
- `.toc-item__child`: margin-top 8px（768〜 16px）、0.8rem / 2em。文字の頭に `_` を付ける。
- `.entry-toc__target`: #222831。
- 目次の中身は、本文の h2 / h3 をクライアントで読んで作る。h2 に `id="a{n}"`、h3 に `id="a{n}{m}"` が付く。
- 旧実装では配列を添字で書き換えているので Vue が再描画せず、閉じた状態の DOM では `<ul>` が空。開くと `isOpen` の変化で再描画され、そこで中身が出る（`tip-method-control-toc-open-*.png` で確認）。見た目としては「開くと目次が出る」で、意図どおりに動いている。

### 4.13 Title2 [scoped] と EntrySns / EntryTag / EntryRelated [scoped]

Title2（`h3.title2`）は「share ー」「tag ー」「related ー」の見出し。中身は `{語} <br>ー`。

- `.title2`: italic、#393e46、左寄せ、`letter-spacing: .1em`、padding-left 0.2rem、0.88889rem。768〜 は padding-left 0.4rem、margin-bottom 1rem、1.33333rem。
- line-height は body の 1 のまま。`<br>` で「ー」が次の行に来て、短い横線のように見える。

EntrySns（廃止予定、9.1 で置き換え）:

- `section.entry-sns__wrap`: margin-top 2rem（768〜 5.2rem）。
- `ul.entry-sns`: flex、上下に `6px double`（currentColor）。`li.entry-sns__item` は width 25% が 5 つで、flex で縮んで 20% ずつになっている。
- `a.entry-sns__target`: block、padding 上下 1rem、22×22px の svg を中央に。ホバーで背景 #393e46、`translate3d(5px,-5px,0)`、サービス色の `box-shadow: -5px 5px 0`、svg が `fill: #eee` で `rotateY(1turn) translateZ(10px)`。

EntryTag:

- `section.entry-tag`: margin-top 2rem（768〜 5.2rem）。`ul.entry-tag__list`: flex wrap。`li.entry-tag__item`: margin-right 1.2rem。
- `a.entry-tag__target`: inline、#eee、#393e46 の背景、大文字、0.88889rem / 3.6em（行の高さで縦の間隔を作っている）、padding `.2em .5em .15em`。ホバーで `top:-5px; left:5px` と `box-shadow: -5px 5px 0 #2a8379`。

EntryRelated:

- `section.entry-related`: margin-top 2rem（768〜 5.2rem）、justify。768〜 は padding 1rem（1080〜 2rem）と `6px double`（currentColor）の枠。
- `li.entry-related__item`: line-height 1.7、`+` で間隔 1rem。
- `a.entry-related__target`: inline、#eee、#393e46 の背景、0.88889rem / 2.7em（1080〜 1rem / 2.4em）。ホバーで `top:-5px; left:5px` と `box-shadow: -5px 5px 0 #f50057`。
- 今は中身が空で、768〜 は二重線の枠と「related ー」だけが見えている。

### 4.14 EntryNav [scoped]（前後記事）

```html
<ul class="entry-nav">
  <li class="entry-nav__item entry-nav__item--prev u-text-left">
    <a class="entry-nav__target" href="/{type}/{slug}/">
      <div class="entry-nav__inner">
        <p class="entry-nav__text">previous<br>ー</p>
        <h3 class="entry-nav__title">{title}</h3>
      </div>
    </a>
    <div class="entry-nav__bg" style="background-image:url(…)"></div>
  </li>
  <li class="entry-nav__item entry-nav__item--next u-text-right">…next…</li>
</ul>
```

- `.entry-nav`: margin-top 2rem。768〜 は flex で、margin-left / right を `calc((100vw - 100%) / 2 * -1 + 32px)`（1080〜 40px）にして画面のフレームまで広げる。
- `.entry-nav__item`: `z-index: 5; overflow: hidden; perspective: 800px; transform-style: preserve-3d`。768〜 幅 50%。〜767px は `+` で間隔 1rem。
- `.entry-nav__target`: flex、縦中央、高さ 120px（768〜 `17.5vw`、最小 180px）。next は `justify-content: flex-end`。
- `.entry-nav__text`: italic、#eee、capitalize、1.14286rem（768〜 1.33333rem）。ホバーで #393e46 になり `letter-spacing: .2em`。
- `.entry-nav__title`: inline、#222831 の文字に #eee の背景、0.88889rem / 2.7em（768〜 1rem / 2.4em）。
- `.entry-nav__bg`: absolute で全面、`z-index: -1`、`background-size: cover; background-position: 50%`、`transition: .35s $easeOutQuint`。`::after` に `rgba(57,62,70,.7)` の面を `z-index: -2` で置く。`.entry-nav__bg` が stacking context を作るので、この面は背景画像の上に重なり、画像を暗く沈める。ホバーで prev は `rotateY(-45deg)`（軸は右端）、next は `rotateY(45deg)`（軸は左端）。
- 今は画像が届かないので、半透明のグレー（`#eee` の上の 70%）の面だけになっている。

### 4.15 Icon [scoped]

`<svg class="defs">` に twitter / facebook / google / hatena / pocket の `<symbol>`。`svg { display: none }`。シェアボタンの廃止で不要になる。

### 4.16 Loader [scoped]（無限スクロール）

- `div.loader > span ×20`: fixed で画面中央、z-index 9999。各 span は 7.5×7.5px、margin `0 2px`、背景 `#34a296`。
- `@keyframes temp { 50% { background: #287b72; transform: scale(1,5) } }` を 1s、無限、`cubic-bezier(.005,.56,.58,1.59)`。
- DOM の並びに依存: `span:nth-of-type(n)` に `animation-delay: n × .05s`（1〜20）。
- Vue の scoped では keyframes 名が `temp-data-v-…` に書き換えられていた。Astro では書き換わらないので、名前の衝突を避けるなら `loader-wave` などに変える。

---

## 5. 動きと状態

### 5.1 メニューの開閉

- `.menu__btn` のクリックで `.menu` に `is-open` を付け外しする（Vuex の `menuOpen`）。
- 開くとき: `.menu` が `translateX(100%)→0`（0.85s `$easeInOutQuint`）、`.menu__inner` が `rotateY(5deg)→0`（0.85s `$easeInOutExpo`）、`.menu__btn` が遅延なしで `translateX(-64px)→0`（メニュー本体の左端に付いて一緒に動く）、`.menu__overlay` が `rgba(42,131,121,.85)` で左から入る（0.4s）。
- 閉じるとき: ボタンは 0.35s 遅れて戻る。
- `.menu__inner` は開いたときに `pointer-events: auto`。`.menu__wrapper` は `pointer-events: none` なので、閉じているときは下のページを触れる。
- 基準画像: `home-menu-open-*.png`。

### 5.2 ヘッダーの固定

- 毎フレーム（requestAnimationFrame）`window.innerWidth >= 1080 && window.pageYOffset > 45` を見て、`.header` と `.header__inner` の両方に `is-fixed` を付ける。
- `.header__inner.is-fixed`: `position: fixed; height: 40px; padding-top: 0; padding-bottom: 0`。背景はなく、本文の上に重なる。ロゴは `.header.is-fixed .header__title > a { transform: scale(.85) }`（0.3s）。
- 768〜1079px でも `is-fixed` の class 自体は付かない（幅の条件）。
- 新サイトでは毎フレームの監視をやめて scroll / resize で判定してよい。見た目は同じになる。
- 基準画像: `*-header-fixed-{1080,1480}.png`。

### 5.3 目次の開閉と移動

- `.entry-toc__title` のクリックで `is-open` を切り替える。`max-height` が 120/140px → 1400px、`padding-bottom` が 4.5rem に変わり（0.4s）、`.entry-toc__list` が 0.2s 遅れて opacity 1。`::after` の文言が open → close。
- 項目のクリックで、`#a{n}`（h2）/ `#a{n}{m}`（h3）へ 1000ms、イージング `cubic-bezier(1,0,0,1)`、offset -65px でスクロールする（vue-scrollto）。CSS の `scroll-behavior` ではこのイージングを出せないので、素の `<script>` で `requestAnimationFrame` を使って書く。
- 基準画像: `tip-method-control-toc-open-*.png`。

### 5.4 ホバー表現（ずらした影）

共通の型は「`top:-5px; left:5px`（または `translate(5px,-5px)`）＋ `box-shadow: -5px 5px 0 {色}`、0.25s `$easeOutQuart`」。要素が右上に浮き、元の位置に色の影が残る。

| 対象 | 動き | 影の色 |
| --- | --- | --- |
| `.article-item__target`、`.entry-related__target` | top/left | #f50057 |
| `.entry-head__target`、`.entry-tag__target` | top/left | #2a8379 |
| `.menu-list__target` | translate、背景 #222831 | #f50057 |
| `.article-item__img-wrap` | translate 10px | #ffd740（10px） |
| `.entry-sns__target` | translate3d、背景 #393e46 | 各サービス色 |

ほかに、本文の `a` はホバーで #eee の文字と #393e46 の背景（0.35s）。Title1、demo、ClipLink、EntryNav のホバーはそれぞれの節を参照。

### 5.5 ページ遷移でメニューを閉じる

`nuxt.config.js` の `transition.leave` で、メニューが開いていれば閉じてから遷移していた（SPA の遷移）。Astro は通常のページ遷移になるので、遷移先のページは閉じた状態で始まり、何もしなくても同じ結果になる。View Transitions を入れる場合だけ、遷移の前に `is-open` を外す処理が要る。

### 5.6 画像の lazy とフェード

- vue-lazyload が `img` に `lazy="loading" | "loaded" | "error"` を付ける。
- 一覧のサムネイルは `opacity: 0` → `[lazy=loaded]` で 1（0.25s）。ほかの画像は global の `img[lazy=loaded] { transition: .8s }`。
- 新サイトでもこの属性名を使えば CSS をそのまま使える。`<img loading="lazy" lazy="loading">` にして、`load` イベント（または読み込み済みなら即）で `lazy="loaded"` に書き換える小さな `<script>` を置く案を推す。

### 5.7 無限スクロール

- ArticleList は `infinite` のとき（/tip/ /clip/ /lab/ とターム一覧）、件数が 8 の倍数なら vue-infinite-loading を出す。トップページには出ない。
- 読み込み中は Loader（4.16）が画面中央に fixed で出る。最後まで読むと「End」の文字が一覧の下に出る。DOM は `div.infinite-loading-container > div.infinite-status-prompt > span > div`。vue-infinite-loading 2.4.5 の既定の文字スタイル（#666、14px）は、slot に要素を渡しているので付かない。付くのは container の `clear: both; text-align: center` だけで、文字は body を継いで #222831・1rem。
- 新サイトでの一覧の出し方（全件を出すか、静的な JSON で続きを読むか）はアーキテクチャ担当の判断。続きを読む形にするなら、最初の 8 件、Loader、「End」の見た目をそのまま使う。

---

## 6. 記事本文（`.entry-content__inner`）

Markdown エクスポーター担当とアーキテクチャ担当へ。本文の CSS はすべて `.entry-content__inner {要素}` の子孫セレクタなので、出力 HTML の要素がこの div の中にあり、余計なラッパーが挟まらないことが条件です。

### 6.1 対象の要素と効いている値

〜767px / 768px〜 の順。`8.33%` などは `.entry-content__inner` の幅に対する割合です。

| 要素 | 〜767px | 768px〜 |
| --- | --- | --- |
| `.entry-content__inner` | padding 左右 2rem | padding 0 |
| `p` | margin 1.6rem auto、左寄せ、0.88889rem / 1.8em | margin 2.4rem 0 2.4rem 33.33333%、justify、1rem / 2.4em |
| `p code`、`ul code`、`ol code`、`dl code` | padding 2px 8px、margin 左右 .2em、背景 `rgba(255,255,255,.35)`、角丸 3px、`box-shadow: 0 0 4px rgba(34,40,49,.1)` | 同じ |
| `code`（すべて） | `Source Code Pro, monospace` | 同じ |
| `pre` | padding 1px 2rem、margin 1.2rem -2rem（はみ出して全幅）、左寄せ、`letter-spacing: normal`、0.88889rem / 1.8em | padding 0 2em、margin-right 0、margin-bottom 2rem、margin-left 33.33333%、1rem / 1.6em |
| `h2` | 上下 `6px double rgba(57,62,70,.95)`、padding .2em（右なし）、margin 4.8rem 0 1.6rem、600、#393e46、左寄せ、1.6rem / 1.5em | padding .25em、margin 7.2rem 0 4.8rem、2rem / 1.6em。margin-left なし（全幅） |
| `h3` | 下に `6px double #393e46`、padding 0 .2em .1em、margin 3.2rem 0 1.6rem、600、`rgba(57,62,70,.95)`、1.14286rem / 2.1em | padding 左右 .4em、margin 4.8rem 0 2.4rem 33.33333% |
| `h4` | margin-top 2rem、italic、#393e46、`letter-spacing: .1em`、0.88889rem / 1.8em | margin-left 33.33333%、1rem / 1.6em |
| `h4 + pre`、`h4 + ol`、`h4 + ul`、`h4 + dl` | margin-top 0.4rem | margin-top 0.8rem |
| `h5` | margin-top 2em、1.6rem、600、line-height 1.5、#393e46、`letter-spacing: .1em` | 1.8rem |
| `dl` | `6px double`（currentColor）、padding 8px、margin 1.6rem auto、左寄せ、0.88889rem / 1.8em | padding 1.2rem 2rem、margin 2.4rem 0 2.4rem 33.33333% |
| `dt` | margin-bottom .2rem、bold | 同じ |
| `dd + dt` | margin-top 1.2rem | 同じ |
| `ul`、`ol` | `6px double`、padding .4rem 1.2rem .4rem 16px、margin 1.6rem auto、0.88889rem / 1.8em | padding 1.2rem 1.2rem 1.2rem 24px、margin 2.4rem 0 2.4rem 33.33333% |
| `ol` | padding-left 2rem | padding-left 40px |
| `li` | margin-left 1.2rem | 同じ |
| `li + li` | margin-top .8rem | 同じ |
| `ul > li` | `list-style-type: square` | 同じ |
| `ol > li` | `list-style-type: decimal-leading-zero` | 同じ |
| `strong` | 600、下 45〜60% に `rgba(255,255,0,.3)` のマーカー | 同じ |
| `a` | ホバーで #eee の文字、#393e46 の背景（0.35s） | 同じ |
| `blockquote` | padding 16px、margin 1.6rem auto、italic、背景 `rgba(34,40,49,.065)`、左に `6px double #222831` | margin 2.4rem 0 2.4rem 33.33333% |
| `blockquote > p` | margin 0、0.8rem / 2em | 0.88889rem / 1.8em |
| `img` | margin 2rem -8.33333% 1.2rem 0 | 同じ |
| `p > img` | block、margin 上下 0 | 同じ |
| `figure` | min-height 200px、padding 1em、margin-bottom 1.5rem、背景 `rgba(255,255,255,.75)` | 同じ |

768px〜 のレイアウトは「h2 だけ全幅、それ以外は左 1/3 を空けて右 2/3 に置く」形です。

### 6.2 今の本文に出てくる構造（859 件を jsdom で数えた値）

- トップレベル: p 1960、pre 761、ul 701、h3 478、h4 401、h2 346、dl 67、ol 25、figure 1、blockquote 1。
- `h4` の直後: pre 308、p 43、dl 23、ul 22、ol 4、h4 1。`h4 + pre` などの隣接セレクタは 357 か所で効いている。
- `pre` はすべて `pre > code`。569 個は code の先頭が `<br>`、570 個は末尾が改行 2 つ。
- `p` の中の `<br>` 207 か所、`p > iframe`（jsfiddle）59 か所、`p > img` 38 か所（画像だけの段落）。
- `dd` の中の `code` 122、`li` の中の `code` 56。
- 入れ子のリスト 1 か所、本文中の `h1.h1-old` 1、`style` 要素 2、`input` 3、`div.ex` 1。

### 6.3 Markdown から出す HTML の条件

1. 本文は `.entry-content__inner` の直下に、トップレベルの要素をそのまま並べる。段落を `div` や `section` で包まない。h2 の全幅と、それ以外の `margin-left: 33.33333%` の対比は、要素が直下にあることが前提。
2. 隣接セレクタ `h4 + pre`、`h4 + ul`、`h4 + ol`、`h4 + dl`、`dd + dt`、`li + li` が効くように、間にコメントや空の要素を入れない。Astro の Markdown ではコードブロックを `<pre>` の外側に何かで包まないこと。expressive-code のように `figure` や `div` で包む仕組みは使わない（`h4 + pre` が切れ、`figure` の白い背景と min-height 200px が付いてしまう）。
3. `dl` は Markdown に書き方がないので、`<dl><dt>…</dt><dd>…</dd></dl>` の生 HTML で出す。`dd` の中の `code` は `<code>` のまま HTML で書く（HTML ブロックの中では Markdown の記法が解釈されないため）。
4. コードブロックは fenced code にし、info string に元の `code` の class の文字列をそのまま書く（`bath`、`HTML`、`CSS` も変換しない。class がなければ info string なし）。描画結果は旧サイトと同じ `<pre><code class="{元の class}">` にする。`code` に font-family が付いていて、`pre` 自体は body のフォントのままなので、`code` を外すとコードがプロポーショナルな字形になる。
5. コードの前後の空行: 旧サイトでは `<br>` と末尾の改行のせいで、569 個のコードブロックは上と下に 1 行ずつ空きがある（`method-control` の 1 行のコードで高さ 76.8px = 25.6px × 3 行を確認）。残りの 192 個は空きがない。エクスポーターは先頭の `<br>` を改行文字 1 つ（1 行目の空行）にし、末尾の改行もそのまま残す。描画とハイライトでも前後の空行を削らない。旧サイトとの差は「`<br>` 要素が改行文字になる」ことだけで、どちらも 1 行目の空行として表示される。見え方が同じかどうかは 10 章の確認項目で確かめる。
6. `p` の中の改行（207 か所）は `<br>` として残す（Markdown なら行末の `\` か 2 つの空白）。
7. iframe は `<p><iframe …></iframe></p>` のまま残す。`p` の margin-left 33.33% が効いて右 2/3 に置かれ、幅 613px（1080px 時）になる。
8. 画像は落とす決定なので、`p > img` だけの段落は段落ごと消す。空の `<p></p>` を残すと 1.6〜2.4rem の余白が残る。
9. `h2` / `h3` の id は目次の移動先になる。旧サイトは `a0`、`a01` の形。新しい形にするなら目次側もそれに合わせる（アーキテクチャ担当と決める）。

---

## 7. highlight.js

### 7.1 旧サイトの動き

- highlight.js 10.1.1。javascript / scss / typescript / xml / bash / php / yaml の 7 言語だけを登録し、クライアントで `hljs.highlightBlock(pre)` を呼んでいる。
- 対象が `code` ではなく `pre` なので、`code` の class（`js` や打ち間違いの `bath`）は使われず、7 言語からの自動判定になる。`pre` に `hljs {判定した言語}` の class が付く。
- v10 は元の HTML を保ったままハイライトを差し込むので、`<code>` と先頭の `<br>` は残る（本番の DOM で確認）。

配色（`.entry-content` に global で定義）:

| class | 色 |
| --- | --- |
| `.hljs` | 背景 #333、文字 #fff、`display:block; padding:.5em; overflow-x:auto`（padding は `.entry-content__inner pre` が上書きする） |
| `.hljs-tag` | #62c8f3 |
| `.hljs-variable` `.hljs-template-variable` `.hljs-selector-id` `.hljs-selector-class` | #ade5fc |
| `.hljs-string` | #a2fca2 |
| `.hljs-bullet` | #d36363（`#a2fca2` の指定より後に来るのでこちらが効く） |
| `.hljs-type` `.hljs-title` `.hljs-section` `.hljs-attribute` `.hljs-quote` `.hljs-built_in` `.hljs-builtin-name` | #ffa |
| `.hljs-number` `.hljs-symbol` | #d36363 |
| `.hljs-keyword` `.hljs-selector-tag` `.hljs-literal` | #fcc28c |
| `.hljs-comment` `.hljs-code` | #888 |
| `.hljs-deletion` | 文字 #333、背景 #fc9b9b |
| `.hljs-regexp` `.hljs-link` | #c6b4f0 |
| `.hljs-meta` | #fc9b9b |
| `.hljs-addition` | 文字 #333、背景 #a2fca2 |
| `.hljs-name` `.hljs-strong` | bold |
| `.hljs-code` `.hljs-emphasis` | italic |

### 7.2 参考: v11 に上げた場合の差（761 個のコードブロックで実測。採らない案）

7.3 の決定で v10.1.1 を使い続けるので、この節は v11 を採らなかった理由の記録として残します。scratchpad に 10.1.1 と 11 を入れ、同じ 7 言語・同じ自動判定で全コードブロックを処理して比べました（`scratchpad/art-direction/hljs-diff.cjs`）。

- 自動判定の結果が変わるもの: 761 個のうち 165 個。v10 で判定なし（色なし）が 87 個、v11 では 58 個。
- v10 の自動判定は外れが多い。`code.js` の 20 個が yaml、16 個が typescript と判定されている。`bath` は 26 個が判定なし。
- v11 で増えたり分かれたりした class と、今の配色での見え方:

| v11 の class | 個数（出現したブロック数） | 今の CSS での色 | v10 での同じ箇所 |
| --- | --- | --- | --- |
| `hljs-title function_` | 246 | #ffa（`.hljs-title` に当たる） | 関数定義の名前だけ `hljs-title`（61） |
| `hljs-title function_ invoke__` | 40 | #ffa | 関数呼び出しは色なし |
| `hljs-title class_` | 127 | #ffa | `hljs-class` の中だけ |
| `hljs-variable language_` | 160 | #ade5fc（`.hljs-variable`） | `this` は keyword（#fcc28c）、`document` / `console` は built_in（#ffa） |
| `hljs-variable constant_` | 23 | #ade5fc | 色なし |
| `hljs-property` | 137 | 色なし（#fff） | 色なし |
| `hljs-built_in` | 127 | #ffa | 229 |
| `hljs-builtin-name` | 0 | — | v11 で廃止 |

- v11 は元の HTML を保たない（`<br>` は消え、HTML が混ざっていると警告が出る）。

### 7.3 決定: 旧サイトの色をそのまま保つ（リーダー決定）

- コードの色は旧サイトのままにする。言語を明示して色を変える案は採らない。
- エクスポーターは `<pre><code>` を fenced code にし、info string に元の class の文字列（`bath` もそのまま）を書く。言語名への変換はしない。
- アーキテクチャ側で旧サイトと同じ `<pre><code class="bath">` に描画し、highlight.js 10.1.1 をビルド時に、旧来と同じ 7 言語・同じ自動判定（`pre` に対して当てる）でかける。`pre` には旧サイトと同じく `hljs {判定した言語}` の class が付く。
- アーキテクチャ担当の試作では、761 ブロックすべてで class とテキストが旧サイトと一致した。差は、先頭の `<br>` が改行文字になる点だけ（どちらも 1 行目の空行として表示される）。
- 配色は 7.1 の表をそのまま使う。Shiki（Astro の既定）は使わない。
- 例外は `tip/frontnote` の 1 件（8 章の #14）。

---

## 8. 旧実装のバグと提案

| # | バグ | 今の見た目 | 提案 |
| --- | --- | --- | --- |
| 1 | 記事ページのアイキャッチ。単一記事の `images` が壊れていて src がない | tip: 1×1px の透明画像（`.entry-content` の直後）。clip: 16px のストライプの帯と、121px の空き | 直す。9.2 の置き場所で SVG を出す。clip の `.entry__img-full` は画像を復元しないので要素ごと消す |
| 2 | og タグの多くが `name="og:*"` だけで出ている（`property` がない。`og:type` と `og:site_name` だけは PWA モジュールが `property` 付きで別に出している）。コードにある `og:url` は出力されていない。`og:image` は `https://webmanab-html.com/ogp.png` 固定。トップの `og:description` は package.json の説明「webmanab.html projexct」になっている | 見た目には出ない | 直す（アーキテクチャ担当）。`property="og:*"` にし、URL は `SITE_URL` から作る |
| 3 | EntryNav の next の条件が `article.prev && …` | 前の記事がないとき `prev` は `[]`（真）なので、見た目には出ていない | 直す（条件を `article.next` に） |
| 4 | 前後記事が片方だけのとき、768px〜 で next が左半分に寄る（flex の 1 個だけ。`/tip/mixin-family-scss/` で x=40px、幅 500px を確認） | next が左側に出る（tip 1 本、clip 1 本、lab 1 本） | 直す。`.entry-nav__item--next { margin-left: auto }` |
| 5 | 一覧のタイトルを `{{ }}` で出していて、HTML 実体参照がそのまま見える（例「Vladimir Gruev &#8211; UI/UX Designer」） | 一覧だけ `&#8211;` などが文字のまま出る。記事ページでは正しく「–」 | 直す。エクスポーターが title をデコードした文字で持つ |
| 6 | 一覧ページが読み込み後に「Network Error」に置き換わる | 本番では一覧が見えない | 直す。新サイトは生成済み HTML のとおり一覧を出す |
| 7 | メニューのターム一覧、関連記事がブラウザから WP API を呼んでいて空 | メニューは見出しだけ。関連記事は枠と見出しだけ | 直す。ビルド時に `terms/*.json` と `primaryTag` から作る。中身が入ると見た目が変わる（メニューの一覧、関連記事 3 件） |
| 8 | body の `font-feature-settings` が無効な値で、palt が効いていない | kern だけが効いている | 再現する（`"kern"` のまま。palt を入れない） |
| 9 | `.entry-toc_title:hover` の打ち間違い | 目次見出しのホバーで open/close の字間が広がらない | 再現する（ルールを移さない） |
| 10 | 目次の中身が閉じた状態の DOM では空 | 開くと出るので見た目は意図どおり | 再現する（見た目）。新サイトではビルド時に目次を作り、閉じた状態でも DOM に入れておく |
| 11 | EntryAd に `article="[object Object]"` の属性が漏れている | 見た目には出ない | 直す（出さない） |
| 12 | Title1 のリンクが末尾スラッシュなし（`/tip`） | 見た目には出ない（リダイレクト） | 直す（`/tip/`） |
| 13 | `font-weight: 600` だが 600 の Open Sans を読み込んでいない | 700 の字形 | 再現する（読み込むウェイトを増やさない） |
| 14 | `tip/frontnote` のコードブロックに、エスケープされていない `<h1 class="h1-old">title01</h1>` が入っている | 旧サイトではコードの中に見出しの要素として描画されている | 直す。新サイトではコードの文字として出る（アーキテクチャ担当の試作で確認済み） |
| 15 | コードの言語を `code` の class ではなく 7 言語の自動判定で決めている（`js` の 20 個が yaml と判定されるなど） | 判定どおりの色 | 再現する（7.3 の決定。highlight.js 10.1.1 の自動判定をビルド時にかける） |

1、5、6、7、14 は見た目が変わる直し方です。コードの色は変えません（#15）。

---

## 9. 新しく加わる見た目

### 9.1 Web Share API のシェアボタン

今の「share ー」の見出しと、上下 6px の二重線で挟んだ帯の雰囲気を残し、帯の中を 1 つのボタンにします。

DOM:

```html
<section class="entry-sns__wrap">
  <h3 class="title2">share <br>ー</h3>
  <div class="entry-sns">
    <button type="button" class="entry-sns__target" data-share-url="{絶対 URL}" data-share-title="{title}">
      <svg class="entry-sns__icon" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 15V3M7 8l5-5 5 5M5 12v8h14v-8" />
      </svg>
      <span class="entry-sns__label">share this page</span>
    </button>
    <span class="is-sr-only" role="status" aria-live="polite"></span>
  </div>
</section>
```

CSS（SCSS。今の EntrySns の値を引き継ぐ）:

```scss
.entry-sns__wrap {
  margin-top: $space-3;
  @include tablet { margin-top: $space-5; }
}

.entry-sns {
  display: flex;
  border-top: 6px double currentColor;
  border-bottom: 6px double currentColor;
}

.entry-sns__target {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding-top: 1rem;
  padding-bottom: 1rem;
  font-style: italic;
  color: $black;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  perspective: 600px;
  transform-style: preserve-3d;
  transition: 0.25s $easeOutQuart;
  @include sizes(-1, 0);

  &:hover,
  &:focus-visible {
    color: $white;
    background-color: $glay;
    box-shadow: -5px 5px 0 $primary-color;
    transform: translate3d(5px, -5px, 0);
  }

  &:focus-visible {
    outline: 2px solid $primary-color;
    outline-offset: 4px;
  }

  &.is-copied {
    box-shadow: -5px 5px 0 $thirdry-color;
  }
}

.entry-sns__icon {
  width: 22px;
  height: 22px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  transition: 0.25s $easeOutQuart;

  .entry-sns__target:hover & {
    transform: rotateY(1turn) translateZ(10px);
  }
}
```

動き:

- `navigator.share` があれば `navigator.share({ title, url })` を開く。ユーザーが閉じたとき（`AbortError`）は何もしない。
- ないときは、読み込み時にラベルを `copy link` に変えておき、クリックで `navigator.clipboard.writeText(url)` を呼ぶ。成功したら `is-copied` を付けてラベルを `copied` にし、2 秒で戻す。`role="status"` の要素にも「リンクをコピーしました」を入れる。
- ホバーの影は、今の SNS ボタンの「ずらした影」を引き継ぎ、色は記事タイトルや関連記事と同じ #f50057 にした。コピー後だけ #2a8379。
- button の見た目は reset で消えているので、追加のリセットは要らない。reset が `outline: 0` にしているため、`:focus-visible` の outline を必ず付ける。

### 9.2 SVG アイキャッチの置き場所

アイキャッチの絵柄はアイキャッチ生成担当が作ります。ここでは置き場所、大きさ、比率、今の効果との関係を決めます。どの場所も 16:9 の 1 枚の SVG（`viewBox="0 0 1600 900"`）を使い、場所ごとに別の画像は作らない前提です。

(a) 一覧の 16:9 サムネイル（`.article-item__img`）

- 今の DOM と CSS をそのまま使い、`img` の src を SVG にする。`<img src="/eyecatch/{type}/{id}.svg" width="640" height="360" alt="" loading="lazy" lazy="loading">`。alt は隣にタイトルがあるので空にする。
- 箱は 16:9、`img` は幅 100% で上下中央なので、16:9 の SVG なら切れずにぴったり収まる。本番で測った箱の大きさは 375px 時 304.6×171.3px、768px 時 311.6×175.3px、1080px 時 292.9×164.8px、1480px 時 309.6×174.1px。幅 290px 前後で読める密度にする。
- 背景 #393e46 は読み込み前の面として残る。読み込み後 0.25s で opacity 1（5.6）。
- ホバーで箱全体が右上に 10px ずれ、左下に #ffd740 の影が出る。SVG の外周に枠線や影を描かない。外周 1 割ほどは #ffd740 と #eeeeee のどちらとも区別がつく色にする（影と背景に溶けないように）。

(b) 記事ページ

- tip: 旧実装の位置（`.entry-content` の直後、2 つ目の EntryAd の前）に、`article.entry` の幅いっぱい（1080px 時 920px、16:9 で約 518px）で出す。今は 1px で見えていないので、ここが見た目の一番大きな変更になる。
- clip: `a.entry-clip__img` の中の `img` を SVG にする。ストライプの背景、clip-path、ホバーで画像が `opacity: .05` になって「visit to」が出る効果が、16px の帯ではなく本来の大きさで動くようになる。SVG に透明の部分を作らない（ストライプが透けて見えてしまう）。
- lab: 今はアイキャッチの要素がないので、出さない。
- 記事ページでは lazy にしない（`loading="eager"`、`lazy` 属性なし）。

(c) 前後記事ナビの背景（`.entry-nav__bg`）

- `style="background-image:url(/eyecatch/…svg)"` に SVG を入れ、今の CSS（cover、中央、70% のグレーを上に重ねる、ホバーで rotateY ±45deg）をそのまま使う。
- 箱の比率は 768px〜 で幅 50% × 高さ 17.5vw（1080px 時 500×189px、約 2.6:1）、〜767px で 幅いっぱい × 120px（375px 時 343×120px、約 2.9:1）。16:9 の SVG を cover で入れると上下が切られ、残るのは高さの中央 6 割ほど。モチーフは縦方向の中央 6 割の帯に収める。
- 上に `rgba(57,62,70,.7)` が重なるので、色は 3 割の強さでしか見えない。明るさの差がはっきりした絵柄のほうが残る。
- 文字（#eee の previous / next と、#eee の帯のタイトル）が上に乗るので、この用途では SVG 側で文字や細かい線を描き込まない。

---

## 10. SCSS を Dart Sass 1.106 で動かす

scratchpad に sass 1.106.0 を入れ、今の SCSS（全コンポーネントの `<style>` に variable と mixin を前置きしたもの）を `@import` のままコンパイルして確かめました。エラーはなく、警告は次の 5 種類です。

| 警告 | 件数 | 箇所 | 書き換え |
| --- | --- | --- | --- |
| `import` | 140 | variable / mixin / layout の `@import` | `@use` / `@forward` に変える |
| `slash-div` | 140 | `_typograph.scss` の `1rem * 8 / n`、`_mixin.scss` の `fontsize`、`_modular-scale.scss` の `$base-rem * $fs-n / $fs-d`、`$base-rem / $line-height-unit`、`$lh-n / $lh-d`、`_animation.scss` の `waitAnimate` | `math.div()` |
| `global-builtin` | 82 | `nth`、`type-of`、`append`、`length`、`map-merge`、`map-get`、`ceil`、`floor` | `list.nth`、`meta.type-of`、`list.append`、`list.length`、`map.merge`、`map.get`、`math.ceil`、`math.floor` |
| `if-function` | 28 | `_modular-scale.scss` の `trunc()` の `if()` | `@if` / `@else` に書き直す |
| `color-functions` | 2 | Loader の `lighten` / `darken` | 値を固定する（下記） |

ほかに必要な書き換え:

1. `@media screen\0 { body { font-family: … } }` を消す。1.106 では `screen` の後ろに NUL 文字が入った壊れた media query が出力される（確認済み）。IE 用なので消しても見た目は変わらない。
2. `$line-height-unit` を 1 か所にまとめる。`@use` にすると `_modular-scale.scss` は別のモジュールになり、今のように `_typograph.scss` の 0.8rem が先に効く仕組みがなくなって 0.25rem に戻る。全部の line-height と縦の余白が変わるので、`_modular-scale.scss` の既定値を `0.8rem` に書き換え、`_typograph.scss` 側の定義を消す。`@use 'modular-scale' with ($line-height-unit: 0.8rem)` でもよいが、書き忘れると黙って値が変わるので既定値を変えるほうを推す。
3. 同じ理由で `$text-color` と `$text-link-color` も 1 か所にする。今は `_color.scss` の `$black`（#222831）が勝っていて、`_typograph.scss` の `$color-black !default`（#000）は効いていない。`_typograph.scss` 側を消す。
4. Loader の色は `lighten` / `darken` をやめて直接書く。1.106 で `color.adjust` を使うと `rgb(20.35%, 63.49%, 58.64%)` のような小数のパーセントで出力されるため。値は `#34a296` と `#287b72`（HSL の明度を ±して丸めた値）。
5. `calc()` の中の式は、旧ビルドでは postcss が `1.6rem` のように計算済みにしていたが、1.106 では `calc(1rem * 8 / 9 * 18 / 10)` の形のまま出る。ブラウザが計算する値は同じ。
6. media query の書き方が `print, screen and (min-width: 768px)` から `screen and (min-width: 768px), print` に変わる。意味は同じ。

出力が変わらないことの確かめ方:

- 文字列の diff は 5、6 のせいで役に立たないので、computed style で比べる。
- 旧サイトの computed style は `.snapshot/baseline/*.styles.json` に保存した（52 ページ分。キーは「タグ.class:何番目」をつないだパス、::before / ::after を含む）。新サイトで `capture.ts --styles` を実行し、同じキーの値を比べる。新しい DOM で構造が変わる箇所（シェアボタン、アイキャッチ、本文の Markdown 出力）以外は一致するはず。
- 比べる値から外すもの: `transition`（`-webkit-` の有無で文字列が変わる）、`fontFamily` の引用符の付き方。本文の `pre` 内の span は、旧サイトと同じ class が付く決定（7.3）なので比較に含める。旧サイトの `<br>` は新サイトにはないので、`pre > code > br` のキーだけ対応がなくなる。
- キーの先頭は `div.default-layout.tip-id:1>…` のように、layout の route 名の class を含む。新サイトでも `.default-layout` に同じ route 名の class（`index`、`tip`、`tip-id`、`tips-id` など）を付けるか、比べるときにその class をキーから落とす。付けないと全要素のキーが外れる。
- コードブロックの空行の確認項目（7.3 で `<br>` が改行文字に変わるため）:
  1. 先頭に空行があるブロック: `tip-method-control` の 1 つ目の `pre`（キーの末尾が `pre.hljs.javascript:1`）の高さが旧サイトと同じになること。旧サイトの実測値は 768px と 1080px で 76.7812px（25.6px × 3 行）、375px で 81.7812px（styles.json の `height`）。
  2. 先頭に空行がないブロック（`<br>` のない 192 個から 1 つ選ぶ）: 空行が増えていないこと。高さが旧サイトの styles.json と同じになること。
  3. 末尾の改行が 2 つ・1 つ・3 つのブロック（570 / 181 / 9 個）からそれぞれ 1 つずつ選び、末尾の空行の数が旧サイトと同じになること（高さで比べる）。
  4. 全 761 ブロックについて、`pre` の高さを旧サイトの生成済み HTML（`.snapshot/html`）をブラウザで開いて測った値と比べ、すべて一致すること。基準の 52 ページに入っていないブロックはこの方法で確かめる。
  5. スクリーンショットで、コードの 1 行目の位置（`pre` の上端から最初の文字までの距離）が旧サイトと同じであること。
- そのうえで 64 枚のスクリーンショットをピクセル比較する。同じ条件で 2 回撮った旧サイトの画像は 52 枚とも完全に一致したので、差が出た箇所は実際の見た目の差と考えてよい。ただしこれは同じ Chromium のビルドで撮ったからなので、新サイトも playwright 1.64.1（Chromium 156.0.8078.4）の macOS で撮る。

---

## 11. Astro の scoped CSS（`scopedStyleStrategy: 'attribute'`）

### 11.1 Vue の scoped との違い

- Vue: 属性はセレクタの最後の compound だけに付く。`.entry-nav__item.entry-nav__item--prev:hover .entry-nav__bg[data-v]`。
- Astro（attribute）: セレクタのすべての compound に付く。`.entry-nav__item[data-astro-cid-x].entry-nav__item--prev:hover .entry-nav__bg[data-astro-cid-x]`。子孫セレクタを使うルールは、そのぶん詳細度が上がる。
- Vue では子コンポーネントのルート要素に親の scoped 属性も付く（例: `article.article-item` に Article と ArticleList の 2 つの `data-v`、`h3.title2` に Title2 と EntrySns の 2 つ）。Astro では子コンポーネントの要素に親の cid は付かない。今の CSS でこれに頼っているルールはない（親の scoped CSS が子のルートを狙っている箇所はない）ことを確かめた。

### 11.2 global にしなければならないもの

- EntryContent の本文スタイルと hljs の配色。本文は Markdown から描画され、Astro の cid が付かない。scoped にすると一つも当たらなくなる。
- Header、Menu、MenuList、MenuTitle、EntryAd、EntryDemo は旧サイトでも unscoped。そのまま global にすれば詳細度は旧サイトと同じになる。
- reset、base、utility。

### 11.3 詳細度の競合が起きそうな箇所

| 箇所 | 旧サイト | Astro で起きること |
| --- | --- | --- |
| `.article-item__img > img`（scoped, opacity 0）と global の `img[lazy=error]`（opacity 1） | (0,2,1) 対 (0,1,1) で scoped が勝つ | (0,3,1) でやはり scoped が勝つ。変わらない |
| `.article-item__img > img[lazy=loaded]`（scoped）と global の `img[lazy=loaded]`（transition .8s） | scoped の transition .25s が勝つ | 変わらない |
| global の `a { color: #000 }` と scoped の各リンクの色 | scoped が勝つ | 変わらない |
| `.u-text-left` / `.u-text-right`（`!important`）と EntryNav の scoped | `!important` が勝つ | 変わらない |
| 本文の `.entry-content__inner ul`（global）と目次の `ul`（scoped） | 目次は `.entry-content__inner` の外なので当たらない | 目次を `.entry-content__inner` の中に入れると、二重線の枠と square のマーカーが目次に付く。目次は今と同じく外に置く |
| 本文の `.entry-content__inner a`（global, ホバーの背景）と、本文の中に置くコンポーネント | 該当なし | 本文の中にシェアボタンなどの Astro コンポーネントを入れないこと |
| `.title2`（scoped）を EntrySns / EntryTag / EntryRelated から使う | Title2 の scoped が当たる | Title2 を Astro コンポーネントにすれば同じ。親から `.entry-sns__wrap .title2` のように上書きすると詳細度が上がるので、上書きは作らない |
| Loader の `@keyframes temp` | Vue が名前を書き換えて衝突しない | 書き換わらない。名前を変える（4.16） |

### 11.4 DOM の並びに依存するセレクタ（Astro で DOM を組み直すときに守ること）

- `.bar:nth-of-type(1〜4)`（layout の子の 1〜4 番目の div）
- `.loader > span:nth-of-type(1〜20)`
- `.menu.is-open + .menu__overlay`
- `.Ads-list_item:last-child`（〜767px で隠す）
- `+` セレクタ: `.header__nav-item`、`.entry-head__item`、`.entry-toc__item`、`.entry-related__item`、`.entry-nav__item`（〜767px）
- 本文の `h4 + pre/ol/ul/dl`、`dd + dt`、`li + li`、`p > img`、`blockquote > p`、`ul > li`、`ol > li`
- `.article-item__tag::first-letter`（最初の文字が大きくなる。primary-tag の文字列の先頭に空白や記号を入れない）

---

## 12. 他の担当への受け渡し

- Markdown エクスポーター: 6.3 の条件、コードブロックは info string に元の class をそのまま書くこと（7.3。言語名に変換しない）、8 の #5（title のデコード）、コードの前後の空行を残すこと。
- アーキテクチャ: head にある `favicon.ico` と `apple-touch-icon.png`（`static/`）は残す。PWA モジュールが出している `theme-color #fff`、manifest、`apple-touch-icon`（512px）は PWA をやめるので消える。11 章の global / scoped の切り分け、5.2 / 5.3 / 5.6 の素の script、6.3 の 2（コードブロックを包まない）と 9（見出しの id と目次）、7.3 のハイライトの方式（highlight.js 10.1.1 の自動判定をビルド時に）、10 章のコードブロックの空行の確認項目、8 の #2 #3 #4 #7、一覧の続きの読み方（5.7）、Google Fonts の URL をそのまま使うこと。
- アイキャッチ生成: 9.2 の比率（16:9、`viewBox 0 0 1600 900`）、外周の色、縦の中央 6 割に収めること、透明部分を作らないこと、ナビ背景では 70% のグレーが重なること。
- インフラ: 基準画像の比較は macOS の Chromium で行う（日本語のフォントが OS で変わるため）。CI でスクリーンショットを比べるなら、基準を CI の環境で撮り直す必要がある。

## 13. ユーザーに確認したいこと

1. 8 章の「直す / 再現する」の表をこの内容で進めます。見た目が変わるのは #1（記事ページにアイキャッチが出る）、#5（一覧の `&#8211;` が「–」になる）、#6（一覧ページが正しく表示される）、#7（メニューのターム一覧と関連記事に中身が入る）、#14（`frontnote` のコード中の見出しが文字になる）です。コードの色はリーダー決定で変えません。
2. 記事ページのアイキャッチは、tip は本文のあとに幅いっぱいで、clip は「visit to」の枠の中に出し、lab には出さない案にしました（9.2）。
3. 404 は今 Netlify の既定ページです。新サイトでもこのままにする案にしています。サイトの見た目で 404 を作る場合は、Title1 の形で「404」と出し、トップへのリンクを置く案を出します。
4. tip 記事の最後にある Amazon アソシエイトの書籍リンク（EntryAdFoot の 2 つ目）は、ブリーフに記載がありません。AdSense と同じく残す案にしています。

## 未確認のこと

- 一覧ページが「Network Error」になる原因（1.3）。
- 新サイトでコードブロックの前後の空行が旧サイトと同じに見えるかどうか（10 章の確認項目で確かめる）。
- Windows / Linux での日本語フォントと見た目（基準は macOS だけで撮った）。
