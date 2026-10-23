# 08 品質保証: テスト、a11y、性能、SEO、セキュリティ、公開前後の確認

担当: 品質保証（QA）。前提は `00-brief.md` と `README.md`。各担当の計画書（01〜06）に散らばっていたテストと確認の項目を集め、抜けを足して 1 つの方針にまとめる。食い違いは README を優先した（末尾の「計画書どうしの食い違い」）。

調べた日: 2026-10-23。旧サイトへのアクセスは同時 1 本で行い、Netlify には書き込んでいない。道具は scratchpad（`scratchpad/qa/`）に入れ、リポジトリには入れていない。

- `audit.mjs`: 代表ページに axe-core をかけ、見出し・ランドマーク・Tab の移動なども集めるスクリプト。結果は `results-413.json`（axe-core 4.13.0、2.3 の表のもと）と `results.json`（4.14.0）
- `reflow.mjs`: 320px 幅での横スクロールの確認
- `lh/*.json`: 旧サイトの Lighthouse の結果

## 0. まとめ（層ごとの一覧）

| 層 | 何を | 道具 | いつ | 合格の条件 | CI で止めるか |
| --- | --- | --- | --- | --- | --- |
| 単体 | `src/lib` の関数 | Vitest（`TZ=UTC`） | `pnpm test`。各コミット、CI | 全件通る | 止める |
| コンテンツ | 1030 本の frontmatter、サイト内リンク、旧ドメイン、生 HTML の範囲 | Vitest | `pnpm test` | 全件通る | 止める |
| 外部リンクの死活 | clipUrl など約 1100 URL | 自前のスクリプト（`fetch`） | 月 1 回の定期実行と手動 | 一覧を出すだけ。合否はない | 止めない |
| Markdown の描画 | 本文 1030 本とコードブロック 762 個の出力 | Vitest（ビルド結果の指紋と比べる） | `pnpm test:dist`。CI | 指紋が一致する。変えるときは指紋を更新してレビューする | 止める |
| 往復検証 | 旧 HTML と Markdown の比較（04） | `pnpm verify:md` | ローカルだけ。エクスポーターや描画を触ったとき | 説明のつかない差が 0 | 対象外（`.snapshot/` が要る） |
| ビルド出力 | URL 1323 件、sitemap / RSS / robots、canonical / OGP、BlogPosting、旧ドメイン、HTML の妥当性、容量 | Vitest で `dist/` を読む（`pnpm test:dist`） | CI（`pnpm build` の後） | 全件通る | 止める |
| E2E | メニュー、ヘッダー固定、目次、無限スクロール、シェア、旧 SW の撤去、404、a11y の A（閉じたメニューと目次に Tab が止まらない、メニューの `aria-expanded`、`button` のフォーカスの枠。2.4） | Playwright 1.64.1（`smoke`） | `pnpm test:e2e`。CI | 全件通る | 止める |
| a11y の報告 | ページ単位の axe と数値の指標を、旧サイトの基準の件数と比べる | Playwright 1.64.1、`@axe-core/playwright` 4.13.0、`scripts/a11y-compare.ts` | `pnpm test:a11y`。CI | 合否はない。基準より増えたら警告（2.6） | 止めない |
| 部品単位 | 部品の状態の網羅、部品単位の axe と操作 | 自前のカタログ + Playwright（07） | 07 による | 07 による | 6 章 |
| 見た目の回帰 | 基準 64 枚、computed style 52 ページ、コードブロック 762 個の高さ | Playwright 1.64.1（`visual`）と `.snapshot/baseline/capture.ts` | ローカルの macOS。README 5 章の 12 と PR の前、スタイルを触ったとき | 差が README 4 章の範囲に収まる | 対象外 |
| 性能 | 容量の上限、CLS | Vitest（`dist/` の容量）と Lighthouse | 容量は CI。Lighthouse はローカルと公開後 | 3 章の上限 | 容量は止める。Lighthouse は止めない |
| 依存の脆弱性 | `pnpm audit`、Dependabot | pnpm、GitHub | CI と週 1 回 | high 以上が 0 | 止める |
| 公開前後 | チェックリスト、Search Console、監視 | 手作業と定期実行 | 7 章 | 7 章の各項目 | 対象外 |

`package.json` の scripts は 01 の 7 章の案に `test:dist` と `check:links` を足す案にする（`package.json` はインフラ担当の持ち物なので、渡す側の案）。

```json
{
  "scripts": {
    "test": "TZ=UTC vitest run --project unit",
    "test:dist": "TZ=UTC vitest run --project dist",
    "test:e2e": "playwright test --project=smoke",
    "test:visual": "playwright test --project=visual",
    "test:a11y": "playwright test --project=a11y && node scripts/a11y-compare.ts",
    "check:links": "node scripts/check-links.ts",
    "verify": "pnpm lint && pnpm format:check && pnpm check && pnpm test && pnpm build && pnpm test:dist && pnpm test:e2e"
  }
}
```

- `TZ=UTC` は 03 の 10 章の決定（Netlify と同じ条件で日付のずれを見つける）。Windows では効かない書き方だが、手元は macOS だけなので構わない。
- `test:dist` を `test` と分けるのは、`dist/` がないと動かないため。README 5 章の「各コミットで `pnpm build` と `pnpm test` が通る」に `test:dist` も足す。中身のテストは、対応するページができる手順で順に足す（9 章）。

---

## 1. テスト方針

### 1.1 ファイルの置き場所

```
test/
  fixtures/
    legacy-urls.txt          旧サイトの URL 1323 件（README 3 章の 13。コミットする）
    rendered-fingerprint.json 本文とコードブロックの指紋（1.4）
    legacy-sw.js             旧 SW の代わり（01 の 3 章）
  unit/*.test.ts             単体（1.2）
  content/*.test.ts          コンテンツ（1.3）
  dist/*.test.ts             ビルド出力（1.4、1.5）
  a11y/baseline.json         a11y の基準の件数（2.6）
  a11y/baseline-catalog.json 部品のカタログの基準の件数（07。2.7）
e2e/
  smoke/*.spec.ts            E2E（1.6）
  a11y/report.spec.ts        a11y の報告（2.6）
  visual/*.spec.ts           見た目の回帰（1.7）
  catalog/                   部品のカタログ（07。設定は playwright.catalog.config.ts。ID の対応は a11y-ids.json）
scripts/
  check-links.ts             外部リンクの死活（1.3）
  a11y-compare.ts            a11y の基準との比較（2.6）
```

- 03 の 1.1 では `test/*.test.ts` だけだったので、層ごとにディレクトリを分ける案にした。Vitest は `projects` で `unit`（`test/unit` と `test/content`）と `dist` を分ける。
- `.snapshot/` を読むテストは CI に置かない。`.snapshot/` が要るものは `pnpm verify:md`（04）と `test:visual` だけにする。

### 1.2 単体（Vitest）

03 の 10 章の表をそのまま採る。ここでは足すものと、README の決定で変わるものだけを書く。

| 対象 | 足すこと・変わること |
| --- | --- |
| 関連記事 `related()` | README 3 章の 7 で「自分自身を除く」に決まった。03 の 10 章の「自分を含むかどうか」は除く側でテストする。打ち間違い 7 語（`aniamtion` など）を同じタグとして扱うこと、`sport` と `sports` を別に扱うこと、空白と大文字小文字を無視すること、`primaryTag` が空なら 0 件、同じタグの記事が自分だけなら 0 件 |
| `primaryTagKey` / `normalizePrimaryTag` | frontmatter の値（エクスポーターが前後の空白を詰めたもの）で数えた件数を固定する。`out-v4` の 1030 件で数えると、空文字を含めて 179 種類、小文字にすると 168 種類（どちらも空文字を含む。04 の 178 / 167 は空文字を除いた数）。`primaryTagKey` で 163 種類（05 の値。打ち間違いの直し先を推測して数え直すと 163 になったが、05 の表そのもので確かめたわけではない）。05 の「生の値 181」は空白を詰める前の値なので、frontmatter からは出ない。全記事がどれかのカテゴリ（23 個）に入る。URL の値（`clip/humbert-poyet`）と空の 2 件が汎用のカテゴリになる |
| アイキャッチ | 同じ入力で 2 回作って同じ文字列になる。全 1030 件の SVG をつないだ文字列の sha256 を指紋としてテストに書く（05 で mac と linux の両方で同じ値になることを確かめてある）。絵柄を直したときは指紋を更新する。どの SVG にも `NaN` / `undefined` が入らない。1 枚 8KB 以内（05 の目安）。`viewBox` が 16:9。1030 件がすべて違う内容 |
| 前後記事 `neighbors()` | 03 のとおり `legacy` を持つ 1028 件で一致。加えて、type の最古の記事に prev がなく、最新の記事に next がない |
| ページ分割 | 03 のとおり。加えて、件数が 8 の倍数のターム、そうでないターム、0 件のターム（`/labs/332/`）の 3 通りで End の出し方 |
| `postPath()` | ASCII の slug は変わらない。日本語 slug の 2 件と `_prefix` のパス。`decodeURIComponent` すると frontmatter の `slug` に戻る |
| 日付 | 03 のとおり（`TZ=UTC` でずれない） |
| head の組み立て | `PUBLIC_GA4_ID` と `PUBLIC_ADSENSE_CLIENT` が空なら、タグを出す関数が何も返さない。値があれば返す（ビルドを 2 回しないために、部品ではなく関数で確かめる） |

### 1.3 コンテンツ（Vitest、CI で止める）

`src/content/posts/**/*.md` と `src/content/terms/*.json` を直接読む。スキーマは `src/lib/schema.ts` を `content.config.ts` と共有する（03 の 10 章）。

1. スキーマ: 1030 本すべてが通る。type とディレクトリ名が一致する。`id` と `type/slug` が重複しない。ファイル名が 04 の 6 章の規則に合う（`post-<id>.md` は 3 件）。ターム JSON が通り、記事の `terms[].id` がすべてターム JSON にある。件数が tip 165 / clip 817 / lab 48、ターム tips 107 / clips 156 / labs 26。
2. サイト内リンク: 本文の Markdown のリンク先と生 HTML の `href` のうち `/` で始まるものが、すべて実在のページ（`postPath()` とタームのパス）を指す。今は 14 か所（04 の 4 章）。
3. 旧ドメイン: `webmanab-html.com` を含む URL が、リンク先（Markdown のリンク、生 HTML の `href` / `src`）と frontmatter（`clipUrl`、`demoUrl`）に 1 つもない。本文の文字は対象にしない。`tip/url-query-action` のインラインコードの例（`https://webmanab-html.com/?group=favorite&id=section3`）は 04 が残すと決めたもので、リンクではないので通る。
4. 生 HTML の範囲: コードの外に `<script>`、`on*=` 属性、`javascript:` がない。`<iframe>` の `src` は `jsfiddle.net` だけ（今は 60 件。コードブロックの中の YouTube と Vimeo の例は数えない）。`<style>` があるのは `tip/html5-global` と `tip/transition` の 2 本だけ。新しく生 HTML を書いたらここで気づけるようにする（5 章のセキュリティの前提）。
5. 書き方の条件: 生 HTML ブロックの中に空行がない（03 の 2.3）。

