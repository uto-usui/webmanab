---
id: 823
type: tip
slug: "when-the-window-resize-is-over"
title: "ウインドウのリサイズが終わったときに何か処理をしたいときのjQueryのスクリプト -『javascript』"
date: 2016-12-09T14:23:51+09:00
modified: 2017-02-13T10:00:10+09:00
excerpt: "ウインドウのリサイズ時に何か処理をしたいとき、.resize()を使ってリサイズのイベントを取得し処理を実行しますが、このままだとリサイズが発生している間ずっとイベントを細くして処理が実行されることになります。 ウインド"
primaryTag: "event"
terms:
  - { id: 231, name: "event", slug: "event" }
  - { id: 29, name: "javascript", slug: "javascript" }
  - { id: 30, name: "jQuery", slug: "jquery" }
legacy:
  prev: github-toc
  next: css-browser-selector
---

ウインドウのリサイズ時に何か処理をしたいとき、`.resize()`を使ってリサイズのイベントを取得し処理を実行しますが、このままだとリサイズが発生している間ずっとイベントを細くして処理が実行されることになります。

ウインドウのリサイズが終わったタイミングで処理を走らせるときに利用する、jQueryを使ったスクリプトのtipsです。

## ウインドウのリサイズが終わったときに何か処理をしたいときのjQueryのスクリプト

`setTimeout()`メソッドを利用して、この処理を実現します。

### `setTimeout()`と`claerTimeout()`でイベントの終了を補足する

`setTimeout()`は関数と時間を指定して、指定した時間が経過したとき、指定した関数を実行するメソッドです。`claerTimeout()`に`setTimeout()`の戻り値を渡すと関数の実行が取り消されます。

これを利用して、リサイズが断続的に行なわれている間は処理を中断して、リサイズが終了したときに処理を実行できるようにスクリプトを組みます。

#### JavaScript

```

var finishResize = function () {
  var timer = false;
  var $window = $(window);
  var windowW = $window.width();
  var windowH = $window.height();

  $window.resize(function() {
      if (timer !== false) {
          clearTimeout(timer);
      }
      timer = setTimeout(function() {
        // ここに終了時の処理
        windowW = $window.width();
        windowH = $window.height();
        console.log('owari');
      }, 200); // リサイズとリサイズの間隔を判定する
  });

}
finishResize();


```

リサイズが行なわれている間は、`timer`にID値が整数で返ってくるので、`clearTimeout'が実行され`setTimeout\`が中断されます。これで0.2秒以下の時間でリサイズが行なわれている間は、終了時の処理がキャンセルされます。

おわります。
