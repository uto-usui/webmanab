---
id: 1174
type: lab
slug: "createjs-beat-motion-trigonometric"
title: "三角関数(sinθ)を使ったビートモーション -『Create.js』　"
date: 2017-03-01T10:39:57+09:00
modified: 2017-03-01T10:39:57+09:00
excerpt: "サイン波で作るリズムに脈打つ丸 window.addEventListener(“load”, init); function init() { var stage = new createjs.Stage(“myCan"
primaryTag: "Createjs"
terms:
  - { id: 174, name: "canvas", slug: "canvas" }
  - { id: 173, name: "CreateJs", slug: "createjs" }
demoUrl: https://jsfiddle.net/yutousui/swsha6gf/
legacy:
  prev: createjs-round-motion-trigonometric
  next: createjs-revolution-trigonometric
---

- サイン波で作るリズムに脈打つ丸

```

window.addEventListener("load", init);

function init() {
  var stage = new createjs.Stage("myCanvas");
  //
  var ball = new createjs.Shape();
  ball.graphics.beginFill('#888888').drawCircle(0, 0, 30);
  ball.x = stage.canvas.width / 2; // 画面中央に配置
  ball.y = stage.canvas.height / 2;
  stage.addChild(ball);
  var angle = 0;
  var centerScale = 1.0;
  var range = 0.5;
  var speed = .1;
  // 時間経過
  createjs.Ticker.addEventListener("tick", handleTick);
  function handleTick() {
    // スケールを変化
    ball.scaleX = ball.scaleY = centerScale + Math.sin(angle) * range;
    angle += speed;
    stage.update();
  }
  createjs.Ticker.timingMode = createjs.Ticker.RAF;
}


```

<p><iframe width="100%" height="400" src="//jsfiddle.net/yutousui/swsha6gf/embedded/result,js/dark/" allowfullscreen frameborder="0"></iframe></p>
