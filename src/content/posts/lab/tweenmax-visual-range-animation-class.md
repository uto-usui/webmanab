---
id: 1947
type: lab
slug: "tweenmax-visual-range-animation-class"
title: "可視範囲を判定してアニメーションを実行するクラス – 『TweenMax』"
date: 2018-01-11T14:00:57+09:00
modified: 2018-01-11T14:00:57+09:00
excerpt: "オブジェクトが可視範囲にきたらアニメーションを発火して、スクロール量に応じたアニメーションを実行する。 const anim = (target, value) => { TweenMax.to(target, …more"
primaryTag: "animation"
terms:
  - { id: 212, name: "animation", slug: "animation" }
  - { id: 176, name: "javascript", slug: "javascript" }
  - { id: 317, name: "parallax", slug: "parallax" }
  - { id: 303, name: "TweenMax", slug: "tweenmax" }
demoUrl: https://jsfiddle.net/yutousui/j5tp2cw2/
legacy:
  prev: tweenmax-easing-of-scroll-parallax
  next: noise-glitch
---

オブジェクトが可視範囲にきたらアニメーションを発火して、スクロール量に応じたアニメーションを実行する。

```js

const anim = (target, value) => {

  TweenMax.to(target, .5, {

    y: value,

  });

};


class scrollPosition {

  constructor(targets, callbackIn) {

    this.targets = [...document.querySelectorAll(targets)];
    this.windowH = window.innerHeight;
    this.scrollY = 0;
    this.offsetTop = [];
    this.height = [];
    this.show = [];
    this.value = [];
    this.offset = 100;

    this.callbackIn = typeof callbackIn === 'function' ? callbackIn : () => {};

    this.getItem();
    this.init();

    return this;

  }


  init() {

    window.addEventListener('scroll', () => {

      this.scrollY = window.pageYOffset;
      this.check();

    });

    this.check();

  }

  getItem() {

    this.targets.forEach((el, i) => {

      let rect = el.getBoundingClientRect();

      this.offsetTop[i] = rect.top;
      this.height[i] = el.offsetHeight;

    });

  }

  check() {

    this.targets.forEach((el, i) => {

      this.show[i] = (this.scrollY + this.windowH > this.offsetTop[i] + this.offset) && (this.scrollY < this.offsetTop[i] - this.offset + this.height[i]);
      this.value[i] = this.scrollY + this.windowH - this.offsetTop[i] - this.offset;

      if (this.show[i]) {

        el.classList.add('is-show');
        this.callbackIn.call(this, el, i);

      } else {

        el.classList.remove('is-show');

      }

    });

  }

}

const box = new scrollPosition('.box', function(el, i) {

  let amount = 100;
  let value = this.value[i] / this.windowH * amount * -1;

  if (this.show[i]) {

    anim(el.querySelector('.inner'), value);

  }

});


```

<p><iframe width="100%" height="500" src="//jsfiddle.net/yutousui/j5tp2cw2/embedded/result,js/dark/" allowpaymentrequest allowfullscreen frameborder="0"></iframe></p>
