---
id: 949
type: tip
slug: "javascript-eslint-gulp"
title: "きれいなJSを書きたい。JavaScriptのスタイルを管理するためのES6に対応したESLintの使い方 -『javascript』"
date: 2017-01-23T19:51:58+09:00
modified: 2017-02-13T02:09:47+09:00
excerpt: "ESLintは、JavaScriptをより綺麗で一貫性のあるルールとスタイルで書くための構文チェックツールです。構文チェックツールを使用することで、どうすれば美しいコードが実現するのか、考えるきっかけや勉強になるので、J"
primaryTag: "javascript"
terms:
  - { id: 29, name: "javascript", slug: "javascript" }
  - { id: 80, name: "tool", slug: "tool" }
legacy:
  prev: google-anlytics-invalidate-my-access-by-specifying-an-ip-address
  next: url-query-action
---

ESLintは、JavaScriptをより綺麗で一貫性のあるルールとスタイルで書くための構文チェックツールです。構文チェックツールを使用することで、どうすれば美しいコードが実現するのか、考えるきっかけや勉強になるので、JavaScript初学者の次のステップには導入しておきたいツールだとおもいます。

JavaScriptの構文チェックツールは他に、「JSHint」「JSLint」「JSCS」などがあり、ESLintの特徴としては、項目が豊富に用意されていて、それをルールとして自由に選択できるようになっています。そしてルールごとにアラートの強さを設定することができ、プロジェクトに合わせたルールを作りやすくなっています。

## ES6に対応したESLintをgulpで扱う環境をつくる

タスクランナーのgulp.jsで、ES6で記述されているスクリプトをbabelでコンパイルする前にESLintを実行する環境を構築します。

gulp環境の構築はこちらを参照してください。

- [デザイナーがMacOSでgulpを動かせるようになるまでと、タスクとテンプレートファイルβ版の配布 -『gulp』](/tip/macos-gulp-init/)

### 必要なパッケージをインストール

プロジェクトのルートに「gulp-eslint」をインストールします。

#### terminal

```
npm i -D gulp-eslint

```

babelを扱うのでパーサーとして「babel-eslint」が必要になるので、これもインストールします。

#### terminal

```
npm i -D babel-eslint

```

gulpfile.jsには以下のように記述します。

#### gulpfile.js

```

var plumber = require('gulp-plumber');
var notify = require('gulp-notify');
var babel = require('gulp-babel');
var rename = require('gulp-rename');

var eslint = require('gulp-eslint');

gulp.task('js', function(){
  gulp.src(scriptPath)
    .pipe(plumber({
      errorHandler: notify.onError('Error: <%= error.message %>')
    }))
    .pipe(eslint({useEslintrc: true}))
    .pipe(eslint.format())
    .pipe(eslint.failAfterError())
    .pipe(babel())
    .pipe(rename(function (path) {
       var cutLength = path.basename.length - 6;
       path.basename = path.basename.slice(0, cutLength);
    }))
    .pipe(gulp.dest(jsPath + '/babel/'));
});


```

エラーを出力するのに「gulp-notify」、スクリプトを常に実行するために「gulp-plumber」、babelを実行するのに「gulp-babel」、コンパイル後にファイル名を変更するのに「gulp-rename」を使用しています。`gulp js`とターミナルでコマンドを入力するとタスクが実行され、コンパイルされます。

