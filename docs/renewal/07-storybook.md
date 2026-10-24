# 07 コンポーネントカタログ（Storybook 担当）

担当: Storybook。前提は `00-brief.md` と `README.md`。

コンポーネントを 1 つずつ、状態ごとに表示して確かめる仕組みの計画です。調べた結果、Storybook は入れず、開発のときだけ有効になる Astro のカタログページ（`/catalog/`）を作り、Playwright Test で a11y と見た目と操作を確かめることにしました。

確かめ方の表記:

- 「試作で確認」: scratchpad の試作（`scratchpad/storybook/proto/`。アーキテクチャ担当の試作をコピーして足したもの）で実際に動かしたこと。環境は Node 26.12.1、pnpm 10.34.6、astro 7.4.2、sass 1.106.1、Playwright 1.64.1。
- 「npm で確認」: `pnpm view` で 2026-10-23 に見た版と公開日。「npm にない」としたものは `https://registry.npmjs.org/` でも 404 になることを curl で確かめた。
- 「ソースで確認」: パッケージや GitHub のソースを読んで確かめたこと。
- 「未確認」: 確かめられなかったこと。

## 0. 要約

- Storybook 本体は Astro のコンポーネントを公式には扱えない。コミュニティ製の `@storybook-astro/framework` があり、Astro 7 にも対応をうたっているが、`.astro` の `<style lang="scss">` を dev では読み飛ばし、`storybook build` は SCSS の mixin が見つからずに失敗した（試作で確認）。このサイトのコンポーネントは全部 scoped の SCSS なので使えない。
- 採る方式: `CATALOG=1` のときだけ `/catalog/` のルートを足す小さな Astro の integration を自前で書く。本番のビルドには入らない。カタログのページは本物の Astro のパイプラインで描画されるので、scoped CSS（`data-astro-cid-*`）、SCSS の変数と mixin、素の `<script>` がサイトと同じに動く（試作で確認）。
- テストは Playwright Test で、story ごと・4 幅ごとに、axe の検査とスクリーンショットの比較と操作の確認を回す。2 回続けて回して、スクリーンショットが一致することを確かめた（試作で確認）。
- a11y は直し切らない方針（ユーザーの指示）なので、axe は結果を部品ごとの一覧に出すだけで、違反があってもテストは落とさず、マージも止めない。直し方の方針と件数の推移は qa が受け持つ（10 章）。
- stories は Storybook の CSF3 に近い形（`default.component` と `args`）で書く。将来 storybook-astro が SCSS に対応したら、同じ stories を流用できる。
- qa（08）とは分担に合意した（14 章）。a11y の違反の追跡一覧は 08 が 1 つだけ持ち、07 の結果には 08 の ID を添える。部品単位の件数は `test/a11y/baseline-catalog.json` と比べ、増えたら警告を出す。例外として、08 の A の項目（閉じたメニューと目次の中で Tab が止まらない、メニューの `aria-expanded`、シェアとメニューのフォーカスの枠など。新しいサイトで初めて生まれる問題を防ぐもの）を確かめるテストは、07 と 08 の両方で確かめて、失敗したら止める。

## 1. 調べたこと（2026-10-23 時点）

### 1.1 Storybook 本体の Astro 対応

