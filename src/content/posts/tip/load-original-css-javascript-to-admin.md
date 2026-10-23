---
id: 634
type: tip
slug: "load-original-css-javascript-to-admin"
title: "管理画面にオリジナルのCSSとJavaScriptを適用させるいくつかの方法 -『wordpress』"
date: 2016-11-01T13:36:49+09:00
modified: 2017-02-13T14:03:57+09:00
excerpt: "管理画面に自分で用意したCSSとJavaScriptを読み込ませたいときが度々あるかと思います。そのとき適用させる管理画面を限定したりjQueryに依存させるように記述したり外部ファイルにしたり直接書き込んだりと、fun"
primaryTag: "admin"
terms:
  - { id: 204, name: "admin", slug: "admin" }
  - { id: 65, name: "function.php", slug: "function-php" }
  - { id: 64, name: "wordpress", slug: "wordpress" }
legacy:
  prev: wordpress-admin-thumb-id
  next: quick-edit-custom-field
---

管理画面に自分で用意したCSSとJavaScriptを読み込ませたいときが度々あるかと思います。そのとき適用させる管理画面を限定したりjQueryに依存させるように記述したり外部ファイルにしたり直接書き込んだりと、function.phpでのいろいろ書き方についてまとめていきます。

## CSSとJavaScriptを管理画面の全てに適用させるように読み込む

特にフィルターなどをかけずに全ての管理画面のページに適応させるように記述します。

### head内にCSSとJavaScriptを書き込む

htmlの`<head>`内に内部スタイルシート・スクリプトとして記述する方法です。

#### css

```

function add_admin_style() {
  echo '<style>.ex{font-size: 16px;}</style>';
}
add_action('admin_print_styles', 'add_admin_style');


```

#### javaScript

```

function add_admin_script() {
  echo '<script>alert('add script');</script>;
}
add_action('admin_print_scripts', 'add_admin_script');


```

### JavaScriptをbody要素終了直前に書き込む

`<script>`は基本的に`</body>`直前に記述しますよね。jQueryなどのライブラリに依存している場合などもここに記述することで正常に動作させることができます。

#### javaScript

```

function add_admin_script() {
  echo '<script>alert('add script');</script>;
}
add_action('admin_print_footer_scripts', 'add_admin_script');


```

### CSSとJavaScriptの外部ファイルをhead内もしくは、body要素終了直前に読み込む

CSSやJavaScriptをfunction.phpに記述して管理するのではなく、外部ファイルとして読み込ませる方法です。この方が管理しやすいですし複雑な処理の実装になればこの方法をとることをお勧めします。

#### css

```

function add_admin_style(){
    wp_enqueue_style( 'admin_add', get_template_directory_uri().'/admin_add.css' );
}
add_action( 'admin_enqueue_scripts', 'add_admin_style' );


```

#### javaScript

```

function add_admin_script(){
    wp_enqueue_script( 'my_admin_script', get_template_directory_uri().'/admin_add.js' );

    // jQuery依存のスクリプト
    wp_enqueue_script( 'my_admin_script', get_template_directory_uri().'/admin_add.js', array('jquery'));

    // body要素終了直前で読み込む
    wp_enqueue_script( 'my_admin_script', get_template_directory_uri().'/admin_add.js', '', '', true);

    // jQuery依存かつ、body要素終了直前で読み込む
    wp_enqueue_script( 'my_admin_script', get_template_directory_uri().'/admin_add.js', array('jquery'), '', true);
}
add_action( 'admin_enqueue_scripts', 'add_admin_script' );


```

## 場所を限定して管理画面にオリジナルのCSSとJavaScriptを読み込む

場所を限定して読み込ませる場合は、ファイルを読み込みたい管理画面ページのurlの「wp-admin/…」の後に続いている文字列の名前を付けるとそのページにのみファイルを読み込むことができます。

```

// 外部ファイル
add_action('admin_head-ページ名', 'my_admin_script');

// スタイルを直接書き込む
add_action("admin_print_styles-ページ名", 'my_admin_css');

// スクリプトを直接書き込む
add_action("admin_print_scripts-ページ名", 'my_admin_script');


```

おわります。
