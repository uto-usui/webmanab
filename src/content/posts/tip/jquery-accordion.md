---
id: 1570
type: tip
slug: "jquery-accordion"
title: "使いやすくシンプルに作れるアコーディオン -『jQuery』"
date: 2017-10-02T18:36:22+09:00
modified: 2017-10-02T18:38:05+09:00
excerpt: "クリックで開閉できる、アコーディオン型UIを作ります。 トリガーとして a 要素を設置し、開閉したい要素をその次に設置します。 html <a class=”js-dropdown-trigger”>trig"
primaryTag: "javascript"
terms:
  - { id: 29, name: "javascript", slug: "javascript" }
  - { id: 30, name: "jQuery", slug: "jquery" }
  - { id: 296, name: "UI", slug: "ui" }
legacy:
  prev: vuejs-second
  next: wordpress-rest-api
---

クリックで開閉できる、アコーディオン型UIを作ります。

トリガーとして `a` 要素を設置し、開閉したい要素をその次に設置します。

#### html

```

<a class="js-dropdown-trigger">trigger</a>
<div>contents</div>
<a class="js-dropdown-trigger">trigger</a>
<div>contents</div>


```

トリガーの `a` 要素をクリックすると、`is-open` というクラスが付与され、次に設置した要素の表示非表示切り替わります。クリックを連打したときに、現在のアニメーションをキャンセルして、次のアニメーションを実行するようにしています。

#### JavaScript

```

const dropDownMenu = (target) => {

  let $target = $(target);

  $target.on('click', function(e) {

    e.preventDefault();
    $(this).toggleClass('is-open').next().stop(true).slideToggle(400);

  });

};
dropDownMenu('.js-dropdown-trigger');


```

コピペで簡単に利用できるアコーディオンができました。

おわります。
