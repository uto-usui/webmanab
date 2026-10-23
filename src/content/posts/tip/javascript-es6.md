---
id: 2290
type: tip
slug: "javascript-es6"
title: "ES6以降のJavaScriptの書き方をアップデートする -『JavaScript』"
date: 2018-02-23T01:16:49+09:00
modified: 2018-09-06T15:56:31+09:00
excerpt: "近年、ECMAScript 2015がリリースされてから、ES2016、ES2017、ES2018、というように日進月歩な JavaScript (ES6)になり、日 々記法やメソッドをアップデートさせていく必要が出てき"
primaryTag: "javascript"
terms:
  - { id: 238, name: "frontend", slug: "frontend" }
  - { id: 29, name: "javascript", slug: "javascript" }
legacy:
  prev: javascript-lerp-normarise
  next: el-capitan-to-high-sierra
---

近年、ECMAScript 2015がリリースされてから、ES2016、ES2017、ES2018、というように日進月歩な JavaScript (ES6)になり、日 々記法やメソッドをアップデートさせていく必要が出てきました。いつまでも旧時代なコードはちょっとおしゃれじゃないので、より効率的なコーディングを心がけつつ、新しいよく使いたい仕様のまとめです。

## 変数 let 定数 const

もう `var` は使いません。 変数`let` か、再代入しない値は定数 `const` として定義します。定数は変更は可能なので、オブジェクトの中身を更新したりすることはできます。

## アロー関数

`function` キーワードを使って、関数を宣言していましたが、アロー関数で簡潔に書くようになりました。

```js

const func = x => '201' + x


```

色々なパターンや諸略記法があり、アロー関数と`function`構文は厳密に等しくないので、詳しい記事は次を参照します。

- [ES2015(ES6)新構文：アロー関数(Arrow function)｜もっこりJavaScript｜ANALOGIC（アナロジック）](http://analogic.jp/arrow-function/)

## 文字列の取り扱い

文字列テンプレートリテラルを利用することで、改行や変数の埋め込みが可能になりました。

```js

const name = 'uto';
console.log(`Hi!
I am ${name}.`);


```

## オブジェクトをコピー assign()

オブジェクトをコピーやマージには、`assign()` を利用します。

```js

const NewSettings = Object.assign({}, option);


```

さらに ES2018 では、

```js

const NewSettings = {...option};


```

というように、スプレッド演算子でオブジェクトが展開できるようになったので、簡潔に記述することができます。

## 配列要素の存在チェック includes()

配列内に特定の要素があるかどうかを調べる場合、従来は次のようにindexOf()メソッドを使っていました。

targetArray.indexOf(“田中”) >= 0

`includes()` メソッドは配列内の要素もしくは文字列の存在チェックをして真偽値を返します。

```js

const array = [100, 200, 300];
array.includes(200) && console.log('✨ yes ✨')

const ua = navigator.userAgent;
ua.includes('iOS') && console.log('📱iOS');


```

## 数字の頭の0を追加する padStart()

1桁の数字の頭に0をつけた文字列にしたいとき、文字詰めのための`padStart()`メソッドを利用します。

```js

const sec = new Date().getSeconds();

// 文字列.padStart(長さ, 詰める文字)
const paddedSecond = String(sec).padStart(2, "0");
console.log(paddedSecond);


```

## Promise と async/await で非同期処理

Promise と async/await で処理を連結したり引数を渡して非同期処理をシンプルに記述できます。

`async` は関数内で `await` を有効化します。 `await` は Promise の結果を待ち、返り値を受け取ります。

```js

const timer = (delay) => {

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(delay)
    }, delay)
  })

};

(async() => {

  let delay = await timer(1000)
  console.log(delay)

  delay = await timer(2000)
  console.log(delay)

  delay = await timer(1000)
  console.log(delay)
  console.log('ok')

})()


```

## 値を取り出すループ for of

ループを回して、要素をひとつずつ取り出す時は `for ... of` を使います.

```js

const array = [10, 20, 30];

for (const value of array) {
  console.log(value);
}


```

## 整数の取得 Math.trunc()

小数を整数に丸める場合、`Math.floor()`を使っていましたが負の数の挙動が丸まりかたが微妙でした。これからは 数値の整数部分だけを取得する `Math.trunc()` を使います。

```js

Math.trunc(10.5);
Math.trunc(-100.5);


```

## べき乗演算子 \*\*

べき乗の計算には、`**` べき乗演算子(Exponentiation Operator) を使います。

```js

console.log(2 ** 4) // 16


```

## 文字数をカウントするときのスプレッド演算子 …

文字数をカウントするとき、`length` プロパティを使いますが、サロゲートペア文字列の問題がありました。スプレッド演算子 `...` を利用すると解決します。

```js

[...`🍣🍣🍣`].length; // 3


```

## クラスを宣言する class

`function` と`prototype` で作っていたクラスは `class` で宣言するようにします。

```js

class Ex {

  constructor(value) {
    this.value = value;
  }

  get target() {
    return this._target;
  }

  set target(value) {
    this._target = value;
  }

}

class subEx extends Ex {

  constructor() {
    super();  // 継承する
  }

}


```

おわります。
