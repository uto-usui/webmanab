---
id: 457
type: tip
slug: "html5-global"
title: "グローバル属性を並べてみる- 『html5』"
date: 2016-10-03T08:23:31+09:00
modified: 2017-02-17T17:34:26+09:00
excerpt: "グローバル属性とは、すべての要素に共通して指定できる属性です。 HTML5以前は「ほとんど全ての要素に使用可能」と定義されているものはありましたが、「全て」と定義されている属性はありませんでした。 HTML5で新しく定義"
primaryTag: "html5"
terms:
  - { id: 38, name: "html5", slug: "html5" }
legacy:
  prev: html5-basic
  next: transition
---

<style>
.ex01 {
    position: relative;
    margin: 1em;
    display: inline-block;
 }
.ex01::after {
    display: block;
    width: 200%;
    padding: .2em .8em;
    content: attr(title);
    top: calc(100% + 15px);
    font-size: 12px;
    color: hsla(200, 40%, 5%, 0.5);
    background-color:hsla(200, 40%, 90%, 0.3);
}
.ex01::before {
    top: 100%;
    content: \'\';
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 0 15px 15px 15px;
    border-color: transparent transparent hsla(200, 40%, 90%, 0.3) transparent;
}
.ex01::after, .ex01::before {
    position: absolute;
    left: 50%;
    opacity: 0;
    transition: .4s;
    -webkit-transform: translateX(-50%);
    transform: translateX(-50%);
}
.ex01:hover::after, .ex01:hover::before {
    opacity: 1;
}
</style>

グローバル属性とは、すべての要素に共通して指定できる属性です。\
HTML5以前は「ほとんど全ての要素に使用可能」と定義されているものはありましたが、「全て」と定義されている属性はありませんでした。\
HTML5で新しく定義されたのは、<strong>「hidden」「translate」「spellcheck」「contenteditable」</strong>です。

## 主なグローバル属性

### class

CSSでおなじみの`class`属性は、指定した要素が属する種類や分類を示すための属性です。\
名前は空白文字で区切って記述することができ、連続して複数を記述することができます。\
先頭、末尾の前後に空白が挿入されていても問題ありません。\
値を空のままにしておくことも可能です。

#### html

```html

<div class="ex1 ex2 ex3"></div>
<div class=" zoro sanji nami "></div>
<div class="325"></div>
<div class=""></div>

```

### id

javascriptで取り扱うことの多い`id`属性は、**指定した要素に固有の名前を与えるための属性**です。\
「固有」なので、同じページ内で他の属性に同じ値を指定することができません。\
アンカーリンクの指定や、特定の要素１つを対象にしたい場合に使用します。

`class`とは違い`id`は、空白文字を含むことができず、値を空にすることはできません。

#### html

```html

<div id="sanji"></div>
<div id="0302"></div>

```

### lang

lang属性は、**要素内容と属性値の言語の種類を示す属性**です。\
値は、「BCP47」という使用で定義されている言語タグを記述します。

文書全体の言語がわかるように、`html`要素」に`lang`属性を指定すつことが推奨されています。

#### html

```html

<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Document</title>
</head>
<body>
    
</body>
</html>


```

### title

title属性は要素に**関連する補助的な案内や補足情報を示すための属**です。\
通常はブラウザでマウスオーバーしたときのツールチップとして表示されます。

`content`を使って自作ツールチップもいいかも。

<p><a class="ex01" href="kid.html" title="ユースタス・キャプテン・キッドの情報ページ">ユースタス屋</a></p>

#### css

```css

.ex01 {
    position: relative;
    margin: 1em;
    display: inline-block;
 }
.ex01::after {
    display: block;
    width: 200%;
    padding: .2em .8em;
    content: attr(title);
    top: calc(100% + 15px);
    font-size: 12px;
    color: hsla(200, 40%, 5%, 0.5);
    background-color:hsla(200, 40%, 90%, 0.3);
}
.ex01::before {
    top: 100%;
    content: \'\';
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 0 15px 15px 15px;
    border-color: transparent transparent hsla(200, 40%, 90%, 0.3) transparent;
}
.ex01::after, .ex01::before {
    position: absolute;
    left: 50%;
    opacity: 0;
    transition: .4s;
    -webkit-transform: translateX(-50%);
    transform: translateX(-50%);
}
.ex01:hover::after, .ex01:hover::before {
    opacity: 1;
}

```

### dir(列挙属性)

dir属性は、要素内容の**テキストを表記する方向を示す属性**です。\
値にはキーワードが用意されていて、「ltf(left to right)」左から右と「rtl(right to left)」右から左、またはautoを指定します。

### tabindex

tabindex属性は**tabキーによるフォーカスの移動順序**を指定します。\
tabindex属性を指定すると、フォーカス不可要素もフォーカスできるようになります。

<p><input type="text" tabindex="100" placeholder="tabindex=100"><br><input type="text" tabindex="300" placeholder="tabindex=300"><br><input type="text" tabindex="200" placeholder="tabindex=200"></p>

