---
id: 2880
type: tip
slug: "typescript-type-safe"
title: "TypeScript を使いこなして手に入れる型安全 -『TypeScript』"
date: 2020-03-16T22:56:26+09:00
modified: 2020-03-22T22:14:16+09:00
excerpt: "TypeScriptでは型を絞り込んで行く作業が、バグを減らしていくことにつながります。typeof など、JavaScript の従来の方法を取り入れつつ TypeScript を使いこなして型安全を実現します。 アノ"
primaryTag: "typescript"
terms:
  - { id: 29, name: "javascript", slug: "javascript" }
  - { id: 365, name: "typescript", slug: "typescript" }
legacy:
  prev: typescript-basic
  next: dart-sass-with-nuxt
---

TypeScriptでは型を絞り込んで行く作業が、バグを減らしていくことにつながります。`typeof` など、JavaScript の従来の方法を取り入れつつ TypeScript を使いこなして型安全を実現します。

## アノテーションによる型安全

`undefined` や `null` な値の振る舞いや、引数の存在の有無をアノテーションの記述によって対応していく方法で型安全を実現します。

### 関数と nullable 型

関数を実行するとき、引数の有無が考えられる場合に、引数が与えられるなら任意の型を与えられないなら `null` であることを期待するように記述します。このパターンを Nullable 型と呼びます。

```ts

const apply3d2y = (name: string, age: number | null = null) => {
  if (age === null) return { name, age: 2 }
  return {
    name,
    age: age + 2,
  }
}


```

上のコードでは `null` かどうかを if state でチェックして、 age を `number` として絞り込んでから算術計算しているので、型安全が保証されています。TypeScript の記述では、このように**絞り込む**ということにフォーカスして書くと型安全なエラーのないコードを実現できます。

また `augument?: type` というように、 `?` で任意の型か `undefind` かというように引数の型を表現して、 `null` ではなく `undefined` を if state でチェックする方法もありますが、デフォルト引数で表現した方が `null`　以外への拡張も容易なのでこちらをベースでいいかなとおもいます。

### week type / excess property checks

すべてのプロパティが `?` でオプショナルなオブジェクト型を Weak Type と呼びます。Weak Type はまったく異なるプロパティのオブジェクトを代入するとエラーに、ひとつでも当てはまるとスルーという挙動をします。意図していないオブジェクトの代入をチェックする機構です。

```ts

interface Member {
  name?: string
  age?: number
}

const acceptMember = (member: Member) => {
  console.log(member)
}

const ruffy = {
  name: 'Monkey',
  age: 19,
  sex: 'male',
}

const teach = {
  _name: 'black beard',
  sex: 'male',
}

acceptMember(ruffy)
acceptMember(teach) // error

// excess prop check
acceptMember({
  name: 'Monkey',
  age: 19,
  sex: 'male', // error
})


```

変数宣言せず関数に直接オブジェクトを与えると、excess property check という機構が働いて、定義されたプロパティ以外を持っていることを検知して警告してきます。

### Readonly

プロパティに readonly を与えると読み取り専用になりますが、すべてのプロパティに readonly を与えたい場合は、オブジェクトを Readonly 型で指定します。

```ts

interface Member {
  name: string
  age: number
}

const ruffy: Readonly<Member> = {
  name: 'Monkey',
  age: 19,
}

ruffy.age = 17 // error


```

## 抽象度をコントロールして型安全

型の抽象度を詳細または抽象的に、間口をコントロールすることで安全性を担保できます。

### ダウンキャスト

TypeScript の型推論に頼るのではなく、さらに実装者が型の詳細を指定したいとき、 絞り込むために、アサーションを使います。このことをダウンキャストと呼び、型の互換性があれば成立します。記法は2つあります。

```ts

const el = document.querySelector<HTMLDivElement>('#el')
const canvas = document.querySelector('#canvas) as HTMLCanvasElement'


```

ダウンキャストの逆でアップキャストという概念もあります。型推論に any を与えるなどすることがアップキャストと呼びますが、ダウンキャストとは利点も逆で、型の詳細がわからなくなるため危険な実装なので、慎重に検討します。

### インデックスシグネチャ

型が付与されているオブジェクトに、定義されていないプロパティを代入するとエラーになります。オブジェクトに動的な値を追加するには `[key: type]` というように記述し、これをインデックスシグネチャと呼びます。必須のプロパティがあるなら、従来通りメンバーとして登録すればよいです。

