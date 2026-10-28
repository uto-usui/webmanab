# webmanab

[![Netlify Status](https://api.netlify.com/api/v1/badges/b434ac22-fe4b-4874-9a05-01c60a105ecf/deploy-status)](https://app.netlify.com/sites/webmanab/deploys)

Astro で作る静的サイトです。運用の方針と機能の順番は [#68](https://github.com/uto-usui/webmanab/issues/68)、残りの作業は issue にあります。

## 開発

```sh
n auto            # .nvmrc の Node 26 に切り替える
cp .env.example .env
pnpm install
pnpm dev
```

- コードを変えたら `pnpm verify`（lint、型、テスト、ビルド、E2E）を通す
- 見た目が変わる変更は `pnpm test:catalog` で差分を見る。意図どおりなら、同じコミットで基準のスクショを撮り直す
- master に push するたびに Netlify の本番ビルドが動く。docs だけの直しは、次のコードの PR に入れる
- 依存の更新はスキル `deps-update` を使う
- 版を固定しているものには理由がある。highlight.js 10.1.1 は旧サイトと同じ色にするため、TypeScript 6 は `astro check` が 7 に対応していないため、Playwright 1.64.1 は基準のスクショと同じ Chromium で比べるため

## 記事

記事は Obsidian の vault の `Published/webmanab/{tip,clip,lab}/` で書きます。`src/content/posts/` は vault から写したコピーなので、ここでは直しません（PR で記事が変わると CI の `posts-from-vault` が落ちます）。

- 新しい記事は `pnpm new` で vault に下書き（`draft: true`）として作る。id、日付、ターム、clip のスクショを埋め、本文は vault の `templates/<type>.md` を写す。書き先は `WEBMANAB_VAULT_DIR`（`.env`）か `--out`
  - `pnpm new clip <url> [--tags a,b] [--no-full]`、`pnpm new tip <slug> [--tags a,b]`、`pnpm new lab <slug> [--tags a,b]`
  - `pnpm new image <id> <file>` は本文の画像を幅 1600 までの WebP にして `images/posts/<id>/` に置き、貼る Markdown を出す
- 新しい記事の id は 3000 から。旧 WordPress の id（最大 2883）と区別するため
- 書いたら vault を push する。vault 側の workflow が `pnpm sync:vault` と `pnpm test` を動かし、差分があれば deploy key でこのリポジトリの master に push する。止まったときは Moshi に知らせが来る
- `pnpm sync:vault` は `draft: true` を写さない。スキーマ違い、id か `type/slug` の重なり、wikilink、新しい記事の `TODO`、画像の置き忘れ、6 本以上の削除で止まる。手元で動かすのは、大量に消すとき（`--allow-delete`）と差分を見たいとき（`--dry-run`）だけ
- やめたいときは sync を止めるだけでよい。`src/content/posts` はコミットしたまま残っているので、ここで直接直す運用に戻れる

## 自動で動いているもの

| 仕組み             | 頻度             | 中身                                                                                                                                   | 通知                 |
| ------------------ | ---------------- | -------------------------------------------------------------------------------------------------------------------------------------- | -------------------- |
| `ci.yml`           | push、PR         | lint、型、テスト、ビルド、E2E。docs と README だけの変更では動かない                                                                   | GitHub               |
| `monitor.yml`      | 週 1 回          | 本番の死活と `pnpm audit`                                                                                                              | Moshi                |
| `check-links.yml`  | 毎月 1 日        | 記事の外部リンクの死活                                                                                                                 | Moshi                |
| Netlify            | master への push | 本番のビルド。使わないファイルだけの変更では `scripts/netlify-ignore.sh` が止める                                                      | Slack                |
| `deploy-check.yml` | master への push | Netlify の本番デプロイの結果を API で見る。Netlify と Slack は ignore で止めたビルドも「失敗」と出すので、本当に落ちたかはこちらで見る | 落ちたときだけ Moshi |
