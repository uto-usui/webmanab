---
id: 619
type: tip
slug: "flex-grandson"
title: "flexコンテナの孫要素の高さを親要素いっぱいにしたいときのtips -『CSS3』"
date: 2016-10-27T12:26:15+09:00
modified: 2016-10-28T18:41:38+09:00
excerpt: "flex関連プロパティではブラウザのごとの仕様により解釈が異なって、見た目の違いや実現できないことがいくつかあります。 その中で、flexプロパティを適用させた要素の孫要素の高さをコンテナいっぱい100%にするためのti"
primaryTag: "flex"
terms:
  - { id: 87, name: "bug", slug: "bug" }
  - { id: 3, name: "css", slug: "css" }
  - { id: 200, name: "flex", slug: "flex" }
  - { id: 201, name: "safari", slug: "safari" }
demoUrl: https://jsfiddle.net/yutousui/6h70yu24/
legacy:
  prev: hue-css
  next: data-javascript
---

`flex`関連プロパティではブラウザのごとの仕様により解釈が異なって、見た目の違いや実現できないことがいくつかあります。\
その中で、`flex`プロパティを適用させた要素の孫要素の高さをコンテナいっぱい100%にするためのtipsです。

## flexコンテナの孫要素の高さを親要素いっぱいにしたい

そもそもなぜこのようなことをしたいかというと、`flex`で横並びにした要素、例えば「カード型コンテンツ」の中身を上辺と下辺にぴったり合わせたいとすれば、その要素たちを「ラップする要素」を作成し、`flex`プロパティを適用し、`flex-direction: column`と`justify-content: space-between;`で、縦並びにしながら上下いっぱいに広がるように要素を配置します。\
確認ですが、このとき「ラップする要素」は`flex`の子要素で、「カード型コンテンツ」は孫要素です。

### 子要素で起きていること

`flex`の子要素、横並びになったカードたちはデフォルトで`align-items: stretch`が適応されることで高さが揃います。\
この孫要素に`height: 100%`を適用させつつ、上記の**縦並びにしながら上下いっぱいに広がるように要素を配置**をしたいわけですが、safariでは高さ100%を認識してくれません。\
*少し前はchromeでもこの現象が起きていましたが、今はsafariのみで発生しています。*

### 高さが揃えられた子要素たちは高さを持っていないと解釈される

どうやら`flex`プロパティで高さが揃えられた子要素たちは高さを持っていないと解釈されるようで、`height: 100%`が無視されてしまいます。\
ということで困らされるのですが、ここでのCSS-hackは子要素への`display: flex`で孫要素の領域をいっぱいにします。

#### css

```css

.wrap {
  display: flex;
  justify-content: space-around;
}

.inner {
  display: flex;
}

.inner_inner {
  display: flex;
  justify-content: space-between;
  flex-direction: column;
}


```

### デフォルトのalign-items: stretchの効果を使う

`display: flex`を与えた要素のデフォルトの`align-items: stretch`の効果を利用することで高さの領域をいっぱいにまで広げます。\
サンプルは以下のようになります。

<p><iframe width="100%" height="500" src="//jsfiddle.net/yutousui/6h70yu24/embedded/html,css,result/dark/" allowfullscreen frameborder="0"></iframe></p>

おわります。
