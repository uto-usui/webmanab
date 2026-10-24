---
id: 1173
type: lab
slug: "createjs-round-motion-trigonometric"
title: "三角関数(sinθ)を使った丸のモーション -『Create.js』　"
date: 2017-03-01T10:33:47+09:00
modified: 2017-03-01T10:37:24+09:00
excerpt: "サイン波に沿って丸を動かす window.addEventListener(“load”, init); function init() { var stage = new createjs.Stage(“myCanva"
primaryTag: "Createjs"
terms:
  - { id: 174, name: "canvas", slug: "canvas" }
  - { id: 173, name: "CreateJs", slug: "createjs" }
demoUrl: https://jsfiddle.net/yutousui/4dL339yw/
legacy:
  prev: create-js-line-motion-trigonometric-sin
  next: createjs-beat-motion-trigonometric
---

- サイン波に沿って丸を動かす

```

window.addEventListener("load", init);

function init() {
  var stage = new createjs.Stage("myCanvas");
  //
  var ball = new createjs.Shape();
  ball.graphics.beginFill('#aaaaaa').drawCircle(0, 0, 30);
  stage.addChild(ball);
  var angle = 0;
  var centerY = 100; // 中心座標
  var range = 50; // 変化幅
  var xSpeed = 1;
  var ySpeed = 0.05;
  // 時間経過
  createjs.Ticker.addEventListener("tick", handleTick);
  function handleTick() {
    ball.x += xSpeed;
    ball.y = centerY + Math.sin(angle) * range;
    angle += ySpeed;
    // 画面端
    if (ball.x > stage.canvas.width) {
      ball.x = 0;
    }
    stage.update();
  }
  createjs.Ticker.timingMode = createjs.Ticker.RAF;
}


```

<p><iframe width="100%" height="400" src="//jsfiddle.net/yutousui/4dL339yw/embedded/result,js/dark/" allowfullscreen frameborder="0"></iframe></p>
