---
id: 834
type: tip
slug: "hide-toolbar"
title: "ログインユーザーがページ閲覧時に表示されるツールバーをfunctions.phpで非表示させる -『wordpress』"
date: 2016-12-16T16:46:28+09:00
modified: 2017-02-13T14:02:41+09:00
excerpt: "wordpressで構築されているサイトにログインしている状態で、該当のサイトを閲覧すると、サイトヘッダー部にツールバーが表示されます。これのおかげで便利に管理画面にショートカットして行き来できる反面、サイト上部に固定さ"
primaryTag: "wordpress"
terms:
  - { id: 65, name: "function.php", slug: "function-php" }
  - { id: 64, name: "wordpress", slug: "wordpress" }
legacy:
  prev: javascript-settimeout-jquery-queue
  next: wordpress-eyecatch
---

wordpressで構築されているサイトにログインしている状態で、該当のサイトを閲覧すると、サイトヘッダー部にツールバーが表示されます。これのおかげで便利に管理画面にショートカットして行き来できる反面、サイト上部に固定されているナビゲーションがある場合に非常に邪魔になってしまいます。

このときに簡単にツールバーを非表示にするtipsです。

## ログインユーザーがページ閲覧時に表示されるツールバーを非表示させる

ログインユーザーがページ閲覧時に表示されるツールバーを非表示させるとき、以下のコードを functions.php に記述します。

#### function.php

```

add_filter('show_admin_bar','__return_false');


```
