---
id: 830
type: tip
slug: "perfect-scrollbar"
title: "自分の好みのスクロールバーに。「perfect-scrollbar」でかんたんにスクロールバーをカスタマイズする -『javascript』"
date: 2016-12-10T18:09:14+09:00
modified: 2017-02-13T21:40:52+09:00
excerpt: "「perfect-scrollbar」は任意のボックス内のスクロールバーをカスタマイズできるjQueryプラグインで、SCSSを扱える環境だと見た目やホバーしたときのカスタマイズもかなり容易で、スクロールのスピードを変更"
primaryTag: "plug-in"
terms:
  - { id: 29, name: "javascript", slug: "javascript" }
  - { id: 30, name: "jQuery", slug: "jquery" }
  - { id: 85, name: "plug-in", slug: "plug-in" }
  - { id: 234, name: "scroll", slug: "scroll" }
demoUrl: https://jsfiddle.net/yutousui/tqn0kw96/
legacy:
  prev: 2016-2017-css-font
  next: javascript-settimeout-jquery-queue
---

「perfect-scrollbar」は任意のボックス内のスクロールバーをカスタマイズできるjQueryプラグインで、SCSSを扱える環境だと見た目やホバーしたときのカスタマイズもかなり容易で、スクロールのスピードを変更したりなどオプションも豊富です。

## perfect scrollbar でスクロールバーをカスタマイズする

利用するには[perfect-scrollbarのgithubページ](https://github.com/noraesae/perfect-scrollbar)からかbowerでダウンロードします。

#### terminal

```
bower install perfect-scrollbar

```

### 実装がすごくかんたん

実装はかんたんです。スクロールしたい親ボックスに　`position`と`overflow`のプロパティを設定します。親ボックスをjQueryで選択してメソッドを実行します。

#### html

```
<script src="https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js"></script>

```

#### css

```

.container {
  position: relative;
  overflow: auto;
}


```

#### javascript

```
$('.container').perfectScrollbar();

```

### 見た目のスタイルの変更

見た目はvariable.scssを編集することで簡単にカスタマイズできます。

#### variables.scss

```
$ps-border-radius: 6px !default; // スクロールバーの丸み

$ps-rail-default-opacity: 0 !default; // コンテナにマウスが入ってない時の透過度
$ps-rail-container-hover-opacity: 0.6 !default;　// コンテナにマウスが入った時の透過度
$ps-rail-hover-opacity: 0.9 !default; // スクロールバーにマウスが入った時の透過度

$ps-bar-bg: transparent !default;
$ps-bar-container-hover-bg: #aaa !default;
$ps-bar-hover-bg: #999 !default;
$ps-rail-hover-bg: #eee !default;

// Sizes
$ps-scrollbar-x-rail-bottom: 0px !default;
$ps-scrollbar-x-rail-height: 15px !default;
$ps-scrollbar-x-bottom: 2px !default;
$ps-scrollbar-x-height: 6px !default;
$ps-scrollbar-x-hover-height: 11px !default;

$ps-scrollbar-y-rail-right: 0 !default;
$ps-scrollbar-y-rail-width: 15px !default;
$ps-scrollbar-y-right: 2px !default;
$ps-scrollbar-y-width: 6px !default;
$ps-scrollbar-y-hover-width: 11px !default;

```

### オプションを渡してカスタマイズ

スピードとスクロールバーの高さを変更してみます。

#### javascript

```

$('.container').perfectScrollbar({
  wheelSpeed: .2,
  minScrollbarLength: 100
});


```

デフォルトだとカスタマイズしたスクロールバーが設置されているボックスのスクロールが終わったとき、マウスのスクロールの動作が画面のスクロールに切り替わりません。これには以下のオプションを渡すことで解決します。

```
wheelPropagation: true

```

実装するサイトがレスポンシブデザインなど、リサイズされることが予想される場面では、スクリプトを更新します。

```
.perfectScrollbar('update')

```

というように記述しますが、画面のリサイズが終了したときだけに実行するためには以下のように記述します。

```

var scrollBoxUpdate = function() {

  $('.js-scroll-box').perfectScrollbar('update');

};

var finishResizeEvent = function() {

  var timer = false;

  $window.resize(function() {

    if (timer !== false) {

      clearTimeout(timer);

    }
    timer = setTimeout(function() {

      scrollBoxUpdate();

    }, 300);

  });

};
finishResizeEvent();


```

#### demo

<p><iframe width="100%" height="500" src="//jsfiddle.net/yutousui/tqn0kw96/7/embedded/result,js/" allowfullscreen frameborder="0"></iframe></p>

オプションなど豊富に用意されているのと、SCSSで簡単にカスタマイズできるのが「perfect-scrollbar」の特徴かとおもいます。デフォルトのデザインやアクションはmacOSに似せてあるので、Windows環境でもmacOSのようなスクロールバーを実装することができます。

おわります。
