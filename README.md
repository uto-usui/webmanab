# webmanab

[![Netlify Status](https://api.netlify.com/api/v1/badges/b434ac22-fe4b-4874-9a05-01c60a105ecf/deploy-status)](https://app.netlify.com/sites/webmanab/deploys)

Astro で作る静的サイトです。記事は `src/content/posts/` の Markdown です。

## 開発

```sh
n auto            # .nvmrc の Node 26 に切り替える
cp .env.example .env
pnpm install
pnpm dev
```

`pnpm verify` で lint、型、テスト、ビルド、E2E をまとめて回します。

リニューアルの計画は [docs/renewal/README.md](docs/renewal/README.md) にあります。
