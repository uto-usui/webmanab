---
id: 855
type: tip
slug: "scroll-box-animation"
title: "スクロールするレイヤー内でアンカーリンクを設置して指定位置までスクロールさせる -『javascript』"
date: 2017-01-10T21:28:23+09:00
modified: 2017-06-20T11:22:20+09:00
excerpt: "CSSでoverflow: autoやoverflow: scrollを指定している要素内で、アンカーリンクから指定した場所にスクロールするアニメーションを実装するtipsです。 スクロールするレイヤー内でアンカーリンク"
primaryTag: "jQuery"
terms:
  - { id: 2, name: "animation", slug: "animation" }
  - { id: 29, name: "javascript", slug: "javascript" }
  - { id: 30, name: "jQuery", slug: "jquery" }
  - { id: 234, name: "scroll", slug: "scroll" }
demoUrl: https://jsfiddle.net/yutousui/d8knz11c/
legacy:
  prev: es6-jquery-this-undefined
  next: sass-pickup
---

CSSで`overflow: auto`や`overflow: scroll`を指定している要素内で、アンカーリンクから指定した場所にスクロールするアニメーションを実装するtipsです。

## スクロールするレイヤー内でアンカーリンクを設置して指定位置までスクロールさせる

補足として、**CSSで`overflow: auto`している要素には`position: relative`を指定**します。

#### html

```

<ul class="list">
  <li><a class="js-btn" href="#sectio01">01</a></li>
  <li><a class="js-btn" href="#sectio02">02</a></li>
</ul>
<div class="box">
  <section class="section" id="sectio01">
    <h2>title01</h2>
    <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Dolorum earum iusto saepe, vero beatae. Earum error vel qui tenetur repellendus, in ex praesentium facere dolores cupiditate esse, recusandae reiciendis inventore.</p>
  </section>
  <section class="section" id="sectio02">
    <h2>title02</h2>
    <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Dolorum earum iusto saepe, vero beatae. Earum error vel qui tenetur repellendus, in ex praesentium facere dolores cupiditate esse, recusandae reiciendis inventore.</p>
  </section>
</div>


```

#### javascript

```

var scrollAnim = function () {
  var target,
      targetP,
      scrollP,
      position;
  $('.js-btn').on('click', function (e) {
    e.preventDefault();

    target = $(this).attr('href');
    targetP = $(target).position();
    scrollH = $('.box').scrollTop();
    position = targetP.top + scrollH;

    $('.box').animate({
      scrollTop: position
    }, 400);
  });
};
scrollAnim();


```

### 詳細を解説

#### リンクをクリックしたとき

```
$('.js-btn').on('click', function (e) {

```

#### リンクをクリックしたときの挙動を無効化

```
e.preventDefault();

```

#### リンクの`href`属性からスクロール先を取得

```
target = $(this).attr('href');

```

#### スクロール先の親ボックスからの相対的な位置を取得

親ボックスには`position`プロパティを指定しておく必要があります。

```
targetP = $(target).position();

```

#### 現在のボックス内のスクロール量を取得

```
scrollH = $('.box').scrollTop();

```

#### スクロール先の親ボックスからの相対的な位置と、現在のスクロール量を足す

```
position = targetP.top + scrollH;

```

#### スクロールさせる

```

$('.box').animate({
  scrollTop: position
}, 400);


```

### 注意すること

注意点としては、`position()`はボックス内の見えている範囲内での値を返すので、現在のボックス内のスクロール量を足してあげないと目的のスクロール先へアニメーションさせることができません。

#### demo

<p><iframe width="100%" height="450" src="//jsfiddle.net/yutousui/5y2gor7c/embedded/result,js,html,css/dark/" allowfullscreen frameborder="0"></iframe></p>

おわります。
