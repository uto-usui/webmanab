---
id: 986
type: lab
slug: "processing-js-circle"
title: "円を描く -『processing.js』"
date: 2017-01-31T18:23:25+09:00
modified: 2017-01-31T19:02:03+09:00
excerpt: "processing.jsで円を描きます。 円を描く // 円を描く // ellipse(x, y, w, h) ellipse(100, 100, 100, 50); // 塗り潰さない noFill(); // 座"
primaryTag: "processing.js"
terms:
  - { id: 174, name: "canvas", slug: "canvas" }
  - { id: 259, name: "processing.js", slug: "processing-js" }
demoUrl: https://jsfiddle.net/yutousui/zfbL36h3/
legacy:
  prev: processing-js-square
  next: processing-js-gradation-dot
---

processing.jsで円を描きます。

#### 円を描く

```

// 円を描く
// ellipse(x, y, w, h)
ellipse(100, 100, 100, 50);

// 塗り潰さない
noFill();

// 座標指定の設定
ellipseMode(CENTER);
// ellipse(中心のx座標, 中心のy座標, 横直径, 縦直径) >> デフォルト
ellipse(200, 150, 50, 50);

ellipseMode(RADIUS);
// ellipse(中心のx座標, 中心のy座標, 横半径, 縦半径)
ellipse(200, 150, 50, 50);

ellipseMode(CORNER);
// ellipse(ボックス左上頂点のx座標, ボックスの左上頂点のy座標, 横直径, 縦直径)
ellipse(100, 200, 100, 100);

ellipseMode(CORNERS);
// ellipse(ボックスの左上頂点のx座標, ボックスの左上頂点のy座標, ボックスの右下頂点のx座標, ボックスの右下頂点のy座標)
ellipse(0, 200, 100, 300);


```

<p><iframe width="100%" height="500" src="//jsfiddle.net/yutousui/zfbL36h3/embedded/result,js/dark/" allowfullscreen frameborder="0"></iframe></p>
