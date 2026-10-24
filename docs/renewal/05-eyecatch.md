# 05 アイキャッチ生成

記事のアイキャッチを、カテゴリごとのジオメトリックな SVG として生成する仕組みの設計です。前提は `00-brief.md` に従います。

- 試作のサンプル: `docs/renewal/assets/eyecatch-samples/index.html`（ブラウザで開くと一覧カード、前後記事ナビ、OGP の見え方を確認できます）
- 試作のソース: `docs/renewal/assets/eyecatch-samples/src/`（実装時はこれを `src/lib/` に移す想定です）

## 1. 調べたこと

### primaryTag の実データ

`.snapshot/html/**/index.html` の `__NUXT__` を全ページ評価して、記事ごとに `fields["primary-tag"]` とタームを集めました。

- 1030 記事すべてに primaryTag が入っています。1 記事に 2 つ以上の値が出てくることはありませんでした。
- 値は 181 種類です。表記ゆれが多く、次のようなものがあります。
  - 大文字小文字: `javascript` / `JavaScript` / `javaScript`、`webGL` / `WebGL`、`Createjs` / `createJS` / `CreateJs`、`css` / `CSS`
  - 前後の空白: `" wordpress"`, `" Speed"`, `"studio "`
  - 綴りの誤り: `aniamtion`, `portpolio`, `faniture`, `edudation`, `spase`, `holizon`, `typograph`
  - 単数と複数、言い換え: `sport` / `sports`、`woman` / `women`、`photo` / `photograph`、`illust` / `illustration`
  - 意味の分からない値: 空文字 2 件、`https://www.humbertpoyet.com/` 1 件、`ffd` 1 件、`sag` 4 件
- type によって値の性格が違います。
  - tip（165 件）: 技術の名前です。`javascript` 30、`wordpress` 12、`css` 9、`tool` 7、`frontend` 7 など。
  - clip（817 件）: サイトのジャンルです。`studio` 115、`portfolio` 52、`fashion` 42、`webGL` 38、`minimal` 37 など。
  - lab（48 件）: `processing.js` 12、`animation` 10、`Createjs` 系 11 など。
- 同じ値でも type で意味が変わるものがあります。tip の `event` は JavaScript のイベントの記事で、clip の `event` は催し物のサイトです。tip の `grid` は CSS Grid で、clip の `grid` はグリッドレイアウトのサイトです。

### 旧サイトのアイキャッチ画像

一覧ページの `__NUXT__` にある `_embed` の画像 URL と、前後記事の `img` を記事ごとに集め、同じ画像を使っている記事をまとめました。

- 旧サイトがカテゴリ用の画像を用意していたのは tip だけでした。

  | 画像ファイル | 使っていた記事数 | その記事の primaryTag |
  | --- | --- | --- |
  | `2017/02/javascript-e1486950245446.png` | 34 | javascript, JavaScript, javaScript, jQuery, plug-in, ES6, Threejs, math, mouse, sp, mobile, event |
  | `2017/01/front-end-1.png` | 25 | frontend, front-end, tool, git, gulp, webstorm, ejs, api, docker, server, terminal |
  | `2017/01/wordpress.png` | 18 | wordpress, WordPress, " wordpress", admin, " Speed" |
  | `2017/02/CSS3.png` | 15 | css, CSS, flex, grid, font, svg, animation, performance, bug |
  | `2017/09/vue.png` | 5 | Vue.js, Nuxt |
  | `2017/01/sass.png` | 5 | sass, Sass, mixin |
  | `2016/10/html5.png` | 5 | html5, responsive, favicon, javascript |
  | `2017/01/animation.png` | 4 | animation, aniamtion |
  | `2017/02/mac.png` | 4 | mac |
  | `2017/02/gulp.png` | 3 | gulp |
  | `2020/03/typescript.jpg` | 2 | typescript |

  ほかに `2018/02/vuex.png` が画像一覧にありますが、アイキャッチとして使っている記事は見つかりませんでした。tip の残り 16 件はツール紹介などの個別画像、29 件は画像なしでした。
- clip は 812 件が記事ごとのスクリーンショットでした（2 件だけ同じ画像を共有）。カテゴリ画像はありません。
  - 2026-10-25 に、このスクリーンショットを旧 WordPress の uploads から戻しました。clip で SVG のアイキャッチが出るのは、スクショのない `clip/port` だけです。OGP の画像は clip もカテゴリごとの PNG のままです。
- lab は 48 件すべて画像がありませんでした。
- このため、clip と lab のカテゴリ絵柄は旧サイトに手本がなく、今回新しく決めたものです。

### 表示先

