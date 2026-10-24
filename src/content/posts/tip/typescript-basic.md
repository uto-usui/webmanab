---
id: 2828
type: tip
slug: "typescript-basic"
title: "TypeScript の基本文法 -『TypeScript』"
date: 2020-02-21T01:25:05+09:00
modified: 2020-03-22T22:14:46+09:00
excerpt: "TypeScript 初学者向けの文法などについてまとめます。TypeScript は型付けできる JavaScript です。型システムはプログラミングにおいてはとても重要で、またJavaScript の新しい策定中の"
primaryTag: "typescript"
terms:
  - { id: 29, name: "javascript", slug: "javascript" }
  - { id: 365, name: "typescript", slug: "typescript" }
legacy:
  prev: javascript-graphic-math
  next: typescript-type-safe
---

TypeScript 初学者向けの文法などについてまとめます。TypeScript は型付けできる JavaScript です。型システムはプログラミングにおいてはとても重要で、またJavaScript の新しい策定中の機能も取り込んでくれているので、 AltJs として1番人気があり、ぼくはすべてのプロジェクトで導入しています。

## basic types

単純なデータを処理するための基本の型です。

### Boolean

Boolean 型は `true` または `false` の値をとります。

```ts

const ruffy: boolean = true


```

### Number

Number 型は JavaScript と同じように不動小数点値で、 16 / 10 / 2 / 8 進数をサポートします。

```ts

const ruffy: number = 19


```

### String

String 型は `””` `''` ` `` ` で囲います。

```ts

const ruffy: string = 'monkey'


```

### Array

Array 型は2つ記述する方法があります。

```ts

const ruffy: string[] = ['monkey', 'gomugomu']
const ruffy: Array<string> = ['monkey', 'gomugomu']


```

### Tuple

tuple 型を使うと、固定数の要素の型がわかっている配列の複数の型を表現できます。

```ts

const ruffy: [string, number] = ['monkey', 19] // ok
const ruffy: [string, number] = [19, 'monkey'] // error


```

### Any

any 型は型が不明な変数の型チェックを無効にし、コンパイルさせるために利用できます。any を許容すると TypeScript の恩恵を受けることができなくなりバグの温床になることが多いので、できるだけ any 型を使わないようにします。既存プロジェクトの TypeScript 移行など、リファクタリングを前提としている場合に利用するといいです。

```ts

let ruffy: any = 'monkey'
ruffy = 0
ruffy = null


```

### Unknown

unknown 型は型安全な any として利用します。値の代入は自由にできますが、一度代入した値を利用するときに型チェックして、間違ったメソッドが実行されていないかなどを調べることができます。

```ts

const ruffy: any = 'monkey'
ruffy.push('D') // ok

const ruffy: unknown = 'monkey'
ruffy.push('D') // error


```

### Void

void 型は any 型の反対の概念で、型がないことを表現します。値を返さない関数の戻り値として利用します。ちなみに void 型の変数には `null` か `undefined` しか代入できません。

```ts

const ruffyAttack = (name: string): void => {
  console.log(`gomugomu no ${name}`)
}


```

### Never

never 型は発生し得ない値を表現できます。関数内部で例外を投げるときや、無限ループをする場合など、戻り値が得られないときに使います。void 型と違いundefinedも受け付けません。

```ts

const day2 = (log: string): never => {
  throw new Error(log)
}

// error
const ruffyAttack = (name: string): never => {
  console.log(`gomugomu no ${name}`)
}


```

### Null / Undefined

null 型と undefined 型はすべての型のサブタイプになっていて、どこにでも代入できます。ただ、 `—strickNullChecks` のオプションが `true` になっていると、`void` 型もしくはそれぞれ自身にしか代入することができなくなるので、より厳格になり、エラーチェックに有用です。

```ts

let ruffy: undefined = undefined

let ruffy: null = null


```

### Object

object 型は、プリミティブではない値を表す型です。

```ts

let ruffy: object = {}
ruffy = 'monkey' // error


```

## type / interface

オブジェクト内の詳細を型定義するには、その変数宣言に直接インラインで記述していく方法がありますが、 `type` / `interface` を利用すると、オブジェクトのまとまりとして型を定義できます。

<dl><dt>interface</dt><dd>名前のあるオブジェクト型を定義</dd><dt>type</dt><dd>無名オブジェクトを宣言して、それに名前をつける</dd><dt>inline</dt><dd>無名オブジェクトをそのままインラインアノテーションとして利用</dd></dl>

`interface` と `type` は命名するというところが共通していて、`type` とインラインは無名オブジェクト型というところが共通しています。これを機能別にまとめます。

### interface