外部リンクの死活（`scripts/check-links.ts`、CI では止めない）:

- 対象: `clipUrl` 815 件、`demoUrl` 58 件、本文の外部リンク 265 件（重複を除く）、iframe の `src` 60 件。エクスポーターの試作出力 `out-v4` で数えた。うち `http://` が本文 108 件、`clipUrl` 415 件ある。2016 年ごろのサイトが多いので、かなりの数が切れていると見込む（未確認。実際には回していない）。
- やり方: HEAD、だめなら GET。同じホストへは同時 1 本、全体で同時 4 本まで、1 件 10 秒で打ち切る。結果を「切れている（DNS が引けない、4xx、5xx）」「転送されている（別ドメインへの 301 など）」「確かめられない（タイムアウト、403 でボットを弾いている）」に分けて Markdown の表で出す。
- いつ: 月 1 回の GitHub Actions の定期実行（`schedule`）と手動実行（`workflow_dispatch`）。結果は Actions の Job Summary に出し、終わったら Moshi の webhook で通知する（`MOSHI_TOKEN` をリポジトリの secret に入れる必要がある。ユーザーの操作）。
- 切れていたときの扱い: 記事もリンクも自動では消さない。clip はそのサイトを紹介した記録なので、リンク先が消えても記事は残す。扱いを変える（リンクを外す、「リンク切れ」と書き添える、Wayback Machine のリンクを足すなど）ときは、一覧を見て 1 件ずつ決める（リーダー決定。README 3 章の 17）。ドメインが第三者に渡って別の中身になっているものは、旧ドメインと同じ危険があるので、一覧で目立つように分ける（転送先のドメインが元と違うもの）。

### 1.4 Markdown の描画の回帰

04 の往復検証（861 本）と 03 のコードブロックの比較（762 個）は `.snapshot/` を読むので CI では回せない。そこで、検証が通った時点の描画結果を「指紋」として固定し、CI ではその指紋と比べる。

- 指紋の作り方: `dist/{type}/{slug}/index.html` から `.entry-content__inner` の中身を取り、04 の往復検証の「構造」と同じ正規形（タグ名、class、href / src と、空白を詰めたテキストだけを残したもの）に直してから、記事ごとに sha1 を取る（1030 件）。生の HTML のまま取ると、Astro や Sätteri の更新で空白の縮め方や属性の順が変わっただけで全件が変わり、差が読めなくなるため。コードブロックは記事ごとに、`pre` の class、`code` の class、`code` の中身の sha1 を並べる（762 個）。`test/fixtures/rendered-fingerprint.json` に書く。大きさは 100KB 前後の見込み（未確認）。
- 作る時期: README 5 章の 6（記事の取り込み）のあと、ローカルで `pnpm verify:md` が「説明のつかない差 0」を出し、03 のコードブロックの比較が 757 一致・5 個が意図した差になったのを確かめてから、`pnpm test:dist --update-fingerprint` で書く。
- CI での比べ方: 全件一致を合格にする。合わなかったら記事名を出す。
- 意図して変えるとき（記事を直した、プラグインを直した）: 指紋を更新し、PR の差分で「どの記事の指紋が変わったか」をレビューする。変わった記事のうち、変えるつもりがなかったものがあればそこで気づける。
- 指紋だけでは差の中身が読めないので、代表 12 本は本文の HTML を Vitest のスナップショット（ファイル）としても持つ。選び方は 02 の 1.1 の基準ページ（`tip/method-control`、`tip/sass-pickup`、`tip/webgl-three-start`、`tip/dart-sass-with-nuxt`、`clip/2016-jsconf-is`、`lab/createjs-node-motion`）に、意図して直した記事（`tip/frontnote`、`tip/javascript-es6`、`tip/html5-basic`、`tip/easy-instagram-feed`）、末尾が改行で終わらない `tip/divide-retina`、和文の強調を `<strong>` にした `tip/method-control` 以外の 1 本（`tip/html5-global`）を足す。
- 描画のプラグイン（hljs、見出し id）の単体テストは 03 の 10 章の「Markdown」の行のとおり。
- 03 の 2.6 のとおり、Astro は変換結果をキャッシュするので、プラグインを直したあとは `astro build --force` でビルドしてから指紋を比べる。

全件を指紋で見て、読める差分は代表のスナップショットで見る、という分担にする。全件のスナップショットを HTML で持つ案は、1030 本で数 MB になり、差分のレビューが現実的でないので採らない。

### 1.5 ビルド出力（`pnpm test:dist`、CI で止める）

`pnpm build` の後に `dist/` を読む。CI のビルドは `SITE_URL=https://webmanab.netlify.app` で、GA4 と AdSense の変数は入れない（01 の 6 章）。

| 項目 | 合格の条件 |
| --- | --- |
| URL | `legacy-urls.txt` の 1323 件をデコードして、対応する `index.html` がすべて `dist/` にある。逆に `dist/` の `index.html`（`/data/`、`/eyecatch/` を除く）が 1323 件より多くない（03 の 10 章「ビルド後の確認」を、余分なページも見るように広げた） |
| 404 | README 3 章の 10 で Netlify 既定の 404 に決まったので、`dist/404.html` がない（03 の 3.4 の案を採るなら、ここを「ある」に変える） |
| sitemap | `/sitemap.xml` が XML として読める。URL が 1323 件で `legacy-urls.txt` と一致する（デコードして比べる）。すべて `SITE_URL` で始まり、末尾がスラッシュ。06 の 2.5 のとおり `lastmod` がある（記事は `modified` か `date`） |
| RSS | `/feed.xml` が XML として読める。項目が 50 件（03 の 6.4）。`link` と `guid` が絶対 URL。`content:encoded` の中の `href` / `src` が `/` で始まらない（相対のままだと RSS リーダーで切れる。03 の 6.4 の未解決点をテストで止める） |
| robots.txt | `Sitemap: {SITE_URL}/sitemap.xml` の行があり、`Disallow: /` がない |
| ads.txt | `dist/ads.txt` があり、`ca-pub-2691922878827958` を含む |
| head | 全ページで `<html lang="ja">`、`<title>` と `<meta name="description">` が空でない。description にタグと `&#` が残っていない。canonical がちょうど 1 つで `SITE_URL + 自分のパス` と一致する。`og:url` が canonical と同じ。OGP は `property="og:*"` で、`name="og:*"` がない。`og:image` が絶対 URL で、その画像が `dist/` にある（`/og/{category}.png` か `/ogp.png`）。`twitter:card` が `summary_large_image` |
| 構造化データ | 記事 1030 ページに `application/ld+json` が 1 つあり、JSON として読める。`@type` が `BlogPosting`、`headline` が title と同じ、`datePublished` が frontmatter の `date`（`+09:00` 付き）、`dateModified` が `modified`（なければ `date`）、`author.name` がある、`mainEntityOfPage` か `url` が canonical と同じ、`image` が絶対 URL。記事以外のページには `BlogPosting` がない |
| 旧ドメイン | `dist/` の HTML、XML、JSON、txt のどこにも `webmanab-html.com` がない。例外は `tip/url-query-action` の `<code>` の中の 1 か所だけ |
| サイト内の参照 | 全ページの `href` / `src` / `srcset` と、インラインの `background-image: url(...)` のうち `/` で始まるものが、`dist/` のファイルを指す（アイキャッチ SVG、OGP、`/_astro/*`、無限スクロールの JSON を含む） |
| カタログ | `CATALOG` なしのビルドに `/catalog/` が出ていない。sitemap にも入っていない（07） |
| 外部リンク | 本文の外部リンクに `target="_blank"` と `rel` に `noopener` が付いている（README 3 章の 5） |
| 広告と GA | CI のビルド（変数なし）では `adsbygoogle.js`、`googletagmanager` が HTML にない。`.entry-ad` の枠は出ている（03 の 9 章） |
| 無限スクロール | `/data/{type}/{page}.json` と `/data/{tax}/{id}/{page}.json` の `total` が記事数と一致し、全ページの `items` を足すと抜けも重複もない。`items[].path` と `eyecatch` が `dist/` にある |
| アイキャッチ | `dist/eyecatch/**/*.svg` が 1030 件。`dist/og/*.png` が 23 件で、1 枚 150KB 以内（05） |
| HTML の妥当性 | 1.5.1 |
| 容量 | 3 章の上限 |

#### 1.5.1 HTML の妥当性

`html-validate` を全 1323 ページにかける（版は 14 日ルールに従って実装時に選ぶ）。

- 規則は `html-validate:document` を基本にし、エラーで止める。テンプレートの不備（入れ子の誤り、閉じ忘れ、重複した属性、`<a>` の中の `<a>`、ブロックの中の不正な要素）を見つけるのが目的。
- 本文の生 HTML から来る既知の違反は、記事ごとに許可リストに書く。わかっているもの: iframe の `frameborder` / `allowfullscreen="true"`（古い書き方）、`h2` が 10 個以上ある記事で起きうる id の重複（03 の 2.5。旧サイトと同じなので直さない）。許可リストにない違反が出たら止める。
- 旧実装の独自属性 `lazy` は 03 の 7.3 で `data-lazy` に変える決定なので、`lazy` 属性が残っていないことも確かめる。

### 1.6 E2E（Playwright、`smoke`、CI で止める）

`astro preview` に対して回す。Playwright は 1.64.1（README 8 章の 5。01 の表の 1.64.0 より README を優先）。Chromium だけで回す。幅は指定がなければ 1080px。

| 対象 | 確かめること |
| --- | --- |
| ページの種類 | `/`、`/tip/`、記事 3 種、ターム一覧、日本語 slug の 2 件（小文字と大文字のエンコード）、`/clip/_prefix/` が 200 で、コンソールにエラーがない |
| メニュー | `.menu__btn`（`button`）を押すと `.menu` に `is-open` が付き、`aria-expanded` が `true` になる。もう一度で外れる。閉じているとき、Tab でメニューの中のリンクに止まらない（2.4 の A-1）。開いたままリンクで別ページへ行って「戻る」と、閉じた状態で表示される（bfcache。03 の 7 章） |
| ヘッダー固定 | 1080px で 46px スクロールすると `.header` と `.header__inner` に `is-fixed` が付き、45px 以下で外れる。768px と 1079px では付かない |
| 目次 | 見出しの押下で開閉する。閉じているとき、Tab で目次の項目に止まらない（2.4 の A-3）。項目を押すと 1 秒前後でその見出しの上端が画面の上から 65px の位置に来る。JS を切っても `href="#a0"` で見出しに飛べる。見出しのない tip でも枠が出る（03 の 2.5） |
| 無限スクロール | `/clip/` で下までスクロールすると 8 件増え、読み込み中は Loader が出る。件数が 8 の倍数のターム（実データから選ぶ）は最後に End が出る。8 の倍数でないタームは読み込み口が消える。0 件の `/labs/332/` は最初から End。2 ページ目の JSON を 500 にしたとき、画面が壊れずに読み込み口が残る（旧来は扱いがなかったので、壊れないことだけを見る） |
| 画像のフェード | 一覧のサムネイルが読み込み後に `data-lazy="loaded"` になる |
| シェア | `navigator.share` を差し替えて、押すと `{ title, url }`（url は canonical）で呼ばれる。`navigator.share` がないとき、押すと `clipboard.writeText` が canonical で呼ばれ、ラベルが `copied` になり、`role="status"` に文言が入り、2 秒で戻る。細かい分岐は 07 の部品のカタログ側（6 章） |
| 旧 SW の撤去 | 01 の 3 章の自動の手順。`legacy-sw.js` を登録してから配信を `dist/` に切り替えて再読み込みし、`getRegistrations()` と `caches.keys()` が空になる |
| 404 | 存在しないパスが 404 を返す。中身は確かめない（`astro preview` と Netlify で 404 のページが違うため。Netlify での中身は Deploy Preview で見る） |
| 外部リンク | 本文の外部リンクが新しいタブで開く設定になっている（1 か所だけ） |
| フォーカスの枠 | Tab でシェアとメニューの `button` に来たとき、outline が 0 でない（2.4 の A-5） |

