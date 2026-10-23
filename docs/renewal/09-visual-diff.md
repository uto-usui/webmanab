# 09 旧サイトとの見た目の比較（手順 12）

担当: アートディレクション。08 の 1.7 と 10 章、02 の 10 章を受けて、新サイトを旧サイトの基準と比べた結果と、比べるときに「変わってよい」とした場所をまとめます。

## 1. 比べ方

- 基準: `.snapshot/baseline/` の 64 枚と、computed style 52 ページ分（02 の 1 章）。
- 新サイト: `pnpm build && pnpm preview --port 4341 --ignore-lock` を、旧サイトと同じ `capture.ts` で撮った（`--styles`、`--concurrency 1`）。結果は `.snapshot/baseline-astro/` に置いた（コミットしない）。
- 道具: `.snapshot/prototypes/art-direction/compare/`（使い方は同じ場所の README.md）。playwright 1.64.1（Chromium 156.0.8078.4）、macOS。
- 振り分けの決め方:
  - 一致: 画像全体で差が 0。
  - 範囲内: 差があるのは、下の 2 章の「変わってよい場所」と、英数字の字形（フォントを OS の標準にしたため。2 章）と、そこから位置がずれた部品だけ。
  - 範囲内（高さの変化あり）: 範囲内のうち、文字の幅が変わって行の折り返しが変わり、部品の高さが変わったもの。目で見て、崩れていないことを確かめた（3.5）。
  - 範囲外: それ以外に差がある。
  - 対象外: 新サイトの成果物でないもの（404）。
- 部品ごとの比べ方: 旧サイトと新サイトで部品の位置を測り（`rects.mjs`）、部品ごとに切り出して画素で比べる。英数字のある部品は字形が変わるので、画素ではなく部品の高さで見る。高さが同じなら範囲内、高さが変わったものは computed style で変化の元の要素を探し（`cmp-styles.mjs`）、目で見た。
- 撮影の注意: 同時に 2 本以上で撮ると、文字のにじみが撮るたびに変わる画像が出た（同じビルドを撮り直すと差が消える）。1 本ずつ撮る。

## 2. 変わってよい場所の一覧

README 4 章の「変わるところ」を、ページ・幅・セレクタに落としたものです。`compare/allowed.json` と `compare/cmp-styles.mjs` の許可はこの表と同じ内容にしてあります。

| ページ | 幅 | セレクタ | 変わり方 | 根拠 |
| --- | --- | --- | --- | --- |
| 一覧（`/`、`/{tip,clip,lab}/`、`/{tips,clips,labs}/{id}/`） | すべて | `.article-item__img-wrap`、`.article-item__img > img` | サムネイルにアイキャッチの SVG が出る（JavaScript が動いているとき）。旧サイトの lab の記事は箱そのものがなかったので、16:9 の箱が増えてカードが高くなる | README 4 章（アイキャッチ） |
| 一覧 | すべて | `.article-item__title`（タイトルに `&#8211;` を含む記事。基準では clip 一覧の 7 件目と、トップの clip 欄の 7 件目） | `&#8211;` が「–」になる。1080px では 2 行が 1 行になる | README 4 章 |
| 一覧 | すべて | `.infinite-loading-container` | 続きを読む口が DOM に入る（JavaScript を切った撮影では見えない） | README 4 章（一覧ページが正しく表示される） |
| tip の記事 | すべて | `article.entry > img.entry__eyecatch` | 本文のあとにアイキャッチが記事の幅で出る（旧サイトは 1px の透明画像） | README 4 章 |
| clip の記事 | すべて | `a.entry-clip__img`、`img.entry__img-full` | visit to の枠が 16px の帯からアイキャッチの大きさになる。`entry__img-full`（121px の空き）はなくなる | README 4 章、02 の 8 章 #1 |
| 記事 | すべて | `section.entry-sns__wrap` 以下 | シェアボタンが 1 つになる。帯の高さが 375px で 94→98px、768px 以上で 125→128px | README 4 章、02 の 9.1 |
| 記事 | すべて | `ul.entry-related__list` | 関連記事の中身が入る | README 4 章 |
| 記事 | すべて | `.entry-nav__bg`、`.entry-nav__bg::after` | 前後記事の背景がナビ用のアイキャッチになる。lab は旧サイトで背景の要素がなかった | README 4 章 |
| 記事（前の記事がないとき） | 768px 以上 | `.entry-nav__item--next` | 右に寄る | README 4 章、02 の 8 章 #4 |
| tip の記事 | すべて | `li.entry-toc__item` | 閉じた目次の項目が DOM に入る（`display: none` で見た目は同じ）。旧サイトは閉じた状態で中身が空だった | 08 の 2.4 A-3 |
| `tip/frontnote`、`tip/javascript-es6` | すべて | 本文のコードブロック 1 個ずつ | 色の付き方が変わる | README 4 章 |
| 全ページ | すべて | `.menu-list__item` | メニューのターム一覧に中身が入る | README 4 章 |
| 全ページ | すべて | `.menu__btn` | `a` から `button` になる。画素は同じ。computed style のキーは `a.menu__btn` → `button.menu__btn` と読み替える | 08 の 2.4 A-2 |
| 全ページ（キーボード操作のとき） | すべて | `.menu__btn:focus-visible`、`.entry-sns__target:focus-visible` | フォーカスの枠（2px #f50057、offset 4px）が出る | README 4 章、08 の 2.4 A-5 |
| 記事 | すべて | `.entry-ad > ins.adsbygoogle`、`.Ads-list_item > ins.adsbygoogle` | 広告の ID（`PUBLIC_ADSENSE_CLIENT`）がないビルドでは `ins` を出さない。枠の大きさは同じ | 03 の 9 章 |
| 記事 | すべて | `pre > code > br` | コードの先頭の `<br>` が改行文字になる。高さは同じ（3 章） | 02 の 7.3 |
| 全ページ | すべて | 英数字のあるすべての要素 | 英数字が Open Sans から OS の標準フォント（mac は SF）に、コードが Source Code Pro から OS の等幅フォント（mac は Menlo）になる。字形と文字の幅が変わり、行の折り返しが変わる所がある（3.5） | README 4 章（68ea114） |
| 記事 | 768px 以上 | `.entry-content__inner p code` | `line-height` を 1 にした。OS の等幅フォントは段落の行を 1px 押し広げるので、旧サイトの行の高さに合わせるため。見た目は同じ | このページの 3.5 |
| 404 | すべて | ページ全体 | 旧サイトも新サイトも Netlify の既定の 404。ローカルでは比べられない | README 3 章の 10 |

