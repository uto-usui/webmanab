---
id: 1177
type: lab
slug: "createjs-node-motion"
title: "ノードを動かす -『Create.js』　"
date: 2017-03-01T11:14:52+09:00
modified: 2017-03-01T11:14:52+09:00
excerpt: "点と線で構成されたノードを動かします window.addEventListener(“load”, init); var stage; var stageWidth; var stageHeight; var ball"
primaryTag: "Createjs"
terms:
  - { id: 174, name: "canvas", slug: "canvas" }
  - { id: 173, name: "CreateJs", slug: "createjs" }
demoUrl: https://jsfiddle.net/yutousui/grbz1m8q/
legacy:
  prev: createjs-gravity-and-friction
  next: css-embed-images-scroll-the-screen-iphone6-outline-mockup
---

- 点と線で構成されたノードを動かします

```

window.addEventListener("load", init);

var stage;
var stageWidth;
var stageHeight;
var balls = [];
var ballCount = 30;
var ratio = 1 / 2000;
var max = 100;
var limit = max * max;
var colorInt = Math.floor(Math.random() * 0xFFFFFF) * 1000;
var background = new createjs.Shape();
//
function init() {
  var color = createjs.Graphics.getRGB(colorInt);
  var canvasElement = document.getElementById("myCanvas");
  stage = new createjs.Stage(canvasElement);
  stageWidth = canvasElement.width;
  stageHeight = canvasElement.height;
  stage.addChild(background);
  for (var i = 0; i < ballCount; i++) {
    var nX = Math.random() * stageWidth;
    var nY = Math.random() * stageHeight;
    var velocityX = (Math.random() - 0.5) * 5;
    var velocityY = (Math.random() - 0.5) * 5;
    var ball = createBall(2, color, nX, nY, velocityX, velocityY);
    balls.push(ball);
    stage.addChild(ball);
  }
  createjs.Ticker.addEventListener("tick", move);
}
function createBall(radius, color, nX, nY, velocityX, velocityY) {
  var ball = new createjs.Shape();
  drawBall(ball.graphics, radius, color);
  ball.x = nX;
  ball.y = nY;
  ball.velocityX = velocityX;
  ball.velocityY = velocityY;
  return ball;
}
function drawBall(myGraphics, radius, color) {
  myGraphics.beginFill(color);
  myGraphics.drawCircle(0, 0, radius);
}
function move(eventObject) {
  for (var i = 0; i < ballCount; i++) {
    var ball = balls[i];
    var nX = ball.x;
    var nY = ball.y;
    nX += ball.velocityX;
    nY += ball.velocityY;
    ball.x = roll(nX, stageWidth);
    ball.y = roll(nY, stageHeight);
  }
  background.graphics.clear();
  for (i = 0; i < ballCount - 1; i++) {
    var ball0 = balls[i];
    for (var j = i + 1; j < ballCount; j++) {
      var ball1 = balls[j];
      spring(ball0, ball1);
    }
  }
  stage.update();
}
function roll(value, length) {
  if (value > length) {
    value -= length;
  } else if (value < 0) {
    value += length;
  }
  return value;
}
function spring(object0, object1) {
  var _0x = object0.x;
  var _0y = object0.y;
  var _1x = object1.x;
  var _1y = object1.y;
  var distanceX = _1x - _0x;
  var distanceY = _1y - _0y;
  var squareX = distanceX * distanceX;
  var squareY = distanceY * distanceY;
  if (squareX + squareY < limit) {
    var distance = Math.sqrt(squareX + squareY);
    var color = createjs.Graphics.getRGB(colorInt, (max - distance) / max);
    var accelX = distanceX * ratio;
    var accelY = distanceY * ratio;
    object0.velocityX += accelX;
    object0.velocityY += accelY;
    object1.velocityX -= accelX;
    object1.velocityY -= accelY;
    drawLine(1, color, _0x, _0y, _1x, _1y);
  }
}
function drawLine(stroke, color, beginX, beginY, endX, endY) {
  var myGraphics = background.graphics;
  myGraphics.setStrokeStyle(stroke);
  myGraphics.beginStroke(color);
  myGraphics.moveTo(beginX, beginY);
  myGraphics.lineTo(endX, endY);
}


```

<p><iframe width="100%" height="400" src="//jsfiddle.net/yutousui/grbz1m8q/embedded/result,js/dark/" allowfullscreen frameborder="0"></iframe></p>
