---
id: 969
type: tip
slug: "macos-full-path-finder-head"
title: "MacOSを便利に。Finderのタイトルバーにファイルのフルパスを表示する。 -『Mac』"
date: 2017-02-02T11:55:58+09:00
modified: 2017-02-18T03:22:40+09:00
excerpt: "MacOSのFinderの画面の最上部のタイトルバー部分に、現在表示しているファイルのフルパスを表示する方法です。 Finderのタイトルバーにフォルダのフルパスを表示 通常Finderのウインドウの最上部に現在表示して"
primaryTag: "mac"
terms:
  - { id: 53, name: "mac", slug: "mac" }
  - { id: 54, name: "terminal", slug: "terminal" }
legacy:
  prev: squarespace-logo
  next: textwrangler
---

MacOSのFinderの画面の最上部のタイトルバー部分に、現在表示しているファイルのフルパスを表示する方法です。

## Finderのタイトルバーにフォルダのフルパスを表示

通常Finderのウインドウの最上部に現在表示しているフォルダの名前が表示されます。フォルダのフルパスを表示できた方が、階層がわかってファイルの位置が把握しやすく便利なので、ターミナルから設定します。

#### terminal

```
defaults write com.apple.finder _FXShowPosixPathInTitle -boolean true

```

のあと、Finderを再起動します。

```
killall Finder

```

もとの仕様に戻したいときは、

```
defaults delete com.apple.finder _FXShowPosixPathInTitle

```

のあと、Finderを再起動します。

```
killall Finder

```

おわります。
