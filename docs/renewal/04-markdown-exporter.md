# 04 Markdown エクスポーター 詳細設計

`.snapshot/html/` に残っている旧サイトの生成済み HTML から記事を取り出し、`src/content/posts/` の Markdown と `src/content/terms/` の JSON を作る変換器の設計です。

設計の判断は、scratchpad で全 1030 記事を実際に変換して確かめています。試作のコードと出力は次の場所にあります（リポジトリには入れていません）。

- 試作: `scratchpad/md-exporter/`
  - `load.cjs`（`__NUXT__` の取り出し）、`convert-unified.mjs`（変換）、`frontmatter.mjs`、`export.mjs`（書き出し）、`verify.mjs`（往復検証）
  - 書き出し結果: `out-v4/`、Astro で実際にビルドした結果: `astro-check/dist/`

## 結論

- 変換は unified（rehype-parse → rehype-remark → remark-gfm → remark-stringify）で行います。turndown より和文の強調と記号のエスケープが正確で、変換規則も hast の段階で書けます。
- 本文がある 861 記事のうち 841 記事は、Markdown を HTML に戻すと旧サイトの本文と構造・テキスト・コードの class と textContent まで一致しました。残る 20 記事は旧サイトで壊れていた表示や行き先のないリンクを意図して直したもの（リーダー決定済み）で、説明のつかない差は 0 件です。コードブロックは 762 個すべてで class が一致し、textContent は意図して直した 5 個を除いて一致しました。
- コードブロックはリーダーの方針どおり、すべてフェンス付きコードにしました。info string には元の class の文字列をそのまま書き（正規化しない）、`<br />` は改行にして、先頭の空行も中身として残しています。
- 和文で `**` が閉じない強調（7 記事 13 か所）は、インラインの `<strong>…</strong>` / `<em>…</em>` で書きます。
- 同じ結果を、remark での再変換、Astro 7 の既定の Markdown 処理系 Sätteri での再変換、Astro 7.4.2 で 1030 ページを実際にビルドした HTML の 3 通りで確かめました。
- 受け渡し形式の変更（11.）と、ユーザー確認が要った点（12.）は、リーダーが決めた内容を反映済みです。

## 1. 入力の読み方

### 取り出し方

`.snapshot/html/**/index.html` の 1321 ページすべてから `<script>window.__NUXT__=(...)</script>` を取り出し、node の `vm` で空のコンテキストで評価します（`inventory.cjs` と同じ方法）。`state.{tip,clip,lab,tax}.cachePosts` に入っている記事を集めます。

1321 ページすべてで評価に成功し、記事は 1030 件（tip 165 / clip 817 / lab 48）集まりました。

### 単一記事ページと一覧ページのどちらを正とするか

単一記事ページの値を正とします。単一ページがない記事だけ一覧ページの値を使います。

- 単一ページと一覧ページの両方に出てくる 590 記事で、`id` `title` `content` `excerpt` `date` `type` `terms` `fields` `prev` `next` を比べたところ、全項目が一致しました。どちらを使っても結果は同じです。
- 単一ページを優先するのは、単一ページの `images` に WP REST API の生のオブジェクトがそのまま入っているからです（旧実装のマッピングの不具合で `images.caption` などに丸ごと入っている）。ここから `date_gmt` `modified` `acf` が取れ、日付の検証に使えます。
- 単一ページがない記事は 2 件です。どちらも slug にエンコード済みの文字が入っている記事で、`.snapshot/html/` のディレクトリは空でした。
  - `clip/%e3%81%ad%e2%80%af-%e2%80%afnt`（デコードすると `ね - nt`。空白に見えるのは U+202F）
  - `lab/%e7%84%a1%e9%99%90...`（`無限ループするニュースティッカー-『javascript』`）
  - `webmanab.netlify.app` で、sitemap と同じ小文字のエンコード、大文字のエンコード、二重エンコードの URL を試し、どちらの記事もすべて 404 でした。旧サイトでもこの 2 記事のページは開けていなかったことになります。
  - 本文は一覧ページ（clip は 7 ページ、lab は 1 ページ）にあり、上の比較のとおり一覧の値は単一ページと同じなので、そこから取ります。

ブリーフの「本文がある記事は 859 件」は単一ページがある 1028 件で数えた値で、この 2 件を足すと 861 件です。

### 本文が空の記事

- clip の 169 件は `content` が空文字です。frontmatter だけのファイルとして出します（本文なし）。`excerpt` も空なので出しません。
- `lab/noise-glitch` は本文が iframe 1 つだけで、テキストはありません。iframe を HTML のまま残します。

### 使わないデータ

- `writer` タクソノミー: 全記事が `uto usui` 1 人（clip 27 件は `false`）なので出しません。
- `images`、`clipImage`、`prev.img` などの画像: 最初は復元しない決定で出していませんでしたが、旧 WordPress の uploads が見つかったので、clip の画像だけを `image` / `fullImage` として出すようにしました（3. の「画像」、5.）。tip のアイキャッチ画像は使いません（SVG のアイキャッチのまま）。

## 2. 変換ライブラリの選定

unified を採用します。同じ前処理と同じ往復検証で比べた結果です（この比較はコードの先頭・末尾の空行を落としていた段階のもので、比べている点はコードの扱いに関係しません）。

| | unified | turndown |
| --- | --- | --- |
| 旧サイトの表示と一致した記事（手当てなし） | 860 / 861 | 840 / 861 |
| 和文の強調（`**「…」**を` など）が閉じない | 0 | 7 記事 |
| 画像を抜いたあとの空段落が残る | 0 | 10 記事 |
| URL 内の `_` を `\_` にする、空白入りの href を壊す | 0 | 2 記事 |
| 変換規則の書き方 | hast / mdast のノードを直接扱う。要素ごとに handler を差し替えられる | DOM 文字列のルール。既定のエスケープを細かく制御しにくい |

