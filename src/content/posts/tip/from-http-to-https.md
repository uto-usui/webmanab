---
id: 944
type: tip
slug: "from-http-to-https"
title: "無料でかんたん。エックスサーバーでHTTPからHTTPSへの移行するために必要なこと -『front-end』"
date: 2017-01-22T12:32:45+09:00
modified: 2017-06-14T12:14:45+09:00
excerpt: "エックスサーバーでは独自SSLを無料でかんたんに利用できます。他にも無料でSSLを提供しているサーバーはありますが、他の機能やサービス面や値段を考慮して、xserverはとてもいけてるサーバーだと思っています。これを利用"
primaryTag: "server"
terms:
  - { id: 238, name: "frontend", slug: "frontend" }
  - { id: 98, name: "seo", slug: "seo" }
  - { id: 253, name: "server", slug: "server" }
legacy:
  prev: wordpress-uninstall-wp-super-cache
  next: google-anlytics-invalidate-my-access-by-specifying-an-ip-address
---

エックスサーバーでは独自SSLを無料でかんたんに利用できます。他にも無料でSSLを提供しているサーバーはありますが、他の機能やサービス面や値段を考慮して、xserverはとてもいけてるサーバーだと思っています。これを利用してhttpで作成したサイトをhttpsに移行するための手順です。

## エックスサーバーでHTTPからHTTPSへの移行するために必要なこと

1. 事前にデータベースのバックアップをとる
2. エックスサーバーでSSL設定を行う
3. WordPressの設定からURLを変更する
4. 内部リンクをSearch Regexで全て置換する
5. .htaccessをにリダイレクト用のコードを追記する
6. SSLエラーのチェック方法
7. テーマなどの設定を見直す
8. その他サービス・ツールの設定の変更など

### 事前にデータベースのバックアップをとる

まず作業に入る前に、念のためデータベースのバックアップを取っておきます。プラグインでかんたんにバックアップを取っても、phpadminから直接バックアップを取ってもどちらでも構いません。何かあったときのために最新のsqlファイルを手元に置いておきましょう。

- [sqlファイルのエクスポート](/tip/wordpress-move-site/)
- [backwpup](https://ja.wordpress.org/plugins/backwpup/)

### エックスサーバーでのSSL設定

以下のような手順で設定を進めていきます。

1. サーバーパネルにログイン
2. ドメインカテゴリの「SSL設定」
3. SSL化したいドメインの「選択する」
4. タブを「独自SSL設定の追加」に切り替える
5. 項目を確認後、チェックボックスにチェックを入れずに「独自SSL設定を追加する（確定）」
6. しばらく待つ
7. タブを「SSL設定の一覧」に切り替える
8. httpsのurlにアクセス
9. 「このサイトは安全ではありません」的な画面が表示されるので30分から1時間ほど待つ
10. 再度アクセスして正しくサイトが表示されたら完了

### WordPressの設定でURLを変更

サイトが表示できるようになったら、wordpressの管理画面の設定を変更します。サイドバーの「設定/一般」にある、WordPressアドレス（URL）とサイトアドレス（URL）のhttpの記述ををhttpsに書き換えます。書き換えた後は「変更を保存」します。

### 内部リンクをSearch Regexで全て置換

サイト内の画像や内部リンクのパスをhttpsに書き換えます。プラグインで一斉置換するのが簡単なので「Search Regex」を利用します。

- [Search Regex](https://ja.wordpress.org/plugins/search-regex/)

### HTTPSへのリダイレクト設定

http\:// のURLから https\:// へのURLへとリダイレクトさせます。ドメインのルートに配置した.htaccessに301リダイレクトを記述します。

#### .htaccess

```

RewriteEngine on
RewriteCond %{SERVER_PORT} !^443$ [OR]
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://webmanab.com/$1 [R=301,L]


```

### google serch consoleへの登録

HTTPSに移行したサイトは別サイト扱いになるので、httpsで始まるアドレスのサイトを新たに登録します。 登録した後はサイトマップの送信も行っておきます。

### Google Analytics　の設定

メニューの「管理 / アカウント / プロパティ / プロパティ設定」と「管理 / アカウント / ビュー / ビュー設定」のhttpをhttpsに変更します。

おわります。
