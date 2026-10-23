---
id: 850
type: tip
slug: "wordpress-customtype-archive-url"
title: "カスタム投稿タイプのアーカイブページのリンク(URL)の出力 -『wordpress』"
date: 2017-01-03T00:25:39+09:00
modified: 2017-02-13T13:09:20+09:00
excerpt: "独自で投稿タイプを作成した、カスタム投稿タイプのアーカイブページのリンク(URL)の出力方法です。 カスタム投稿タイプのアーカイブページのリンク(URL)の出力 以下の記述をテンプレートのsingleページに記述します。"
primaryTag: "wordpress"
terms:
  - { id: 64, name: "wordpress", slug: "wordpress" }
legacy:
  prev: wordpress-get_template_part
  next: es6-jquery-this-undefined
---

独自で投稿タイプを作成した、カスタム投稿タイプのアーカイブページのリンク(URL)の出力方法です。

## カスタム投稿タイプのアーカイブページのリンク(URL)の出力

以下の記述をテンプレートのsingleページに記述します。`get_post_type()`で自分のカスタム投稿タイプを取得して、`get_post_type_archive_link()`でアーカイブページへのリンクを取得して`echo`して出力させています。

### php

```

<a href="<?php echo get_post_type_archive_link( get_post_type() ); ?>"></a>


```

おわります。
