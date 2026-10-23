---
id: 458
type: tip
slug: "transition"
title: "簡単にアニメーションを実装したい。transitionのつかいかたをざっくりとまとめてみた -『CSS』"
date: 2016-10-03T13:52:46+09:00
modified: 2017-02-17T17:21:01+09:00
excerpt: "WebページはHTML(コンテンツ)・CSS(プレゼンテーション)・JavaScript(ふるまい)という３つのレイヤーがあると考えられます。 しかし、その分離は絶対的なものではなく、webkitが開発した transi"
primaryTag: "animation"
terms:
  - { id: 2, name: "animation", slug: "animation" }
  - { id: 3, name: "css", slug: "css" }
legacy:
  prev: html5-global
  next: hammer-js
---

<style>
.ex {
  position: relative;
  left: 0;
  width: 20px;
  height: 20px;
  background-color: hsla(200, 50%, 50%, .8);
  transition: background-color .4s, -webkit-transform .6s .4s, width .6s 1s;
  transition: background-color .4s, transform .6s .4s, width .6s 1s;
}
.ex:hover {
  width: 100%;
  background-color: hsla(200, 50%, 50%, .4);
  -webkit-transform: rotate(360deg);
  transform: rotate(360deg);
  }
</style>

WebページはHTML(コンテンツ)・CSS(プレゼンテーション)・JavaScript(ふるまい)という３つのレイヤーがあると考えられます。\
しかし、その分離は絶対的なものではなく、webkitが開発した `transition` / `animation` のモジュールでさらにあいまいなものになりました。

そのうち簡単に実装できる`transition`のはなしです。\
`transition`は**適用対象のプロパティの値が変わると発生**します。

## transition

CSS2.1には中間の値が定義されていなかったので、プロパティの値が変化すると瞬間的に表示が変化していました。\
これをなめらかにするために、CSS3では、Transitionモジュールが定義されました。

トランジションは、あるプロパティに新しい値がセットされた時にのみ開始します。(これを暗黙のアニメーションと呼んでいます)\
設定項目として、**初期値/終了値/トランジション自体/トリガー**の４つがあります。

#### css

```css

.ex {
  color: #000;
  transition: color .5s;
}
.ex:hover {
  color: #aaa;
}

```

#### 設定項目

上記サンプルコードに以下の内容を設定しています。

<dl><dt>初期値</dt><dd>color: #000</dd><dt>終了値</dt><dd>color: #aaa</dd><dt>トランジション</dt><dd>transition: color .5s</dd><dt>トリガー</dt><dd>:hover擬似クラス</dd></dl>

#### check

トランジションのプロパティは主要ブラウザに実装されているのでベンダーごとのプレフィクスは必要ありません。\
ただ、webkit系の古いブラウザ(Android4.4以前)に対応するには-webkit-を追記しておきましょう。

## transition関連のプロパティ

最後に短縮記法を紹介しますが、まずはtransition関連のプロパティをひとつひとつ紹介していきます。

### transition-property

アニメーションを**行いたいプロパティ**を指定します。

#### css

```css

ex {
  transition-property: keyword
}

```

キーワードにはall/none/cssのプロパティを記述します。

<dl><dt>all</dt><dd>すべてのプロパティに対してアニメーションを発生させます。</dd><dt>none</dt><dd>どのプロパティにも指定しません。</dd><dt>cssのプロパティ</dt><dd>記述したプロパティにのみ発生させます。</dd></dl>

#### css

```css

p {
  margin: 1em;
  transition-property: margin;
}

```

### transition-duration

**開始から終了までの時間を指定**します。\
トランジションに必須の値はこれだけです。

#### css

```css

ex {
  transition-duration: time;
}

```

- 時間の単位は秒です。
- デフォルトの値は０です。

#### css

```css

p {
  margin: 1em;
  transition-property: margin;
  transition-duration: 1s;
}

```

### transition-timing-function

速度を変更でき、**動きのペースを指定**します。\
関数cubic-bezier()とsteps()とキーワードで指定することができます。

#### キーワード指定

#### css

```css

ex { transition-timing-function: keyword; } //デフォルト値はease

```

<dl><dt>ease</dt><dd>ゆっくり-加速-ゆっくり</dd><dt>linear</dt><dd>一定</dd><dt>ease-in</dt><dd>ゆっくり-加速</dd><dt>ease-in-out</dt><dd>easeの変化を緩やかに</dd></dl>

#### ３次ベジェ曲線

