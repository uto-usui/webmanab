---
id: 158
type: tip
slug: "canonical-www"
title: "wwwの有無を統一してurlの正規化を実現する流れをまとめる – 「SEO」"
date: 2016-07-11T13:31:55+09:00
modified: 2016-07-15T22:02:07+09:00
excerpt: "wwwの有無の統一「正規化」 サイトURLは、wwwを含むバージョンと含まないバージョンの２通りがあります。 これは検索エンジンにとってはまったく別のページになります。 どちらかに統一していることをクローラーに指示してお"
primaryTag: "seo"
terms:
  - { id: 102, name: ".htaccess", slug: "htaccess" }
  - { id: 99, name: "canonical", slug: "canonical" }
  - { id: 98, name: "seo", slug: "seo" }
legacy:
  prev: navigation-hover-effect
  next: wait-animate
---

## wwwの有無の統一「正規化」

サイトURLは、wwwを含むバージョンと含まないバージョンの２通りがあります。\
これは検索エンジンにとってはまったく別のページになります。\
どちらかに統一していることをクローラーに指示しておかないと、**被リンクが両方に張られていたら評価が分散**してしまったり、**重複コンテンツと見なされてSEOでマイナス評価**を受けている可能性があります。

そのために行うことは、

- Webマスターツールでの設定
- サイト内リンクを絶対パスに統一する
- .htaccessファイルで301リダイレクト

この3点です。

wwwの有無は好みで構いませんが、以下www無しに統合していくことを前提に進めていきます。\
この作業を**正規化**といいます。

### Webマスターツールでの設定

Webマスターツールでダッシュボードにログインして、右上の［設定］→［サイトの設定］をクリックし、www有り無しを選択して保存します。

## サイト内リンクを絶対パスに書き換える

サイト内リンクに関しては、www無しに統一した上で相対パスになっている箇所を置換するなどして絶対パスに書き換えておきます。

### wwwなしに301リダイレクト

使用しないドメインから３０１リダイレクトを使って使用するドメインにリダイレクトさせます。\
Apacheの`mod_rewrite`モジュールの機能を使います。正規表現でアクセスURLを書き換えることができます。

.htaccessファイルに以下を記述します。

#### .htaccess

```xml

RewriteEngine on
RewriteCond %{HTTP_HOST} ^www.ex\.com
RewriteRule ^(.*)$ http://ex.com/$1 [R=301,L]

```

### index.htmlの有無も統一

url末尾の `index.html` の有無に関しても上記と同じことが言えるので、リダイレクトさせて`index.html` 無しに正規化させておきます。

#### .htaccess

```xml

RewriteCond %{THE_REQUEST} ^.*/index.html
RewriteRule ^(.*)index.html$ http://www.ex.com/$1 [R=301,L]

```
