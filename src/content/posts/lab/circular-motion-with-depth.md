---
id: 1796
type: lab
slug: "circular-motion-with-depth"
title: "奥行きのある円運動 -『TweenMax』"
date: 2017-12-12T15:37:55+09:00
modified: 2017-12-12T17:35:30+09:00
excerpt: "class smoothMove { /** * * @param target {Object} * @param speed {Number} * @param wrapWidth {Number} * @param"
primaryTag: "animation"
terms:
  - { id: 212, name: "animation", slug: "animation" }
  - { id: 176, name: "javascript", slug: "javascript" }
  - { id: 303, name: "TweenMax", slug: "tweenmax" }
demoUrl: https://jsfiddle.net/yutousui/91zjtj4g/
legacy:
  prev: smooth-movement-using-sin-wave
  next: give-speed-and-angle-as-separate-random-values
---

```

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

    let radian = this.getRadian(this.angle);

    // Math.sin(radian)は-1から1までを正弦波で返す
    // radiusをかけることでそれを半径とする円の範囲でアニメーション
    let offsetX = Math.sin(radian) * this.radius;
    let offsetZ = Math.cos(radian) * this.radius;


    TweenMax.set(this.target, {
      x: this.center.x + offsetX,
      y: this.center.y,
      z: offsetZ * 1.5,
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

<p><iframe width="100%" height="300" src="//jsfiddle.net/yutousui/91zjtj4g/embedded/result,js/dark/" allowpaymentrequest allowfullscreen frameborder="0"></iframe></p>
