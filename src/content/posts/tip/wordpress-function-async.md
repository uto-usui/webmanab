---
id: 85
type: tip
slug: "wordpress-function-async"
title: "async属性でレンダリングをブロックするJavaScriptにfunction.phpに記述で対処 -『WordPress』"
date: 2016-06-18T18:31:10+09:00
modified: 2017-02-13T14:05:06+09:00
excerpt: "サイトの高速化に。 レンダリングをブロックしているスクリプトにasync属性で対処する ブラウザがレンダリング時に外部スクリプトを読み込む間、レンダリングが途中で中断(ブロック)され遅延が発生します。 この遅延を簡単に解"
primaryTag: "Speed"
terms:
  - { id: 65, name: "function.php", slug: "function-php" }
  - { id: 64, name: "wordpress", slug: "wordpress" }
legacy:
  prev: regular-expression-including-a-new-line
  next: retina-mixin
---

サイトの高速化に。

## レンダリングをブロックしているスクリプトにasync属性で対処する

ブラウザがレンダリング時に外部スクリプトを読み込む間、レンダリングが途中で中断(ブロック)され遅延が発生します。\
この遅延を簡単に解消するためのtipsです。

該当のスクリプトに`async`属性を記述することで、ページの解析を続けながらスクリプトを非同期にダウンロードし、スクリプトをダウンロード完了後に実行させることを実現できます。

### WordPress「function.php」での記述

WordPressでまとめてfuncction.phpで処理する場合`add_filter()`関数を利用し、下記を記述します。

#### function.php

```php

if (!(is_admin() )) {
function add_async_script( $url ) {
    if ( FALSE === strpos( $url, '.js' ) ) return $url;
    if ( strpos( $url, 'jquery.min.js' ) ) return $url;
    return $url ."' async";
}
add_filter( 'clean_url', 'add_async_script', 11, 1 );
}


```

以下のように出力されます。

#### html

```html

<script type="text/javascript" src="http://ex.com/wp-includes/js/script.min.js?ver=4.5.2" async></script>


```

### ライブラリは除外しておく

`if ( strpos( $url, 'jquery.min.js' ) ) return $url;`の部分ではjQueryライブラリを除外しています。\
**ライブラリ系のスクリプトを非同期で読み込むとエラーが発生してしまうことが多い**ので、このように条件分岐しています。

ライブラリ以外にもスクリプトが動かない場合はどれが影響しているのか検証し、追記して除外してください。\
`if ( strpos( $url, '除外したいスクリプト' ) ) return $url;`

### 参考

[サイトに適したリソース配置とasync/defer完全マスター – レンダリング優先のグッド・プラクティス](http://tokkono.cute.coocan.jp/blog/slow/index.php/xhtmlcss/resource-potitioning-best-practice/)

おわります。