- スクロールの量と時間を使う確かめ（目次、ヘッダー固定）は、`page.waitForFunction` で条件を待つ。固定の待ち時間は使わない。
- CI では `reducedMotion: 'no-preference'` で回す（既定）。
- axe はこの `smoke` には入れず、別の `a11y` プロジェクトで報告だけを出す（2.6）。

### 1.7 見た目の回帰（ローカルの macOS、CI に載せない）

README 2 章と 01 の 6 章の決定どおり、ローカルの macOS で Playwright 1.64.1（Chromium 156.0.8078.4）で回す。手順は 02 の 1.2 と 10 章のとおりで、ここでは合格の決め方と運用だけを書く。

比べるもの:

1. 基準スクリーンショット 64 枚: `capture.ts --base http://localhost:4321 --out <保存先>` で新サイトを撮り、旧サイトの 64 枚とピクセルで比べる。
2. computed style 52 ページ分: `capture.ts --styles` で新サイトの値を書き出し、02 の 10 章の規則で比べる。
3. コードブロック 762 個の高さ: 02 の 10 章の確認項目 1〜5。全 762 個は、旧サイトの生成済み HTML（`.snapshot/html`）を同じ Chromium で開いて測った高さと、新サイトの高さを比べる。

合格の決め方:

- README 4 章の「見た目が変わるところ」を、変わってよい場所の一覧として先に書いておく（ページ、幅、要素のセレクタ）。アイキャッチ、シェアボタン、メニューのターム一覧、関連記事、一覧ページ全体（旧サイトは JS なしで撮ったもの）、`&#8211;`、前後記事の next の位置、`tip/frontnote` と `tip/javascript-es6` のコード。
- ピクセルの差がこの一覧の要素の範囲に収まれば合格。範囲の外に 1px でも差があれば原因を調べる。同じ条件で撮った旧サイトの 52 枚が完全に一致した（02 の 1.2）ので、差が出たら実際の見た目の差とみなす。
- computed style は、変わってよい要素のキーと 02 の 10 章の除外項目（`transition`、`fontFamily` の引用符）を除いて全部一致すれば合格。
- コードブロックの高さは 762 個すべて一致で合格（README 6 章）。
- 差が出て、それを受け入れると決めたものは、「変わってよい場所の一覧」に理由を書いて足す。黙って受け入れない。

タグが変わる直し: A の対応（2.4 の A-2）で `.menu__btn` が `a` から `button` に変わる。`styles.json` のキーは「タグ.class:何番目」をつないだもの（02 の 10 章）なので、比べるときは `a.menu__btn` → `button.menu__btn` と読み替える（子孫のキーも同じ）。ピクセルの比較には影響しない。読み替えの処理は、比べるスクリプトをリポジトリに移すときにアートディレクション担当に入れてもらう。`.default-layout` に route 名の class を付けない場合は、02 の 10 章のとおりキーからその class を落とす。B の直し（公開後）でタグを変えるときの扱いは 2.5 の最後に書いた。

公開後の運用:

- 旧サイトは公開と同時に `webmanab.netlify.app` から消える。比較は公開の前に終わらせる（01 の 10 章）。
- 公開した後は、新サイト自身を新しい基準にする。公開直前のビルドを `capture.ts` で撮って `.snapshot/baseline-astro/` に置き（コミットしない）、以後スタイルを触ったときはこれと比べる。旧サイトの基準は記録として残す。

---

## 2. a11y

### 2.1 範囲と目標

このリニューアルでは a11y を直し切らない。a11y の作業を次の 3 つに分ける。

- A. リニューアルで必ずやる（今より悪くしない）: 新しいサイトで初めて生まれる問題を防ぐことと、新しく作る部品を最初から正しく作ること（2.4）。旧サイトは中身が空だったので問題が出ていなかったところ（メニュー、目次、関連記事）に中身が入ることで生まれる問題も、ここに入れる。
- B. 一覧にして、直す方針だけ決める（今回は直さない）: 監査で見つかった旧サイトからの違反すべて（2.5）。3 つに振り分け、直し方の案と直す順番の案を付ける。
- C. 件数の見張り（2.6）: axe の結果を CI で報告として出し、マージは止めない。旧サイトで測った基準の件数から増えたら警告を出す。

A は CI で止める（axe ではなく、普通の E2E のテストとして書く）。B と C は止めない。直すときの目安は WCAG 2.2 の AA。

### 2.2 自動と手作業の分担

| 確かめること | 自動（axe など） | 手作業 |
| --- | --- | --- |
| 代替テキスト、リンクとボタンの名前、frame の名前、ランドマーク、見出しの順、`lang`、ARIA の誤用 | axe（ページ単位は 08、部品単位は 07） | 名前の文言が意味として正しいか |
| 色のコントラスト | axe（擬似要素と背景画像の上は判定できず「要確認」になる） | 前後記事ナビの文字、一覧のタグの最初の文字（白抜き）を目で見て、スポイトで測る |
| キーボード操作 | E2E で A の項目（閉じたメニューと目次に Tab が止まらない、`button` のフォーカスの枠）（2.4） | 全ページの種類を Tab だけで一周する。フォーカスが見えるか、順番が見た目と合うか、画面外に行かないか |
| スクリーンリーダー | なし | macOS の VoiceOver と Safari で、トップ、記事、メニュー、目次、シェアを聞く |
| 拡大 | E2E で 320px 幅の横スクロールがないこと | ブラウザの 200% 拡大と、文字だけ 200% で崩れないか |
| 押せる大きさ | axe の `target-size` | スマートフォンの実機でメニュー、タグ、目次を押す |

リニューアルでは、手作業の確認は「旧サイトより悪くなっていないか」を見るために、README 5 章の 12 の後に 1 回だけ行う。旧サイトでも同じ手順を一度通しておき（公開前に。旧サイトは公開で消える）、新旧で違ったところだけを PR に書く。

### 2.3 旧サイトの監査

#### 条件

- 対象: `https://webmanab.netlify.app`（旧サイトの本番。2026-10-23）
- 道具: Playwright 1.64.1（Chromium 1248）、axe-core 4.13.0。07 と合意した `@axe-core/playwright` 4.13.0 の中の axe-core と同じ版にした（`@axe-core/playwright` 4.14.0 は 10-15 公開で 14 日ルールの対象外）。axe-core 4.14.0 でも同じページを測り、違いは記事ページの「／／」の 1 件（下の A11Y-05）が 4.14.0 では出ないことだけだった。
- ルール: タグ `wcag2a`、`wcag2aa`、`wcag21a`、`wcag21aa`、`wcag22aa`、`best-practice`。外したルールはない。
- 幅: 1080px と 375px。
- 通信: 基準撮影（02 の 1.2）と同じく、旧サイトと Google Fonts 以外は止めた（広告、GA、WP の画像、jsfiddle）。Service Worker も止めた。
- 一覧ページ（`/tip/`、`/tips/29/`）は、旧サイトの JS が読み込み後に「Network Error」に置き換えるため、`/_nuxt/` の JS だけを止めて生成済みの HTML のまま調べた。
- ページと状態（キーは 2.6 の基準のファイルでも使う）:

| キー | パス | 状態 |
| --- | --- | --- |
| `home` | `/` | |
| `list` | `/tip/` | `/_nuxt/` を止める |
| `term` | `/tips/29/` | `/_nuxt/` を止める |
| `tip-a` | `/tip/method-control/` | |
| `tip-b` | `/tip/sass-pickup/` | |
| `clip` | `/clip/2016-jsconf-is/` | |
| `lab` | `/lab/createjs-node-motion/` | |
| `menu` | `/` | メニューを開いて 1.5 秒待つ |
| `toc` | `/tip/method-control/` | 目次を開いて 1 秒待つ |

スクリプトは scratchpad の `audit.mjs`（`AXE_PKG` で axe-core の版を選ぶ）。scratchpad は消えるので、リポジトリに移すときは `e2e/a11y/` に同じ条件で書き直す。

#### axe の違反（要素の数。1080px / 375px）

| ルール | 重さ | 基準 | home | list | term | tip-a | tip-b | clip | lab | menu | toc |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `image-alt` | critical | 1.1.1 A | 16/16 | 8/8 | 8/8 | 1/0 | 1/0 | 0/0 | 0/0 | 16/16 | 1/0 |
| `link-name` | serious | 2.4.4 A、4.1.2 A | 24/24 | 8/8 | 8/8 | 1/0 | 1/0 | 0/0 | 0/0 | 24/24 | 1/0 |
| `color-contrast` | serious | 1.4.3 AA | 0/0 | 0/0 | 0/0 | 6/6 | 100/100 | 1/1 | 8/8 | 0/0 | 6/6 |
| `scrollable-region-focusable` | serious | 2.1.1 A | 0/0 | 0/0 | 0/0 | 2/7 | 0/7 | 0/0 | 1/1 | 0/0 | 2/7 |
| `frame-title` | serious | 4.1.2 A | 0/0 | 0/0 | 0/0 | 0/0 | 1/1 | 0/0 | 1/1 | 0/0 | 0/0 |
| `target-size` | serious | 2.5.8 AA | 0/0 | 0/0 | 0/0 | 0/0 | 0/0 | 0/4 | 0/0 | 0/0 | 0/0 |
| `heading-order` | moderate | best-practice | 0/0 | 0/0 | 0/0 | 3/3 | 0/0 | 1/1 | 1/1 | 0/0 | 3/3 |
| `landmark-unique` | moderate | best-practice | 1/1 | 1/1 | 1/1 | 1/1 | 1/1 | 1/1 | 1/1 | 1/1 | 1/1 |

`menu` が `home` と同じなのは、旧サイトのメニューの中身が空だから。`toc` が `tip-a` と同じなのは、目次の中のリンクが違反として出ないから。どの違反がどこから来ているかは 2.5 の一覧に ID で書いた。

axe が「要確認」にしたもの（判定できなかったもの）は 452 件（4.14.0 で数えた値）。

