# webmanab の運用

2026-10-25 に `https://webmanab.com` で公開し、リニューアルは終わりました。ここからは運用の段階です。この文書は、運用のあいだに決めたことと、ふだんの作業の進め方をまとめたものです。リニューアルの経緯は [docs/renewal/README.md](../renewal/README.md) に残してあります。

## 1. 運営の前提（2026-10-25 に決めたこと）

| 項目 | 決めたこと |
| --- | --- |
| 書く頻度 | 週 5 本ほど。clip を週 3〜4 本、tip を週 1〜2 本。tip の題材は、ドメインの移管やリニューアルのような普段の作業から取る |
| 機能の順番 | F1（新しい記事の雛形とスクショの撮影）と F7（clip の候補集め）を最初に作る。サイト内検索（F4）も前倒しする |
| 新しい記事の id | 3000 から順に振る。旧 WordPress の id（最大 2883）と区別するため |
| a11y | 今やる。運用とは別の作業として進める。見た目が変わらない段階 1・2 から始め、見た目が変わる段階 3 はスクショを作者に見てもらってから入れる（[08-quality.md](../renewal/08-quality.md) の 2.5） |
| 旧記事 | 一括で書き直さない。手を入れるのは、よく読まれている記事と、リンク切れなどで壊れている記事だけ |
| 機能開発 | Claude Code に任せる。作者がやるのは、記事を書くこと、見た目を決めること、実機で確かめること |

## 2. 記事の置き場所

今は `src/content/posts/{tip,clip,lab}/<slug>.md` を直接書き換えます。frontmatter の形は `src/lib/schema.ts` にあります。

Obsidian の vault の`Published/webmanab/` に移す予定です。移したあとは vault の記事を書き換え、このリポジトリの `src/content/posts` は vault から作るコピーになります。進め方は案の段階で、作者の確認を待っています。

- 書き直すのは vault だけにする。移す日を決めて一度に移し、その日からはこのリポジトリで記事を直さない
- 新しい記事の画像は vault に置く。旧記事の画像（`public/images/`、124MB）は書き換えないので、このリポジトリに残す
- 反映は、最初は手元で動かすコマンドにし、流れが固まったら GitHub Actions に移す

## 3. 文章の校正

記事の textlint は、vault の記事用のルールを使います。公開稿は 0 件にしなくてよく、書きながら好きなときに動かして指摘を見ます。人が読んでよいと判断したところは残します。

旧記事に一度かけた結果と、そこで決めたことは vault に残してあります。新しい記事を書くときは、旧記事ではなく、そこから抜き出したテンプレートを見本にします。

## 4. 自動で動いているもの

| 仕組み | 頻度 | 中身 | 通知 |
| --- | --- | --- | --- |
| `ci.yml` | push、PR | lint、型、テスト、ビルド、E2E。docs と README だけの変更では動かない | GitHub |
| `monitor.yml` | 週 1 回 | 本番の死活と `pnpm audit` | Moshi |
| `check-links.yml` | 毎月 1 日 | 記事の外部リンクの死活 | Moshi |
| Netlify | master への push | 本番のビルド。使わないファイルだけの変更では `scripts/netlify-ignore.sh` が止める | Slack |

外部リンクの確認は、2026-10-25 に手で 1 回動かしました（[実行結果](https://github.com/uto-usui/webmanab/actions/runs/40188317535)）。1182 件のうち、切れているものが 186 件（clip の紹介先 155、tip の本文 31）、別のドメインへの転送が 82 件、確かめられないものが 254 件でした。jsfiddle は自動の確認に 403 を返すので、lab のデモが動くかどうかはこの仕組みでは数えられません。

## 5. 変更するときの確認

- コードを変えたら `pnpm verify` を通す
- 見た目が変わる変更は、`pnpm test:catalog` と `pnpm test:visual` で差分を見る。意図どおりなら、同じコミットで基準のスクショを撮り直す
- 依存の更新はスキル `deps-update` を使う。alerts のメールが来たとき、`monitor.yml` の audit が落ちたときと、四半期に 1 回のふだんの版上げ
- 版を固定しているものには理由がある。highlight.js 10.1.1 は旧サイトと同じ色にするため、TypeScript 6 は `astro check` が 7 に対応していないため、Playwright 1.64.1 は基準のスクショと同じ Chromium で比べるため。四半期の版上げのときに、理由がまだ当てはまるかを確かめる

## 6. 公開後に残っている作業

| 作業 | 誰が |
| --- | --- |
| 実機（iPhone、Android）でメニュー、目次、無限スクロール、シェアを触る | 作者 |
| Search Console の URL 検査で、上位 10 本の「Google が選択した正規 URL」が `webmanab.com` になったかを見る（10/28 ごろと、その 2 週間後） | Claude |
| GA4 のプロパティを作り、`netlify.toml` の `PUBLIC_GA4_ID` を有効にする | Claude（Chrome で） |
| X のプロフィールのリンクを `webmanab.com` にする | Claude（Chrome で） |
| uto-usui.com（XServer）に、旧ドメインを書き換えた版を出す。リポジトリ側は書き換え済み | 未定 |
| Zenn の自己紹介に webmanab と note を足す。上限の 160 字に達しているので、削るところを作者が決める | 作者が決めてから Claude |
| laboobal のドキュメントを webmanab の lab に移し、デモは labobal.dev に置く。laboobal-dev（Nuxt 2）は作り直す | 案の段階 |