- [gulp-eslint](https://www.npmjs.com/package/gulp-eslint)
- [babel-eslint](https://github.com/babel/babel-eslint)
- [gulp-plumber](https://www.npmjs.com/package/gulp-plumber)
- [gulp-notify](https://www.npmjs.com/package/gulp-notify)
- [gulp-babel](https://www.npmjs.com/package/gulp-babel)
- [gulp-rename](https://www.npmjs.com/package/gulp-rename)

### 設定ファイル.eslintrcをつくる

ESLintの特徴はチェックする内容を柔軟にカスタマイズできることですが、その設定ファイル「.eslintrc」を作成しプロジェクトルートに設置します。ここに記述されたJSONの内容で、環境やルールの追加・変更などができるようになります。

具体的なルールや項目についてはここに詳細に解説されています。

- [List of available rules – ESLint](http://eslint.org/docs/rules/)

#### .eslintrc

```

{
  "parser": "babel-eslint",
  "extends": "eslint:recommended",
  "env": {
    "browser": true,
    "node": true,
    "jquery": true,
    "es6": true
  },
  "rules": {
    "strict": 2,
    "no-console": 1,
    "quotes": ["error", "single"],
    "array-bracket-spacing": [2, "never"],
    "block-spacing": 2,
    "brace-style": 2,
    "camelcase": 2,
    "comma-spacing": [2, {"before": false, "after": true}],
    "computed-property-spacing": [2, "never"],
    "eol-last": 2,
    "func-style": [2, "expression"],
    "indent": [2, 2, { "VariableDeclarator": { "var": 2, "let": 2, "const": 3 } }],
    "key-spacing": ["error", { "mode": "strict" }],
    "lines-around-comment": 2,
    "no-multiple-empty-lines": [2, {max: 2}],
    "no-spaced-func": 2,
    "no-trailing-spaces": 2,
    "object-curly-spacing": [2, "never"],
    "padded-blocks": [2, "always"],
    "require-jsdoc": 2,
    "semi-spacing": [2, {"before": false, "after": true}],
    "keyword-spacing": [2, {"before": true}],
    "space-before-blocks": 2,
    "space-before-function-paren": [2, "never"],
    "space-in-parens": [2, "never"],
    "space-infix-ops": 2,
    "space-unary-ops": 2,
    "arrow-spacing": 2,
    "no-var": 2
  }
}


```

### 設定ファイル.eslintrcの解説

```
"extends": "eslint:recommended"

```

とすることで、ESLintのオススメの設定を呼び出しています。設定内容は [List of available rules – ESLint](http://eslint.org/docs/rules/)に記載されているチェックがついた項目になっています。ESLintは初期状態だと何もチェックしないので、ひとまずこれで最低限のルールをチェックできるようになります。これ基準にルールをカスタマイズしていきます。

- [推奨設定の日本語訳](https://gist.github.com/mysticatea/df40f5e3cdbf0e9ae618)

```
"parser": "babel-eslint",

```

「babel-eslint」をparserに指定しています。これでbabelでコンパイルすることを前提にスクリプトを記述できます。

```

"env": {
  "browser": true,
  "node": true,
  "jquery": true,
  "es6": true
}


```

`env`に記述している内容は、環境設定のようなものです。上記ではES6の記法でjQueryを使用するような環境を想定しています。ESLintは様々な環境下での使用に対応していて、特定の環境下やライブラリが読み込まれていることが前提でチェックを行うように指定しておきます。

- [Configuring ESLint – ESLint – Pluggable JavaScript linter](http://eslint.org/docs/user-guide/configuring#specifying-environments)

`rules`にルールを渡します。今回記述した内容だけになりますが、解説しておきます。

#### アラートの強さ

<dl><dt>0</dt><dd>チェックしない</dd><dt>1</dt><dd>warning (警告)</dd><dt>2</dt><dd>error (アラート)</dd></dl>

#### パラメータ

<dl><dt>array-bracket-spacing</dt><dd>配列のカッコ内の間隔</dd><dt>block-spacing</dt><dd>単一行ブロックの内側のスペースを強制</dd><dt>camelcase</dt><dd>キャメルケース記法(先頭と末尾のアンダースコア、定数のような大文字とアンダースコアは許容)</dd><dt>comma-spacing</dt><dd>カンマの前後の間隔</dd><dt>computed-property-spacing</dt><dd>計算されたプロパティの内側のパディング</dd><dt>eol-last</dt><dd>複数の空白行で、ファイルの最後に改行</dd><dt>func-style</dt><dd>関数宣言の方法</dd><dt>id-length</dt><dd>識別子の長さ</dd><dt>index</dt><dd>タブとスペース幅</dd><dt>key-spacing</dt><dd>オブジェクトのキーと値の間の間隔とスタイル</dd><dt>lines-around-comment</dt><dd>コメントの上の行を空行にする</dd><dt>no-mixed-spaces-and-tabs</dt><dd>タブとスペースを混合しない</dd><dt>no-multiple-empty-lines</dt><dd>最大改行数</dd><dt>no-spaced-func</dt><dd>関数と（）の間にスペースを禁止</dd><dt>no-trailing-spaces</dt><dd>行末の空白を禁止</dd><dt>object-curly-spacing</dt><dd>オブジェクトの中括弧内のパディング</dd><dt>padded-blocks</dt><dd>ブロック内のパディング</dd><dt>require-jsdoc</dt><dd>Docスタイルのコメント</dd><dt>semi-spacing</dt><dd>セミコロン前後のスペース</dd><dt>keyword-spacing</dt><dd>キーワードの後のスペース</dd><dt>space-before-blocks</dt><dd>ブロック前のスペース</dd><dt>space-before-function-paren</dt><dd>関数の括弧の前のスペース</dd><dt>space-in-parens</dt><dd>カッコ内のスペース</dd><dt>space-infix-ops</dt><dd>演算子の前後のスペース</dd><dt>space-return-throw-case</dt><dd><code>return</code> <code>throw</code> <code>case</code>のスペース</dd><dt>space-unary-ops</dt><dd>単項演算子前後のスペース</dd><dt>arrow-spacing</dt><dd>アロー関数の矢印の前後にスペース</dd><dt>no-var</dt><dd><code>var</code>の禁止</dd></dl>

ESLintは設定項目が多く、把握しきれないと思うので、「.eslintrc」ファイルはジェネレーターで簡単に作ってしまうのがいいかもしれません。

#### .eslintrcのジェネレーター

- [eslintrc-editor](https://pirosikick.github.io/eslintrc-editor/)

そうして「.eslintrc」ファイルを設置するとターミナルで`gulp js`を入力すれば、タスクが動くようになります。実行してエラーが出ると以下のように、行やエラー内容、そのパラメータ名がターミナルに明示されるので、場所やその内容が把握しやすくなっています。

```
3:1   error  There must be a space inside this paren  space-in-parens

```

## こんなときどうする

トラブルシューティング的なことをまとめておきます。

### グローバルの変数を宣言したいとき

別ファイルのプラグインにオプションを渡したいときなど`var`や`let`なしでグローバルの変数にアクセスしたいときがありますが、この場合エラーが出てしまいます。

対処法としては、「.eslintrc」にあらかじめ任意のグローバル変数の文字列を記述しておくことでエラーをスルーしてくれます。

```

"globals": {
  "paceOptions": true,
  "Pace": true
}


```

### ESLintでうつくしいコード

構文チェックツールESLintを使うと、一貫したルールやスタイルを共有することができ、そのルールを考える過程でどんなコードが読みやすいのか、美しいのか、と考えるきっかけになることもすごく重要だとおもいます。設定ファイルは簡単に共有・アップデートできるので、積極的にプロジェクトやリソースに合わせて検討を重ねてベターな環境をつくるといいかとおもいます。

おわります。
