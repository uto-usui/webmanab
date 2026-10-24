---
id: 462
type: tip
slug: "hammer-js"
title: "タッチデバイス用に、簡単にタッチジェスチャーを実装するHammer.js -『plug-in』"
date: 2016-10-04T17:09:45+09:00
modified: 2017-02-17T17:41:50+09:00
excerpt: "タッチジェスチャーを実装する スマホやタブレットなどのデバイスに、タッチジェスチャーを実装したいときに利用したいライブラリがHammer.jsです。 jQueryと一緒に使ってやると、非常に簡単にタッチジェスチャーを組み"
primaryTag: "plug-in"
terms:
  - { id: 128, name: "interactive", slug: "interactive" }
  - { id: 268, name: "mobile", slug: "mobile" }
  - { id: 85, name: "plug-in", slug: "plug-in" }
  - { id: 39, name: "responsive", slug: "responsive" }
legacy:
  prev: transition
  next: divide-retina
---

## タッチジェスチャーを実装する

スマホやタブレットなどのデバイスに、タッチジェスチャーを実装したいときに利用したいライブラリがHammer.jsです。\
jQueryと一緒に使ってやると、非常に簡単にタッチジェスチャーを組み込むことができ、通常jQueryに用意されていないジェスチャーイベントを簡単に実装できます。

まずはダウンロード。

- [Hammer.js](http://hammerjs.github.io/)
- [Hammer.js GitHab](https://github.com/hammerjs/hammer.js/)

jQueryと一緒に利用したいので、jquery.hammer.jsも一緒に読み込みます。\
`tap` `doubletap` `press` `horizontal` `pan` `swipe` `pinch` `rotate`などをキーワードに、ジェスチャーを`.on`の引数に取ります。

#### html

```html

<script src="yourpass/jquery.js"></script>
<script src="yourpass/hammer.js"></script>
<script src="yourpass/jquery.hammer.js"></script>
<script>
$('#ex').hammer().on('swipe', function(){
  // ここで何かする
});
</script>


```

おわります。