- 一覧カード（`components/Article.vue`）は、画像の上に primaryTag の文字列をそのまま表示しています（1 文字目を大きく縁取り）。絵の中にカテゴリ名を入れると同じ情報が 2 回出ます。
- カードの画像枠は 16:9、背景 `#393E46`。幅は 1 列で画面幅、2〜4 列で 370〜700px 前後です。ホバーで枠の外に黄色の `-10px 10px 0` の影が付きます。
- 前後記事ナビ（`components/EntryNav.vue`）は、画像を `background-size: cover` で中央から切り抜き、`rgba(#393E46, .7)` を被せ、その上に白い斜体の文字と題名を載せています。高さは 120px（スマホ）か `17.5vw`（最小 180px）、幅は 50% なので、見えるのは横長の中央の帯（およそ 3:1）です。
- OGP は旧サイトでは全ページ共通の `static/ogp.png`（1200x630、サイト名だけ）でした。

## 2. カテゴリの決め方

### 手順

1. primaryTag を trim して小文字にし、明らかな打ち間違いを直す（`primaryTagKey`。下の「打ち間違いの表」）。
2. type ごとの表（`event` など、type で意味が変わる値）を引く。
3. 共通の表を引く。
4. 見つからなければ、tip と lab だけタームの slug を順に表で引く。clip のタームは `responsive` や `white` など見た目の特徴で、ジャンルを表さないので使わない。
5. それでも決まらなければ type ごとの汎用（`generic-tip` / `generic-clip` / `generic-lab`）にする。

frontmatter の primaryTag は、md-exporter に「trim だけして元の表記を残す」よう頼んであります。一覧カードの表示に使うためです。正規化はこの表を通したときだけ行います。

### 関連記事との共有

`src/lib/primary-tag.ts` を関連記事と共有します（architecture 担当と合意。`03-architecture.md` の 5.1）。関数は 2 つに分けます。

- `primaryTagKey(raw)`: 関連記事用の比較キー。trim + 小文字 + 打ち間違いの修正だけで、カテゴリにはまとめません。20 カテゴリにまとめたものを関連記事に使うと、別のタグの記事まで関連に出てしまうためです。
- `normalizePrimaryTag(raw, termSlugs, type)`: アイキャッチ用のカテゴリ。中で `primaryTagKey` を使います。

打ち間違いの表（`TYPOS`）は関連記事のキーにも使われるので、明らかな綴りの誤りだけを入れました。

| 元の値 | 直した値 | 件数 |
| --- | --- | --- |
| aniamtion | animation | 1 |
| portpolio | portfolio | 2 |
| typograph | typography | 1 |
| edudation | education | 1 |
| holizon | horizon | 1 |
| spase | space | 1 |
| faniture | furniture | 2 |

`sport` と `sports`、`woman` と `women`、`photo` と `photograph`、`illust` と `illustration`、`front-end` と `frontend` は別の語なので入れていません（アイキャッチではそれぞれ同じカテゴリに振り分けています）。関連記事でこれらも同じタグとして扱うなら `TYPOS` に足します。値の種類は、元の表記で 181、trim + 小文字で 168、`primaryTagKey` で 163 です。

### 代表カテゴリと正規化表

代表 20 種と汎用 3 種です。件数は今のデータを上の手順で振り分けた結果です。`[tip]` `[lab]` は、その type の記事の値であることを示します（印のないものは clip）。