- `strong` のマーカー（背景の線形グラデーション）の上の文字: 計算すると #222831 と、#eee に `rgba(255,255,0,.3)` を重ねた #f3f3a7 で 12.85。通っている。
- `.article-item__tag`、`.article-item__time`、`.article-item__target`（擬似要素の上）: 文字 #393e46 / #222831 と地 #eee、文字 #eee と地 #393e46 で、どれも 9.28 以上。`.article-item__tag::first-letter` の白抜き文字は計算では決められない（A11Y-21）。
- `entry-nav__text` / `entry-nav__title`（前後記事ナビ）: A11Y-20。

#### axe では見えないところ（DOM と Tab で確かめたこと）

| 項目 | 旧サイトの状態 |
| --- | --- |
| `lang` | 全ページ `ja` |
| `h1` の数 | トップと一覧は 1 つ（`h1.header__title` のサイト名）。記事ページは 2 つ（サイト名と記事タイトル） |
| ランドマーク | `header`、`nav.header__nav`、`main.wrapper`、記事ページは `header.entry-head`、`nav.menu`。`footer` はない |
| メニューのボタン | `<a class="menu__btn" href="#">menu</a>`。ボタンとして読まれず、開いているかどうかも伝わらない |
| 目次 | 開閉が `<a class="entry-toc__title" href="#">`、項目が `href="#"`（開いた状態で 17 個）。JS がないと移動できない |
| スキップリンク | ない |
| `:focus` のスタイル | CSS に `:focus` のルールが 1 つもない。リンクはブラウザ既定のフォーカスの枠が出る（Tab で 1 つずつ確かめた）。`button` と `input` は reset が `outline: 0` にしているが、旧サイトには `button` がない |
| `prefers-reduced-motion` | CSS に 1 つもない。メニューは 0.85 秒のスライドと回転、目次の移動は 1 秒の JS のアニメーション |
| 閉じたメニューの中 | ターム一覧が空なので、Tab で止まるリンクは 0 個 |
| 320px 幅（1280px の 400% 拡大に相当） | トップ、一覧、tip、clip のどれも横スクロールは出ない |
| viewport | `width=device-width,initial-scale=1`。拡大は止めていない |

Lighthouse の a11y の点（参考。同じ日に mobile / desktop で 1 回ずつ）: トップ 88 / 88、tip `method-control` 94 / 84、clip `2016-jsconf-is` 93 / 98。

### 2.4 A. リニューアルで必ずやる（今より悪くしない）

#### 新しいサイトで初めて生まれる問題を防ぐ

| ID | 起きること | 防ぎ方 | 確かめ方（CI で止める） |
| --- | --- | --- | --- |
| A-1 | メニューのターム一覧（約 290 リンク）が、閉じているのに画面外で Tab の移動先に入る。旧サイトはメニューが空なので 0 個 | 閉じているときは `.menu__inner` に `inert` を付け、開いたら外す。見た目は変わらない | E2E: 閉じた状態でページの先頭から Tab を押していき、メニューの中の要素に一度も止まらない |
| A-2 | メニューの開閉が `<a href="#">` のままだと、290 リンクの入った領域が開いたか閉じたかが伝わらない（旧サイトの A11Y-13 を、中身が入ることで悪くなる問題として A に移した） | `.menu__btn` を `<button type="button">` にし、`aria-expanded` と `aria-controls` を付ける。class 名は変えない（`capture.ts` がこの class を押す）。`button` になると reset の `outline: 0` でフォーカスの枠が消えるので、A-5 の `:focus-visible` を一緒に付ける | E2E: 押すと `aria-expanded` が `true` / `false` に変わる。Tab で来たとき outline が 0 でない |
| A-3 | 目次の中身。旧サイトは閉じた状態の DOM で `<ul>` が空だった（02 の 4.12）。新サイトはビルド時に目次を出すので、閉じた状態でも `max-height: 120px` の外に隠れた項目のリンクが Tab で止まる（07 の試作で、閉じた目次で 4 つの項目のリンクすべてに止まった。閉じているあいだ `.entry-toc__list` は `opacity: 0` なので、見えないリンクにフォーカスが行く） | 閉じているときは `.entry-toc__list` に `inert` を付け、開いたら外す。見た目は変わらない。開閉の見出しは `<a href="#">` のままにする。旧サイトからの問題で、`<a>` のままならフォーカスの枠も消えないので悪くならない（A11Y-14、公開後の段階 1。リーダー決定） | E2E: 閉じた状態で目次の項目に Tab が止まらない。開くと項目に届く |
| A-4 | clip の「visit to」のリンク（`a.entry-clip__img`）の名前がなくなる。旧サイトは中の `img` の `alt`（「{title}のアイキャッチ画像」）が名前になっていた。アイキャッチを `alt=""` にすると名前が消える | `img` の `alt` を旧サイトと同じ文言で残すか、リンクに `aria-label="{title} のサイトへ"` を付ける | axe の `link-name` が clip で増えない（C の基準） |
| A-5 | 新しく `button` になる 2 つ（シェア、メニュー）のフォーカスの枠が、reset の `outline: 0` で消える。旧サイトのメニューは `<a>` だったのでブラウザ既定の枠が出ていた | `:focus-visible` で outline を付ける。シェアボタンは 02 の 9.1 で決めてある（`#f50057` の 2px、`outline-offset: 4px`）。メニューも同じ値にする。マウスでは見えない | E2E: Tab で来たとき 2 つとも outline が 0 でない |

#### 新しく作る部品を最初から正しく作る

| ID | 部品 | 作り方 |
| --- | --- | --- |
| A-6 | シェアボタン | 02 の 9.1 のとおり。`<button type="button">`、アイコンは `aria-hidden="true"`、コピーの結果は `role="status"` の要素で伝える。ラベルの `share this page` / `copy link` / `copied` が見える文字なので、名前はそれで足りる |
| A-7 | 関連記事（中身が入るのは新しい） | 見出し（`title2`）の後に `<ul>` と `<li>` で出す。0 件のときも枠は出す（03 の 5.1）が、空の `<ul>` は出さない |
| A-8 | アイキャッチ | 一覧は `alt=""`（02 の 9.2）。tip の記事ページの大きなアイキャッチは装飾なので `alt=""`。clip は A-4。前後記事ナビの背景は CSS なので代替テキストは要らない |
| A-9 | 前後記事ナビの背景 | 05 のナビ用の変種（地を黒）を使う（リーダー決定。README に記載）。文字 #eee のコントラストは、地が黒なら計算で 10.31。実際の SVG の上で測るのは README 5 章の 12 で行う（A11Y-20 はこれで片付く見込み） |
| A-10 | 目次の項目のリンク | `href="#a0"` のように実際のアンカーにする（03 の 7.2 で決定済み）。旧サイトの `href="#"` は JS がないと動かなかった |
| A-11 | 無限スクロールの Loader | 見た目だけなので `aria-hidden="true"`。読み込んだことを伝える `aria-live` は B（A11Y-18） |
| A-12 | 外部リンクに `target="_blank"` を付ける処理（README 3 章の 5） | `rel="noopener"` を付ける。新しいタブで開くことを伝える文字は B（A11Y-19）。旧サイトは 285 件のうち 70 件だけが新しいタブだったので、伝わらないまま新しいタブで開くリンクは増えるが、WCAG の違反ではないので B に置く |

A-2 はタグを変えるので、computed style の比較で `a.menu__btn` → `button.menu__btn` のキーの読み替えが要る（1.7）。ピクセルの比較には影響しない。

メニューを開いたあとのフォーカスの移動、Esc で閉じる、開いている間に裏のページに Tab が行かないようにすることは、旧サイトでも同じ状態（悪くはならない）なので B（A11Y-13 の残り）に置く。

### 2.5 B. 旧サイトからの違反の追跡一覧（今回は直さない）

リニューアルの後も追いかけられるように、違反ごとに ID を振る。リポジトリでは、実装のときにこの表を `docs/a11y.md` に移して、状態の欄を更新していく（`docs/renewal/` は計画なので、あとから書き足す場所にしない）。07 の部品単位の結果も、この ID で参照する。件数はページ単位（08）の数だけを数え、07 の数は足さない。

分類: (1) 見た目が変わらない直し、(2) キーボード操作のときや利用者が設定したときだけ見える直し、(3) 誰にでも見た目が変わる直し。

#### ページの種類 × 違反（旧サイトの件数。1080px / 375px。空欄は 0）

| ID | 内容 | ルール | home | list | term | tip-a | tip-b | clip | lab | menu | toc | 分類 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A11Y-01 | 一覧のサムネイルの `img` に `alt` がない | `image-alt` | 16/16 | 8/8 | 8/8 | | | | | 16/16 | | (1) |
| A11Y-02 | 一覧のサムネイルのリンクに名前がない | `link-name` | 24/24 | 8/8 | 8/8 | | | | | 24/24 | | (1) |
| A11Y-03 | tip の最後の Amazon の書籍画像とそのリンクに名前がない | `image-alt`、`link-name` | | | | 1+1/0 | 1+1/0 | | | | 1+1/0 | (1) |
| A11Y-04 | コードの色 #888（3.56）と #d36363（3.45）が AA に届かない | `color-contrast` | | | | 5/5 | 99/99 | | 7/7 | | 5/5 | (3) |
| A11Y-05 | 記事の上の区切り「／／」が #222831 / #393e46 で 1.37 | `color-contrast` | | | | 1/1 | 1/1 | 1/1 | 1/1 | | 1/1 | (1) |
| A11Y-06 | はみ出したコードブロックにキーボードで届かない（Safari） | `scrollable-region-focusable` | | | | 2/7 | 0/7 | | 1/1 | | 2/7 | (2) |
| A11Y-07 | 本文の iframe（jsfiddle 60 個）に `title` がない | `frame-title` | | | | | 1/1 | | 1/1 | | | (1) |
| A11Y-08 | 記事の上のタグが 375px で高さ 22.8px | `target-size` | | | | | | 0/4 | | | | (3) |
| A11Y-09 | 本文で `h2` の次に `h4` が来る | `heading-order` | | | | 3/3 | | | | | 3/3 | 直さない |
| A11Y-10 | clip と lab で、記事タイトル（`h1`）の次が「share」の `h3` | `heading-order` | | | | | | 1/1 | 1/1 | | | (1) |
| A11Y-11 | 2 つの nav に名前がない | `landmark-unique` | 1/1 | 1/1 | 1/1 | 1/1 | 1/1 | 1/1 | 1/1 | 1/1 | 1/1 | (1) |
| A11Y-12 | 記事ページの `h1` が 2 つ | （axe では出ない） | | | | ○ | ○ | ○ | ○ | | ○ | (1) |
| A11Y-13 | メニューのボタンが `<a href="#">` で、開閉の状態が伝わらない。開いたときのフォーカスの移動と Esc もない | （axe では出ない） | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ○ | (1)。ボタンと `aria-expanded` は A-2 で対応 |
| A11Y-14 | 目次の開閉が `<a href="#">` で、開閉の状態が伝わらない | （axe では出ない） | | | | ○ | ○ | | | | ○ | (1)。閉じた中身の `inert` は A-3、項目のリンクは A-10 で対応 |
| A11Y-15 | スキップリンクがない | （axe では出ない） | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ○ | (2) |
| A11Y-16 | フォーカスの見え方がブラウザ任せ（`:focus` のルールがない） | （axe では出ない） | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ○ | (2)。新しい `button` の 2 つ（シェア、メニュー）は A-5 で対応 |
| A11Y-17 | `prefers-reduced-motion` に対応していない | （axe では出ない） | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ○ | (2) |
| A11Y-18 | 無限スクロールで読み込んだことが伝わらない | （axe では出ない） | | ○ | ○ | | | | | | | (1) |
| A11Y-19 | 外部リンクが新しいタブで開くことが伝わらない | （axe では出ない） | ○ | | | ○ | ○ | ○ | ○ | ○ | ○ | (1) |
| A11Y-20 | 前後記事ナビの文字 #eee が、地 #6f7378 の上で 4.11（計算。axe は「要確認」） | （手作業） | | | | ○ | ○ | ○ | ○ | | ○ | A-9 で対応 |
| A11Y-21 | 一覧のタグの最初の文字（白抜き）のコントラスト | （手作業） | ○ | ○ | ○ | | | | | ○ | | 未確認 |