```ts

// error
interface Member {
  name: string
  age: number
}

const ruffy: Member = {
  name: `Monkey`,
  age: 19,
  sex: `male`,
}

// ok
interface Member {
  name: string
  [key: string]: string | number
}

const ruffy: Member = {
  name: `Monkey`,
  age: 19,
  sex: `male`,
}

ruffy.name // string
ruffy.sex // string | number


```

`[key: string]: string | number` で動的な key 名と `string` と　`number` 型のメンバーに対応したオブジェクトを定義しています。

プロパティ値の型を制限して、与えられる値を限られたものにします。未定義の場合も推論できるようにしておきます。

```ts

type Names = 'Nami' | 'Ruffy' | 'Zoro'
interface Member {
  from: {
    [key: string]: Names | undefined
  }
}

const mugiwara: Member = {
  from: {
    kokoyashi: 'Nami',
    fusya: 'Ruffy',
    shimotsuki: 'Zoro',
    baratie: 'Sanji', // error
  },
}


```

プロパティキーの型を`in` で指定して制限します。未定義を許容するには `?` で表現できます。

```ts

type Names = 'Nami' | 'Ruffy' | 'Zoro'
interface Member {
  from: {
    [key in Names]: string
  }
}

const mugiwara: Member = {
  from: {
    Nami: 'kokoyashi',
    Ruffy: 'fusya',
    Zoro: 'shimotsuki',
    Sanji: 'baratie', // error
  },
}


```

### const assertion

const assertion を利用すると `tuple` 型を簡略化して記述できます。変数を宣言したときの値をそのまま `tuple` として適用します。オブジェクトや配列の定数を表現するのが楽です。

```ts

''''const ruffy = [Monkey, 19] as const // readonly [Monkey, 19]


```

## 絞り込んで型安全

JavaScript で従来行っていた型チェックの構文を利用して、型を絞り込む方法があります。

### typeof type guards

引数の union types を `typeof` で型チェックをして `return` して絞り込むシンプルな方法です。

```ts

const typeCheck = (val: number | string) => {
  if (typeof val === 'number') {
    return ['number', val]
  }
  return ['string', val]
}

typeCheck(0)
typeCheck(name)''''


```

型推論で 2つ目の `return` で val は `string` に推論されます。

### in type guards

引数に渡されるオブジェクトの union type を、どちらかのみに存在するプロパティを `in` 演算子で比較すると、型の絞り込みが可能です。

```ts

type Ruffy = {
  gender: 'male'
  age: 19
}
type Nami = {
  gender: 'female'
}

const checkMember = (member: Ruffy | Nami) => {
  if ('age' in member) return member // Ruffy
  return member // Nami
}



```

### instanceof type guards

`instanceof` では、引数が class の型を絞り込めます。

```ts

class Ruffy {
  private age: number

  constructor() {
    this.age = 19
  }
}

class Nami {
  private gender: string

  constructor() {
    this.gender = 'female'
  }
}

const checkMember = (member: Ruffy | Nami) => {
  if (member instanceof Ruffy) return member // Ruffy
  return member // Nami
}


```

### Tagged Union types

引数の Union types すべてが共通のプロパティを持っていてリテラルの場合、条件分岐で型を絞り込め、この条件に合う Union types を Tagged Union おと呼びます。

```ts

type Ruffy = {
  gender: 'male'
}
type Nami = {
  gender: 'female'
}

const checkMember = (member: Ruffy | Nami) => {
  if (member.gender === 'male') return member // Ruffy
  return member // Nami
}


```

### User type guard

匿名関数の戻り型アノテーションとして `is` を利用し、ユーザーが直接絞り込んで真偽値を返す関数を定義できます。

```ts

type Ruffy = {
  age: 19
  [k: string]: any
}
type Nami = {
  gender: 'female'
  [k: string]: any
}

const checkRuffy = (member: Ruffy | Nami): member is Ruffy => {
  return member.age !== undefined
}
const checkNami = (member: Ruffy | Nami): member is Ruffy => {
  return member.gender !== undefined
}

const checkUser = member => {
  if (checkRuffy(member)) {
    return member // Ruffy
  } else if (checkNami(member)) {
    return member // Nami
  } else {
    return member // any
  }
}


```

`is` を使うことによって、アップキャスト的に実装者がその型であることを保証して絞り込んでいるので、TypeScript の型推論が実装者頼りになる、ということを意識しておく必要があります。

おわります。
