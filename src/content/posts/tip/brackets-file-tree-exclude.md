---
id: 728
type: tip
slug: "brackets-file-tree-exclude"
title: "Bracketsユーザーが使いたい。「File Tree Exclude」Bracketsのプロジェクトに読み込まないファイルを指定する拡張機能の使い方 -『Brackets』"
date: 2016-11-15T21:44:55+09:00
modified: 2017-01-19T19:48:29+09:00
excerpt: "Adobe製エディタの「 Brackets 」多くのファイル数(30000くらい)のプロジェクトのフォルダを開くとエラーになるので、それを回避するために、File Tree Excludeという拡張機能を利用します。また"
primaryTag: "brackets"
terms:
  - { id: 221, name: "Brackets", slug: "brackets" }
legacy:
  prev: wordpress-excerpt-test
  next: ejs-json-object
---

Adobe製エディタの「 [Brackets](<http://File Tree Exclude>) 」多くのファイル数(30000くらい)のプロジェクトのフォルダを開くとエラーになるので、それを回避するために、**File Tree Exclude**という拡張機能を利用します。また指定によってはプロジェクトとして監視しているファイル数を大きく減らすことができるので、エディタの動作を軽快にすることができます。

## File Tree Exclude

File Tree Excludeは指定したファイルを除外してBracketsのファイルツリーを読み込んで表示してくれます。

Bracketsの環境設定を開き、除外したいファイルを`brackets.json`内に記述します。File Tree Excludeの拡張機能をインストールすると、`jwolfe.file-tree-exclude.list`という項目が記述されているのでそれを任意のものに編集します。ぼくは普段はよく`node_modules`とか`bower_components`とか`.git`などを無視するように指定しています。

#### brackets.json

```

"jwolfe.file-tree-exclude.list": [
  "node_modules",
  "bower_components",
  ".git",
  ".DS_Store",
  "/_notes/",
  ".LCK"
]


```

おわります。
