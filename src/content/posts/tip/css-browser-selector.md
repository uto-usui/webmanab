---
id: 824
type: tip
slug: "css-browser-selector"
title: "「CSS Browser Selector」ブラウザやOSに応じてクラスを付与してCSSハックできるようにするスクリプト -『Plug-in』"
date: 2016-12-09T19:12:14+09:00
modified: 2017-02-13T21:44:43+09:00
excerpt: "「このブラウザだけにCSSを適応させたい」とか、「このOSを判別してCSS当てたい」とか、ブラウザやOS毎にCSSハックできるスクリプトが「CSS Browser Selector」です。 「CSS Browser Se"
primaryTag: "plug-in"
terms:
  - { id: 3, name: "css", slug: "css" }
  - { id: 23, name: "hack", slug: "hack" }
  - { id: 29, name: "javascript", slug: "javascript" }
  - { id: 85, name: "plug-in", slug: "plug-in" }
legacy:
  prev: when-the-window-resize-is-over
  next: 2016-2017-css-font
---

「このブラウザだけにCSSを適応させたい」とか、「このOSを判別してCSS当てたい」とか、**ブラウザやOS毎にCSSハックできる**スクリプトが「CSS Browser Selector」です。

## 「CSS Browser Selector」ブラウザやOSに応じてクラスを付与してCSSハックできるようにするスクリプト

スクリプトのダウンロードは以下のサイト内からか、bowerなどでいきましょう。

- [css_browser_selector](http://rafael.adm.br/css_browser_selector/)

#### terminal

```
bower install css_browser_selector

```

このスクリプトを読み込むと`<html>`要素にユーザーの環境を表してくれるクラスが付与されるので、そのクラスを使ってスタイルを指定することで、CSSハックします。

SCSSにこんな感じで記述します。

#### scss

```

.ie {
  // all IE
  .title {
    font-size: 10px;
  }
}

.title {
  // c
  .ie & {
    font-size: 20px;
  }
}


```

スコープを与えて目標のCSSハックしたいセレクタにスタイルを適応させるので、ハック内容が多い場合は別ファイルにしてもいいと思いますし(上部の書き方のネスト)、単純な少しのスタイルの場合は、基本スタイルの中に混ぜるようにして(下部の書き方のネスト)記述していくことになるかと思います。

本当に様々なクラスを吐き出してくれるので、いろんなCSSハックが可能です。デバイスも携帯端末名のクラスとか、解像度、画面サイズ、レガシーブラウザなどなどあるので、よく使いそうなものを列挙しておきます。

### デバイスやOS別に使い分けるクラス

#### scss

```

.win {
    // all Windows
}

.vista {
    // Windows Vista
}

.linux {
    // linux
}

.mac {
    // MacOS
}

.ipod {
    // iPod Touch
}

.iphone {
    // iphone
}

.ipad {
    // ipad
}

.webtv {
    // WebTV
}

.blackberry {
    // blackberry
}

.android {
    // Android
}

.mobile {
    // all mobile
}


```

### ブラウザ別に使い分けるクラス

#### scss

```

.ie {
  // all IE
}

.ie8 {
  // IE8
}

.ie7 {
  // IE7
}

.ie6 {
  // IE6
}

.gecko {
  // all Firefox
}

.opera {
  // all Opera
}

.webkit {
  // Safari, Google Chrome
}

.safari {
  // Safari
}

.chrome {
  // Google Chrome
}

.ios {
  // all ios
}

.ios9 {
  // ios9
}


```

### ディスプレイを判別するクラス

```

.retina {
  // retina display
}

.maxw_768 {
  // window size 768px 
}


```

おわります。
