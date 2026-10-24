---
id: 1165
type: tip
slug: "mac-tree"
title: "ターミナルで任意のフォルダをツリー表示する「tree」-『mac』"
date: 2017-02-24T19:56:14+09:00
modified: 2017-02-24T21:46:15+09:00
excerpt: "任意のファイル内のディレクトリ構造をツリーで記述するために、ターミナルから「tree」を実行してツリー構造を表示させてコピペするtipsです。 ツリー構造を表示するための「tree」の導入 「tree」をインストールする"
primaryTag: "mac"
terms:
  - { id: 53, name: "mac", slug: "mac" }
  - { id: 54, name: "terminal", slug: "terminal" }
  - { id: 80, name: "tool", slug: "tool" }
legacy:
  prev: textwrangler
  next: static-random-gradation-color-for-updating-random-values-at-compile-time
---

任意のファイル内のディレクトリ構造をツリーで記述するために、ターミナルから「tree」を実行してツリー構造を表示させてコピペするtipsです。

## ツリー構造を表示するための「tree」の導入

「tree」をインストールする前に、導入していない場合はパッケージマネジャーの「homebrew」をインストールします。

### パッケージマネジャー「homebrew」をインストール

パッケージマネジャー「homebrew」については以下のところでどんなものか解説されています。

#### homebrewとは

- [homebrew](https://brew.sh/index_ja.html)
- [homebrewとは何者か。仕組みについて調べてみた – Qiita](http://qiita.com/omega999/items/6f65217b81ad3fffe7e6)

では、ターミナルに入力します。

#### terminal

```
/usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"

```

インストールしたらバージョンチェックして確認します。

```
brew -v

```

### 「tree」をインストール

「homebrew」の導入が済めば、「tree」をターミナルからインストールします。

```
brew install tree

```

## ツリー構造を表示するために「tree」を実行

ターミナルでコマンドを入力するとカレントディレクトリ以下のツリー構造を表示することができます。

```
tree

```

例えば、プラグイン[slick](https://github.com/kenwheeler/slick/)のダウンロードしたディレクトリで実行すると、

```

.
├── CONTRIBUTING.markdown
├── ISSUE_TEMPLATE.md
├── LICENSE
├── Makefile
├── README.markdown
├── bower.json
├── component.json
├── slick
│   ├── ajax-loader.gif
│   ├── config.rb
│   ├── fonts
│   │   ├── slick.eot
│   │   ├── slick.svg
│   │   ├── slick.ttf
│   │   └── slick.woff
│   ├── slick-theme.css
│   ├── slick-theme.less
│   ├── slick-theme.scss
│   ├── slick.css
│   ├── slick.js
│   ├── slick.less
│   ├── slick.min.js
│   └── slick.scss
└── slick.jquery.json



```

このように表示されます。

おわります。