決め手は和文の強調です。CommonMark では `処理すると**「要素」**を` のように区切り記号が約物と和字に挟まれると強調になりません。unified では mdast の段階で強調のノードを見て、成立しないものを `<strong>` に置き換えられます（3. を参照）。turndown はそのまま `**` を出すので、7 記事で強調が文字の `**` として表示されます。

このとき unified で 1 件だけ合わなかったのは `tip/easy-instagram-feed` で、地の文の URL に日本語が続いているため GFM の自動リンクが日本語まで URL に含めてしまうものです。これは「4. 意図して直すもの」で手当てします。

## 3. 要素ごとの変換規則

ブリーフの出現数は 1028 件で数えた値で、下の表は 1030 件で数え直した値です（差は単一ページがなかった 2 記事の分）。

| 要素 | 件数 | 変換 |
| --- | --- | --- |
| p | 1968 | 段落。iframe や input を含む段落は段落ごと HTML で残す（下記）。画像だけの段落は消す |
| code | 1865 | pre の中は 762（フェンス付きコード）、それ以外 1103 はインラインコード |
| li | 1451 | リスト項目。元の li に `<p>` があるときだけ項目の間を空ける（下記） |
| br | 831 | pre の中の 571 は改行。段落中の 255 などはバックスラッシュ改行 `\` |
| pre | 762 | フェンス付きコード。info string は元の class そのまま（下の表） |
| ul / ol | 702 / 26 | `-` と `1.`。ol に `start` 属性はなかった。入れ子は 1 か所（`tip/webgl-three-start`） |
| h2 / h3 / h4 | 346 / 478 / 401 | `##` `###` `####`。h3 / h2 / h4 の中のインラインコード 11 件もそのまま |
| h1 | 1 | 本物の見出しではない。`tip/frontnote` のコード中でエスケープ漏れの `<h1>` がタグとして解釈されていたもの（4. を参照） |
| h5 | 0 | 出現なし |
| dl / dt / dd | 67 / 336 / 337 | Markdown に定義リストがないので HTML のまま残す |
| a | 303 | `[text](href)`。`target` と `rel` は落とす。class が要るもの 1 件は HTML のまま。旧ドメインの記事へのリンク 14 件はルート相対にする（4.） |
| strong / em | 133 / 8 | `**` / `*`。和文で区切り記号が成立しない 13 か所はインラインの `<strong>` / `<em>` |
| iframe | 60 | すべて `<p>` の中。`<p><iframe …></iframe></p>` を HTML のまま残す |
| img | 38 | `![alt](/images/uploads/…)`。対応表にない画像は落とす（3. の「画像」） |
| input | 3 | `tip/html5-global` の tabindex のデモ。段落ごと HTML のまま |
| style | 2 | `tip/html5-global` と `tip/transition` のデモ用 CSS。`<p>` を外して `<style>` ブロックとして残す |
| figure / div | 1 / 1 | `tip/transition` のデモ（`<figure><div class="ex"></div></figure>`）。HTML のまま |
| span | 1 | 属性のない `h4 > span`。span を外して中身だけ残す |
| blockquote | 1 | `>` |
| HTML コメント | 1 | 4. を参照 |

### コードブロック（pre / code）

- 生 HTML の `<pre>` としては残さず、762 ブロックすべてをフェンス付きコードにします。
- `pre > code` の中身は、テキストはそのまま、`<br />` は改行にして取り出します。何も削りません。
  - WordPress の wpautop が 570 ブロックの先頭に `<br />` を入れていて、旧サイトでは先頭に空行が見えていました。115 ブロックは `<code>` の直後に改行があり、同じく先頭が空行でした。どちらも中身として残します。
  - 行頭のインデント、行末の空白（20 ブロック 30 行）、途中の空行（204 ブロック）、末尾の空行もそのまま残します。
  - 取り出した文字列は最後の改行も含めてそのまま書きます。フェンス付きコードは描画すると最後に改行が 1 つ付くので、描画側（アーキテクチャのプラグイン）で全ブロックの末尾の改行を 1 つ外します（リーダー決定済み）。この分担で、元の中身が改行で終わっていない `tip/divide-retina`（`}` で終わる）も含めて、描画した `<code>` の textContent が元と同じになります。
- 書き出した Markdown では、たとえば次のようになります（先頭の空行は元の `<br />` の分、最後の 2 行の空行は元の末尾の `\n\n` の分）。

  ````md
  ```bath

  npx create-nuxt-app your-title


  ```
  ````

