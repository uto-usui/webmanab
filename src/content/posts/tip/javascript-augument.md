---
id: 1201
type: tip
slug: "javascript-augument"
title: "引数 -『JavaScript』"
date: 2017-03-08T09:53:24+09:00
modified: 2019-02-18T10:52:38+09:00
excerpt: "引数の記法はES2015で大きく変更されたことで扱いやすくなりました。以下はES2015以前の引数の仕様や記法についてです。 引数の数 JavaScriptでは関数を実行する際に、与える引数の数が関数側で要求しているもの"
primaryTag: "javascript"
terms:
  - { id: 29, name: "javascript", slug: "javascript" }
legacy:
  prev: control-random-values
  next: javascript-augument-2015
---

引数の記法はES2015で大きく変更されたことで扱いやすくなりました。以下はES2015以前の引数の仕様や記法についてです。

## 引数の数

JavaScriptでは関数を実行する際に、与える引数の数が関数側で要求しているものと異なっていても、**引数の差異をチェックせずに実行**します。引数が足りない場合でも、余分な場合でも関数は実行されます。

```

var member = function(a) {
  console.log(a);
}
member('nami'); // nami
member(); // undefined
member('zoro','nami'); // zoro


```

このとき、余分だった引数は破棄せずに、JavaScriptは`arguments`オブジェクトとして管理します。**`arguments`オブジェクトには、すべての引数の値が保存されていて、その関数の配下のみで扱う**ことができます。

### 引数の数のチェック

与えられた引数と要求する引数の数をチェックして例外処理を与えてみます。引数の個数以外にもデータ型や値の範囲などでの例外処理も可能です。

```

var checkArguments = function(m) {
  if(arguments.length !== 1) {
    throw new Error('引数の数が違います -- ' + arguments.length);
  }
}

try {
  checkArguments('nami', 'zoro');
} catch(e) {
  console.log(e.message);
}


```

### 引数のデフォルト値

JavaScriptは引数の数をチェックしないので全ての引数は省略可能です。引数が省略されてしまった場合にも処理を動作させるために、引数にデフォルト値を与えます。引数の前方だけにデフォルト値を与えることはできません。省略できるのは後方の引数だけです。

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
console.log(square(300));


```

## 可変長引数

JavaScriptでは引数の数が決まっていない関数を定義することができ、その引数を*可変長引数*と呼びます。これは関数の呼び出し時の都合で引数の個数が変動し、関数を宣言するときに引数の個数を確定できない関数が可変長引数の関数です。

```

var sum = function () {
  var result = 0;

  for( var i = 0, len = arguments.length; i < len; i++) {
    var n = arguments[i];
    result += n;
  }
  return result;
}
console.log(sum(1,2,3,4,5,6,7,8,9,10));


```

### 無名引数は必要なときだけ利用する

このように無名引数は`arguments`オブジェクトを利用すると配列と同じようにアクセスすることができます。しかしインデックス内部での管理は可読性を損ないますし、直感的に引数の内容を把握しにくいので必要最小限にとどめるようにします。

## オブジェクトで引数を渡して引数に名前を明示する

引数をオブジェクトで渡すことで、呼び出し時に引数に名前を与えておくことができます。引数の順番を自由に変更できるようになり、コードの意味がわかりやすくなります。

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

おわります。
