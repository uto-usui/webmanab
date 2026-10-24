---
id: 985
type: lab
slug: "processing-js-square"
title: "矩形を描く -『processing.js』"
date: 2017-01-31T18:13:34+09:00
modified: 2017-01-31T19:02:19+09:00
excerpt: "processing.jsで矩形を描きます。 矩形を描く // 線の太さ strokeWeight(5); // rect(左上頂点のx座標, 左上頂点のy座標, 幅, 高さ) rect(30, 100, 100, 18"
primaryTag: "processing.js"
terms:
  - { id: 174, name: "canvas", slug: "canvas" }
  - { id: 259, name: "processing.js", slug: "processing-js" }
demoUrl: https://jsfiddle.net/yutousui/qk8sc068/
legacy:
  prev: processing-js-line-and-point
  next: processing-js-circle
---

processing.jsで矩形を描きます。

#### 矩形を描く

```

// 線の太さ
strokeWeight(5);

// rect(左上頂点のx座標, 左上頂点のy座標, 幅, 高さ)
rect(30, 100, 100, 180);

// 座標指定を設定する
rectMode(CORNERS);
// rect(左上頂点のx座標, 左上頂点のy座標, 右下頂点のx座標, 右下頂点のy座標)
rect(350, 100, 400, 50);

rectMode(CENTER);
// rect(中心のx座標, 中心のy座標, 幅, 高さ)
rect(200, 150, 100, 100);

rectMode(RADIUS);
// rect(中心のx座標, 中心のy座標, 幅の半分, 高さの半分)
rect(200, 150, 100, 100);

// 塗りつぶさない
noFill();

// 自由に矩形を描く
// quad(x1, y1, x2, y2, x3, y3, x4, y4)
quad(38, 31, 86, 20, 69, 63, 30, 76);


```

<p><iframe width="100%" height="500" src="//jsfiddle.net/yutousui/qk8sc068/embedded/result,js/dark/" allowfullscreen frameborder="0"></iframe></p>
