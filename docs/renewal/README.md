# webmanab リニューアル計画（統合版）

Nuxt 2 + headless WordPress の構成を、Astro + Markdown の静的サイトに置き換える計画です。見た目は変えません。ホスティングは Netlify のままです。

この文書が計画の正本です。担当ごとの計画書と食い違うときは、この文書を優先します。

| 文書 | 中身 |
| --- | --- |
| [00-brief.md](./00-brief.md) | 全担当が共通で前提にした事実と最初の決定事項 |
| [01-infra.md](./01-infra.md) | Node / pnpm、netlify.toml、旧 Service Worker の撤去、環境変数、開発ツール、CI、リリース手順 |
| [02-art-direction.md](./02-art-direction.md) | 見た目の仕様書（トークン、DOM、CSS、動き、本文の CSS の当たり方、旧実装のバグの扱い、SCSS の書き換え点）と、旧サイトとの比較の方法 |
| [03-architecture.md](./03-architecture.md) | Astro の構成、Content Collections、Markdown の描画、ルーティング、無限スクロール、head / SEO、ブラウザ側の script |
| [04-markdown-exporter.md](./04-markdown-exporter.md) | 旧 HTML から Markdown を作るエクスポーターの設計と往復検証 |
| [05-eyecatch.md](./05-eyecatch.md) | カテゴリごとのジオメトリックな SVG アイキャッチと OGP 画像の生成 |
| [06-domain-and-search.md](./06-domain-and-search.md) | 旧ドメインを失ったことの Google 検索への影響と、新しいドメインへ移るときにやること |
| [07-storybook.md](./07-storybook.md) | 部品のカタログ（Storybook の代わり）と、部品単位の表示・操作・a11y・見た目のテスト |
| [08-quality.md](./08-quality.md) | テスト方針（層ごとの道具・タイミング・合格の条件・CI で止めるか）、a11y 方針と旧サイトの監査結果、性能、SEO、セキュリティ、公開前後のチェック |
| [09-visual-diff.md](./09-visual-diff.md) | 旧サイトとの見た目の比較の結果（手順 12）と、変わってよい場所の一覧 |
| [assets/eyecatch-samples/index.html](./assets/eyecatch-samples/index.html) | アイキャッチのサンプル |

## 1. 前提になった事実

- WordPress（`wp.webmanab-html.com`）と独自ドメイン `webmanab-html.com` はどちらもつながりません。ドメインは GoDaddy の期限切れの手続きを経て ParkLogic でパーキングされています。
- 記事は、Netlify に残っていた最後のデプロイ（2020-06-18、`9767b0f`）の生成済み HTML 1321 ページから取り出しました。ローカルの `.snapshot/` に保存してあります（コミットしません）。
- 記事は tip 165 / clip 817 / lab 48 の計 1030 本で、本文があるのは 861 本です。タームは tips 107 / clips 156 / labs 26 です。
- 画像はほとんど失われています。復元はしません。
- 旧サイトの基準スクリーンショットを 64 枚撮ってあります（`.snapshot/baseline/`）。同じ条件で 2 回撮ると、ピクセル単位で一致します。

## 2. 技術の構成