| key | 表示名 | 計 | tip | clip | lab | 振り分けた元の値と件数 |
| --- | --- | --- | --- | --- | --- | --- |
| javascript | JavaScript | 53 | 49 | 0 | 4 | javascript[tip] 30, plug-in[tip] 4, javascript[lab] 3, jQuery[tip] 3, JavaScript[tip] 1, UI[lab] 1, form[tip] 1, event[tip] 1, math[tip] 1, mobile[tip] 1, sp[tip] 1, ES6[tip] 1, mouse[tip] 1, javaScript[tip] 1, lightbox[tip] 1, interactive[tip] 1, regexp[tip] 1 |
| css | CSS | 26 | 21 | 0 | 5 | css[tip] 9, CSS[lab] 3, css[lab] 2, font[tip] 2, CSS[tip] 2, performance[tip] 1, grid[tip] 1, flex[tip] 1, background[tip] 1, svg[tip] 1, navigation[tip] 1, table[tip] 1, bug[tip] 1 |
| sass | Sass | 6 | 6 | 0 | 0 | sass[tip] 4, Sass[tip] 1, mixin[tip] 1 |
| html | HTML | 8 | 7 | 0 | 1 | html5[tip] 2, responsive[lab] 1, seo[tip] 1, responsive[tip] 1, favicon[tip] 1, SEO[tip] 1, viewport[tip] 1 |
| vue | Vue | 8 | 5 | 2 | 1 | Vue.js[tip] 4, nuxt 2, Nuxt[tip] 1, Vue.js[lab] 1 |
| typescript | TypeScript | 2 | 2 | 0 | 0 | typescript[tip] 2 |
| wordpress | WordPress | 18 | 18 | 0 | 0 | wordpress[tip] 12, admin[tip] 3, " wordpress"[tip] 1, " Speed"[tip] 1, WordPress[tip] 1 |
| tooling | Front-end Tools | 42 | 42 | 0 | 0 | tool[tip] 7, frontend[tip] 7, git[tip] 5, mac[tip] 5, gulp[tip] 4, webstorm[tip] 2, ejs[tip] 2, api[tip] 1, brackets[tip] 1, docker[tip] 1, server[tip] 1, android[tip] 1, github[tip] 1, terminal[tip] 1, front-end[tip] 1, slack[tip] 1, photoshop[tip] 1 |
| canvas | Creative Coding | 31 | 1 | 6 | 24 | processing.js[lab] 12, Createjs[lab] 6, canvas 4, createJS[lab] 4, geometric 2, CreateJs[lab] 1, noise[lab] 1, createJS[tip] 1 |
| webgl | WebGL | 48 | 2 | 45 | 1 | webGL 38, WebGL 5, 360° 1, vr 1, WebGL[lab] 1, webGL[tip] 1, Threejs[tip] 1 |
| animation | Animation | 67 | 5 | 50 | 12 | animation 18, interaction 17, animation[lab] 10, slider 6, hover 5, animation[tip] 4, loading 3, effect 1, video[lab] 1, hover[lab] 1, aniamtion[tip] 1 |
| scroll | Scroll | 52 | 0 | 52 | 0 | scroll 27, parallax 19, fullscreen 4, horizon 1, holizon 1 |
| studio | Studio | 132 | 6 | 126 | 0 | studio 115, architecture 5, design[tip] 5, branding 4, "studio " 1, creative 1, logo[tip] 1 |
| portfolio | Portfolio | 80 | 0 | 80 | 0 | portfolio 52, gallery 10, illustration 9, photograph 4, photo 2, portpolio 2, illust 1 |
| fashion | Fashion | 51 | 0 | 51 | 0 | fashion 42, beauty 5, kawaii 1, woman 1, luxury 1, women 1 |
| minimal | Minimal | 58 | 0 | 58 | 0 | minimal 37, flat 19, soft 1, line 1 |
| layout | Layout | 66 | 1 | 65 | 0 | grid 25, typography 11, magazine 11, layout 6, UI 3, media 3, navigation 2, responsive 2, blog 1, typograph 1, UI[tip] 1 |
| food | Food | 36 | 0 | 36 | 0 | food 27, drink 8, agriculture 1 |
| culture | Culture | 126 | 0 | 126 | 0 | event 23, music 17, art 14, movie 12, japan 12, education 9, trip 5, sports 5, local 5, video 4, child 4, audio 4, leisure 3, sport 2, game 1, edudation 1, culture 1, museum 1, Japan 1, school 1, play 1 |
| color | Color | 40 | 0 | 40 | 0 | dark 10, red 5, gradation 4, yellow 4, green 4, blue 3, vivid 3, gold 1, pink 1, purple 1, colorful 1, color 1, orange 1, grey 1 |
| generic-tip | Tip | 0 | 0 | 0 | 0 | 今のデータでは該当なし（新しい記事の受け皿） |
| generic-clip | Clip | 80 | 0 | 80 | 0 | product 13, corporate 10, app 9, sag 4, ec 3, car 3, svg 3, faniture 2, community 2, science 2, technology 2, hotel 2, hospital 2, factory 2, recruit 2, medical 2, pet 2, (空) 2, service 2, traffic 1, icon 1, sea 1, https://www.humbertpoyet.com/ 1, ffd 1, wood 1, nature 1, spase 1, shop 1, form 1, public 1 |
| generic-lab | Lab | 0 | 0 | 0 | 0 | 今のデータでは該当なし（新しい記事の受け皿） |

カテゴリ分けで判断したところ:

- 今のデータでは 1030 件すべてが primaryTag だけで決まり、手順 4 のタームで補う道は使われていません。primaryTag が表にない新しい記事のための道です。

- tip の技術カテゴリは、旧サイトの画像の分け方をそのまま使いました（javascript / front-end / wordpress / CSS3 / vue / sass / html5）。旧サイトで別画像だった `animation` は clip と lab にも同名の値があるので共通の `animation` に、`mac` と `gulp` は件数が少ないので `tooling` に入れました。`typescript` は 2 件ですが、旧サイトで専用画像があったので残しました。
- clip は件数の多いジャンルから選び、似たものをまとめました（`event` `music` `art` `movie` などは `culture`、`grid` `typography` `magazine` などは `layout`）。
- clip の `generic-clip` は 80 件あります。`product` 13、`corporate` 10、`app` 9 を独立させる案もありますが、絵柄にしにくいので汎用に入れました。

