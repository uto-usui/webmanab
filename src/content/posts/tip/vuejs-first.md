---
id: 1566
type: tip
slug: "vuejs-first"
title: "これから始める Vue.js のはじめてのコンポーネント -『Vue.js』"
date: 2017-09-29T18:36:39+09:00
modified: 2017-10-01T11:55:05+09:00
excerpt: "簡単なVue.jsの始めかたと概要です。プレイスホルダーイメージのコンポーネントを作ってみます。 Vue.js とは Vue.jsは柔軟で、気軽に使えるフレームワークです。Webcomponetsの実装や複雑なアプリケー"
primaryTag: "Vue.js"
terms:
  - { id: 295, name: "component", slug: "component" }
  - { id: 238, name: "frontend", slug: "frontend" }
  - { id: 29, name: "javascript", slug: "javascript" }
  - { id: 294, name: "Vue.js", slug: "vue-js" }
demoUrl: https://jsfiddle.net/yutousui/vLnnhyvb/
legacy:
  prev: javascript-object-about
  next: vuejs-second
---

簡単なVue.jsの始めかたと概要です。プレイスホルダーイメージのコンポーネントを作ってみます。

## Vue.js とは

Vue.jsは柔軟で、気軽に使えるフレームワークです。Webcomponetsの実装や複雑なアプリケーションの構築でない場合だったら、CDNでサクッと読み込んで使ってもいいですし、実際の構築ではWebpackなどででビルドして使っていくことが多いです。

Vue.jsはコンポーネント構築のためのフレームワークで、できることはReactとよく似ていますが、より気軽に導入できるのがVue.jsだと考えられます。

## Vue.js を始める

レポジトリからダウンロード(npm/yarn)するか、CDNで読み込んでもいいでしょう。

- [vue](https://github.com/vuejs/vue)

```

<script src="https://cdnjs.cloudflare.com/ajax/libs/vue/2.4.4/vue.js"></script>


```

### コンテナをつくる

Vue.jsで構築したい領域をHTMLに用意します。

```

<div id="app"></div>


```

### ルートコンポーネントの作成

ルートコンポーネントを作成します。`new Vue()`でインスタンスを生成して、生成したインスタンスはコンテナにマウントします。

```

let root = new Vue({

  template: '<div>Vue, Vue!</div>',

});

root.$mount('#app');


```

### 子コンポーネントの作成

ルートコンポーネントの中に、子コンポーネントを展開します。ルートコンポーネントは、インスタンスを作成しましたが、子供はクラス用意するため、`new`は必要ありません。

クラスを作るには`Vue.extend`関数を使います。クラスを作成し、親の`componets`にセット、`template`に独自タグで呼び出すようにしてみます。

```

let placeholdImage = Vue.extend({

  template:
  `<img src="https://source.unsplash.com/random/1600x900" alt="">`

});

let root = new Vue({

  template:
  `<div>
      <placehold-image></placehold-image>
   </div>`,

  components: {
    placeholdImage: placeholdImage
  }

});

root.$mount( '#app' );


```

注意点として、独自タグではハイフン区切りで記述して、クラスはキャメルケースで記述します。独自タグを定義しているので、`<placehold-image>`の記述だけで、何度も子\
コンポーネントを呼び出すことができます。

### 属性を受け渡す

親コンポーネントから子コンポーネントに属性を受け渡せるようにして、呼び出し時にモデファイできるようにします。この受け渡す構造をバインド、と呼びます。

子が属性を受け取るためには、`props` を定義し独自属性を作り、元の属性名に`:`を付与します。

```

let placeholdImage = Vue.extend({
  template:
  `<img :width="mywidth" src="https://source.unsplash.com/random/1600x900" alt="">`,
  props: {
    mywidth: {
      type: Number,
      default: 1600
    }
  }
});


```

呼び出し元の独自タグでは、独自属性に値を渡します。

```

let root = new Vue({

  template:
  `<div>
      <placehold-image :mywidth="500"></placehold-image>
      <placehold-image></placehold-image>
   </div>`,

  components: {
    placeholdImage: placeholdImage
  }

});

root.$mount( '#app' );


```

これでサイズを呼び出し元で変更できるプレイスホルダーイメージのコンポーネントが作れました。

おわります。
