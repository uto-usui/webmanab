---
id: 2881
type: tip
slug: "dart-sass-with-nuxt"
title: "Dart Sass を Nuxt に導入する -『Sass』"
date: 2020-03-21T15:46:46+09:00
modified: 2020-03-21T19:03:00+09:00
excerpt: "Dart Sass がとても便利なのを知り、最近導入しました。Ruby Sass / Node Sass と使ってきましたが、Ruby Sass は開発環境に Ruby ないとだめだし、Node Sass はローカルの"
primaryTag: "Sass"
terms:
  - { id: 3, name: "css", slug: "css" }
  - { id: 366, name: "nuxt", slug: "nuxt" }
  - { id: 6, name: "sass", slug: "sass" }
  - { id: 294, name: "Vue.js", slug: "vue-js" }
legacy:
  prev: typescript-type-safe
  next: nuxt-static-site-tips
---

Dart Sass がとても便利なのを知り、最近導入しました。Ruby Sass / Node Sass と使ってきましたが、Ruby Sass は開発環境に Ruby ないとだめだし、Node Sass はローカルの Node のバージョンに依存するからキャッシュクリアしないといけなかったりが面倒だったので、その辺りも解消できてる Dart Sass がいいかんじです。

リリースされたのは随分前ですが。ちょっと機会がなかったので。

- [Sass: Dart Sass 1.0.0 is Released](https://sass-lang.com/blog/dart-sass-100-is-released)

Nuxt での導入方法です。

## インストール

nuxt-create-app とかで作ったものなど、既存の Nuxt プロジェクトに sass をインストールします。fibers というパッケージも合わせてインストールします。

```bath

yarn add --dev sass fibers


```

fibers はコンパイルの高速化のために必要らしいです。

> To avoid this performance hit, render() can use the fibers package to call asynchronous importers from the synchronous code path.

- [Sass: Dart Sass](https://sass-lang.com/dart-sass)

## Nuxt.config.js への設定

Nuxt.config.js へ webpack の loader 設定を記述します。

```js

import Fiber from ‘fibers’
import Sass from ‘sass’

const sass = {
  implementation: Sass,
  sassOptions: {
    fiber: Fiber,
  },
}

module.exports = {
  build: {
    loaders: {
      scss,
    },
  }
}


```

Nuxt では以上の設定だけで Dart Sass を利用できます。記述は基本いつもどうりで大丈夫です。

```html

<style lang=“scss” scoped>
.el {
  color: $black;
}
</style>


```

### deep セレクタ対応

ただし、Vue の独自セレクタである `/deep/` と `>>>` が使えなくなりました。`v-html` ディレクティブで動的にやってきた DOM に、 scoped 配下のスタイルを与えたいときに使うセレクタですね。

これには `::v-deep` のみが利用できるので、`/deep/` か `>>>`　を使っている場合は書き換えていく必要があります。

また、`::v-deep` は stylelint を使っている場合、エラー対象になることもあるので、次のようにエスケープしてやるとよいでしょう。

```js

module.exports = {
  rules: {
    'selector-pseudo-element-no-unknown': [
      true,
      {
        ignorePseudoElements: ['v-deep']
      }
    ]
  },
}


```

おわります。
