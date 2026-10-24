---
id: 1801
type: lab
slug: "rotate-elements-arranged-on-the-circumference"
title: "円周上に並べた要素を回転させる -『TweenMax』"
date: 2017-12-12T21:44:27+09:00
modified: 2017-12-13T14:23:08+09:00
excerpt: "const random = (min, max) => Math.random() * (max – min) + min; /** * 新しい範囲における現在の値を、現在の範囲を元に変換して返す * map(a"
primaryTag: "animation"
terms:
  - { id: 212, name: "animation", slug: "animation" }
  - { id: 176, name: "javascript", slug: "javascript" }
  - { id: 303, name: "TweenMax", slug: "tweenmax" }
demoUrl: https://jsfiddle.net/yutousui/74uzrxL6/
legacy:
  prev: give-speed-and-angle-as-separate-random-values
  next: tweenmax-easing-of-scroll-parallax
---

```

const random = (min, max) => Math.random() * (max - min) + min;

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

    /**
     * 円周上に配置するための値
     * @type {number}
     * @private
     */
    let _angle = 0;

    this.target.each((i, el) => {

      _angle = this.angle + (360 / this.target.length) * i;

      let x = this.center.x + Math.sin(this.getRadian(_angle)) * this.radius;
      let y = this.center.y + Math.cos(this.getRadian(_angle)) * this.radius;

      TweenMax.set(el, {
        x: x,
        y: y,
        z: Math.sin(this.getRadian(this.angle)) * this.radius * 2,
        scale: map(Math.sin(this.getRadian(this.angle + i * this.radius)), -1, 1, 1, 1.5),
        rotationY: map(Math.cos(this.getRadian(this.angle + i * this.radius)), -1, 1, 1, 360),
        rotationZ: map(Math.sin(this.getRadian(this.angle + i * this.radius)), -1, 1, 1, 360),
        backgroundColor: `hsla(${this.angle + (360 / this.target.length) * i}, 80%, 70%, 1)`
      });

    });

    // アニメーションで使用する角度を進める量
    // つまり、速度
    this.angle += this.speed;

    requestAnimationFrame(() => this.play() );

  }

}

let anim = new smoothMove($('.target'));
anim.play();


```

<p><iframe width="100%" height="400" src="//jsfiddle.net/yutousui/74uzrxL6/embedded/result,js/dark/" allowpaymentrequest allowfullscreen frameborder="0"></iframe></p>
