---
id: 1176
type: lab
slug: "createjs-gravity-and-friction"
title: "シンプルな重力と摩擦の表現 -『Create.js』"
date: 2017-03-01T10:55:26+09:00
modified: 2017-03-01T10:55:26+09:00
excerpt: "シンプルな丸パーティクルを使った重力と摩擦の表現 window.addEventListener(“load”, init); function init() { // ステージを作成 var stage = new c"
primaryTag: "Createjs"
terms:
  - { id: 174, name: "canvas", slug: "canvas" }
  - { id: 173, name: "CreateJs", slug: "createjs" }
demoUrl: https://jsfiddle.net/yutousui/omnrhpx0/
legacy:
  prev: createjs-revolution-trigonometric
  next: createjs-node-motion
---

- シンプルな丸パーティクルを使った重力と摩擦の表現

```

window.addEventListener("load", init);

function init() {
  // ステージを作成
  var stage = new createjs.Stage("myCanvas");
  // パーティクルの大きさ(半径)
  var size = 10;
  var particle = new createjs.Shape();
  particle.graphics.beginFill('hsl(160,65%,70%)').drawCircle(0, 0, size);
  stage.addChild(particle);
  particle.x = stage.canvas.width / 2;
  particle.y = 0;
  // 速度情報
  var vy = 0;
  // 時間経過
  createjs.Ticker.addEventListener("tick", handleTick);
  //
  function handleTick() {
    // 重力
    vy += .5;
    // 摩擦
    vy *= 0.95;
    //
    particle.y += vy;
    // 地面の作成
    if (particle.y > stage.canvas.height - size) {
      particle.y = stage.canvas.height - size; // 行き過ぎを補正
      vy *= -1; // Y軸の速度を反転
    }
    // ステージの更新
    stage.update();
  }
  createjs.Ticker.timingMode = createjs.Ticker.RAF;
}


```

<p><iframe width="100%" height="400" src="//jsfiddle.net/yutousui/omnrhpx0/embedded/result,js/dark/" allowfullscreen frameborder="0"></iframe></p>
