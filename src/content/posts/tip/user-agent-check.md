---
id: 452
type: tip
slug: "user-agent-check"
title: "jQueryを使って、ユーザーエージェント(スマホ / タブレット / IE / PC)を判別するスクリプト -『javascript』"
date: 2016-09-23T20:00:24+09:00
modified: 2017-02-17T17:42:38+09:00
excerpt: "ユーザーエージェントを判別して処理を加えるためのスクリプトです。 ユーザーエージェントごとに何かの処理をしたい スマホとタブレットとPCを判別して、処理を分岐させたり、特定のクラスを付与してスタイルを当てる…などなど、レ"
primaryTag: "mobile"
terms:
  - { id: 29, name: "javascript", slug: "javascript" }
  - { id: 30, name: "jQuery", slug: "jquery" }
  - { id: 268, name: "mobile", slug: "mobile" }
demoUrl: https://jsfiddle.net/yutousui/5d77y8jp/
legacy:
  prev: css-selection
  next: html5-basic
---

ユーザーエージェントを判別して処理を加えるためのスクリプトです。

## ユーザーエージェントごとに何かの処理をしたい

スマホとタブレットとPCを判別して、処理を分岐させたり、特定のクラスを付与してスタイルを当てる…などなど、レスポンシブデザインの要件では特に「ユーザーエージェントごとに何かしたい」ということがあると思います。

スクリプトの流れは、ユーザーエージェントをスマホ / タブレット / IE / PCごとに数値化して、その数値によって処理を分岐していきます。

#### javascript

```js

function uaCheck () {
  // tab or sp or ie
  
  var ua = (function (u) {
    return {
      //
      sp: (u.indexOf("windows") != -1 && u.indexOf("phone") != -1) || u.indexOf("iphone") != -1 || u.indexOf("ipod") != -1 || (u.indexOf("android") != -1 && u.indexOf("mobile") != -1) || (u.indexOf("firefox") != -1 && u.indexOf("mobile") != -1) || u.indexOf("blackberry") != -1,
      //
      tab: u.indexOf("ipad") != -1 || (u.indexOf("android") != -1 && u.indexOf("mobile") == -1) || (u.indexOf("firefox") != -1 && u.indexOf("tablet") != -1) || u.indexOf("kindle") != -1 || u.indexOf("silk") != -1 || u.indexOf("playbook") != -1,
      //
      ie: u.indexOf('msie') != -1 || u.indexOf('trident') != -1
    }
  })(window.navigator.userAgent.toLowerCase());

    // numbering
    var num;
  if (ua.sp) {
    // sp
    num = 3;
  } else if (ua.tab) {
    // tab
    num = 2;    
  } else if (ua.ie) {
    // IE
    num = 1;
  } else {
    // other
    num = 0;
  }
  
  if (num == 3) {
    $('#ex').text('sp');
  } else if (num == 2) {
    $('#ex').text('pad');
  } else if (num == 1) {
    $('#ex').text('IE');
  } else {
    $('#ex').text('PC, not IE');
  }

}
uaCheck ();


```

<p><iframe width="100%" height="350" src="//jsfiddle.net/yutousui/5d77y8jp/embedded/result,js,html/dark/" allowfullscreen frameborder="0"></iframe></p>

おわります。
