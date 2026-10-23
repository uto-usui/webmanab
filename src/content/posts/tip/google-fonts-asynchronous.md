---
id: 122
type: tip
slug: "google-fonts-asynchronous"
title: "少しのスクリプトと「webfont.js」を使って、非同期に複数のGoogle Fontsを読み込む方法 – 『front-end』"
date: 2017-01-19T20:06:18+09:00
modified: 2017-02-13T21:37:55+09:00
excerpt: "Google FontsをWeb Font Loaderを使って非同期に読み込むtipsです。 Google Fontsを高速で利用する Google Fontsは無料で美しいウェブフォントを利用でき、種類も豊富で、世界"
primaryTag: "frontend"
terms:
  - { id: 84, name: "asynchronous", slug: "asynchronous" }
  - { id: 232, name: "font", slug: "font" }
  - { id: 238, name: "frontend", slug: "frontend" }
  - { id: 29, name: "javascript", slug: "javascript" }
  - { id: 82, name: "speed", slug: "speed" }
legacy:
  prev: javascript-contains-string
  next: async-load-fonttawesome
---

Google FontsをWeb Font Loaderを使って非同期に読み込むtipsです。

## Google Fontsを高速で利用する

Google Fontsは無料で美しいウェブフォントを利用でき、種類も豊富で、世界中のサイトで頻繁に導入されています。

Web Font Loaderを利用することで、非同期にレンダリングをブロックされることなくGoogle fontsを利用します。\
`Webfont`オブジェクトを利用し、配列でフォント名を列挙して格納することで複数の読み込みを非同期に行います。\
`</body>`の上部に以下の記述を挿入します。

```html

WebFontConfig = {
  google: { families: [ 'Roboto','Dancing+Script:400,700:latin' ] }
};
(function() {
  var wf = document.createElement('script');
  wf.src = 'https://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js';
  wf.type = 'text/javascript';
  wf.async = 'true';
  var s = document.getElementsByTagName('script')[0];
  s.parentNode.insertBefore(wf, s);
})();

```

`families: []`の中に読み込みたいフォント名を記述します。

### Googlefontsをさがす

googleフォントはいけてるフォントが多数存在しているので、好みのを見つけたり選定するのに苦労しますが、先人たちが目方をつけてくれています。\
参考にすると目的のものに簡単にたどり着くことができますので、感謝です。合掌。

- [超厳選！Googleフォントおすすめ40選を用途別に紹介【導入方法解説付き】 – F Lab.](http://lahtnas.hateblo.jp/entry/google-fonts)
- [おすすめのGoogle Web Fonts 25選 | それからデザイン スタッフブログ](http://sole-color-blog.com/blog/design/13/)
- [ウェブページを一瞬でオシャレにするオススメのGoogle Web Fontsを厳選してみた – Literally](http://tsukuruiroiro.hatenablog.com/entry/2014/09/05/165721)

おわります。
