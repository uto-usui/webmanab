---
id: 1562
type: tip
slug: "javascript-es2015-object-assign"
title: "オブジェクトのマージ Object.assign() 《ES2015》-『JavaScript』"
date: 2017-09-28T15:30:38+09:00
modified: 2019-02-18T10:49:11+09:00
excerpt: "assignメソッドを使ってオブジェクトをマージします。 Object.assign(target, sources, …) sources で指定したオブジェクトのメンバを、targetにコピーします。 同名のプロ"
primaryTag: "javascript"
terms:
  - { id: 29, name: "javascript", slug: "javascript" }
legacy:
  prev: javascript-function-basic
  next: javascript-object-about
---

assignメソッドを使ってオブジェクトをマージします。

```

Object.assign(target, sources, ...)


```

`sources` で指定したオブジェクトのメンバを、`target`にコピーします。

## 同名のプロパティは後続するものに上書きされる

同名のプロパティが存在した場合は、後に続いているものが上書きされます。

```

let nami18 = {
favorite: 'orange',
bounty: 1600,
bloodType: 'x'
};

let nami20 = {
  favorite: 'orange',
  bounty: 6600,
  height: 170
};

let nami = Object.assign({}, nami18, nami20);

console.log(nami);

/*
let nami20 = {
  favorite: 'orange',
  bloodType: 'x',
  bounty: 6600,
  height: 170,
};
*/


```

## 入れ子のオブジェクトの中身は判定されない

入れ子になっているオブジェクトの中身は判断されず、そのオブジェクトごとマージされずに後続が上書きされます。

```

let nami18 = {
  favorite: 'orange',
  style: {
    W: 57,
    H: 86
  },
};

let nami20 = {
  favorite: 'orange',
  style: {
    B: 98,
    H: 88
  }
};

let nami = Object.assign({}, nami18, nami20);

console.log(nami);

/*
{
  favorite: 'orange',
  style: {
    B: 98,
    H: 88
  }
}
*/

```

おわります。