- 公式のフレームワークはない。`@storybook/astro`、`@astrojs/storybook` は npm にない（npm で確認）。
- Storybook の issue「Support for Astro components」（[storybookjs/storybook#18356](https://github.com/storybookjs/storybook/issues/18356)）は 2022-05 から open のまま。2026-06-08 のコメントで、下の storybook-astro の作者が「Storybook の公式の一部ではないが、Storybook チームの後押しを受けている」と書いている。
- Storybook の最新は 10.6.3（10-20）。14 日ルールで入れられる最新は 10.6.1（09-29）。11.0.0 は alpha.7（npm で確認）。

### 1.2 storybook-astro（`@storybook-astro/framework`）

| 項目 | 内容 |
| --- | --- |
| 最新 | 1.13.0（2026-10-19）。14 日ルールで入るのは 11-02 から。入れられる最新は 1.12.0（09-10） |
| 公開の間隔 | 1.6.0（06-19）から 1.13.0 まで、1〜6 週ごとに minor が出ている |
| 対応の版 | Astro `^5.5.3 \|\| ^6 \|\| ^7`、Storybook `^10`、Vite `^6.4.1 \|\| ^7 \|\| ^8`、Node `>=20.16.0 \|\| >=22.19.0 \|\| >=24.0.0` |
| Vitest | 1.12.0 の peer は `vitest ^4.1.0` だけ。このサイトは Vitest 5 なので unmet peer の警告が出る（試作で確認）。Vitest 5 対応は 1.13.0 から（issue #193） |
| リポジトリ | [storybook-astro/storybook-astro](https://github.com/storybook-astro/storybook-astro)。2026-02 作成、スター 65、コミットはほぼ 2 人。npm の license は MIT |
| 仕組み | コンポーネントはサーバー側で Astro の Container API で描画し、HTML をブラウザに返す。Controls を動かすとサーバーで描き直す。`storybook build` では story を既定の args で事前に描画しておく（その場合 Controls は効かない） |
| 未解決の issue | #189「scoped CSS が global に注入され、Astro と違う当たり方をする」（09-29、open）、#204〜#208「Storybook 11 対応」（10-22、open） |

CSS の扱い（1.12.0 と main の `vitePluginAstroComponentMarker.ts` で確認）:

- dev: `.astro` のソースから `<style>` の中身を読み、scoped の変換をせずに global の `<style>` として差し込む。`lang="scss"` などの前処理が要るブロックは「preprocessed styles are not supported in Storybook dev mode」と警告して読み飛ばす。
- build: 同じくソースの中身をそのまま差し込む。scoped の変換も前処理もしない。

### 1.3 Astrobook

- [ocavue/astrobook](https://github.com/ocavue/astrobook)。Astro の integration として動く、Storybook に似たカタログ。CSF3 の一部（`default.component`、`args`、`decorators`）を読み、story を Astro のページとして出す。MIT、スター 279。
- 最新 0.13.3（08-14）、peer は `astro >=5.0.0`（npm で確認）。リポジトリの最終 push は 09-11。
- Astro のパイプラインで描くので、scoped SCSS も `<script>` もサイトと同じに動く（試作で確認、3 章）。
- ただし story のページは Astrobook の layout の中に入り、次のものが必ず付く（ソースで確認。設定で外す方法はない）。
  - `<html lang="en">`。サイトは `lang="ja"`。Chromium は `lang` で日本語のフォントの選び方が変わるので、見た目の比較に影響しうる。
  - `<ClientRouter>`（View Transitions）。03 の決定（View Transitions を入れない）と違う。story から story へ移ると body だけが差し替わるので、部品の `<script>` が再実行されない可能性がある（未確認）。
  - `body` が `display: flex; max-height: 100%`、`main` が `overflow: auto`。中身が長いとウィンドウではなく `main` がスクロールする（CSS で確認）。ヘッダーの固定と無限スクロールは `window` のスクロールを見ているので、実際のページと動きが変わる。
  - 接頭辞のないセレクタ（`html`、`:root`、`.inline`、`.transform`、`.transition`、`.box-border` など）を含む CSS。今のサイトの class とは重ならない。
- slot を渡す書き方は未対応（issue #174、open）。

### 1.4 Astro の Container API

- `astro/container` の `experimental_AstroContainer`。Astro 7.4.2 でもまだ `experimental_` の名前のまま（試作で確認）。
- Vitest（`getViteConfig()`）の中で `.astro` を HTML の文字列にでき、scoped SCSS の変数と mixin も解決された（試作で確認。`EntryToc` と `Title2` を描画して `data-astro-cid-*` が付くことを確かめた）。
- 返すのは HTML だけで、部品の CSS と `<script>` はページとしては組み立てない。ブラウザで見るには、別に Vite で CSS と script を配る仕組みが要る。

## 2. 候補の比較

| 観点 | (a) storybook-astro | (b) Container API + `@storybook/html-vite` | (c) 自前のカタログページ | (d) Astrobook |
| --- | --- | --- | --- | --- |
| `.astro` をそのまま表示 | できる（サーバーで描画） | できる（HTML として） | できる | できる |
| scoped CSS（attribute） | 効かない。global に差し込まれる | 自前で CSS を配る仕組みが要る | サイトと同じ | サイトと同じ |
| SCSS の変数・mixin | dev は読み飛ばし、build は失敗 | 同上 | サイトと同じ | サイトと同じ |
| 素の `<script>` | dev は動く。build は `_astro/` に入る（ドキュメント） | 自前で配る仕組みが要る | サイトと同じ | 動く。ただし ClientRouter とスクロールの違いがある |
| Node 26 / pnpm 10 | 動いた。Node 26 で `module.register()` の非推奨警告が出る | 未確認 | 動いた | 動いた |
| 14 日ルール | Storybook 系で追加の除外は 0 件。ただし Vitest 5 対応の 1.13.0 は 11-02 まで入れられない | 未確認 | 追加の依存なし | 追加の除外は 0 件 |
| 保守 | 外部の若いパッケージ 1 つと Storybook 本体。Storybook 11 への追従待ちがある | Container API が experimental。つなぎの部分を自分で保守 | 自前のコード 60 行ほど | 外部パッケージ 1 つ。ClientRouter などを外せない |
| a11y と見た目のテスト | addon-a11y と addon-vitest（公式） | addon-a11y と addon-vitest | Playwright Test と `@axe-core/playwright`（08 と同じ道具） | Playwright Test で story の URL を開く |
| 操作画面 | Storybook の UI（Controls、Docs） | Storybook の UI | 一覧のページだけ。幅の切り替えは開発者ツール | サイドバーとテーマ切り替え |

(b) は試作していません。Container API が返すのは HTML だけなので、部品の CSS と script を Storybook のプレビューに届ける部分を自分で作ることになり、それは storybook-astro がやっていることの作り直しになるためです。

(c) と (d) は、テストから見るとどちらも「story の URL を Playwright で開く」だけで同じです。違いは見るための画面だけなので、サイトと違うものが混ざらない (c) を主にしました。stories を Astrobook と同じ CSF3 の形で書いておけば、あとから (d) を足すのも安くできます。

## 3. 試作で確かめたこと

同じ部品（Title2、EntryShare（Title2 を子に持つ）、Loader、Header（`is:global`）、EntryToc、EntryContent（`is:global`、`set:html`）、Article）で (a)、(c)、(d) を動かし、(c) ではさらに SectionEntry（slot あり）と、本文の Markdown を描く見本を足しました。部品は旧 Vue の SCSS を移したもので、`astro.config.mjs` の `additionalData` で変数と mixin を足す 03 の 8.1 の形です。

(a) storybook-astro 1.12.0 + Storybook 10.6.1:

1. `preview.ts` から読む `global.scss` に `additionalData` が届かず、`$base-fontsize` が未定義で落ちた。`viteFinal` で同じ設定を渡すと、そちらは通った。
2. 部品の story を開くと、ブラウザ側は「Skipping `<style lang="scss">` … not supported in Storybook dev mode」と警告し、サーバー側は `$glay` が未定義で描画エラーになった。
3. `storybook build` は `Undefined mixin` で失敗した。途中まで出力された story の JS には、`$glay` を含む SCSS がそのまま入っていた。

(c) 自前のカタログ（`CATALOG=own` で integration を足し、`astro build --outDir dist-own`）と (d) Astrobook（`astro build --outDir dist-catalog`）:

| 確かめたこと | (c) | (d) |
| --- | --- | --- |
| Title2 の scoped SCSS（1080px で italic、21.33px、`#393e46`） | 一致 | 一致 |
| 親（EntryShare）の story の中の子（Title2）の scoped CSS | 効く | 効く |
| Loader の `span:nth-of-type(3)` の `animation-delay` が 0.15s、keyframes 名 | 効く | 効く |
| Header（`is:global`）が 1080px で `position:absolute; display:flex` | 効く | 効く |
| スクロールで Header に `is-fixed` が付く（script） | 付く | 付く（試作では body の高さを足して window をスクロールさせた） |
| 目次の開閉（script）、`::after` が `close` になり `max-height` が 1400px | 動く | 動く |
| シェアボタン非対応時のラベルが `copy link`、押すと `is-copied` と `copied` と status の文 | 動く | 動く |
| Article の画像の `data-lazy` が `loaded` になり opacity 1 | なる | なる |
| 4 幅の Article の幅（375 / 384 / 359.98 / 370px） | 期待どおり | 期待どおり |
| slot に HTML を渡す（SectionEntry） | 渡せる。slot の中身には cid が付かない（Astro と同じ） | 未対応（issue #174） |
| `astro dev` でも同じに動く | 動く | 試していない |
| 通常の `astro build` にカタログが入らない | 入らない（6 ページのまま。カタログ付きは 15 ページ） | 入らない |

テストの試作（`playwright.catalog.config.ts` と `tests/catalog/stories.spec.ts`。本番では `e2e/catalog/` に置く）:

- 7 story × 4 幅の 28 件を、axe の検査とフルページのスクリーンショットの比較で回した。基準を作ったあと 2 回目を回して、スクリーンショットは 24 件すべて一致した（残り 4 件は、このときは axe の違反でテストを落とす書き方にしていたので、比較の前に止まった Article）。
- axe（`@axe-core/playwright` 4.13.0）は、Article 以外は違反なしだった。
- Article は `link-name` の違反が出た。一覧カードの画像のリンク（`.article-item__img-wrap`）が `alt=""` の画像だけを中に持つので、リンクの名前がない。02 の 9.2(a) のとおりに作ると必ず出る（16 章）。
- a11y の方針が「報告だけ」に決まったあと、axe の結果を記録だけしてテストを落とさない形に書き換えた。9 story × 4 幅の 36 件がすべて pass（終了コード 0）になり、`a11y-report.md` に Article の違反が 1 行で出た（10.2）。
- `--ignore-snapshots` を付けると、スクリーンショットの比較だけを飛ばして axe と操作は回せた。
- スクリーンショット 24 枚の合計は 264KB（1 枚 11KB 前後）。

## 4. 採る方式

### 4.1 全体の形

```
astro.config.mjs                 CATALOG=1 のときだけ catalog() を integrations に足す（リーダーの範囲。4.2）
src/catalog/
  integration.mjs                /catalog/ と /catalog/index.json のルートを injectRoute で足す
  Story.astro                    1 つの story を描くページ（getStaticPaths で全 story を出す）
  Index.astro                    story の一覧。4 幅の iframe を横に並べて見られるようにする
  index.json.ts                  テストが読む story の一覧（id、幅、操作、モック）
  fixtures/                      stories に渡す固定のデータ（8 章）
  stories/<Component>.stories.ts 部品ごとの stories
playwright.catalog.config.ts     4 幅を project にした設定。webServer で serve.mjs を起動する
e2e/catalog/
  serve.mjs                      dist-catalog を配るだけの静的サーバー（20 行ほど）
  stories.spec.ts                index.json を読んで、story × 幅ごとに axe（記録だけ）とスクリーンショットと操作
  a11y-summary.mjs               axe の結果を部品ごとの一覧（a11y-report.json / .md）にまとめる
  a11y-ids.json                  「部品/ルール」から 08 の追跡一覧の ID を引く表
  mocks.ts                       navigator.share、clipboard、無限スクロールの JSON の差し替え
  __screenshots__/               基準画像（11 章）
```

- カタログは `CATALOG=1` のときだけ組み込む。`pnpm build`（本番、Deploy Preview）には一切入らない。
- テストは `pnpm build:catalog` の出力（`dist-catalog/`）を `serve.mjs` で配って開く。Playwright の `webServer` が起動と停止をするので、テストの前に手でサーバーを立てなくてよい（試作で確認）。`astro preview --outDir` でもカタログは配れたが、この環境では起動するとすぐ裏に回って（`astro preview stop` で止める形）コマンドが終わってしまい、`webServer` には使えなかった。裏に回る理由は未確認（環境変数 `AI_AGENT` が付いていたので、それを見ている可能性がある）。`astro dev` も同じだった。
- カタログのページは `<html lang="ja">`、`noindex`、サイトと同じ Google Fonts の `<link>` と `global.scss` を読む。部品は `<div class="default-layout catalog">` の中に置く。
- 1 つの `Story.astro` が全部の部品を import するので、カタログのページには全部品の CSS が 1 つのファイルにまとまって入る（試作で確認）。scoped の CSS は他の部品に当たらないが、`is:global` の CSS（Header、Menu、EntryContent など）はどの story にも読み込まれる。実際のサイトでも Header と Menu の CSS は全ページに入るので、差が出るのは EntryContent、EntryAd、EntryDemo の 3 つだけ。02 の 4.8〜4.10 と 11.2 の記述では、この 3 つの global のセレクタは自分の class（`.entry-content__inner`、`.entry-ad`、`.entry_demo`）の下に限られているので、他の story の見た目は変わらないはず（試作では確かめていない）。script は描画した部品の分だけ入る（試作で確認）。
- sitemap: 03 の計画では `src/pages/sitemap.xml.ts` で記事から作るので、カタログは入らない。`@astrojs/sitemap` の integration を使う場合は、カタログのビルドで `/catalog/` が sitemap に入った（試作で確認）ので、`filter` で外す。

### 4.2 リーダーとインフラにお願いする変更

自分の範囲の外にあるので、次の変更はそれぞれの担当にお願いします。

- リーダー（`astro.config.mjs`）: `...(process.env.CATALOG === '1' ? [catalog()] : [])` の 1 行。
- インフラ（`package.json`、`pnpm-workspace.yaml`、`.github/`）:
  - devDependencies に `@axe-core/playwright` 4.13.0 を足す（4.14.0 は 10-15 公開で、10-29 まで入れられない）。`@playwright/test` 1.64.1 は 01 で入る。
  - scripts に `"catalog": "CATALOG=1 astro dev"`、`"build:catalog": "CATALOG=1 astro build --outDir dist-catalog"`、`"test:catalog": "playwright test -c playwright.catalog.config.ts"` を足す。
  - `.gitignore` に `dist-catalog/`、`a11y-report.json`、`a11y-report.md` と、Playwright の出力（`test-results/` など。`e2e/catalog/__screenshots__/` はコミットするので除く）を足す。
  - `minimumReleaseAgeExclude` に、カタログのための追加は要らない（追加の依存が `@axe-core/playwright` だけで、その依存の axe-core 4.13.0 は 08-05 公開）。
  - CI に 13 章の job を足す。

### 4.3 Vitest と Container API の使い道

props から DOM の形が決まるだけの確認（EntryNav が片方だけのとき `li` が 1 つになる、目次の h3 がない項目で入れ子の `ul` を出さない、など）は、ブラウザを使わずに Vitest と Container API で書けます（試作で 2 件動かした）。03 の 10 章の `pnpm test` と同じ設定の中で回せて速いので、こちらに寄せます。ただし API の名前が `experimental_` のままなので、Astro の minor の更新で変わったら直す前提です。置き場所は `test/components/*.test.ts`（03 のテストと同じ `test/` の下）にし、使う fixtures は `src/catalog/fixtures/` と共通にします。

## 5. 置き場所と命名

- stories: `src/catalog/stories/<Component>.stories.ts`。部品の隣（`src/components/`）に置くのが普通だが、README 5 章で `src/components` はリーダーの範囲なので、自分の範囲の `src/catalog/` にまとめた（リーダーの判断で採用）。
- story の id: `<部品の kebab-case>/<story の kebab-case>`。例 `entry-nav/prev-only`。URL は `/catalog/entry-nav/prev-only/`。
- スクリーンショット: `e2e/catalog/__screenshots__/{platform}/{story id の / を -- にしたもの}-w{幅}.png`。例 `darwin/entry-nav--prev-only-w768.png`。

## 6. stories の書き方

Storybook の CSF3 と同じ形（`default` に `component` と共通の `args`、名前付きの export ごとに 1 つの story）にし、カタログ用の項目を `parameters.catalog` に入れます。`parameters.catalog` はデータだけにし、関数を入れません。テストは stories のファイルを import せず（`.astro` を Node で読めないため）、カタログが出す `/catalog/index.json` を読みます。

```ts
// src/catalog/stories/EntryToc.stories.ts
import EntryToc from '../../components/EntryToc.astro'
import { tocItems } from '../fixtures/toc'

export default { component: EntryToc, args: { items: tocItems.typical } }

export const Closed = {}

export const Open = {
  parameters: {
    catalog: {
      steps: [{ click: '.entry-toc__title' }],
    },
  },
}

export const Empty = { args: { items: [] } }
```

`parameters.catalog` に書けるもの:

| 項目 | 内容 |
| --- | --- |
| `steps` | スクリーンショットの前にする操作。`{ click: selector }`、`{ hover: selector }`、`{ focus: selector }`（キーボードの Tab で当てる）、`{ scroll: y }`（window をスクロール）、`{ wait: ms }` |
| `mocks` | `e2e/catalog/mocks.ts` の名前。`share-supported`、`share-unsupported`、`list-pending`、`list-last-page`、`list-empty` |
| `widths` | 撮る幅を絞る。既定は 4 幅すべて |
| `viewportOnly` | `true` ならフルページではなく画面の範囲だけ撮る。fixed の要素が主役の状態（メニューを開いた、ヘッダーの固定、Loader）に使う。02 の 1.1 の状態違いの撮り方と同じ |

slot は `args.slot` に HTML の文字列で渡し、`Story.astro` が `<Fragment set:html>` で流し込みます（試作で確認）。Astro の部品を slot に入れる必要がある story は、その組み合わせだけを描く小さな `.astro` を `src/catalog/fixtures/` に置き、それを `component` にします。

## 7. 部品と状態の一覧

02 の 4〜5 章と 9 章、03 の 1.3 の部品をすべて並べました。「操作」は 6 章の `steps` で作る状態、それ以外は args だけで作る状態です。

| 部品 | story（状態） | 確かめること |
| --- | --- | --- |
| Bar | Default（4 本） | 4 幅で margin が 16 / 32 / 40px。`nth-of-type` に頼るので、Layout の story で確かめる |
| Layout（Bar ×4、Header、Wrapper、Menu をまとめた枠） | Default、MenuOpen（操作） | 02 の 4.1 の DOM の並び。`.menu.is-open + .menu__overlay` |
| Header | Default、Fixed（操作: `scroll: 300`、幅 1080 / 1480）、NotFixedAt768（操作: `scroll: 300`、幅 768） | 02 の 5.2。768px では `is-fixed` が付かない。ロゴの `scale(.85)` |
| Menu / MenuList / MenuTitle | Closed（Tab が中に止まらないこと、`aria-expanded="false"`。10.4）、Open（操作、`viewportOnly`。中のリンクに Tab が届くこと、`aria-expanded="true"`）、FocusVisible（操作。`.menu__btn` の outline）、ManyTerms（操作。clips 156 件で 〜767px の `max-height: 360px` のスクロール）、ItemHover（操作） | 02 の 4.3 と 5.1。閉じたときにボタンだけが右上に出る |
| Wrapper | Default（slot） | padding と margin の 4 幅の値 |
| SectionList | TwoSections（slot） | `::after` のストライプの位置 |
| SectionEntry | Default（slot） | max-width と padding |
| Title1 | Tip、Clip、Lab、Tips（ターム一覧の見出し）、Hover（操作） | リンクが `/tip/` の形。角括弧の線、「All View」 |
| Title2 | Share、Tag、Related | `<br>ー` の改行 |
| Article | Tip、Clip（タイトルが `clipUrl` へ `target="_blank"`）、Lab、LongTitle、EmptyPrimaryTag（空 2 件のケース）、ImageLoading（`data-lazy="loading"` のまま）、ImageHover（操作）、TitleHover（操作） | 02 の 4.6。`::first-letter` の白抜き文字。16:9 の枠 |
| ArticleList | Eight（8 件、無限スクロールなし。トップページの形）、Loading（`list-pending` で Loader が出たまま、`viewportOnly`）、End（`list-last-page` で「End」）、NoMore（8 の倍数でない件数で読み込み口なし）、Empty（`list-empty` で最初から End） | 03 の 4.3 の出し分けの規則。4 幅で 1 / 2 / 3 / 4 列 |
| Loader | Default（`viewportOnly`） | 20 本の棒、keyframes 名の衝突がないこと |
| EntryHead | OneTerm、ManyTerms（折り返し）、LongTitle、TargetHover（操作） | コーナーの線が 768px から出る |
| EntryAd | Placeholder | 本番以外は枠だけ（03 の 9 章）。広告そのものはカタログでは出さない |
| EntryAdFoot | Default | 〜767px で 2 つ目を隠す |
| EntryDemo | Default、Hover（操作） | ドットが矢印に変わる |
| EntryContent | Elements（本文の要素見本、8.2）、Code（hljs の色。空行が先頭にあるもの・ないもの）、RawHtml（dl、style、input、figure、`p > iframe`） | 02 の 6.1 の全要素。768px からの左 1/3 の空き |
| EntryToc | Closed（項目に Tab が止まらない、`inert`。10.4）、Open（操作。項目に Tab が届く）、Many（1400px で切れる量）、Empty（見出しのない tip。枠だけ出る。03 の 2.5） | `::after` の open / close |
| アイキャッチ（tip の本文の後） | Tip | 幅いっぱい、16:9 |
| EntryClipLink | Default、Hover（操作） | ストライプ、clip-path、「visit to」 |
| EntryShare | Unsupported（`share-unsupported`。ラベルが `copy link`）、Copied（`share-unsupported` と操作 click。`is-copied`、ラベル `copied`、status の文）、Supported（`share-supported`。ラベル `share this page`）、FocusVisible（操作 focus。outline） 、Hover（操作） | 02 の 9.1。headless の Chromium には `navigator.share` がないので、`addInitScript` で足す・消す |
| EntryTag | Few、Many（折り返し）、Hover（操作） | 行の高さで作る縦の間隔 |
| EntryRelated | Three、Empty（同じタグの記事がない。枠と見出しだけ出る。03 の 5.1）、LongTitles、Hover（操作） | 768px からの二重線の枠 |
| EntryNav | Both、PrevOnly、NextOnly（next が右に寄る。README 4 章の直し）、HoverPrev（操作）、HoverNext（操作） | 背景のアイキャッチと 70% のグレー、rotateY |
| Eyecatch | Categories（23 カテゴリ × 3 件を一覧のサムネイルの大きさで並べる）、Nav（ナビの背景に入れた見え方。05 のナビ用の変種を作るならそれも） | 05 の 3 章。決定的に作られるので、スクリーンショットで絵柄の変化に気づける |

story の数は約 75、4 幅で約 300 枚のスクリーンショットになる見込みです（幅を絞る story があるので少し減ります）。

部品ではないもの（Head、AdScript、404、記事ページ全体、一覧ページ全体）はカタログに入れません。ページ単位なので 08 の範囲です。

## 8. stories に渡すデータ

### 8.1 方針

- 固定のサンプルを `src/catalog/fixtures/` に作る。`astro:content` の記事データには頼らない。記事の Markdown が変わるたびにカタログのスクリーンショットが変わると、部品の変更による差と見分けがつかなくなるため。
- サンプルの値は実データから代表を選んで写す。タイトルの長さ、日本語、記号（`–` や `『』`）、primaryTag の空、ターム数の多さなど、実データにある極端な値を拾う。写した元は fixtures のコメントに記事の `type/slug` で書く。
- 型は 03 の `src/lib/schema.ts` の型と合わせ、fixtures が型検査（`astro check`）を通るようにする。スキーマが変わったら fixtures が型エラーになって気づける。

### 8.2 本文の要素見本

`src/catalog/fixtures/body-elements.md` に、02 の 6.1 の要素をすべて含む Markdown を 1 本書きます。`h2`〜`h5`、段落の中の `<br>`、インラインの `code`、`pre`（先頭に空行があるもの・ないもの、末尾の改行が 1・2・3 つ）、`h4 + pre` / `h4 + ol` / `h4 + ul` / `h4 + dl`、`dl` と `dd + dt`、入れ子のリスト、`ol`、`strong`、リンク、`blockquote`、`figure`、`p > iframe`、`style`、`input`。

- コードブロックは fenced code で、info string は旧来の class（`js`、`bath`、`scss` など）にする。03 の 2.4 と同じ描画で、highlight.js 10.1.1 の色が付く。
- `.md` を直接 import して `compiledContent()` を呼ぶと、`astro.config.mjs` の Markdown の設定（Sätteri と 2 つの hast プラグイン）で描画された HTML が得られる。試作で、`h2` に `id="a0"`、fenced code に `<pre class="hljs"><code class="bath">` が付き、先頭の空行が残ることを確かめた。この HTML を `EntryContent` に渡す。
- `p > iframe` の中身（jsfiddle）はテストのときに `page.route` で空のページに差し替える。外部のサイトに頼らないため。

### 8.3 アイキャッチ

- 05 の `renderEyecatch()` を固定の id で呼び、23 カテゴリ × 3 件を作る。05 のサンプルと同じく、実記事の id を使い、実記事が 3 件に満たないカテゴリは 90001〜90003 で補う。
- Article や EntryNav の story では、`/eyecatch/{type}/{id}.svg` をそのまま使う（カタログのビルドにも静的エンドポイントが入るので、URL は本番と同じになる）。

## 9. 4 つの幅

- `playwright.catalog.config.ts` で、375 / 768 / 1080 / 1480 の 4 つを project にする（高さは 900）。02 の基準と同じ幅。
- 既定ではすべての story を 4 幅で撮る。幅で意味が変わる状態は `widths` で絞る（例: Header の Fixed は 1080 と 1480、NotFixedAt768 は 768）。
- 開発中に目で見るときは、`/catalog/` の一覧から story を開くと 4 幅の iframe が横に並ぶページを用意する。開発者ツールの幅の切り替えでも見られる。

## 10. a11y の自動チェック（報告だけ）

ユーザーの指示（リーダー経由）により、このリニューアルでは a11y を直し切りません。07 でやるのは、部品ごとの違反を見える形にし、件数が増えたら警告を出すところまでです。違反の追跡一覧と直し方の方針は qa（08）が持ちます。

### 10.1 検査のしかた

- `@axe-core/playwright` 4.13.0（中の axe-core も 4.13.0）で、story ごと・幅ごと・`steps` のあとに、`.default-layout` の中だけを検査する。
- タグは `wcag2a`、`wcag2aa`、`wcag21a`、`wcag21aa`、`wcag22aa` の 5 つ。部品単体では判定できない `document-title` と `html-has-lang` を外す。`best-practice`（`heading-order`、`region` など、ページの構造を見るルールが多い）は 07 では走らせず、08 のページ単位の検査だけが拾う。08 の 2.7 と同じ内容（qa と合意）。axe-core 4.13.0 では `wcag22aa` のルールは `target-size` だけだった（試作で確認）。
- 版を上げるときは 07 と 08 で同時に上げる。08 は旧サイトの件数をこの版で取り直して基準にしているため（qa と合意）。
- 状態を変えたあと（メニューを開いた、目次を開いた、コピーした）にも検査する。開いたメニューの中のコントラストなどは、閉じた状態では見えないため。

### 10.2 結果の出し方

- 違反があってもテストは落とさない。試作で、違反がある状態で 36 件すべて pass、終了コード 0 になることを確かめた。
- story × 幅ごとに `test-results/a11y/<story>--<幅>.json` を書く（story、幅、axe の版、違反の一覧（ルール、impact、WCAG の項目、要素のセレクタ））。
- テストのあとに `e2e/catalog/a11y-summary.mjs` が 2 つのファイルを出す。
  - `a11y-report.json`: 08 の比べるスクリプト（`scripts/a11y-compare.ts`）がそのまま読める形にする（qa と合意）。キーは「story@幅」、値は「ルール → 要素の数」。例 `{ "axeCore": "4.13.0", "pages": { "article/tip@375": { "link-name": 1 } } }`。impact やセレクタは `details` という別のキーに入れる。
  - `a11y-report.md`: 人が読む一覧。列は「部品、ルール、影響（critical / serious / moderate / minor）、WCAG の項目、08 の ID、出た story、出た幅、要素」。同じ部品・同じルールの違反は 1 行にまとめる。
- 試作で出た一覧（ID の列を足す前のもの）:

  | 部品 | ルール | 影響 | WCAG | story | 幅 | 要素 |
  | --- | --- | --- | --- | --- | --- | --- |
  | article | link-name | serious | wcag2a wcag244 wcag412 | article/tip | w1080 w1480 w375 w768 | `.article-item__img-wrap` |

- Playwright の HTML レポートにも、違反のあった test に `a11y` の注記を付ける。ローカルでは `pnpm test:catalog` のあとに `a11y-report.md` を開けば一覧が見られる。CI での見せ方は 13.1。

### 10.3 件数の基準と 08 の追跡一覧（qa と合意、リーダー決定）

- 数える単位は「story@幅 × ルール → 要素の数」。08 の「ページのキー@幅 × ルール → 要素の数」と同じ形。
- 基準は `test/a11y/baseline-catalog.json` にコミットする。旧サイトには部品の単位がないので、カタログを最初に CI で回した結果をそのまま基準にする。08 の基準（`test/a11y/baseline.json`、旧サイトの件数）とは別のファイル。
- 比べ方は 08 と同じ `scripts/a11y-compare.ts` を使う。増えたら GitHub の `::warning` と job summary に出す（マージは止めない）。減ったら同じコミットで基準を下げる。基準を上げるのは、08 の追跡一覧に ID と理由を書いたときだけ。
- 違反の追跡一覧は 08 の 1 つだけ。07 は `A11Y-xx` の ID で参照する。対応は `e2e/catalog/a11y-ids.json`（`{ "article/link-name": "A11Y-02" }` のように「部品/ルール」から ID を引く表）に書き、`a11y-report.md` の「08 の ID」の列に出す。表にない違反は「未登録」と出し、qa に 08 の一覧への追加を頼む。
- 例: 一覧カードの画像リンクの `link-name` は、旧サイトにもある違反（トップ 24 件、一覧 8 件。qa の監査）なので、このリニューアルでは直さず `A11Y-02` として報告に残す。直す方針（tip / lab は `aria-hidden="true"` と `tabindex="-1"`、clip は `aria-label`）は 08 の一覧に書かれ、公開後の段階 1 で直す。

### 10.4 リニューアルで防ぐもの

新しいサイトで初めて生まれる問題は、このリニューアルで防ぎます（README 3 章 14、08 の 2.4 の A）。axe では出ないものが多いので、部品の story の操作のテストで確かめます。08 の E2E もページで同じことを見ます。clip の「visit to」のリンクの名前（A-4）は axe で見るので、報告に出るだけです。マージを止めるかどうかの分け方は表の下に書きました。

| 08 の ID | 部品 | story で確かめること |
| --- | --- | --- |
| A-1 | Menu | Closed: Tab を押し続けても `.menu__inner` の中にフォーカスが入らない。`.menu__inner` に `inert` がある。Open: 中のリンクに Tab が届き、`inert` が外れる |
| A-2 | Menu | `.menu__btn` が `<button>` で、`aria-controls` があり、`aria-expanded` が閉じて `false`、開いて `true` |
| A-3 | EntryToc | Closed: 項目のリンクに Tab が止まらない。`.entry-toc__list` に `inert` がある。Open: 項目のリンクに Tab が届き、`inert` が外れる。見出しは `<a href="#">` のままなので `aria-expanded` は見ない |
| A-5 | EntryShare、Menu | FocusVisible: Tab で来たとき outline が 0 でない（`#f50057` の 2px、`outline-offset: 4px`）。目次の見出しは `<a>` のままなので対象外 |
| （clip の「visit to」） | EntryClipLink | リンクの名前があること。axe の `link-name` の結果で見る |

- A-1 の試作で確認: 02 の今の CSS のように `transform` で画面の外に出すだけだと、30 個のリンクのメニューで Tab が 30 回メニューの中に止まった。閉じているあいだ `.menu__inner` に `inert` を付け、開いたら外す形にすると 0 回になり、開いたあとは中のリンクに届いた。見た目は変わらない。
- A-3 の試作で確認: 目次を閉じた状態で Tab を押すと、4 つの項目のリンクすべてにフォーカスが止まった。閉じているあいだ `.entry-toc__list` は `opacity: 0` なので、見えないリンクにフォーカスが行く。旧サイトは閉じた状態の DOM で `<ul>` が空だった（02 の 4.12）ので、これは新しいサイトで初めて生まれる問題に当たる。
- A-3 は README 3 章 14 で、閉じているあいだ `.entry-toc__list` に `inert` を付けることだけがリニューアルに入った。目次の見出しは `<a href="#">` のまま残し、button にして `aria-expanded` と `:focus-visible` を付けるのは公開後（A11Y-14）。そのとき EntryToc の story に `aria-expanded` と outline の確かめを足す。
- この表の A の項目を確かめるテスト（閉じたメニューと目次に Tab が止まらない・開くと届く、メニューの `aria-expanded`、シェアとメニューの outline）は、すべてマージを止める（README 3 章 14）。マージを止めないのは axe の自動チェックの報告だけ（A-4 もここに入る）。
- `<a>` から `<button>` に変わっても見た目が変わらないことは、Closed / Open の基準画像で確かめる。

## 11. 見た目のスナップショット

- Playwright の `toHaveScreenshot` で、story × 幅ごとに撮って前回の基準と比べる。比べる相手は「前回の自分」で、旧サイトではない（旧サイトとの比較は 08 と 02 の 10 章）。
- 設定: `animations: 'disabled'`（transition は最後の状態まで進み、無限のアニメーションは最初に戻る）、`caret: 'hide'`、撮る前に `document.fonts.ready` を待つ。
- 基準画像はファイル名に `{platform}` を入れる。macOS（darwin）の基準をコミットし（リーダー決定。手元に基準がない人も同じ基準で部品の回帰を比べられるようにするため）、比較はローカルの macOS で行う。マージは止めない。理由は 01 の 6 章と 02 の 12 章と同じで、日本語のフォントが OS で変わるため。
- 量の目安: 試作では 1 枚 11KB 前後だった。約 300 枚で数 MB の見込み（本番の部品はアイキャッチや本文が入るので、もっと大きくなる。未確認）。
- 基準を作り直すのは、見た目を変えるつもりのコミットだけ。そのコミットで `pnpm test:catalog -u` を走らせ、変わった画像を同じコミットに入れる。差分のレビューは GitHub の画像の差分表示で見る。
- Chromatic などの有料サービスは使わない。

## 12. 操作のテスト

- `steps` で作る状態は、スクリーンショットと axe の前提として使うだけでなく、class や文言が変わったことも確かめる（例: 目次の `is-open`、シェアの `is-copied` と status の文、ヘッダーの `is-fixed`）。何を確かめるかは `stories.spec.ts` の中で部品ごとに書く。axe と違って、こちらは失敗したらテストを落とす（部品が動かないことはマージを止める理由になるため）。
- 無限スクロールは、`page.route('**/data/**')` で JSON を差し替えて、Loader が出る・End が出る・読み込み口が消える、の 3 つを確かめる。実際の JSON を読んで最後まで行く通しのテストは 08 の範囲。
- シェアは `navigator.share` がある場合とない場合を `addInitScript` で作る。`AbortError` のときに何も起きないことも、モックで `AbortError` を投げて確かめる。

## 13. ビルドと CI

### 13.1 GitHub Actions

01 の 6 章の `check` job とは別に、`catalog` job を足す案です（インフラ担当の範囲）。

```yaml
  catalog:
    runs-on: ubuntu-24.04
    steps:
      - uses: actions/checkout@v7
      - uses: pnpm/action-setup@v6
      - uses: actions/setup-node@v7
        with:
          node-version-file: .nvmrc
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm build:catalog
      - run: pnpm exec playwright install --with-deps chromium
      - run: pnpm test:catalog --ignore-snapshots
      - if: always()
        run: |
          node e2e/catalog/a11y-summary.mjs
          cat a11y-report.md >> "$GITHUB_STEP_SUMMARY"
      - if: always()
        uses: actions/upload-artifact@v4
        with:
          name: a11y-report
          path: |
            a11y-report.json
            a11y-report.md
```

- `test:catalog` は `webServer` で `serve.mjs` を起動するので、job の中でサーバーを立てる step は要らない。
- この job でマージを止めるのは、カタログのビルドが落ちたときと、操作のテスト（12 章）が落ちたときだけ。axe の違反ではテストが落ちないので、job も落ちない。
- axe の一覧は、PR の checks から開ける job summary に表で出し、json を artifact に上げる。あわせて `scripts/a11y-compare.ts` で `test/a11y/baseline-catalog.json` と比べ、増えたら `::warning` を出す（10.3）。どれもマージは止めない。`actions/upload-artifact` の版は未確認なので、インフラ担当が 01 の 6 章と同じく `gh release list` で確かめて決める。
- CI では `--ignore-snapshots` を付け、axe と操作だけを回す（試作で、この指定でスクリーンショットだけが飛ばされることを確認）。Linux と macOS ではフォントが違い、macOS の基準と比べられないため。
- CI でも見た目を比べたくなったら、`mcr.microsoft.com/playwright:v1.64.1-noble`（タグの存在を確認済み）でローカルに Linux の基準を作り、`linux/` の下に別に持つ。今回はやらない。
- 実行時間は未確認。試作の 28 件は 9 秒だった。

### 13.2 Netlify に公開するか

公開しません（リーダー決定）。カタログは開発のときに `pnpm catalog` で見るもので、見る人もサイトの持ち主だけだからです。あとで公開したくなったら、別の Netlify サイトを作って `pnpm build:catalog` の出力を置くのが本番と混ざらない形ですが、Netlify の設定の変更になるので、そのときにユーザーとインフラ担当と決めます。

## 14. qa（08）との分担（合意済み）

qa と 4 回やりとりし、残った点はリーダーが決めて、次のとおり合意済みです。a11y の範囲の変更（直し切らない、axe は報告だけ、旧サイトの件数より増えていないかを見る）は、リーダーから両方に来た指示に合わせています。

| | 07（この計画） | 08（qa） |
| --- | --- | --- |
| 単位 | 部品 1 つ、状態 1 つ | ページ、サイト全体 |
| 状態の網羅 | 部品の状態（7 章）。Share の分岐（あり / なし / コピー後 / `AbortError`）、Menu と Toc の開閉、無限スクロールの出し分けの細かい組み合わせ | 実ページで 1 回押して動くこと。スクロール量、ヘッダー固定との重なり、bfcache から戻ったとき |
| a11y | 部品の中の axe（5 つのタグ、2 つのルールを外す）。報告だけで、件数は `test/a11y/baseline-catalog.json` と比べて警告を出す。結果には 08 の ID を添える（10 章） | ページ全体の axe（ルールを外さない）。追跡一覧と ID、直す方針、旧サイトより件数が増えていないかの確認 |
| 今より悪くしない例外 | 08 の 2.4 の A（閉じたメニューと目次に Tab が止まらない、メニューの `aria-expanded`、シェアとメニューの button の outline）を Menu、EntryToc、EntryShare の story で（10.4） | 同じことをページの E2E で |
| 見た目 | 前回の自分との回帰。ローカルの macOS だけで、マージを止めない | 旧サイトの基準 64 枚、computed style、コードブロックの高さ。ローカルの macOS だけ |
| URL・SEO・ビルド出力 | 持たない | URL 一覧、sitemap、RSS、canonical、構造化データ、HTML の妥当性。CATALOG なしの本番ビルドに `/catalog/` が出ていないこと、sitemap に入っていないこと |
| 単体テスト | Container API で部品の DOM の形だけ（4.3、`test/components/`） | `src/lib` の関数、コンテンツの検査（`test/`） |
| 置き場所 | `e2e/catalog/`、`playwright.catalog.config.ts`、`test:catalog` | `e2e/smoke`、`e2e/visual`、`test/` |
| CI | ビルドと操作のテストで止める。axe は job summary と artifact に出すだけ。スクリーンショットは回さない | 08 で決める |

合意した細かい点:

1. 版は `@playwright/test` 1.64.1、`@axe-core/playwright` 4.13.0（axe-core 4.13.0）。08 は旧サイトの監査をこの版で取り直して基準にしている。上げるときは 07 と 08 で同時に上げる。旧サイトが消えたあとは取り直せないので、版を上げる前に新サイトの件数で基準を置き直す（08 が行う）。
2. タグは 08 が `wcag2a`、`wcag2aa`、`wcag21a`、`wcag21aa`、`wcag22aa`、`best-practice` でルールを外さない。07 は `best-practice` を除いた 5 つで、`document-title` と `html-has-lang` を外す（10.1、08 の 2.7）。
3. スクリーンショットの回帰はローカルの macOS だけ。Linux の基準は持たない（更新の手間が 2 倍になるわりに、日本語のフォントが違うので見た目の確認には使いにくいため）。
4. テストの置き場所は 08 にそろえて `e2e/catalog/`（`tests/` と `test/` が並ぶのを避ける）。
5. 一覧カードの `link-name` は旧サイトにもある違反なので、今回は直さない。08 の `A11Y-02` として追跡し、07 は報告に ID を添えるだけにする。
6. 違反を数える単位は「story@幅 × ルール → 要素の数」で、08 と同じ形。07 の基準は `test/a11y/baseline-catalog.json`（カタログを最初に CI で回した結果）、08 の基準は `test/a11y/baseline.json`（旧サイト）。比べるのは同じ `scripts/a11y-compare.ts`（10.3）。
7. カタログの基準スクリーンショットはコミットし、カタログは Netlify に公開しない（リーダー決定）。

## 15. 実装の順番とコミットの切り方

README 5 章の手順に次のように差し込みます。カタログは `CATALOG=1` のときだけ組み込まれるので、どの時点でも `pnpm build` と `pnpm test` は壊れません（試作で、通常のビルドにカタログが入らないことを確認）。

| README の手順 | カタログ側のコミット |
| --- | --- |
| 1. 土台 | インフラ担当に、`@axe-core/playwright`、scripts、`.gitignore` を土台のコミットに入れてもらう（4.2） |
| 3. レイアウトと共通部品の直後 | カタログの土台: `src/catalog/`（integration、Story、Index、index.json）、`playwright.catalog.config.ts`、`e2e/catalog/`（`serve.mjs` を含む）、Bar / Layout / Header / Menu / Wrapper / Title1 / Title2 の stories と基準画像。リーダーに `astro.config.mjs` の 1 行を入れてもらう |
| 4. コンテンツの受け口のあと | fixtures の型を `src/lib/schema.ts` に合わせる |
| 5. Markdown の描画のあと | EntryContent の stories（本文の要素見本、コード、生 HTML）と基準画像 |
| 7. 記事ページのあと | EntryHead、EntryAd、EntryAdFoot、EntryDemo、EntryToc、EntryClipLink、EntryShare、EntryTag、EntryRelated、EntryNav の stories。Container API のテスト（4.3） |
| 8. 一覧ページのあと | Article、ArticleList、Loader、SectionList、SectionEntry の stories と、無限スクロールのモック |
| 10. アイキャッチのあと | Eyecatch の stories。Article と EntryNav の基準画像をアイキャッチ入りに作り直す（別のコミットにする） |
| 12. 旧サイトとの比較の前 | 全 story を 4 幅で回し、`a11y-report.md` を qa に渡す（qa の方針と件数の基準の材料）。CI に `catalog` job を足してもらう |

- コミットは手順ごとに 1 つ。stories と、その stories の基準画像は同じコミットに入れる。
- 部品の見た目を変えるコミットでは、基準画像の更新を同じコミットに入れる。部品を変えずに基準画像だけが変わるコミットは作らない（作るなら理由を本文に書く）。
- 作業は README 8 章のとおり git worktree の自分のブランチで行い、リーダーが `renewal/astro` に取り込む。

## 16. 他の担当に確認したいこと

### 16.1 qa

- 一覧カードの画像リンクの `link-name` は、08 の `A11Y-02` として扱うことで合意済み。直す方針（tip / lab は `aria-hidden="true" tabindex="-1"`、clip はタイトルのリンクが外部サイトなので `aria-label`）は 08 の一覧に書かれる。
- メニューは今回 `inert` と `aria-expanded` 付きの `<button>` にし、目次は `.entry-toc__list` の `inert` だけにする（README 3 章 14）。目次の見出しの button 化（A11Y-14）と、メニューを開いたときのフォーカスの移動や Esc（A11Y-13 の残り）は公開後に直す。

### 16.2 リーダーとインフラ

- リーダーの判断で次の 3 つが採用済み。実装はリーダーの範囲で行う。
  - 閉じているあいだ `.menu__inner` と `.entry-toc__list` に `inert` を付け、メニューの開閉を `aria-expanded` 付きの `<button>` にし、シェアとメニューの button に `:focus-visible` の outline を付ける（10.4、README 3 章 14）。目次の見出しは `<a href="#">` のまま。07 と 08 の両方のテストで確かめる。
  - stories を `src/catalog/stories/` に置く（5 章）。
  - `astro.config.mjs` に、`CATALOG=1` のときだけカタログを足す 1 行を入れる（4.2）。
- インフラ: 4.2 の依存・scripts・`.gitignore`、13 章の CI の job。

## 17. ユーザーに確認したいこと

1. Storybook は入れず、自前のカタログ（`/catalog/`、開発のときだけ）にする。理由は 0 章と 3 章のとおりで、今の Storybook の Astro 対応では scoped の SCSS が描画できないため。Storybook の画面（Controls や Docs）はなくなる。

カタログを Netlify に公開しないこと（13.2）と、基準画像（macOS、約 300 枚）をコミットすること（11 章）は、リーダーが決めました。

## 18. 未確認のこと

- storybook-astro 1.13.0 で状況が変わるか。1.13.0 は 11-02 まで入れられないので試していない。ソースの main（10-23 時点）では SCSS の扱いは変わっていない。
- Astrobook で story から story へ移ったとき、部品の `<script>` が再実行されるか。
- 本番の部品での、スクリーンショットの合計の大きさと CI の実行時間。
- Linux（CI）での日本語フォントと、それによる見た目の差。
- Container API の名前（`experimental_AstroContainer`）が、今後の Astro の minor で変わるか。

## 19. 試作の置き場所

`proto/` はリーダーが `.snapshot/prototypes/storybook/proto/`（コミットしない場所）に移した（README 8 章）。次のセッションではそちらを見る。作業したときの場所は scratchpad（このセッションのもので、消えることがあります）: `scratchpad/storybook/`

- `proto/`: アーキテクチャ担当の試作のコピーに、試作用の部品、`src/catalog/`（自前のカタログ）、`.storybook/`（storybook-astro）、Astrobook の設定、`playwright.catalog.config.ts`、`tests/catalog/`（`stories.spec.ts`、`menu.spec.ts`、`serve.mjs`、`a11y-summary.mjs`）、`tests/container.test.ts` を足したもの（本番の置き場所は 4.1 のとおり `e2e/catalog/` と `test/components/`）。`a11y-report.md` は試作で出た一覧。`pnpm-workspace.yaml` には、Astro 7.4.2 とその依存（`@astrojs/*`、`@rolldown/*`、`@oxc-project/*`、`vite`、`sass`）と Playwright を 14 日ルールの除外に入れてある。Storybook と Astrobook のために足した除外はない。
- `checks/`: 描画と CSS と script を比べた Playwright のスクリプト（`compare.mjs`、`dev.mjs`、`share.mjs`）。
- `sb-dev.log`: storybook-astro の dev のログ（SCSS の読み飛ばしと描画エラー）。

試作のコードは書き捨ての処理を含むので、実装のときはそのまま移さず、この計画に沿って書き直します。
