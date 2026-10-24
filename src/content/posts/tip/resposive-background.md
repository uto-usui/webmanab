---
id: 121
type: tip
slug: "resposive-background"
title: "背景画像の指定に多様したい、CSSで縦横比を維持してレスポンシブに対応する方法 -『CSS』"
date: 2016-07-01T19:29:17+09:00
modified: 2017-02-17T17:37:33+09:00
excerpt: "レスポンシブに縦横比を維持しつつ横幅いっぱいに画像を表示するときのtipsです。 画像の比率を保って表示する img要素だとwidth:100%;の指定で、親要素の大きさに合わせて画像は比率を保ったまま拡大縮小してくれま"
primaryTag: "css"
terms:
  - { id: 81, name: "background", slug: "background" }
  - { id: 3, name: "css", slug: "css" }
  - { id: 39, name: "responsive", slug: "responsive" }
legacy:
  prev: css-compile-sass
  next: wordpress-plug-in
---

レスポンシブに縦横比を維持しつつ横幅いっぱいに画像を表示するときのtipsです。

## 画像の比率を保って表示する

`img`要素だと`width:100%;`の指定で、親要素の大きさに合わせて画像は比率を保ったまま拡大縮小してくれます。

背景画像として比率を保って表示させる場合は少し記述を工夫する必要があります。\
以下のコードで実装可能となります。

#### CSS

```css

.img-box {
  width: 100%;
  height: 0;
  padding-top: calc(3000 / 4000 * 100%);
  /*calc(画像の高さ / 画像の幅 * widthの値)*/
  background-image: url('bg-image.jpg');
  background-position: center center;
  background-size: cover;
  background-repeat: no-repeat;
}


```

### 幅の定義

背景画像を指定する要素の幅を`width`に指定します。

### 高さの定義

高さは`padding-top`で決定するため、`height`は`0`とします。\
`padding-top`の値は<strong>「画像の高さ ÷ 画像の幅 × widthの値」</strong>でもとめることができます。\
`calc`関数を使って値を演算しています。\
こうすることで、画像が差し代わっても値を変更後のサイズに合わせて変更するだけで、対応することができます。

### 背景の定義

`background-size: cover;`と`background-position: center center;`で、サイズが変わっても画像の中心を固定して親要素いっぱいに表示させています。

<p><iframe width="100%" height="600" src="//jsfiddle.net/yutousui/axbyckmh/embedded/css,html,result/" allowfullscreen frameborder="0"></iframe></p>

おわります。