- コード中の HTML 実体参照（`&lt;` など）はデコードした文字で書きます。表示されていた文字と同じです。`&amp;#9312;` のように実体参照そのものを見せていたもの（`tip/circle-number`）は `&#9312;` という文字列のまま残ります。
- 中身に ```` ``` ```` を含むブロック 2 つ（`tip/frontnote`）は、remark-stringify が自動で 4 つのバッククォートのフェンスにします。
- インラインコードの中のバッククォート（`tip/javascript-operator` の ``true``false``、`tip/typescript-basic` の ` `` `）も、remark-stringify がフェンスの長さと前後の空白を調整して正しく書きます。往復検証でインラインコード 1103 件の中身が全件一致しています。

info string には `<code>` の class の文字列をそのまま書きます。`bath` `CSS` `HTML` `yml` `shell` なども直しません。class がないブロックは info string を空にします。描画のときに旧サイトと同じ `<pre><code class="元の文字列">` を出す rehype プラグインはアーキテクチャ担当が用意します。

| class（そのまま info string になる） | 件数 |
| --- | --- |
| js | 148 |
| bath | 56 |
| html | 49 |
| ts | 38 |
| css | 27 |
| bash | 18 |
| scss | 15 |
| xml | 7 |
| sass | 6 |
| CSS | 4 |
| json | 3 |
| yml | 2 |
| php | 2 |
| HTML | 1 |
| shell | 1 |
| なし（info string は空） | 385 |

旧サイトでは、このクラスは色付けに使われていませんでした。`EntryContent.vue` は `pre` 要素に対して highlight.js 10.1.1 の `highlightBlock` を呼んでいて、10.1.1 の `blockLanguage` は `pre` 自身とその親の class しか見ません。`pre` にも親の `div.entry-content__inner` にも言語のクラスはないので、762 ブロックすべてが登録済みの 7 言語の中から自動判定で色付けされていました。新サイトでも、アーキテクチャ担当が同じ highlight.js 10.1.1 の自動判定を描画時に全ブロックへ当てます（リーダー決定済み）。エクスポーターは判定の結果を Markdown に書きません。

### 改行（br）

段落中の `<br>` はバックスラッシュ改行（行末の `\`）にします。

- 行末 2 スペースは目に見えず、エディタや整形で消えやすいので使いません。
- `<br>` のまま残すと Markdown として読みにくくなります。
- バックスラッシュ改行は CommonMark と GFM の正式な書き方で、remark と Sätteri の両方で `<br>` に戻ることを確かめました。段落の最後に `<br>` がある段落（Markdown では表せない）はありませんでした。

### HTML のまま残すもの

Markdown に対応する書き方がない要素と、デモとして動いていた要素は HTML のまま残します。

| 残し方 | 件数 | 対象 |
| --- | --- | --- |
| `<dl>…</dl>` ブロック | 67 | dt / dd の中のインラインコード 122 件、リンク 2 件、`<br>` 3 件も HTML のまま |
| `<p><iframe …></iframe></p>` ブロック | 60 | jsfiddle、CodePen、YouTube など |
| `<p>…</p>` ブロック | 2 | input のデモ 1、class 付きリンク `a.ex01` のデモ 1 |
| `<style>…</style>` ブロック | 2 | デモ用 CSS |
| `<figure>…</figure>` ブロック | 1 | デモの要素 |

壊れない書き方として、次を守ります。

- HTML ブロックの前後には必ず空行を入れます（remark-stringify がブロックの間に空行を入れる）。
- `<p>` `<dl>` `<figure>` で始まるブロックは CommonMark では空行で終わるので、ブロックの中に空行を入れません。書き出した dl 67、p 62、figure 1 の中に空行がないことを確かめました。`<style>` は `</style>` まで続く種類のブロックなので、中に空行があっても壊れません。
- iframe を `<p>` で包んだまま残すのは、旧 CSS が `.entry-content__inner p` に左余白（タブレット以上で 4/12）を付けていて、iframe もその位置に置かれていたからです。
- HTML の中の特殊文字は `&amp;` `&lt;` のような名前付き参照で書きます（`&#x26;` より読みやすいため）。
- HTML ブロックの中は Markdown として解釈されないので、dd の中のコードは `<code>` のまま残ります。

### 見出し・リスト・引用・強調・リンク

- 見出しは `#` 形式（ATX）にします。
- リストの記号は `-`、番号付きは `1.` から順に振ります。項目の字下げは記号の幅に合わせます。
- rehype-remark の既定では、入れ子の ol を含む li があると全項目が「ゆるいリスト」になり、各項目が `<p>` で包まれてしまいます。元の li に `<p>` があるとき（5 項目）だけゆるいリストにするように handler を差し替えました。
- 強調は `**` と `*` にします（`_` は和文の中で強調として働かないため使わない）。
- リンクの `target="_blank"` 74 件と `rel` は落とします。外部リンクのうち target 付きは 70 件、なしは 215 件で、記事によってばらばらでした。外部リンクを新しいタブで開くかどうかはサイト全体の方針として描画側で決めるのがよいと考えています（10. を参照）。
- `title` 属性のあるリンク 1 件は `a.ex01` のデモなので HTML のまま残します。`fancybox-iframe` の class 1 件は旧テーマのライトボックス用で、いまは意味がないので落とします。
- 空白入りの壊れた href（`tip/brackets-file-tree-exclude` の `http://File Tree Exclude`）は `<http://File Tree Exclude>` の形で書かれ、描画すると空白が `%20` にエンコードされます。元からホスト名として成り立たないリンクなので、そのままにします。

### 画像（img）

最初は 38 個すべてを落としていました。そのあと旧 WordPress の uploads が見つかったので（README 8 章の置き場所）、戻しています。

- `scripts/export-markdown/images.ts` が、uploads から画像を `public/images/` に書き出し、元の URL との対応表 `scripts/export-markdown/images.json` を作ります。エクスポーターはこの対応表を読みます。対応表がないときは、前と同じく画像を落として書き出します。
- 本文の画像は 38 枚とも、それぞれ 1 つだけの段落に入っていました。`![alt](/images/uploads/2017/01/tuesday.png)` の形で書きます。ファイルは元のまま（PNG / JPEG）で、パスは uploads の年月のフォルダをそのまま使います。class、srcset、width などの WordPress の属性は落とします。
- `width` と `height` は Markdown に書けないので、描画のときにファイルから読んで付けます（`src/lib/markdown/image-size.mjs`）。`loading="lazy"` もここで付けます。
- alt は旧サイトの値をそのまま使います。ほとんどはファイル名と同じ英単語（`basic` `sum` `CardExpansion` など）です。alt が空かなかった 3 枚には、記事の文脈から付けます（4. の手当て）。
  - `tip/flat-ui-colors-2`: 「Flat UI Colors 2 のパレット一覧の画面」
  - `tip/low-polygon-art`: 「Low Polygon Art のグラデーション一覧の画面」
  - `tip/static-random-gradation-…`: 「色相環」。この 1 枚は Google の画像サーバー（lh3.googleusercontent.com）を指していたので、写しを `2017/02/hue-circle.jpg` として置きました。
