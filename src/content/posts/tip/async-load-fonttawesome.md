---
id: 945
type: tip
slug: "async-load-fonttawesome"
title: "サイトを高速化。かんたんなスクリプトでfontawesomeを非同期読み込みする -『front-end』"
date: 2017-01-20T13:03:59+09:00
modified: 2017-02-14T01:14:57+09:00
excerpt: "豊富で使い勝手のいいアイコンを提供してくれる「fontawesome」を非同期に読み込んで実行することでサイトを高速化するtipsです。 かんたんなスクリプトでfontawesomeを非同期読み込みする var load"
primaryTag: "frontend"
terms:
  - { id: 84, name: "asynchronous", slug: "asynchronous" }
  - { id: 232, name: "font", slug: "font" }
  - { id: 238, name: "frontend", slug: "frontend" }
  - { id: 29, name: "javascript", slug: "javascript" }
  - { id: 82, name: "speed", slug: "speed" }
legacy:
  prev: google-fonts-asynchronous
  next: wordpress-uninstall-wp-super-cache
---

豊富で使い勝手のいいアイコンを提供してくれる「fontawesome」を非同期に読み込んで実行することでサイトを高速化するtipsです。

## かんたんなスクリプトでfontawesomeを非同期読み込みする

```

var loadFontawesome = function (url)  {

  var fontawesome = url;
  var createLink = function (href) {
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  };
  var raf = requestAnimationFrame || mozRequestAnimationFrame || webkitRequestAnimationFrame || msRequestAnimationFrame;
  if (raf) {
    raf(function (){
      createLink(fontawesome);
    });
  } else {
    window.addEventListener('load', function(){
      createLink(fontawesome);
    });
  }
}

loadFontawesome("https://maxcdn.bootstrapcdn.com/font-awesome/4.5.0/css/font-awesome.min.css");


```

最終行のurlを変更すると、違うバージョンを読み込んだり、googleFontsなどの他のスタイルシートを非同期に読み込むことも可能です。

```

loadFontawesome("url");


```

おわります。