- A11Y-03 の「1+1」は `image-alt` 1 件と `link-name` 1 件。375px では画像が隠れる（02 の 4.8）ので 0。
- A11Y-05 は axe-core 4.13.0 でだけ出る。4.14.0 では出なかった。
- ○ は該当するページ。件数で数えられないので、基準のファイルでは数値の指標として持つ（2.6）。

#### 直し方の案と時期

| ID | 直し方の案 | 触るところ | 時期 |
| --- | --- | --- | --- |
| A11Y-01 | `alt=""` にする。02 の 9.2 で決定済みの DOM なので、リニューアルで自然に消える | `Article.astro` | リニューアル（決定済みの設計のとおり） |
| A11Y-02 | tip と lab は、隣のタイトルのリンクと行き先が同じなので `tabindex="-1"` と `aria-hidden="true"`。clip はタイトルのリンクが `clipUrl`（外のサイト）で、サムネイルだけが記事ページへのリンクなので `aria-label="{title} の記事"` | `Article.astro` | 段階 1 |
| A11Y-03 | 書籍名の `alt` を付ける | `EntryAdFoot.astro` | 段階 1 |
| A11Y-04 | コメントを #9e9e9e（4.72）、数値を #e57f7f（4.62）にする。02 の 7.3 のリーダー決定（コードの色は旧サイトのまま）を変えることになる | 本文の CSS | 段階 3（ユーザーの判断） |
| A11Y-05 | 区切りは飾りなので `aria-hidden="true"` にする。axe が `aria-hidden` の要素のコントラストを見ないかは未確認。見るなら (3) に移す | `EntryHead.astro` | 段階 1 |
| A11Y-06 | はみ出している `pre` にだけ、ブラウザ側で `tabindex="0"` を付ける。Tab で止まったときだけ枠が見える。記事ページの JS が少し増える | `scripts/` に 1 つ | 段階 2 |
| A11Y-07 | iframe に `title`（「jsfiddle のデモ」など）を hast プラグインで付ける。Markdown は触らない | `src/lib/markdown/` | 段階 1 |
| A11Y-08 | `.entry-head__target` の上下の `padding` を 1px ずつ増やすか、項目の間を広げる。記事の上の帯が数 px 高くなる | `EntryHead.astro` | 段階 3（ユーザーの判断） |
| A11Y-09 | 記事の書き方なので直さない。見出しのレベルを変えると、本文の CSS（要素名で当たっている）で見た目が変わる | なし | 直さない |
| A11Y-10 | 「share」「tag」「related」の見出しを `h2` にする。旧サイトの CSS に、本文の外で `h1`〜`h3` と `p` を要素名で狙うセレクタがないことは確かめた | `Title2.astro` | 段階 1 |
| A11Y-11 | 2 つの nav に `aria-label`（「サイト」「カテゴリとタグ」など） | `Header.astro`、`Menu.astro` | 段階 1 |
| A11Y-12 | 記事ページでは、サイト名を `h1` から `p` にする。トップと一覧は `h1` のまま | `Header.astro` | 段階 1 |
| A11Y-13 | ボタン化と `aria-expanded` は A-2 でリニューアルに入る。残りは、開いたらフォーカスをメニューの最初の見出しかリンクに移す、Esc で閉じてボタンに戻す、開いている間はメニューの外（`header`、`main`）に `inert` を付ける | `scripts/menu.ts` | 段階 1 |
| A11Y-14 | 開閉を `<button type="button">` にして `aria-expanded` を付ける。`button` は `display: block` でも幅が親いっぱいにならないので `width: 100%` を足す。reset の `button { color: #000; text-transform: none }` は class のルールが勝つ。`button` にすると reset の `outline: 0` で枠が消えるので、A-5 と同じ `:focus-visible` を一緒に付ける。computed style のキーが `a.entry-toc__title` → `button.entry-toc__title` に変わる | `EntryToc.astro` | 段階 1（リーダー決定） |
| A11Y-15 | 「本文へ移動」のリンクを `main` の前に置き、フォーカスが来たときだけ左上に出す | `Default.astro` | 段階 2 |
| A11Y-16 | 新しい `button` の 3 つは A-5 でリニューアルに入る。残りのリンクに、`:focus-visible` でホバーと同じ「ずらした影」と A-5 と同じ outline を出す。マウスでは何も変わらない。今はブラウザ既定の枠が出ている | 各部品の CSS | 段階 2 |
| A11Y-17 | `@media (prefers-reduced-motion: reduce)` で、メニューのスライドと回転、目次の開閉、ホバーの動き、ローダーを止めるか短くし、目次のスクロールをすぐ終わらせる | 各部品の CSS、`scripts/toc.ts` | 段階 2 |
| A11Y-18 | 見えない `aria-live="polite"` の領域に「8 件読み込みました」「すべて表示しました」を入れる。Loader は `aria-hidden` | `scripts/infinite-list.ts` | 段階 1 |
| A11Y-19 | 外部リンクに見えない文字で「（新しいタブで開きます）」を足す | 外部リンクに `target` を付けるプラグイン | 段階 1 |
| A11Y-20 | A-9（ナビ用の変種）でリニューアルに入る | | 対応済み（リニューアル） |
| A11Y-21 | 手作業で測ってから決める | | 段階 1 の前に確かめる |

#### 段階（いつ・どの順で直すか）

- リニューアル: B の直しはしない。A で一緒に片付くもの（A11Y-01、A11Y-13 の一部、A11Y-14 の一部、A11Y-16 の一部、A11Y-20）だけが消える。
- 段階 1（公開して落ち着いた後、最初に）: (1) の直し。見た目が変わらないので、ユーザーの判断は要らない。読み上げへの効き目が大きい順に、A11Y-02 → A11Y-14 → A11Y-13 の残り → A11Y-07 → A11Y-03 → A11Y-12 / 10 / 11 → A11Y-18 / 19 / 05。1 つの ID を 1 つのコミットにする。
- 段階 2: (2) の直し。マウスで見ている限り見た目は変わらないが、キーボードで操作したときの見え方を決める必要があるので、A11Y-16 の見え方だけユーザーに見てもらってから入れる。順は A11Y-16 → A11Y-15 → A11Y-17 → A11Y-06。
- 段階 3: (3) の直し。ユーザーが直すと決めたものだけ。

公開後の直しでは、旧サイトはもう見られないので、見た目の確かめは 1.7 の公開後の基準（`.snapshot/baseline-astro/`）と比べる。タグを変える直し（A11Y-14 / 12 / 10）は computed style のキーが変わるので、その直しのコミットで基準を撮り直す。ピクセルの差が 0 であることを先に確かめてから撮り直す。

### 2.6 C. 件数の見張り

#### 基準のファイル

`test/a11y/baseline.json` に、2.3 の旧サイトの件数をそのまま書く。旧サイトは公開と同時に消えて測り直せないので、この文書の 2.3 と 2.5 の表を正とし、実装のときに書き写す。

```json
{
  "axeCore": "4.13.0",
  "measuredAt": "2026-10-23",
  "source": "https://webmanab.netlify.app",
  "pages": {
    "home@1080": { "image-alt": 16, "link-name": 24, "landmark-unique": 1 },
    "tip-b@1080": { "image-alt": 1, "link-name": 1, "color-contrast": 100, "frame-title": 1, "landmark-unique": 1 }
  },
  "metrics": {
    "h1": { "home": 1, "tip-a": 2 },
    "focusableInClosedMenu": { "home": 0 }
  },
  "changes": []
}
```

- `pages` は 2.3 の 9 ページ × 2 幅 × ルールの件数。ページは同じパスを使うので、本文が同じなら同じ条件で比べられる。
- `metrics` は axe で出ない数値（`h1` の数、閉じたメニューの中で Tab で止まる要素の数、`href="#"` のリンクの数、`:focus` のルールの数など）。
- `changes` は基準を変えた記録（下）。

#### CI での動き

1. E2E に `e2e/a11y/report.spec.ts` を置き、`astro preview` の同じ 9 ページ × 2 幅に axe（`@axe-core/playwright` 4.13.0、同じタグ）をかけて `a11y-report.json` に書く。この spec は失敗させない（結果を書くだけ）。
2. `scripts/a11y-compare.ts` が基準と比べ、ページとルールごとに次を出す。終了コードは常に 0。
   - 増えた: GitHub Actions の `::warning` で「`clip@375 target-size 4 → 6`」のように出す。PR の画面に警告として出る。
   - 基準にないルールが出た: 同じく `::warning`。
   - 減った: `::notice` で「基準を下げられる」と出す。
3. 比べた結果の表（ページ × ルール、基準と今の数）を `$GITHUB_STEP_SUMMARY` に書く。
4. ローカルでは `pnpm test:a11y`（spec と比較を続けて回す）で同じものが見られる。

#### 警告が出たとき

- 新しく入った部品や中身のせいで増えた: A（2.4）に当たるなら、その PR で防ぐ。直す作業が大きく、悪くなるのを受け入れると決めたら、2.5 の一覧に新しい ID を足し、`changes` に「いつ、どのページのどのルールを、いくつからいくつに、なぜ」を書いてから基準を上げる。理由のない基準の引き上げはしない。
- 直して減った: 同じコミットで基準を下げる（下がった値を新しい基準にする）。下げておかないと、あとで同じ違反が戻っても警告が出ない。
- axe の版を上げたとき: 07 と同時に上げる。上げる前の版で新サイトを測り、上げた後の版で同じページを測って、差を `changes` に記録してから基準を置き直す。旧サイトはもうないので、版を上げた後の基準は新サイトの値になる。

#### リニューアルの時点で見込まれる差

新サイトでは、旧サイトで空だったメニューのターム一覧（約 290 リンク）と関連記事に中身が入る。これらに違反が出ると件数が増える（たとえば 375px でのメニューのリンクの `target-size`）。最初に新サイトで測ったときに増えたものは、上の手順で 1 件ずつ調べ、新しい ID を付けるか 2.4 で防ぐ。A11Y-01（`alt=""`）は減る見込み。

