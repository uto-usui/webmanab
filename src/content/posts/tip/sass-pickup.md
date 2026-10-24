---
id: 853
type: tip
slug: "sass-pickup"
title: "いまデザイナーが覚えておきたい、Sass(SCSS)の基本と便利な小技集 -『Sass/SCSS』"
date: 2017-01-11T17:50:24+09:00
modified: 2017-02-14T01:51:48+09:00
excerpt: "シンプルが魅力のCSSはリッチな表現や複雑なサイトなどの保守性に欠けますが、CSSメタ言語で記述することでコーディング効率やソースコードの保守性を向上することができます。フロントエンドでは必須の技術になってきましたが、C"
primaryTag: "sass"
terms:
  - { id: 3, name: "css", slug: "css" }
  - { id: 6, name: "sass", slug: "sass" }
demoUrl: https://jsfiddle.net/yutousui/d8knz11c/
legacy:
  prev: scroll-box-animation
  next: javascript-operator
---

シンプルが魅力のCSSはリッチな表現や複雑なサイトなどの保守性に欠けますが、CSSメタ言語で記述することでコーディング効率やソースコードの保守性を向上することができます。フロントエンドでは必須の技術になってきましたが、CSSメタ言語の中でも学習コストが低く扱いやすいSass(SCSS記法)で、デザイナーがとりあえず覚えておくと便利な内容や+αをまとめます。

## Sassのコンパイル

SassはCSSに変換してhtmlファイルにはCSSファイルとして読み込ませることになるので、コンパイラー(変換するやつ)が必須です。Dreamweaver2017やBracketsの拡張機能を使えば簡単にコンパイルすることができますし、タスクランナーのgulpを利用すればより高度に取り扱うことができます。

- [デザイナーがMacOSでgulpを動かせるようになるまで](/tip/macos-gulp-init/)

とりあえずオンラインでの実行環境は