- `tip/control-random-values` の `square.png` は、元の URL のホスト名が `wp.ebmanab-html.com`（w が抜けている）で、旧サイトでも表示されていませんでした。ファイル名は uploads のパスで引くので、新サイトでは表示されます。

clip の画像（見出しのスクショとページ全体のスクショ）は本文ではなく frontmatter に出します（5.）。

### WordPress 特有の記号

- `&#8211;` などの実体参照は、すべてデコードした文字（`–` `’` `“` `…` など）で書きます。旧サイトで表示されていた文字と同じです。
- wptexturize が地の文で `--` を `–` に、引用符を曲がった引用符に変えていますが、元の文字は分からないのでそのままにします。たとえば `tip/html5-basic` の「連続した「–」ハイフン」は HTML コメントの説明なので、書き手は `--` と書いたと考えられます。ただ旧サイトでも `–` で表示されていたので、ここも直しません。
- WordPress がクォートの前にバックスラッシュを足した跡（`\’` や、コード中の `\"`）も、旧サイトの表示どおり残します。
- `&#x1f35f;` のような絵文字の数値参照も、デコードして絵文字で書きます。コード中で二重にエスケープされていたものは 4. で扱います。

### Markdown として意味を持つ文字のエスケープ

remark-stringify が文脈を見て、必要なところだけエスケープします。地の文に残ったエスケープは次のとおりで、どれも元の文字を表示するために必要なものです。

| 文字 | 件数 | 例 |
| --- | --- | --- |
| `*` | 16 | 行頭の `\*余白を生かした…`（`clip/ureshinochadoki`） |
| `` ` `` | 10 | 地の文のバッククォート（`lab/processing-js-gradation-dot`） |
| `_` | 4 | 見出しの `\_head.ejs`（`tip/ejs-basic`） |
| `<` | 4 | 地の文の `\<ex>`（`tip/html5-basic`） |
| `:` | 2 | `http\:// のURLから`（GFM の自動リンクを避けるため。`tip/from-http-to-https`） |
| `[` | 2 | `\[…]`（`tip/wordpress-excerpt-test`） |
| `(` `)` | 1 ずつ | `Adele_Goldberg_\(computer_scientist\)`（`tip/adele`） |
| `#` | 1 | 段落の先頭の `\#### memo`（元が `<p>#### memo</p>`、`tip/html5-basic`） |

`|` はテーブルの外ではエスケープ不要なので出てきません。

### 和文の強調

CommonMark では、`**` の外側が和字で内側が約物（`処理すると**「要素」**を` など）のように、区切り記号の前後の文字の組み合わせによって強調が成立しません。Sätteri もこの規則どおりに動きます。

- mdast の段階で、各 strong / emphasis の開き・閉じの前後の文字を micromark と同じ分類（空白・約物・それ以外）で調べ、CommonMark の left-flanking / right-flanking の条件を満たさないものだけ、インラインの `<strong>…</strong>` / `<em>…</em>` に置き換えます。中のインラインコードなどは Markdown のままです。
- 対象は 7 記事 13 か所（strong 12、em 1）です。`tip/check-whether-there-is`、`tip/frontnote`、`tip/html5-global`、`tip/javascript-call-and-return`、`tip/javascript-object-about`、`tip/method-control`、`tip/resposive-background`。
- 例: `それをif文で処理すると<strong>「要素があるかどうか」</strong>を判別する`
- remark-stringify の既定（隣の文字を `&#x3068;` のような数値参照にする）は、読みにくいので使いません。書き出した Markdown に、強調のための数値参照は残っていません。

## 4. 意図して直すもの

旧サイトで表示が壊れていたもののうち、書き手の意図がはっきりしているものだけ直します。どれも書き出しの記録に種類つきで残し、往復検証では「登録済みの意図した差」として扱います。

| 種類 | 記事 | 内容 |
| --- | --- | --- |
| HTML コメントを文字に戻す | `tip/html5-basic` | 地の文の「`<!--`」と「`-->`」がコメントとして解釈され、「」で囲んだ範囲…と表示されていた |
| コード中のタグを文字に戻す | `tip/frontnote` | コード中の `<h1 class="h1-old">title01</h1>` がエスケープされておらず、`title01` だけが見出しの形で出ていた |
| コード中の絵文字を戻す | `tip/gulp-imagemin-2018`、`tip/javascript-es6` | WordPress が絵文字を `&#x1f363;` にしたあとコード内でさらにエスケープし、`&#x1f363;` という文字列が表示されていた（8 か所）。javascript-es6 は「`[...'🍣🍣🍣'].length` が 3 になる」という説明なので、文字列のままでは意味が通らない |
| デモ用 style の p を外す | `tip/html5-global`、`tip/transition` | 中身のない段落ができるだけなので外す |
| 地の文の URL をリンクにする | `tip/easy-instagram-feed` | `https://instagram.com/oauth/...&response_type=token に「CLIENT_ID」と…` の URL 部分。GFM の自動リンクが続く日本語まで URL に含めてしまうため、URL の部分だけ明示的なリンクにして境界を正しくする |
| 旧ドメインの記事へのリンクをルート相対にする | 12 記事 14 か所 | `https://webmanab-html.com/tip/macos-gulp-init/` → `/tip/macos-gulp-init/`。ドメインは失効して駐車ページになっている |
| 行き先のない旧ドメインのリンクを外す | 3 記事 3 か所 | `/reference/shape/` へのリンク。文字だけ残す |

この 7 種類・20 記事は、リーダーの決定で直します。

### 本文中のサイト内リンク

本文の属性と地の文にある `webmanab-html.com` と `wp.webmanab-html.com` の URL を数えました。23 記事に 60 か所あります。相対パスのサイト内リンクはありませんでした（相対の href はデモの `kid.html` などとコード中の文字列だけ）。

