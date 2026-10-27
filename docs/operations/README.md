# webmanab の運用

2026-10-25 に `https://webmanab.com` で公開し、リニューアルは終わりました。ここからは運用の段階です。この文書は、運用のあいだに決めたことと、ふだんの作業の進め方をまとめたものです。リニューアルの経緯は [docs/renewal/README.md](../renewal/README.md) に残してあります。

## 1. 運営の前提（2026-10-25 に決めたこと）

| 項目 | 決めたこと |
| --- | --- |
| 書く頻度 | 週 5 本ほど。clip を週 3〜4 本、tip を週 1〜2 本。tip の題材は、ドメインの移管やリニューアルのような普段の作業から取る |
| 機能の順番 | 読者向けの F4（サイト内検索）、独自の 404、F2（更新日の表示）、コードのコピーボタンは 2026-10-26 に公開した。vault への移行と F1（新しい記事の雛形）は 2026-10-27 に済んだ。次はその上に F7（clip の自動化）を作る。F5（タグの組み合わせ）はあとで、F3（公開終了した clip の表示）は作らない |
| 新しい記事の id | 3000 から順に振る。旧 WordPress の id（最大 2883）と区別するため |
| a11y | 運用とは別の作業として進める。見た目が変わらない段階 1・2 は #58 で入れた。見た目が変わる段階 3（A11Y-04、08、22）は、スクショを作者に見てもらってから入れる。違反の一覧と状態は [docs/a11y.md](../a11y.md) |
| 旧記事 | 一括で書き直さない。手を入れるのは、よく読まれている記事と、リンク切れなどで壊れている記事だけ |
| 機能開発 | Claude Code に任せる。作者がやるのは、記事を書くこと、見た目を決めること、実機で確かめること |

## 2. 記事の置き場所