## 3. 絵柄の設計

### 共通のルール

- 座標系は 640 x 360（16:9）。`viewBox="0 0 640 360"` で書き、表示側で拡大縮小します。
- 色はブリーフの 6 色だけを使います（primary `#f50057`、secondary `#ffd740`、third `#2a8379`、white `#eeeeee`、black `#222831`、gray `#393E46`）。地の色はカテゴリごとに固定です。明るい地（`#eeeeee`）は一覧が淡く見えないよう、どの type でも記事の 35% 以下に抑えています（今のデータで clip 266 / 817 件 = 32.6%、tip 24 / 165 件 = 14.5%、lab 5 / 48 件 = 10.4%）。カテゴリを足すときや地を変えるときも、この割合を数えて確かめます。
- ブリーフのモチーフの使い方:
  - 45 度のストライプとドット: `<pattern>` で塗りに使います。面の一部や背景の帯に置きます。
  - ずらした影: 主役の形に、サイトと同じ左下方向（`-x, +y`）の影を付けます。
  - 角括弧のコーナー線: 全カテゴリ共通で、左上と右下、または右上と左下の 2 か所に置きます（どちらにするかは記事ごとの乱数）。
  - 6px の二重線: 地が `#eeeeee` のカテゴリだけ、外周に引きます。ページの背景と同じ色なので、縁がないと画像の境目が消えるためです。
  - 斜体の大文字: OGP のカテゴリ名にだけ使います（後述）。
- 主役の形は中央の帯（y 73〜287）に収めます。前後記事ナビで見えるのがこの帯だけだからです。
- 使う SVG 要素は `rect` `circle` `line` `path` `polygon` `polyline` `g` `pattern` と `transform` `opacity` `stroke-dasharray` までにしました。filter、mask、foreignObject、CSS、外部参照は使いません。`<img>` で読み込むと外部のフォントや CSS は効かないこと、PNG 化に使う resvg と見た目をそろえることが理由です。
- pattern の id は `e` + 種のハッシュにして、同じページに inline で並べてもぶつからないようにしています。
- 絵の中身はすべて、640 x 360 の `clipPath` をかけた `<g>` の中に描きます。模様や格子は描きやすさのために枠の外まで伸ばしているので、`<img>`、inline、resvg のどれで描いても枠の外に出ないようにするためです。OGP でも絵の部分だけをこの枠で切ってから拡大するので、下の帯に模様がはみ出しません。

### カテゴリごとの絵柄

ロゴは描きません。それぞれの技術やジャンルを連想させる記号や構造を、四角・円・線の組み合わせで表しています。

| key | 地 | 形 | 記事ごとに変わるところ |
| --- | --- | --- | --- |
| javascript | black | 黄色の波括弧 `{ }` にピンクの影、間にコードの行のような横棒、右にドットの面 | 括弧の位置、横棒の長さと字下げと色、ドット面の幅 |
| css | white | 段々に下がる 4〜5 枚の長方形（カスケード）。塗りはティール、ピンク、黒、ストライプ | 段数、塗りの並び、位置 |
| sass | gray | 字下げした角丸の棒（入れ子）と字下げのガイド線、背後にストライプ | 字下げの深さ、棒の長さ |
| html | yellow | 黒い `<` `>` とピンクの `/`、背後にストライプの面 | 位置、ストライプ面の左右 |
| vue | teal | コンポーネントの木構造（四角と丸を直角の線でつなぐ）、1 つだけ黄色 | 子と孫の数、黄色にする節、ドット面の幅 |
| typescript | white | 黒い正方形と、ずれて重なるティールの点線の正方形（型の枠）、ピンクのコロン | 点線の枠のずれ、横棒の長さ |
| wordpress | black | 重なった投稿カード（手前は白、奥は線） | カードの位置、行の長さ、ドット面の左右 |
| tooling | black | 黄色のプロンプト `>` とカーソル、ブランチの線とコミットの丸 | ブランチの分岐と合流の位置 |
| canvas | black | 11 x 5 の円の格子（サイン波で大きさと塗りが変わる）と黄色の波線 | 波の周期と位相、振幅 |
| webgl | black | 三角格子の上に等角投影の立方体（黄、ストライプ、ティール）、ピンクの線の小さな立方体 | 立方体の位置、小さな立方体の左右 |
| animation | yellow | ease-out で進みながら回る四角の残像、点線の軌跡、目盛り | 回転角、軌跡の高さ |
| scroll | white | ずれて重なる横長の帯（視差のレイヤー）、右にスクロールバー | 帯の長さと位置と塗り、つまみの位置 |
| studio | black | 円、正方形、三角形、半円から 3 つを並べた構成（ピンク、白、黄、ティール）、背後にストライプ | 形の選び方と順番、色の割り当て |
| portfolio | gray | 4 x 2 の額縁の並び（線、ストライプ、ドット、塗り）、1 枚だけピンクに黄色の影 | 選ばれる 1 枚、各額縁の塗り |
| fashion | white | 傾いた細長い平行四辺形の列（ピンク、黒、ストライプ）と水平線 | 高さのリズム、塗りの並び |
| minimal | white | 黒い小さな正方形、ピンクの点、細い線だけ | 位置と大きさ |
| layout | white | 12 カラムの薄いガイド線と、段組みのブロック | 段の分け方、塗り |
| food | teal | 皿のような白い円と縁の線、ピンクと黄色の円、2 本の線（箸）、散らした点 | 円の位置、点の位置 |
| culture | black | 音の波形のような縦棒の列と、同心円 | 棒の高さ、同心円の左右 |
| color | white | 色見本の縦長の長方形とストライプ | 並び順と幅。primaryTag が `red` `yellow` `green` `blue` `dark` などのときは、その色に近いものを先頭にする |
| generic-tip | gray | 角括弧 `[ ]` とコードの行 | 行の長さ、ドット面の左右 |
| generic-clip | gray | ブラウザの窓（タイトルバーの 3 つの丸）と中の段組み | 窓の位置、ヒーロー部分の塗り、強調するカード |
| generic-lab | teal | 十字の格子、軌道の円、軌道上のピンクの丸 | 丸の位置、円の位置 |