| どこにあるか | ホスト | 形 | 件数 | Markdown での扱い |
| --- | --- | --- | --- | --- |
| `a@href` | webmanab-html.com | `https://…/tip/<slug>/`（記事あり） | 8 | ルート相対に書き換える |
| `a@href` | webmanab-html.com | `http://…/tip/<slug>/`（記事あり） | 6 | 同上 |
| `a@href` | webmanab-html.com | `http(s)://…/reference/shape/`（今回のデータにないページ） | 3 | リンクを外して文字だけ残す |
| `img@src` | wp.webmanab-html.com | `https://…/wp-content/uploads/…` | 30 | `/images/uploads/…` に書き換える（3. の「画像」） |
| `img@src` | webmanab-html.com | `https://…/wp-content/uploads/…` | 6 | 同上 |
| `img@srcset` | wp.webmanab-html.com | `https://…/wp-content/uploads/…` | 6 | srcset ごと落とす |
| インラインコードの文字列 | webmanab-html.com | `https://webmanab-html.com/?group=favorite&id=section3` | 1 | 説明用の例なのでそのまま |

Markdown に残るのは a の 17 か所（15 記事）です。

- 記事を指す 14 か所: `tip/2016-2017-css-font`（2）、`tip/from-http-to-https`、`tip/frontnote`、`tip/gulp-from-utf-8-to-shift_jis`、`tip/gulp-imagemin-2018`、`tip/javascript-eslint-gulp`、`tip/library-animation`、`tip/sass-pickup`、`tip/svg-height`、`tip/terminal-alias`、`tip/vuejs-second`、`tip/youtube-responsive-css`（2）。リンク先の記事はすべて今回のデータにあります。
- `/reference/shape/` の 3 か所: `lab/random-color-circle-createjs`、`lab/random-color-square-createjs`、`tip/control-random-values`。

記事を指す 14 か所はルート相対（`/tip/<slug>/`）に書き換えます。`/reference/shape/` の 3 か所は旧サイトにもデータにもないページなので、統合計画（README の 3 章 4）のとおりリンクを外して文字だけ残します（リーダー決定済み）。

### frontmatter の手当て

frontmatter でも 3 件手当てします。

- `clip/the-wing` の `clip-url` は `v` の 1 文字で、入力ミスです。`clipUrl` に出しません（リーダー決定済み）。
- `clip/the-gigi` は `clip-url` が空で、`demo-url` に同じ役割の URL（`http://www.thegigi.it/en`）が入っています。この場合は `demo-url` を `clipUrl` に使います（リーダー決定済み）。
- `lab/effects-to-youtube-videos` の `demo-url` は `https//jsfiddle.net/…` とコロンが抜けています。lab にも `demoUrl` を出すことになったので、Astro のスキーマ（`z.string().url()`）で止まらないよう `https://` に補って出します。（リーダー決定済み）

## 5. frontmatter

ブリーフの形式に合わせて、次のように出します。

```yaml
---
id: 2883
type: tip
slug: "nuxt-static-site-tips"
title: "Nuxt.js でアトミックデザインの静的サイトを作るまでの Tips 集 -『Nuxt』"
date: 2020-03-22T00:26:34+09:00
modified: 2020-03-22T22:13:43+09:00
excerpt: "Nuxt.js は SS（サーバーサイドレンダリング）や SPA の Vue.js サイトを簡単に作成するためのフレームワークです。…"
primaryTag: "Nuxt"
terms:
  - { id: 366, name: "nuxt", slug: "nuxt" }
  - { id: 294, name: "Vue.js", slug: "vue-js" }
legacy:
  prev: dart-sass-with-nuxt
  next: null
---
```

| キー | 決め方 |
| --- | --- |
| `id` | WP の post id。1030 件で重複なし |
| `type` | `tip` / `clip` / `lab` |
| `slug` | `decodeURIComponent` した文字列。常にダブルクォート（`913` のような数字だけの slug が数値にならないように） |
| `title` | 実体参照をデコードし、連続する空白を 1 つにして前後を詰める（二重空白 4 件、前後に空白 6 件）。常にダブルクォート |
| `date` | `date` に `+09:00` を付ける。クォートしない（YAML のタイムスタンプ） |
| `modified` | 任意。WP の `modified` に `+09:00` を付ける。単一ページの生データにしかないので、日本語 slug の 2 件にはない（1028 件に出す）。101 件は `modified` が `date` より前（予約投稿や日付の付け直しと思われる）で、値はそのまま出す |
| `excerpt` | 旧 `excerpt` から HTML タグを除き、実体参照をデコードし、空白を詰め、末尾の `..more` を除く。空ならキーごと出さない（170 件） |
| `primaryTag` | ACF `primary-tag` を前後の空白だけ詰めて出す。大文字・小文字や綴りは直さない（旧一覧カードがこの文字列をそのまま表示していたため）。空文字の 2 件も `""` で出す。必ず出すキー |
| `terms` | その type のタクソノミー（tips / clips / labs）の `{ id, name, slug }`。name はデコード。1 項目 1 行。タームなし（tip 3 件、clip 2 件）は空配列 |
| `clipUrl` | clip のみ。4. の手当てのとおり。ないときはキーごと出さない（`clip/form` は URL なし、`clip/the-wing` は入力ミスの 2 件） |
| `demoUrl` | tip と lab で `demo-true` が true のとき（tip 17 件、lab 41 件）。tip で URL だけ入っていて `demo-true` が false のもの 9 件（多くは `http://re-vite.com/test/demo/` の仮の値）は出さない |
| `image` | clip のみ。見出しのスクショ `{ src, width, height, thumb }`。`src` は 1280px まで、`thumb` は一覧と前後記事ナビ用の 640px で、どちらも WebP。元の画像は、一覧ページの `images[0].url` か、前後の記事のデータにある `img`（縮小版の名前から `-600x338` を外したもの）から取る。WordPress でも画像がなかった `clip/port` には出さない（816 件に出す） |
| `fullImage` | clip のみ。ページ全体のスクショ（WP の `clipImage`）`{ src, width, height }`。1000px までの WebP。高さが WebP の上限（16383px）を超える 2 枚は JPEG（512 件に出す） |
| `legacy` | 任意。`prev` / `next` に旧サイトの前後記事の slug（デコード済み）、なければ `null`。単一ページが取れなかった 2 件（日本語 slug）は出さない。出した 1028 件の参照はすべて実在の記事を指している |