| 項目 | 採用するもの | 根拠 |
| --- | --- | --- |
| フレームワーク | Astro 7.4 系、静的出力、Vue なし | 試作でビルドとテストが通った（03） |
| Node | 26 系（`.nvmrc` に `26`） | ユーザーの指定。10/28 に LTS になる。今の `.nvmrc`（v12）は Netlify で最優先になるので、書き換えは必須（01） |
| pnpm | 10.34.6（`packageManager` で固定） | Netlify で Node 26 と pnpm 11 以上の組み合わせが落ちる報告がある。Dependabot が pnpm 10 までしか対応していない（01） |
| 依存の更新 | Dependabot には PR を作らせない（version updates と security updates を止め、alerts だけ残す）。更新は手元の Claude Code でスキル `deps-update`（`.claude/skills/deps-update/`）を使い、1 本の PR にしてマージする | 依存の更新は、上げたあとの確認と手直しが要るので、自動の PR を積み上げても結局手元でやることになる（ユーザーの判断）。きっかけは alerts のメールと、週 1 回の見張り（`monitor.yml`）の `pnpm audit` |
| TypeScript | 6.0.3 | `astro check` と typescript-eslint が TS 7 に対応していない（01） |
| 記事 | `src/content/posts/{tip,clip,lab}/*.md` | エクスポーターで生成。生成後は Markdown を正本にする（04） |
| Markdown の描画 | Astro 既定の Sätteri（`rawHtml: true`、smartPunctuation は無効） | 往復検証で本文のある 861 本中 841 本が完全に一致し、残り 20 本も意図して直した差だけ。説明のつかない差は 0（04） |
| コードの色 | highlight.js 10.1.1 をビルド時に、旧サイトと同じ自動判定で当てる | 762 ブロックすべてで class が旧サイトと一致し、表示される文字も決めた修正の 5 ブロックを除いて一致した。11 系にすると 165 ブロックで色が変わる（02 / 03 / 04） |
| スタイル | 旧 SCSS を Dart Sass 1.106 に移植。`scopedStyleStrategy: 'attribute'` | 書き換えの落とし穴は 02 の 10 章（`$line-height-unit` が黙って 0.25rem に戻る件など） |
| ブラウザ側の動き | 素の `<script>`（メニュー、ヘッダー固定、目次、画像のフェード、無限スクロール、シェア） | 03 の 7 章 |
| 無限スクロール | ビルド時に作る 8 件ずつの静的 JSON を読む | 03 の 4 章 |
| アイキャッチ | カテゴリごとのジオメトリック SVG をビルド時に生成（`/eyecatch/{type}/{id}.svg`）。OGP 用の PNG はカテゴリごとに 23 枚、`@resvg/resvg-js` で生成（Netlify で動かなければ wasm 版に差し替える） | 1030 枚を 23ms で生成でき、何度作っても同じ結果になる。mac と linux/amd64 で同じ出力になることを確認済み（05） |
| 計測と広告 | GA4 は環境変数があるときだけ。AdSense は本番だけ | ID はあとで用意する |
| 旧 PWA | 自分を解除してキャッシュを消す `sw.js` を同じパスに置く | 01 の 3 章 |
| 開発ツール | ESLint（flat config）、Prettier、Stylelint、Vitest、Playwright 1.64.1、`@axe-core/playwright` 4.13.0 | 01 の 5 章、07、08 |
| Netlify のビルド | master への push の本番だけ。PR の Deploy Preview は止めている（Netlify の設定 `skip_prs`。リポジトリの外にある設定） | Netlify の無料枠に収めるため（ユーザーの判断）。PR と Dependabot の確認は GitHub Actions の CI でやる。PR #35 の Deploy Preview（`deploy-preview-35--webmanab.netlify.app`）は止める前に作ったもので、確かめ終わっている |
| 部品のカタログ | Storybook は使わない。`CATALOG=1` のときだけ `/catalog/` を足す自前の Astro integration。見本は Storybook の CSF3 に近い形で `src/catalog/stories/` に書く | Storybook には Astro の公式対応がなく、コミュニティ製の `@storybook-astro/framework` は scoped の SCSS を描画できず `storybook build` も失敗した。自前のカタログなら本番と同じ CSS と script で動くことを試作で確かめた（07） |
| テスト | 単体・コンテンツ・描画の指紋・ビルド出力・E2E を CI で必須にする。a11y は報告だけ。見た目の回帰はローカルの macOS | 層ごとの一覧は 08 の 0 章 |
| a11y | WCAG 2.2 AA を目安にする。このリニューアルでは直し切らず、問題を一覧にして方針を決めるところまで。守るのは「今より悪くしない」だけ | ユーザーの指示。旧サイトの監査結果と直す順番は 08 の 2 章 |
| セキュリティ | AdSense に関係しない応答ヘッダーだけ入れる。CSP の `script-src` は今回は入れない | AdSense と GA4 が外部の script を多く読むため（08 の 5 章） |
| CI | GitHub Actions で lint / check / test / build / test:dist / test:e2e / audit を必須にする。test:a11y は報告だけ。旧サイトとの見た目比較はローカルの macOS で行う | 日本語フォントが OS で変わるため（02 / 01 / 08） |

