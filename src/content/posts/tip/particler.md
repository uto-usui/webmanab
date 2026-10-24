---
id: 447
type: tip
slug: "particler"
title: "少し素敵な表現を試したい。さくっとパーティクルを実装するスクリプト「particler」 -『plug-in』"
date: 2016-09-13T19:39:24+09:00
modified: 2017-02-17T17:44:30+09:00
excerpt: "さくっとパーティクルを実装するためのスクリプトです。 javascript // option var particlerOptions = { // Amount of particles quantity: 20,"
primaryTag: "interactive"
terms:
  - { id: 130, name: "canvas", slug: "canvas" }
  - { id: 96, name: "effect", slug: "effect" }
  - { id: 128, name: "interactive", slug: "interactive" }
  - { id: 29, name: "javascript", slug: "javascript" }
  - { id: 85, name: "plug-in", slug: "plug-in" }
legacy:
  prev: shape
  next: css-selection
---

さくっとパーティクルを実装するためのスクリプトです。

#### javascript

```html


// option
var particlerOptions = {

  // Amount of particles
  quantity: 20,

  // line width
  lineWidth: 0.05,

  // color of particles
  fillColor: "black",

  // sizes
  minSize: 1,
  maxSize: 3,

  // minimal line length
  minimalLineLength: 250,

  // speed
  speed: 25,

  // framerate
  frameDuration: 20,

  // background
  backgroundColor: 'transparent'
};

// initialize
var particlerExample = new Particler("particler-instance", particlerOptions);



```

#### MITライセンス

- [particler GitHub](https://github.com/bereziuk/particler)
- [particler デモページ](http://bereziuk.com/particler.html)

おわります。