ロゴと紛らわしくならないよう、次の形は避けました。緑の V 字（Vue）、黄色い正方形に文字（JavaScript）、青い正方形に文字（TypeScript）、円の中の W（WordPress）、盾の形（HTML5 / CSS3）、ピンクの円の中の S 字（Sass）、オレンジの菱形（Git）。

### 記事ごとの揺らぎ

- 種は `"<カテゴリの key>:<記事 id>"` です。FNV-1a でハッシュして mulberry32 の乱数列を作ります。`Math.random` は使いません。
- slug ではなく id を使います。slug にはパーセントエンコードした日本語のもの（lab 1564 など）があり、表記の揺れで種が変わるおそれがあるためです。id は frontmatter に必ず入ります。
- 確認したこと: 全 1030 記事を 2 回生成して、連結した文字列の sha256 が一致しました（mac arm64 と linux/amd64 の両方で同じ値 `ab9a0c20ad773f9f…`）。1030 件の SVG はすべて違う内容でした。

### 文字

- 一覧、記事ページ、前後記事ナビの絵には文字を入れません。カードにはタグ名と題名、ナビには題名がすでに表示されるからです。
- OGP にだけ、カテゴリ名（大文字）とサイト名 `webmanab.html` を入れます。
- 文字はパスにして埋め込みます。Open Sans Bold Italic（SIL OFL 1.1、`@fontsource/open-sans` の woff）から、英大文字・小文字・数字と `. - / : & + #` と空白の 70 字を `opentype.js` で読み、1000 単位のパスと送り幅を `glyphs.json`（29KB）に書き出しました。実行時はこの JSON から組み立てるだけなので、フォントにも opentype.js にも依存しません。カーニングは入れていません。
- 記事タイトルを OGP に入れる案は採りません。日本語フォントのサブセット化が要り、PNG が記事の数だけ増えるためです。

### 表示先ごとの確認

`index.html` をブラウザ（Chrome）で開いて目で確認し、同じ SVG を resvg で PNG にしたものも確認しました。全 1030 記事分の SVG を resvg に通し、1030 件すべて例外なく描画できること、属性に `NaN` や `undefined` が混ざらないことも確かめました。

- 一覧サムネイル: 1440px 幅の 3 列（画像幅 412px）で、線や模様が潰れないことを確認しました。主な線は 640 幅の座標で 3 以上にしてあるので、370px 幅でも 1.7px 以上になります（背景の格子やガイド線だけ 1.5〜2 で、薄く見えるのは意図どおりです）。
- 前後記事ナビ: 中央 3:1 を切り抜いて 70% のグレーを被せても、主役の形が読み取れることを確認しました。ただし全体がかなり暗く濁ります。70% のグレーは旧サイトの見た目なので残します（決定済み）。

### 前後記事ナビ用の変種（案。実装の必須条件ではない）

`rgba(57, 62, 70, .7)` を被せると、表示される色は「元の色 x 0.3 + グレー x 0.7」になり、明暗の差は元の 30% に縮みます。たとえば black `#222831` は `rgb(50, 55, 64)`、white `#eeeeee` は `rgb(111, 115, 120)` になり、差は 204 から 61 に減ります。被せる色は変えられないので、絵の側で差を最大にする変種を作る案です。