## 3. 担当をまたいで決めたこと

担当どうしで食い違っていた点は、次のように決めました。

1. コードブロックは fenced code にします。info string には元の class の文字列（`bath` なども含めて）をそのまま書きます。描画のときに旧サイトと同じ `<pre><code class="…">` に戻します。言語名の正規化はしません。エクスポーターは元のコードの最後の改行を残して書き、描画側で末尾の改行を 1 つ外します（fenced code は必ず改行で終わるため）。
2. Markdown に無い構造（dl、デモ用の style / input / figure、iframe を包んだ p）は生 HTML のまま残します。前後に空行を入れ、中には空行を入れません。
3. 和文の強調で `**` が閉じない 15 か所は `<strong>` で書きます。
4. 旧ドメインへのリンクは、記事を指す 14 か所をルート相対にします。存在しないページ `/reference/shape/` を指す 3 か所は、リンクを外して文字を残します。
5. `target="_blank"` は Markdown には書きません。外部リンクを新しいタブで開く処理は描画側で付けます。
6. メニューのタームは全件を名前順に出します。投稿が 0 件で名前もわからない labs 332 / 333 はメニューから外しますが、`/labs/332/` などのページは旧 URL なので残します。
7. 関連記事は、同じ type で `primaryTag` が同じ記事を新しい順に 3 件出します。比べるときは空白を取って小文字にし、明らかな打ち間違い 7 語を直してから比べます。旧実装は自分自身も含めていましたが、新サイトでは自分自身を除きます。
8. 前後記事は日付順に並べます。旧データ 1028 件のすべてと一致しました。
9. アイキャッチの URL は記事 id で決めます（`/eyecatch/{type}/{id}.svg`）。表示する場所は 02 の 9.2 のとおりです（一覧のサムネイル、tip は本文のあと、clip は「visit to」の枠の中、前後記事ナビの背景）。lab の記事ページには出しません。前後記事ナビの背景には、上に 70% のグレーが重なっても形が見えるように、明暗の差を強めたナビ用の変種を使います（05）。
10. 404 ページは、旧サイトと同じく Netlify の既定のものにします。
11. tip 記事の末尾にある Amazon の書籍リンクは残します。
12. エクスポーターは `scripts/` に残します。ビルドには含めません。再実行するときは既存のファイルを上書きせず、`--force` のときだけ上書きします。
13. 旧 URL の一覧を `test/fixtures/legacy-urls.txt` としてコミットし、新しいビルドの URL と一致することをテストで確かめます。
14. a11y は、旧サイトの違反（A11Y-01〜21）を `docs/a11y.md` で追いかけ、公開後に 3 段階で直します（08 の 2.5）。リニューアルで直すのは、新しいサイトで初めて生まれる問題を防ぐものと、新しく作る部品を最初から正しく作ることだけです（08 の 2.4 の A-1〜A-12）。主なものは次のとおりです。
    - 閉じたメニューに約 290 個のリンクがタブ順に入る。閉じているあいだ `.menu__inner` に `inert` を付け、開閉を `aria-expanded` 付きの button にして防ぐ。試作で、Tab が止まる回数が 30 回から 0 回になり、見た目が変わらないことを確かめた。
    - 閉じた目次の中のリンクにも Tab が止まる。旧サイトは閉じた目次の中身が空だったが、新しいサイトはビルド時に項目を出すため。閉じているあいだ `.entry-toc__list` に `inert` を付けて防ぐ。目次の見出しは `<a href="#">` のまま残す（旧サイトから引き継ぐ問題なので、button にするのは公開後の A11Y-14）。
    - button になるシェアとメニューは、reset の `outline: none` でフォーカスの枠が消える。キーボードで操作したときだけ見える `:focus-visible` の枠を付ける。
    - clip の「visit to」のリンクの名前を残す（アイキャッチを `alt=""` にすると消えるため）。
    - この A の項目を確かめるテスト（閉じたメニューと目次に Tab が止まらない、メニューの button の `aria-expanded`、シェアとメニューのフォーカスの枠など）は、すべてマージを止める。マージを止めないのは axe の自動チェックの報告だけ。
