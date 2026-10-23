---
id: 627
type: tip
slug: "jquery-selector"
title: "DOM要素を選択するためのセレクタのまとめ -『jQuery』"
date: 2016-10-29T22:52:24+09:00
modified: 2019-02-18T10:56:07+09:00
excerpt: "jQueryでDOM要素を選択するときに使うことのできるセレクタのまとめです。 jQueryのセレクタまとめ jQueryの$()関数の第一引数にセレクタが入っている場合、第二引数はその処理の処理のコンテクストを示します"
primaryTag: "jQuery"
terms:
  - { id: 29, name: "javascript", slug: "javascript" }
  - { id: 30, name: "jQuery", slug: "jquery" }
legacy:
  prev: mac-virtualbox-windows
  next: method-control
---

jQueryでDOM要素を選択するときに使うことのできるセレクタのまとめです。

## jQueryのセレクタまとめ

jQueryの`$()`関数の第一引数にセレクタが入っている場合、第二引数はその処理の処理のコンテクストを示します。第二引数が割り当てられていない場合は、デフォルトのコンテクストとして、**そのセレクタをDOMツリーのあらゆる要素に適用する**というコンテクストになります。

コンテクストにはDOM要素の参照を使えますが、jQueryセレクタを含む文字列も、ラップされたDOM要素の集合も記述することができます。`$()`の中に`$()`を入れてokです。

```js

$(selector)
$(selector, context)


```

### 基本のCSSセレクタ

IDやクラス名、タグ名、それらの階層構造などCSSを扱うときによく使うセレクタをjQueryで使います。

<dl><dt>*</dt><dd>あらゆる要素</dd><dt>E</dt><dd>タグ名がEのすべての要素すべて</dd><dt>E F</dt><dd>タグ名がEの子孫で、タグ名がFの要素すべて</dd><dt>E > F</dt><dd>タグ名がEの直接の子で、タグ名がFの要素すべて</dd><dt>E + F</dt><dd>タグ名がEの直後で、タグ名がFの要素すべて</dd><dt>E ~ F</dt><dd>タグ名がEより後ろにある、タグ名がFの要素すべて</dd><dt>E.C</dt><dd>Cというクラス名の、Eというタグ名の要素すべて</dd><dt>E#I</dt><dd>CというID名の、Eというタグ名の要素すべて</dd><dt>E[A]</dt><dd>Aという属性を持つ、Eというタグ名の要素すべて</dd><dt>E[A=V]</dt><dd>Aという属性でVという値を持つ、Eというタグ名の要素すべて</dd><dt>E[A^=V]</dt><dd>Aという属性でVから始まる値を持つ、Eというタグ名の要素すべて</dd><dt>E[A^=V]</dt><dd>Aという属性でVから始まる値を持つ、Eというタグ名の要素すべて</dd><dt>E[A$=V]</dt><dd>Aという属性でVで終わる値を持つ、Eというタグ名の要素すべて</dd><dt>E[A*=V]</dt><dd>Aという属性でVを含む値を持つ、またはAという属性を持たない、Eというタグ名の要素すべて</dd><dt>E[A!=V]</dt><dd>Aという属性でVではない値を持つ、またはAという属性を持たない、Eというタグ名の要素すべて</dd></dl>

### 位置を指定するセレクタ

ページ上の位置や他の要素との相対的な関係によって要素を選択する時に使うセレクタです。ここではCSSで擬似クラスと呼ばれているものを扱っていますが、jQueryでは**フィルタセレクタ**と呼ばれ、`:`をつけて記述します。\
フィルタセレクタのみで、セレクタを省略したときは、デフォルトで`*`がセレクタに指定されています。

<dl><dt>p a:first</dt><dd><code>p</code>要素の子孫要素の最初の<code>a</code>要素すべて</dd><dt>p a:last</dt><dd><code>p</code>要素の子孫要素の最後の<code>a</code>要素すべて</dd><dt>p a:first-child</dt><dd><code>p</code>要素の最初の子孫要素の<code>a</code>要素すべて</dd><dt>p a:last-child</dt><dd><code>p</code>要素の最後の子孫要素の<code>a</code>要素すべて</dd><dt>p:only-child</dt><dd>兄弟を持たない<code>p</code>要素すべて</dd><dt>p a:nth-child(n)</dt><dd><code>p</code>要素の子孫要素のn番目の<code>a</code>要素すべて</dd><dt>p a:nth-child(even / odd)</dt><dd><code>p</code>要素の子孫要素の偶数 / 奇数番目の<code>a</code>要素すべて</dd><dt>p:even</dt><dd>偶数番目の<code>p</code>要素すべて</dd><dt>p:odd</dt><dd>奇数番目の<code>p</code>要素すべて</dd><dt>p:eq(n)</dt><dd>n番目の<code>p</code>要素すべて</dd><dt>p:gt(n)</dt><dd>n番目の<code>p</code>要素を除いた、それ以降の<code>p</code>要素</dd><dt>p:gt(n)</dt><dd>n番目の<code>p</code>要素を除いた、それ以前の<code>p</code>要素</dd></dl>

#### 順序に関する注意

`nth-child`フィルタはCSSとの互換をとるため1から数えますが、他のセレクタは一般的なプログラミング通り0から数えます。

### カスタムフィルタセレクタ

その他の強力なセレクタで、状態などに応じて要素を選択します。

<dl><dt>E:animated</dt><dd>現在アニメーションが実行中の、タグ名がEの要素すべて</dd><dt>I:checked</dt><dd>チェックされた状態の、チェックボックスかラジオボタンすべて</dd><dt>E:disabled</dt><dd>無効になっている、タグ名がEのフォームの要素すべて</dd><dt>E:enabled</dt><dd>有効になっている、タグ名がEのフォームの要素すべて</dd><dt>E:empty</dt><dd>子要素またはテキストを持っていない、タグ名がEの要素すべて</dd><dt>E:parent</dt><dd>子要素またはテキストを持っている、タグ名がEの要素すべて</dd><dt>E:hidden</dt><dd>不可視状態の、タグ名がEの要素すべて</dd><dt>E:visible</dt><dd>可視状態の、タグ名がEの要素すべて</dd><dt>E:has(F)</dt><dd>Fというタグ名の要素をひとつ以上含んでいる、タグ名がEの要素すべて</dd><dt>E:contains(test)</dt><dd>testというテキストをふくむ、タグ名がEの要素すべて</dd><dt>E:not(selector)</dt><dd>selectorで指定されたセレクタの逆の条件の、タグ名がEの要素すべて</dd></dl>

使い方に関して、ややこしいものについて掘り下げてみます。

#### :notフィルタ

セレクタを論理逆転させたい場合には、`:not`フィルタを使います。

```js

// チェックされていないチェックボックスまたはラジオボタン
$('input:not(:checked)')

// 拡張子がpng以外のimg要素
$('img:not([src*=".png"])')


```

#### :hasフィルタ

特定の要素を持っている要素を選択したい時`:has`フィルタを使います。

```js

// 拡張子がpngのimg要素を含んでいるp要素
$('p:has(img[src*=".png"]))')


```

おわります。