#### 順序の決まり

値には、整数を記述します。

- 0以上…tabキーのフォーカス順序は値の小さい順になります。「1、2、3」
- 0以下(負の値)…tabキーのフォーカス移動ができなくなります。
- 0…0以上の値が指定された要素の後に続きます。「1、2、3、0」
- 指定していない要素…0に続きます。「1、2、3、4、0、指定していない要素」
- とびとびの値…値は連番である必要はありません。「1、5、8、190、0」
- 複数に同じ数値…DOMの順にならいます。

### style

style属性は要素の表示方法を指定します。値にはcssのプロパティと値を記述します。\
**コンテンツの表示/非表示に使用するのは非準拠**です。(hiddenをつかう)

#### html

```html

<div style="font-size: 115%;"></div>

```

### accesskey

accesskey属性は要素に**キーボードからアクセスするためのショートカット**を割り当てます。\
アクセスした後のアクションは、リンク先を開いたり、入力欄の選択やコマンドの実行などです。

大文字と小文字は区別され、空白文字で区切って複数指定ができます。

#### html

```html

<a href="bellamy.html" accesskey="B">ベラミーの成長日記</a>
<a href="bepo.html" accesskey="b">ベポのアイアイ</a>
<a href="sanji_zoro.html" accesskey="s z">まりもとぐるまゆ</a>

```

ただしブラウザによって操作が異なる場合があるので、広く一般的な実装には向いていません。

## HTML5から追加されたグローバル属性

HTML5から定義された新しい属性たちです。

### hidden(論理属性)

hidden属性は**関連性がない**ことを示します。\
「非表示」という意味や「隠す」といった目的で使用することはできません。

#### html

```html

<label>
    <input type="radio" name="zoro">
    onigiri
</label>
<label>
    <input type="radio" name="zoro">
    sanzensekai
</label>
<p id="bad" hidden>それくらいじゃむりでしょう</p>
<p id="ok" hidden>それならたおせますね</p>

```

### translate(列挙属性)

`translate`属性は、**要素内テキストの翻訳の可否**を指定できます。\
ブラウザが翻訳してくれる際に、文章的に翻訳されてしまうとおかしくなってしまう箇所(ソースコードや固有名詞)などに指定します。

- yes…翻訳の対象になります(初期値)
- no…翻訳の対象外になります

#### html

```html

<p>うるせえ...<span translate="no">鬼斬り-onigiri-</span></p>

```

### spellcheck(列挙属性)

**スペル及び文法チェックの有無**を指定します。\
挙動については定義されておらず、ブラウザごとに異なります。

- ture…チェックをする
- false…チェックしない

### contenteditable(列挙属性)

contenteditable属性を指定すると、**要素が編集可能になります**。\
編集後の保存や印刷が可能になります。

- true…編集可能
- false…編集不可

### カスタムデータ属性「data-\*」

カスタムデータ属性とは使用するのに適当な属性がないときや、**独自のデータを追加したいときに、任意の要素に独自の属性を追加できる**ように用意されています。\
属性名は「data-」という接頭語をつけ、任意の１文字以上を続けて記述します。

１つの要素に属性はいくつでも指定でき、属性名にはアルファベットの大文字を記述することができません。

#### html

```html

<div data-devil="5656">straw hat</div>

```

## WAI-ARIA関連属性

HTML5では「WAI-ARIA」という別の仕様で定義されている「role属性」「aria-\*\*<em>属性」を任意に指定することができます。\
「WAI-ARIA」</em>動的なコンテンツや、複雑なインターフェースを持つサイトやアプリをアクセシブルにするための仕様です。

### role

role属性は、要素の**役割がなんであるのかを示すために使用される属性**です。\
例えばリストで`navigation`と指定するなど、用途を明確化するために指定します。

### aria-\*\*\*

aria-\*\*\*属性は要素のその時点での状態や特性を示すための属性です。

#### html

```html

<input type="radio" aria-checked="true">
<input type="radio" aria-checked="false">

```

## 列挙属性と論理属性

属性の性質について書いておきます。

### 列挙属性

列挙属性とは、**あらかじめ決められたキーワードの中から値を選択する属性**です。\
キーワードは大文字/小文字を問いません。\
列挙属性は値を空文字指定できるものもあり、指定すると初期値に設定されます。

#### html

```html

<h1><p translate="NO">鬼斬り-onigiri-</p></h1>
<h1><p translate="no">鬼斬り-onigiri-</p></h1>
<h1><p translate="">鬼斬り-onigiri-</p></h1>  //yesの値

```

### 論理属性

論理属性とは、**属性名だけで指定できる属性**です。\
属性を指定すると、値が真(true)になり、指定していないと偽(false)になります。\
値を指定して記述することもでき「属性名=”属性名”」、値を空で記述することも可能です。

#### html

```html

<span hidden=""></span>
<span hidden="hidden"></span>
<span hidden></span>

```

おわります。
