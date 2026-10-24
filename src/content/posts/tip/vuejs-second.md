---
id: 1567
type: tip
slug: "vuejs-second"
title: "これから始める Vue.js をさらに理解 -『Vue.js』"
date: 2017-09-30T00:03:53+09:00
modified: 2017-10-01T11:55:32+09:00
excerpt: "コンポーネントに関数やイベントを定義していくことで、より実践的なUIを実装します。 これから始める Vue.js のはじめてのコンポーネント -『Vue.js』 値を保存しておく場所 data コンポーネントの属性値を保"
primaryTag: "Vue.js"
terms:
  - { id: 295, name: "component", slug: "component" }
  - { id: 238, name: "frontend", slug: "frontend" }
  - { id: 29, name: "javascript", slug: "javascript" }
  - { id: 294, name: "Vue.js", slug: "vue-js" }
demoUrl: https://jsfiddle.net/yutousui/zyh3ckf6/
legacy:
  prev: vuejs-first
  next: jquery-accordion
---

コンポーネントに関数やイベントを定義していくことで、より実践的なUIを実装します。

- [これから始める Vue.js のはじめてのコンポーネント -『Vue.js』](/tip/vuejs-first/)

## 値を保存しておく場所 data

コンポーネントの属性値を保存するのは `props`でしたが、親コンポーネントから受け渡される値を保存するという役割でした。自コンポーネント内でやり取りする値は、`data` に定義します。

`data` はオブジェクトを `return` する `function` です。 `return` されたオブジェクトに値を保存していきます。

```

let root = new Vue({

  data: () => {
    return {
      mydata: true
    }
  }

});


```

## イベントとコンポーネント関数

Vue.jsでは、テンプレート内でイベント属性のような書きかたで、イベントの処理を記述します。クリックイベントでは `@click` 属性を使います。コンポーネント内で利用する関数は `methods` に定義します。

### dataの書き換え

コンポーネントの `methods`の関数内は、そのコンポーネントの `data` への参照が可能です。`this.$data`というプロパティからアクセスすることができます。

```

let root = new Vue({

  data: () => {
    return {
      number: 0
    }
  },
  template:
    '<div>' +
    　'<p>{{ number }}</p>' +
      '<button type="button" @click="counter( 1 )">+</button>' +
      '<button type="button" @click="counter( -1 )">-</button>' +
    '</div>',
  methods: {
    counter: function ( value ) {
      this.$data.number += value;
    }
  }

});

root.$mount( '#app' );


```

#### イベントのいろいろな書き方

- @mouseover
- @mousemove
- @focus
- @blur

## 条件分岐 v-if

テンプレート内で条件分岐を行うためには、v-ifという専用の属性を使います。条件を満たす場合にのみ、対象の要素が出力されるようになります。

```

let root = new Vue({

  data: () => {
    return {
      number: 0
    }
  },
  template:
    `<div>
    　<p>{{ number }}</p>
      <button type="button" @click="counter( 1 )">+</button>
      <button type="button" @click="counter( -1 )">-</button>
      <p v-if="number >= 1">正</p>
      <p v-if="number <= -1">負</p>
    </div>`,
  methods: {
    counter: function ( value ) {
      this.$data.number += value;
    }
  }

});

root.$mount( '#app' );


```

おわります。