記事は 2026-10-27 から Obsidian の vault の `Published/webmanab/{tip,clip,lab}/` で書きます（[#51](https://github.com/uto-usui/webmanab/issues/51)）。このリポジトリの `src/content/posts` は、vault から写したコピーです。ここでは直しません。PR で記事が変わると、CI の `posts-from-vault` が落ちます。

- frontmatter の形は `src/lib/schema.ts` のまま。足したのは `draft` だけで、`draft: true` の記事は写さない（このリポジトリは公開なので、下書きを入れない）
- 写すのは `pnpm sync:vault`。vault の場所は `WEBMANAB_VAULT_DIR`（手元の `.env` に書ける）か `--vault` で渡す。`--dry-run` で変わる記事の一覧だけを出す
  - 止まるのは、スキーマに合わない、id か `type/slug` の重なり、ファイル名の規則違い、本文の wikilink（`[[`）、新しい記事の `TODO`、画像の置き忘れ、`public/images/` の同じ名前の別の画像、6 本以上の削除（意図したときは `--allow-delete`）
  - ターム JSON の `count` は記事から数え直し、JSON にないタームは足す。新しいタームの id は 367 から
- 新しい記事は `pnpm new` で vault に下書き（`draft: true`）として作る。id、日付、ターム、clip のスクショ（1280×720、640、ページ全体）を埋め、本文は vault の `templates/<type>.md` を写す。書き先は `WEBMANAB_VAULT_DIR` か `--out`
  - `pnpm new clip <url> [--tags a,b] [--no-full]`、`pnpm new tip <slug> [--tags a,b]`、`pnpm new lab <slug> [--tags a,b]`
  - `--tags` はターム JSON と vault の記事から名前か slug で探し、ないものは新しいタームにする。最初のタグが `primaryTag` になる
  - `pnpm new image <id> <file>` は本文の画像を幅 1600 までの WebP にして `images/posts/<id>/` に置き、貼る Markdown を出す
- 新しい記事の本文の画像は vault の `Published/webmanab/images/posts/<id>/` に置き、本文からは `../images/...` で参照する。sync が `/images/...` に書き換えて `public/images/` に写す。旧記事の画像（124MB）はこのリポジトリに残す
- 書いたら、このリポジトリで `pnpm sync:vault` を動かし、`pnpm test` を通してから、このリポジトリでコミットして master に push する。GitHub Actions に移すのは、F1 と clip の自動化ができてから（vault 側の workflow、webmanab だけに書ける deploy key）
- やめたいときは sync を止めるだけでよい。`src/content/posts` はコミットしたまま残っているので、このリポジトリで直接直す運用に戻れる

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
| `deploy-check.yml` | master への push | Netlify の本番デプロイの結果を API で見る。Netlify と Slack は ignore で止めたビルドも「失敗」と出すので、本当に落ちたかはこちらで見る | 落ちたときだけ Moshi |

外部リンクの確認は、2026-10-25 に手で 1 回動かしました（[実行結果](https://github.com/uto-usui/webmanab/actions/runs/40188317535)）。1182 件のうち、切れているものが 186 件（clip の紹介先 155、tip の本文 31）、別のドメインへの転送が 82 件、確かめられないものが 254 件でした。jsfiddle は自動の確認に 403 を返すので、lab のデモが動くかどうかはこの仕組みでは数えられません。

## 5. 変更するときの確認

- コードを変えたら `pnpm verify` を通す
- master に push するたびに Netlify の本番ビルドが動く（docs だけの変更でも、止めるための起動が 1 回走る）。PR は細かく分けず、関係する変更を 1 本にまとめる。docs だけの直しは、次のコードの PR に入れる
- 見た目が変わる変更は、`pnpm test:catalog` で差分を見る。意図どおりなら、同じコミットで基準のスクショを撮り直す。`pnpm test:visual` は `e2e/visual/` がまだなく、テストが 0 件なので、ページ単位の見た目のテストを作るまでは差を見られない
- 依存の更新はスキル `deps-update` を使う。alerts のメールが来たとき、`monitor.yml` の audit が落ちたときと、四半期に 1 回のふだんの版上げ
- 版を固定しているものには理由がある。highlight.js 10.1.1 は旧サイトと同じ色にするため、TypeScript 6 は `astro check` が 7 に対応していないため、Playwright 1.64.1 は基準のスクショと同じ Chromium で比べるため。四半期の版上げのときに、理由がまだ当てはまるかを確かめる

## 6. 機能の計画

機能ごとの計画と、作者に確かめたいことは GitHub の issue で扱います。作る・あとで・作らないが決まったら issue に書き、作り終えたら PR から閉じます。

| issue | 中身 | 状態 |
| --- | --- | --- |
| [#51](https://github.com/uto-usui/webmanab/issues/51) | 記事を vault に移す、F1 新しい記事の雛形 | 2026-10-27 に済んだ |
| [#61](https://github.com/uto-usui/webmanab/issues/61) | vault の push で `pnpm sync:vault` を動かす GitHub Actions | 案はできている。deploy key と secret の登録は作者が認める |
| [#52](https://github.com/uto-usui/webmanab/issues/52) | clip の自動化 | `pnpm new clip` の上に作る。2026-10-27 に方針が決まった。選び方と感想の書き方は skill にする |
| [#53](https://github.com/uto-usui/webmanab/issues/53) | laboobal を lab と labobal.dev にまとめる | 2026-10-27 に方針が決まった。labobal.dev の中身はそちらのエージェントが決める |
| [#50](https://github.com/uto-usui/webmanab/issues/50) | F5 clip をタグの組み合わせで絞り込む | あとで |
| [#45](https://github.com/uto-usui/webmanab/issues/45)〜[#49](https://github.com/uto-usui/webmanab/issues/49) | テストの直し、F4 検索、404、F2 更新日、コピーボタン | 2026-10-26 に公開（#56） |

## 7. 公開後に残っている作業

| 作業 | 誰が |
| --- | --- |
| 実機（iPhone、Android）でメニュー、目次、無限スクロール、シェアを触る | 作者 |
| Search Console の URL 検査で、上位 10 本の「Google が選択した正規 URL」が `webmanab.com` になったかを見る（10/28 ごろと、その 2 週間後） | Claude |
| X のプロフィールのリンクを `webmanab.com` にする。この Chrome では X にログインしていない | 作者（ログインしてもらえれば Claude） |
| uto-usui.com（XServer）に、旧ドメインを書き換えた版を出す。リポジトリ側は書き換え済み | 未定 |
| Zenn の自己紹介に webmanab と note を足す。上限の 160 字に達しているので、削るところを作者が決める | 作者が決めてから Claude |
| laboobal のドキュメントを webmanab の lab に移し、デモは labobal.dev に置く。laboobal-dev（Nuxt 2）は作り直す（[#53](https://github.com/uto-usui/webmanab/issues/53)） | 方針は決まった。着手は未定 |