- クラスやオブジェクトの規格を定義する
- 継承できる
- 同名要素を宣言するとマージされる
- intersection / union / tuple として利用できない
- Mapped Types が利用できない

```ts

type Name = {
  name: string
}
type Age = {
  age: number
}

type Human = Name & Age


```

### type alias

- 型や型の組み合わせに別名を付ける
- intersection type で継承のような実装ができる
- 同名要素が宣言できない
- intersection / union / tuple として利用できる
- Mapped Types が利用できる

```ts

interface Name = {
  name: string
}

interface Human extends Name {
  age: number
}


```

#### more info

- [TypeScript使いに質問です。InterfaceとTypeの使い分けはどうしていますか？どっちか一方だけに統一していますか？また有用なリンクがありますか？ – Quora](https://jp.quora.com/TypeScript%E4%BD%BF%E3%81%84%E3%81%AB%E8%B3%AA%E5%95%8F%E3%81%A7%E3%81%99-Interface%E3%81%A8Type%E3%81%AE%E4%BD%BF%E3%81%84%E5%88%86%E3%81%91%E3%81%AF%E3%81%A9%E3%81%86%E3%81%97%E3%81%A6%E3%81%84%E3%81%BE%E3%81%99#ocfzR)
- [TypeScriptのInterfaceとTypeの比較 – Qiita](https://qiita.com/tkrkt/items/d01b96363e58a7df830e)

### readonly

`readonly` 修飾子を利用すると、`const` のように振る舞う再代入できないプロパティを定義できます。

```ts

interface Sex {
  readonly sex: string
}

const ruffy: Sex = {
  sex: 'male',
}

ruffy.sex = '' // error


```

### ? 省略可能のプロパティ

`?` は省略可能のプロパティを表現します。

```ts

interface Human {
  age: number
  sex?: string
}

const ruffy: Human = {
  age: 19,
}


```

## next step types

TypeScript のもう一歩踏み込んだ機能についてまとめます。

### Intersection types

intersection types を使うと、複数の型を `&` でマージできます。

```ts

type A = {
  name: string
}
type B = {
  age: number
}

type AB = A & B


```

### Union types

union types は、複数の型のうち `|` で区切ったいずれかの型が、当てはまることを表現します。

```ts

const ruffy: (string | number)[] = ['monkey', 19]


```

これを利用すると初期化時に `null` を許容するようなコード（nullable 型）を書けます。

```ts

let ruffy: string | null = null
ruffy = 'monkey'


```

### Literal types

literal types は文字列と数値に利用できます。

String literal types を利用すると決められた文字列しか許容しない変数を宣言できます。

```ts

let name: 'ruffy' | 'nami'
name = 'ruffy'
Name = 'nami'

name = 'sanji' // error


```

numelic literal types を利用すると決められた数値しか許容しない変数を宣言できます。

```ts

let year = 1989 | 1
year = 1
year = 1989

year = 2 // error


```

## typeof / keyof keywords

### typeof

`typeof` キーワードを使うと、宣言済みの変数の型を取得して、違う変数に適用できます。明示的に型を指定していない場合も、型推論から抽出して、別の変数に与えることができます。

```ts

const ruffy = 17
let nami: typeof ruffy

nami = '17'


```

### keyof

`keyof` キーワードを使うと、オブジェクト key を String literal union types として取得できます。`typeof` と組み合わせて使うと便利です。

```ts

const ruffy = {
  name: 'monkey',
  age: 19,
}

let type: keyof typeof ruffy
for (type in ruffy) {
  console.log(type)
}


```

## Assertion

TypeScript の強力な型推論ではなく、実装者が型の詳細を指定したい場合、アサーションを使います。ダウンキャストができる場合に明示的に型を宣言することができ、TypeScript に型チェックを行ったことを伝えます。記法は2つあります。

```ts

const el = document.querySelector<HTMLDivElement>('#el')
const canvas = document.querySelector('#canvas') as HTMLCanvasElement


```

## Class

ES2015 以降の JavaScript では Class を利用できますが、TypeScript ではさらに強力な Class 構文を扱うことができます。クラスメンバーに修飾子を与えることができ、参照・実行の公開範囲を指定できます。

<dl><dt>public</dt><dd>どのコンテキストでも ok</dd><dt>protected</dt><dd>継承したサブクラスまで ok</dd><dt>private</dt><dd>宣言したクラス内のみ ok</dd></dl>

```ts

class Ruffy {
  protected first: string
  private d: string
  public last: string
  public readonly sex: string

  constructor(first: string, d: string, last: string) {
    this.first = first
    this.d = d
    this.last = last
    this.sex: 'male'
  }
}

const ruffy = new Ruffy('Monkey', 'D.', 'Ruffy')


```

おわります。
