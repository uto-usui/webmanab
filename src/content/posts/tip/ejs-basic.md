---
id: 678
type: tip
slug: "ejs-basic"
title: "コーディング環境を効率化できるテンプレートエンジン「EJS」の基本的な使い方 -『front-end』"
date: 2016-11-10T18:44:50+09:00
modified: 2017-02-14T21:01:24+09:00
excerpt: "EJSはテンプレートエンジンと呼ばれるすごく便利なツールで、JavaScriptのような書き方を取り入れてHTMLを効率的に書くことができるという特徴があります。EJSをコンパイルしてHTMLに変換するので、SassとC"
primaryTag: "ejs"
terms:
  - { id: 217, name: "ejs", slug: "ejs" }
  - { id: 238, name: "frontend", slug: "frontend" }
  - { id: 216, name: "html", slug: "html" }
  - { id: 29, name: "javascript", slug: "javascript" }
legacy:
  prev: frontnote
  next: slack-idea
---

EJSはテンプレートエンジンと呼ばれるすごく便利なツールで、**JavaScriptのような書き方を取り入れてHTMLを効率的に書くことができる**という特徴があります。EJSをコンパイルしてHTMLに変換するので、SassとCSSのような関係だと考えるとわかりやすくて、同じように使い始めると有用性がすぐにわかります。たとえば**共通部分をパーツとしてファイルを分割**していくことや、**JavaScriptのループをHTML上で使う**ことで記述を短縮してコーディングの時短を図ることができます。

## テンプレートエンジン「EJS」のことはじめ

HTMLを制作する際の「テンプレート」といえば、Dreamweaverのテンプレート機能などを使用している方も多いと思いますが、少しの学習コストで機能的にEJSのほうがたくさんのことができるし、変数やループや条件分岐など、JavaScriptのように扱えるところが魅力的です。

