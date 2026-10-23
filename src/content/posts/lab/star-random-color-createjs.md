---
id: 440
type: lab
slug: "star-random-color-createjs"
title: "星を描いてランダムな色で塗る -『CreateJS』"
date: 2016-08-23T18:47:06+09:00
modified: 2016-08-23T18:53:14+09:00
excerpt: "CreateJsを使って星をcanvasに描いてみます。 JavaScript var stage; function init() { stage = new createjs.Stage(‘myCanvas’); v"
primaryTag: "createJS"
terms:
  - { id: 174, name: "canvas", slug: "canvas" }
  - { id: 173, name: "CreateJs", slug: "createjs" }
  - { id: 176, name: "javascript", slug: "javascript" }
  - { id: 175, name: "library", slug: "library" }
legacy:
  prev: random-color-circle-createjs
  next: random-color-square-createjs
---

CreateJsを使って星を`canvas`に描いてみます。

#### JavaScript

```js

var stage;

function init() {
  stage = new createjs.Stage('myCanvas');
  var shape = new createjs.Shape();
  stage.addChild(shape);
  //
  shape.x = 50;
  shape.y = 50;
  //
  draw(shape.graphics);
}

function draw(myGraph) {
  // ランダムなカラー値
  var randNum = Math.floor(Math.random() * 0xFFFFFF);
  var randColor = createjs.Graphics.getRGB(randNum);
  // graphics.drawPolyStar(x, y, r, 頂点の数, 谷の深さ, 起点の角度)
  myGraph.beginFill(randColor).drawPolyStar(50, 50, 50, 5,.5,-90);
  //
  stage.update();
}

init();

```

<p><iframe width="100%" height="500" src="//jsfiddle.net/yutousui/b31yvc1u/embedded/result,js,html/dark/" allowfullscreen frameborder="0"></iframe></p>
