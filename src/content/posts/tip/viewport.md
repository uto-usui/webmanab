---
id: 49
type: tip
slug: "viewport"
title: "固定幅のサイトを、そのサイズ以下のウィンドウを持つデバイスでも画面ぴったりに表示する方法 – 『HTML5』"
date: 2016-06-07T23:07:08+09:00
modified: 2016-06-12T17:54:10+09:00
excerpt: "viewportの設定 レスポンシブサイトを制作する際はおまじない慣例として以下のビューポート設定を行うことが多いです。 html <meta name=”viewport” content=”width=devi"
primaryTag: "viewport"
terms:
  - { id: 38, name: "html5", slug: "html5" }
  - { id: 40, name: "meta", slug: "meta" }
  - { id: 39, name: "responsive", slug: "responsive" }
  - { id: 37, name: "viewport", slug: "viewport" }
legacy:
  prev: alert-redirect
  next: os-x-el-capitan-appear-invisible-files
---

## viewportの設定

レスポンシブサイトを制作する際はおまじない慣例として以下のビューポート設定を行うことが多いです。

#### html

```html

<meta name="viewport" content="width=device-width, initial-scale=1">


```

ですが、固定幅のサイトを制作する際、例えば上位のブロックに最小幅指定(`min-width: ...`)があると、上記コードだと画面幅ぴったりに表示されません。

ブラウザは`width=...`に指定したサイズのviewportにレンダリングして、そのサイズの仮想的なウインドウをデバイスのデイスプレイに作ります。\
`width=device-width`はviewportを**端末やブラウザアプリ毎に合わせてレンダリングする**ので、最小幅や固定幅を指定している場合は、これより大きいとはみ出してしまいます。

### content=widthに固定サイズを指定する

なので、ここではおまじないは使えないので、固定表示している幅の数値をviewportの`width=...`に指定します。\
以下はサイトの最小サイズが1040pxのサイトの場合です。

#### html

```html

<meta name="viewport" content="width=1040, user-scalable=yes">


```

おわります。
