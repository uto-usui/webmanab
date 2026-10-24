---
id: 849
type: tip
slug: "wordpress-get_template_part"
title: "任意のテンプレートパーツを読み込むget_template_part()関数と、呼び出したテンプレートに引数を渡す方法 -『wordpress』"
date: 2016-12-28T16:31:26+09:00
modified: 2017-02-13T14:02:02+09:00
excerpt: "WordPressには、あらかじめ用意されているテンプレートパーツがあります。 php <?php get_header(); ?> <?php get_footer(); ?> <?php"
primaryTag: "wordpress"
terms:
  - { id: 64, name: "wordpress", slug: "wordpress" }
legacy:
  prev: license
  next: wordpress-customtype-archive-url
---

WordPressには、あらかじめ用意されているテンプレートパーツがあります。

#### php

```

<?php get_header(); ?>
<?php get_footer(); ?>
<?php get_sidebar(); ?>


```

これらのあらかじめ用意されているテンプレートパーツはテーマの中で呼び出すことも多いですが、テーマの中で何度も使用する記述などをまとめたりした**任意で作成したテンプレートパーツを呼び出す**のが`get_template_part()`です。

## 任意のテンプレートパーツを読み込むget_template_part()関数と、呼び出したテンプレートに引数を渡す方法

記述は`get_template_part('$dir','$name')`の形式です。以下のように呼び出したいテンプレートファイルに応じて書き方があります。

#### php

```

<?php get_template_part('loop'); // include... loop.php ?>
<?php get_template_part('loop', 'main'); // include... loop-main.php ?>
<?php get_template_part('include/loop', 'main'); // include... include/loop-main.php ?>


```

### 変数を呼び出し先に引き継がせたい

変数を呼び出し先に渡したい場合は`set_query_var()`を使います。

#### php

```

 <?php
  $my_var = 1000;
  set_query_var( 'my_var', $my_var );
  get_template_part('loop');  // include... loop.php
?>


```

上記の例では、`$my_var`という変数をそのままの名前で、呼び出し先のテンプレートに渡しています。

おわります。