状態違いの画像で比べる範囲:

- `home-menu-open-*`: メニュー本体のターム一覧と、後ろに透けるページの中身は変わってよい。メニューボタンと見出しは英数字の字形だけが変わる。
- `*-header-fixed-*`: 後ろに透ける一覧のサムネイルは変わってよい。ロゴとナビは英数字の字形だけが変わる。
- `tip-method-control-toc-open-*`: 目次の項目の英数字の字形が変わる。折り返しが変わっていないことは目で見た。

フォントを変える前（3.6）は、メニューボタン・ヘッダーの帯・目次を開いた状態はどれも差 0 だった。

## 3. 結果

（撮影日: 2026-10-23。新サイトは renewal/astro の 65064c2 を取り込み（Google Fonts をやめて OS の標準フォントにした 68ea114 と、エクスポーターがコードブロックの末尾の空行を戻した変更を含む）、段落の中のコードの `line-height` を直したビルド）

### 3.1 64 枚

| 判定 | 枚数 | 画像 |
| --- | --- | --- |
| 一致 | 0 | なし（すべての画像に英数字があるため） |
| 範囲内 | 54 | 下の 6 枚と 404 を除く全部 |
| 範囲内（高さの変化あり） | 6 | `tip-dart-sass-with-nuxt-375`、`tip-method-control-375`、`tip-sass-pickup-1080`、`tip-sass-pickup-768`、`tip-webgl-three-start-375`、`tip-webgl-three-start-768` |
| 範囲外 | 0 | なし |
| 対象外 | 4 | `404-*` |

### 3.2 computed style

404 を除く 48 ページで、2 章の許可と祖先の大きさの変化、フォントの変更で決まる値（`fontFamily` と、文字の幅で変わる `width`・`left`・`right`・`top`・`bottom`・`transform`）を除いた差は 0。高さの変化は 3.5 にまとめた。

意図して変えた値: 768px 以上の段落の中のコード（`p > code`）の `lineHeight` が、旧サイトの 38.4px から 16px になる（3.5 の直し）。基準の 4 記事 × 3 幅の 12 ページで 213 個。`cmp-styles.mjs` ではこの値を差に数えない。

除いたもののうち、値の書き方だけが違うもの:

- 旧 CSS は小数 5 桁、新 CSS（Vite 8 の lightningcss）は有効数字 6 桁に丸める（`.88889rem` と `.888889rem` など）。差が 0.02 未満の数値は数えない。
- `strong` のマーカーの `linear-gradient(0deg, …45%, …60%)` を lightningcss が `linear-gradient(…40%, …55%)` に書き換える。描き方は同じ（本文の画素の差は 0）。

### 3.3 コードブロックの高さ

本文にコードブロックがある 158 ページ（tip 127、lab 31）の 761 個を、375px と 1080px で比べた（`compare/code-heights.mjs`）。旧サイトは `.snapshot/html` を JavaScript なしで開き、highlight.js が付けていた `overflow-x: auto` を足して測った。この再現が本番と同じことは、`tip/alert-redirect` の 2 個を本番（JavaScript あり）で測って確かめた（どちらも 281.53px）。

| 幅 | 一致 | 一致しないもの |
| --- | --- | --- |
| 1080px | 760 | `tip/frontnote` の 6 個目（25.59px 低い）。コードの中の `<h1>` を文字にした直し（README 4 章） |
| 375px | 647 | 113 個が 1px 高い（README 4 章で受け入れ済み）。`tip/frontnote` の 6 個目が 24.59px 低い（上の直しの 25.59px と、1px 高くなる分） |

