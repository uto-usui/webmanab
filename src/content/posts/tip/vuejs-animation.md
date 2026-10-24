---
id: 1804
type: tip
slug: "vuejs-animation"
title: "Vue.js ではじめるお手軽なアニメーション-『Vue.js』"
date: 2017-12-20T01:21:45+09:00
modified: 2017-12-20T01:27:35+09:00
excerpt: "Vue.js では、要素を追加／更新／削除したときのアニメーションを、簡単に実装できるような機能が用意されています。 本当にありがたいことに、公式のドキュメントにバッチリとまとまっていますが、それを要約しつつパパッと今日"
primaryTag: "Vue.js"
terms:
  - { id: 2, name: "animation", slug: "animation" }
  - { id: 29, name: "javascript", slug: "javascript" }
  - { id: 294, name: "Vue.js", slug: "vue-js" }
demoUrl: https://jsfiddle.net/yutousui/pg94dwLh/
legacy:
  prev: javascript-get-object
  next: webgl-three-start
---

Vue.js では、要素を追加／更新／削除したときのアニメーションを、簡単に実装できるような機能が用意されています。

本当にありがたいことに、公式のドキュメントにバッチリとまとまっていますが、それを要約しつつパパッと今日から始められるように、ライトに端折って紹介します。

- [Enter/Leave とトランジション一覧 — Vue.js](https://jp.vuejs.org/v2/guide/transitions.html)

## シンプルな実装

Vue が提供しているアニメーション機能は、かなり多機能で美味しい仕様になっていますが、とりあえず一番簡単なアプローチで実装してみます。

### ポイント

1. `<transition name="your-anim-name">` で、`v-if` や `v-show` が指定された要素をラップする
2. `name` 属性が `class` 名のプレフィクスになる
3. 挿入(enter)／削除(leave)時のアニメーションの進捗を補足して、それに応じた `class` を自動で切り替える
4. CSSの `transition` と `animation` どちらも受け付ける

- [DEMO: Vue.js transition template – JSFiddle](https://jsfiddle.net/yutousui/7vxrum6v/)

### コード

```html

<div id="app">
  <transition name="fade">
    <img v-show="show" class="image" src="https://source.unsplash.com/1600x900/?nature,water" alt="placeholder">
  </transition>
  <button class="button" id="button" @click="toggle">{{show ? 'leave' : 'enter'}}</button>
</div>


```

```scss

// enter の継続状態。トランジションがはじまるフェーズ中に適用。
// 要素が挿入される前に追加され、トランジション/アニメーションが終了すると削除
// 登場シーンの期間、遅延、イージングを定義
.fade-enter-active {
  transition: all 1s cubic-bezier(0.19, 1, 0.22, 1);
  // animation: fade .5s;
}


// leave の継続状態。トランジションが終わるフェーズ中に適用
// leave がトリガされるとき追加され、トランジション/アニメーションが終了すると削除
// 削除シーンの期間、遅延、イージングを定義
.fade-leave-active {
  transition: all 1s cubic-bezier(0.895, 0.03, 0.685, 0.22);
  // animation: fade .5s reverse;
}

//  enter の開始状態。
//  要素が挿入される前に適用され、要素が挿入された 1 フレーム後に削除
//  要素の登場シーンのスタイルがここ
.fade-enter {
  opacity: 0;
  transform: translateX(-100%);
}

// leave の終了状態
// トランジションの終了がトリガされた後に (同時に v-leave 削除) 1フレーム追加
// トランジション/アニメーションが終了すると削除
// 要素の削除シーンのスタイルがここ
.fade-leave-to {
  opacity: 0;
  transform: translateX(100%);
}


```

```js

const root = new Vue({
   data: function() {
     return {
       show: false
     }
   },
   methods: {
    toggle() {
      this.show = !this.show
    }
  },
});
root.$mount( '#app' );


```

- [トランジションクラス](https://jp.vuejs.org/v2/guide/transitions.html#%E3%83%88%E3%83%A9%E3%83%B3%E3%82%B8%E3%82%B7%E3%83%A7%E3%83%B3%E3%82%AF%E3%83%A9%E3%82%B9)

### 初期描画時に実行する

初期描画時に実行するには、 `appear` 属性を付与します。

```html

<transition appear name="fade">
  <el></el>
</transition>


```

## 発展した使い方

よく使う、すこし高度な実装を紹介します。

### いくつかの要素を入れ替えるアニメーション

表示要素を入れ替えるようなアニメーションには `key` 属性を利用します。

- [要素間のトランジション](https://jp.vuejs.org/v2/guide/transitions.html#%E8%A6%81%E7%B4%A0%E9%96%93%E3%81%AE%E3%83%88%E3%83%A9%E3%83%B3%E3%82%B8%E3%82%B7%E3%83%A7%E3%83%B3)

  `mode` 属性でイベントが発火するタイミングをコントロールします。\
  削除する要素のアニメーションの完了を待ったあと、展開する要素のアニメーションを開始するように、 `out-in` を指定します。

- [トランジションモード](https://jp.vuejs.org/v2/guide/transitions.html#%E3%83%88%E3%83%A9%E3%83%B3%E3%82%B8%E3%82%B7%E3%83%A7%E3%83%B3%E3%83%A2%E3%83%BC%E3%83%89)

```html

<transition name="fade" mode="out-in">
  <button :key="show" class="button" id="button" @click="toggle">{{show ? 'leave' : 'enter'}}</button>
</transition>


```

- [DEMO: Vue.js transition template – JSFiddle](https://jsfiddle.net/yutousui/7vxrum6v/)

### JavaScriptのフック

`class` が自動切替えされるタイミングで、任意のコールバック関数を定義できます。これで、jQuery や TweenMax などのライブラリと連携をとって、より複雑なアニメーションを組み込めます。

CSSアニメーションを使わない場合は、`:css="false"` を記述し、`enter(el, done)` `leave(el, done)` の第二引数で、アニメーションの完了を教えてあげます。

- [DEMO: Vue.js TweenMax – JSFiddle](https://jsfiddle.net/yutousui/pfkfy3yc/)

```html

<transition
    @enter="enter"
    @leave="leave"
    :css="false"
>
    <el></el>
</transition>


```

```js

const root = new Vue({
    methods: {
      // 
      enter(el, done) {
        TweenMax.fromTo(el, 1, {
          x: '-100%',
          rotationX: 180,
        }, {
          x: '0%',
          rotationX: 0,
          scale: 1,
          onComplete: done,
          ease: Expo.easeOut,
        })
      },
      leave(el, done) {
        TweenMax.to(el, .5, {
          x: '100%',
          rotationX: 360,
          scale: .1,
          onComplete: done,
          ease: Expo.easeIn,
        })
      }
    },
  });


```

## 複数のアイテムのアニメーション

これまでは単一の要素を描画するためのアニメーションでしたが、複数の要素が追加／削除されるような場合のアニメーションを実装することもできます。

- [リストトランジション](https://jp.vuejs.org/v2/guide/transitions.html#%E3%83%AA%E3%82%B9%E3%83%88%E3%83%88%E3%83%A9%E3%83%B3%E3%82%B8%E3%82%B7%E3%83%A7%E3%83%B3)

### ポイント

1. `<transition-group>` で要素をラップする
2. `key` をそれぞれの要素に指定する
3. `.*-move` で位置の変化を制御する

- [Vue.js transition-group – JSFiddle](https://jsfiddle.net/yutousui/pg94dwLh/)

### コード

```html

<div id="app">
  <div class="field has-addons">
    <p class="control">
      <button class="button" @click="toggle">
        {{show ? 'leave' : 'enter'}}
      </button>
    </p>
    <p class="control">
      <button class="button" @click="add">
        add
      </button>
    </p>
    <p class="control">
      <button class="button" @click="shuffle">
        shuffle
      </button>
    </p>
  </div>
  <div class="field">
    <label class="label">Image Query</label>
    <div class="control">
      <input class="input" type="text" placeholder="Text input" v-model="query">
    </div>
    <p class="help is-info">Enter the keyword of the image you want to call.</p>
  </div>

  <transition-group name="fade" tag="ul" class="columns is-mobile is-multiline is-gapless">
    <li class="column is-one-third" v-show="show" v-for="item in items" :key="item.src">
      <img :src="item.src" alt="placeholder">
    </li>
  </transition-group>

</div>


```

```js

let baseImageUrl = 'https://source.unsplash.com/1600x900/?';

const root = new Vue({
   data: function() {
     return {
       show: false,
       items: [
         {
           id: this.counter,
           src: baseImageUrl + 'nature,water'
         },
       ],
       query: '',
       counter: 0,
     }
   },
   methods: {
    toggle() {
      this.show = !this.show
    },
    add() {
      // 画像ロードするの待って
      let img = new Image();
      let src = baseImageUrl + this.query;
      img.onload = () => {
        this.items.push({
          src: src
        });
      };
      img.src = src;
    },
    shuffle() {
      this.items = _.shuffle(this.items)
    }
  }
});

root.$mount( '#app' );


```

```scss

// 位置の変化を検知する *-move 
.fade-move {
  transition: all 1s cubic-bezier(0.895, 0.03, 0.685, 0.22);
}

.fade-enter-active {
  // easeOutExpo
  transition: all 1s cubic-bezier(0.19, 1, 0.22, 1);
}

.fade-leave-active {
  // easeInQuart
  transition: all 1s cubic-bezier(0.895, 0.03, 0.685, 0.22);
}

.fade-enter {
  opacity: 0;
  transform: translateX(-100%);
}

.fade-leave-to {
  opacity: 0;
  transform: translateX(100%);
}


```

複数の要素の位置関係を把握して、要素の追加や並び替えに反応、適当な位置へアニメーションしてくれます。ソートUIのアニメーションを簡単に書くことができますね。

おわります。