EJSをHTMLにコンパイル(変換)するにはタスクランナーのgulpのプラグイン「[gulp-ejs](https://www.npmjs.com/package/gulp-ejs)」利用するのが便利です。

### EJSをgulpでコンパイルする

gulp-ejsをインストールして、gulpfile.jsに処理を記述していきます。

ハマってしまうポイントとしてはコンパイル時にデフォルトでは拡張子が変わらないことです。これは最近のバージョンからの仕様らしいのですが、オプションを渡して解決するのですが、ちょっとややこしいので、わかりやすくgulp-renameプラグインで拡張子を変更することで対応します。

#### terminal

```

npm install --save-dev gulp-ejs
npm install --save-dev gulp-rename


```

#### gulpfile.js

```

var srcDir = 'your/src/dir' // 任意のディレクトリ
var distDir = 'your/dist/dir' // 任意のディレクトリ

var ejs = require('gulp-ejs');
var rename = require('gulp-rename');

gulp.task('ejs',function(){
  gulp.src([srcDir + '/**/*.ejs','!' + srcDir + '/**/*_*.ejs'])
    .pipe(ejs())
    .pipe(rename({extname: '.html'}))
    .pipe(gulp.dest(distDir + '/'))
});


```

#### コンパイルの処理の流れ

1. 処理するファイルと処理しないファイルを指定、コンパイルしたくないファイルの先頭に`_`アンダーバーのプレフィクスをつけて判別。
2. gulp-ejsの実行
3. 拡張子を.htmlに変更
4. コンパイル、リネームしたデータをコンパイル先に保存

2.の`_`でプレフィクスを付与するのは、共通パーツのファイルに`_`をつけてHTMLにコンパイルしないようにするのが目的です。

ぼくの場合は上記の他に、コンパイル時にアラートを出したり、プレビューしているブラウザをリロードしたり、htmlを圧縮したり、エラー時にgulpが停止しないようにしておいたり、、、という処理も同時に行っていますが、今回は最低限の記述にしておきます。

## EJSの基本 <% %>のいろいろな使い方

EJSでは基本的には普通のHTMLとして記述することができます。EJSの機能を使いたい箇所には`<% %>`というタグの中に処理などを記述する必要があります。

### <% %>

この中`<% %>`ではJavaScriptが使えるようになります。この状態だとHTMLには何も出力されません。

#### EJS

```
<% var test = 'EJS! EJS! EJS!'; %>

```

### <%= %>と<%- %>

`<%= %>`と`<%- %>`は記述した変数などをhtmlとして出力します。`<%= %>`は`<`と`>`をエスケープするのでhtml要素を吐き出すことができません。html要素を出力したい場合は`<%- %>`を利用します。**`<%= %>`は文字列用**、**`<%- %>`はHTML用**というように使い分けます。

#### EJS

```

<% var test = 'EJS! EJS! EJS!'; %>
<% var testHtml = '<strong>EJS! EJS! EJS!</strong>'; %>

<%
  var meta = {
    title: 'special page title',
    desc: 'This is my favorite page.',
    ogp: {
      title: this.title,
      desc: this.desc,
      url: 'http://my-special-url.com'
    }
  };
%>

<p><%= test %></p>
<p><%- testHtml %></p>

<title><%= meta.title %> | site title</title>


```

#### html

```

<p>EJS! EJS! EJS!</p>
<p><strong>EJS! EJS! EJS!</strong></p>

<title>special site title</title>


```

オブジェクトとして値を管理するようにしておくことで、整理整頓がはかどりますね。

### <%# %>

EJSのファイル内だけで扱いたいコメントアウトは`<%# %>`の中に記述します。HTMLには出力されません。

```
<%# これはHTMLに出力されないコメント %>

```

## include()関数

**`include()`を利用することで、別のEJSファイルを読み込む**ことができます。これで共通部分を外部化して使い回すことで、編集修正を簡単にすることができます。第一引数には読み込みたいEJSファイルへの**自ファイルからの相対パスを拡張子を省略して**指定します。第二引数にはそのEJSファイルに渡したい**パラメータをキーにしたオブジェクト**を記述します。

ここでは`<head>`内の要素をテンプレート化しておいて、ページごとに変更できるようにしてみます。

#### index.ejs

```

<%
  var myMeta = {
    title: 'special page title',
    desc: 'This is my favorite page.'
  };
%>
<%- include('common/_head', {meta: myMeta}) %>


```

#### \_head.ejs

```

<head>
  <title><%= meta.title %> | site title</title>
  <meta name="description" content="<%= meta.desc %>">
</head>


```

このままだと、読み込む側の親ファイルに値がセットされていない場合エラーになるので、子ファイルに条件分岐して初期値をセットしておきます。

#### \_head.ejs

```

<%
  if (typeof meta === 'undefined') {
    var meta = {
      title:'default',
      desc:'default'
    };
  }
%>


```

### 簡単なループ for文

単純なループには`for`文で記述します。

```

<ul>
  <% for (var i = 0; i < 5; i++) { %>
  <li>item<%= i+1 %></li>
  <% } %>
</ul>


```

### 配列を取り出す forEach

配列の中身を順番に取り出すには`forEach`を利用します。

```

<ul>
  <% var array = ['aaa', 'bbb', 'ccc', 'ddd', 'eee']; %>
  <% array.forEach(function (value) { %>
  <li><%= value %></li>
  <% }); %>
</ul>


```

## 条件分岐 if文

JavaScriptのif/else文を使うことができます。これも子ファイルに条件分岐を記述しておいて親のパラメータに応じて分岐させるようにしておくといろいろと拡張できます。

```

<%
  var page = {
    id: '05'
  }
%>
<% if (page.id === '01') { %>
<p id="page01">page ID : 01</p>

<% } else if (page.id === '02') { %>
<p id="page02">page ID : 02</p>

<% } else { %>
<p>page not found</p>
<% } %>


```

### 関数で処理やhtmlをひとまとめに

条件分岐と関数を組み合わせると記述を簡潔にできます。条件によって出力するHTMLが長くなるときは関数にまとめておき、それを条件ごとに実行してテンプレートの内容と条件分岐を分離させてコードをクリーンにしておきます。

関数にしておくことで、処理が似通っている場合は条件分岐で引数だけ変えて実行するような方法もよく使います。

#### ejs

```

<% var mugiwara = function(name, profile){ %>
  <ul class="profile profile--<%= name %>">
    <% profile.forEach(function (data) { %>
      <li class="profile_list"><%= data %></li>
    <% }); %>
  </ul>
<% }; %>

<%- mugiwara('nami', ['2人目', '20歳', '♀', '魔法の天候棒']); %>


```

おわります。
