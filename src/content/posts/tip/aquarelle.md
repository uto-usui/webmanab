---
id: 261
type: tip
slug: "aquarelle"
title: "素敵な表現を試したい。水彩のエフェクトを実装するスクリプト「Aquarelle」 -『plug-in』"
date: 2016-07-24T17:18:49+09:00
modified: 2017-02-17T18:14:04+09:00
excerpt: "webGLベースで動く、水彩の美しいエフェクトを実装スクリプト。 実装はやや難しいですが、デモサイトを参考にしつつ頑張りましょう。オプションやメソッドが細かく用意されています。 javascript var fade ="
primaryTag: "webGL"
terms:
  - { id: 130, name: "canvas", slug: "canvas" }
  - { id: 96, name: "effect", slug: "effect" }
  - { id: 128, name: "interactive", slug: "interactive" }
  - { id: 29, name: "javascript", slug: "javascript" }
  - { id: 85, name: "plug-in", slug: "plug-in" }
  - { id: 129, name: "webGL", slug: "webgl" }
legacy:
  prev: genymotion
  next: mulch-border
---

webGLベースで動く、水彩の美しいエフェクトを実装スクリプト。\
実装はやや難しいですが、デモサイトを参考にしつつ頑張りましょう。オプションやメソッドが細かく用意されています。

#### javascript

```html


var fade = $('#canvas-outer').get(0);
var image = $('#image').get(0);

// new Aquarelle(textureImage, maskImage, options)
var aquarelle = new Aquarelle(image, 'img/mask.png', {

  // play
  autoplay: true,
  loop: false,

  // depth
  fromAmplitude: 200,
  toAmplitude: 0,

  // mask size
  fromOffset: -30,
  toOffset: 28,

  // noise
  fromFrequency: 8,
  toFrequency: 6,

  // speed
  duration: 2000

});

// initialize
aquarelle.addEventListener('created', function () {
  var canvas = this.getCanvas();
  canvas.removeAttribute('style');
  $('#canvas-outer').append(canvas);
});


// more effect
aquarelle.addEventListener('changed', function (event) {

  // transitionInRange(startValue, endValue[, startTimeMS[, endTimeMS]])
  fade.style.opacity = this.transitionInRange(0, 1);

  var canvas = this.getCanvas();
  canvas.style.webkitTransform = canvas.style.transform = 'translate(-50%, -50%) scale(' + this.transitionInRange(.5, 1) + ')';

});



```

#### MITライセンス

- [Aquarelle GitHub](https://github.com/Ramotion/aquarelle)
- [Aquarelle デモページ](https://ramotion.github.io/aquarelle/)

#### 実装参考

- [Cool Watercolor Effects With JavaScript And Three.js](http://www.cssscript.com/cool-watercolor-effects-javascript-three-js-aquarelle/)

おわります。