詳細な指定にはcubic-bezier()関数を使って３次ベジェ曲線を定義して動くペースを決めます。

#### css

```css

ex {
  transition-timing-function: cubic-bezier(x1, y1, x2, y2);
}

```

３次ベジェ曲線は、４つの点を使って描くスムーズな曲線(イラレのペンツールのやつ)のことで、点の位置で曲率を定義します。\
点は(x, y)座標で表現し、P0とP3はいつも(0, 0)と(1, 1)に固定され、P1とP2を関数で指定します。

<dl><dt>x軸</dt><dd>時間経過</dd><dt>y軸</dt><dd>アニメーションの進行</dd></dl>

cubic-bezier()関数のジェネレーターについては[cubic-bezier.com](http://cubic-bezier.com)が有名です。\
自分で自由に簡単にベジェ曲線をいじって関数を指定することができます。\
定義した関数を実行すると、比較となるもの(最初から定義されているが、独自に追加することも可能)と一緒に動きを確認することができます。\
適当にベジェのポイントを引っ張って遊んでみるだけでもとっても楽しいです。\
いろいろ試したあとは、自分の定義した値をコピペしましょう。\
[my easing](http://cubic-bezier.com/#.22,-1.6,.65,1.8)

使いたい動きをクリックするとコピペで実装できる[Easing Functions Cheat Sheet](http://easings.net/ja)こちらも便利です。\
30種類のイージングがベジェ曲線で表現されており、CSSで表現できないものもありますがマウスオーバーで動きを一つ一つ確認することができます。

#### steps()関数

スムーズでないトランジションをしたい場合は、steps()関数を利用する。\
トランジションを**複数の段階に分けて、飛び飛びに進行**させることができる。

#### css

```css

ex {
  transition-timing-function: steps(count, direction);
}

```

<dl><dt>count</dt><dd>アニメーションを分割する数(整数)</dd><dt>direction</dt><dd>start/endどの時点で変化が発生するか(省略可能)</dd></dl>

#### css

```css

ex {
  transition-timing-function: steps(3);
}

```

コマ送りのようなトランジションが起きます。(３つのタイミングで)

directionキーワードは、分割したタイミングの中で、いつ変化が起こるかを指定します。

<dl><dt>end(デフォルト)</dt><dd>まず停止して、それから変化するというのが繰り返されます。</dd><dt>start</dt><dd>変化して、停止するという手順になります。</dd></dl>

### transition-delay

開始する時間を指定します。

#### css

```css

ex {
  transition-delay: time; 
}

```

- timeの単位はms(ミリ秒)かs(秒)になります。
- ゼロ以外の正の値を指定すると、その時間を経過してからトランジションが開始します。

#### css

```css

p {
  margin: 1em;
  transition-property: margin;
  transition-duration: 1s;
  transition-delay: 800ms;
}

```

負の値を指定すると、**その値だけスキップした状態**でトランジションを即座に開始します。

#### css

```css

p {
  margin: 1em;
  transition-property: margin;
  transition-duration: 1s;
  transition-delay: -1s; //すでに１秒たった状態からスタート
}

```

## transitionの短縮記法

#### css

```css

ex {
  /* transition: property duration delay timing-function; */
  transition: margin 1s .8s ease;
}

```

### 時間の値に注意

１つめがtransition-duration、２つめがtransition-delayをそれぞれ表しています。\
１つだけ指定するとtransition-durationとみなされるので注意です。

### transitionの複数指定

transitionをプロパティごとにタイミングを変えたり、複数指定したいときは**カンマ区切り**で記述しましょう。\
これで複数のプロパティに対して指定できます。

#### css

```css

ex {
  transition: margin 1s .8s ease, 
  padding 1.4s .4s linear, 
  font-size .4s 1.4s linear;
}

```

## さいごに

適当なサンプルを作成しました。\
薄くなって、回転して、びゅーーんとなりますよ。

#### css

```css

.ex {
  position: relative;
  left: 0;
  width: 20px;
  height: 20px;
  background-color: hsla(200, 50%, 50%, .8);
  transition: background-color .4s, -webkit-transform .6s .4s, width .6s 1s;
  transition: background-color .4s, transform .6s .4s, width .6s 1s;
}
.ex:hover {
  width: 100%;
  background-color: hsla(200, 50%, 50%, .4);
  -webkit-transform: rotate(360deg);
  transform: rotate(360deg);
}

```

<figure><div class="ex"></div></figure>