README 6 章の例外（`tip/frontnote` と、375px の 113 個）以外はすべて一致した。

経過:

- 最初の比較（b91abab）では、114 個が 1 行（25.59px）低かった。旧 HTML でこれらは `<pre><code>…</code>\n</pre>` の形で、`</code>` と `</pre>` の間の改行がコードの最後の空行として表示されていた。エクスポーターが戻した（9fd05fb）。
- フォントを Menlo にしても、コードの行の高さは変わらなかった（Menlo のビルドで測っても、Source Code Pro のときと同じ 646 個が一致していた）。
- 段落の中のコードの `line-height` の直し（3.5）は `pre` に当たらないので、この結果は変わらない（直しの前後で同じ結果だった）。

### 3.4 目次からの移動（QA からの確認）

目次が開くアニメーションの途中で項目を押すと、行き先がずれる件。旧サイトの vue-scrollto 2.18.1（yarn.lock で確認）のソースを読むと、行き先（`targetY`）は押した時点で 1 回だけ計算し、そのあとは `initialY + diffY * progress` で動かしている。新サイトの `toc.ts` と同じなので、変えない。

あわせて、vue-scrollto が `mousedown`、`wheel`、`touchmove`、`keyup` のどれかがあると移動を止めていたことがわかったので、`toc.ts` にも同じ止め方を入れた。ただし `keyup` は入れていない。Enter で項目を選ぶと、直後の `keyup` で移動が止まってしまうため。

### 3.5 フォントの変更で高さが変わった所（目で見た）

`cmp-styles.mjs` で、高さが変わった要素のうち子孫の高さが変わっていないもの（変化の元）を出し、画像で見た。どれも文字の幅で折り返しの位置が変わっただけで、重なりやはみ出しはない。

| ページ | 幅 | 要素 | 変化 |
| --- | --- | --- | --- |
| 一覧すべて（トップ、tip、clip、lab、tips/29） | すべて | カードの日付の行（`.article-item__inner > p.u-text-right`） | 1px 高くなる（21.80→22.80px）。日付の斜体の字形でベースラインの位置が変わるため。カードが 1px ずつ高くなる |
| tip の demo のある記事（sass-pickup、webgl-three-start） | 1080px 以上 | demo を包む `div` | 1px 低くなる（73→72px） |
| `tip/sass-pickup` | 768px | 記事の見出し（`h1.entry-head__title`） | 2 行から 3 行になる。「Sass(SCSS)」が 1 行目に入らなくなり、「、」のあとで折り返す |
| `tip/sass-pickup` | 1080px | 本文の 2 つ目の `h2` | 1 行増える。2 行目が「集」の 1 文字だけになる（この表の中で一番目に付く） |
| `tip/dart-sass-with-nuxt` | 375px | 本文の 2 つ目の `h2` | 1 行減る |
| `tip/method-control` | 375px | 本文の 3 つ目の `dl` の 2 つ目の `dd` | 1 行増える |
| `tip/webgl-three-start` | 375px | 本文の 9 つ目の `h3` | 1 行減る |
| `tip/webgl-three-start` | 768px | 本文の 20 番目の `p` | 1 行増える |

直したもの（5c1a567）: 768px 以上の段落で、インラインのコードがある行が 1px ずつ高くなっていた（OS の等幅フォントと和文フォントでベースラインの位置が違うため。`tip/method-control` の本文で合計 19px）。`p code` の `line-height` を 1 にして、旧サイトと同じ高さに戻した。767px 以下の段落と、`dl`・`ul` の中のコードは、旧サイトでも同じように 1px 広がっていたので、そのままにした。

直しの前後での判定の違い: 直す前は、64 枚のうち 15 枚が「範囲内（高さの変化あり）」だった。基準の 4 記事の 768px 以上の 12 枚すべてで段落が 1px ずつ高くなっており、残りの 3 枚は 375px の折り返しの変化。直したあとは 6 枚で、残りは上の表の折り返しの変化だけ。

### 3.6 フォントを変える前の結果（参考）

Google Fonts を使っていたビルド（b91abab）では、一致 14 枚、範囲内 46 枚、範囲外 0 枚だった。記事ページの 28 枚では、ヘッダー、記事の見出し部分、1 つ目の広告枠、demo、閉じた目次、本文の全体が画素で一致した。メニューボタン、ヘッダーの帯、目次を開いた状態も差 0。

## 4. 範囲外の一覧

なし。最初の比較で範囲外だったコードブロック 114 個は、エクスポーターの直し（9fd05fb）で README 6 章の例外を除いて一致した（3.3）。

## 5. 残ったこと

- 404: 旧サイトも新サイトも Netlify の既定のページなので、Deploy Preview（手順 13）で新サイトの 404 が同じ既定のページになることを確かめる。
- 公開の直前に `.snapshot/baseline-astro/` を撮り直し、公開後はこれを新しい基準にする（08 の 1.7）。
