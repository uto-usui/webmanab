---
id: 117
type: tip
slug: "polar-coordinates"
title: "JavaScriptで幾何学模様や図形の描画に必要な極座標の計算をする – 『JavaScript』"
date: 2016-06-25T17:51:34+09:00
modified: 2019-02-14T19:10:03+09:00
excerpt: "canvasでシェイプを作成するためにピクセル位置を指定するときに、 極座標系を使って(x,y)座標を求めるtipsです。 極座標とは 極座標とは原点からの半径と原点を中心とした回転角度(r,θ)によって空間の点を決定し"
primaryTag: "math"
terms:
  - { id: 29, name: "javascript", slug: "javascript" }
  - { id: 79, name: "math", slug: "math" }
demoUrl: https://jsfiddle.net/yutousui/mram5w70/
legacy:
  prev: retina-mixin
  next: css-compile-sass
---

`canvas`でシェイプを作成するためにピクセル位置を指定するときに、\
極座標系を使って`(x,y)`座標を求めるtipsです。

## 極座標とは

極座標とは原点からの半径と原点を中心とした回転角度`(r,θ)`によって空間の点を決定します。\
円形に要素を配置させたいときなどに、極座標をループさせて連続して求めて、デカルト座標`(x,y)`に変換したりします。

### 極座標　→　デカルト座標

極座標をデカルト座標に変換する式は以下のようになります。

`cos(theta) = x/r → x = r * cos(theta)`\
`sin(theta) = y/r → y = r * sin(theta)`

### ラジアンへの変換

`theta`の角度はラジアンという単位に変換し利用します。\
`radian`という変数に格納する場合は以下のように記述します。

#### javascript

```js

var radian = angle * Math.PI / 180

```

### CreateJSを使って円状にシェイプを描く

CreateJSで円形にシェイプを描きます。

#### html

```html

<canvas id="myCanvas" width="250" height="250"></canvas>
<script src="https://code.createjs.com/createjs-2015.05.21.min.js"></script>

```

#### javascript

```js

window.addEventListener("load", init);

function init() {
  var canvas = document.getElementById('myCanvas');
  var stage = new createjs.Stage(canvas);
  var clock = new createjs.Container();
  //
  clock.x = canvas.width / 2;
  clock.y = canvas.height / 2;
  stage.addChild(clock);
  //
  var bg = new createjs.Shape();
  bg.graphics.setStrokeStyle(1).beginStroke('#888888').drawCircle(0, 0, 100);
  clock.addChild(bg);
  // 目盛りを描画
  var steps = 60; // 目盛りの数
  //
  for (var i = 0; i < steps; i++) {
    var angle = i * (360 / steps);
    var radian = angle * Math.PI / 180;
    // 始点
    var startX = 95 * Math.cos(radian);
    var startY = 95 * Math.sin(radian);
    // 終点
    var endX = 100 * Math.cos(radian);
    var endY = 100 * Math.sin(radian);
    //
    bg.graphics.setStrokeStyle(1).beginStroke("#888888").moveTo(startX, startY).lineTo(endX, endY);
  }
  createjs.Ticker.addEventListener("tick", stage);
}

```
