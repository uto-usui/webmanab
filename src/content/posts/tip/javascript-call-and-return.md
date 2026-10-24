---
id: 1203
type: tip
slug: "javascript-call-and-return"
title: "関数呼び出しと戻り値 -『JavaScript』"
date: 2017-03-08T09:59:45+09:00
modified: 2019-02-18T10:52:05+09:00
excerpt: "関数を呼び出すためのいろいろな方法と、戻り値についてです。 複数の戻り値を個別の変数に代入 《ES2015》 関数から複数の値を返したいとき、returnでは複数の値を返すことはできません。この場合は配列かオブジェクトに"
primaryTag: "javascript"
terms:
  - { id: 29, name: "javascript", slug: "javascript" }
legacy:
  prev: javascript-augument-2015
  next: javascript-scope
---

関数を呼び出すためのいろいろな方法と、戻り値についてです。

## 複数の戻り値を個別の変数に代入 《ES2015》

関数から複数の値を返したいとき、`return`では複数の値を返すことはできません。この場合は配列かオブジェクトに１つに格納して`return`する必要があります。しかし、**ES2015の分割代入を利用することで、複数の値を個別の変数に代入する**ことができ、アクセスしやすくなります。

```

let maxMin = function(...nums) {
  return [Math.max(...nums), Math.min(...nums)];
}

let [max, min] = maxMin(1,100,-10,150);
console.log(max);
console.log(min);


```

## 関数自身を再帰的に呼び出す「再帰関数」

*再帰関数(recursive function)は、ある関数が自分自身を呼び出すことや、その関数のこと*を指します。再帰関数を利用すると、同じ計算を何度も繰り返すような処理を簡潔に記述することができます。

```

var factorial = function (n) {
  if(n != 0) {
    return n * factorial(n - 1);
  } else {
    return 1; // 再帰を終了するための値をセット
  }
};
console.log(factorial(4));


```

再帰関数では、再帰を終了するための戻り値をセットします。上記の関数ではnが0になるときの戻り値を1としています。これがないとさいきが終了しないので無限ループしてしまします。

## 関数の引数に関数 「高階関数」

*引数や戻り値として扱われる関数を高階関数*と呼びます。

```

let getArray = function (data, func) {
  for (var key in data) {
    func(data[key], key);
  }
}

let showArray = function (value, key) {
  console.log(`${key} ... ${value}`);
}

let myArray = [1,100,-50,10];
getArray(myArray, showArray);


```

<em>呼び出し先の関数の中で呼び出される関数を「コールバック関数」</em>と呼びます。上記コードでは`showArray`関数やのことで、後で呼び出されている処理ということがわかります。

高階関数を利用することで、大枠の機能と差し替えたい機能を簡単に分離させることが高階関数の特徴です。`showArray`関数を`sumArray`に置き換えました。

```

let getArray = function (data, func) {
  for (var key in data) {
    func(data[key], key);
  }
}

let result = 0;
let sumArray = function (value, key) {
  result += value;
}

let myArray = [1,100,-50,10];
getArray(myArray, sumArray);
console.log(result);


```

上記のコードでは高階関数を差し替え、大枠の関数をそのまま残した状態で別の機能の関数として実行しています。

## その場限りの機能 「匿名関数」

高階関数として機能させたい関数に関しては、その場限りであったりして再利用されないものが多いです。このような使い捨て関数に関しては名前をつけて管理するのではなく匿名関数(関数リテラル)として記述するとコードを簡潔にまとめることができます。

```

let getArray = function (data, func) {
  for (var key in data) {
    func(data[key], key);
  }
}

let myArray = [1,100,-50,10];
getArray(
  myArray,
  function (value, key) {
    console.log(`${key} ... ${value}`);
  }
);


```

呼び出し元のコードと関数の関係が分かりやすくなり、関数の名前を省略したので名前空間を圧迫しないコードになりました。

おわります。
