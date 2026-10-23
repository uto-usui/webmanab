# 01 インフラ（足回り）計画

担当: インフラ。前提は `00-brief.md`。この文書はまだ何も作らない段階の計画で、ファイルの中身は案として載せる。

調べた日: 2026-10-22。Netlify への操作は読み取り（`api getSite` / `getEnvVars` / `getDnsZone` / `getDnsRecords` / `listSiteDeploys` / `showSiteTLSCertificate`）と `curl -I` だけで、書き込みはしていない。

## 0. 調べてわかった現状

### Netlify サイト（`getSite` の結果）

| 項目 | 値 | メモ |
| --- | --- | --- |
| build cmd / publish | `yarn generate` / `dist` | UI の設定。toml を置けば上書きされる |
| build image | `noble` | |
| `versions.node.active` | `8` | サイトが Node 8 に固定されている。default は `24` |
| `allowed_branches` | `["master"]` | ブランチデプロイは実質オフ |
| `skip_prs` | `null` | Deploy Preview は有効 |
| `cdp_enabled_contexts` | `["deploy-preview"]` | プレビューに Netlify Drawer のスクリプトが入る |
| `processing_settings.html.pretty_urls` | `true` | `/tip` → 301 `/tip/` を確認済み |
| `custom_domain` | `webmanab-html.com` | `domain_aliases` は空 |
| `managed_dns` / `dns_zone_id` | `true` / `5c6831482ee08ce56c099aea` | Netlify DNS のゾーンが残っている |
| TLS 証明書 | `*.webmanab-html.com`, `webmanab-html.com`、期限 2026-10-16 | すでに期限切れ |
| `deploy_retention_in_days` | `30` | |
| 環境変数（`getEnvVars`） | なし | `build_settings.env` に `DEPRECATED` というキーだけ残っている。中身と由来は未確認 |
| published deploy | `5eeb72325bef250008f5cbfd`（2020-06-18、`9767b0f`） | |

デプロイ一覧には 2020-06-18、2019-11-08、2019-07-24、2019-02-16 の 4 件があり、`https://5eeb72325bef250008f5cbfd--webmanab.netlify.app/` と `https://5dc4e977905908bce145fb7e--webmanab.netlify.app/` はどちらも 200 を返す（`x-robots-tag: noindex` 付き）。

### `webmanab.netlify.app` の応答（curl で確認）

