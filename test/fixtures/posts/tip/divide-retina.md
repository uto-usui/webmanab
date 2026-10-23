---
id: 464
type: tip
slug: "divide-retina"
title: "Retinaディスプレイなどの高解像度の端末を判別して処理を実行する-『javascript』"
date: 2016-10-04T17:59:54+09:00
modified: 2019-02-14T19:20:24+09:00
excerpt: "ディスプレイの解像度で条件分岐 Retinaディスプレイなどの高解像度のディスプレイに対して、jQuery（JavaScript）を使って判別する方法です。 高解像度用に画像を用意して、切り替えることなどに利用できます。"
primaryTag: "sp"
terms:
  - { id: 29, name: "javascript", slug: "javascript" }
  - { id: 30, name: "jQuery", slug: "jquery" }
  - { id: 268, name: "mobile", slug: "mobile" }
demoUrl: https://jsfiddle.net/yutousui/3a8t7892/
legacy:
  prev: hammer-js
  next: git-basic
---

## ディスプレイの解像度で条件分岐

Retinaディスプレイなどの高解像度のディスプレイに対して、jQuery（JavaScript）を使って判別する方法です。\
高解像度用に画像を用意して、切り替えることなどに利用できます。\
webkit系ブラウザのみで有効です。

#### javascript

```js

var retina = window.devicePixelRatio;
if(retina < 2) {
  $('#ex').html('Retinaディスプレイとかの高解像度ではないんです。');
} else if(retina >= 2) {
  $('ex').html('Retinaディスプレイとかの高解像度です！');
}
```
