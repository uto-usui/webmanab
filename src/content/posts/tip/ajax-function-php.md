---
id: 1210
type: tip
slug: "ajax-function-php"
title: "Ajaxでfunction.phpに記述した関数を動かして何かするときに必要なこと -『WordPress』"
date: 2017-03-16T10:10:28+09:00
modified: 2017-06-01T11:40:04+09:00
excerpt: "WordPressを実装したサイトで、「ボタンをクリックしたときにデータベースにアクセスして何かとってくる」など、ユーザーのアクションに応じて、Ajax通信でfunction.phpに定義した関数を実行する方法です。 例"
primaryTag: "wordpress"
terms:
  - { id: 278, name: "ajax", slug: "ajax" }
  - { id: 65, name: "function.php", slug: "function-php" }
  - { id: 64, name: "wordpress", slug: "wordpress" }
legacy:
  prev: javascript-scope
  next: easy-instagram-feed
---

WordPressを実装したサイトで、「ボタンをクリックしたときにデータベースにアクセスして何かとってくる」など、ユーザーのアクションに応じて、Ajax通信で`function.php`に定義した関数を実行する方法です。

例として、ボタンを押すとカスタムフィールドの値をインクリメントするスクリプトをつくってみました。

## 呼び出すPHP関数の作成

JavaScriptからAjaxで呼び出したいphp関数をfunction.phpに定義します。

#### functions.php

```

function my_ajax_func() {
  $meta_key = $_POST['meta_key'];
  $meta_value = $_POST['meta_value'];
  $post_id = $_POST['post_id'];
  update_post_meta($post_id, $meta_key, $meta_value); // update the field.
  echo 'success';
  wp_die($fieldname = '', $fieldvalue = '', $postid = '');  // error
}

add_action('wp_ajax_action_name', 'my_ajax_func');  // ログインユーザ
add_action('wp_ajax_nopriv_action_name', 'my_ajax_func');  //未ログインユーザ


```

`action_name`は任意の名前です。

`wp_ajax_*` でAjaxで扱う独自のアクションフックを登録しますが、`wp_ajax_*` はログインユーザー、`wp_ajax_nopriv_*`はログインしてないユーザ用のフィルタです。

## JavaScripとテンプレートの用意

例として、`single.php`に記述する感じです。

#### single.php (テンプレート)

```

<a class="js-btn" href="" data-id="<?php echo $post->ID; ?>" data-key="ex_key" data-value="<?php echo get_post_meta($post->ID, 'ex_key', ture) ?>">click :)</a>


```

jQueryの`$.ajax`メソッドを利用して簡単に記述します。

#### javascript

```

(function($){

  $('.js-btn').on('click', function(e) {

    e.preventDefault();

    var ajaxUrl = window.location.protocol + '//' + window.location.host + '/wp-admin/admin-ajax.php',
        $this = $(this),
        metaKey = $this.attr('data-key'),
        metaValue = parseInt($this.attr('data-value')) + 1, // インクリメント
        postId = $this.attr('data-id');

    $.ajax({
      type: 'POST',
      url: ajaxUrl,
      data: {
        'action' : 'action_name', // フックの名前を渡す
        'meta_key' : metaKey,  // 変数を渡す
        'meta_value' : metaValue,
        'post_id' : postId
      },
      beforeSend: function() {
        console.log('updating');
    } ,
      success: function (res) {
        console.log(res);
      },
      error: function(data) {
        console.log('error');
      }

    });

  });

})(jQuery);


```

`admin-ajax.php`へのパスを取得します。

```

var ajaxUrl = window.location.protocol + '//' + window.location.host + '/wp-admin/admin-ajax.php'


```

`action`にアクションフック名を渡します。

```

'action' : 'action_name',


```

上と同じく`data`に任意の名前で変数を渡します。

```

'meta_key' : metaKey


```

おわります。