15. axe の結果は、ページ単位を 08、部品単位を 07 が受け持ちます。違反の追跡一覧は 08 の 1 つだけで、07 は A11Y の ID で参照します。旧サイトの件数を `test/a11y/baseline.json` に、カタログの件数を `test/a11y/baseline-catalog.json` に記録し、同じスクリプトで比べます。CI で増えたら警告を出しますが、マージは止めません。追跡一覧の件数には、ページ単位の数だけを使います。
16. カタログのスクリーンショット（約 300 枚）はコミットします。カタログは Netlify に公開しません。
17. 外部リンク（clipUrl など約 1100 件）の死活は月 1 回の定期実行で一覧を出すだけにし、自動では何もしません。

## 4. 旧サイトから見た目が変わるところ

それ以外は、旧サイトと同じ見た目にします。

| 変わるところ | 理由 |
| --- | --- |
| 一覧・記事ページ・前後記事ナビにアイキャッチ（SVG）が出る | 旧画像は失われた。旧サイトでも記事ページのアイキャッチは変換のバグで 1px の透明画像になっていた |
| シェアボタンが 5 つから、Web Share API のボタン 1 つになる | Google+ と Pocket はサービス終了。Facebook はリンクが壊れていた |
| メニューのターム一覧と関連記事に中身が入る | 旧サイトはブラウザから WP API を呼んでいたので、今は空になっている |
| 一覧ページが正しく表示される | 旧サイトは読み込み後に「Network Error」になる |
| 一覧のタイトルの `&#8211;` が「–」になる | 旧サイトは実体参照を文字のまま出していた |
| 前後記事が片方だけのとき、next が右側に寄る | 旧サイトは左に寄っていた（CSS の不備） |
| `tip/frontnote` のコードの中の `<h1>` が文字として出る | 旧サイトはエスケープ漏れで見出しとして描画していた |
| キーボードで操作したとき、シェアとメニューのボタンにフォーカスの枠が出る（マウスで見ている限りは変わらない） | `<a>` から button に変えると、reset の `outline: none` で旧サイトにはあった枠が消えるため（08 の A-5） |
| `tip/frontnote` と `tip/javascript-es6` のコードブロック 1 個ずつで、色の付き方が変わる | 上の直しと、消えていた文字を元に戻した結果、自動判定される言語が変わる（php → xml、xml → javascript） |
| 375px の幅で、最後に空行があるコードブロック 113 個（40 ページ）が 1px 高くなる。1080px では同じ | 旧サイトは最後の改行が `<code>` の外（`</code>` と `</pre>` の間）にあり、新サイトは `<code>` の中にある。Markdown から 115 個だけを見分ける印を持たせるほどの差ではないので受け入れる |
| 英数字が Open Sans から OS の標準フォント（mac は SF、Windows は Segoe UI）に、コードが Source Code Pro から OS の等幅フォント（mac は Menlo）になる。日本語は今までどおり游ゴシックなど | Google Fonts の CSS が描画を止めていて、表示が遅れていた（mobile の LCP の原因の 1 つ）。ユーザーの判断で Web フォントをやめる |
| 前後記事ナビのタイトルが、その記事の見出しと同じ文字になる（169 本。例: `-` → `–`、`'` → `’`、`...` → `…`、`Wordpress` → `WordPress`） | 旧サイトのナビは WP の生のタイトルを出していて、記事の見出し（WP が記号を整えたもの）と文字が違っていた。別のタイトルを記事データに持たず、見出しにそろえる |

コードの色、字詰め（palt が効いていない状態）、目次の見出しのホバーの不備などは、旧サイトのまま再現します。一覧は 02 の 8 章にあります。

## 5. 実装の進め方

ブランチは 1 本（`renewal/astro`）です。ローカルで全部仕上げてから PR を 1 本作ります。コミットは `/contextual-commit` で切り、各コミットの時点で `pnpm build`、`pnpm test`、`pnpm test:dist` が通るようにします。

実装は次の 7 つの担当で進めます。触るディレクトリを担当ごとに分けて、同じブランチの上で衝突しないようにします。

