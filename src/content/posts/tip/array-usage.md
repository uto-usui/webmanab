---
id: 2722
type: tip
slug: "array-usage"
title: "さまざまな配列の処理をまとめる -『JavaScript』"
date: 2019-11-14T13:21:07+09:00
modified: 2020-02-09T18:35:58+09:00
excerpt: "JavaScript で、普段使いするさまざまな配列のメソッドをどんな用途で利用するのかざっくりとまとめます。 forEach forEach() は、配列の各要素に同じ処理を繰り返すときに使います。 mugiwara…more"
primaryTag: "javascript"
terms:
  - { id: 356, name: "array", slug: "array" }
  - { id: 238, name: "frontend", slug: "frontend" }
  - { id: 29, name: "javascript", slug: "javascript" }
legacy:
  prev: css-grid-minmax
  next: git-sketch-plugin
---

JavaScript で、普段使いするさまざまな配列のメソッドをどんな用途で利用するのかざっくりとまとめます。

## forEach

`forEach()` は、配列の各要素に同じ処理を繰り返すときに使います。

```js

mugiwara.forEach((member, index, mugiwara) => {
  console.log('shinsekai', member.age + 2)
});


```

## map

`map()` は、配列の要素を参照して新しい配列をつくるときに使います。

```js

const names = mugiwara.map((member) => member.name);


```

## filter

`filter()` は、配列からある条件の要素をフィルタリングするとき使います。返り値が `true` な要素だけでできた新しい配列を作ります。

```js

const teen = mugiwara.filter(member => member.age === '19');


```

## find

`find()` は、配列から特定の要素ひとつを抜き出すとき使います。`filter()` の 1つだけバージョン、というようなニュアンスです。

```js

const name = mugiwara.find(member => member.name === 'Nami');


```

## reduce

`reduce()` は、配列から各要素を参照しつつひとつの値を求めるとき使います。

```js

// thousand325 + 29 = 325??
const thousand325  = mugiwara.reduce((prev, current) => {
  return prev.devilFruitNumber + current.devilFruitNumber
}, 0 /* init value */);


```

処理が繰り返されるたび、ひとつ前に `return` された値が `prev` に入ってきます。

```js

const everyoneAge  = mugiwara.reduce((prev, current) => {
  return prev[age] + current.age
}, {});


```

このように初期値に `{}` を渡して、配列から新しい配列を作るのに利用したりすることもできます。`reduce()` に渡す関数によっていろいろな利用価値があり、煩雑になる記述を見やすくしたいときに利用するといいと思います。そのぶんやっている処理もパターン化できないので、コメントを書き込んであげると理解を促せていいとおもいます。

## some

`some()` は、配列の要素のなかで条件に一致する要素がひとつでもあるかどうかを調べるときに使います。

```js

const result = mugiwara.some(member => member.age === '19');


```

ひとつでもあれば `true` を返して、そこでループが停止するので、`true` になるまで何かの処理を繰り返し実行する、というような処理を書くこともできます。ただ、この場合は `some()` の文脈からずれてしまうので、レギュレーションやスタイルガイドで縛ってしまってもいいかもしれません。

## every

`every()` は、配列のすべての要素が条件に一致しているかどうかを調べるときに使います。some と対になる関係ですね。逆にひとつでも `false` を検出すると、そこでループが停止します。

```js

const result = mugiwara.every(member => member.age === '21');


```

## indexOf

`indexOf()` は、配列の各要素のなかである値と一致する要素があるとき、最初に一致した要素のインデックスを返します。

```js

const index = mugiwara.indexOf('Nami');


```

## NodeList for IE

番外として、`querySelectorAll()` で取ってきた NodeList はモダンブラウザでは問題ないのですが、IEでは配列のメソッドを持っていません。

なので配列に展開してやることで、IE に対応します。

```js

[...document.querySelectorAll('.el')].forEach(el => {
    console.log(el)
});


```

また、TypeScript では同じような手法で、型安全な DOM 取得と配列メソッドのチェーンを可能にします。

```ts

[...document.querySelectorAll<HTMLElement>(".el")].forEach(el => {
    console.log(el)
});


```

おわります。
