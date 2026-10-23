---
id: 984
type: lab
slug: "processing-js-line-and-point"
title: "点と線を描く -『processing.js』"
date: 2017-01-31T17:55:03+09:00
modified: 2017-01-31T17:55:16+09:00
excerpt: "processing.jsで点と線を描きます。 点を描く // point(x, y) point(50, 50); 直線を描く // line(1x, 1y, 2x, 2y) line(0, 200, 300, 50)"
primaryTag: "processing.js"
terms:
  - { id: 174, name: "canvas", slug: "canvas" }
  - { id: 259, name: "processing.js", slug: "processing-js" }
demoUrl: https://jsfiddle.net/yutousui/d2y41xkn/
legacy:
  prev: processing-js-triangle
  next: processing-js-square
---

processing.jsで点と線を描きます。

#### 点を描く

```

// point(x, y)
point(50, 50);


```

#### 直線を描く

```

// line(1x, 1y, 2x, 2y)
line(0, 200, 300, 50);
// 線幅
strokeWeight(20);


```

<p><iframe width="100%" height="500" src="//jsfiddle.net/yutousui/d2y41xkn/embedded/result,js/dark/" allowfullscreen frameborder="0"></iframe></p>
