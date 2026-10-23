---
id: 82
type: tip
slug: "regular-expression-including-a-new-line"
title: "改行を含む任意の文字列から任意の文字列をマッチさせる – 『正規表現』"
date: 2016-06-17T07:29:07+09:00
modified: 2016-06-17T10:36:53+09:00
excerpt: "「任意の文字列」 〜 「任意の文字列」の間に特定できない文字列や改行が含まれている場合の正規表現のtipsです。 \\sと\\Sを[]でグループにして*で繰り返す \\sは半角スペース、タブにマッチします。 \\Sは半角スペース"
primaryTag: "regexp"
terms:
  - { id: 63, name: "regexp", slug: "regexp" }
legacy:
  prev: smartobject-2x
  next: wordpress-function-async
---

「任意の文字列」 〜 「任意の文字列」の間に特定できない文字列や改行が含まれている場合の正規表現のtipsです。

## `\s`と`\S`を`[]`でグループにして`*`で繰り返す

`\s`は半角スペース、タブにマッチします。\
`\S`は半角スペース、タブ以外にマッチします。\
これらをグループ化して、繰り返させることで要件に対応しようと思います。

以下の例は`exsection`という`id`属性からそのエンドポイントをあらわしたコメントアウトまでにマッチします。

#### 正規表現

```html

<div id="ex-section"[\s\S]*ex-section end -->

```

### 雑感

もっと精進して正規表現に精を出したいと思っています。修行。\
[ブラウザから手軽にチェックできる正規表現テストツールまとめ](http://nelog.jp/regular-expression-online-tools)

正規表現を英語表記するとき`regex`と`regexp`が混在しているけど、読みは略さないのがいいみたいなんですね。。。\
[正規表現って「regex」？それとも「regexp」？に対する回答が秀逸だと話題に](http://www.softantenna.com/wp/software/regex-or-regexp/)

おわります。
