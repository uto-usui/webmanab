---
id: 1172
type: lab
slug: "create-js-line-motion-trigonometric-sin"
title: "三角関数(sinθ)を使った線のモーション -『Create.js』　"
date: 2017-03-01T10:30:30+09:00
modified: 2017-03-01T10:30:30+09:00
excerpt: "サイン波を線で描画する window.addEventListener(“load”, init); function init() { var stage = new createjs.Stage(“myCanvas”"
primaryTag: "Createjs"
terms:
  - { id: 174, name: "canvas", slug: "canvas" }
  - { id: 173, name: "CreateJs", slug: "createjs" }
demoUrl: https://jsfiddle.net/yutousui/7s1wt0y1/
legacy:
  prev: jqueryui-simple-calender
  next: createjs-round-motion-trigonometric
---

- サイン波を線で描画する

```

window.addEventListener("load", init);

function init() {
  var stage = new createjs.Stage("myCanvas");
  //
  var shape = new createjs.Shape();
  stage.addChild(shape);
  //
  var angleY = 0;
  var centerY = stage.canvas.height / 2;
  var range = 80;
  var speedX = .2;
  var speedY = .02;
  var px = 0;
  shape.graphics.setStrokeStyle(1).beginStroke('#888888').moveTo(0, centerY);
  //
  createjs.Ticker.addEventListener("tick", handleTick);
  function handleTick() {
    px += speedX;
    var py = centerY + Math.sin(angleY) * range;
    angleY += speedY;
    //
    shape.graphics.lineTo(px, py);
    stage.update();
  }
  createjs.Ticker.timingMode = createjs.Ticker.RAF;
}


```

<p><iframe width="100%" height="400" src="//jsfiddle.net/yutousui/7s1wt0y1/embedded/result,js/dark/" allowfullscreen frameborder="0"></iframe></p>
