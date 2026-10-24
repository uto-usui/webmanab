---
id: 2287
type: tip
slug: "javascript-convert-range"
title: "ある値を現在の範囲から新しい範囲における値に変換する -『JavaScript』"
date: 2018-02-20T11:23:04+09:00
modified: 2018-02-20T11:23:52+09:00
excerpt: "Processingの map() 関数が欲しかったのでJavaScriptで自前で実装しました🍟 スクリプト map(value, fromMin, fromMax, toMin, toMax) という"
primaryTag: "javascript"
terms:
  - { id: 2, name: "animation", slug: "animation" }
  - { id: 128, name: "interactive", slug: "interactive" }
  - { id: 29, name: "javascript", slug: "javascript" }
legacy:
  prev: vue-vuex
  next: javascript-lerp-normarise
---

Processingの `map()` 関数が欲しかったのでJavaScriptで自前で実装しました🍟

## スクリプト

`map(value, fromMin, fromMax, toMin, toMax)` というようにパラメータを渡して、`value` を `fromMin-fromMax` から `toMin-toMax` に対応する値に変換します。

```js

/**
 * 新しい範囲における現在の値を、現在の範囲を元に変換して返す
 * map(a, b, c, d, e)   aを範囲b-cから別の範囲d-eへ変換する
 * @param value {Number}
 * @param fromMin {Number} 変換前の最小
 * @param fromMax {Number} 変換前の最大
 * @param toMin {Number} 変換後の最小
 * @param toMax {Number} 変換後の最大
 */
const map = (value, fromMin, fromMax, toMin, toMax) => {

  let result = 0;

  result = (value <= fromMin)
    ? toMin : (value >= fromMax)
      ? toMax : (() => {

        let ratio = (toMax - toMin) / (fromMax - fromMin);
        return (value - fromMin) * ratio + toMin;

      })();

  return result;

};

console.log(map(5, 0, 10, 0, 100));  // 50
console.log(map(-20, 0, 10, 0, 100));  // 0
console.log(map(2000, 0, 10, 0, 100));  // 100


```

ちょっと言語化するのが難しいですが、結果を見てもらうとわかると思います。

## なにに使う？

CSSの値を異なる単位やプロパティ同士で連携(アニメーション)させる時に、よく使っています。

例えば、1回転(360deg)させるアニメーションと、100px移動するアニメーションの現在地の更新を簡単に実装することができるので、コードの見通しや計算の手間を省くことができます。

おわります。