- `/` は 200。応答に `link: <https://webmanab-html.com/>; rel="canonical"` が付いている。custom_domain が設定されているサイトでは、Netlify が netlify.app 側の応答にこのヘッダーを自動で付ける（[Netlify Support Forums: Improved SEO with canonical link headers](https://answers.netlify.com/t/improved-seo-with-canonical-link-headers/11095)。公式ドキュメント上の記述は見つからなかった）。
- `/tip` は 301 で `/tip/` へ。
- `/sw.js` は 200、`cache-control: public,max-age=0,must-revalidate`。
- 存在しないパスは 404。
- `/feed.xml` は 404（旧サイトでも RSS は出ていなかった）。`/sitemap.xml` は 200。
- 非 ASCII の slug が 2 件あり（`/clip/%e3%81%ad%e2%80%af-%e2%80%afnt/` と `/lab/%e7%84%a1%e9%99%90...%e3%80%8f/`）、旧サイトではどちらも 404。Nuxt がディレクトリ名を `%e3...` の文字列のまま書き出していて、Netlify はデコード後の名前でファイルを探すため。新サイトではデコード済みの名前で書き出せば直るはずで、Deploy Preview で確認する。
- `/clip/_prefix/` は 200。`_` で始まる slug がある。

### ドメイン（whois / dig で確認）

ブリーフの「GoDaddy で失効したあと ParkLogic でパーキング」と、whois の内容が一部食い違う。

- Registrar: GoDaddy.com, LLC、Creation 2015-08-24、Registry Expiry 2027-08-24
- Name Server: `ns1.parklogic.com` / `ns2.parklogic.com`、A レコードは ParkLogic の IP

登録期限は 2027-08-24 まで延びていて、登録自体は GoDaddy で続いている。ユーザーの GoDaddy アカウントにまだあるのか、第三者に渡ったのかは whois からはわからない。再取得の前提が変わるので、ユーザーに確認したい（末尾の「ユーザーに確認したいこと」）。

Netlify DNS ゾーン `webmanab-html.com` のレコード（`getDnsRecords`）:

| type | hostname | value | managed |
| --- | --- | --- | --- |
| NETLIFY | webmanab-html.com | webmanab.netlify.com | true |
| NETLIFY | www.webmanab-html.com | webmanab.netlify.com | true |
| A | wp.webmanab-html.com | 183.90.242.42 | false |
| MX | webmanab-html.com | sv2141.xserver.jp | false |
| TXT | webmanab-html.com | google-site-verification=... | false |

ネームサーバーは `dns1.p03.nsone.net` から `dns4.p03.nsone.net`。

### リポジトリ

- `.nvmrc` は `v12.14.1`。
- `.gitignore` に `sw.*` がある。このままだと新しい `public/sw.js` がコミットされない。
- `.github/` はない。Dependabot は `automated-security-fixes` が `enabled: true, paused: true`（`gh api repos/uto-usui/webmanab/automated-security-fixes`）。#29 #30 は security updates 由来で、`package.json` と `yarn.lock` だけを変更している。
- ローカル: `node` は v26.12.1（`n` で 24.19.0 と 26.12.1 が入っている）。ブリーフの「ローカルは v24.19.0」とは現時点で違う。`pnpm` は `/usr/local/lib/node_modules/corepack` の shim で、corepack 0.35.0。`pnpm --version` は 11.28.6。

## 1. Node 26 と pnpm

### Node 26 を使う根拠

Node の公式スケジュール（[nodejs/Release schedule.json](https://github.com/nodejs/Release/blob/main/schedule.json)）では、Node 24 は 2026-10-20 に maintenance に入り、Node 26 は 2026-10-28 に LTS になる。ブリーフの決定どおり 26 系で進めて問題ない。

Netlify の noble イメージは「nvm でインストールできる版なら何でも」使える（[Available software at build time](https://docs.netlify.com/build/configure-builds/available-software-at-build-time/)）。Node 26 も指定できる。

依存側の要件: `eslint-plugin-astro@3.2.1` と `astro-eslint-parser@3.2.0` の engines が `^22.22.3 || ^24.16.0 || >=26.3.0`、`astro@7.4.2` は `>=22.23.4`。26 系なら 26.3.0 以上が必要。

### 指定方法

Netlify での優先順位は `.nvmrc` > `.node-version` > `NODE_VERSION` > UI（[Available software at build time](https://docs.netlify.com/build/configure-builds/available-software-at-build-time/)）。今の `.nvmrc`（v12.14.1）が残っていると、ほかで何を指定しても Node 12 になる。UI 側は Node 8 に固定されているので、ファイルでの指定は必須。

方針: `.nvmrc` を書き換えて `26` だけを書く。ファイルは 1 つにして `.node-version` は作らない。

- `.nvmrc` は Netlify、`n auto`（`.n-node-version` / `.node-version` / `.nvmrc` / package.json を読む。`n --help` で確認）、`actions/setup-node` の `node-version-file` のすべてが読む。
- メジャーだけを書くので、Netlify もローカルもその時点の最新 26.x を使う。パッチ版がローカルと Netlify でずれることはあるが、パッチはセキュリティ修正が中心なので、追従するほうを取る。
- `package.json` の `engines.node` は `>=26.3.0` にする。Netlify は engines を読まない（[Manage dependencies](https://docs.netlify.com/build/configure-builds/manage-dependencies/) に記述なし）ので、これは手元の警告用。

```
# .nvmrc
26
```

ローカル: `n auto` で `.nvmrc` の版に切り替わる。

### pnpm の版と固定のしかた

Netlify は `pnpm-lock.yaml` があると `pnpm install` を走らせ、pnpm の版は `package.json` の `packageManager` を Corepack が読んで決める。semver の範囲は書けない。指定がなければ 10.x（[Manage dependencies](https://docs.netlify.com/build/configure-builds/manage-dependencies/)、[Available software at build time](https://docs.netlify.com/build/configure-builds/available-software-at-build-time/)）。`PNPM_VERSION` という変数はドキュメントに出てこない（未確認ではなく、記述がない）。

Node 25 以降は Corepack が同梱されていない。Netlify ではこれが原因で、Node 26 と pnpm 12 の組み合わせのビルドが `Cannot find module '/opt/buildhome/.cache/node/corepack/v1/pnpm/12.3.4/bin/pnpm.cjs'` で落ちる報告が 2026-09 に出ている。Netlify の担当者は、pnpm を mise で入れる方式を試して取り下げ、2026-10-07 に「Corepack を上げたので pnpm は通るはず」と書いている（[Corepack + pnpm 12 + Node 26](https://answers.netlify.com/t/corepack-pnpm-12-node-26/170141)）。入った Corepack の版は書かれていない。build-image のリポジトリ（`netlify/build-image`）は 2023 年にアーカイブされていて、noble イメージの中身は公開されていない。Node 26 + pnpm が今の Netlify で通るかは未確認で、PR の Deploy Preview の最初のビルドで確かめる。

Dependabot が対応している pnpm は v7〜v10（[Supported ecosystems and repositories](https://docs.github.com/en/code-security/dependabot/ecosystems-supported-by-dependabot/supported-ecosystems-and-repositories)）。

これらを踏まえて、pnpm は 10 系に固定する。

```jsonc
// package.json（抜粋）
{
  "packageManager": "pnpm@10.34.6",
  "engines": { "node": ">=26.3.0" }
}
```

- 10.34.6 は 2026-09-28 公開。10.34.7（2026-10-12）は公開から 2 週間たっていない。
- 10 系にする理由: フォーラムの報告では Corepack の修正が要るのは pnpm 11 以上、Netlify の既定も 10.x、Dependabot も 10 まで。ローカルの pnpm は 11.28.6 だが、Corepack の shim なので `packageManager` を読んで 10.34.6 に自動で切り替わる（scratchpad で `packageManager: pnpm@11.28.5` を置いて `pnpm --version` を叩き、Corepack がその版を落として切り替えるのを確認した）。
- ローカルの Corepack は Node 24 を入れたときのものが `/usr/local/lib/node_modules/corepack` に残って動いている。`n` で Node を入れ直したときに消えるかは未確認。消えたら `npm i -g corepack` で入れ直す。
- CI では `pnpm/action-setup` が `packageManager` を読んで pnpm を入れるので、Corepack は関係しない。

pnpm の設定（`pnpm-workspace.yaml`。pnpm 10 でもここに書ける）:

```yaml
# pnpm-workspace.yaml
# 公開から 14 日たっていない版は入れない（minimumReleaseAge は分単位）
minimumReleaseAge: 20160
minimumReleaseAgeExclude:
  # Astro 7.4 系はユーザー合意済み。7.4.0 が 14 日を過ぎる 10/29 以降に外す
  - astro
allowBuilds:
  esbuild: true
  sharp: true
strictDepBuilds: true
```

- `minimumReleaseAge` は v10.16.0 から。v11 からは既定 1440 分、v10 は既定 0 なので明示する。推移的な依存にも効く（[pnpm settings: dependency resolution](https://pnpm.io/settings/dependency-resolution)）。lockfile 固定の `pnpm install --frozen-lockfile` のときにも検査が走るかは未確認。
- `allowBuilds` は v10.26.0 から。`strictDepBuilds` を true にすると、許可も拒否もしていない build script があると install が失敗する（[pnpm settings: build](https://pnpm.io/settings/build)）。`allowBuilds` に何を並べるかは、実際に install して `ERR_PNPM_IGNORED_BUILDS` に出たものを見て決める。esbuild と sharp は想定で、未確認。
- Astro 7.4 の依存（vite など）にも 14 日以内の版が含まれていると install できない。そのときは exclude を足すか、Astro を 7.3.8 にするかを判断する（下の「ユーザーに確認したいこと」）。

Deploy Preview のビルドが pnpm の段階で落ちたときの戻し方:

1. まず `packageManager` を消して Netlify 既定の pnpm 10.x に任せる（lockfile の形式が同じなら通る）。
2. それでも落ちるなら `.nvmrc` を `24` にする。Node 24 は Corepack を同梱しているので確実に通るが、2026-10-20 から maintenance に入っている。

## 2. netlify.toml

### UI 設定との関係

`netlify.toml` の値は UI の値を上書きする（[File-based configuration](https://docs.netlify.com/build/configure-builds/file-based-configuration/)）。`command` と `publish` を toml に書けば UI の `yarn generate` / `dist` は使われない。UI 側は変更しなくてよい。環境変数も toml のほうが UI / CLI / API より優先される（[Environment variables overview](https://docs.netlify.com/build/environment-variables/overview/)）。toml に空の値を書くと UI の値を消してしまうので、書かない。

toml の `[[headers]]` と `[[redirects]]` はコンテキストに関係なく全デプロイに効く（同じ File-based configuration のページ）。

### 案

```toml
# netlify.toml
[build]
  command = "pnpm build"
  publish = "dist"

[build.environment]
  # canonical / OGP / sitemap / RSS / robots.txt の絶対 URL のもと。プレビューでも本番の URL を使う
  SITE_URL = "https://webmanab.netlify.app"

# 広告と GA4 は本番だけ。値がないとタグを出さない作りにしてある
[context.production.environment]
  PUBLIC_ADSENSE_CLIENT = "ca-pub-2691922878827958"
  # PUBLIC_GA4_ID = "G-XXXXXXXXXX"  # ID を用意したら有効にする

[[headers]]
  for = "/sw.js"
  [headers.values]
    Cache-Control = "no-cache"

[[headers]]
  for = "/_astro/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

決めたこと:

- `SITE_URL` はプレビューでも本番の URL にする。プレビューの canonical が本番を指すので、プレビューが検索に出ても本番に寄る。プレビューには Netlify が `X-Robots-Tag: noindex` を付ける（[Deploy overview: Search engine indexing](https://docs.netlify.com/deploy/deploy-overview/#search-engine-indexing)）。
- Netlify の組み込み変数 `URL` は custom_domain があるとそれを返す（[Build environment variables](https://docs.netlify.com/build/configure-builds/environment-variables/)）。今は `https://webmanab-html.com` になるので、`SITE_URL` の代わりにもフォールバックにも使わない。
- `/_astro/*` は Astro がハッシュ付きのファイル名で出すので長期キャッシュにする。Astro の出力先が `_astro` であることは実装時に確認する。
- セキュリティ系のヘッダー（CSP など）は入れない。AdSense が読み込む先が多く、今回の範囲で検証しきれないため。

### redirects

toml には何も書かない予定。

- 末尾スラッシュ: Netlify の pretty URLs（UI の Post processing。toml では設定できない）が `/tip` → `/tip/` の 301 をすでに返している。Astro は `build.format: 'directory'`（既定）と `trailingSlash: 'always'` にして、canonical / sitemap / RSS / 内部リンクをすべてスラッシュ付きに揃える。旧 sitemap は `https://webmanab-html.com/tip/nuxt-static-site-tips` のようにスラッシュなしだったが、301 で新 URL に寄る。
- 旧 URL: 記事・一覧・タームの URL はすべて維持する（ブリーフの決定）。残らないのは `/_nuxt/*` と PWA の manifest だけで、404 でよい。
- 404: Astro の `src/pages/404.astro` が `dist/404.html` になり、Netlify は存在しないパスにこれを 404 で返す（[Redirect options: custom 404 page handling](https://docs.netlify.com/manage/routing/redirects/redirect-options/#custom-404-page-handling)）。

### Deploy Preview とブランチデプロイ

- Deploy Preview は今のまま有効にしておく。リニューアル PR のプレビューが、Netlify 上で Node 26 / pnpm / toml を確かめる唯一の場所になる。PR のブランチにある toml がそのプレビューに使われる。
- プレビューには `PUBLIC_ADSENSE_CLIENT` と `PUBLIC_GA4_ID` が入らないので、広告も GA も出ない。
- プレビューには Netlify Drawer のスクリプトが入る（`cdp_enabled_contexts`）。見た目比較はプレビューでは取らず、ローカルのビルドで取る（6 章）。
- ブランチデプロイは今のまま（master のみ）にする。

### ローカルで toml を試す

`npx netlify-cli@latest build --context deploy-preview` はローカルでビルドを再現する。サイトの設定を読みにいくが、デプロイはしない。ただし Netlify のビルドイメージとは環境が違うので、Node / pnpm の確認にはならない。

## 3. 旧 Service Worker の撤去

### 旧 SW がしていたこと（`.snapshot/sw.js`）

- `importScripts('https://cdn.jsdelivr.net/npm/workbox-cdn@4.3.1/workbox/workbox-sw.js')`
- `clientsClaim()` と `skipWaiting()` を呼ぶ。`cleanupOutdatedCaches()` も呼ぶ。プリキャッシュは空。
- 実行時キャッシュ:
  - Google Fonts: CacheFirst
  - `https://cdn.jsdelivr.net/.*`: CacheFirst
  - `https://wp.webmanab-html.com/wp-content/uploads/`: CacheFirst
  - `/_nuxt/`: CacheFirst
  - `/`（それ以外の同一オリジン全部）: NetworkFirst

登録は `/_nuxt/d18bbe7f424b1340a7f3.js` の中で `new Workbox("/sw.js", {scope:"/"})`。置き場所は `/sw.js`、つまり Astro の `public/sw.js` で固定。

ページ遷移は NetworkFirst なので、オンラインであれば旧 SW が残っていても新しい HTML が届く。旧 SW が残って困るのは、オフライン時に古い HTML が出ることと、キャッシュがディスクに残り続けることくらいで、影響は小さい。

### 新しい `public/sw.js`

```js
// 旧サイト（Nuxt PWA / Workbox）の Service Worker を解除するためのファイル。
// 更新確認が 404 になったときの扱いはブラウザで異なるので、旧 SW が残る場合に備えてこのパスで配信し続ける。
self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys()
      await Promise.all(keys.map((key) => caches.delete(key)))
      await self.registration.unregister()
      const clients = await self.clients.matchAll({ type: 'window' })
      await Promise.all(clients.map((client) => client.navigate(client.url)))
    })(),
  )
})
```

- 旧 SW が入ったブラウザは、ページを開いたときに `/sw.js` の更新を取りにくる。中身が変わっているので新しい SW がインストールされ、`skipWaiting` ですぐ有効になり、キャッシュを全部消して登録を解除し、開いているタブを読み込み直す。読み込み直したページは SW の管理下にないので、これで終わる。
- `fetch` のハンドラーは置かない。置かなければリクエストはそのままネットワークに行く。
- 新サイトのページには SW の登録コードも manifest も入れない。ページ側で `getRegistrations()` から解除するコードは入れない（全ページに JS が増えるわりに、`/sw.js` だけで足りるため）。
- ヘッダーは `/sw.js` に `Cache-Control: no-cache`（2 章の toml）。今の Netlify の既定も `max-age=0,must-revalidate` だが、既定に頼らず明示する。SW スクリプトの更新確認は、既定（`updateViaCache: 'imports'`）では HTTP キャッシュを通らない（[MDN: ServiceWorkerRegistration.updateViaCache](https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration/updateViaCache)）。
- このファイルは消さない。少なくとも独自ドメインの扱いが決まるまでは置いておく。

旧 SW が入っているオリジンは 2 つある。

- `webmanab-html.com`: 旧サイトの訪問者のほとんどはこちら。今はドメインが Netlify を向いていないので、新しい `sw.js` は届かない。ドメインを取り戻して Netlify に向けたときに、この `sw.js` が効く。
- `webmanab.netlify.app`: リリースした時点で効く。

### 確認手順

Deploy Preview は別オリジン（`deploy-preview-N--webmanab.netlify.app`）なので、旧 SW の乗り換えは確かめられない。ローカルと本番で確かめる。

ローカル（手動）:

1. 旧 SW を配信する: `.snapshot/html` を `localhost:8080` で配信し、`.snapshot/sw.js` を `/sw.js` に置く。`/_nuxt/` はスナップショットにないので、DevTools のコンソールで `navigator.serviceWorker.register('/sw.js')` を実行して登録する。
2. Application パネルで SW が activated になり、何ページか開いたあと Cache Storage に `workbox-runtime-...` が入っていることを見る。
3. サーバーを止め、同じ `localhost:8080` で新しい `dist/` を配信する（`astro preview --port 8080` など）。
4. ページを再読み込みする。SW が一度切り替わってタブが自動で読み込み直されたあと、`chrome://serviceworker-internals` に `localhost:8080` の登録がなく、Cache Storage が空であることを見る。

ローカル（自動、CI でも回す）: Playwright で同じ流れを書く。`.snapshot/` はコミットしないので、旧 SW の代わりに `tests/fixtures/legacy-sw.js`（`/` を CacheFirst でキャッシュするだけの小さな SW）を用意する。配信ルートを途中で切り替えられる小さな静的サーバーを使い、「登録 → `dist/` に切り替え → 再読み込み → `getRegistrations()` が空、`caches.keys()` が空」を確かめる。

本番:

1. リリース前に、専用の Chrome プロファイルで `https://webmanab.netlify.app/` を開き、旧 SW が登録されることを Application パネルで確かめておく。
2. リリース後、そのプロファイルで同じ URL を開き、ローカル手順の 4 と同じことを見る。

## 4. 環境変数

| 名前 | 使う場所 | 値の置き場 | 未設定のとき |
| --- | --- | --- | --- |
| `SITE_URL` | `astro.config` の `site` | netlify.toml `[build.environment]`、ローカルは `.env` | `astro build` を失敗させる。`astro dev` は `http://localhost:4321` |
| `PUBLIC_GA4_ID` | GA4 の gtag | netlify.toml `[context.production.environment]` | タグを出さない |
| `PUBLIC_ADSENSE_CLIENT` | AdSense のスクリプトと広告枠 | netlify.toml `[context.production.environment]` | 広告を出さない |

- 「ID が入っていればタグを出す」という一つのルールにして、コードの中で `CONTEXT` を見て分けることはしない。本番以外とローカルに値を置かないので、自然に出なくなる。
- GA4 の測定 ID と AdSense のクライアント ID は HTML に出る公開の値なので、toml に書いてリポジトリで管理する。UI に置くと、スコープを「全コンテキスト」にしてしまったときにプレビューで GA が動く。
- Astro の `PUBLIC_` 付きの変数はクライアントのコードからも読める。`astro:env` のスキーマ（`envField.string({ context: 'client', access: 'public', optional: true })`）で型をつける（[Astro: Using environment variables](https://docs.astro.build/en/guides/environment-variables/)）。静的ビルドで値がビルド時に埋め込まれるかは、ドキュメントに明記がなく未確認なので、実装時に `dist/` を grep して確かめる。
- `astro.config` は `.env` を自動では読まない。`process.env` を見て、ローカル用には Vite の `loadEnv` で `.env` を読む（同じページ）。

```ts
// astro.config.ts（SITE_URL の部分だけ）
import { defineConfig, envField } from 'astro/config'
import { loadEnv } from 'vite'

const { SITE_URL } = { ...loadEnv(process.env.NODE_ENV ?? 'production', process.cwd(), ''), ...process.env }
const isBuild = process.argv.includes('build')
if (isBuild && !SITE_URL) throw new Error('SITE_URL が未設定です')

export default defineConfig({
  site: SITE_URL ?? 'http://localhost:4321',
  trailingSlash: 'always',
  env: {
    schema: {
      PUBLIC_GA4_ID: envField.string({ context: 'client', access: 'public', optional: true }),
      PUBLIC_ADSENSE_CLIENT: envField.string({ context: 'client', access: 'public', optional: true }),
    },
  },
})
```

`astro.config` の中身はアーキテクチャ担当の持ち物なので、これは渡す側の案。

`.env.example`（コミットする）:

```
SITE_URL=https://webmanab.netlify.app
# PUBLIC_GA4_ID=
# PUBLIC_ADSENSE_CLIENT=
```

## 5. 開発ツール

`pnpm view <pkg> version` と `pnpm view <pkg> time` で 2026-10-22 に確認した。公開から 14 日たっていない最新版は避け、2026-10-08 以前の最新を選ぶ。`minimumReleaseAge` を入れるので、`pnpm add` でもこの条件が自動でかかる。

| パッケージ | 最新（公開日） | 採用 | 理由 |
| --- | --- | --- | --- |
| astro | 7.4.2（10-21） | 7.4.x | ブリーフの決定。7.4.0 は 10-15 公開で 14 日たっていない（下の確認事項） |
| @astrojs/check | 0.9.12（10-21） | 0.9.10（07-27） | |
| typescript | 7.0.2（07-08） | 6.0.3（04-16） | 下に理由 |
| @astrojs/sitemap | 3.7.4（08-31） | 3.7.4 | |
| @astrojs/rss | 4.0.19（06-30） | 4.0.19 | |
| eslint | 10.13.0（10-16） | 10.12.0（10-02） | |
| @eslint/js | 10.0.1（02-06） | 10.0.1 | |
| typescript-eslint | 8.72.0（10-19） | 8.71.1（10-05） | |
| eslint-plugin-astro | 3.2.1（09-17） | 3.2.1 | peer: eslint >=10、typescript-eslint >=8.61（optional） |
| eslint-config-prettier | 10.1.8（2025-07-18） | 10.1.8 | |
| globals | 17.13.0（10-01） | 17.13.0 | |
| prettier | 3.9.10（10-10） | 3.9.9（09-23） | |
| prettier-plugin-astro | 1.1.1（10-09） | 1.1.0（09-24） | |
| stylelint | 17.16.0（10-01） | 17.16.0 | |
| stylelint-config-standard-scss | 17.0.0（01-15） | 17.0.0 | peer: stylelint ^17 |
| stylelint-config-recess-order | 7.8.2（10-19） | 7.8.0（08-12） | peer: stylelint-order ^7 \|\| ^8 も入れる |
| postcss-html | 2.0.0（07-31） | 2.0.0 | `.astro` の `<style>` を stylelint にかけるため |
| sass | 1.106.1（10-21） | 1.105.1（09-29） | SCSS を使う場合だけ（アーキテクチャ担当と調整） |
| vitest | 5.0.5（10-15） | 5.0.3（09-30） | peer: vite ^6.4 \|\| ^7 \|\| ^8。Astro 7 の vite は ^8 |
| @playwright/test | 1.64.1（10-14） | 1.64.0（10-07） | |

### TypeScript は 6.0.3 にする

TS 7 は Astro の型チェックでも typescript-eslint でも使えない。

- `@astrojs/check@0.9.12` の peer は `typescript: ^5.0.0 || ^6.0.0`。
- `withastro/astro#17268`（astro check が TS 7 を「入っていない」と判定する）は `triage: unable to fix` で閉じられている（[GitHub issue](https://github.com/withastro/astro/issues/17268)）。
- `typescript-eslint@8.71.1` / `8.72.0` の peer は `typescript: >=4.8.4 <6.1.0`。TS 7 対応は `typescript-eslint#10940` が open のまま。
- `typescript@7.0.2` の `exports["."]` は `./lib/version.cjs` だけで、従来の JS API を出していない（`pnpm view typescript@7.0.2 exports` で確認）。TS 7.0 は API なしで出て、新しい API は 7.1 の予定（[gihyo.jp: TypeScript 7.0が正式リリース](https://gihyo.jp/article/2026/07/typescript-7-0)）。

TS 7 の `tsc` だけを別に使う利点も、このサイトの規模では小さいので、6.0.3 だけにする。

### 設定ファイルの案

ESLint（flat config）:

```js
// eslint.config.js
import js from '@eslint/js'
import astro from 'eslint-plugin-astro'
import prettier from 'eslint-config-prettier'
import { defineConfig, globalIgnores } from 'eslint/config'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default defineConfig([
  globalIgnores(['dist/', '.astro/', 'test-results/', 'playwright-report/']),
  js.configs.recommended,
  tseslint.configs.recommended,
  astro.configs.recommended,
  { files: ['public/sw.js', 'tests/fixtures/legacy-sw.js'], languageOptions: { globals: globals.serviceworker } },
  { files: ['scripts/**', '*.config.*'], languageOptions: { globals: globals.node } },
  prettier,
])
```

型情報を使うルール（type-aware lint）は入れない。`astro check` で型は見るので、lint は速さを優先する。

Prettier: 今の `.prettierrc`（`semi: false` / `singleQuote: true`）の書き方を引き継ぐ。

```json
{
  "semi": false,
  "singleQuote": true,
  "plugins": ["prettier-plugin-astro"],
  "overrides": [{ "files": "*.astro", "options": { "parser": "astro" } }]
}
```

`.prettierignore` には `pnpm-lock.yaml`、`dist/`、`.astro/`、`src/content/posts/` を入れる。記事の Markdown はエクスポーターが出力するもので、Prettier が書き換えると表示が変わるおそれがあるため（エクスポーター担当と調整）。

Stylelint:

```js
// stylelint.config.js
export default {
  extends: ['stylelint-config-standard-scss', 'stylelint-config-recess-order'],
  overrides: [{ files: ['**/*.astro'], customSyntax: 'postcss-html' }],
}
```

`.astro` の `<style lang="scss">` が postcss-html 経由で SCSS として解析されるかは未確認。実装時に試す。

Vitest: `astro/config` の `getViteConfig()` で Astro の Vite 設定を引き継ぐ。対象はエクスポーターの変換、アイキャッチ生成、URL 組み立てなどの純粋な関数。

Playwright: プロジェクトを 2 つに分ける。

- `smoke`: `astro preview` に対して、各ページ種別が 200 で描画される、sitemap / RSS / robots.txt の中身、SW 解除のテスト。CI でも回す。
- `visual`: 旧サイトとの見た目比較。ローカルだけ（6 章）。

## 6. CI

### GitHub Actions

PR と master への push で lint / astro check / vitest / build / Playwright smoke を回す。Netlify の Deploy Preview でもビルドは走るが、lint・型・テストは Netlify では見ないので、Actions は入れる。

```yaml
# .github/workflows/ci.yml
name: CI
on:
  pull_request:
  push:
    branches: [master]

jobs:
  check:
    runs-on: ubuntu-24.04
    env:
      SITE_URL: https://webmanab.netlify.app
    steps:
      - uses: actions/checkout@v7
      - uses: pnpm/action-setup@v6
      - uses: actions/setup-node@v7
        with:
          node-version-file: .nvmrc
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm format:check
      - run: pnpm check
      - run: pnpm test
      - run: pnpm build
      - run: pnpm exec playwright install --with-deps chromium
      - run: pnpm test:e2e
```

- Actions の版（`gh release list` で確認）: `actions/checkout` v7.0.1（07-20）、`actions/setup-node` v7.1.0（10-08）、`pnpm/action-setup` v6.1.0（09-05）。メジャーのタグで指定する。個人のサイトで、SHA 固定にすると更新の PR が増えるため。
- `pnpm/action-setup@v6` が pnpm 10 の `packageManager` を読むことは未確認（README で実装時に確認する）。
- 完了通知は付けない（PR のチェック表示で足りる）。

### 見た目比較はローカルだけ

CI に載せない理由:

- 比較の基準は旧サイトの見た目で、使うのは移行のときだけ。
- 基準画像は macOS で取り、Playwright はスクリーンショット名に OS を含めるので、CI（Linux）とは別物になる。
- 旧サイトはリリースすると `webmanab.netlify.app` から消える。

手順: リリース前に、旧サイト（`https://webmanab.netlify.app` か、2020 のデプロイのパーマリンク `https://5eeb72325bef250008f5cbfd--webmanab.netlify.app`）の各ページ種別を撮っておき、ローカルの `astro preview` と比べる。`.snapshot/html` は `/_nuxt/` の JS と CSS を本番から読むので、スナップショット単体では基準にならない。旧サイトへのアクセスは同時 4 本まで（`workers: 4` 以下）。広告と GA は `mask` する。旧サイトのメニューのターム一覧と関連記事は空なので、そこは比較から外すか、差分として受け入れる（アートディレクション担当と調整）。

Linux で揃えたくなったら `mcr.microsoft.com/playwright:v1.64.0-noble`（タグの存在は確認済み）をローカルの Docker で使う。

### Dependabot / Renovate

Dependabot を使う。Renovate は GitHub App を入れる必要があり、今の運用に足すものが多い。

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: npm
    directory: /
    schedule:
      interval: monthly
    cooldown:
      default-days: 14
    groups:
      dev-tools:
        dependency-type: development
      astro:
        patterns: ['astro', '@astrojs/*']
  - package-ecosystem: github-actions
    directory: /
    schedule:
      interval: monthly
    cooldown:
      default-days: 14
```

- `cooldown` は npm と GitHub Actions で使える（[Dependabot options reference](https://docs.github.com/en/code-security/dependabot/working-with-dependabot/dependabot-options-reference)）。pnpm の `minimumReleaseAge` と同じ 14 日にそろえる。
- pnpm は `package-ecosystem: npm` で扱われ、v7〜v10 に対応（1 章）。
- security updates は今 `paused`。リポジトリに活動があれば再開されるはずだが、未確認。
- 既存の #29 #30 は触らない。リニューアルで `yarn.lock` と Nuxt が消えると、どちらも意味がなくなる。マージ後にユーザーがクローズする（Dependabot が自動で閉じるかは未確認）。

## 7. package.json の scripts 案

```json
{
  "type": "module",
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "check": "astro check",
    "lint": "eslint . && stylelint \"src/**/*.{astro,css,scss}\"",
    "lint:fix": "eslint . --fix && stylelint \"src/**/*.{astro,css,scss}\" --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test --project=smoke",
    "test:visual": "playwright test --project=visual",
    "export:md": "node scripts/export-md.ts",
    "generate:eyecatch": "node scripts/generate-eyecatch.ts",
    "verify": "pnpm lint && pnpm format:check && pnpm check && pnpm test && pnpm build && pnpm test:e2e"
  }
}
```

- Node 26 は `.ts` を型を落としてそのまま実行できるので、スクリプトに tsx などは使わない。ただし enum など型を落とすだけでは動かない構文は使えない。
- `export:md` と `generate:eyecatch` のファイルの場所と引数は、それぞれの担当の計画に合わせて直す。
- `generate:eyecatch` を `prebuild` に入れるかは、アイキャッチ担当の方式（生成物をコミットするか、ビルド時に作るか）で決める。

## 8. ドメイン

### SITE_URL を変えると変わるところ

`SITE_URL` は `astro.config` の `site` に入り、そこから次が決まる。

- canonical（`<link rel="canonical">`）
- OGP の `og:url` と `og:image`。旧サイトは `https://webmanab-html.com/ogp.png` を直書きしていた（`mixins/Head.vue`）
- `@astrojs/sitemap` の出力（`site` が必須）
- `@astrojs/rss` の `site` とアイテムのリンク
- `robots.txt` の `Sitemap:` 行。`public/robots.txt` に静的に置くと切り替わらないので、`src/pages/robots.txt.ts` のエンドポイントで `site` から作る

変わらないもの: 内部リンク（相対パス）、`ads.txt`、Web Share ボタン（実行時の `location.href` を使う）。

### custom_domain（webmanab-html.com）は外したほうがよい

外す操作はしない。提案だけ。

外したほうがよい理由:

1. 今 `webmanab.netlify.app` の全応答に `Link: <https://webmanab-html.com/>; rel="canonical"` が付いている。新サイトの HTML の canonical は `https://webmanab.netlify.app/...` になるので、ヘッダーと HTML で canonical が食い違う。ヘッダー側はパーキングされた他人のページを指している。
2. Netlify の `URL` 変数が `https://webmanab-html.com` を返す（4 章で使わないようにはしてある）。
3. TLS 証明書は 2026-10-16 に切れていて、ドメインが Netlify を向いていないので更新もできない。

外すときの注意:

- Netlify DNS のゾーン（MX、TXT の Google 認証、wp の A）はサイトの custom_domain とは別のもので、チームの DNS 一覧から別の操作で消す（[Manage multiple domains](https://docs.netlify.com/manage/domains/manage-domains/manage-multiple-domains/)）。custom_domain を外すときに UI がゾーンの削除も聞いてくるかは未確認。聞かれたら残す。ドメインを取り戻したときにそのまま使える。
- 外すのは本番リリースの前か同時がよい。外しても今の旧サイトの見た目は変わらない。

### 独自ドメインを付け直すとき

1. レジストラでネームサーバーを Netlify DNS（`dns1.p03.nsone.net` から `dns4.p03.nsone.net`）に向ける。ゾーンを消していればゾーンを作り直す（[Delegate domain to Netlify DNS](https://docs.netlify.com/manage/domains/configure-domains/netlify-name-servers/)）。
2. Netlify の Domain management > Production domains で `webmanab-html.com` を primary domain として追加する。apex を primary にすると `www` は自動で apex に 301 される（[Manage multiple domains](https://docs.netlify.com/manage/domains/manage-domains/manage-multiple-domains/)）。
3. DNS が反映されると HTTPS 証明書が自動で発行される。最大 24 時間かかることがある。
4. `netlify.toml` の `SITE_URL` を `https://webmanab-html.com` に変えてデプロイする。
5. Search Console に新しい sitemap を送る。
6. このとき `webmanab-html.com` に残っている旧 SW が `/sw.js` を取りにきて解除される。

## 9. 旧ファイルの削除と .gitignore

### 削除するもの（追跡ファイル 117 件のうち）

| パス | 扱い |
| --- | --- |
| `yarn.lock` | 削除（`pnpm-lock.yaml` に置き換え） |
| `nuxt.config.js`, `api.config.js`, `webpack.config.js` | 削除 |
| `modules/`, `store/`, `mixins/`, `plugins/`, `layouts/`, `pages/`, `components/` | 削除。見た目の参照元なので、アーキテクチャ / アートディレクション担当が移植を終えてから消す |
| `index.d.ts`, `process.d.ts`, `vue.d.ts` | 削除 |
| `.babelrc`, `jest.config.js`, `test/Logo.spec.js` | 削除 |
| `.eslintrc.js`, `.stylelintrc.js` | 削除（flat config / `stylelint.config.js` に置き換え） |
| `.prettierrc` | 中身を書き換えて残す |
| `.nvmrc` | 中身を `26` に書き換えて残す |
| `assets/sass/**` | Astro 側に移すか消すかはアーキテクチャ担当が決める |
| `static/` | `public/` に移す。`icon.png` は PWA のアイコン生成にだけ使われていたので、使い道がなければ消す（アートディレクション担当と調整） |
| `.editorconfig`, `README.md` | 残す。README は手順を書き直す |

### .gitignore の案

今のファイルは Node のテンプレートと Nuxt 向けの項目が混ざっているので、書き直す。

```gitignore
# dependencies
node_modules/

# build output
dist/
.astro/

# test output
coverage/
test-results/
playwright-report/
blob-report/
playwright/.cache/

# env
.env
.env.*
!.env.example

# tools
.netlify/
.eslintcache
.stylelintcache
*.log

# OS / IDE
.DS_Store
.idea/
```

- `sw.*` は入れない。今の `.gitignore` から消さないと `public/sw.js` がコミットされない。
- `.snapshot/` は `.git/info/exclude` に入っているので、`.gitignore` には書かない。

## 10. リリース手順

### マージの前

1. 旧サイトのスクリーンショットを撮る（6 章）。旧サイトは本番から消えるので、ここでしか撮れない。
2. 専用の Chrome プロファイルで `https://webmanab.netlify.app/` を開き、旧 SW を登録させておく（3 章）。
3. ユーザーが Netlify の custom_domain を外す（8 章。提案どおりにする場合）。
4. PR の Deploy Preview を確かめる。
   - ビルドログ: Node が 26.x、pnpm が 10.34.6 で install されていること。
   - `/`、`/tip/`、`/clip/`、`/lab/`、記事、タームの各ページが 200。
   - `/tip` → 301 `/tip/`、存在しないパスが 404 で `404.html` の中身が出る。
   - 非 ASCII の slug 2 件と `/clip/_prefix/` が 200。大文字の `%E3...` でも開けるか。
   - `/sw.js` の `cache-control: no-cache`、`/_astro/*` の `immutable`。
   - `sitemap`、RSS、`robots.txt`、`ads.txt` の中身。絶対 URL が `https://webmanab.netlify.app` になっている。
   - 広告と GA のタグが HTML にない。

### マージと本番

1. PR を master にマージする。Netlify が本番ビルドを始め、終わると自動で公開される。
2. 2020 年以来のビルドなので、依存のキャッシュで変な失敗をしたら、UI の「Clear cache and deploy site」でやり直す（ユーザーの操作）。

### 公開後の確認

1. Deploy Preview と同じ項目を `https://webmanab.netlify.app` で見る。加えて、広告のスクリプトが出ていること、GA は ID 未設定なので出ていないこと。
2. `curl -I https://webmanab.netlify.app/` で `link: ...rel="canonical"` のヘッダーが消えていること（custom_domain を外した場合）。
3. 用意しておいたプロファイルで旧 SW が解除されること（3 章）。
4. 問題がなければ #29 #30 をユーザーがクローズする。

### 問題があったときの戻し方

- Netlify の Deploys 一覧で戻したいデプロイを開き、「Publish deploy」を押す。新しくビルドはせず、すぐ切り替わる（[Manage deploys: Rollbacks](https://docs.netlify.com/deploy/manage-deploys/manage-deploys-overview/)）。API では `restoreSiteDeploy` があり、`npx netlify-cli@latest api restoreSiteDeploy --data '{"site_id":"b434ac22-fe4b-4874-9a05-01c60a105ecf","deploy_id":"<id>"}'` で同じことができる（書き込みなので、ユーザーが実行する）。
- 戻したあと master に push すると自動公開で上書きされる。直すまでの間は Deploys 一覧の「Lock to stop auto publishing」で止める（API の `lockDeploy` / `unlockDeploy` もある）。
- 戻し先:
  - リリース直後なら 2020 の Nuxt のデプロイ（`5eeb72325bef250008f5cbfd`）。旧 `sw.js` も戻るので、旧 SW がまた登録される。直して再リリースすれば新しい `sw.js` で解除される。
  - 2 回目以降のリリースなら、ひとつ前の Astro のデプロイ。
- デプロイの保持: Netlify は公開中のデプロイと最新の成功した本番デプロイを消さず、それ以外は 30 日で消す（同じページ）。ただし 2019 年のデプロイがまだ残っているので、古いデプロイにこの期限がそのまま当てはまるかは未確認。2020 のデプロイはリリース後に消えるかもしれない前提で、見た目の基準はリリース前に撮っておく。旧サイトの中身は `.snapshot/` にも残っている。
- コードで戻すなら、マージコミットを `git revert` して master に push する。

## 他の担当と調整すること

- アーキテクチャ: `astro.config` の `site` / `trailingSlash: 'always'` / `astro:env` のスキーマ（4 章の案）。`robots.txt` をエンドポイントで作ること。RSS のパスを旧設定と同じ `/feed.xml` にするか。`/_astro/` に長期キャッシュをかけてよいか。`public/sw.js` を置くこと、ページに SW の登録と manifest を入れないこと。`assets/sass` と Nuxt のコンポーネントを消す時期。
- アーキテクチャ / エクスポーター: 非 ASCII の slug 2 件はデコード済みの名前でディレクトリを出す（旧サイトでは 404 だった）。`/clip/_prefix/` のように `_` で始まる slug が Astro の動的ルートで出力されるか。
- エクスポーター: スクリプトの場所と `export:md` の引数。生成した Markdown を Prettier の対象から外すこと。Node 26 の型の除去で動く書き方にすること。
- アイキャッチ: `generate:eyecatch` の場所と、生成物をコミットするかビルド時に作るか。OGP 画像を記事ごとに出すなら、SVG は多くの SNS で使えないので PNG に変換する必要がある（sharp や resvg を使うなら `allowBuilds` に足す）。
- アートディレクション: 見た目比較の対象ページと、比較から外す部分（広告、空になっているメニューのターム一覧と関連記事）。`static/icon.png` を残すか。
- 全員: `minimumReleaseAge` を 14 日にするので、出たばかりの版は `pnpm add` で入らない。

## ユーザーに確認したいこと

- Astro 7.4 系と「出て 2 週間以内の版は避ける」がぶつかっている。7.4.0 は 2026-10-15 公開で、14 日たつのは 10-29。今の案は「7.4 系で進め、`minimumReleaseAgeExclude` に `astro` を入れておき、PR を作る前に外す」。作業が 10-29 より前に終わりそうなら、7.3.8（10-08 公開）で始めて PR の前に 7.4 に上げるほうに変える。
- pnpm を 10.34.6 に固定する案。ローカルの pnpm 11 は Corepack が自動で 10 に切り替えるので、手元の操作は変わらない。理由は 1 章（Netlify の Corepack と Node 26 の問題、Dependabot の対応範囲）。
- Netlify の custom_domain（webmanab-html.com）を外す。理由は 8 章。外す操作はユーザーにお願いしたい。DNS ゾーンは残す案。
- whois では `webmanab-html.com` の登録が GoDaddy で 2027-08-24 まで続いている。ブリーフの「失効」とは違うので、ユーザーの GoDaddy アカウントにまだあるのかを確かめてほしい。アカウントにあるなら、ネームサーバーを戻すだけで再取得はいらない。
- マージ後に Dependabot の #29 #30 をクローズしてよいか。
