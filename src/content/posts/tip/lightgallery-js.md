---
id: 327
type: tip
slug: "lightgallery-js"
title: "lightbox系の決定版かも、jQuery非依存でマルチデバイス対応のオールインワンな「lightgallery.js」 -『plug-in』"
date: 2016-08-04T14:46:11+09:00
modified: 2017-02-17T17:13:04+09:00
excerpt: "lightgallery.jsは高機能 「lightgallery.js」は、画像/動画/iframeを格納できる、レスポンシブ対応でタッチデバイス対応、好みのアニメーションエフェクトを選択でき、jQueryなどのライブ"
primaryTag: "lightbox"
terms:
  - { id: 29, name: "javascript", slug: "javascript" }
  - { id: 152, name: "lightbox", slug: "lightbox" }
  - { id: 85, name: "plug-in", slug: "plug-in" }
legacy:
  prev: image-hover-effect
  next: the-final-countdown
---

## lightgallery.jsは高機能

「lightgallery.js」は、画像/動画/iframeを格納できる、レスポンシブ対応でタッチデバイス対応、好みのアニメーションエフェクトを選択でき、jQueryなどのライブラリに非依存のlightbox系スクリプトです。

### デモページが充実している

デモページに多数のサンプルが用意されていて、サムネイルを生成したり、キャプションの挿入、フルスクリーン対応や、ソーシャルシェアボタンを設置することなど、簡単に実装が可能です。\
レスポンシブイメージの実装方法もデモに記載されていました。\
IE9+で主要ブラウザをサポートしています。

[lightgallery.js demo](https://sachinchoolur.github.io/lightgallery.js/)

### 導入が手軽にできます

以下が「lightgallery.js」のベーシックな起動方法です。\
該当のCSSとscriptを読み込んで、実装したい箇所を任意の`id`でラップします。

#### html

```html

<head>
  <link rel="stylesheet" href="css/lightgallery.css" /> 
</head>

<body>

<div id="lightgallery">
  <a href="img1.jpg">
      <img src="thumb1.jpg" />
  </a>
  <a href="img2.jpg">
      <img src="thumb2.jpg" />
  </a>
  <a href="img3.jpg">
      <img src="thumb3.jpg" />
  </a>
</div>

<script src="js/lightgallery.min.js"></script>
<!-- lightgallery plugins -->
<script src="js/lg-thumbnail.min.js"></script>
<script src="js/lg-fullscreen.min.js"></script>
<script>
  lightGallery(document.getElementById('lightgallery')); 
</script>
</body>

```

### デザインのカスタマイズも容易に

「lightgallery.js」はSassベースでスタイルシートが記述されていて、細かく変数が定義されていrので、カスタマイズが容易にできます。

[lightgallery.js demo](https://sachinchoolur.github.io/lightgallery.js/)\
[lightgallery.js DL](https://github.com/sachinchoolur/lightgallery.js)

おわります。
