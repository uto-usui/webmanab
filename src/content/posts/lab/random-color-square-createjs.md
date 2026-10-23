---
id: 442
type: lab
slug: "random-color-square-createjs"
title: "四角を描いてランダムな色で塗る -『CreateJS』"
date: 2016-08-24T15:00:41+09:00
modified: 2016-08-24T15:01:12+09:00
excerpt: "CreateJsを使って四角と角丸四角をcanvasに描いてみます。 リファレンスはいろいろな形のシェイプを描画するまでのCreateJS基礎にて参照。 JavaScript var stage; function in"
primaryTag: "createJS"
terms:
  - { id: 174, name: "canvas", slug: "canvas" }
  - { id: 173, name: "CreateJs", slug: "createjs" }
  - { id: 176, name: "javascript", slug: "javascript" }
  - { id: 175, name: "library", slug: "library" }
legacy:
  prev: star-random-color-createjs
  next: star-rotate-animation-createjs
---

CreateJsを使って四角と角丸四角を`canvas`に描いてみます。

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

// 四角
function drawA (myGraphics) {
  var color = randColorCreate();
  // 塗り
  // drawRect(X, Y, 幅, 高さ)
  myGraphics.beginFill(color).drawRect(0, 0, 50, 50);
  // 更新
  stage.update();
}

// 角丸四角
function drawB (myGraphics) {
  var color = randColorCreate();
  // drawRoundRect(X, Y,幅, 高さ, 角丸の幅, 角丸の高さ)
  myGraphics.beginStroke(color).setStrokeStyle(3).drawRoundRect(100, 100, 50, 50, 10, 10);
  //
  stage.update();
}

init();

```

<p><iframe width="100%" height="500" src="//jsfiddle.net/yutousui/gjorzf2w/embedded/result,js,html/dark/" allowfullscreen frameborder="0"></iframe></p>
