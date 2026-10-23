---
id: 1962
type: tip
slug: "gulp-from-utf-8-to-shift_jis"
title: "Gulpで文字コードをUTF-8からShift_JISに変換する方法-『gulp』"
date: 2018-01-20T19:15:11+09:00
modified: 2018-01-20T19:15:11+09:00
excerpt: "gulpで UTF-8 のファイルをビルド時に Shift_JIS に変換する方法です。文字コードをShift_JISで納品しないといけない要件はたまにありますが、gulpでビルド時に変換することで開発環境はUTF-8で"
primaryTag: "gulp"
terms:
  - { id: 3, name: "css", slug: "css" }
  - { id: 238, name: "frontend", slug: "frontend" }
  - { id: 215, name: "gulp", slug: "gulp" }
  - { id: 216, name: "html", slug: "html" }
legacy:
  prev: extract-diff-file
  next: terminal-alias
---

gulpで UTF-8 のファイルをビルド時に Shift_JIS に変換する方法です。文字コードをShift_JISで納品しないといけない要件はたまにありますが、gulpでビルド時に変換することで開発環境はUTF-8で構築できる、というようなメリットがある方法になっています。「gulp-replace」と「gulp-convert-encoding」を利用します。

gulp 環境の導入はこちらからです。

- [デザイナーがMacOSで「gulp.js」を動かせるようになるまでと、タスクとテンプレートファイルβ版の配布 -『front-end』 – webmanab.html／ウェブまなぶ](/tip/macos-gulp-init/)

## プラグインのインストール

「gulp-replace」と「gulp-convert-encoding」という2つのプラグインをインストールします。

```bath

yarn add gulp-replace gulp-convert-encoding


```

「gulp-replace」は特定の文字列を置換、「gulp-convert-encoding」は任意のエンコードに変換、という２つの機能を組み合わせることで要件を実現します。

- [gulp-replace](https://www.npmjs.com/package/gulp-replace)
- [gulp-convert-encoding](https://www.npmjs.com/package/gulp-convert-encoding)

## タスクの記述

`convert`というタスクを定義します。`'your-src'` `'your-dist'` は任意のパスを記述します。そこにHTMLやCSSなどを置いて`gulp convert`を実行すれば、ファイルのエンコードがShift_JISに変換され、`charset` で\
指定した UTF-8 の記述部分も　Shift_JISに変更されます。

```js

const gulp = require( 'gulp' ),
           convertEncoding = require('gulp-convert-encoding'),
           replace = require('gulp-replace');

gulp.task('convert', () => {
  return gulp.src('your-src')
    .pipe(replace('UTF-8', 'Shift_JIS'))
    .pipe(convertEncoding({to: 'Shift_JIS'}))
    .pipe(gulp.dest('your-dist'));
});


```

## それでも上手くいかない ?

まれにこのタスクでエンコードできない文字列が存在します。おそらく`?` という悲しい結果になっていると思います。UTF-8 では存在するが Shift_JIS では存在しない文字列などの場合にこうなるみたいです。これはもう手作業で対応するしかないので、初めからその文字列を数値実体参照して開発を進めていくことにしています。

変換はこちら。

- [HTML数値文字参照変換（文字実体参照一覧付き） | 遠近遊園](http://ochikochi.com/tool/character/)

おわります。
