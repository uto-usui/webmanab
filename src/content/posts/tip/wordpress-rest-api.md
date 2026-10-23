---
id: 1572
type: tip
slug: "wordpress-rest-api"
title: "2017年末にWP REST API で取得して描画するまでのまとめ -『WordPress』"
date: 2017-10-22T20:00:27+09:00
modified: 2017-10-26T17:34:57+09:00
excerpt: "WordPress REST API で投稿/メタデータ/ユーザーなどを、jsonとしてまとめてくれるので、JavaScriptで取得して描画するところまでを簡単に実装することができます。はじめかた、jsonのカスタマイ"
primaryTag: "wordpress"
terms:
  - { id: 29, name: "javascript", slug: "javascript" }
  - { id: 294, name: "Vue.js", slug: "vue-js" }
  - { id: 64, name: "wordpress", slug: "wordpress" }
legacy:
  prev: jquery-accordion
  next: nodebrew-manage-nodejs
---

WordPress REST API で投稿/メタデータ/ユーザーなどを、jsonとしてまとめてくれるので、JavaScriptで取得して描画するところまでを簡単に実装することができます。はじめかた、jsonのカスタマイズ、Vue.js で非同期取得して描画、最低限必要なことのまとめです。

ググると古い情報がたくさん出てきて困ったので、この記事をまとめました。

- WordPress 4.8.2
- WP REST API 2.0-beta15

上記の環境での情報です。

## はじめる

