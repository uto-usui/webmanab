---
id: 630
type: tip
slug: "wordpress-admin-thumb-id"
title: "投稿一覧にアイキャッチのサムネイルとIDを表示させる管理画面のカスタマイズ- 『wordpress』"
date: 2016-10-31T22:59:31+09:00
modified: 2017-02-13T14:04:28+09:00
excerpt: "wordpressので投稿の一覧にサムネイルとIDの項目を表示させる、管理画面カスタマイズのtipsです。これを実装しておくことでアイキャッチのサムネイルがあると記事の視認性が上がって区別しやすいこともあるかと思いますし"
primaryTag: "admin"
terms:
  - { id: 204, name: "admin", slug: "admin" }
  - { id: 65, name: "function.php", slug: "function-php" }
  - { id: 64, name: "wordpress", slug: "wordpress" }
legacy:
  prev: method-control
  next: load-original-css-javascript-to-admin
---

wordpressので投稿の一覧にサムネイルとIDの項目を表示させる、管理画面カスタマイズのtipsです。これを実装しておくことでアイキャッチのサムネイルがあると記事の視認性が上がって区別しやすいこともあるかと思いますし、idはデフォルトでは確認しづらいので、なにかと便利になる思います。

## 投稿一覧にアイキャッチのサムネイルとIDを表示させる

投稿の一覧のカスタマイズを実現するには、以下のコードをfunction.phpに記述します。

#### php

```php

function add_posts_columns_thumbId($columns) {
  $columns['thumbnail'] = 'eye catch';
  $columns['postid'] = 'ID';
  return $columns;
}

function add_posts_columns_thumbId_row($column_name, $post_id) {
  if ( 'thumbnail' == $column_name ) {
    $thumb = get_the_post_thumbnail($post_id, array(50,50), 'thumbnail');
    echo ( $thumb ) ? $thumb : '－';
  } elseif ( 'postid' == $column_name ) {
    echo $post_id;
  }
}

add_filter( 'manage_posts_columns', 'add_posts_columns_thumbId' );
add_action( 'manage_posts_custom_column', 'add_posts_columns_thumbId_row', 10, 2 );


```

### 項目名の変更

一覧で表示される項目名を変えたい場合は、以下の部分を書き換えてください。

```

$columns['thumbnail'] = 'eye catch'; // eye catchの部分を任意で書き換える
$columns['postid'] = 'ID'; // IDの部分を任意で書き換える


```

### サムネイルのサイズの変更

サムネイルの大きさを変えたい場合は、以下の部分を書き換えてください。

```

$thumb = get_the_post_thumbnail($post_id, array(50,50), 'thumbnail'); // array(50,50) この数値でサイズ指定


```

おわります。
