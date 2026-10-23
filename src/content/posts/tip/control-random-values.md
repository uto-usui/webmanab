---
id: 1187
type: tip
slug: "control-random-values"
title: "ランダム値をコントロールするための、いろいろなランダム値の分布のさせ方 -『javascript』"
date: 2017-03-02T18:25:28+09:00
modified: 2020-01-16T18:05:26+09:00
excerpt: "JavaScriptのMath.random()関数を利用すると、0以上1未満の値を得ることができます。これを使って最大値までのランダムな値を得ることは簡単です。 javascript const random = (m"
primaryTag: "javascript"
terms:
  - { id: 130, name: "canvas", slug: "canvas" }
  - { id: 277, name: "CreateJs", slug: "createjs" }
  - { id: 29, name: "javascript", slug: "javascript" }
  - { id: 273, name: "random", slug: "random" }
demoUrl: https://jsfiddle.net/yutousui/ohLLq5k6/
legacy:
  prev: static-random-gradation-color-for-updating-random-values-at-compile-time
  next: javascript-augument
---

JavaScriptの`Math.random()`関数を利用すると、0以上1未満の値を得ることができます。これを使って最大値までのランダムな値を得ることは簡単です。

#### javascript

```

const random = (max) => Math.floor(Math.random() * max);
console.log(random(5)); // 5未満のランダム値


```

## ランダム値の分布のコントロール

この`Math.random()`関数をうまく利用して、ランダムな値の分布をコントロールすることができます。

今回は「CreateJS」を利用して、(x,y)座標にランダム値をセットして分布を表現しました。

描画モードに`lighter`を指定して、要素が重なっているところを明るくなるようにして、どこにたくさんの要素が集まっているか視覚的にわかるようにしました。なので明るく描画されているところがランダム値の出現頻度が高いということです。

「CreateJS」の使い方の基礎はここにまとめました。

- いろいろな形のシェイプをCreateJSで描画するまで -『CreateJS基礎』

### 均等に分布する

最初に例で示した式です。均等に値を出力するので、エリア全体に描画されます。

```

const randBasic = (max) => Math.floor(Math.random() * max);


```

### 中央に分布する

`Math.random()`を足して`2`で割ることで中央値に偏らせることができます。エリア中央から拡散するように描画されます。

```

const randSum = (max) => Math.floor((Math.random() + Math.random()) / 2 * max);


```

### 最小値に分布する

`Math.random()`と`Math.random()`を乗算することで最小値に偏らせることができます。エリア左上から拡散するように描画されます。

```

const randTime = (max) => Math.floor(Math.random() * Math.random() * max);


```

### より最小値に分布する

`Math.random()`を２乗することで、より最小値に偏らせることができます。エリア左上から拡散するように、最小値に近い値がたくさん描画されます。

```

const randSquare = (max) => {
  let rand = Math.random();
  return Math.floor(rand * rand * max);
};


```

### 最大値から比例的に拡散

`Math.random()`の平方根をもとめることで、最大値から均等に拡散するような分布になります。

```

const randRoot = (max) => Math.floor(Math.sqrt(Math.random()) * max);


```

## ランダム値の分布を反転させる

上に掲示したランダム値を分布させるコードを、簡単に反転させることができます。

### 最大値に分布する

最大値に偏らせることができます。エリア右下から拡散するように描画されます。

```

const randTimeReverse = (max) => Math.floor( (1 - Math.random() * Math.random()) * max);


```

### より最大値に分布する

より最大値に偏らせることができます。エリア右下から拡散するように、最大値に近い値がたくさん描画されます。

```

const randSquareReverse = (max) => {
  let rand = Math.random();
  return Math.floor((1 - rand * rand) * max);
};


```

### 最小値から比例的に拡散

最小値から均等に拡散するような分布になります。

```

const randRootReverse = (max) => Math.floor((1 - Math.sqrt(Math.random())) * max);


```

### demo

<p><iframe width="100%" height="600" src="//jsfiddle.net/yutousui/ohLLq5k6/embedded/result,js,html/dark/" allowfullscreen frameborder="0"></iframe></p>

