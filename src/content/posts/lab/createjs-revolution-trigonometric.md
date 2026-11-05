---
id: 1175
type: lab
slug: "createjs-revolution-trigonometric"
title: "三角関数(sinθ/cosθ)を使った公転 -『Create.js』　"
date: 2017-03-01T10:48:59+09:00
modified: 2017-03-01T10:56:08+09:00
excerpt: "円周上を公転するように動く丸 window.addEventListener(“load”, init); function init() { var stage = new createjs.Stage(“myCanv"
primaryTag: "Createjs"
terms:
  - { id: 174, name: "canvas", slug: "canvas" }
  - { id: 173, name: "CreateJs", slug: "createjs" }
demoUrl: https://labobal.dev/createjs-revolution-trigonometric/
legacy:
  prev: createjs-beat-motion-trigonometric
  next: createjs-gravity-and-friction
---

- 円周上を公転するように動く丸

```
window.addEventListener("load", init);

function init() {
  var stage = new createjs.Stage("myCanvas");
  //
  var ball = new createjs.Shape();
  ball.graphics.beginFill('#888888').drawCircle(0, 0, 10);
  stage.addChild(ball);
  //
  var angle = 0;
  var centerX = stage.canvas.width / 2;
  var centerY = stage.canvas.height / 2;
  var radius = 100;
  var speed = .01;
  // 時間経過
  createjs.Ticker.addEventListener("tick", handleTick);
  function handleTick() {
    ball.x = centerX + Math.cos(angle) * radius;
    ball.y = centerY + Math.sin(angle) * radius;
    angle += speed;
    stage.update(); // 画面更新
  }
  //
  var bg = new createjs.Shape();
  bg.graphics.setStrokeStyle(1).beginStroke("LightGray").drawCircle(centerX, centerY, radius);
  stage.addChildAt(bg, 0);

  createjs.Ticker.timingMode = createjs.Ticker.RAF;
}


```

<p><iframe src="https://labobal.dev/createjs-revolution-trigonometric/" width="100%" height="400" loading="lazy" title="sin と cos で公転する丸（デモ）" allow="fullscreen"></iframe></p>

[別のタブで開く](https://labobal.dev/createjs-revolution-trigonometric/)
