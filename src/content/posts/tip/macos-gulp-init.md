---
id: 841
type: tip
slug: "macos-gulp-init"
title: "デザイナーがMacOSで「gulp.js」を動かせるようになるまでと、タスクとテンプレートファイルβ版の配布 -『front-end』"
date: 2016-12-27T15:26:05+09:00
modified: 2018-01-22T15:04:16+09:00
excerpt: "Sassを使ったCSS記述の効率化や圧縮、JavaScriptファイルのES6での記述と圧縮、ブラウザでのリアルタイムプレビュー等をタスクランナーgulp.js(ガルプ)を使って実現します。 gulpをインストールした際"
primaryTag: "gulp"
terms:
  - { id: 238, name: "frontend", slug: "frontend" }
  - { id: 215, name: "gulp", slug: "gulp" }
demoUrl: https://github.com/uto-usui/template_1.0.0
legacy:
  prev: wordpress-body-class
  next: css-ellipsis-mixin
---

Sassを使ったCSS記述の効率化や圧縮、JavaScriptファイルのES6での記述と圧縮、ブラウザでのリアルタイムプレビュー等をタスクランナーgulp.js(ガルプ)を使って実現します。

gulpをインストールした際にすぐ使いたいタスクとテンプレートファイルをgithubに公開しました。拙いβ版ですが自由に使ってもらえるといいかなと思います。

