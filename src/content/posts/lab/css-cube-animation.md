---
id: 675
type: lab
slug: "css-cube-animation"
title: "CSSで立方体をつくって回転のアニメーションをあたえる -『CSS』"
date: 2016-11-05T23:32:08+09:00
modified: 2016-11-05T23:32:51+09:00
excerpt: "CSSのtransformプロパティをうまく使って立方体を作成し、おまけにtransitionでホバーアニメーションをつけました。 CSSで立方体をつくって回転のアニメーションをあたえる .wrap { display:"
primaryTag: "css"
terms:
  - { id: 212, name: "animation", slug: "animation" }
  - { id: 211, name: "css", slug: "css" }
  - { id: 214, name: "geometry", slug: "geometry" }
  - { id: 213, name: "hover", slug: "hover" }
demoUrl: https://jsfiddle.net/yutousui/gre2a7tm/
legacy:
  prev: star-rotate-animation-createjs
  next: styling-input
---

CSSの`transform`プロパティをうまく使って立方体を作成し、おまけに`transition`でホバーアニメーションをつけました。

## CSSで立方体をつくって回転のアニメーションをあたえる

```

.wrap {
    display: flex;
    justify-content: space-around;
    max-width: 600px;
    margin: 5em auto;
    -webkit-perspective: 400;
    perspective: 400;
}

.box {
    width: 100px;
    height: 100px;
}

.cube_wrap {
    height: 100px;
    width: 100px;
    position: relative;
    margin:0 auto;
    -webkit-transform-style: preserve-3d;
    transform-style: preserve-3d;
    -webkit-transition: 2s;
    transition: 2s;
    cursor: pointer;
    //
    > div {
        position: absolute;
        height: 100px;
        width: 100px;
        color: #fff;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    //
    &:hover {
        -webkit-transform: translate3d(0,0,200px) rotateY(360deg) rotateZ(360deg) ;
        transform: translate3d(0,0,200px) rotateY(360deg) rotateZ(360deg);
    }
}

.cube_top {
 background: hsla(357,45%,91%,1.00);
 top: -50px;
 left: 0px;
 -webkit-transform: rotateX(90deg);
 transform: rotateX(90deg);
}

.cube_bottom {
 background: hsla(357,45%,91%,1.00);
 bottom: -50px;
 left: 0px;
 -webkit-transform: rotateX(-90deg);
 transform: rotateX(-90deg);
}

.cube_front {
 background: hsla(217,62%,71%,0.60);
 top: 0px;
 left: 0px;
 -webkit-transform: translateZ(50px);
 transform: translateZ(50px);
}

.cube_back {
 background: hsla(217,62%,71%,0.60);
 top: 0px;
 left: 0px;
 -webkit-transform: translateZ(-50px);
 transform: translateZ(-50px);
}

.cube_right {
 background: hsla(217,62%,71%,0.60);
 top: 0px;
 right: -50px;
 -webkit-transform: rotateY(90deg);
 transform: rotateY(90deg);
}

.cube_left {
 background: hsla(217,62%,71%,0.60);
 top: 0px;
 left: -50px;
 -webkit-transform: rotateY(-90deg);
 transform: rotateY(-90deg);
}


```

<p><iframe width="100%" height="350" src="//jsfiddle.net/yutousui/gre2a7tm/embedded/result,css,html/dark/" allowfullscreen frameborder="0"></iframe></p>