値に手当てが要る記事は次のとおりです。

| 項目 | 記事 | 元の値 | 出し方 |
| --- | --- | --- | --- |
| `clipUrl` が空 | `clip/form` | `clip-url` 空、`demo-url` もなし | 出さない |
| `clipUrl` が空 | `clip/the-gigi` | `clip-url` 空、`demo-url` は `http://www.thegigi.it/en` | `demo-url` を使う（4. の手当て） |
| `clipUrl` が不正 | `clip/the-wing` | `clip-url` が `v` | 出さない（4. の手当て） |
| `primaryTag` が空 | `clip/exclusieve-woningen-hondersalting-makelaars` | 空文字 | `""` |
| `primaryTag` が空 | `clip/logo-wt-en` | 空文字 | `""` |
| `primaryTag` が URL | `clip/humbert-poyet` | `https://www.humbertpoyet.com/` | そのまま（アイキャッチ側で汎用の絵柄にする） |

日付のタイムゾーンは、単一ページの WP 生データにある `date` と `date_gmt`、`modified` と `modified_gmt` をそれぞれ 1028 件比べ、すべて 9 時間差だったことで確かめました。単一ページがない 2 件も同じ扱いにします。

`excerpt` の旧データは `<p>…提供..more</p>` の形で、WP が文字数で切ったあと `..more` を付けたものです（tip 163 件、lab 32 件、clip 8 件）。clip の多くは本文のリストをつなげたものです。旧サイトは `<meta name="description">` にこの値を `<p>` ごと入れていましたが、新サイトではプレーンテキストを使う前提です。

YAML は `yaml` パッケージで書きます。title と excerpt は記号（`:` `#` `「` など）が多いので、要否に関係なく常にダブルクォートにします。

## 6. ファイル名

`src/content/posts/{tip,clip,lab}/<name>.md` の `<name>` は次のように決めます。

- デコードした slug が英小文字・数字・ハイフン・アンダースコアだけで、先頭が `_` でなければ、slug をそのまま使う（1027 件）。
- それ以外は `post-<id>` にする（3 件）。
  - `clip/post-2831.md`（`ね - nt`）
  - `lab/post-1564.md`（`無限ループするニュースティッカー-『javascript』`）
  - `clip/post-693.md`（`_prefix`）

URL は frontmatter の `slug` で決まるので、ファイル名は URL に影響しません。

日本語とエンコード済みの文字列をファイル名に使わないのは、U+202F のような見えない文字がファイル名に入ると、手で開いたり検索したりするときに間違えやすいためです。先頭の `_` を避けるのは、`_` で始まるファイルを除外する書き方（`**/[^_]*.md` など）がよく使われるためです。なお Astro 7.4.2 の glob loader を `**/*.md` で使った場合は `_` で始まるファイルも読み込まれることを確かめています。

書き出し時に、同じディレクトリでファイル名が重複しないことを確認します（今回は重複なし）。

## 7. ターム一覧 JSON

`src/content/terms/{tips,clips,labs}.json` に `[{ id, name, slug, count }]` を書きます。

- 記事の `terms` から集め、`count` は書き出した記事のうちそのタームを持つ記事の数にします。WP の `count` と 287 タームすべてで一致しました。
- 並びは WP の既定と同じ name の昇順（大文字・小文字を区別しない）にします。旧サイトのメニューは WP API を既定の並びで呼んでいました。
- sitemap の `/{tips,clips,labs}/<term_id>` と突き合わせると、記事から集めたタームから漏れるのは labs の 2 件でした。tips 107、clips 156 は漏れなしです。
  - `labs/332` と `labs/333` は記事が 0 件で、ターム一覧ページの state にも id しか入っていません。
  - Wayback Machine にある `wp.webmanab-html.com/wp-json/wp/v2/labs`（2025-01-25 取得）に、`332 interaction` と `333 svg`（どちらも count 0）がありました。同じデータの残り 24 件は id・name・slug・count が今回の集計と全件一致したので、この 2 件の名前を採用します。
- 結果は tips 107、clips 156、labs 26 です（ブリーフの labs 24 に 2 件足したもの）。

## 8. 検証方法

### 往復検証

変換した Markdown を HTML に戻し、元の HTML と比べます。比べる項目は次のとおりです。

| 項目 | 比べ方 |
| --- | --- |
| テキスト | `hast-util-to-text` で取り出し、空白を全部除いて一致、さらに空白を 1 つに詰めて一致。pre と style は除く |
| 見出し | h1〜h6 の並び（レベルとテキスト） |
| コードブロック | 数、class（描画側は `language-` を外して比べる）、`<code>` の textContent の完全一致。元の側は br を改行として数え、何も削らない |
| インラインコード | 中身の並びの完全一致 |
| リンク | href の集まり（元の側は CommonMark と同じ方法で URL をエンコードしてから比べる） |
| iframe | src の並び |
| strong / em | テキストの並び |
| br | pre の外の数 |
| 要素数 | p、ul、ol、li、dl、dt、dd、blockquote、figure、style、input |
| ブロックの並び | 本文直下の要素の並び（画像だけの段落は元の側から除く） |
| 構造 | タグ名・href・src・class と、空白を詰めたテキストだけを残した正規形を文字列として比べる。入れ子や強調の位置のずれもここで分かる |

### 試作での結果

本文がある 861 記事で回した結果です。

