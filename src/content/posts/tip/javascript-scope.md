---
id: 1204
type: tip
slug: "javascript-scope"
title: "関数がつくるスコープ -『JavaScript』"
date: 2017-03-08T10:01:33+09:00
modified: 2019-02-18T10:51:41+09:00
excerpt: "スコープは変数がスクリプトの中のどの場所から参照できるかを決める概念です。JavaScriptのスコープは大きく分けると、 どこからでも参照できるグローバルスコープ 定義された関数内でのみ参照できるローカルスコープ ブロ"
primaryTag: "javascript"
terms: []
legacy:
  prev: javascript-call-and-return
  next: ajax-function-php
---

**スコープは変数がスクリプトの中のどの場所から参照できるか**を決める概念です。JavaScriptのスコープは大きく分けると、

- どこからでも参照できる**グローバルスコープ**
- 定義された関数内でのみ参照できる**ローカルスコープ**
- ブロックスコープ《ES2015》

この３つに分類されます。

## グローバル変数とローカル変数

**`var`命令なし、またはトップレベルで宣言された変数はグローバル変数**とみなされグローバルスコープをもち、**var命令で定義された変数はローカル変数になり、宣言された場所によって変数のスコープが決まる**ローカルスコープになります。

```

var memberA = 'zoro'; // local

function memberFunc () {
  var memberB = 'nami'; // local
  memberC = 'sanzi'; // global
}


```

ローカル変数を定義するには必ず`var`命令を使用する必要があるので、関数内でグローバル変数を書き換える必要がある場合を除いては、**変数はvar命令で宣言する**ということで考えます。

## ローカル変数の有効範囲

ローカル変数とは宣言された関数全体で有効な変数のことです。しかし、関数内でも宣言前にその変数を参照してしまうと、`undefined`未定義になってしまいます。

```

function memberFunc () {
  console.log('member'); // undefined
  var member = 'Zoro'
}


```

## 基本型と参照型の仮引数のスコープの違い

仮引数は呼び出し先から関数に渡された値を受け取るための変数です。仮引数は基本形だとローカル変数として処理され、グローバルとは別物に扱われますが、参照型だと同じ位置を参照することになるため、グローバルとローカル変数が等しくなります。

### 基本形型の仮引数

基本型のローカル変数がグローバル変数に影響を与えることはありません。

```

var n = 100; // 1

function calcTwice(n) { // 2
  n * 2;
  return　n;
}
console.log(calcTwice(200)); // 400
console.log(n); // 200

// 1と2の「n」は別物で値が違う


```

### 参照型の仮引数

参照型は値そのものでなく値を格納したメモリ上の位置を格納しているだけです。参照型の値を受け渡しすることを参照渡しといい、渡される値は位置の情報のみです。参照型のローカル変数を操作すると、グローバル変数は操作された状態と等しくなります。

```
var members = ['zoro','sanzi','nami']; // 1
function addMenber (members) { // 2
  members.push('momo');
  return members;
}
console.log(addMember(member)); // ['zoro','sanzi','nami','momo']
console.log(member); // ['zoro','sanzi','nami','momo']

// 1と2は別物だが、同じところを見ている


```

## ブロックレベルのスコープの代わりに即時関数

変数の競合を防ぐためのシステムとして、JavaScriptは関数内にしかスコープは存在しないので、他のプログラミング言語にあるようなブロックスコープはありません。ここでのテクニックとしては**即時関数**を使うことで、擬似的にブロックスコープを表現します。

```

(function(n) {
  var i = n;
  console.log('i:' + i); // i: 100
})(100);

console.log('i:' + i); // error


```

スクリプトを作成する際は、コードの一番外側を即時関数で囲っておくと他ライブラリなどから競合を防ぐことができます。

## ブロックスコープはlet命令で　《ES2015》

`let`命令で変数を宣言すると、`({ })`のブロックスコープの範囲でのみ変数が有効になります。これでブロックスコープに対応した変数を宣言できます。

```
if(true) {
  let n = 10;
}
console.log(n); // error

```

`let`を利用するとブロックスコープになるので、前項で解説した即時関数は使わずにコードを簡潔に済ませる方がオススメです。

## 関数リテラルとFunctionコンストラクタのスコープの違い

関数リテラルとFunctionコンストラクタはスコープの解釈が異なります。Functionコンストラクタ配下にある変数は常にグローバルスコープとみなされます。

```
var scope = 'global';

function yourScope() {
  var scope  = 'local';

  var nami = function() {
    return scope;
  }
  console.log(nami()); // local

  var zoro = new Function('return scope;');
  console.log(zoro()); // global
}
yourScope();

```

おわります。
