---
id: 2345
type: tip
slug: "javascript-select-dom"
title: "ES6 JavaScript での要素の取得と操作のまとめ -『JavaScript』"
date: 2018-10-14T17:22:04+09:00
modified: 2019-11-24T02:32:14+09:00
excerpt: "JavaScript で DOM を取得して操作したいときのシンプルなまとめです。 jQuery などでは簡単に要素を取得・操作できますが、ネイティブの JavaScript だと多少冗長になったりすることもありますね。"
primaryTag: "javascript"
terms:
  - { id: 240, name: "ES6", slug: "es6" }
  - { id: 29, name: "javascript", slug: "javascript" }
legacy:
  prev: javascript-mouse-position
  next: redmine-image
---

JavaScript で DOM を取得して操作したいときのシンプルなまとめです。 jQuery などでは簡単に要素を取得・操作できますが、ネイティブの JavaScript だと多少冗長になったりすることもありますね。ただ、React や Vue などを使っているとこの辺りの操作はネイティブのメソッドを利用することも多いので、よく使うものを一覧にしておこうと思います。

## DOMを取得

DOMを取得する方法のまとめです。

<dl><dt>document.getElementById</dt><dd>id</dd><dt>document.getElementsByTagName</dt><dd>タグの名前</dd><dt>document.getElementsByClassName</dt><dd>クラス名</dd><dt>document.querySelector</dt><dd>CSSセレクタ ひとつ</dd><dt>document.querySelectorAll</dt><dd>CSS 複数</dd></dl>

### id

ページの中で固有の id で取得します。

```js

document.getElementById('main');


```

### tag

Img など、タグ名を指定して取得すると、配列のようなノードの集合体、 NodeList オブジェクトが返ります。

```js

document.getElementsByTagName('img');


```

`getElementsByTagName` メソッドは、Element オブジェクトからも、絞り込むように実行できます。逆にElement オブジェクトから `getElementById` はできません。

```js

const main = document.getElementById('main');
main.getElementsByTagName('img');


```

NodeList はライブオブジェクトという性質を持っていて、一度取得して変数に格納したとしても、常にDOMツリーへの参照を持っているので、これに要素の増減などの変更を加えると、直接反映されるような挙動になります。

### class

指定されたクラス名のある要素を取得すると、NodeList オブジェクトが返されます。

```js

const elements = document.getElementsByClassName('el');


```

`getElementsByClassName` も Element オブジェクトからの実行も可能です。クラス名は複数指定することも可能で、半角スペースで区切って記述します。取得される対象は、記述したクラスが全て指定された要素です。

```js

const main = document.getElementById('main');
const elements = main.getElementsByClassName('el1 el2');


```

### Selectors API

Selectors API は CSSセレクタを指定することで要素を取得する仕組みです。

<dl><dt>querySelector</dt><dd>一致した1つの要素、または複数の場合は始めの1つを取得する。<br>querySelectorAll</dd><dd>一致した複数の要素を取得する。</dd></dl>

```js

document.querySelector('#el')
document.querySelectorAll('.el')
document.querySelectorAll('div')
document.querySelectorAll('ul a');


```

柔軟にDOMを取得することが出来ますが、他のメソッドに比べて、取得のパフォーマンスは劣ります。

Selectors API で返されるのは NodeList ではなく、StaticNodeList オブジェクトが返ります。StaticNodeList はオブジェクトに変更を加えても、DOM ツリーに反映されません。

### 親、子、兄弟要素

取得した Element オブジェクトは親、子、兄弟関係にあたるノードへの参照を持っています。それぞれオブジェクトのプロパティからアクセスします。Element Traversal API という仕様を利用します。

<dl><dt>children</dt><dd>子要素のリスト</dd><dt>firstElementChild</dt><dd>最初の子要素</dd><dt>lastElementChild</dt><dd>最後の子要素</dd><dt>nextElementSibling</dt><dd>次の要素</dd><dt>previousElementSibling</dt><dd>ひとつ前の要素</dd></dl>

```js

const main = document.getElementById('main');

const parent main.parentElement;
const children = main.child;
const firstChild = main.firstElementChild;
const lastChild = main.lastElementChild;
const next = main.nextElementSibling;
const prev = main.previousElementSibling;


```

## DOM の操作

DOMの作成や取得後の操作をまとめます。

### ノードの作成

ノードを作成するには、Document オブジェクトの createElement メソッドを使用します。

```js

const div = document.createElement('div');


```

### ノードの追加

`insertAdjacentHTML` は指定した箇所に、文字列をHTMLとしてパースして挿入するメソッドです。

```js

element.insertAdjacentHTML(position, text);


```

position には4つのキーワードが指定できます。

- beforebegin
- afterbegin
- beforeend
- afterend

キーワードと挿入箇所の関係は以下のようになります。

```js

<!-- beforebegin -->
<div>
<!-- afterbegin -->
  <div>Text</div>
<!-- beforeend -->
</div>
<!-- afterend -->


```

文字列ではなく要素を挿入したい場合は、 `insertAdjacentElement` を使います。

```js

Element.insertAdjacentElement('beforebegin', yourElement);


```

## ノードの属性・内容を変更

ノードの属性を変更するには、ノードのプロパティに代入します。

```js

const div = document.createElement('div');
div.id = 'main';
div.className = 'is-load';
div.style.display = 'flex';


```

### innerHTML

Node の内容(子要素)を置き換えるには、 innerHTML プロパティ に文字列を代入します。タグを文字列として与えることができます。また、内容の取得も可能です。

```js

const el = document.getElementById('el');
el.innerHTML = '<h1>title</h1>';

const html = el.innerHTML;


```

おわります。
