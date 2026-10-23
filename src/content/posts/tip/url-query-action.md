---
id: 961
type: tip
slug: "url-query-action"
title: "URLに付与したクエリ文字を利用して処理。任意の要素までスクロールしつつ、その要素に任意のテキストを表示。 -『javascript』"
date: 2017-01-25T15:21:51+09:00
modified: 2017-02-13T02:08:58+09:00
excerpt: "URLのクエリ文字列は、URLの後ろのほうに付く?xxx=xx ?xxx=xxx&yy=yyyといった文字列のことです。たとえば動的なWebページで、検索キーワードなどを保持するためにURLに付与されていたり、W"
primaryTag: "javascript"
terms:
  - { id: 29, name: "javascript", slug: "javascript" }
  - { id: 30, name: "jQuery", slug: "jquery" }
legacy:
  prev: javascript-eslint-gulp
  next: library-animation
---

URLのクエリ文字列は、URLの後ろのほうに付く`?xxx=xx` `?xxx=xxx&yy=yyy`といった文字列のことです。たとえば動的なWebページで、検索キーワードなどを保持するためにURLに付与されていたり、WordPressの管理画面のURLを見ているとページによっていろんなクエリ文字列が渡されていることが分かるかと思います。

このクエリ文字列は、任意に動的な処理を加えていない以上は何も起きませんが、JavaScriptを使ってURLを取得し、クエリ文字列を分割して、その内容で色々な処理を加えることができます。

## URLに付与したクエリ文字を利用して処理

`a`要素の任意のクエリ文字列をURLに付与しておくことで、同じページでもクリックしたリンク元に応じて、ページの見た目を変えることが可能になります。たとえば特定のタブのパネルを開いておいたり、テキストを表示したりです。

今回は任意の要素までスクロールしつつ、その要素に任意のテキストを表示します。

`https://webmanab-html.com/?group=favorite&id=section3`というようなURLを想定し、`?group=favorite`と`id=section3`の右辺の値を利用します。

#### html

```

<div class="inner" id="js-query-action">
  <section class="section" id="section1">
    <h2 class="h2">section1</h2>
    <p>This group is my <strong></strong></p>
  </section>
  <section class="section" id="section2">
    <h2 class="h2">section2</h2>
    <p>This group is my <strong></strong></p>
  </section>
  <section class="section" id="section3">
    <h2 class="h2">section3</h2>
    <p>This group is my <strong></strong></p>
  </section>
</div>


```

#### ES5

```

var getNews = function() {

  var target = $('#js-query-action');

  if (target.length) {

    var url = $(location).attr('href');

    if (url.indexOf('?group=') != -1) {

      var query = url.split('?group=')[1];
      query = query.split('&id=');
      var groupName = query[0],
            id = '#' + query[1],
            pos = $(id).offset().top;
      target.find(id).find('strong').html(groupName);
      $('html, body').scrollTop(pos);
    }
  }
};
getNews();


```

URLを取得します。

```
var url = $(location).attr('href');

```

クエリ文字があるときだけ処理を実行します。

```
if (url.indexOf('?group=') != -1) {

```

URLを`?group=`を移行のクエリ文字列だけに分割します

```
var query = url.split('?group=')[1];

```

`?group=`の値と`&id=`の値に分割します。

```

query = query.split('&id=');
var groupName = query[0],
      id = '#' + query[1];


```

これでクエリ文字列の値を取り出すことができたので、jQueryでそれを元に、要素になにか処理を加えたりします。

補足としてES6の環境だと以下のコードです。

#### ES6

```

const getNews = () => {

  const target = $('#js-query-action');

  if (target.length) {

    let url = $(location).attr('href');

    if (url.indexOf('?group=') != -1) {

      let query = url.split('?group=')[1];
      query = query.split('&id=');
      const groupName = query[0],
                id = '#' + query[1],
                pos = $(id).offset().top;
      target.find(id).find('strong').html(groupName);
      $('html, body').scrollTop(pos);

    }

  }

};
getNews();


```

おわります。
