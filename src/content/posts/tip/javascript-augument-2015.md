---
id: 1202
type: tip
slug: "javascript-augument-2015"
title: "引数 《ES2015》 -『JavaScript』"
date: 2017-03-08T09:54:29+09:00
modified: 2019-02-18T10:52:21+09:00
excerpt: "引数の記法はES2015で大きく変更されました。以下はES2015以降の引数の仕様や記法についてです。新しい構文により、argumentsオブジェクトが不要になり、より簡潔に記述できるような印象で 引数のデフォルト値 《"
primaryTag: "javascript"
terms:
  - { id: 29, name: "javascript", slug: "javascript" }
legacy:
  prev: javascript-augument
  next: javascript-call-and-return
---

引数の記法はES2015で大きく変更されました。以下はES2015以降の引数の仕様や記法についてです。新しい構文により、`arguments`オブジェクトが不要になり、より簡潔に記述できるような印象で

## 引数のデフォルト値 《ES2015》

ES2015で引数のデフォルト値を与えるには、仮引数 = デフォルト値の形式で仮引数を宣言します。

#### ES2015

```

var square = function(x = 100, y = 100) {
  return x * y;
}
console.log(square());


```

#### ES5

```

var square = function(x,y) {
  if(x === undefined) {
    x = 100;
  }
  if(y === undefined) {
    y = 100;
  }
  return x * y;
}
console.log(square());


```

`if`の記述がなくなり、関数の宣言部分にデフォルト値をまとめることで記述が簡潔になりました。デフォルト値の右辺には自身より前に定義された引数や関数を指定することもできます。

```

var square = function(x = 100, y = x) {
  return x * y;
}
console.log(square());


```

デフォルト値には自身より後に定義された引数を指定できないので、以下のコードは思った結果を得られません。

```

var square = function(x = y, y = 100) {
  return x * y;
}
console.log(square()); // NaN


```

### 引数にデフォルト値を与える際の注意点

新しい引数の記法についてのを幾つかの注意点です。

#### デフォルト値の適用の判定

デフォルト値が適用されるのは、明示的に値が渡されなかったときです。`null`/`false`/`0`などの殻を表すような値でも、明示的に渡されている場合は、デフォルト値は適用されません。

ただし、*`undefined`を引数に渡した場合は、引数は渡されなかったとみなされ*、デフォルト値が適用されます。

#### デフォルト値を持つ引数は、引数リストの末尾に記述

デフォルト値をもたせた引数は、デフォルト値をもたない引数より後方に記述します。これは構文規則ではないですが、バグを回避するのに一般的な考え方です。理由としては、後方の引数だけに明示的に引数を与え、前方を省略するような指定はできないからです。デフォルト値に関しても、この仕様を踏まえた考え方で書くことでコードの意図が分かりやすくなります。

```

var square = function(x = 10, y) {
  return x * y;
}
console.log(square(5)); // NaN


```

### 必須の引数を宣言したいとき

デフォルトの引数が与えられているからと言って、それが必須を表しているわけではありません。必須を表現したい場合は例外を\
スローする処理を記述して、デフォルト値として記述します。

```

function requiredAug {
  throw new Error('augument not found');
}

var square = function(x = 100, y = requiredAug() ) {
  return x * y;
}
console.log(square());


```

## 可変長引数の関数の定義 《ES2015》

ES2015では、仮引数の前に`...`(rest paremeter)を付与すると、可変長引数とみなされます。渡された任意の個数の引数を配列としてまとめて受け取ります。

```

let sum = function (...nums) {
  let result = 0;

  for(let num of nums) {
    if (typeof !== 'number) {
      throw new Error('this is not number:' + num);
    }
    result += num;
  }
  return result;
}

try {
  console.log(sum(1,2,3,4,5,6,7,8,9,10));
} catch(e) {
  window.alert(e.message);
}


```

## …演算子による引数の展開

`...`演算子は実引数で利用すると、配列を個々の値に展開できます。可変長引数を受け取るメソッドを例とします。

```
console.log(Math.max(11,10,-5,100)); // 100
console.log(Math.max([11,10,-5,100])); // NaN

console.log(Math.max(...[11,10,-5,100])); // 100


```

`Math.max` メソッドは可変長引数を受け取って最大値を返します。配列を渡した場合は認識することができませんが、`...`演算子を利用することで、配列を簡単に展開してスマートに記述することができます。

## オブジェクトで引数を渡して引数に名前を明示する 《ES2015》

ES2015では分割代入を利用して名前付き引数を簡潔に記述します。仮引数の宣言を`{}`で囲って宣言することで、オブジェクトで渡された引数を分解して、関数の配下では個別の引数としてアクセスできます。

#### ES2015

```

var square = function({x = 100, y = 100}) {
  return x * y;
}
console.log(square({x:300, y:200}));


```

#### ES5

```

var square = function(l) {
  if(l.x === undefined) {
    l.x = 100;
  }
  if(l.y === undefined) {
    l.y = 100;
  }
  return l.x * l.y;
}
console.log(square({x:300, y:200}));


```

### オブジェクトから特定のプロパティだけを取り出す

分割代入を利用すると、特定のプロパティだけを取り出すことができます。これを利用すると、関数の呼び出し側で個々のプロパティを考えないでオブジェクトをまるっと渡すことができ、必要なプロパティが変更されても呼び出し側に影響が出ません。

```

let yourName = function ({name}) {
  console.log(name);
}

let Nami = {
  age: 19,
  name: Nami,
  weapon: tact
}

yourName(Nami);


```

おわります。
