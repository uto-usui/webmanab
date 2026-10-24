---
id: 160
type: tip
slug: "wait-animate"
title: "CSSのkeyframesアニメーションで待機時間を指定したものを吐き出す WAIT! Animate – 『animation』"
date: 2016-07-13T10:33:21+09:00
modified: 2017-02-17T17:38:53+09:00
excerpt: "待機アニメーションを簡単に実装できる WAIT! Animateは keyframes のCSSアニメーションでループさせたいときに、待機時間を指定したものをCSSコードとして吐き出すツールです。 遅らせたい時間を入力す"
primaryTag: "animation"
terms:
  - { id: 2, name: "animation", slug: "animation" }
  - { id: 101, name: "keyframes", slug: "keyframes" }
  - { id: 5, name: "mixin", slug: "mixin" }
  - { id: 6, name: "sass", slug: "sass" }
  - { id: 80, name: "tool", slug: "tool" }
legacy:
  prev: canonical-www
  next: htaccess-user-agent-allocation
---

## 待機アニメーションを簡単に実装できる

WAIT! Animateは `keyframes` のCSSアニメーションでループさせたいときに、待機時間を指定したものをCSSコードとして吐き出すツールです。\
遅らせたい時間を入力すると `keyframes` のタイミングを自動計算してコードをコピぺできます。

sass環境を構築していれば `mixin` をそのまま利用して、`@include` で呼び出して利用するという手もあり、このパターンでとても重宝します。

[WAIT! Animate](http://waitanimate.eggbox.io/#/)
