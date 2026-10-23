---
id: 44
type: tip
slug: "alert-redirect"
title: "サイトアクセス時にユーザエージェントを判別してアラートを表示し、PCサイトとSPサイトを選択させる方法 – 『JS / jQuery』"
date: 2016-06-06T21:16:12+09:00
modified: 2016-06-12T17:53:23+09:00
excerpt: "リダイレクトをアラート表示の選択でユーザーに選んでもらう PCサイト・スマホサイトと、スクラッチで制作されているサイトにアクセスする際に、 スマホデバイスのユーザーエージェントを判別してPCサイトのURLからSPサイトへ"
primaryTag: "javascript"
terms:
  - { id: 29, name: "javascript", slug: "javascript" }
  - { id: 32, name: "redirect", slug: "redirect" }
legacy:
  prev: check-whether-there-is
  next: viewport
---

## リダイレクトをアラート表示の選択でユーザーに選んでもらう

PCサイト・スマホサイトと、スクラッチで制作されているサイトにアクセスする際に、\
スマホデバイスのユーザーエージェントを判別してPCサイトのURLからSPサイトへとリダイレクトさせる方法のひとつとして、\
アクセス時にユーザーに選択してしてもらうUIを実現するスクリプトです。

### スマホ系をリダイレクト

以下のスクリプトで、iPhone / iPod / Androidに対してリダイレクトの選択アラートを表示します。

#### JavaScript

```js

function redirect() {
  var agent = navigator.userAgent;
  if (agent.search(/iPhone/) != -1 || agent.search(/iPod/) != -1 || agent.search(/Android/) != -1) {
    if (window.confirm('スマホサイトに移動しますか？')) { // アラートのメッセージ
      location.href = "sp/"; // 遷移先url
    }
  }
}
redirect();

```

### iPadもリダイレクトアラートを出したい

iPadに関してはユーザビリティの観点からはPCサイトを表示させることが望まれますが、\
スマホ向けサイトに誘導したい場合は下記のように書き加えます。

#### JavaScript

```js

function redirect() {
  var agent = navigator.userAgent;
  if (agent.search(/iPhone/) != -1 || agent.search(/iPod/) != -1 || agent.search(/iPad/) != -1 || agent.search(/Android/) != -1) {
    if (window.confirm('スマホサイトに移動しますか？')) { // アラートのメッセージ
      location.href = "sp/"; // 遷移先url
    }
  }
}
redirect();

```

おわります。
