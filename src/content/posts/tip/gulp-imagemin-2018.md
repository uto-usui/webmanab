---
id: 2206
type: tip
slug: "gulp-imagemin-2018"
title: "Gulpで画像圧縮を簡単に自動化するタスクの2018年版 – 『Gulp』"
date: 2018-02-01T22:49:54+09:00
modified: 2018-02-01T22:52:23+09:00
excerpt: "タスクランナーの gulp.js を利用して、画像の圧縮をコマンドひとつで自動化します。2018年版ということで、Node.js の v9.4.0 を利用する現時点の最新な環境でのはなしです。Node.js は node"
primaryTag: "gulp"
terms:
  - { id: 238, name: "frontend", slug: "frontend" }
  - { id: 215, name: "gulp", slug: "gulp" }
legacy:
  prev: terminal-alias
  next: low-polygon-art
---

タスクランナーの [gulp.js](https://gulpjs.com/) を利用して、画像の圧縮をコマンドひとつで自動化します。2018年版ということで、[Node.js](https://nodejs.org/ja/) の v9.4.0 を利用する現時点の最新な環境でのはなしです。Node.js は [nodebrew](https://github.com/hokaccha/nodebrew) でバージョン管理しつつインストールしてください。 [Yarn](https://yarnpkg.com/ja/) がインストールされていることも前提とします。

- [nodebrewでnode.jsのバージョン管理をする -『front-end』 – webmanab.html／ウェブまなぶ](/tip/nodebrew-manage-nodejs/)

## ファイルを用意する

以下のようなディレクトリ構造でファイルを用意します。

```bath

 ├── dist
 ├── src
 ├── package.json
 └── gulpfile.babel.js


```

`src` 以下のディレクトリに圧縮前の画像、 `dist` に圧縮後の画像が保存されることになります。

## 必要なパッケージをインストール

圧縮に必要なパッケージを `package.json` からインストールするので、以下の記述をして設置します。

#### package.json

```json

{
  "name": "imagesComp",
  "version": "1.0.0",
  "devDependencies": {
    "babel-register": "^6.26.0",
    "gulp": "^3.9.1",
    "gulp-changed": "^3.2.0",
    "gulp-imagemin": "^4.1.0",
    "gulp-notify": "^3.2.0",
    "imagemin-mozjpeg": "^7.0.0",
    "imagemin-pngquant": "^5.0.1"
  },
  "scripts": {
    "images": "gulp images"
  },
  "author": "uto usui",
  "license": "ISC",
  "description": "Task to compress images"
}


```

### 圧縮するためのパッケージ

[gulp-imagemin](https://www.npmjs.com/package/gulp-imagemin) が圧縮に必要なパッケージで、[imagemin-mozjpeg](https://www.npmjs.com/package/imagemin-mozjpeg) と [imagemin-pngquant](https://www.npmjs.com/package/imagemin-pngquant) は、圧縮率を高めるのに必要なプラグインです。

### その他のパッケージ

[gulp-changed](https://www.npmjs.com/package/gulp-changed) は、変更された画像だけを抽出して圧縮するために、`src` と `dist` を比較するのに必要なパッケージで、 [gulp-notify](https://www.npmjs.com/package/gulp-notify) はタスク終了を知らせるのに利用します。

### npm(yarn) からコマンドを叩けるように

`scripts` には、Gulp のコマンドを定義しています。こうしておくと`npm run images` もしくは、`yarn run images` でコマンドを走らせることができるので、Gulp をグローバルにインストールすることが不要になります。

### インストール

`package.json` に記述した内容をインストールします。

#### terminal

```bath

sudo yarn


```

## タスクを定義

`gulpfile.babel.js` に画像を圧縮するためのタスクを定義します。

#### gulpfile.babel.js

```js

/**
 *
 * ディレクトリ
 *
 ├── dist
 ├── gulpfile.babel.js
 ├── package.json
 └── src
 */
const gulp = require('gulp'),
      docs = '.',
      distDir =  docs + '/dist',
      srcDir =  docs + '/src',
      imagemin = require('gulp-imagemin'),
      pngquant = require('imagemin-pngquant'),  // 圧縮率を高めるのにプラグインを入れる png
      mozjpeg = require('imagemin-mozjpeg'),  // 圧縮率を高めるのにプラグインを入れる jpg
      changed = require('gulp-changed'),
      notify = require('gulp-notify');
/**
 *
 * Compress and save the image.
 * Reload the browser.
 *
 * 画像を圧縮して保存。
 * ブラウザを再起動する。
 *
 */
gulp.task('images', () => {
  return gulp.src(srcDir + '/**/*.{png,jpg,gif,svg}')
    .pipe(changed(distDir))  // src と dist を比較して異なるものだけ処理
    .pipe(imagemin([
      pngquant({
        quality: '65-80',  // 画質
        speed: 1,  // 最低のスピード
        floyd: 0,  // ディザリングなし
      }),
      mozjpeg({
        quality: 85, // 画質
        progressive: true
      }),
      imagemin.svgo(),
      imagemin.optipng(),
      imagemin.gifsicle()
    ]))
    .pipe(gulp.dest(distDir))  // 保存
    .pipe(notify('🍣 images task finished 🍣'));
});


```

詳細はソースのコメントアウトにざっくりと書き込んだので、参考にしてください。

## コマンドを実行する

環境の準備はできたので、`src` ディレクトリに画像を格納してコマンドを実行します。

#### terminal

```bath

yarn run images


```

すると、

```bath

Requiring external module babel-register
Using gulpfile ~/dir/gulpfile.babel.js
Starting 'images'...
gulp-imagemin: Minified 1 image (saved 2.55 MB - 94.2%)
gulp-notify: [Gulp notification] 🍣 images task finished 🍣
Finished 'images' after 744 ms


```

こんな感じで画像が圧縮できました。

おわります。
