---
id: 70
type: tip
slug: "os-x-el-capitan-appear-invisible-files"
title: "OS X El Capitan ターミナルでコマンドを実行して不可視ファイルを表示する – 『mac』"
date: 2016-06-16T10:46:38+09:00
modified: 2016-06-16T11:16:53+09:00
excerpt: "Mac「OS X El Capitan 」で不可視ファイルを表示するには、ターミナルでコマンドを実行します。 不可視ファイルを表示する defaults write com.apple.finder AppleShowA"
primaryTag: "mac"
terms:
  - { id: 53, name: "mac", slug: "mac" }
  - { id: 54, name: "terminal", slug: "terminal" }
legacy:
  prev: viewport
  next: smartobject-2x
---

Mac「OS X El Capitan 」で不可視ファイルを表示するには、ターミナルでコマンドを実行します。

### 不可視ファイルを表示する

```xml

defaults write com.apple.finder AppleShowAllFiles TRUE


```

### 不可視ファイルを非表示する

```xml

defaults write com.apple.finder AppleShowAllFiles FALSE


```

上記のコマンドを実行して、Finderをリロードすると、表示／非表示を切り替えることができます。

### Finderのリロード

```xml

killall Finder


```

おわります。
