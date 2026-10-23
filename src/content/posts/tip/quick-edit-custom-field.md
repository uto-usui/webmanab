---
id: 636
type: tip
slug: "quick-edit-custom-field"
title: "カスタムフィールドを管理画面の投稿一覧に表示させてクイック編集モードで編集可能にする方法 -『wordpress』"
date: 2016-11-01T14:26:22+09:00
modified: 2017-02-13T14:03:47+09:00
excerpt: "カスタムフィールドの値をアドバンスカスタムフィールドなどで拡張して便利に扱っていることは多いと思いますが、投稿一覧でチェックしたい場合や、その際頻繁に変更する必要がある場合に、カスタムフィールドを管理画面の投稿一覧に表示"
primaryTag: "admin"
terms:
  - { id: 204, name: "admin", slug: "admin" }
  - { id: 65, name: "function.php", slug: "function-php" }
  - { id: 64, name: "wordpress", slug: "wordpress" }
legacy:
  prev: load-original-css-javascript-to-admin
  next: circle-number
---

カスタムフィールドの値をアドバンスカスタムフィールドなどで拡張して便利に扱っていることは多いと思いますが、投稿一覧でチェックしたい場合や、その際頻繁に変更する必要がある場合に、カスタムフィールドを管理画面の投稿一覧に表示させてクイック編集モードでその場で編集可能にする方法です。

今回はカスタムフィールドの値はテキストのみになります。

## 管理画面の投稿一覧にカスタムフィールドの項目を追加する

まずは管理画面の投稿一覧にカスタムフィールドの項目を表示させてみます。

```

function add_posts_columns( $defaults ) {
  $defaults['item01'] = 'item01'; // ID と 表示させるラベル
  $defaults['item02'] = 'item02';
  return $defaults;
}
add_filter( 'manage_posts_columns', 'my_posts_columns' );

function my_posts_custom_column( $column, $post_id ) {
  switch ( $column ) {
    case 'item01': // ID
      $post_meta = get_post_meta( $post_id, 'item01', true );
      if ( $post_meta ) {
          echo $post_meta;
      } else {
          echo 'none'; // 値が無いとき
      }
    break;

    case 'item02':
      $post_meta = get_post_meta( $post_id, 'item02', true );
      if ( $post_meta ) {
          echo $post_meta;
      } else {
          echo 'none';
      }
      break;
  }
}
add_action( 'manage_posts_custom_column' , 'my_posts_custom_column', 10, 2 );


```

### クイック編集にカスタムフィールドの入力エリアを追加

クイック編集の中にカスタムフィールドの入力エリアを追加します。

```

function add_field_to_quickmenu( $column_name, $post_type ) {
  static $print_nonce = TRUE;
  if ( $print_nonce ) {
    $print_nonce = FALSE;
    wp_nonce_field( 'quick_edit_action', $post_type . '_edit_nonce' );
  }
  ?>
  <fieldset class="inline-edit-col-right inline-custom-meta">
    <div class="inline-edit-col column-<?php echo $column_name ?>">
      <label class="inline-edit-group"></p>
        <?php
          switch ( $column_name ) {
            case 'item01':
              ?><span class="title">item01</span><input name="item01"><?php
              break;

            case 'item02':
              ?><span class="title">item02</span><input name="item02"><?php
              break;
          }
        ?>
      </label>
    </div>
  </fieldset>
  <?php
  }
add_action( 'quick_edit_custom_box', 'add_field_to_quickmenu', 10, 2 );


```

### カスタムフィールドの入力エリアにjQueryで値をセットしておく

あらかじめカスタムフィールドに保存されている値がある場合に、カスタムフィールドの値をjQueryでセットします。

```

function my_admin_edit_foot() {
  global $post_type;

  $slug = 'post'; // 投稿タイプの指定をしたいとき変更

  if ( $post_type == $slug ) {
    ?>
    <script>
      (function($) {
        var $wp_inline_edit = inlineEditPost.edit;
        inlineEditPost.edit = function( id ) {
          $wp_inline_edit.apply( this, arguments );
          var $post_id = 0;
          if ( typeof( id ) == 'object' )
            $post_id = parseInt( this.getId( id ) );
          if ( $post_id > 0 ) {
            var $edit_row = $( '#edit-' + $post_id );
            var $post_row = $( '#post-' + $post_id );
            //椅子
            var $chair = $( '.column-item01', $post_row ).html();
            $( ':input[name="item01"]', $edit_row ).val( $chair );
            //机
            var $table = $( '.column-item02', $post_row ).html();
            $( ':input[name="item02"]', $edit_row ).val( $table );
          }
        };
      })(jQuery);
    </script>
    <?php
  }
}
add_action('admin_print_footer_scripts', 'my_admin_edit_foot');


```

### クイック編集モードでカスタムフィールドの値を保存させる

最後に保存機能を追加します。

```

function save_custom_meta( $post_id ) {
  if ( !current_user_can( 'edit_post', $post_id ) ) {
      return;
  }
  $_POST += array("{$slug}_edit_nonce" => '');
  if ( !wp_verify_nonce( $_POST["{$slug}_edit_nonce"], 'quick_edit_action' ) ) {
      return;
  }

  if ( isset( $_REQUEST['item01'] ) ) {
      update_post_meta( $post_id, 'item01', $_REQUEST['item01'] );
  }
  if ( isset( $_REQUEST['item02'] ) ) {
      update_post_meta( $post_id, 'item02', $_REQUEST['item02'] );
  }
}
add_action( 'save_post', 'save_custom_meta' );


```

おわります。
