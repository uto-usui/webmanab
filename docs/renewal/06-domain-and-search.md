# 06 ドメインの移転と Google 検索での評価

`webmanab-html.com` を失ったので、同じコンテンツを新しいドメインで出し直します。そのとき Google 検索でどう扱われるか、何をすればよいかをまとめます。

## 1. 旧ドメインの今の状態（2026-10-22 に確認）

- 第三者が登録している（RDAP: 登録者側は GoDaddy、期限 2027-08-24、最終更新 2026-10-08、ネームサーバーは ParkLogic）。
- ブラウザで開くと `datemylovematch.com` を経由して Azure 上のページに転送され、警告音と偽の警告画像を出す。サポート詐欺のページの作り。
- Afternic に売り出しのページはない。取り戻す見込みは低く、詐欺に使っている相手から買い戻すのも勧めない。

## 2. Google はどう扱うか

### 罰を受けることはない

- Google は「重複コンテンツのペナルティ」というものはないと明言している。罰の対象になるのは、検索結果を操作する目的で人を欺く意図があるときだけ。[^dup]
- 2024 年 3 月に加わった「期限切れドメインの不正使用」は、失効したドメインを買って、価値の低いコンテンツで順位を操作することを指す。[^spam] 作者本人が自分の記事を新しいドメインに移すことは、これに当たらない。
- 旧ドメインには今コンテンツがない（詐欺ページに転送されている）。そのため、新しいドメインの記事と同じ内容が 2 か所で並ぶ状態にはならない。

### 旧ドメインの評価は引き継げない

- Google がサイトの移転を評価ごと引き継ぐ仕組みは、旧 URL から新 URL への 301 リダイレクトが前提になっている。[^move] 旧ドメインを持っていないので、リダイレクトはかけられない。
- Search Console のアドレス変更ツールは、旧と新の両方のプロパティのオーナーであることが条件になっている。[^coa] 旧ドメインを確認できないので使えない。
- そのため、旧ドメインに集まっていた被リンクや評価は、新しいドメインに移らない。新しいドメインは、記事の質はそのままで、評価はほぼゼロから積み直すことになる。

### 旧 URL は時間がたつと検索結果から消える

- Google が旧 URL を巡回し直すと、中身が詐欺ページに変わっているので、いずれ検索結果から落ちる。
- 急ぎたい URL があれば、「古いコンテンツの削除」ツールで更新を頼める。このツールは、ページのオーナーでなくても使える。[^refresh] ただ 1 件ずつの申請なので、全 1300 URL には向かない。上位の数ページだけにする。

## 2.5 旧 URL がインデックスに残ったまま、同じ記事が新しいドメインに出ると何が起きるか

### 今の状態（2026-10-22 に確認）

- Google で `site:webmanab-html.com` を検索すると、旧 URL が記事のタイトルと説明文つきで出る（`clip/orsolina28`、`tip/shape`、`tip/mulch-border` など）。Google は、以前巡回したときの記事の中身を覚えている。
- 今の旧ドメインは、Googlebot の User-Agent で取りに行っても、どの URL にも同じ「Redirecting...」という中身のないページを 200 で返す。記事の中身は返さない。ブラウザで開くと、JavaScript で詐欺ページへ転送される。
- Google は、中身のないページや空のページを「ソフト 404」として扱う。[^http] ただ、インデックスから消えるまでの期間は公式には書かれていない。中身がなくなったサイトは巡回される頻度も下がるので、旧 URL は数週間から数か月残ることがある。

### 起きうること

Google は、同じ内容のページが複数あると、ドメインが違っても 1 つを代表に選び、残りを検索結果から外す。そのとき、どちらが元の記事かを見極めようとする。[^cross][^scraper]

ここで、Google の頭の中では旧 URL のほうが先にあった記事になっている。インデックスに記事の中身が残っているうちに新しいドメインに同じ記事が出ると、次のことが起こりうる。

1. 新しいドメインのページが「旧 URL の複製」と見なされ、検索結果に出ない。Search Console では「重複しています。Google により、ユーザーがマークしたページとは異なるページが正規ページとして選択されました」と表示される。
2. そのあいだ、検索結果は旧 URL を出し続け、クリックした人は詐欺ページに飛ばされる。
3. Google が旧 URL を巡回し直して中身が消えていると気づけば、旧 URL の代表の座は外れ、新しいドメインのページが代表に選ばれる。

つまり、新しいドメインが検索に出るかどうかは、Google が旧 URL を巡回し直すのがいつかに左右される。評価の引き継ぎがないことに加えて、しばらく新しいページが検索に出ない期間が生じうる、ということになる。

公式のドキュメントに、ドメインをまたいだときの代表の選び方の詳しい説明はない。上の 1〜3 は、公式ブログの説明（ドメインをまたいでも 1 つを選んで残りを外す、元の記事を見極めようとする）と、Search Console の表示の種類から組み立てた見立てで、Google に確かめたものではない。実際にどうなっているかは、公開後に URL 検査ツールの「Google が選択した正規 URL」で確かめられる。

### もう一つの危険: 旧ドメインの持ち主が記事を出し直すこと

失効したドメインを拾った人が、Wayback Machine から元の記事を取ってきて載せ直し、検索流入を詐欺や広告に流す手口がある。今は転送しているだけだが、記事を出し直されると、旧 URL の中身が「生きている元の記事」に戻ってしまい、新しいドメインが複製の側に回る。

そうなったときは、記事の著作権者として Google に著作権侵害の削除を申し立てられる（DMCA）。[^dmca]

### やること

公開前:

1. 新しいドメインのページで、自分自身を指す canonical、sitemap（`lastmod` 付き）、構造化データ（元の公開日・更新日・著者）を確実に出す。どれも「こちらが代表」という合図になる。
2. 記事の中で旧ドメインに触れるときは、リンクにしない（`webmanab-html.com` の文字だけにする）。