| 担当 | 触る場所 |
| --- | --- |
| リーダー（全体の組み立て） | `astro.config.mjs`、`src/pages`、`src/layouts`、`src/components`、`src/lib`（下の 2 つを除く）、統合とレビュー |
| インフラ | `package.json`、`pnpm-*`、`.nvmrc`、`netlify.toml`、`public/sw.js`、`public/_headers`、`.github/`、lint / format の設定、旧ファイルの削除 |
| アートディレクション | `src/styles/`、コンポーネントの `<style>`、旧サイトとの見た目比較 |
| Markdown エクスポーター | `scripts/export-markdown/`、`src/content/` の生成物、往復検証 |
| アイキャッチ生成 | `src/lib/eyecatch/`、`src/lib/primary-tag.ts`、`scripts/build-og.mjs` |
| 部品のカタログ | `src/catalog/`、`e2e/catalog/`、`playwright.catalog.config.ts`、`test/components/` |
| QA | `test/`（`test/components/` を除く）、`e2e/`（`e2e/catalog/` を除く）、`playwright.config.ts`、`vitest.config.ts`、`scripts/a11y-compare.ts`、`scripts/check-links.ts`、`docs/a11y.md` |

カタログと QA が各手順で何を足すかは、07 の 15 章と 08 の 9 章にあります。

順番（コミットの単位。詳しくは 03 の 11 章）:

1. 土台: 旧ツールを削除し、Astro、Node 26、pnpm 10、TS 6、lint 類、`netlify.toml` を入れる（済み）
2. スタイルの移植（SCSS の書き換え）（済み）
3. レイアウトと共通部品（Bar / Header / Menu / Wrapper / Title）（済み）
4. コンテンツの受け口（スキーマ、ターム、前後記事、日付）とテスト（済み）
5. Markdown の描画（highlight.js、見出しの id、外部リンク）とテスト（済み）
6. エクスポーターの実装と、記事の Markdown・ターム JSON の生成（量が多いので単独のコミット）（済み）
7. 記事ページ（目次、関連記事、前後記事、シェア）（済み）
8. 一覧ページと無限スクロール（済み）
9. head まわり（OGP、canonical、構造化データ `BlogPosting`（元の公開日・更新日・著者）、RSS `/feed.xml`、sitemap `/sitemap.xml`、robots.txt）（済み）
10. アイキャッチと OGP 画像（済み）
11. GA4、AdSense、旧 Service Worker の撤去（済み）
12. 旧サイトとの見た目比較（64 枚の基準と computed style）、URL の一致テスト、コードブロックの高さの確認（済み）
13. PR を作り、Deploy Preview で Node 26 と pnpm、resvg、日本語 slug のパスが動くことを確かめる
14. 新しいドメインを Netlify のプライマリドメインにし、`SITE_URL` を切り替える
15. マージと本番の確認（01 の 10 章）
16. 公開後の検索対策（06 の 2.5 と 3 章）: Search Console と Bing への登録、sitemap の送信、主な記事のインデックス登録のリクエスト、「Google が選択した正規 URL」の確認、旧 URL の「古いコンテンツの削除」申請、Safe Browsing への報告、自分で直せる被リンクの書き換え、AdSense の再審査


## 6. 完了の条件

- 新しいビルドの URL が、旧 sitemap の 1323 件と一致する。
- 旧サイトの基準スクリーンショット 64 枚と比べて、差が「4. 旧サイトから見た目が変わるところ」の範囲に収まる。computed style の比較でも同じ。
- コードブロック 762 個の高さが旧サイトと一致する（02 の 10 章）。例外は 4 章に書いた 2 つ（`tip/frontnote` の `<h1>` の直しと、375px で 1px 高くなる 113 個）だけ。
- 旧 Service Worker が入ったブラウザで開いても、新しいサイトが表示される。
- `pnpm lint`、`pnpm check`、`pnpm test`、`pnpm build`、`pnpm test:dist`、`pnpm test:e2e`、`pnpm audit --audit-level high` が通る。
- a11y の違反の件数が、旧サイトの基準（`test/a11y/baseline.json`）から増えていない。増えたものは、08 の 2.6 の手順で片付けるか、一覧に理由を書いてある。
- カタログの全 story が 4 つの幅で表示でき、操作のテストが通る。
- Deploy Preview のビルドが通り、表示も確認できる。
- 全ページで、canonical が新しいドメインの自分自身を指し、構造化データに元の公開日が入っている。本文とテンプレートに旧ドメインへのリンクが残っていない。

