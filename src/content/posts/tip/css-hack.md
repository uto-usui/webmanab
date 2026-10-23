---
id: 29
type: tip
slug: "css-hack"
title: "2016/CSSHACK ブラウザやユーザーエージェントごとにスタイルを適用させる方法 – 『CSS』"
date: 2016-06-03T15:27:21+09:00
modified: 2016-06-12T17:53:46+09:00
excerpt: "ブラウザ別 CSS HACK CSSへのセレクタなどの記述のみで、ブラウザ別にスタイルを適用させる方法です。 備忘録として。 IE /* IE10- */ .sample{ background: aquamarine;"
primaryTag: "css"
terms:
  - { id: 3, name: "css", slug: "css" }
  - { id: 23, name: "hack", slug: "hack" }
legacy:
  prev: placeholder
  next: default-value
---

## ブラウザ別 CSS HACK

CSSへのセレクタなどの記述のみで、ブラウザ別にスタイルを適用させる方法です。\
備忘録として。

#### IE

```css

/* IE10- */
.sample{
  background: aquamarine;
}
/* IE10+ */
@media all and (-ms-high-contrast: none){
  .ex{
    background: aquamarine;
  }
}


```

#### Firefox

```css

/* Firefox */
@-moz-document url-prefix(){
  .sample{
    background: aquamarine;
  }
}


```

#### Chrome

```css

/* Chrome */
@media screen and (-webkit-min-device-pixel-ratio:0){
  .ex {
    background: aquamarine;
  }
}


```

#### Safari

```css

/* Safari */
@media screen and (-webkit-min-device-pixel-ratio:0) {
  ::i-block-chrome, .ex {
    background: aquamarine;
}


```

## ユーザーエージェント別 CSS HACK

ユーザーエージェントはJavaScriptで判別(条件分岐)して、任意のクラスを挿入して対応します。\
以下jQueryを利用した例です。

#### iPhone

```js

/* iPhone */
if ( navigator.userAgent.indexOf('iPhone') > 0 ) {
    $(".ex").addClass("iPhone");
};


```

#### Android

```js

/* Android */
if ( navigator.userAgent.indexOf('Android') > 0 ) {
    $(".ex").addClass("Android");
};


```

おわります。
