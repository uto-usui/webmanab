---
id: 685
type: tip
slug: "wordpress-excerpt-test"
title: "WordPressの抜粋文の末尾の[…]を変更する -『wordpress』"
date: 2016-11-11T20:09:31+09:00
modified: 2017-02-13T14:03:12+09:00
excerpt: "WordPressで記事一覧やページのディスクリプションなどに抜粋文を出力することがあると思いますが、設定されている文字数を超えると表示される[…]を任意の文字列にかえるためのtipsです。 WordPres"
primaryTag: "wordpress"
terms:
  - { id: 65, name: "function.php", slug: "function-php" }
  - { id: 64, name: "wordpress", slug: "wordpress" }
legacy:
  prev: wordpress-rss-cpt
  next: brackets-file-tree-exclude
---

WordPressで記事一覧やページのディスクリプションなどに抜粋文を出力することがあると思いますが、設定されている文字数を超えると表示される\[…]を任意の文字列にかえるためのtipsです。

## WordPressの抜粋文の末尾の\[…]を変更する

抜粋文の末尾の文字列を変更するには以下のコードを`function.php`に記述します。`..more..`の部分を任意で変更してください。空にすることも可能です。

#### function.php

```

function my_excerpt_more_text($more) {
  return '..more..';
}
add_filter('excerpt_more', 'my_excerpt_more_text');


```

ちなみに抜粋文の長さ(文字数)を調節するには以下のコードを`function.php`に記述します。

#### function.php

```

function my_excerpt_length($length) {
  return 80;
}
add_filter('excerpt_length', 'my_excerpt_length');


```

おわります。