## 7. 進捗（2026-10-24）

手順 1〜12 は `renewal/astro` に入っています。手順 13 以降が残りです。

| 項目 | 状態 |
| --- | --- |
| URL | 旧 sitemap の 1323 件と一致（`test:dist`） |
| 見た目 | 基準 64 枚のうち範囲外 0（404 の 4 枚は Deploy Preview で見る）。computed style も範囲外 0。結果は [09-visual-diff.md](./09-visual-diff.md) |
| コードブロックの高さ | 6 章の例外以外は一致 |
| テスト | `pnpm verify` 一式（lint、format、check、test 408、build、test:dist 16220、test:e2e 65）、`pnpm audit --audit-level high`、カタログ 313 が通る |
| a11y | 旧サイトの基準から増えていない。カタログで見つかった本文のリンクの色の問題は、旧サイトから引き継ぐもの（A11Y-22）として 08 の 2.5 に足した |
| 性能 | Lighthouse（mobile、広告なし）: 4 ページとも性能 100、LCP 0.9〜1.7 秒、CLS 0 |
| Netlify | PR の Deploy Preview を止め、ビルドは master の本番だけにした。custom_domain（`webmanab-html.com`）を外した。netlify.app の応答から旧ドメインを指す canonical のヘッダーが消えたことを確かめた。応答ヘッダーは `netlify.toml` に入れた |
| GitHub | Dependabot は alerts だけを有効にし、PR を作る設定（security updates と `dependabot.yml`）は止めた |

実装の途中で決めたこと（4 章と 2 章に反映済み）:

- Google Fonts をやめ、OS の標準フォントにした（ユーザーの判断）。
- 前後記事ナビのタイトルは記事の見出しにそろえる。旧ナビの文字を別に持たない。
- 375px でコードブロック 113 個が 1px 高くなるのは受け入れる。
- 依存の 14 日の待ちは Dependabot の更新だけにかける。手で入れる版は待たない（ユーザーの判断）。
- 前後記事ナビのアイキャッチは `{id}-nav.svg`、`<img>` の大きさは 640×360。
- 無限スクロールは `<template>` を使わず、ページの 1 件目のカードを複製する。

残っている作業:

| 手順 | 中身 | 誰が |
| --- | --- | --- |
| 13 | PR #35（下書き）を作った。CI と Deploy Preview の確認は済み。残りは実機（iPhone、Android）での操作と、手作業の a11y | 実機の確認はユーザー、ほかは Claude |
| 14 | `webmanab.com` を Cloudflare Registrar で取得し、DNS（apex と `www` を `webmanab.netlify.app` への CNAME、プロキシなし）を作った。`SITE_URL` も切り替えた（済み） | Claude |
| 14 | Netlify にドメインを付け、証明書の発行を確かめてから、netlify.app から webmanab.com への 301 を `netlify.toml` に足す。本番の master はまだ旧 Nuxt のビルドなので、付けるのはマージの直前にする | Claude |
| 15、16 | マージ、本番の確認、公開後の検索対策 | Claude（Search Console などのアカウント操作はユーザー） |

## 8. 次のセッションの始め方

このセッションの一時ディレクトリは消えるので、試作のソースは `.snapshot/prototypes/` に移してある（コミットしない場所）。