| HTML への戻し方 | 一致 | 意図した差のみ | 説明のつかない差 |
| --- | --- | --- | --- |
| remark（remark-parse → remark-rehype → rehype-raw） | 841 | 20 | 0 |
| Sätteri 0.10.5（smartPunctuation 無効、採用する設定） | 841 | 20 | 0 |
| Astro 7.4.2 で実際にビルドした `dist/<type>/<slug>/index.html`（同上） | 841 | 20 | 0 |

描画側は、アーキテクチャのプラグインと同じく各コードブロックの末尾の改行を 1 つ外してから比べています。

コードブロックは全 762 個を 1 個ずつ、`<code>` の class の文字列（描画側の `language-` を外したもの）と textContent で比べました。

- class は 762 個すべて一致しました（class なし 385 個を含む）。
- textContent は 757 個が完全に一致しました。残る 5 個は 4. で直したもの（`tip/frontnote` の `<h1>` 1 個、`tip/gulp-imagemin-2018` の絵文字 2 個、`tip/javascript-es6` の絵文字 2 個）です。`tip/divide-retina` も一致しています。
- 4. の手当てを止めると、textContent も 762 個すべて一致します。

記事単位の補足です。

- 意図した差の 20 記事は、4. の 7 種類で直した記事です。
- 和文の強調を `<strong>` / `<em>` にした 7 記事は、すべて「一致」に入っています（strong / em のテキストと位置も比べている）。
- 検証器は、記事ごとの記録（直した種類）と、その種類で合わなくなる項目の対応表を持っていて、記録で説明できない不一致を「説明のつかない差」として出します。この 20 記事は記録で説明できる項目の不一致を許すので、ほかの変換ミスが隠れる余地があります。そこを次の対照実験で埋めています。
- 対照実験として 4. の手当てを全部止めて回すと、860 記事が旧サイトの表示と一致し、合わないのは GFM の自動リンクの 1 記事だけでした。手当て以外に変換で変わっているところはありません。
- 検証器が壊れた出力を見逃さないことも確かめました。各記事の Markdown の最初の 1 か所をわざと壊して回すと、説明のつかない差として、`**` を `*` に変えたとき 43 記事、最初のコードブロックの 1 行目の末尾に空白を足したとき 149 記事、最初のバックスラッシュ改行を消したとき 97 記事、入れ子のリストの字下げを外したとき 1 記事（入れ子は 1 か所しかない）が出ました。
- frontmatter は、書き出したファイルを YAML として読み直して照合しました。1030 件すべて一致しています（`modified` は `modified_gmt` と同じ瞬間かも 1028 件で照合）。本文が空の clip 169 件、`_prefix`、日本語 slug の 2 件を含め、1030 件すべてをファイルとして出しています。独立した照合として、`date` が WP の `date_gmt` と同じ瞬間になっていること（1028 件）、`title` が旧サイトの記事ページの `h1.entry-head__title` の表示と一致すること（1028 件）を確かめました。
- Astro のビルドでは、スキーマ（zod）を通して 1030 ページが生成されました。`ね - nt` のディレクトリ名には U+202F がそのまま残っていました。
- Astro のビルドでは smartPunctuation を無効にしています（リーダー決定済み）。有効にした場合も、今の記事の検証結果は変わらないことを確かめています（wptexturize ですでに約物が変換済みのため）。
- 旧サイトの `<title>` タグは 203 記事で実体参照が二重にエスケープされていて、タブに `&#8217;` などが出ていました。title の照合に `<title>` ではなく h1 を使ったのはこのためです。新サイトでは再現しません。

和文の強調は、remark-cjk-friendly を使う書き方も試しました。remark では成立しますが、Sätteri では 5 記事で強調が文字の `**` のまま表示されるので採りません。

### リポジトリでの検証コマンド

`pnpm verify:md` で、`.snapshot/html` と `src/content/posts/` の全記事を上の項目で比べ、合わない記事の一覧と理由の内訳、コードブロック単位の class と textContent の一致数を出します。HTML への戻し方は Sätteri（サイトと同じ処理系）を既定にします。

## 9. 実装の置き場所と使い方

### ファイル

- `scripts/export-markdown.ts`: 書き出しの入口
- `scripts/verify-markdown.ts`: 往復検証の入口
- `scripts/lib/wp-snapshot.ts`: `.snapshot/html` から記事を集める
- `scripts/lib/html-to-markdown.ts`: 変換（3. と 4. の規則）
- `scripts/lib/frontmatter.ts`: frontmatter とファイル名

Node 26 は型注釈を外して `.ts` をそのまま実行できるので（ローカルの v26.12.1 で確認）、ビルドの手順は要りません。import には拡張子 `.ts` を付け、型注釈で消せない構文（enum など）は使いません。

### package.json

```json
{
  "scripts": {
    "export:md": "node scripts/export-markdown.ts",
    "verify:md": "node scripts/verify-markdown.ts"
  }
}
```

devDependencies に入れるもの: `unified` `rehype-parse` `rehype-remark` `remark-gfm` `remark-stringify` `hast-util-to-mdast` `hast-util-to-html` `hast-util-to-text` `unist-util-visit` `entities` `yaml`。検証用に `remark-parse` `remark-rehype` `rehype-raw` `micromark-util-sanitize-uri` `satteri`（Astro が使うのと同じ版）。

### 残し方と再実行

エクスポーターはマージ後も `scripts/` に残し、サイトのビルドには含めません（リーダー決定済み）。一度書き出したら Markdown が正になるので、再実行で手直しを消さないようにします。

- 既にある出力ファイル（記事の `.md` とターム一覧の `.json`）は上書きせず、飛ばした数を出す。新しく出すファイルだけ書く。
- `--force` を付けたときだけ、既にあるファイルも上書きする。
- `--out <dir>` で別の場所に書き出せるようにし、手直し済みのファイルと新しい変換結果を diff で見比べられるようにする。
- 画像を作り直すときは、先に `node scripts/export-markdown/images.ts --uploads <dir> …` を走らせてから `--force` で書き出す。
- 書き出しの記録 `scripts/export-markdown.report.json` に、戻した画像（`img-restored`、38 件）、落とした target（74 件）、意図して直したもの（4.）、`<strong>` / `<em>` にした強調（13 か所）を残す。PR でレビューできるようにコミットする。

