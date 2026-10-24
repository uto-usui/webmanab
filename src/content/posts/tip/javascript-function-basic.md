---
id: 1561
type: tip
slug: "javascript-function-basic"
title: "関数の基礎 -『JavaScript』"
date: 2017-09-28T14:36:37+09:00
modified: 2019-02-18T10:49:21+09:00
excerpt: "与えられたパラメータに基づいて処理を行い、その結果を返す仕組みが関数です。JavaScriptがデフォルトで用意している関数があり、ユーザーが関数を定義することもできます。関数の定義には４つの方法があります。 funct"
primaryTag: "javascript"
terms:
  - { id: 29, name: "javascript", slug: "javascript" }
legacy:
  prev: easy-instagram-feed
  next: javascript-es2015-object-assign
---

与えられたパラメータに基づいて処理を行い、その結果を返す仕組みが関数です。JavaScriptがデフォルトで用意している関数があり、ユーザーが関数を定義することもできます。関数の定義には４つの方法があります。

- function命令
- Functionコンストラクタ経由
- 関数リテラル
- アロー関数　《ES2015》

## function命令で定義する

関数を定義する場合の基本の方法です。関数の名前には識別子の条件を満たしつつ、**その関数がどんな処理を行っているのかすぐにわかるように、「動詞+名詞」の形式で命名**します。関数名はcamelCas記法で表すのが一般的です。

```

function funcName (argument1, argument2, ...) {

  ... something precess ...

  return myValue;
}

function 関数名 (引数, ...) {

  ... 処理 ...

  return 戻り値;
}

function calcQuad (x,y,u) {
  return x * y + u;
}
console.log(calcQuad(10, 10, 'cm'));


```

**引数は関数の挙動をにオプションを渡すためのパラメータ**です。呼び出し先から指定された値を受け取るための変数を、カンマで区切って記述します。これは仮引数と呼ばれ、関数内部だけで参照できます。

**戻り値は、関数の処理の結果最終的に呼び出し先に返す値**のことです。通常は関数の末尾に`return`命令を記述して指定します。`return`以降の処理は実行されず、そこで関数の処理は終了します。戻り値が必要ない場合は、`return`を省略でき、その場合関数は、`undefined`を返します。

## Functionコンストラクタ経由

JavaScriptには組み込みオブジェクトとして`Function`オブジェクトを持っていて、このコンストラクタを利用して関数を定義します。

```

var variable = new Function(argument);

var 変数名 = new Function(引数);

var calcQuad = Function('x','y','u','return x * y + u';);
console.log(calcQuad(10, 10, 'cm'));


```

`Function`コンストラクタには、関数が受け取る仮引数を順に並べて、最後に関数の本体を指定するのが基本形ですが、`new`演算子を省略して、グローバル関数のように記述でき、また、仮引数を１つの引数として記述することができます。文はセミコロンで区切って記述します。

```

var calcQuad = Function('x,y,u','return x * y + u;');
console.log(calcQuad(10, 10, 'cm'));


```

`Function`コンストラクタを利用する特徴としては、**引数や関数本体を文字列として定義できる**ということです。別の処理で生成した文字列を利用して、関数を動的に生成することができます。

この`Function`コンストラクタを経由した方法では、可読性があまり良くないのと、外部からコードを実行してしまう要因にもなるので原則は利用しません。ッキホンはfunction命令、関数リテラル、アロー関数で定義します。

## 関数リテラルで定義する

関数リテラルは変数に無名関数を格納します。

```

var calcQuad = function (x,y,u) {
  return x * y + u;
}
console.log(calcQuad(10, 10, 'cm'));


```

関数リテラルとfunctonm命令との違いは、

<dl><dt>function命令</dt><dd>関数を直接定義している</dd><dt>関数リテラル</dt><dd>名前のない関数を定義して、変数に格納する</dd></dl>

関数リテラルを宣言した段階では、名前を持っていないことから、**無名(匿名)関数**と呼ばれます。

## アロー関数での定義 《ES2015》

アロー関数を利用すると関数リテラルをシンプルに記述することができます。

```

(引数) => {
  ...処理...
}

let calcQuad = (x, y, u) => {
  return x * y + u;
}
console.log(calcQuad(30, 20, 'cm'));


```

処理が一文の場合は、`{}`を省略でき、文の戻り値がそのまま返るので、`return`を省略しても戻り値が渡されます。

```

let calcQuad = (x, y, u) => x * y + u;


```
