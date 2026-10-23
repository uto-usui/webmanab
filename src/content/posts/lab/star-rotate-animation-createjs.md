---
id: 444
type: lab
slug: "star-rotate-animation-createjs"
title: "星を描画して回転させるアニメーション -『CreateJS』"
date: 2016-08-24T18:05:40+09:00
modified: 2016-08-24T18:05:40+09:00
excerpt: "CreateJsを使って星を回転のアニメーションを加えて、canvasに描いてみます。 JavaScript var stage; function init() { stage = new createjs.Stage"
primaryTag: "createJS"
terms:
  - { id: 174, name: "canvas", slug: "canvas" }
  - { id: 173, name: "CreateJs", slug: "createjs" }
  - { id: 176, name: "javascript", slug: "javascript" }
  - { id: 175, name: "library", slug: "library" }
legacy:
  prev: random-color-square-createjs
  next: css-cube-animation
---

CreateJsを使って星を回転のアニメーションを加えて、`canvas`に描いてみます。

#### JavaScript

```js

var stage;

function init() {
  stage = new createjs.Stage('myCanvas');
  var myShape = new createjs.Shape();
  stage.addChild(myShape);
  myShape.x = 100;
  myShape.y = 100;
  //
  draw(myShape.graphics);
  //
  // 常にStageを更新 
  createjs.Ticker.addEventListener('tick', stage);
  // 適切なフレームレート
  createjs.Ticker.timingMode = createjs.Ticker.RAF;
  // イベントを登録
  createjs.Ticker.addEventListener('tick',rotate);
  //
  // 回転のアニメーション
  function rotate() {
   myShape.rotation += .5;
  }
}

function draw(myGraph) {
  var randNum = Math.floor(Math.random() * 0xFFFFFF);
  var randColor = createjs.Graphics.getRGB(randNum);
  // 星を描画
  myGraph.beginFill(randColor).drawPolyStar(0, 0, 50, 5,.5,-90);
  // 更新
  stage.update();
}

init();


```

<p><iframe width="100%" height="500" src="//jsfiddle.net/yutousui/6h97y09b/embedded/result,js,html/dark/" allowfullscreen frameborder="0"></iframe></p>
