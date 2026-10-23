---
id: 438
type: lab
slug: "random-color-circle-createjs"
title: "円を描いてランダムな色で塗る -『CreateJS』"
date: 2016-08-23T18:16:31+09:00
modified: 2016-08-24T14:59:19+09:00
excerpt: "CreateJsを使って円をcanvasに描いてみます。 リファレンスはいろいろな形のシェイプを描画するまでのCreateJS基礎にて参照。 JavaScript var stage; function init() {"
primaryTag: "createJS"
terms:
  - { id: 174, name: "canvas", slug: "canvas" }
  - { id: 173, name: "CreateJs", slug: "createjs" }
  - { id: 176, name: "javascript", slug: "javascript" }
  - { id: 175, name: "library", slug: "library" }
legacy:
  prev: null
  next: star-random-color-createjs
---

CreateJsを使って円を`canvas`に描いてみます。

リファレンスはいろいろな形のシェイプを描画するまでのCreateJS基礎にて参照。

#### JavaScript

```js

var stage;

function init() {
  // ステージオブジェクト作成
  stage = new createjs.Stage('myCanvas');
  // シェイプ作成
  var shapeA = new createjs.Shape();
  var shapeB = new createjs.Shape();
  // 表示リストに追加
  stage.addChild(shapeA);
  stage.addChild(shapeB);
  // 座標
  shapeA.x = 50;
  shapeA.y = 50;
  shapeB.x = 50;
  shapeB.y = 50;
  // 描画
  drawA(shapeA.graphics);
  drawB(shapeB.graphics);
}

// ランダムカラー生成
function randColorCreate () {
  var randNum = Math.floor(Math.random() * 0xFFFFFF);
  var randColor = createjs.Graphics.getRGB(randNum);
  return randColor;
}

function drawA (myGraphics) {
  var color = randColorCreate();
  // 塗り
  myGraphics.beginFill(color).drawCircle(50,50,30);
  // 更新
  stage.update();
}

function drawB (myGraphics) {
  var color = randColorCreate();
  myGraphics.beginStroke(color).setStrokeStyle(3).drawCircle(100,100,30);
  stage.update();
}

init();


```

<p><iframe width="100%" height="500" src="//jsfiddle.net/yutousui/vjj3xuam/embedded/result,js,html/dark/" allowfullscreen frameborder="0"></iframe></p>
