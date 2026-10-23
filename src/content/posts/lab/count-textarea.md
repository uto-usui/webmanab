---
id: 978
type: lab
slug: "count-textarea"
title: "テキストエリアの文字数をカウントする -『javascript』"
date: 2017-01-31T12:57:01+09:00
modified: 2017-01-31T15:16:08+09:00
excerpt: "jQueryを使ってテキストエリアに入力した文字数をカウントします。 javascript var textareaLength = function () { $(‘.js-textarea’).on(‘keydown"
primaryTag: "javascript"
terms:
  - { id: 176, name: "javascript", slug: "javascript" }
demoUrl: https://jsfiddle.net/yutousui/58v2d54d/
legacy:
  prev: flex-responsive-table
  next: processing-js-triangle
---

jQueryを使ってテキストエリアに入力した文字数をカウントします。

#### javascript

```

var textareaLength = function () {
  $('.js-textarea').on('keydown keyup keypress change',function(){
    var length = $(this).val().length;
    $(this).next('.js-length').find('strong').html(length);
  });
}
textareaLength();


```

<p><iframe width="100%" height="500" src="//jsfiddle.net/yutousui/58v2d54d/embedded/result,js,html/dark/" allowfullscreen frameborder="0"></iframe></p>