- `renderEyecatch(input, { variant: 'nav' })` のように引数で切り替え、URL は `/eyecatch/{type}/{id}-nav.svg` のように別ファイルにする。
- 地はすべて black にする。主役の形は白か黄にし、黒や灰の形は白に置き換える。被せた後に一番明るく残るのが白と黄だからです。
- ドット、ストライプ、格子などの細かい模様は外す。被せた後はざらつきにしか見えず、上に乗る題名の文字の邪魔になるためです。
- 線を 1.5 倍に太くし、コーナー線は外す（ナビの文字と重なるため）。
- 中央 3:1 の帯に主役を寄せ直す必要はない（今の絵柄はすでにその帯に収めてある）。

ファイルは 1030 件分増えますが、合計 2MB 程度で生成時間も同じくらいです。実装するかどうかは、アートディレクション担当がナビの見え方を決めるときに判断してもらえれば十分です。
- OGP: 1200 x 630。上の 500px の高さに 16:9 の絵（コーナー線なし）を置き、左右の余りは地の色で埋めます。下の帯にカテゴリ名のチップ（ピンクのずらした影付き）とサイト名を置き、外周に大きなコーナー線を引きます。

## 4. 生成の仕組み

### いつ作るか

| | ビルド時に生成 | 事前に生成してコミット |
| --- | --- | --- |
| 生成時間 | 1030 件で 24ms（mac）、162ms（linux/amd64 のエミュレーション） | 同じ |
| リポジトリ | ファイルは増えない | SVG 1030 個（合計 2.0MB）が増え、絵柄を直すたびに大きな差分が出る |
| 新しい記事 | Markdown を足せば自動で付く | 生成スクリプトを走らせてコミットし忘れると付かない |
| キャッシュ | 同じ入力なら同じ内容なので、内容が変わらない限り配信側のファイルも変わらない | 同じ |

決定: SVG はビルド時に生成し、コミットしません。

### 配信の形

- 外部ファイルにします。`<img src="/eyecatch/{type}/{id}.svg" loading="lazy">` の形で読み、ページをまたいでブラウザのキャッシュを効かせます。inline SVG にすると一覧ページの HTML が 1 件 1〜8KB ずつ増え、キャッシュも効きません。
- 作り方は、Astro の静的エンドポイント `src/pages/eyecatch/[type]/[id].svg.ts`（`getStaticPaths` から全記事分を返す）です。architecture 担当と合意し、astro 7.4.2 の試作で `dist/eyecatch/tip/2883.svg` のようにファイルで出ることを architecture 担当が確認しています。sitemap には入れません。WP の post id は type をまたいでも重複しないことも architecture 担当が旧データで確認しています。
- 無限スクロールの静的 JSON にも、各記事の SVG の URL を文字列で入れます（`03-architecture.md` の 4.2）。
- 前後記事ナビの背景は CSS の `background-image: url(...)` で同じファイルを使えます。

### 関数の形

```ts
type EyecatchInput = {
  type: 'tip' | 'clip' | 'lab'
  primaryTag?: string | null
  terms?: { slug: string }[]
  id: number
  slug?: string   // 今は使わない（種は id）
  title?: string  // 今は使わない（絵に文字を入れないため）
}
// src/lib/eyecatch/index.ts
eyecatchFor(input): { category: EyecatchKey; svg: string; og: string }
                                         // サイト側が使う URL の組
                                         // 例 { category: 'vue', svg: '/eyecatch/tip/2883.svg', og: '/og/vue.png' }
eyecatchKey(input): EyecatchKey          // どのカテゴリになるか
renderEyecatch(input): string            // 640x360 の SVG 文字列（静的エンドポイントが返す）
renderOgp(key: EyecatchKey): string      // 1200x630 の SVG 文字列（カテゴリごと。build-og が PNG にする）

// src/lib/primary-tag.ts
primaryTagKey(raw): string                                // 関連記事用の比較キー
normalizePrimaryTag(raw, termSlugs, type): EyecatchKey    // アイキャッチ用のカテゴリ
```

`renderOgp` だけは記事の入力ではなくカテゴリの key を受け取ります。OGP はカテゴリ単位なので、記事ごとの値を使わないためです。

`slug` と `title` は依頼の形に合わせて受け取りますが、今は使っていません。種を slug に変えたり、OGP に題名を入れたりするときのために残しています。

ファイルの置き場所の案:

```
src/lib/primary-tag.ts         # 試作の categories.ts（正規化表。関連記事と共有）
src/lib/eyecatch/index.ts      # eyecatchFor / renderEyecatch / renderOgp / eyecatchKey
src/lib/eyecatch/motifs.ts     # カテゴリごとの絵柄
src/lib/eyecatch/svg.ts        # SVG 文字列の小さな関数
src/lib/eyecatch/rng.ts        # 決定的な乱数
src/lib/eyecatch/glyphs.json   # Open Sans Bold Italic のパス（生成物、コミットする）
scripts/build-og.mjs           # prebuild で OGP の PNG を public/og/ に書く
scripts/build-glyphs.ts        # glyphs.json を作り直すときだけ使う
```

依存ライブラリ:

- SVG の生成: なし（文字列を組み立てるだけ）。
- OGP の PNG 化: `@resvg/resvg-js`。動かなかったときの代わりは `@resvg/resvg-wasm`（後述）。
- `glyphs.json` の作り直し: `opentype.js` と `@fontsource/open-sans`。普段は使わないので devDependencies に入れます。入れたくなければ、作り直すときだけ一時ディレクトリで入れて実行する手順でもかまいません。

### OGP の PNG 化

- OGP はカテゴリごとに 1 枚、23 枚だけ作ります（決定済み）。記事ごとに作ると 1030 枚、PNG の合計がおよそ 34MB（今の平均 33KB から計算）増えるうえ、OGP に記事ごとの違いを出す意味が薄いからです。各記事の `og:image` は `eyecatchFor(post).og`（`/og/{category}.png`）を指します。
- PNG にする道具は resvg です。試した結果:

  | | 環境 | 23 枚の時間 | 結果 |
  | --- | --- | --- | --- |
  | `@resvg/resvg-js` 2.6.2（ネイティブ） | mac arm64、Node 26.12.1 | 212ms | 動いた |
  | 同上 | docker `node:26`（Debian 13、linux/amd64、エミュレーション）、Node 26.12.1 | 442ms | 動いた。mac で作った `pnpm-lock.yaml` から `--frozen-lockfile` で入れても、linux 用の `@resvg/resvg-js-linux-x64-gnu` が入った |
  | `@resvg/resvg-wasm` 2.6.2 | mac arm64、Node 26.12.1 | 391ms | 動いた |

  Netlify のビルド環境（noble）そのものでは試していません（未確認）。
  （時間は clipPath を入れた後に測り直した値。wasm 版は入れる前の値）
- 決定: `@resvg/resvg-js`（ネイティブ）を使います。linux/amd64 で動くことは確かめてあるので、Netlify の上では最初の Deploy Preview で確かめます。
- 動かなかったときの代わり: `@resvg/resvg-wasm` に差し替えます。違いは import と初期化だけです。

  ```js
  import { createRequire } from 'node:module'
  import { initWasm, Resvg } from '@resvg/resvg-wasm'
  await initWasm(fs.readFileSync(createRequire(import.meta.url).resolve('@resvg/resvg-wasm/index_bg.wasm')))
  const png = new Resvg(svg).render().asPng()
  ```

  wasm ファイルは 2.4MB で、OS や glibc の事情を考えなくて済みます。23 枚なら速さの差は問題になりません。出力の PNG はネイティブ版とほぼ同じ大きさでした（23 枚の合計 771KB と 772KB。clipPath を入れる前の値）。
- 実行する場所は、pnpm の `prebuild` で走らせる `scripts/build-og.mjs` です（architecture 担当と合意。prebuild が pnpm 11 で走ることは architecture 担当が確認済み）。Vite を通らない素の Node で動くので、ネイティブや wasm のモジュールをバンドルする問題は起きません。
- `build-og.mjs` から TypeScript の `src/lib/eyecatch/index.ts` を直接 import します。Node 26 の型の除去で動くことを、試作（`docs/renewal/assets/eyecatch-samples/src/build-og.mjs`。resvg-js 版で、wasm 版への差し替え方をコメントに書いてある）で確かめました。23 枚が出ることを確認しています。
- 書き出し先は `public/og/{key}.png` です。生成物なので `public/og/` は `.gitignore` に入れます。

### ファイルサイズの目安

| | 目安 | 今の値 |
| --- | --- | --- |
| SVG 1 枚 | 8KB 以内 | 中央値 1.6KB、最大 7.8KB（webgl。三角格子の線が多いため）、1030 件の合計 2.0MB |
| OGP PNG 1 枚 | 150KB 以内 | 23 枚の合計 750KB、最大 101KB |

### カテゴリを足すときの手順