| 置き場所 | 中身 |
| --- | --- |
| `.snapshot/html/`、`.snapshot/inventory.json` | 旧サイトの生成済み HTML 1321 ページと、その集計 |
| `.snapshot/baseline/` | 旧サイトの基準スクリーンショット 64 枚、computed style 52 ページ分、撮影スクリプト `capture.ts`（`--base` で新サイトも同じ条件で撮れる） |
| `.snapshot/prototypes/md-exporter/` | 変換（`convert-unified.mjs`、`frontmatter.mjs`、`export.mjs`）、往復検証（`verify.mjs`）、最新の出力 `out-v4/`（記事 1030 本とターム JSON） |
| `.snapshot/prototypes/architecture/proto/` | Astro の試作（`src/lib/markdown/hljs.mjs` など）と、コードブロックの比較スクリプト |
| `.snapshot/prototypes/eyecatch/`（`samples-src/` に試作のソース） | アイキャッチの生成関数と `build-og.mjs` |
| `.snapshot/prototypes/art-direction/` | 撮影と computed style の比較に使った道具 |
| `.snapshot/prototypes/storybook/proto/` | 自前のカタログの試作（`src/catalog/`、`playwright.catalog.config.ts`、`tests/catalog/`）。Storybook と Astrobook を試した設定も残っている |
| `.snapshot/prototypes/qa/` | 旧サイトの a11y 監査のスクリプト（`audit.mjs`）と結果（`results-413.json` が axe-core 4.13.0 の結果）、Lighthouse の結果（`lh/`） |
| `https://5eeb72325bef250008f5cbfd--webmanab.netlify.app` | 旧サイトの最後のデプロイ（2020-06-18）の固定 URL。本番を差し替えたあとも残るはずなので、`.snapshot/` を失ったときの予備の取得元にする（差し替え後に残るかは未確認） |

実装のときに足した置き場所:

| 置き場所 | 中身 |
| --- | --- |
| `.snapshot/baseline-astro/` | 新サイトを基準と同じ条件で撮ったもの |
| `.snapshot/prototypes/art-direction/compare/` | 旧サイトとの比較の道具（`README.md` に使い方。依存は `pnpm install --ignore-workspace` で入れる） |
| `.snapshot/prototypes/qa/lh-astro/` | 新サイトの Lighthouse の結果 |
| `.snapshot/pr/checklist.md` | PR に貼る確認リスト |
| `.snapshot/review/` | レビュー用のページ（新旧のスクリーンショットを並べたもの。`python3 build.py` で作り直す） |
| `../webmanab-wt/<担当>` | 担当ごとの worktree（`renewal/<担当>` ブランチ）。どれも `renewal/astro` に取り込み済みなので、PR のあとで消してよい |

進め方の注意:

1. ブランチは `renewal/astro`。PR はここから 1 本だけ作る。
2. Astro 7.4 はエージェントの環境だと `astro preview` / `astro dev` を裏に回してすぐ終わる。`--ignore-lock` を付けると前面のまま動く。E2E は `E2E_PORT` でポートを変えられる。
3. `.snapshot/` の下で依存を入れるときは `pnpm install --ignore-workspace` にする（付けないと本体の `pnpm-lock.yaml` が書き換わる）。
4. Playwright は 1.64.1 に固定する（基準スクリーンショットと同じ Chromium で比べるため）。

## 9. ユーザーにお願いすること・確認すること

1. ドメイン: `webmanab-html.com` は取り戻さない前提にし（06）、新しいドメインは `webmanab.com` にしました（2026-10-25 に Cloudflare Registrar で取得、自動更新あり）。Netlify に付けるのはマージの直前です。
2. 「4. 旧サイトから見た目が変わるところ」の内容でよいか。レビュー用のページで新旧を並べて見られます。
3. アイキャッチの絵柄（`assets/eyecatch-samples/index.html`）で、直したいカテゴリがあれば教えてください。
4. a11y の直す順番（08 の 2.5）: 公開後に、見た目が変わらない直しから始めます。キーボード操作のときだけ見える直し（フォーカスの枠、スキップリンクなど）は、見え方を見てもらってから入れます。誰にでも見た目が変わる直し（コードの 2 色のコントラスト、記事の上のタグの大きさ、本文のリンクの下線＝A11Y-22）は、直すかどうかを決めてもらいます。
5. マージのときに、旧 Nuxt の構成に向けた Dependabot の PR（#29〜#34）を閉じます。

済んだもの: Netlify の custom_domain を外す（Claude が CLI で実施）、Dependabot の PR を止めて alerts だけにする（同）、GitHub の secret `MOSHI_TOKEN`（2026-10-25 に登録、テスト通知が届くことを確認）。デプロイ失敗の通知は、Netlify から Slack への通知がもうあるのでメールは足さない。
