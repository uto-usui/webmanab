---
id: 2298
type: tip
slug: "animation-sin-cos"
title: "アニメーショントレーニング 三角関数でなめらかな反復 -『Animation』"
date: 2018-03-01T20:59:30+09:00
modified: 2018-03-02T12:54:17+09:00
excerpt: "三角関数のメソッドを利用して、滑らかな JavaScript アニメーションを実装します。難しく考える必要はなく、そういうものなんだなあと認識して、アニメーションを楽しく実装しましょう。 オブジェクトの操作には Twee"
primaryTag: "aniamtion"
terms:
  - { id: 2, name: "animation", slug: "animation" }
  - { id: 128, name: "interactive", slug: "interactive" }
  - { id: 29, name: "javascript", slug: "javascript" }
  - { id: 79, name: "math", slug: "math" }
legacy:
  prev: bestfolios
  next: lebab
---

三角関数のメソッドを利用して、滑らかな JavaScript アニメーションを実装します。難しく考える必要はなく、そういうものなんだなあと認識して、アニメーションを楽しく実装しましょう。

オブジェクトの操作には [TweenMax](https://greensock.com/tweenmax) を利用します。

## 仕組み

`Math.sin(θ)` というメソッドは-1から1の値を返します。`θ` の値を連続変化させることで、-1から1の範囲の値を得ることができます。

この-1から1の値に、任意の値を掛けたりして、-1から1を拡張します。例えば、円の半径の値を掛けると、その円の範囲内を動くような値を得られます。

`θ`にはラジアンという値を与える必要があります。ラジアンを求める式は`angle * Math.PI / 180` です。`angle` は角度です。この`angle`の変化量がオブジェクトが動くスピードです。

## 横移動とカラーアニメーション

単純な横移動と、TweenMax はカラーのアニメーションを簡単に実装することができるので、サンプルとしてこれも盛り込んでみます。

#### demo

- [smooth animation – JSFiddle](https://jsfiddle.net/yutousui/skrxqb9j/)

```js


class smoothMove {

  /**
   *
   * @param target {Object}
   * @param speed {Number} 
   * @param wrapWidth {Number} デフォルトはウィンドウサイズ
   * @param wrapHeight {Number} デフォルトはウィンドウサイズ
   */
  constructor(target, speed = 2, wrapWidth = window.innerWidth, wrapHeight = window.innerHeight) {

    this.target = target;

    // 角度
    this.angle = 0;
    // スピード
    this.speed = speed;

    // 中心の座標
    this.center = {
      x: wrapWidth / 2 - this.target.width() / 2,
      y: wrapHeight / 2 - this.target.height() / 2
    };

    // 動く範囲を円の半径で表現
    // この倍の値(直径)が移動範囲になる
    this.radius = window.innerHeight / 4;

    return this;

  }

  /**
   * ラジアンに変換する
   * @param angle
   * @returns {number}
   */
  getRadian(angle) {
    return angle * Math.PI / 180;
  }

  /**
   * 新しい範囲における現在の値を、現在の範囲を元に変換して返す
   * map(a, b, c, d, e)   aを範囲b-cから別の範囲d-eへ変換する
   * @param value {Number}
   * @param fromMin {Number} 変換前の最小
   * @param fromMax {Number} 変換前の最大
   * @param toMin {Number} 変換後の最小
   * @param toMax {Number} 変換後の最大
   */
  map(value, fromMin, fromMax, toMin, toMax) {

    let result = 0;

    result = (value <= fromMin)
      ? toMin : (value >= fromMax)
        ? toMax : (() => {
          let ratio = (toMax - toMin) / (fromMax - fromMin);
          return (value - fromMin) * ratio + toMin;
        })();

    return result;

  }

  /**
   * アニメーションを始める
   */
  play() {

    let radian = this.getRadian(this.angle);

    // Math.sin(radian)は-1から1までを正弦波で返す
    // radiusをかけることでそれを半径とする円の範囲でアニメーション
    // Math.sin(radian) * 範囲
    let offsetX = Math.sin(radian) * this.radius;
    let color = `hsla(${this.map(Math.sin(radian), -1, 1, 0, 360) / 2}, 70%, 70%, 1)`


    TweenMax.set(this.target, {
      x: this.center.x + offsetX,
      y: this.center.y,
      backgroundColor: color
    });

    // アニメーションで使用する角度を進める量
    // つまり、速度
    this.angle += this.speed;

    requestAnimationFrame(() => {
      this.play();
    });

  }

}

let anim = new smoothMove($('.target'));
anim.play();


```

詳細はコメントに書き込みましたが、背景色を変化させるための値は、`map()` という関数を作成して、-1から1の範囲を0から360に拡張しています。こういうヘルパー関数を用意しておくと便利ですね。ちょっとテクニカルな書き方をしてますが、ここは便利な関数として流しましょう。

クラスとして定義したので、多少オプションを与えられるようにしました。

## 円運動のアニメーション

さっきは`Math.sin(θ)`を利用して、一定の範囲を取り出しました。`Math.sin(θ)` と`Math.cos(θ)`を利用すると、同じ半径の円の円周上の座様を求めることができます。`Math.cos(θ)` が x 座標、`Math.sin(θ)` が y 座標を示します。

この値を使って、オブジェクトを円運動させてみます。

#### demo

[smooth animation – JSFiddle](https://jsfiddle.net/yutousui/5n1a0hjy/)

```js

class smoothMove {

  /**
   *
   * @param target {Object}
   * @param speed {Number}
   * @param wrapWidth {Number}
   * @param wrapHeight {Number}
   */
  constructor(target, speed = 2, wrapWidth = window.innerWidth, wrapHeight = window.innerHeight) {

    this.target = target;

    // 角度
    this.angle = 0;
    // スピード
    this.speed = speed;

    // 中心の座標
    this.center = {
      x: wrapWidth / 2 - this.target.width() / 2,
      y: wrapHeight / 2 - this.target.height() / 2
    };

    // 動く範囲を円の半径で表現
    // この倍の値(直径)が移動範囲になる
    this.radius = window.innerHeight / 4;

    return this;

  }

  /**
   * ラジアンに変換する
   * @param angle
   * @returns {number}
   */
  getRadian(angle) {

    return angle * Math.PI / 180;

  }

  /**
   * アニメーションを始める
   */
  play() {

    let radian = this.getRadian(this.angle);

    // Math.sin(radian)は-1から1までを正弦波で返す
    // radiusをかけることでそれを半径とする円の範囲でアニメーション
    let offsetX = Math.sin(radian) * this.radius;
    let offsetY = Math.cos(radian) * this.radius;


    TweenMax.set(this.target, {
      x: this.center.x + offsetX,
      y: this.center.y + offsetY,
    });

    // アニメーションで使用する角度を進める量
    // つまり、速度
    this.angle += this.speed;

    requestAnimationFrame(() => {

      this.play();

    });

  }

}

let anim = new smoothMove($('.target'));
anim.play();


```

横移動のアニメーションとほとんど変わりありませんね。

他にも、

```js

let scale = Math.sin(radian) + 1;

TweenMax.set(this.target, {
  scale: scale,
});


```

とすると、拡大縮小するアニメーションを実装できたりだとか、様々な動きに応用できます。変化させたい値を用意する際は、`Math.sin(θ)`が返す-1から1の値を`map()`関数で範囲を変えて加工してあげると柔軟に対応できます。

#### 応用例

- [smooth animation – JSFiddle](https://jsfiddle.net/yutousui/74uzrxL6/)
- [smooth random animation – JSFiddle](https://jsfiddle.net/yutousui/1y17efvh/)

おわります。
