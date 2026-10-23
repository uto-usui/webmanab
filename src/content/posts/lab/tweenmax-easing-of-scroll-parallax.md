---
id: 1946
type: lab
slug: "tweenmax-easing-of-scroll-parallax"
title: "スクロールのイージングとパララックス効果 – 『TweenMax』"
date: 2018-01-11T13:44:34+09:00
modified: 2018-01-11T13:46:14+09:00
excerpt: "スクロールに連動してで滑らかにオブジェクトを移動しつつ、スクロールのイージングをコントロールする。 const scrollSlow = () => { let $window = $(window); let s"
primaryTag: "animation"
terms:
  - { id: 212, name: "animation", slug: "animation" }
  - { id: 176, name: "javascript", slug: "javascript" }
  - { id: 317, name: "parallax", slug: "parallax" }
  - { id: 303, name: "TweenMax", slug: "tweenmax" }
demoUrl: https://jsfiddle.net/yutousui/ab42k442/
legacy:
  prev: rotate-elements-arranged-on-the-circumference
  next: tweenmax-visual-range-animation-class
---

スクロールに連動してで滑らかにオブジェクトを移動しつつ、スクロールのイージングをコントロールする。

```js

const scrollSlow = () => {

  let $window = $(window);
  let scrollTime = 3;
  let scrollDistance = 6;

  $window.on("mousewheel DOMMouseScroll", function(e) {

    e.preventDefault();

    let delta = e.originalEvent.wheelDelta || e.originalEvent.detail * 40 * -1;
    let scrollTop = $window.scrollTop();
    let finalScroll = scrollTop - delta * scrollDistance;

    TweenMax.to($window, scrollTime, {
      scrollTo : { y: finalScroll, autoKill:true },
      ease: Power1.easeOut,
      overwrite: 5
    });

  });

}
scrollSlow();

const scrollAnim = () => {

  let delta = 5;
  let speed = 1.5;

  $(window).scroll(() => {

    let elementScroll = $('[data-parallax]');
    let scroll = $(window).scrollTop();
    scrollHandler(scroll);

    function scrollHandler(scroll) {

      $(elementScroll).each(function() {

        let el = $(this);
        let ratio = el.attr('data-parallax');
        let offsetTop = el.offset().top - scroll;
        let translateY = offsetTop * ratio / delta * -1;

        TweenMax.to(el, speed, {
          y: translateY
        });

      });

    }

  });

};
scrollAnim();


```

<p><iframe width="100%" height="500" src="//jsfiddle.net/yutousui/ab42k442/embedded/result,js/dark/" allowpaymentrequest allowfullscreen frameborder="0"></iframe></p>
