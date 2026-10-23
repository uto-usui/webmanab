---
id: 2343
type: tip
slug: "javascript-mouse-position"
title: "マウス座標のいろいろな原点 -『Javascript』"
date: 2018-10-11T00:24:50+09:00
modified: 2018-10-11T11:54:23+09:00
excerpt: "マウスの座標を得る マウス座標を取得するとき、コールバックのイベントオブジェクトの中には、いろいろな要素の左上を原点を基準とした座標が含まれています。 マウスオーバーしている要素 event.offsetX / Y ブラ"
primaryTag: "mouse"
terms:
  - { id: 2, name: "animation", slug: "animation" }
  - { id: 128, name: "interactive", slug: "interactive" }
  - { id: 29, name: "javascript", slug: "javascript" }
  - { id: 344, name: "mouse", slug: "mouse" }
demoUrl: https://jsfiddle.net/yutousui/gcb4wkuo/
legacy:
  prev: fonts-that-people-actually-use
  next: javascript-select-dom
---

## マウスの座標を得る

マウス座標を取得するとき、コールバックのイベントオブジェクトの中には、いろいろな要素の左上を原点を基準とした座標が含まれています。

<dl><dt>マウスオーバーしている要素</dt><dd>event.offsetX / Y</dd><dt>ブラウザウィンドウ</dt><dd>event.clientX / Y</dd><dt>ページ全体</dt><dd>event.pageX / Y<br>スクロールしたとき <code>clientX</code> と差が出る</dd><dt>ディスプレイ・モニタ</dt><dd>event.screenX / Y</dd></dl>

出力するサンプルは次のようになります。

#### HTML

```html

<div id="wrap" class="wrap">
  <div id="box" class="box"></div>
</div>


```

#### JavaScript

```js

const box = document.getElementById('box')

const addText = (event) => {
    box.innerHTML = `
    <p>element - ${event.offsetX}</p>
    <p>window  - ${event.clientX}</p>
    <p>page    - ${event.pageX}</p>
    <p>display - ${event.screenX}</p>`
}

const onMouseMove = event => addText(event)

box.addEventListener('mousemove', onMouseMove)


```

## 常に特定の要素を基準にしたマウス座標を得る

e.offsetX / Y は必ずしもイベントが付与されている要素の左上を原点としたものではなく、内包する子要素があれば、そこでイベントが発火してその要素を基準にした座標を返します。なので、常に `addEventListener` している要素を基準にした座標を得たい場合は少し工夫が必要です。

#### JavaScript

```js

const box = document.getElementById('box')


const addText = (event) => {

  const rect = event.currentTarget.getBoundingClientRect();
  const targetX = event.clientX - rect.left;

    box.innerHTML = `
    <p>element - ${event.offsetX}</p>
    <p>window  - ${event.clientX}</p>
    <p>page    - ${event.pageX}</p>
    <p>display - ${event.screenX}</p>
    <p>target  - ${targetX}</p>`
}

const onMouseMove = event => addText(event)

box.addEventListener('mousemove', onMouseMove)


```

`event.currentTarget` で `box` を取得して、`getBoundingClientRect()` でページと要素の座標を取得します。

- [element.getBoundingClientRect – Web API インターフェイス | MDN](https://developer.mozilla.org/ja/docs/Web/API/Element/getBoundingClientRect)

そして、`event.clientX - rect.left` ウインドウ基準の座標と要素の座標の差を求めることで、要素を基準にしたマウス座標を得ることができます。

- [DEMO – mouse event obj – JSFiddle](https://jsfiddle.net/yutousui/gcb4wkuo/19/)

おわります。