- [codepen](http://codepen.io/)
- [jsfiddle](https://jsfiddle.net/)
- [sassmeister – 変換ツール](http://www.sassmeister.com/)
- [css2sass – 変換ツール](http://css2sass.herokuapp.com/)

これでさくっと試してみることができます。

## これだけはデザイナーも覚えておきたい、Sass(SCSS)の小技集

Sass(SCSS記法)の学習コストが低い理由は、CSSと同じ記法で記述することができるからです。いきなり高度なことが要求されるわけではなく、わかることだけ、自分が便利だと思える構文だけを利用することができます。基本的な使い方やテクニックなどを簡単に解説します。

### ネストと結合子

セレクタをネスト(入れ子に)して記述することができます。基本のセレクタ・疑似セレクタ・疑似要素の依存関係が視覚的に把握でき、親となるセレクタを１つにしてまとめて記述することができるので、簡潔なコードを実現できます。

#### SCSS

```

.ex {
  ...
  .ex_child {
    ...
  }
  + .ex {
    ...
  }
}


```

これをコンパイルすると

```

.ex {...}

.ex .ex_child {...}

.ex + .ex {...}


```

となります。

Sassには`&`という結合子が用意されていて、これを前方に使うことでネストしているセレクタを結合することができます。後方に使うと、ネストの親子関係を逆転するセレクタ指定が可能になります。

#### SCSS

```

.ex {
  ...
  &.ex--small {
    ...
  }
  &:nth-child(2) {
    ...
  }
  &::after {
    ...
  }
  .target: hover & {
    ...
  }
}


```

#### CSS

```

.ex {...}

.ex.ex--small {...}

.ex:nth-child {...}

.ex::after {...}

.target:hover .ex {...}


```

ネストのし過ぎには注意します。ホバーなどのアクション目的でのネストは理にかなっていますが、要素セレクタやクラスセレクタの子孫指定でのネストなど、無駄なスコープや詳細度を与えないように注意します。このあたりはコーディングルールやCSS構成案などと合わせて考える必要がありますね。

### 変数に値を格納

Sassでは変数を利用して共通の値などをまとめておくことができます。変数はプロパティや他の変数との演算やSass関数での利用が可能です。

#### SCSS

```

$primary-color: hsla(180,50%,50%,1);
$text-base-color: hsla(0,0%,10%,1);
$base-line-height: 1.75;


```

### プロパティ値を演算

CSSのプロパティ内で四則演算することができます。ただし異なる単位をまたいでの計算はできません。この場合はCSSの`calc()`関数で解決します。

#### SCSS

```

.ex {
  font-size: 16px * 2;
  margin: 100% * 5em; // NG
  margin: calc(100% * 5em); // OK
}


```

#### CSS

```

.ex {
  font-size: 32px;
  margin: calc(100% * 5em);
}


```

### コメントアウト

SassではJavaScriptと同じように`//`でその行の右側をコメントアウトすることができます。このコメントアウトはコンパイル後に削除されます。削除されたくないコメントについては`/* */`の中に記述します。

#### SCSS

```

.ex {
  // this is my favorite rule
  color: #000;
}


```

#### CSS

```

.ex {
  color: #000;
}


```

### @importで別ファイルを読み込み

Sassには複数のファイルに細かくスタイルシートのルールを分割し、見通しよく管理できる機能があります。それは`@import`構文を使うことによって実現できます。CSSの`@import`は速度も遅く推奨されませんが、Sassの`@import`はコンパイル時に他のファイルを読み込んで１つのファイルにルールを結合しまとめます。

#### SCSS

```

@import "object/component/_button";


```

読み込み先を相対パスで記述し、拡張子は省略できます。読み込み用のSCSSファイルには`_`のプレフィクスをつけることでコンパイルの管理対象から外れ読み込み専用として認識されます。読み込むファイルには原則このルールと考えて大丈夫です。

### Sassの関数

Sassには様々な強力な関数が用意されています。

<dl><dt>round()</dt><dd>数値の小数点以下を四捨五入</dd><dt>ceil()</dt><dd>数値の小数点以下を切り上げ</dd><dt>floor()</dt><dd>数値の小数点以下を切り捨て</dd><dt>rgba()</dt><dd>RGBA形式に変換</dd><dt>lighten()</dt><dd>色を明るく</dd><dt>darken()</dt><dd>色を暗く</dd><dt>saturate()</dt><dd>彩度を上げる</dd><dt>desaturate()</dt><dd>彩度を下げる</dd><dt>grayscale()</dt><dd>グレースケールに変換</dd><dt>complement()</dt><dd>補色</dd><dt>mix()</dt><dd>2つのカラーコードの中間色</dd><dt>adjust-hue()</dt><dd>色相環の角度を変更</dd></dl>

#### SCSS

```

.ex {
  width: round(100% / 3); /* round */
  width: ceil(100% / 3); /* ceil */
  width: floor(100% / 3); /* floor */

  color: rgba(black, .5); /* rgba */
  color: lighten(black, 30%); /* lighten */
  color: darken(white, 30%); /* darken */
  color: saturate(hsla(180,50%,50%,1), 20%); /* saturate */
  color: desaturate(green, 20%); /* desaturate */
  color: grayscale(green); /* grayscale　*/
  color: complement(hsla(180,50%,50%,1)); /* complement　*/

  color: mix(blue, orange); /* mix */
  color: adjust-hue(orange, 90deg); /* adjust-hue */


```

#### CSS

```

.ex {
  width: 33%; /* round */
  width: 34%; /* ceil */
  width: 33%; /* floor */
  color: rgba(0, 0, 0, 0.5); /* rgba */
  color: #4d4d4d; /* lighten */
  color: #b3b3b3; /* darken */
  color: #26d9d9; /* saturate */
  color: #0d730d; /* desaturate */
  color: #404040; /* grayscale　*/
  color: #bf4040; /* complement　*/
  color: #805380; /* mix */
  color: #00ff26; /* adjust-hue */
}



```

### forループで繰り返し処理

Sassには繰り返しの処理を行いたい場合に便利なループ構文が用意されています。`:nth-child()`とかと合わせて表現することで簡潔に記述することができます。

```
@for $i from n through m {...}

```

上記の構文で、回数を指定したforループを実行することができます。

例として、順番にアニメーションを遅らせて実行したい場合のループです。`nth-child()`の値に応じて`animation-delay`にループ内で都度計算した変数`$dalay`を指定しています、

#### SCSS

```

.item {
  width: 15px;
  height: 15px;
  border-radius: 100%;
  background-color: rgba(white,.35);
  animation: rotate 1.5s alternate infinite both;
  //
  @for $i from 2 through 5 {
    &:nth-child(#{$i}) {
      $delay: 0.3 * ($i - 1) + s;
      animation-delay: $delay;
    }
  }
  //
  + .item {
    margin-left: 2em;
  }
}

@keyframes rotate {
  from {
    transform: rotateY(0);
  }
  to {
    transform: rotateY(360deg);
  }
}


```

#### CSS

```

.item {
  width: 15px;
  height: 15px;
  border-radius: 100%;
  background-color: rgba(255, 255, 255, 0.35);
  animation: rotate 1.5s alternate infinite both;
}

.item:nth-child(2) {
  animation-delay: 0.3s;
}
.item:nth-child(3) {
  animation-delay: 0.6s;
}
.item:nth-child(4) {
  animation-delay: 0.9s;
}
.item:nth-child(5) {
  animation-delay: 1.2s;
}

.item + .item {
  margin-left: 2em;
}

@keyframes rotate {
  from {
    transform: rotateY(0);
  }
  to {
    transform: rotateY(360deg);
  }
}


```

CSS固有のキーワードや関数の内部に変数を使用することはできないので注意します。`#{$i}`のように`#{$variable}`と記述してエスケープする必要があります。

### mixinで処理をまとめる

mixinは繰り返し使いたい処理をまとめておける構文です。自分で作るには少しむつかしいですが取り扱いは簡単です。`@mixin`で定義した処理を`@include`で呼び出します。mixinはいろんなところで便利なものが配布されていたり提示されているので必要なものがあればピックアップしておきます。\
例として、`px`単位で指定した`font-size`を`rem`の単位に自動計算して変換する`mixin`です。

#### SCSS

```

@mixin fontsize($size: 14, $root: 14) {
  font-size: ($size / $root) * 1rem;
}

.ex {
  @include fontsize(20);
}


```

#### CSS

```

.ex {
  font-size: 1.42857143rem;
}


```

`$size`には呼び出し時の値が格納されていますが、引数がない場合にデフォルト14をセットして、`$base`にはドキュメントルート`html`のフォントサイズを指定しています。

`@mixin`の名前は任意で決めることができますが、以下のようなルールがあります。

- 数字から始めることができない
- 特殊記号が含まれていない
- 連続したハイフンから始めることができない

また、`@content`を使うことで`@mixin`でセレクタを呼び出すことができます。

#### SCSS

```

// Chrome Hack
@mixin hackChrome {
  @media screen and (-webkit-min-device-pixel-ratio:0){
    @content
  }
}

.ex {
  @include hackChrome {
    font-size: 20px;
  }
}


```

#### CSS

```

@media screen and (-webkit-min-device-pixel-ratio:0){
  .ex {
    font-size: 20px;
  }
}


```

#### demo

<p><iframe width="100%" height="450" src="//jsfiddle.net/yutousui/d8knz11c/embedded/html,css,result/dark/" allowfullscreen frameborder="0"></iframe></p>

おわります。