1. `src/lib/primary-tag.ts` の `CATEGORIES` に key を足し、`LABELS` に表示名を書く。
2. 同じファイルの `ALIASES`（type で意味が変わる値は `TYPE_ALIASES`）に、そのカテゴリに入れる primaryTag の値を小文字で足す。
3. `src/lib/eyecatch/motifs.ts` の `RECIPES` に、地の色・線の色・`draw` を足す。`draw` は共通のルール（中央の帯、使ってよい要素、6 色）に従う。
4. `RECIPES` は `Record<EyecatchKey, Recipe>` なので、書き忘れると `astro check`（tsc）でエラーになります。
5. サンプルの一覧ページ（`docs/renewal/assets/eyecatch-samples/index.html` を作ったスクリプトに相当するもの）で、一覧・ナビ・OGP の見え方を確認する。
6. カテゴリ名に `glyphs.json` にない文字（日本語や記号）を使うときは、`scripts/build-glyphs.ts` の文字の一覧に足して作り直す。

## 5. 他の担当と調整が必要なこと

- アートディレクション
  - 地が `#eeeeee` の絵は外周に二重線を引きました。カード側の CSS で枠を付けるなら、絵の側の二重線は外せます。
  - 明るい地の割合は、studio を black、generic-clip を gray の地に変えて、どの type でも 35% 以下にしました（clip 32.6%）。
  - 前後記事ナビの 70% のグレーは残すと決まりました。明暗の差を強めた変種（3 章の案）を使うかどうかを決めてほしいです。
  - 記事ページでアイキャッチをどこにどの大きさで出すか（旧サイトの記事ページでは単一記事側の画像情報が壊れていて、実際の表示を確認できていません）。
- アーキテクチャ（合意済み。`03-architecture.md` の 5.1 と 6.6）
  - `src/lib/primary-tag.ts` を共有し、関連記事用の `primaryTagKey` とアイキャッチ用の `normalizePrimaryTag` に分ける。打ち間違いの表は 1 つにして両方から使う。関連記事で打ち間違いを同じタグとして扱うのは旧来から変わる点なので、architecture 担当がユーザー確認の項目に入れています。
  - SVG は `/eyecatch/{type}/{id}.svg` を静的エンドポイントで出す。サイト側は `eyecatchFor(post)` から URL の組を受け取る。
  - OGP の PNG は prebuild の `scripts/build-og.mjs` で `public/og/{category}.png` に出す。
  - 前後記事ナビの背景に前後記事の SVG を使う案は、architecture 担当がアートディレクション担当と相談中です。
  - 関連記事で打ち間違いを同じタグとして扱わないことになったら、`primary-tag.ts` から TYPOS を通す前のキー（trim + 小文字だけ）も取れるようにする。今は不要です。
  - `og` は `Astro.site` で絶対 URL にして `og:image` に使う（architecture 担当の側で対応）。
- インフラ
  - `@resvg/resvg-js` が Netlify の noble イメージ、Node 26 で動くかを、最初の Deploy Preview で確かめる。動かなければ `@resvg/resvg-wasm` に差し替える。
- md-exporter（対応済み）
  - primaryTag は trim だけして元の表記を残す。空文字 2 件と URL 1 件もそのまま出る。md-exporter の試作出力（1030 ファイル）の frontmatter から `eyecatchKey` を出し、HTML から集めた値で出した結果と比べて、1030 件すべてでカテゴリと primaryTag が一致することを確かめました。

## 6. ユーザーに確認したいこと

OGP をカテゴリごとの 23 枚にすることは決定済みです。代表 20 カテゴリと汎用 3 つの分け方もこの案で進め、ユーザーにはサンプルを見せて確認します。

- 絵柄の方向。サンプルの一覧を見て、全体の雰囲気と、具体的に直したいカテゴリがあれば教えてください。
- 代表カテゴリの分け方。clip の 80 件（`product` `corporate` `app` など）を汎用の絵（ブラウザの窓）にまとめています。

## 7. 試作の置き場所

- サンプル（ユーザー確認用）: `docs/renewal/assets/eyecatch-samples/`
  - `index.html`: 実際の並び（tip / clip / lab の新しい順 12 件ずつ）、カテゴリごとのサンプル（23 カテゴリ x 3 枚）、前後記事ナビの見え方、OGP 23 枚
  - `svg/`: 一覧用 SVG 93 枚。カテゴリごとのサンプル 69 枚（実記事の id で作ったもの 62 枚、実記事が 3 件に満たないカテゴリ typescript、generic-tip、generic-lab を架空の id 90001〜90003 で補ったもの 7 枚）と、「実際の並び」用 36 件のうちサンプルと重ならない 24 枚
  - `ogp/`: OGP の SVG 23 枚（PNG は本番で resvg が作る）
  - `src/`: 試作のソース一式
- 作業用（このセッションの scratchpad。消えることがあります）: `scratchpad/eyecatch/`。`scripts/` に集計、描画確認、決定性の確認、OGP の時間計測のスクリプトがあります。
