---
id: 1798
type: lab
slug: "give-speed-and-angle-as-separate-random-values"
title: "スピードと角度を別々のランダムなsin波で与える -『TweenMax』"
date: 2017-12-12T17:37:13+09:00
modified: 2017-12-13T14:23:26+09:00
excerpt: "/** * minからmaxの値をランダムにかえす * @param min {Number} * @param max {Number} * @returns {Number} */ const random = (m"
primaryTag: "animation"
terms:
  - { id: 212, name: "animation", slug: "animation" }
  - { id: 176, name: "javascript", slug: "javascript" }
  - { id: 303, name: "TweenMax", slug: "tweenmax" }
demoUrl: https://jsfiddle.net/yutousui/L4806xs6/
legacy:
  prev: circular-motion-with-depth
  next: rotate-elements-arranged-on-the-circumference
---

```

/**
 * minからmaxの値をランダムにかえす
 * @param min {Number}
 * @param max {Number}
 * @returns {Number}
 */
const random = (min, max) => Math.random() * (max - min) + min;


class smoothMove {

  /**
   *
   * @param target {Object}
   * @param speed {Number}
   * @param wrapWidth {Number}
   * @param wrapHeight {Number}
   */
  constructor(target, wrapWidth = window.innerWidth, wrapHeight = window.innerHeight) {

    this.target = target;

    // 角度
    this.angle = {
      x: random(0,360),
      y: random(0,360),
      z: random(0,360),
    };

    // スピード
    this.speed = {
      x: random(-2,4),
      y: random(-2,4),
      z: random(-2,4),
    };

    // 中心の座標
    this.center = {
      x: wrapWidth / 2 - this.target.width() / 2,
      y: wrapHeight / 2 - this.target.height() / 2
    };

    // 動く範囲を円の半径で表現
    // この倍の値(直径)が移動範囲になる
    this.radius = window.innerHeight / 2;

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

    // Math.sin(radian)は-1から1までを正弦波で返す
    // radiusをかけることで、その円の範囲でアニメーションする
    let offset = {
      x: Math.sin(this.getRadian(this.angle.x)) * this.radius,
      y: Math.sin(this.getRadian(this.angle.x)) * this.radius,
      z: Math.cos(this.getRadian(this.angle.z)) * this.radius
    };

    TweenMax.set(this.target, {
      x: this.center.x + offset.x,
      y: this.center.y + offset.y,
      z: offset.z,
    });

    // アニメーションで使用する角度を進める量
    // つまり、速さ
    this.angle.x += this.speed.x;
    this.angle.y += this.speed.y;
    this.angle.z += this.speed.z;

    requestAnimationFrame(() => {

      this.play();

    });

  }

}

let anim = new smoothMove($('.target'));
anim.play();


```

<p><iframe width="100%" height="400" src="//jsfiddle.net/yutousui/L4806xs6/embedded/js,result/dark/" allowpaymentrequest allowfullscreen frameborder="0"></iframe></p>