### 2.7 07（部品のカタログ）の axe との関係（合意済み）

- ページ単位（08）と部品単位（07）のどちらも、axe の結果は報告だけでマージを止めない。07 の CI が止まるのは、カタログのビルドが落ちたときと、部品の操作のテスト（DOM の状態の切り替え。2.4 の A-1〜A-3、A-5 を含む）が落ちたときだけ。
- 版は `@playwright/test` 1.64.1、`@axe-core/playwright` 4.13.0（axe-core 4.13.0）にそろえる。上げるときは 07 と 08 で同時に上げる。
- タグ: 08 は `wcag2a`、`wcag2aa`、`wcag21a`、`wcag21aa`、`wcag22aa`、`best-practice` で、ルールは外さない。07 は `best-practice` を除いた 5 つで、部品単体では判定できない `document-title` と `html-has-lang` を外す（`heading-order` や `region` は `best-practice` なので 07 では走らない）。ページの構造の違反は 08 だけが拾う。
- 違反の追跡一覧は 08 の 2.5（実装後は `docs/a11y.md`）の 1 つだけ。07 は報告（`a11y-report.md`）に「08 の ID」の列を付けて参照する。部品とルールから ID への対応は `e2e/catalog/a11y-ids.json`（`"article/link-name": "A11Y-02"` の形）に持つ。表にない違反は「未登録」と出るので、そのときは 08 の一覧に ID を足し、`a11y-ids.json` にも足す。
- 件数の見張り: 08 は「ページのキー @ 幅 × ルール → 要素の数」を `test/a11y/baseline.json`（旧サイトの件数）と比べる。07 も同じ形（`{ axeCore, pages: { "story@幅": { ルール: 要素の数 } } }`。impact やセレクタは別のキー）で `a11y-report.json` を出し、カタログを最初に CI で回した結果を `test/a11y/baseline-catalog.json` としてコミットして、同じ `scripts/a11y-compare.ts` で比べる。増えたら警告、減ったら基準を下げる、基準を上げるのは一覧に ID と理由を書いたときだけ、という扱いは 2.6 と同じ。一覧の件数は 08 の数だけで数え、07 の数は足さない。
- スクリーンショット: 旧サイトとの比較は 08 だけ。07 は部品の回帰をローカルの macOS だけで撮り、CI では回さず、マージも止めない。

---

## 3. 性能

### 3.1 旧サイトの数字（参考）

Lighthouse 13.5.0、Chromium 1248、2026-10-23 に `https://webmanab.netlify.app` へ 1 回ずつ。広告と GA を止めずに測った（利用者が見ている状態）。tip は「読み込みが遅く時間内に終わらなかった」という警告付きで、値は参考にとどめる。

| ページ | 端末 | 性能 | FCP | LCP | TBT | CLS | 転送量 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| トップ | mobile | 69 | 4.1 s | 5.8 s | 80 ms | 0.002 | 884 KiB |
| トップ | desktop | 97 | 0.8 s | 1.2 s | 0 ms | 0 | 884 KiB |
| tip `method-control` | mobile | 60 | 5.1 s | 9.0 s | 170 ms | 0 | 830 KiB |
| tip `method-control` | desktop | 93 | 1.2 s | 1.2 s | 0 ms | 0.076 | 806 KiB |
| clip `2016-jsconf-is` | mobile | 78 | 3.5 s | 4.0 s | 130 ms | 0.044 | 866 KiB |
| clip `2016-jsconf-is` | desktop | 98 | 0.7 s | 1.0 s | 0 ms | 0.023 | 867 KiB |

転送量の内訳（トップ、mobile）: `www.googletagmanager.com` の JS 296KB、AdSense の JS 246KB、自前の JS（Nuxt）149KB、フォント 87KB、HTML 40KB。tip でも自前の JS は 158KB。描画を止めているのは Google Fonts の CSS だけ。

新サイトでも AdSense（本番だけ）と、ID を入れれば GA4 は残るので、全体の転送量は旧サイトとの比較にあまり意味がない。比べるのは自前の分にする。

### 3.2 上限（`pnpm test:dist` で CI で止める）

| 対象 | 上限（案） | 根拠 |
| --- | --- | --- |
| 1 ページで読む自前の JS | gzip 後 10KB 以下 | 動く部分は素の script 6 本（03 の 7 章）で、旧サイトの Nuxt は 149〜158KB |
| 1 ページで読む CSS（インラインを含む） | gzip 後 30KB 以下 | 旧サイトの CSS はインラインで HTML に入っていて、HTML 全体が 40KB（転送時） |
| HTML 1 ページ | gzip 後 50KB 以下 | メニューに約 290 リンクが入る（03 の 5.3 で 1 ページ 30KB 前後の増加の見込み） |
| アイキャッチ SVG 1 枚 | 8KB 以下 | 05 |
| OGP PNG 1 枚 | 150KB 以下 | 05 |
| 無限スクロールの JSON 1 ファイル | 8KB 以下 | 03 の 4.2 の見込み（3KB 前後）に余裕を見た |

数字は最初のビルドで実測して見直す。実測が上限をかなり下回っていたら、上限を実測の 1.5 倍程度に下げて、増えたときに気づけるようにする。

### 3.3 CLS を出さないために

- 一覧のサムネイルは 16:9 の箱（`padding-top: 56.25%`）の中に絶対配置なので、画像が遅れても動かない。`<img>` にも `width` と `height` を書く（02 の 9.2）。
- tip の記事ページの大きなアイキャッチと clip の「visit to」の中の画像は、箱の高さが画像で決まるので、`width` と `height` が必須。値は SVG の比率と同じ 16:9 にする。02 の 9.2 は `width="1600" height="900"`、05 の 4 章は 640×360 の SVG と書いていて食い違っているが、比率は同じなので CLS には影響しない。どちらにそろえるかはアイキャッチ担当とリーダーが決める。
- 前後記事ナビの背景は CSS の `background-image` で、箱の高さは CSS で決まっているので動かない。
- 本文の iframe は `height` の属性を持っている（450 など）ので動かない。
- 広告（`.entry-ad`）は AdSense が中身を入れたときに高さが変わる。旧サイトも同じで、見た目を変えないために枠の高さは固定しない。広告による CLS は公開後に Search Console の数字で見る。
- フォントは 02 の 2.2 のとおり同じ URL を使う。`fonts.gstatic.com` への `preconnect` だけ足す（見た目は変わらない）。`display=swap` は、文字が一度別のフォントで出てから切り替わり見た目が変わるので、入れない（02 の決定どおり）。

### 3.4 Lighthouse と Web Vitals の確かめ方

- ローカル: `astro preview` に対して Lighthouse を mobile と desktop で 3 回ずつ回し、中央値を取る。ページはトップ、`/clip/`、tip `method-control`、clip `2016-jsconf-is`。README 5 章の 12 の後と PR の前に回し、結果を PR に貼る。
- 目安（mobile、広告なし）: LCP 2.5 秒以下、CLS 0.1 以下、TBT 200ms 以下、性能の点 90 以上。目安なので CI では止めない。
- 公開後: PageSpeed Insights で本番の同じページを測る（広告あり）。フィールドデータ（CrUX）は訪問者が少ないと出ないので、Search Console の「ウェブに関する主な指標」に出るのを待つ（出るかは未確認）。

---

## 4. SEO（06 をテストと公開後の確認に落とす）

| 06 の項目 | どこで確かめるか |
| --- | --- |
| 自分自身を指す canonical | 1.5（全ページ） |
| sitemap と `lastmod` | 1.5 |
| 構造化データ（元の公開日、更新日、著者） | 1.5（全記事）。加えて、公開前に Google のリッチリザルトテストで tip、clip、lab を 1 本ずつ見る（手作業） |
| 本文とテンプレートに旧ドメインへのリンクを残さない | 1.3（Markdown）と 1.5（`dist/` 全体） |
| `SITE_URL` を新しいドメインにする | 7.1 のチェックリスト（新しいドメインでビルドした Deploy Preview の `dist` で、canonical、OGP、sitemap、RSS、robots が新しいドメインを指す） |
| netlify.app から新しいドメインへの 301 | 7.2（公開後に `curl -I https://webmanab.netlify.app/tip/` が 301 で新しいドメインを指す） |
| Netlify の custom_domain を外す（canonical のヘッダー） | 7.1（`curl -I` で `link: <https://webmanab-html.com/>` が出ない） |
| Deploy Preview が検索に出ない | 7.1（Deploy Preview の応答に `x-robots-tag: noindex` がある） |
| 本番に `noindex` がない | 1.5（HTML に `noindex` の meta がない）と 7.2（本番の応答ヘッダー） |
| Search Console、Bing、sitemap の送信、インデックス登録のリクエスト、「Google が選択した正規 URL」、古いコンテンツの削除、Safe Browsing、被リンクの書き換え、AdSense の再審査 | 7.2（README 5 章の 16 と同じ） |

---

## 5. セキュリティ

### 5.1 応答ヘッダー

01 の 2 章は「セキュリティ系のヘッダー（CSP など）は入れない」と決めている。AdSense が読む先が多いことが理由で、これは CSP の `script-src` には当てはまるが、それ以外のヘッダーは AdSense に関係しない。そこで、AdSense に影響しないものだけを入れることにした（リーダー決定。README 2 章。01 の決定を変えた）。

置き場所は 01 の案と同じ `netlify.toml` の `[[headers]]` にする。README 5 章の表には `public/_headers` もあるが、2 か所に分けると片方を見落とすので 1 か所にする（インフラ担当に提案）。

```toml
[[headers]]
  for = "/*"
  [headers.values]
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "camera=(), microphone=(), geolocation=(), payment=(), usb=()"
    Content-Security-Policy = "frame-ancestors 'self'; object-src 'none'; base-uri 'self'"
```