試作で、既存ファイルを手で書き換えてから再実行すると 1033 ファイル（記事 1030、ターム 3）がすべて飛ばされて手直しが残り、`--force` で上書きされることを確かめました。

`.snapshot/` はコミットしないので、このスクリプトはローカルでしか動きません。CI では回しません。

### Markdown を整形で壊さないために

書き出した Markdown には、コードブロックの行末の空白（13 ファイル 30 行）、先頭・末尾が空行のコードブロック、バックスラッシュ改行（255 か所）があり、どれも Markdown の整形ツールで変わる可能性があります。

- 今の `.editorconfig` は `*.md` で `trim_trailing_whitespace = false` になっているので、これは残す。
- Prettier の対象から `src/content/posts/` を外す（インフラ担当の案。リーダー決定済み）。

## 10. 他の担当と調整が必要な点

### アーキテクチャ

- Markdown の処理系は Sätteri、`smartPunctuation` は無効（リーダー決定済み）。
- HTML ブロック（dl 67、p 62、style 2、figure 1）は、Sätteri の既定で変換されずにそのまま出力されることを確かめました。
- glob loader の既定の `generateId` は frontmatter の `slug` を id に使います。slug は type をまたいでも重複しないので、既定のままで問題ありません。
- `target="_blank"` は Markdown から落とし、外部リンクに付ける処理は描画側でやる（リーダー決定済み）。旧サイトは外部リンク 285 件のうち 70 件だけが新しいタブでした。
- 旧サイトは h2 / h3 から目次（`EntryToc`）を作っていました。見出しに id を付ける処理が要ります。
- コードブロックは、旧サイトと同じ class に戻して highlight.js 10.1.1 の自動判定を全ブロックに当てる rehype プラグインがアーキテクチャ側にあります（`scratchpad/architecture/proto/src/lib/markdown/hljs.mjs`）。
- プラグインで全ブロックの末尾の改行を 1 つ外してください（エクスポーターは最後の改行を外さずに書く。リーダー決定済み、リーダーから伝達）。
- スキーマ: `legacy` と `modified` は任意、`primaryTag` は空文字を許す必須の文字列、`excerpt` `clipUrl` `demoUrl` は任意。

### アートディレクション

- 旧 CSS は `.entry-content__inner` の下の素の `p` `dl` `dt` `dd` `ul` `ol` `li` `pre` `code` `figure` `blockquote` `h2`〜`h4` `strong` に当たっていました。Markdown から出る HTML もこの素の要素なので、同じ当て方で再現できます。class に頼らない前提で組んでほしいです。
- iframe は `<p>` に包んだまま残しているので、段落と同じ左余白の位置に置かれます。
- コードブロックは、旧サイトと同じ highlight.js 10.1.1 の出力（`.hljs-*` のクラス）を描画時に作るので、旧 CSS の色をそのまま使えます。
- clip の全体スクリーンショット（`clipImage`、511 件）も画像なので出しません。clip の記事ページの見た目が変わります。

### アイキャッチ生成

- アイキャッチ担当の依頼どおり、`primaryTag` は前後の空白だけ詰め、大文字・小文字や綴りは元のまま出します。空文字 2 件と URL 1 件もそのまま出します（5. の表）。
- 値は空でないもので 180 種類、前後の空白を詰めると 178 種類、大文字・小文字を区別しないと 167 種類です。表記ゆれはアイキャッチ側の共有モジュールで寄せる予定です。

### インフラ

- `clip/ね - nt/` のように U+202F や日本語を含むパスのページを Netlify が正しく返すかは未確認です。slug はデコード済みのまま振り直さないことになったので、確認が要ります。

## 11. 受け渡し形式の変更（決定済み）

ブリーフの叩き台から、次のように変えました。いずれもリーダーの決定で採用され、試作に反映済みです。

1. ファイル名: `<slug>.md` を基本に、使えない文字があるときは `post-<id>.md`（6. のとおり、3 件）。
2. 空の値はキーごと出さない: `excerpt`（170 件）、`clipUrl`（2 件）。`primaryTag` だけはアイキャッチ担当の依頼で空文字でも出す。
3. `demoUrl` を lab にも出す（41 件）。
4. `modified` を任意項目で出す（1028 件）。
5. `legacy` は任意項目にし、日本語 slug の 2 件では出さない。
6. ターム一覧の `count` は書き出した記事から数え直した値で、記事 0 件のターム（labs 332、333）も含む。並びは name の昇順。

## 12. 決定事項と残っている確認

リーダーが決めたこと（反映済み）:

- 4. の意図して直すもの（当初の 6 種類・17 記事に、行き先のないリンクを外す 3 記事を足した 7 種類・20 記事）は直す。
- `target="_blank"` は Markdown から落とし、描画側で付ける。
- 404 だった 2 記事の slug はデコード済みのまま振り直さない。
- `clip/the-wing` の clipUrl は出さない。`clip/the-gigi` は demo-url を clipUrl に使う。
- エクスポーターはマージ後も `scripts/` に残し、ビルドには含めない。既存ファイルは `--force` のときだけ上書きする。
- Markdown の処理系は Sätteri、smartPunctuation は無効。
- コードブロックの info string は元の class のまま、色付けは highlight.js 10.1.1 の自動判定。
- 旧ドメインの記事へのリンクはルート相対にし、`/reference/shape/` の 3 か所はリンクを外して文字だけ残す。
- コードの末尾の改行は描画側で 1 つ外し、エクスポーターは外さずに書く。
- `lab/effects-to-youtube-videos` の demo-url は `https://` に補う。

残っている確認はありません。