## 《おまけ》分布を表現したCreateJSのスクリプト

今回の分布を表現したCreateJSのコードです。

#### javascript

```

let stage;

const canvasW = 400,
      canvasH = 400,
      circleW = 2,
      circleNum = (canvasW / (circleW / 2) * 20),

      /**
        * ランダム値の関数の定義
        */
      randRange = (max, min) => Math.floor(Math.random() * (max + 1 - min) + min),
      randBasic = (max) => Math.floor(Math.random() * max),
      randSum = (max) => Math.floor((Math.random() + Math.random()) / 2 * max),
      randTime = (max) => Math.floor(Math.random() * Math.random() * max),
      randSquare = (max) => {
        let rand = Math.random();
        return Math.floor(rand * rand * max);
      },
      randRoot = (max) => Math.floor(Math.sqrt(Math.random()) * max),
      randSumReverse = (max) => Math.floor( (1 - (Math.random() + Math.random()) / 2) * max),
      randTimeReverse = (max) => Math.floor( (1 - Math.random() * Math.random()) * max),
      randSquareReverse = (max) => {
        let rand = Math.random();
        return Math.floor((1 - rand * rand) * max);
      },
      randRootReverse = (max) => Math.floor((1 - Math.sqrt(Math.random())) * max),

      /**
        * 塗り
        */
      draw = (myGraphics) => {

        let light = randRange(60, 80),
            hue = randRange(170, 180),
            color = `hsl(${hue}, 75%, ${light}%)`;
        myGraphics.beginFill(color).drawCircle(0,0, circleW);

      },

      /**
        * 描画の初期設定
        */
      init = (target, randFunc) => {

        stage = new createjs.Stage(target);

        stage.canvas.width = canvasW;
        stage.canvas.height = canvasH;

        if (window.devicePixelRatio) {
          let canvas = document.getElementById(target);
          canvas.style.width = canvas.width + "px";
          canvas.style.height = canvas.height + "px";
          canvas.width *= devicePixelRatio;
          canvas.height *= devicePixelRatio;
          stage.scaleX = stage.scaleY = window.devicePixelRatio;
        }

        for (var i = 0; i < circleNum; i++) {

          // シェイプを定義
          var shape = new createjs.Shape();
          // 表示リストに追加
          stage.addChild(shape);
          // 座標
          shape.x = randFunc(canvasW);
          shape.y = randFunc(canvasH);
          // 透明度
          shape.alpha = 0.5;
          // 塗りの関数を呼び出す
          draw(shape.graphics);

        }

        // 描画モード
        stage.compositeOperation = "lighter";
        // 更新
        stage.update();

      };

init('canvas01', randBasic);  // 満遍なく
init('canvas02', randSum);  // 中央に集まる
init('canvas03', randTime);  // 最小値に集まる
init('canvas04', randSquare);  // より最小値に集まる
init('canvas05', randRoot);  // 最大値に比例的に集まる
init('canvas06', randSumReverse);  // 中央に集まる
init('canvas07', randTimeReverse); // 最大値に集まる
init('canvas08', randSquareReverse); // より最大値に集まる
init('canvas09', randRootReverse);  // 最小値に比例的に集まる


```

## 《おまけ》ランダム値に範囲をあたえる

いろんなランダムの数式を掲載しましたが、おまけとして範囲指定のできるランダムな整数を返すスクリプトです。引数に与えた値の`min`以上、`max`以下の値を返します。

```

const randRange = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);


```

`min`の値を基準として、そこにランダムな増減値を加算する、というような計算方法です。ランダムな増減値は、`max - min`で増減する幅をもとめて、そこに`1`を足して、`Math.random()`関数の0以上1未満のランダムな値と掛け合わせることで表現することができます。

これで取り出せた値を `Math.floor()`関数で小数点以下を切り捨てて、整数値を取り出しています。

```

console.log(randRange(10, 100));
// ランダムな10以上、100以下の整数


```

ES5で記述すると、

```

var randRange = function (min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
};


```

ちなみにこの`+1`の部分を取りはずすと、「`max`未満」の値を返すランダム関数になります。

おわります。