- `frame-ancestors` は `<meta>` の CSP では効かないので、ヘッダーで出す必要がある。ほかのサイトに iframe で埋め込まれるのを防ぐ。`X-Frame-Options` は `frame-ancestors` があれば要らない。
- `object-src 'none'` と `base-uri` は AdSense の推奨する CSP にも入っている（[AdSense ヘルプ](https://support.google.com/adsense/answer/16283098)）。AdSense の推奨は `base-uri 'none'`。`'self'` にするのは、Astro の出力が `<base>` を使わないことを実装時に確かめるまでの余裕のため。AdSense への影響は広告が出る本番でしか確かめられない（未確認）。
- `Permissions-Policy` は、サイトで使わない機能を止める。`clipboard-write` と Web Share はシェアボタンで使うので止めない。AdSense がこれらの機能を使うかは未確認なので、Deploy Preview では広告が出ないぶん確かめきれない。公開後に広告が出ることを確かめる（7.2）。
- HSTS: 今の `webmanab.netlify.app` の応答には Netlify が `strict-transport-security: max-age=31536000; includeSubDomains; preload` を付けている（`curl -I` で確認）。新しいドメインでも Netlify が付けるかは未確認。公開後に `curl -I` で見て、付いていなければ toml に足す。
- 確かめ方: Deploy Preview で `curl -I` を全項目、本番で同じ。E2E で、本文の iframe（jsfiddle）が表示されること、コンソールに CSP の違反が出ないことを見る。

### 5.2 CSP の `script-src` をどこまで厳しくできるか

- AdSense は、使うドメインが変わるので許可リスト型の CSP を支持していない。支持しているのは nonce と `'strict-dynamic'` を使う厳しい CSP だけ（同じ AdSense ヘルプ）。
- 静的サイトではリクエストごとに nonce を作れない。代わりにハッシュと `'strict-dynamic'` を使う手はあるが、AdSense の `<script src>`（外部ファイル）はハッシュで許可できないので、AdSense の読み込みをインラインの小さな script から差し込む形に変える必要がある。
- Astro 7 の `security.csp` はハッシュの `<meta>` を出すが、dev では動かず、外部スクリプトには対応していない（[Astro の設定のリファレンス](https://docs.astro.build/en/reference/configuration-reference/)）。`frame-ancestors` も `<meta>` では効かない。
- 決定: リニューアルでは 5.1 だけを入れ、`script-src` は入れない（リーダー決定。README 2 章）。公開後に余裕があれば、`Content-Security-Policy-Report-Only` で `script-src 'sha256-…' 'strict-dynamic' https: 'unsafe-inline'; object-src 'none'; base-uri 'self'` を試し、ブラウザのコンソールに出る違反を見る（報告の受け口はないので、ローカルの Playwright でコンソールを集める）。本番で効かせるかは広告の表示への影響を見てからユーザーが決める。

### 5.3 本文の生 HTML

- 本文に残る生 HTML は、dl 67、iframe を包んだ p 60、デモの p 2、style 2、figure 1（04 の 3 章）。書き手はサイトの持ち主だけで、外から入る文字はない。
- それでも、あとから記事を足したときに危ないものが紛れないよう、1.3 の 4 で「コードの外に `<script>`、`on*=`、`javascript:` がない」「iframe は jsfiddle だけ」「`<style>` は 2 本だけ」をテストで止める。
- `tip/html5-global` と `tip/transition` の `<style>` は、その記事のページ全体に効く CSS になる。旧サイトでも同じだった。サイトの部品の class に当たっていないことを、その 2 本の computed style（1.7）で確かめる。
- iframe の `src` は `//jsfiddle.net/…` のようにスキームなしで、https で読まれる。混在コンテンツにはならない。

### 5.4 依存の脆弱性

- CI で `pnpm audit --audit-level high` を回し、high 以上があれば止める。
- `highlight.js@10.1.1` には moderate の勧告が 2 つある（GHSA-7wwv-vh3v-89cq の ReDoS、GHSA-vfrc-7r7c-w9mx のプロトタイプ汚染。scratchpad で `pnpm audit` して確認）。ビルド時に自分の記事だけを処理し、ブラウザに届かないので受け入れる（03 の 2.4、リーダー決定）。moderate なので `--audit-level high` では止まらない。受け入れた勧告は、この文書と PR に残す。
- Dependabot: 01 の 6 章の設定（月 1 回、14 日の cooldown）に加えて、今 `paused` になっている security updates を再開する（ユーザーの操作。リポジトリの設定）。`highlight.js` は 10.1.1 に固定するので、Dependabot の `ignore` に `highlight.js` を入れて更新の PR が来ないようにする。
- 週 1 回の定期実行で `pnpm audit` を回し、結果を Moshi で通知する（1.3 の外部リンクと同じワークフローにまとめてよい）。

---

## 6. 部品単位のテスト（07）との分担

07 の担当（名前は storybook）は、試作の結果、Storybook をやめて「`CATALOG=1` のときだけ `/catalog/` を足す Astro のルート」と Playwright Test で部品を確かめる形にした（storybook-astro 1.12.0 で scoped の SCSS が読まれず、`storybook build` も失敗したため。07 の試作で確認）。道具が 08 と同じ Playwright になったので、次のように分けた。

合意したこと:

| | 08（QA） | 07（部品のカタログ） |
| --- | --- | --- |
| 単体、コンテンツ、ビルド出力 | 持つ | 持たない |
| 部品の状態の網羅（Header の固定前後、メニューと目次の開閉、Loader と End、シェアの 3 状態、前後記事が片方だけ、カードの type 別、アイキャッチのカテゴリ別、本文の要素見本など） | 持たない | 持つ |
| 状態の切り替えの操作 | ページの上での動き（スクロール量、実際の JSON を End まで読む、bfcache、閉じたメニューと目次に Tab が止まらない） | 部品の DOM の切り替え（クリックで class や属性が変わる） |
| axe | ページ単位。ルールは外さない | 部品単位。`best-practice` を除く 5 つのタグで、`document-title` と `html-has-lang` を外す（2.7） |
| axe の結果の扱い | 報告だけ。マージは止めない（2.1） | 同じ |
| 見た目 | 旧サイトとの比較（基準 64 枚、computed style、コードブロックの高さ） | 部品 × 4 幅のスクリーンショットを、前回の自分と比べる回帰 |
| 版 | `@playwright/test` 1.64.1、`@axe-core/playwright` 4.13.0 | 同じ |
| Playwright の設定 | `playwright.config.ts`（`smoke`、`a11y`、`visual`） | `playwright.catalog.config.ts`、script は `test:catalog` |

あわせて合意したこと（07 からの返事とリーダーの判断で確定）:

- 07 は CI で回す。マージを止めるのは、カタログのビルドが落ちたときと、部品の操作のテスト（目次の `is-open`、シェアの `is-copied`、Loader と End の出し分けなど DOM の状態と、2.4 の A の項目: 閉じたメニューと目次に Tab が止まらないこと、開くと中のリンクに届くこと、メニューの `aria-expanded`、シェアとメニューのフォーカスの枠）が落ちたときだけ。README 3 章の 14 のとおり、A の項目のテストはすべてマージを止め、止めないのは axe の報告だけ。axe の違反ではテストを落とさない。
- 07 のスクリーンショットの回帰はローカルの macOS だけで撮り、CI では回さない（`--ignore-snapshots`）。マージも止めない。
- シェア、メニュー、目次は、細かい分岐を 07、実ページで 1 回動くことと、スクロール量・ヘッダー固定との重なり・bfcache・閉じたときに Tab が止まらないことを 08 で持つ。
- a11y の違反の追跡一覧は 2.5 の 1 つだけで、07 は ID で参照する。件数の見張りは 07 も同じ形で行う（2.7）。07 で見つかった一覧のカードの画像リンクの `link-name` は、旧サイトにもある違反（A11Y-02）なので、リニューアルでは直さず報告に残すだけにする。
- `CATALOG` なしの本番ビルドに `/catalog/` が出ていないことは 08 のビルド出力のテストで確かめる（1.5）。
- 07 のテストの置き場所は `e2e/catalog/`（08 は Playwright を `e2e/`、Vitest を `test/` に置くのに合わせた）。07 の Container API の部品テストは `test/components/` に置く。

---

## 7. 公開前のチェックリストと公開後の見張り

### 7.1 公開前（PR を作ってからマージまで）

README 5 章の 13〜14 と 01 の 10 章を 1 つにまとめた。

ローカル:

- [ ] `pnpm verify` が通る（lint、format、check、test、build、test:dist、test:e2e）
- [ ] `pnpm verify:md` で説明のつかない差が 0（04）
- [ ] 見た目の回帰（1.7）: 64 枚、computed style、コードブロック 762 個の高さ。差がすべて「変わってよい場所の一覧」に入っている
- [ ] a11y: `pnpm test:a11y` の比較の表を PR に貼り、基準より増えたものはすべて 2.6 の手順で扱った。手作業の確認（2.2）で旧サイトより悪くなったところがない
- [ ] Lighthouse（3.4）の結果を PR に貼った
- [ ] 旧 SW の撤去をローカルの手作業で確かめた（01 の 3 章）
- [ ] 旧サイトの基準を撮り直す必要がないか確かめた（`.snapshot/baseline/` がある）

Deploy Preview（01 の 10 章に足したもの）:

- [ ] ビルドログ: Node 26.x、pnpm 10.34.6、`@resvg/resvg-js` が動いて OGP が 23 枚出た
- [ ] 各ページの種類が 200、日本語 slug の 2 件（小文字・大文字のエンコード）と `/clip/_prefix/` が 200
- [ ] `/tip` → 301 `/tip/`、存在しないパスが 404
- [ ] 応答ヘッダー: `/sw.js` の `no-cache`、`/_astro/*` の `immutable`、5.1 のヘッダー、`x-robots-tag: noindex`
- [ ] sitemap、RSS、robots.txt、ads.txt の中身と絶対 URL
- [ ] 広告と GA のタグが HTML にない
- [ ] iPhone の Safari と Android の Chrome で、メニュー、目次、シェア（`navigator.share` が開く）、無限スクロールを触った
- [ ] 本文の iframe（jsfiddle）が表示される

ドメインを切り替えたあと（README 5 章の 14）:

- [ ] `SITE_URL` を新しいドメインにしたビルドで、canonical、OGP、sitemap、RSS、robots が新しいドメインを指す（`pnpm test:dist` を新しい `SITE_URL` でも通す）
- [ ] `curl -I https://webmanab.netlify.app/` に `link: <https://webmanab-html.com/>` が出ない（custom_domain を外した後）
- [ ] 新しいドメインの HTTPS の証明書が出ている

### 7.2 公開の直後

- [ ] 本番で 7.1 の Deploy Preview の項目を見る。加えて広告のスクリプトが出ていて、広告の枠に広告が入る
- [ ] `curl -I` で 5.1 のヘッダーと HSTS
- [ ] netlify.app から新しいドメインへの 301
- [ ] 旧 SW を入れておいたプロファイルで解除される（01 の 3 章）
- [ ] PageSpeed Insights（3.4）
- [ ] README 5 章の 16 の検索対策（Search Console、Bing、sitemap の送信、主な記事のインデックス登録のリクエスト、「Google が選択した正規 URL」、古いコンテンツの削除、Safe Browsing、被リンク、AdSense の再審査）

### 7.3 公開後の見張り

| 何を | 道具 | 頻度 | 誰が |
| --- | --- | --- | --- |
| デプロイの失敗 | Netlify の Deploy notifications（失敗したらメール）。設定はユーザーが UI で行う | 常時 | ユーザー |
| 本番の死活と主な URL | GitHub Actions の定期実行で、sitemap から 20 件を選んで 200 か、canonical のドメイン、robots.txt、ads.txt、`/sw.js` を確かめる。失敗したら Moshi に通知 | 週 1 回 | 自動 |
| 外部リンクの死活 | 1.3 | 月 1 回 | 自動（結果はユーザーが見る） |
| 依存の脆弱性 | `pnpm audit`、Dependabot | 週 1 回と随時 | 自動 |
| 404 | Search Console の「ページのインデックス登録」の「見つかりませんでした（404）」。404 のページは Netlify 既定で GA4 が入らないので、GA では数えられない。Netlify のログで 404 を見る機能は有料のプランにある（未確認） | 月 1 回 | ユーザー |
| 正規 URL と重複 | Search Console の「重複しています。Google により〜異なるページが正規ページとして選択されました」の件数、`site:webmanab-html.com` の件数（06 の 2.5） | 公開後 3 か月は月 1 回 | ユーザー |
| Web Vitals | Search Console の「ウェブに関する主な指標」 | 月 1 回 | ユーザー |

定期実行のワークフローは、ユーザーの決まりどおり、終わったら Moshi の webhook で通知する（成功は短く、失敗は何が落ちたかを 1 行で）。`MOSHI_TOKEN` を secret に入れる必要がある。

---

## 8. CI で止めるもの・止めないもの

| 種類 | 置き場所 | マージを止めるか |
| --- | --- | --- |
| lint、format、`astro check` | PR の CI（01 の 6 章） | 止める |
| `pnpm test`（単体、コンテンツ） | PR の CI | 止める |
| `pnpm build`、`pnpm test:dist`（ビルド出力、指紋、容量、HTML の妥当性） | PR の CI | 止める |
| `pnpm test:e2e`（E2E。閉じたメニューに Tab が止まらないことなど 2.4 を含む） | PR の CI | 止める |
| `pnpm test:a11y`（axe と数値の指標を基準と比べる） | PR の CI | 止めない（増えたら警告。2.6） |
| `pnpm audit --audit-level high` | PR の CI | 止める |
| 部品のカタログのテスト（07） | 07 による。axe は報告だけ | axe は止めない。操作は 07 が決める |
| 外部リンクの死活 | 月 1 回の定期実行 | 止めない |
| 本番の死活、`pnpm audit` | 週 1 回の定期実行 | 止めない（通知だけ） |
| 往復検証（`verify:md`） | ローカル | 対象外 |
| 見た目の回帰 | ローカルの macOS | 対象外 |
| Lighthouse、手作業の a11y | ローカル、PR に結果を貼る | 対象外（レビューで見る） |

01 の 6 章の `ci.yml` の `pnpm build` の後に `pnpm test:dist` を、`pnpm test:e2e` の後に `pnpm test:a11y`（`continue-on-error: true`）を、最後に `pnpm audit --audit-level high` を足す。Playwright のブラウザは `chromium` だけ入れる（01 のとおり）。

---

## 9. 実装の順番（README 5 章のどこに入れるか）

| README 5 章 | QA で入れるもの |
| --- | --- |
| 1. 土台 | Vitest の `projects`（unit / dist）、Playwright の `smoke` / `a11y` / `visual` の設定、`test:dist`・`test:a11y`・`check:links` の scripts、`ci.yml` に `test:dist`・`test:a11y`・`pnpm audit`、`test/fixtures/legacy-urls.txt`、`test/a11y/baseline.json`（2.3 の表を書き写す）と `scripts/a11y-compare.ts` |
| 3. レイアウトと共通部品 | 2.4 の A-1、A-2、A-5（メニュー）。E2E のメニューとヘッダー固定。`test:a11y` をトップで回し始める |
| 4. コンテンツの受け口 | 1.2 の単体、1.3 のスキーマと件数（テスト用の数件で先に書き、6 で全件にする） |
| 5. Markdown の描画 | 描画プラグインの単体、iframe の `title` のプラグイン |
| 6. エクスポーターの出力 | 1.3 の全件（サイト内リンク、旧ドメイン、生 HTML の範囲）。`verify:md` が通ったのを確かめてから、1.4 の指紋と代表 12 本のスナップショットを作る |
| 7. 記事ページ | 2.4 の A-3〜A-8、A-10（閉じた目次の `inert`、clip の「visit to」、シェア、関連記事、アイキャッチ）。E2E の目次とシェア |
| 8. 一覧ページと無限スクロール | E2E の無限スクロールと画像のフェード |
| 9. head まわり | 1.5 の head、構造化データ、sitemap、RSS、robots、旧ドメイン |
| 10. アイキャッチと OGP | アイキャッチの指紋、SVG と PNG の容量、`dist/` の参照の確かめ |
| 11. GA4、AdSense、旧 SW | 広告と GA が出ないことのテスト、旧 SW の撤去の E2E、5.1 のヘッダー（インフラ担当） |
| 12. 見た目の比較 | 1.7、2.2 の手作業（新旧で比べる）、3.4 の Lighthouse、`test:a11y` の比較で増えたものを 2.6 の手順で片付ける |
| 13. PR と Deploy Preview | 7.1 |
| 15〜16. マージと公開後 | 7.2、7.3 の定期実行のワークフロー（公開後に入れてもよい）。2.5 の一覧を `docs/a11y.md` に移し、段階 1 から直し始める |

---

## 10. 他の担当への受け渡し

この文書が他の担当の成果物に求めていることを、担当ごとにまとめる。

- リーダー（アーキテクチャ）
  - sitemap に `lastmod`（記事は `modified` か `date`）を入れる（06。03 の 6.5 には書かれていない）。
  - RSS の `content:encoded` の中のサイト内リンクを絶対 URL にする（03 の 6.4 の未解決点）。
  - 2.4 の A（リニューアルで必ずやる。A-1〜A-12 はリーダー決定で採用）: A-1、A-2（メニューの `inert`、`button`、`aria-expanded`）、A-3（閉じた目次の `.entry-toc__list` の `inert`）、A-4（clip の「visit to」のリンクの名前）、A-5（シェアとメニューの `button` の `:focus-visible`）、A-6〜A-8、A-10〜A-12。目次の見出しの `button` 化は B（A11Y-14、公開後の段階 1）。
  - 2.5 の B（旧サイトからの違反）はリニューアルで直さない。公開後の作業として 2.5 に案と順番を書いた。
  - 1.1 のテストのディレクトリ構成と Vitest の `projects`（03 の 1.1 の `test/*.test.ts` からの変更）。
- インフラ
  - `test:dist` と `check:links` の scripts、`ci.yml` に `pnpm test:dist` と `pnpm audit --audit-level high`。
  - 定期実行のワークフロー 2 本（週 1 回: 本番の死活と `pnpm audit`、月 1 回: 外部リンク）と Moshi の通知。
  - Dependabot の `ignore` に `highlight.js`。
  - `netlify.toml` の `[[headers]]` に 5.1 のヘッダー（01 の「入れない」からの変更）。
  - 旧 SW の代わりのファイルは、01 の `tests/fixtures/legacy-sw.js` ではなく `test/fixtures/legacy-sw.js` にそろえる（03 の `test/fixtures/legacy-urls.txt` に合わせる）。
- アートディレクション
  - 「変わってよい場所の一覧」をページ・幅・セレクタで書く（1.7）。
  - 公開直前に新サイトを撮って `.snapshot/baseline-astro/` に置く。
  - `button` 2 つ（シェア、メニュー）の `:focus-visible` の見た目（2.4 の A-5。シェアボタンは 02 の 9.1 で決定済みなので、同じ値をメニューにも使う）。
- アイキャッチ生成
  - 前後記事ナビの背景にナビ用の変種を用意する（リーダー決定。2.4 の A-9）。
  - 記事ページの `<img>` の `width` / `height` の値（1600×900 か 640×360 か）をリーダーと決める。
- Markdown エクスポーター
  - 追加の依頼はない。1.4 の指紋は、`pnpm verify:md` が通ったあとに QA が作る。

## 11. ユーザーに確認したいこと

1. a11y の (3)（2.5 の A11Y-04、A11Y-08）: コードのコメントの色（#888 → #9e9e9e）と数値の色（#d36363 → #e57f7f）、記事の上のタグの押せる大きさ。案は「公開後の段階 3 で判断する。それまでは基準に入れたまま」。コードの色はリーダー決定（旧サイトの色のまま）と食い違うため、直すならその決定を変えることになります。
2. a11y の (2)（2.5 の段階 2）: リンクの `:focus-visible` の枠と影、スキップリンク、`pre` のフォーカス、`prefers-reduced-motion`。マウスで見ている限り見た目は変わりません。案は「公開後に、A11Y-16 の見え方を見てもらってから入れる」。
3. ユーザーの操作が要るもの: 定期実行の通知に使う `MOSHI_TOKEN` をリポジトリの secret に入れること、Netlify のデプロイ失敗の通知（メール）を UI で設定すること、Dependabot の security updates を再開すること。

リーダーが決めたこと（確認事項から外した）:

- セキュリティヘッダーは AdSense に関係しないものだけ入れ、CSP の `script-src` は今回は入れない（5.1、5.2。README 2 章）。
- 外部リンクの死活は、月 1 回の定期実行で一覧を出すだけにし、自動では何もしない（1.3。README 3 章の 17）。
- 07 のテストの置き場所は `e2e/catalog/`（6 章）。
- a11y の A（2.4 の A-1〜A-12）はすべてリニューアルで行う。目次は閉じた中身の `inert`（A-3）だけで、見出しの `button` 化は B の A11Y-14（公開後の段階 1）。前後記事ナビはナビ用の変種を使う。

---

## 計画書どうしの食い違い（README を優先した）

| 項目 | 食い違い | この文書での扱い |
| --- | --- | --- |
| 404 ページ | 01 の 2 章と 03 の 3.4 は `src/pages/404.astro` を作る案。README 3 章の 10 は Netlify 既定 | README に合わせ、`dist/404.html` がないことをテストする |
| 関連記事に自分を含めるか | 03 の 5.1 と 10 章は含める。README 3 章の 7 は除く | 除く側でテストする |
| Playwright の版 | 01 の 5 章の表は 1.64.0。README 8 章の 5 は 1.64.1 | 1.64.1 |
| ヘッダーの置き場所 | 01 は `netlify.toml` の `[[headers]]`。README 5 章の表に `public/_headers` | `netlify.toml` の 1 か所にする案（5.1） |
| アイキャッチ SVG の大きさ | 02 の 9.2 は `1600×900`、05 の 4 章は 640×360 | 比率が同じなので CLS には影響しない。`width` / `height` の値はアイキャッチ担当とリーダーが決める |
| 本文の iframe の数 | 00 と 02 は 59（単一ページのある 1028 件で数えた値）、04 は 60 | `out-v4` のコードの外で数えると 60 で、04 と合う。テストは 60 で書く |

## 未確認のこと

- 外部リンクの実際の死活（回していない）。
- Safari で、はみ出した `pre` にキーボードで届くか。
- 前後記事ナビの文字の実際のコントラスト（アイキャッチの SVG の上で測っていない。計算だけ）。
- axe が `aria-hidden` の要素のコントラストを見るか（A11Y-05）。一覧のタグの最初の文字のコントラスト（A11Y-21）。
- AdSense が `Permissions-Policy` で止めた機能を使うか。新しいドメインで Netlify が HSTS を付けるか。
- 指紋のファイルの大きさ、`html-validate` で本文から出る違反の数、各容量の実測値（どれも実装してから測る）。
- Search Console に Web Vitals のデータが出るほどの訪問があるか。
