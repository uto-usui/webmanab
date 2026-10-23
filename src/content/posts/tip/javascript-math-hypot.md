---
id: 2271
type: tip
slug: "javascript-math-hypot"
title: "２点間の距離を求める関数 Math.hypot() -『JavaScript』"
date: 2018-02-05T19:55:46+09:00
modified: 2018-02-05T19:55:46+09:00
excerpt: "アニメーションなどインタラクティブコンテンツを実装するときなどに、よく２転換の距離を求めることがあります。 (x0, y0) と (x1, y1) の距離を求めるということです。 ES6 から用意された、Math.hyp"
primaryTag: "javascript"
terms:
  - { id: 2, name: "animation", slug: "animation" }
  - { id: 128, name: "interactive", slug: "interactive" }
  - { id: 29, name: "javascript", slug: "javascript" }
legacy:
  prev: flat-ui-colors-2
  next: 30-seconds-of-code
---

アニメーションなどインタラクティブコンテンツを実装するときなどに、よく２転換の距離を求めることがあります。 `(x0, y0)` と `(x1, y1)` の距離を求めるということです。

ES6 から用意された、`Math.hypot()` 関数を利用します。

```js

const distance = (x0, y0, x1, y1) => Math.hypot(x1 - x0, y1 - y0);
distance(1, 1, 2, 3);


```

IEではサポートされていないので、必要に応じてポリフィルを定義します。

```js

Math.hypot = Math.hypot || () => {
  let y = 0;
  let length = arguments.length;

  for (var i = 0; i < length; i++) {
    if (arguments[i] === Infinity || arguments[i] === -Infinity) {
      return Infinity;
    }
    y += arguments[i] * arguments[i];
  }
  return Math.sqrt(y);
};


```

- [Math.hypot() – JavaScript | MDN](https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Math/hypot)

おわります。