公開直後:

1. Search Console の URL 検査で、主な記事を 10 本ほどインデックス登録をリクエストする。数日後に同じツールで「Google が選択した正規 URL」が新しいドメインになっているかを見る。
2. 旧 URL が代表に選ばれている記事があれば、その旧 URL を「古いコンテンツの削除」ツールで申請する。[^refresh] このツールは、ページのオーナーでなくても使える。今の旧 URL は中身が消えているので、申請が通れば検索結果の説明文が消え、Google が巡回し直すきっかけにもなる。1 件ずつの申請なので、検索で表示されている記事から優先する。
3. 旧ドメインの詐欺ページを Google Safe Browsing に報告する。[^sb]

公開から数か月:

1. Search Console の「ページのインデックス登録」で「重複しています。Google により〜異なるページが正規ページとして選択されました」の件数を見る。旧 URL が消えていくにつれて、この件数が減っていくはず。
2. `site:webmanab-html.com` の件数をときどき見る。旧ドメインで記事が出し直されていないかも、このときに確かめる。

## 3. やること

### リニューアルの公開前

1. Netlify から `webmanab-html.com` を外す。今は netlify.app の全応答に、このドメインを canonical として指すヘッダーが付いている。
2. 新しいドメインを取って、公開前に Netlify のプライマリドメインにする。リニューアルは最初から新しいドメインで公開する。
   - netlify.app のまま公開して、あとからドメインを付けると、Google が一度 netlify.app で覚えた URL をまた覚え直すことになる。避けられる手間なので避ける。
   - プライマリドメインを設定すると、Netlify は netlify.app の応答に新しいドメインを指す canonical のヘッダーを付ける。念のため、netlify.app から新しいドメインへの 301 も `netlify.toml` に書く。[^netlify]
3. `SITE_URL` を新しいドメインにする。canonical、OGP、sitemap、RSS がそろって新しいドメインを指すようにする。
4. 本文やテンプレートから、旧ドメインへのリンクを残さない（エクスポーターで書き換え済み）。
5. 記事の構造化データ（`BlogPosting`）に、元の公開日（`datePublished`）、更新日（`dateModified`）、著者を入れる。記事 frontmatter の `date` と `modified` は旧 WordPress の値をそのまま持っているので、元の公開日を保てる。

### 公開の直後

1. Search Console に新しいドメインをドメインプロパティとして登録し（DNS の TXT レコードで確認）、`/sitemap.xml` を送る。
2. Search Console に旧ドメインのプロパティが残っていれば、削除する（もう確認が通らない）。
3. Bing Webmaster Tools にも同じように登録する。
4. 自分で直せる場所のリンクを、新しいドメインに書き換える。GitHub のリポジトリ（README の Netlify バッジのあたりと About）、X のプロフィール、ほかに書いている場所（Qiita、Zenn、note、ポートフォリオなど）。
5. 被リンクの多いサイトがわかれば、書き換えをお願いする。[^move]
6. AdSense に新しいドメインをサイトとして追加して、審査を受け直す。`ads.txt` は新しいサイトにも置く。

### 読者を守るため

1. 旧ドメインの詐欺ページを、Google Safe Browsing の報告フォームから報告する。[^sb] 認められれば、Chrome で旧リンクを開いた人に警告が出るようになる。

## 4. 見込み

- 罰を受けることはないが、旧ドメインの被リンクと評価を引き継げないので、検索からの流入はいったん大きく落ちると考えておく。
- 記事は同じなので、新しいドメインが巡回されて評価が積み上がれば、少しずつ戻る。期間は数週間から数か月の単位。
- 一番効くのは、自分で直せる被リンクを早めに新しいドメインへ向けること。

## 5. 決めてほしいこと

- 新しいドメインの名前と、どこで取るか。2026-10-22 に RDAP で見た範囲では、`webmanab.com` / `webmanab.net` / `webmanab-html.net` / `webmanab.dev` / `webmanab.app` / `webmanab.jp` が空いていた（購入の画面で最終確認すること）。

[^dup]: [Demystifying the "duplicate content penalty"（Google Search Central Blog）](https://developers.google.com/search/blog/2008/09/demystifying-duplicate-content-penalty)
[^spam]: [Spam policies for Google web search - Expired domain abuse](https://developers.google.com/search/docs/essentials/spam-policies)
[^move]: [How to move a site with URL changes（Google Search Central）](https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes)
[^coa]: [Change of Address tool（Search Console Help）](https://support.google.com/webmasters/answer/9370220?hl=en)
[^refresh]: [Refresh Outdated Content tool（Search Console Help）](https://support.google.com/webmasters/answer/7041154?hl=en)
[^netlify]: [Netlify Support Forums: Recommended status code for redirecting netlify subdomain to primary domain](https://answers.netlify.com/t/recommended-status-code-for-redirecting-netlify-subdomain-to-primary-domain/3198)
[^sb]: [Report a Page to Google Safe Browsing](https://safebrowsing.google.com/safebrowsing/report_phish/)
[^http]: [How HTTP status codes, and network and DNS errors affect Google Search](https://developers.google.com/search/docs/crawling-indexing/http-network-errors)
[^cross]: [Handling legitimate cross-domain content duplication（Google Search Central Blog）](https://developers.google.com/search/blog/2009/12/handling-legitimate-cross-domain)
[^scraper]: [Duplicate content due to scrapers（Google Search Central Blog）](https://developers.google.com/search/blog/2008/06/duplicate-content-due-to-scrapers)
[^dmca]: [Report Content for Legal Reasons（Google の法的な削除の申し立て。著作権・DMCA を含む）](https://support.google.com/legal/answer/3110420)
