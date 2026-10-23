---
id: 1178
type: lab
slug: "css-embed-images-scroll-the-screen-iphone6-outline-mockup"
title: "画像を埋め込んで画面をスクロールできるiPhone6のアウトラインのモックアップをCSSだけでつくる -『CSS』"
date: 2017-03-01T11:41:28+09:00
modified: 2017-03-01T11:47:32+09:00
excerpt: "CSSで作ったiPhone6のアウトラインのモックアップです。好きな画像を埋め込んで、その大きさに応じて画面を縦にスクロールすることができます。スクロールバーを隠して、よりデバイスの使用感に近づけるように工夫しました。"
primaryTag: "css"
terms:
  - { id: 211, name: "css", slug: "css" }
  - { id: 275, name: "sass", slug: "sass" }
demoUrl: https://jsfiddle.net/yutousui/656k72Lf/
legacy:
  prev: createjs-node-motion
  next: 無限ループするニュースティッカー-『javascript』
---

CSSで作ったiPhone6のアウトラインのモックアップです。好きな画像を埋め込んで、その大きさに応じて画面を縦にスクロールすることができます。スクロールバーを隠して、よりデバイスの使用感に近づけるように工夫しました。

```

$outline-color: #666;

.spbody {
  width: 230px;
  margin: 60px;
  border-radius: 30px;
  position: relative;
  border: 1px solid $outline-color;
}

.partsbd {
  width: 190px;
  margin: 0 auto;
}

.partshd {
  height: 10px;
  margin: 30px 0;
  text-align: center;
  position: relative;
}

.partsbd {
  .partsspe, .partscam {
    border-radius: 10px;
    display: inline-block;
    position: absolute;
    left: 50%;
    border: 1px solid $outline-color;
  }
  .partsspe {
    top: 0;
    width: 8px;
    height: 8px;
    margin-left: -45px;
  }
  .partscam {
    top: 2px;
    width: 50px;
    height: 4px;
    margin-left: -25px;
  }
}

.partsvw {
  width: 100%;
  height: 300px;
  border: 1px solid $outline-color;
  overflow: hidden;
}

.partsvw_inner {
  width: calc(100% + 17px);
  height: 100%;
  padding-right: 17px;
  overflow: scroll;
  > img {
    max-width: 100%;
    vertical-align: bottom;
  }
}

.partsbtn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin: 15px auto;
  border: 1px solid $outline-color;
}

.parts {
  position: absolute;
  background: $outline-color;
  top: 50%;
  left: 50%;
}

.parts1 {
  width: 3px;
  height: 30px;
  margin: -130px 0 0 117px;
}

.parts2 {
  width: 3px;
  height: 15px;
  margin: -170px 0 0 -120px;
}

.parts3 {
  width: 3px;
  height: 20px;
  margin: -130px 0 0 -120px;
}

.parts4 {
  width: 3px;
  height: 20px;
  margin: -90px 0 0 -120px;
}


```

<p><iframe width="100%" height="600" src="//jsfiddle.net/yutousui/656k72Lf/embedded/result,html,css/dark/" allowfullscreen frameborder="0"></iframe></p>
