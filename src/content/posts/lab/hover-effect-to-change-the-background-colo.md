---
id: 976
type: lab
slug: "hover-effect-to-change-the-background-colo"
title: "CSSのアニメーション表現。背景色を２段階に変えるホバーエフェクト -『animation』"
date: 2017-01-31T11:35:42+09:00
modified: 2017-01-31T12:49:05+09:00
excerpt: "疑似要素を使って背景色に２段階の変化を与えるホバーエフェクトです。親要素に絶対配置した疑似要素をホバーしたときに位置を変更することで大きさを変更して表示します。 ポイントはtransition-delayの値を、要素をホ"
primaryTag: "CSS"
terms:
  - { id: 212, name: "animation", slug: "animation" }
  - { id: 211, name: "css", slug: "css" }
  - { id: 213, name: "hover", slug: "hover" }
demoUrl: https://jsfiddle.net/yutousui/5b5cpyd3/
legacy:
  prev: toc
  next: flex-responsive-table
---

疑似要素を使って背景色に２段階の変化を与えるホバーエフェクトです。親要素に絶対配置した疑似要素をホバーしたときに位置を変更することで大きさを変更して表示します。

ポイントは`transition-delay`の値を、要素をホバーしたときと外れたときで変更することでアニメーションの順番を変更します。。

#### SCSS

```

.block {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden;
  width: 300px;
  height: 300px;
  font-size: 32px;
  color: white;
  background-color: rgba(white, .35);
  transition: .4s .25s ease-out;
  //
  &::after,
  &::before {
    content: "";
    position: absolute;
    z-index: 2;
    top: 100%;
    right: 0;
    bottom: 0;
    left: 0;
    display: block;
    pointer-events: none;
  }
  //
  &::after {
    background: #00889b;
    transition: all .25s .25s ease-in;
  }
  //
   &::before {
    z-index: 3;
    background: #ccaa77;
    transition: all .25s ease-in;
  }
  //
  > span {
    position: relative;
    z-index: 4;
  }
  //
  &:hover {
    text-decoration: none;
    color: white;
    letter-spacing: .1em;
    font-size: 25vw;
    //
    &::after {
      top: 0;
      transition: all .25s ease-out;
    }
    //
    &::before {
      top: 0;
      transition: all .25s .25s ease-out;
    }
  } 
}


```

<p><iframe width="100%" height="500" src="//jsfiddle.net/yutousui/5b5cpyd3/embedded/result,html,css/dark/" allowfullscreen frameborder="0"></iframe></p>
