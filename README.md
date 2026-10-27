# webmanab

[![Netlify Status](https://api.netlify.com/api/v1/badges/b434ac22-fe4b-4874-9a05-01c60a105ecf/deploy-status)](https://app.netlify.com/sites/webmanab/deploys)

Astro で作る静的サイトです。記事は `src/content/posts/` の Markdown です。書くのは Obsidian の vault で、ここへは `pnpm sync:vault` で写します（[運用の文書](docs/operations/README.md) の 2 章）。

## 開発

```sh
n auto            # .nvmrc の Node 26 に切り替える
cp .env.example .env
pnpm install
pnpm dev
```

`pnpm verify` で lint、型、テスト、ビルド、E2E をまとめて回します。

運用の進め方と決めたことは [docs/operations/README.md](docs/operations/README.md) にあります。2026-10-25 に終えたリニューアルの記録は [docs/renewal/README.md](docs/renewal/README.md) です。