- [template_1.0.0 / github](https://github.com/uto-usui/template_1.0.0)

## gulpはデザイナーにも必要なタスクランナーに

フロントエンドではそういった**web制作に必要な処理を自動化するツールを総称して「タスクランナー」や「ビルドシステム」と呼んで**います。それを使って時短を図ろう、というのが昨今のフロントエンド事情で、その中でも勢いがあるのがgulpで、デザイナーにもそれを扱うスキルを求められているのかなあという空気感を感じています。

gulpの特徴はというと、

- 必要な処理を行うためのモジュール(プラグイン)をインストールしてnpmで管理
- 処理内容をJavaScriptで記述
- タスクとしてまとめた処理を非同期(並列)で高速に処理

検索すると「導入は簡単○」という記事をよく見かけるのですが、実際は環境によるところもあり、デザイナーが誰でもできるというレベルのものではないのかなあ、という印象です。\
なので、煮詰まった部分や情報がなくて困ったところなどをまとめておきます。

環境はMacOSでターミナルでの作業になります。ターミナル初心者の方は戸惑うと思いますが、わからないエラーとか、何のこっちゃに陥った時は、**google翻訳にエラー内容をコピペすると大体の内容を把握できる**ので、それを元に解決するなりググるなりすれば問題ないかと思います。

## gulpのインストールの準備

gulpをインストールする前に、処理のために必要なものをインストールしていきます。インストールの際に、パスワードを求められますが、システム(PCにログインするときの)パスワードを入力します。

### ターミナルの起動

「アプリケーション / ユーティリティ / ターミナル.app 」このディレクトリをたどってターミナルを起動します。掲載しているコードをコピペして`return`してください。

### Ruvyのインストールの確認

MacにはデフォルトでRuvyがインストールされていますが、一応確認します。

```
ruby -v

```

### Sassのインストール

「SCSS >>> CSS」といったようにコンパイルしたいので、sassをインストールしておきます。

```
sudo gem install sass

```

### gemをアップデートする

```
sudo gem update --system

```

### Sassをアップデート

```
sudo gem update sass

```

#### 上手くいかない場合は

```bath

sudo gem install -n /usr/local/bin sass


```

### Command Line Developer Toolsをインストール

El Capitan環境で、次に行いたいcompassのインストールができないことがありました。これはcompassをインストールする場所をMacがガードしてるらしく、「そこに変更加えても大丈夫なようなわたしは開発者ですけどね」というのを伝えるべくCommand Line Developer Toolsというものをインストールします。

```
sudo xcode-select --install

```

#### ライセンスに同意

```
sudo xcodebuild -license

```

### compassをインストール

sassのコンパイル時にcompassを利用すると何かと便利(いろいろ関数とかもらえる)なのです。

```
sudo gem install -n /usr/local/bin compass

```

### Node.jsをインストール

gulpにはnode.jsが必須なので、インストールします。node.jsをインストールすると、npmコマンドが使えるようになります。

- [node.js バージョン6.9.2 (2016/12/10)](http://nodejs.org/)

以下のコードでバージョンが表示されたらインストールは完了です。

```
npm -v

```

## gulpのインストール

### プロジェクトにファイルを設置

gulpのインストールに必要な関連ファイルをディレクトリに設置します。

「[ここから必要なファイル](https://github.com/uto-usui/template_1.0.0)」をダウンロードしてください。

- dist
- src
- .babelrc
- .csscomb.json
- .eslintrc
- config.rb
- gulpfile.babel.js
- package.json

### gulpをグローバルにインストール

どの場所にいてもgulpコマンドが使えるようにgulpをグローバルインストールします。

```
sudo npm install -g gulp-cli

```

### gulpと関連ファイルをpackage.jsonをnpmで参照してインストール

gulpをインストールしたいディレクトリに移動します。

```
cd your/directry/name

```

`cd` とディレクトリを入力すると、ターミナルで、そのディレクトリの階層へ移動することができます。階層を確認するには`ls`を入力します。

```
ls

```

入力すると、gulpを導入したい現在のディレクトリの中身が表示されます。

```

README.md    document    package.json
config.rb    gulpfile.babel.js  src
dist         .csscomb.json  .eslintrc


```

プロジェクトのディレクトリに移動したら、npmを利用してpacage.jsonに記述した内容をインストールします。

```
sudo npm install

```

## gulpの実行

- [タスク実行用のファイル](https://github.com/uto-usui/template_1.0.0)

`gulp`とコマンド入力すると、`default`として登録されているタスクが実行されます。

```
gulp

```

上記ファイルを実行すると、ブラウザが立ち上がり、ejs / scss / jsファイルの変更を補足してscrからdistディレクトリにコンパイルします。今回用意したgulpfileはES6記法で記述しているのでファイル名が「gulpfile.babel.js」になっています。以下にタスクの内容を掲載しておきます。

#### gulpfile.babel.js

```

/**
 * Create paths and import packages
 *
 * いろんなところにパスを通す。
 * パッケージを読み込む。
 *
 */
const gulp = require('gulp'),

      //
      // path
      // - - - - - - - - - -
      docs = '.',
      //
      distDir =  docs + '/dist',
      srcDir =  docs + '/src',
      //
      srcAssetsDir = srcDir + '/assets',
      distAssetsDir = distDir + '/assets',
      //
      srcPath = {
        'imgPath': srcAssetsDir + '/images',
        'sassPath': srcAssetsDir + '/sass',
        'cssPath': srcAssetsDir + '/css',
        'jsPath': srcAssetsDir + '/js'
      },
      distPath = {
        'imgPath': distAssetsDir + '/images',
        'sassPath': distAssetsDir + '/sass',
        'cssPath': distAssetsDir + '/css',
        'jsPath': distAssetsDir + '/js'
      },

      //
      // common
      // - - - - - - - - -
      plumber = require('gulp-plumber'), // error escape
      rename = require('gulp-rename'), // rename
      sourcemaps = require('gulp-sourcemaps'), // sourcemap
      gulpSequence = require('gulp-sequence'), // sequence
      notify = require('gulp-notify'), // alert
      watch = require("gulp-watch"),  // watch
      del = require('del'), // delete
      fs = require('graceful-fs'), // JSON load
      cache = require('gulp-cached'), // cache

      //
      // CSS
      // - - - - - - - - -
      autoprefixer = require('gulp-autoprefixer'), // prefix
      sass = require('gulp-compass'), // Sass compass
      csscomb = require('gulp-csscomb'), // css
      cssmin = require('gulp-cssmin'), // css min
      frontnote = require('gulp-frontnote'), // style guide

      //
      // JavaScript
      // - - - - - - - - -
      uglify = require('gulp-uglify'), // js min
      babel = require('gulp-babel'), // es6
      concat = require('gulp-concat'), // concat ... order.JSON
      eslint = require('gulp-eslint'), // eslint

      //
      // HTML
      // - - - - - - - - -
      ejs = require('gulp-ejs'), // ejs template
      minifyHtml = require('gulp-minify-html'), // html min
      browser = require('browser-sync'), // browser start

      //
      // image
      // - - - - - - - - -
      imagemin = require('gulp-imagemin'), // image min
      pngquant = require('imagemin-pngquant');


/**
 * Start the server
 *
*/
gulp.task('browser', () => {
  browser({ server: { baseDir: distDir + '/' } });
});


/**
 * CSS task
 *
 * Convert Sass (SCSS) to CSS. (Compass)
 * Generate a style guide.(frontnote)
 * Execute autoprefixer.
 * Format the order of CSS properties.
 * Save it temporarily, compress it, rename it, resave it.
 * Reload the browser.
 *
 * Sass(SCSS)をCSSに変換する。(compass)
 * スタイルガイドを生成する。(frontnote)
 * autoprefixerを実行する。
 * CSSプロパティの並び順を整形する。
 * 一時保存して、圧縮して名前を変更して、再保存。
 * ブラウザを再起動する。
 *
*/
gulp.task('sass', () => {
  gulp.src(srcPath.sassPath + '/**/*.scss')
    .pipe(plumber({ errorHandler: notify.onError('<%= error.message %>') }))
    .pipe(frontnote({
      out: srcPath.cssPath,
      css:  './main.css'
    }))
    .pipe(sass({
      config_file: 'config.rb',
      sass: srcPath.sassPath,
      css: srcPath.cssPath,
      image: srcPath.imgPath
    }))
    .pipe(autoprefixer({
      browsers: ['last 2 version', 'iOS >= 8.1', 'Android >= 4.4.4'],
      cascade: false
    }))
    .pipe(csscomb())
    .pipe(gulp.dest(distPath.cssPath + '/'))
    .pipe(cssmin())
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest(distPath.cssPath + '/'))
    .pipe(browser.reload({ stream: true }))
    .pipe(notify('css task finished'));
});


/**
 * JavaScript task
 *
 *
 * Check the script with ESLint.
 * Compile the ES 2015 notation to ES 5 with babel, save it after renaming.
 * Join scripts in the order specified by JSON and save them.
 * Compress the combined script, output the source map and save.
 * Reload the browser.
 *
 * ESLintでスクリプトをチェックする。
 * babelでES2015記法をES5にコンパイルしてリネーム後、保存する。
 * JSONで指定した順番にスクリプトを結合して保存する。
 * 結合したスクリプトを圧縮し、ソースマップを出力して保存。
 * ブラウザを再起動する。
 *
*/
let jsJson = JSON.parse(fs.readFileSync(srcPath.jsPath + '/order.json')),
    jsList = [],
    cutLength;
for (let i = 0; i < jsJson.order.length; i++) {
  jsList[i] = srcPath.jsPath + jsJson.order[i];
}
//
gulp.task('js.babel', () => {
  return gulp.src(srcPath.jsPath + '/**/*babel.js')
    .pipe(plumber({ errorHandler: notify.onError('<%= error.message %>') }))
    .pipe(eslint({useEslintrc: true}))
    .pipe(eslint.format())
    .pipe(eslint.failAfterError())
    .pipe(babel())
    .pipe(rename(function (Path) {
       cutLength = Path.basename.length - 6;
       Path.basename = Path.basename.slice(0, cutLength);
    }))
    .pipe(gulp.dest(srcPath.jsPath + '/babel/'))
});
gulp.task('js.concat', () => {
  return gulp.src(jsList.join(',').split(','))
    .pipe(plumber({ errorHandler: notify.onError('<%= error.message %>') }))
    .pipe(concat('index.js'))
    .pipe(gulp.dest(distPath.jsPath + '/'))
});

gulp.task('js.uglify', () => {
  return gulp.src(distPath.jsPath + '/index.js')
    .pipe(plumber({ errorHandler: notify.onError('<%= error.message %>') }))
    .pipe(sourcemaps.init())
    .pipe(uglify({preserveComments: 'some'}))
    .pipe(sourcemaps.write())
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest(distPath.jsPath + '/'))
    .pipe(browser.reload({ stream: true }))
    .pipe(notify('js task finished'));
});
//
gulp.task('js', function(callback) {
  gulpSequence('js.babel', 'js.concat', 'js.uglify')(callback)
});


/**
 *
 * Create common objects that can be used within ejs.
 * Change the extension to html.
 * Compress and save html.
 * Reload the browser.
 *
 * ejs内で利用出来る共通のオブジェクトを作成。
 * htmlに拡張子を変更する。
 * htmlを圧縮して保存。
 * ブラウザを再起動する。
 *
*/
gulp.task('ejs.init', () => {
  return gulp.src([srcDir + '/**/*.ejs','!' + srcDir + '/**/*_*.ejs'])
    .pipe(plumber({ errorHandler: notify.onError('<%= error.message %>') }))
    .pipe(ejs({data: JSON.parse(fs.readFileSync(srcDir + '/common/' + 'data.json'))}))
    .pipe(minifyHtml())
    .pipe(rename({extname: '.html'}))
    .pipe(gulp.dest(distDir + '/'))
    .pipe(notify('html task finished'));
});
//
gulp.task('ejs.reload', ['ejs.init'], () => {
  return browser.reload();
});
//
gulp.task('ejs', ['ejs.init', 'ejs.reload']);


/**
 *
 * Compress and save the image.
 * Reload the browser.
 *
 * 画像を圧縮して保存。
 * ブラウザを再起動する。
 *
*/
gulp.task('images.min', () => {
  return gulp.src(srcPath.imgPath + '/**/*.{png,jpg,gif,svg}')
    .pipe(plumber({ errorHandler: notify.onError('<%= error.message %>')}))
    //.pipe(cache( imagemin( [pngquant({quality: '60-80', speed: 1})] )))
    .pipe(gulp.dest(distPath.imgPath + '/'))
});
//
gulp.task('images.reload', ['images.min'], () => {
  return browser.reload();
});
//
gulp.task('images', ['images.min', 'images.reload']);


/**
 * dafault task
 *
*/
gulp.task('default', ['browser'], () => {
  watch([srcPath.jsPath + '/**/*.js', '!' + srcPath.jsPath + '/babel/**/*.js'], () => { gulp.start(['js']) });
  watch([srcPath.sassPath + '/**/*.scss'], () => { gulp.start(['sass']) });
  watch([srcDir + '/**/*.ejs'], () => { gulp.start(['ejs']) });
  watch([srcPath.imgPath + '/**/*.{png,jpg,gif,svg}'], () => { gulp.start(['images']) });
});


/**
 * Clean up the file for release
 *
*/
gulp.task('copy', () => {
  gulp.src(distDir + '/**/*')
    .pipe(gulp.dest('release/01'));
});

gulp.task('delete', () => {
  gulp.src('release/01')
    del(['release/**/*.LCK', 'release/**/*_notes', 'release/**/Templates/']);
});



```

というようなgulpにおこなって欲しい処理(タスク)をずらっと記述しています。

## その他コマンド

gulpを利用する上で良く使うコマンドです。

### モジュールのインストール

```
npm install --save-dev モジュール名

```

### モジュールのアンインストール

```
npm uninstall --save-dev モジュール名

```

### モジュール一覧の確認

```
npm list --depth=0

```

### npmのアップデート

```
sudo npm update -g

```

おわります。
