---
id: 163
type: tip
slug: "htaccess-user-agent-allocation"
title: "スマホ用にディレクトリを分けた構造のサイトで.htaccessでユーザーエジェントごとに振り分ける -『front-end』"
date: 2016-07-15T21:53:17+09:00
modified: 2017-02-17T18:15:00+09:00
excerpt: "スマホ用・PC用などユーザーのデバイスごとにアクセスさせたいURLが異なる場合、指定したディレクトリにアクセスさせるtipsです。 指定したディレクトリに振り分け、アクセスさせる 振り分けを行いたいディレクトリのルートに"
primaryTag: "frontend"
terms:
  - { id: 102, name: ".htaccess", slug: "htaccess" }
  - { id: 238, name: "frontend", slug: "frontend" }
  - { id: 268, name: "mobile", slug: "mobile" }
  - { id: 32, name: "redirect", slug: "redirect" }
legacy:
  prev: wait-animate
  next: svg-height
---

スマホ用・PC用などユーザーのデバイスごとにアクセスさせたいURLが異なる場合、指定したディレクトリにアクセスさせるtipsです。

## 指定したディレクトリに振り分け、アクセスさせる

振り分けを行いたいディレクトリのルートに(主にドメインルート).htaccessファイルを作成し、記述します。\
PCからスマホ/タブレット用URLへのアクセスがあった際に、PC用にURLを書き換えるコードは以下です。

#### .htaccess

```xml

RewriteEngine on

RewriteCond %{REQUEST_URI} /sp/
RewriteCond %{HTTP_USER_AGENT} !(iPod|iPhone|iPad|Android|Windows\ Phone)
RewriteRule ^sp/(.*)$ $1 [R]
RewriteBase /

```

<dl><dt>PC</dt><dd>http://ex.com/</dd><dt>SP</dt><dd>http://ex.com/sp/</dd></dl>

以上の構造のディレクトリのサイトで作成した場合のサンプルです。

また、スマホからPC用のURLに書き換える場合は以下です。

```xml

RewriteEngine on

RewriteCond %{REQUEST_URI} !/sp/
RewriteCond %{HTTP_USER_AGENT} (iPod|iPhone|iPad|Android|Windows\ Phone)
RewriteRule ^(.*)$ sp/$1 [R]
RewriteBase /

```

`RewriteEngine on` の記述は一度で大丈夫です。

おわります。
