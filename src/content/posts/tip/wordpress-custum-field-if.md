---
id: 790
type: tip
slug: "wordpress-custum-field-if"
title: "カスタムフィールドの有無を判定して処理を分岐する -『wordpress』"
date: 2016-11-27T22:49:40+09:00
modified: 2017-02-13T14:02:59+09:00
excerpt: "WordPressの運用で便利に使うことができる、カスタムフィールドの値があるかないかの有無を判定して処理を分岐するtipsです。 カスタムフィールドに値があるかないかで処理を分ける条件分岐 カスタムフィールドに値がある"
primaryTag: "wordpress"
terms:
  - { id: 31, name: "if", slug: "if" }
  - { id: 64, name: "wordpress", slug: "wordpress" }
legacy:
  prev: json-comments
  next: github-toc
---

WordPressの運用で便利に使うことができる、カスタムフィールドの値があるかないかの有無を判定して処理を分岐するtipsです。

## カスタムフィールドに値があるかないかで処理を分ける条件分岐

カスタムフィールドに値がある時とない時とで処理を変えたい場合は以下のように記述します。`field_name`にカスタムフィールドのフィールド名を記述します。

```

<?php 
$custom_fields = get_post_meta( $post->ID , 'field_name' , true );
if(empty( $custom_fields ) === false){ ?>
  カスタムフィールドに値があるときの処理
<?php } else { ?>    
　　カスタムフィールドがないときの処理
<?php } ?>


```

おわります。
