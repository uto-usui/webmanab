---
id: 293
type: tip
slug: "auto-content-width"
title: "意外と知らないけど知っておきたい。内包するコンテンツの大きさに応じて要素の幅を可変させるレスポンシブテクニック -『CSS』"
date: 2016-07-28T23:43:15+09:00
modified: 2017-02-17T18:03:32+09:00
excerpt: "高さが指定されていないコンテンツのheigt(高さ)は、内包しているコンテンツの高さに依存しています。 width(幅)についても同じような振る舞いをさせたいときのtipsです。 内包するコンテンツの大きさに応じて幅を可"
primaryTag: "css"
terms:
  - { id: 140, name: "box-model", slug: "box-model" }
  - { id: 3, name: "css", slug: "css" }
  - { id: 141, name: "layout", slug: "layout" }
  - { id: 39, name: "responsive", slug: "responsive" }
legacy:
  prev: awesomplete
  next: image-hover-effect
---

高さが指定されていないコンテンツの`heigt`(高さ)は、内包しているコンテンツの高さに依存しています。\
`width`(幅)についても同じような振る舞いをさせたいときのtipsです。

## 内包するコンテンツの大きさに応じて幅を可変させる

`figure`と`figcaption`使って画像とキャプションを表示させる際に、`img`に指定した画像のサイズにキャプションがぴったりくるようにしたい場合を例として考えます。\
このとき`figure`がギャラリーのように複数並んでいて、画像のサイズがばらばらな場合だと個別にサイズ指定するのは面倒です。

ここでは、今回の要件がぴったりはまります。\
`img`に合わせて、`figure`の幅が可変するようなCSSを記述します。\
たった１行です。

#### css

```CSS

figure {
  width: min-content;
}

```

## min-contentとは

CSS3で新しく定義されたキーワード`min-content`は、\
　その要素が内包している要素の中で、分割できない項目のうち、最大の大きさを持つ要素に基づいて幅を決定します。\
「最大の大きさを持つ要素」とは、一番長い単語、画像、固定幅のコンテンツなどが該当するでしょう。

#### test

<p><iframe width="100%" height="600" src="//jsfiddle.net/yutousui/v6jyn639/embedded/result,css,html/dark/" allowfullscreen frameborder="0"></iframe></p>

### IEのフォローバック

残念なことにIEではこのキーワードに対応していません。\
打開案としてのフォローバックとしては、`max-width`プロパティをカスケーディングすることで解決しましょう。

#### css

```CSS

figure {
  max-width: 350px; // 適切な幅を与える
  max-width: min-content;
}

```

### 他のキーワード

補足として、他のキーワードに、 `max-content`と`fit-content`があります。

<dl><dt>max-content</dt><dd>min-contentと逆の働きで、要素が内包している要素の中で、最大の大きさを持つ要素に基づいて幅を決定します。<br>親要素より幅が大きくなった場合は、親を突き抜けるような挙動になります。(<code>inline-block</code>を指定したような感じ)</dd><dt>fit-content</dt><dd>内包されたコンテンツをすべて含むことができるサイズまで要素が広がり、親要素より大きくならないように最大値が定義されコンテンツが折り返されます。(<code>float</code>とか<code>table-cell</code>みたいに)</dd></dl>

#### 参考

- [仕様書](https://www.w3.org/TR/css-sizing-3/#values)

おわります。
