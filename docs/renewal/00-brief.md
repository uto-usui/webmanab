# webmanab リニューアル 共通ブリーフ

各担当（インフラ / アートディレクション / アーキテクチャ / Markdown エクスポーター / アイキャッチ生成）が共通で前提にする事実と決定事項。

## ゴール

- Nuxt 2.12 + headless WordPress の構成を Astro に置き換える。
- 見た目は変えない。例外はこのファイルの「決定事項」に書いたものだけ。
- ホスティングは Netlify のまま（サイト名 `webmanab`、site_id `b434ac22-fe4b-4874-9a05-01c60a105ecf`）。
- PR は 1 本。ローカルで全部仕上げてから作る。

## わかっている事実

- WordPress（`wp.webmanab-html.com`）と独自ドメイン `webmanab-html.com` はどちらもつながらない。ドメインは GoDaddy で失効したあと、ParkLogic でパーキングされている。
- 記事データは、Netlify に残っていた最後のデプロイ（2020-06-18、`9767b0f`）の生成済み HTML から取り出してある。
  - `.snapshot/html/**/index.html`: 1321 ページ。各ページの `window.__NUXT__` に Vuex の state が入っている。
  - `.snapshot/inventory.json`: posts（type/slug ごと）、terms、featured。
  - `.snapshot/sitemap.xml`、`.snapshot/urls.txt`、`.snapshot/sw.js`、`.snapshot/404.html`
  - `.snapshot/` は `.git/info/exclude` で除外してある。コミットしない。
- 記事数: tip 165 / clip 817 / lab 48。本文がある記事は 859 件。ターム: tips 107 / clips 156 / labs 24。
- 本文 HTML によく出る要素: p 1966, code 1864, li 1448, br 830, pre 761, ul 701, h3 478, h4 401, h2 346, dd 337, dt 336, a 302, strong 133, dl 67, iframe 59, img 38, ol 26, em 8, input 3, style 2, blockquote 1, h1 1
- `code` の class が言語名として使われている: js 148, bath 56（bash の打ち間違い）, html 49, ts 38, css 27, bash 18, scss 15, xml 7, sass 6, CSS 4, json 3, yml 2, php 2, HTML 1, shell 1
- `__NUXT__` の評価: `<script>window.__NUXT__=(...)</script>` を node の `vm` で空のコンテキストで評価する。例は `scratchpad/inventory.cjs`
- 単一記事ページの `images` は旧実装の変換バグで壊れている。一覧ページ側には `_embed` 付きの画像情報が入っている。
- 旧サイトでは、メニューのターム一覧と関連記事はブラウザから WP API を呼んでいたので、今は空になっている。
- Netlify の現在の設定（`npx netlify-cli api getSite` で確認）: build `yarn generate`、publish `dist`、build image `noble`、custom_domain `webmanab-html.com`。`netlify` コマンドはパスに入っていないので、`npx netlify-cli@latest` で使う（ログイン済み）。
- ローカルの Node は v24.19.0。最新は v26.12.1（current）、LTS は v24.22.1。

## 決定事項（ユーザー合意済み）

- フレームワークは Astro（7.4 系）、静的出力。Vue は使わない。動く部分は素の `<script>` で書く。
- Node は最新（26 系）を使う。パッケージ管理は pnpm。
- 記事は Markdown で持つ。WordPress の HTML から Markdown に変換するエクスポーターを作る。
- 画像は復元しない。本文中の `<img>` は落としてよい。
- アイキャッチはカテゴリごとにジオメトリックな SVG を生成する仕組みを作る（下の「アイキャッチ」参照）。
- シェアボタンは廃止。Web Share API（`navigator.share`）を開くボタン 1 つにして、非対応のブラウザでは URL コピーにする。
- GA は UA を削除。GA4 は環境変数で ID を受け取り、未設定ならタグを出さない。ID はあとで用意する。
- AdSense（`ca-pub-2691922878827958`、`ads.txt`）は残す。
- PWA はやめる。旧 Service Worker を消すための `sw.js` を同じパスに置く。
- サイトの URL は環境変数 `SITE_URL` ひとつで切り替える。当面は `https://webmanab.netlify.app`。ドメインはユーザーが再取得を検討中。
- URL は全部維持する: `/`, `/{tip,clip,lab}/`, `/{tip,clip,lab}/<slug>/`, `/{tips,clips,labs}/<term_id>/`

## 担当どうしの受け渡し形式（叩き台）

各担当はこの形式を前提にして、変えたほうがいいと判断したら理由をつけて報告すること（勝手に変えない）。

記事ファイル: `src/content/posts/{tip,clip,lab}/<file>.md`

```yaml
---
id: 2883                       # WP の post id
type: tip                      # tip | clip | lab
slug: nuxt-static-site-tips    # URL に使う元の slug（デコード済みの文字列）
title: "Nuxt.js でアトミックデザインの静的サイトを作るまでの Tips 集 -『Nuxt』"
date: 2020-03-22T00:26:34+09:00
excerpt: "..."                 # プレーンテキスト
primaryTag: Nuxt               # ACF primary-tag（アイキャッチと関連記事の基準）
terms:                         # その type のタクソノミー（tips / clips / labs）
  - { id: 366, name: nuxt, slug: nuxt }
clipUrl: https://...           # clip のみ
demoUrl: https://...           # tip で demo-true のときのみ
legacy:                        # 検証用。旧サイトの前後記事
  prev: dart-sass-with-nuxt
  next: null
---
```

ターム一覧: `src/content/terms/{tips,clips,labs}.json` → `[{ id, name, slug, count }]`

## サイトの見た目の手がかり（アイキャッチとシェアボタンのデザイン用）

- 色: primary `#f50057`、secondary `#ffd740`、third `#2a8379`、white `#eeeeee`、black `#222831`、gray `#393E46`
- モチーフ: 6px の二重線（`border: 6px double`）、45 度のストライプ（`repeating-linear-gradient(45deg, transparent 4px, #222831 5px)`）、ドットパターン、`-5px 5px 0` のずらした影、角括弧のようなコーナー線、斜体の Open Sans、大文字、`ー` の区切り
- 一覧のサムネイルは 16:9。

## 全担当共通のルール

- 追跡ファイルを編集しない。書いてよいのは自分の担当の計画書（`docs/renewal/0N-*.md`）と、指示された置き場所だけ。
- git の操作（commit / branch / stash など）をしない。
- リポジトリに依存パッケージを入れない。試作は scratchpad の自分用のディレクトリでやる: `scratchpad/<担当名>/`
- Netlify には書き込まない（deploy、設定変更、env の変更をしない）。読み取りだけ。
- `webmanab.netlify.app` へのアクセスは同時 4 本までにする。
- 計画書は日本語で、平易な文で書く。体言止めの連打、`——`、飾りの太字、意味のないカタカナ語を使わない。
- 推測で書かない。確認できることは確認してから書く。確認できなかったことは「未確認」と書く。
