---
id: 843
type: tip
slug: "css-ellipsis-mixin"
title: "CSSだけで行数を指定してテキストを丸めて省略するためにSassのmixinを作りました -『CSS』"
date: 2016-12-27T17:56:50+09:00
modified: 2017-02-13T21:44:05+09:00
excerpt: "CSSだけでテキストを丸めて「…」のような文字列で省略することは１行だと簡単に実現できるのですが、複数行では難しいです。簡単にSCSSで@includeで指定できるようにmixinをつくりました。 CSSだけ"
primaryTag: "css"
terms:
  - { id: 3, name: "css", slug: "css" }
  - { id: 141, name: "layout", slug: "layout" }
  - { id: 5, name: "mixin", slug: "mixin" }
  - { id: 6, name: "sass", slug: "sass" }
  - { id: 236, name: "text", slug: "text" }
demoUrl: https://jsfiddle.net/yutousui/zy17p97a/
legacy:
  prev: macos-gulp-init
  next: html5-responsive-image
---

CSSだけでテキストを丸めて「…」のような文字列で省略することは１行だと簡単に実現できるのですが、複数行では難しいです。簡単にSCSSで`@include`で指定できるように`mixin`をつくりました。

## CSSだけで一行にテキストを丸めて省略して表示する

これは複雑な指定が必要なく、簡単に実現できます。下記のコードを記述してhtmlの任意の要素のクラス属性に`u-ellipsis`を与えます。

#### scss

```

.u-ellipsis {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap
}


```

compassを利用している場合は以下のように`@include ellipsis;`を記述するだけで、コンパイル後、上記のコードが出力されます。

#### scss

```

.u-ellipsis {
  @include ellipsis;
}


```

## CSSだけで行数を指定してテキストを丸めて省略するためのmixin

下記のコードを記述してhtmlの任意の要素のクラス属性に`one`を記述すると１行に`two`を記述すると２行に指定することができます。

#### scss

```

@mixin lineClip($line-number: 2, $line-height: 1, $right-space: 1em, $background-color: #ffffff) {
  position: relative;
  overflow: hidden;
  height: calc(#{$line-number + em } * #{$line-height});
  padding-right: $right-space;
  line-height: $line-height;
  background-color: $background-color;
  &:before {
    content: "...";
    position: absolute;
    right: 0;
    bottom: 0;
    display: inline-block;
    width: $right-space;
  }
  &:after {
    content: "";
    position: relative;
    right: calc(#{$right-space} * -1);
    float: right;
    width: $right-space;
    height: 100%;
    margin-left:calc(#{$right-space} * -1);
    background-color: $background-color;
  }
}

.one {
  // lineClip(row, line-height, right-space, background-color(same parent));
  @include lineClip(1);
}

.two {
  @include lineClip(2, 2);
}


```

引数には、「行数 line-height 右側の余白 テキストボックスの背景色」を与えます。上記の`mixin`ではデフォルト値を与えています。

#### scss

```

.line-clip {
  // @include lineClip(行数, line-height, 右側の余白, テキストボックスの背景色);
  @include lineClip(4, 2, 2em, #ffffff);
}


```

このコードの注意点としては、テキストボックスの背景色が透過していたりグラデーションしていると実装することができません。テキストが指定した行数以内で短くて省略しなかった場合、丸めたことを表す「…」の三点リーダを消すための背景色と同色の疑似要素を表示しているからです。

<p><iframe width="100%" height="500" src="//jsfiddle.net/yutousui/zy17p97a/embedded/result,css/dark/" allowfullscreen frameborder="0"></iframe></p>

おわります。
