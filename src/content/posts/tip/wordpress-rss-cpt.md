---
id: 684
type: tip
slug: "wordpress-rss-cpt"
title: "WordPressのRSSにカスタム投稿タイプを含める方法- 『wordpress』"
date: 2016-11-11T19:30:40+09:00
modified: 2017-02-13T14:03:33+09:00
excerpt: "WordPressのRSSはデフォルトでは投稿タイプごとにRSSを出力しています。ぼくはこれがわからなくてhttp://my_domain.com/feed/のurlで「フィードが出力されてない！プラグインのせいかな、、"
primaryTag: "wordpress"
terms:
  - { id: 65, name: "function.php", slug: "function-php" }
  - { id: 64, name: "wordpress", slug: "wordpress" }
legacy:
  prev: slack-idea
  next: wordpress-excerpt-test
---

WordPressのRSSはデフォルトでは投稿タイプごとにRSSを出力しています。ぼくはこれがわからなくて`http://my_domain.com/feed/`のurlで「フィードが出力されてない！プラグインのせいかな、、、なんかバージョンあげたときのバグとか、、、」って右往左往してしまい半日くらい潰れてしまいました。かなしかった。。そこでWordpressのRSSにカスタム投稿タイプを含めるtipsです。

## WordPressのRSSにカスタム投稿タイプを含める方法

WordPressのRSSは投稿タイプごとにRSSを出力する仕様になっているので以下のようなURLになります。

- `http://my_domain.com/feed/`
- `http://my_domain.com/post_type/feed/`

サイトの運用に応じて`http://my_domain.com/feed/`のメインのフィードに他の投稿タイプをまとめて配信したいことがあるかと思います。その場合は`function.php`で`add_filter`でメインのフィードに結合させます。

#### function.php

```

function my_feed_concat($vars) {
  if ( isset($vars['feed']) && !isset($vars['post_type']) ){
    $vars['post_type'] = array(
      'post_typeA',
      'post_typeB'
    );
  }
  return $vars;
}
add_filter( 'request', 'my_feed_concat' );


```

おわります。
