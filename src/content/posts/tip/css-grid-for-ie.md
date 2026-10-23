---
id: 2718
type: tip
slug: "css-grid-for-ie"
title: "Autoprefixer を使って CSS Grid の IE 対応をやっていく -『CSS』"
date: 2019-11-12T20:50:26+09:00
modified: 2019-11-17T01:05:58+09:00
excerpt: "Autoprefixer 9.7.1 を使って CSS Grid の IE 対応をします。いろいろ制限や要件ことに応じて書き方や癖があるので、気になる範囲をまとめていきます。 Autoprefixer の設定 Autop"
primaryTag: "CSS"
terms:
  - { id: 3, name: "css", slug: "css" }
  - { id: 238, name: "frontend", slug: "frontend" }
  - { id: 355, name: "grid", slug: "grid" }
  - { id: 124, name: "ie", slug: "ie" }
legacy:
  prev: vs-code-markdown
  next: css-grid-minmax
---

Autoprefixer 9.7.1 を使って CSS Grid の IE 対応をします。いろいろ制限や要件ことに応じて書き方や癖があるので、気になる範囲をまとめていきます。

## Autoprefixer の設定

Autoprefixer の引数に `grid: 'autoplace'` を渡します。いくつかの例を書いておきます。

### webpack

#### postcss.config.js

```js

module.exports = {
  plugins: [
    require('autoprefixer')({ grid: 'autoplace' })
  ],
};


```

### Gulp

#### gulpfile.js

```js

gulp.task("default", () => {
  return gulp.src("src/style.css")
    .pipe(autoprefixer({ grid: 'autoplace' }))
    .pipe(gulp.dest("dist"));
});


```

### nuxt

#### nuxt.config.js

```js

export default {
  build: {
    postcss: {
      preset: {
        autoprefixer: {
          grid: "autoplace"
        }
      }
    }
  }
};


```

環境構築しない場合はオンラインツールがあります。簡単に試したり、以降のコードの変換結果を確認したい場合は利用するといいとおもいます。

- [Autoprefixer CSS online](https://autoprefixer.github.io/)

ここでは変換結果はあまり解説しません。。。せっかく auto に対応していこうというモチベーションでいるのに、流石にそこまで過去の遺産を理解して … というようなことは省いていきたいという、おきもちですね。

## grid-template

`grid-template` はグリッドのエリア名、列と行の幅をまとめて指定できる便利なプロパティです。

#### html

```html

<div class="area">
  <div class="area__item area__item--head">...</div>
  <div class="area__item area__item--side">...</div>
  <div class="area__item area__item--main">...</div>
  <div class="area__item area__item--foot">...</div>
</div>


```

#### scss

```scss

.area {
  display: grid;
  gap: 10px 0;
  grid-template:
    "head head" 1fr
    "side main" minmax(100px, 2fr)
    "foot foot" 1fr /
    1fr 250px;
}

.area__item {
  //
  &--head {
    grid-area: head;
    background-color: salmon;
  }
  //
  &--side {
    grid-area: side;
    background-color: darkorange;
  }
  //
  &--main {
    grid-area: main;
    background-color: orangered;
  }
  //
  &--foot {
    grid-area: foot;
    background-color: indianred;
  }
}


```

## gap のメディアクエリ

`gap` は `grid-template-columns` や `grid-template-rows` を併記しないとポリフィルが出力されません。これは sass の入れ子記法でメディアクエリを記述する場合でも、重複してしまいますが再度書く必要があります。

`grid-template-areas` を指定しないパターンだと、次のように書くとよいです。

#### html

```html

<div class="area">
  <div class="area__item">...</div>
  <div class="area__item">...</div>
</div>


```

#### scss

```scss

.area {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto;
  gap: 20px;
  //
  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto;
    gap: 10px;
  }
}


```

## 自動配置

行と列が固定値になりますが `repeat()` 関数で折り返しのある自動配置を実現できます。また他の条件として、`repeat()` の `auto-fit` と `auto-fill` は使えません。

これはカードやカレンダー型の UI を作るときによく出てくるレイアウトに使えるパターンですね。

#### html

```html

<ul class="list">
  <li class="list__item"> ... </li>
  ... items ...
</ul>


```

#### scss

```scss

.list {
  display: grid;
  gap: 2px;
  grid-template-columns: repeat(7, 1fr);
  grid-template-rows: repeat(5, 1fr);
}


```

すると .list に指定した columns x rows の数だけ次のような css を出力します。

#### css

```css

.list > *:nth-child(1) {
  -ms-grid-row: 1;
  -ms-grid-column: 1;
}


```

アイテム数が多い場合はここが大量のポリフィルコードになってしまうので、注意しておくポイントかもしれません。

## Autoprefixer の優秀さ

もとい Autoprefixer はベンダープリフィクスを付与するためのツールでした。それが grid の機能を IE のために擬似的に出力してくれるわけなので、その恩恵に預からないわけにはいかないなあとおもいます。

ただ、それでも実現できない機能もあるので、プログレッシブエンハンスメント的な対応だったり flex に寄せるなど、柔軟に解決していきたいとおもいます。悲しいことに IE のない世界はまだ遠い環境の方もおおいと聞きますが、積極的な grid の採用を Autoprefixer に甘えてよい DX で導入していきたいです。

おわります。