- [WordPress REST API (Version 2)](https://wordpress.org/plugins/rest-api/)
- [APIリファレンス](http://ja.wp-api.org/reference/)

「WordPress はアプリケーションフレームワークへと生まれ変わろうとしています。」という文章から始まっているのが印象的ですね。

プラグインをインストール/有効化したら、例えば以下のURLにアクセスすると、投稿のjsonが確認できます。

```

http://example.com/wp-json/wp/v2/posts/


```

## 基本的なtips

### カスタム投稿、タクソノミを有効にする

カスタム投稿やタクソノミを有効にするには、CPT UI を利用している場合ですが、「REST API で表示」を `True`にします。

```

http://example.com/wp-json/wp/v2/POST_TYPE/


```

タクソノミに所属するターム一覧は、

```

https://example.com/wp-json/wp/v2/TERM_NAME/


```

という感じでjson取得できます。

### アイキャッチ情報を取得

`_embed` をクエリに付加すると、アイキャッチ情報を取得できます。

```

http://example.com/wp-json/wp/v2/POST_TYPE?_embed


```

### 検索して取得

`search=` にパラメーターを渡します。

```

http://example.com/wp-json/wp/v2/POST_TYPE?search=vue


```

## Vue.js で記事一覧を取得する

取得したjsonを利用してコンテンツを描画します。フレームワークの Vue.js を使うと、シンプルに非同期処理を含むコンポーネントを定義することができます。導入など省きますが、ぼくは gulp.js で webpack を動かして vue-loader で .vue を読んでいます。CSS のフレームワークには bluma を利用しています。

- [Bulma](https://bulma.io/)
- [Vue.js](https://jp.vuejs.org/index.html)

ページ描画時に記事一覧を取得して、load more ボタンを押すと、さらに次のページを読み込むよくあるコンポーネントです。非同期処理は `axios` で簡潔に書いています。

#### post.vue

```

<template>
  <div>
    <h2>your post</h2>
    <transition-group class="columns is-gapless is-multiline" name="fade" tag="ul">
      <li class="column is-3" v-for="post in posts" v-bind:key="post.title.rendered">
        <a :href="post.link">
          <div class="card">
            <div class="card-image">
              <figure class="image is-16by9">
                <template v-if="post._embedded">
                  <img :src="post._embedded['wp:featuredmedia'][0].source_url" alt="">
                </template>
                <template v-else="">
                  <img src="https://source.unsplash.com/daily" alt="">
                </template>
              </figure>
            </div>
            <div class="card-content">
              <h2 class="content">
                {{post.title.rendered}}
              </h2>
            </div>
          </div>
        </a>
      </li>
    </transition-group>
    <button
      class="button is-primary"
      :class="[{
        'is-loading': loading,
        'is-desabled': disabled
      }]"
      :disabled="disabled"
      @click="load"
    >load more</button>
  </div>
</template>

<style scoped>
  .fade-enter-active, .fade-leave-active {
    transition: opacity .5s;
  }
  .fade-enter, .fade-leave-to{
    opacity: 0;
  }
</style>

<script>

  import axios from 'axios';

  export default {

    data: function() {

      return {
        posts: [],
        page: 0,
        loading: false,
        disabled: false,
      }

    },

    mounted: function() {

      this.page = 1;

    },

    watch: {

      page() {

        const url = `https://example.com/wp-json/wp/v2/tip?page=${this.page}&_embed`;

        axios.get(url).then(response => {

          this.posts = this.posts.concat(response.data);
          this.loading = false;

        }).catch(error => {

          console.log(error);
          this.empty();

        });

      }

    },

    methods: {

      load() {

        this.loading = true;
        this.page++;

      },

      empty() {

        this.loading = false;
        this.disabled = true;

      }

    },

  }

</script>


```

#### main.js

```

import Vue from 'Vue';
import myPost from 'Component/post';

new Vue({
  el: '#app',
  components: {
    myPost
  }
});


```

#### webpack.config.js の一部

```

import path from 'path';

resolve: {
  // 拡張子の省略の許可
  extensions: [
    '.js',
    '.vue'
  ],
  // パス通しやすくしとく
  alias: {
    'Vue$': 'vue/dist/vue.common.js',
    'Component': path.resolve(__dirname, 'src/assets/js/component/'),
  },
}


```

## レスポンスを増やす

`register_rest_field` 関数を使って、REST APIは簡単に拡張できます。

### 投稿のカスタムフィールドを出力する

プラグインのACFを利用している前提です。

#### function.php

```

function wp_rest_api_cf() {

  $params = array(
    'get_callback'    => function($data, $field, $request, $type) {

      if (function_exists('get_fields')) {

        return get_fields($data['id']);

      }
      return [];

    },
    'update_callback' => null,
    'schema'          => null,
  );


  $post_types = get_post_types( '', 'names' );

  foreach ( $post_types as $post_type ) {

    register_rest_field( $post_type, 'fields', $params );

  }

}
add_action( 'rest_api_init', 'wp_rest_api_cf');


```

#### json

```

"fields": {
  "demo": false,
  "demo-url": "",
  "primary-tag": "javascript"
},


```

### 投稿が所属するタームを全て出力する

デフォルトではどのタームに属しているか出力されません。投稿が所属するタクソノミとそのタームを全て取得します。

#### function.php

```

function wp_rest_api_terms() {

  $params = array(
    'get_callback'    => function($data, $field, $request, $type) {

      if (function_exists('get_the_terms')) {

        $post = get_post( $data['id'] );
        $post_type = $post->post_type;
        $taxonomies = get_object_taxonomies( $post_type, 'objects' );
        $terms = array();
        foreach ( $taxonomies as $taxonomy_slug => $taxonomy ) {

          $terms[$taxonomy->label] = get_the_terms( $data['id'], $taxonomy_slug );

        }
        return $terms;

      }

      return [];

      },
    'update_callback' => null,
    'schema'          => null,
  );

  $post_types = get_post_types( '', 'names' );

  foreach ( $post_types as $post_type ) {

    register_rest_field( $post_type, 'terms', $params );

  }

}
add_action( 'rest_api_init', 'wp_rest_api_terms');



```

#### json

```

"terms": {
  "tips": [
    {
      "term_id": 29,
      "name": "javascript",
      "slug": "javascript",
      "term_group": 0,
      "term_taxonomy_id": 29,
      "taxonomy": "tips",
      "description": "",
      "parent": 0,
      "count": 31,
      "filter": "raw"
    },
    {
      "term_id": 30,
      "name": "jQuery",
      "slug": "jquery",
      "term_group": 0,
      "term_taxonomy_id": 30,
      "taxonomy": "tips",
      "description": "",
      "parent": 0,
      "count": 11,
      "filter": "raw"
    },
  ],
  "writer": [
    {
      "term_id": 8,
      "name": "uto usui",
      "slug": "uto-usui",
      "term_group": 0,
      "term_taxonomy_id": 8,
      "taxonomy": "writer",
      "description": "",
      "parent": 0,
      "count": 493,
      "filter": "raw"
    }
  ]
},


```

## 古い情報について

大抵2016年に書かれている情報は、動かないことが多いです。ググると上位に出てくる日本語記事はこのケースが多いので注意したいです。あたりまえですが、公式のドキュメントを読むのが一番ですね。

例えば、

- `filter[]=` クエリは使えない

- `register_api_field` 関数は使えない、 `register_rest_field` 関数を使う

おわります。
