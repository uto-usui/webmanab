---
id: 2281
type: tip
slug: "webstorm-how-to-search"
title: "いろいろな爆速検索の仕方。 -『WebStorm』"
date: 2018-02-10T23:35:28+09:00
modified: 2018-02-10T23:38:38+09:00
excerpt: "WebStormでよく使う、検索周りの機能とショートカットです。マウスを触らずに、ガンガン必要なところに飛んでいきましょう。 Search Everywhere 「どこでも」 いろいろなものをまとめて検索します。 shi"
primaryTag: "webstorm"
terms:
  - { id: 269, name: "editor", slug: "editor" }
  - { id: 238, name: "frontend", slug: "frontend" }
  - { id: 80, name: "tool", slug: "tool" }
  - { id: 337, name: "webstorm", slug: "webstorm" }
legacy:
  prev: 30-seconds-of-code
  next: ssh-setting-multiple-accounts-gitlab-or-github
---

WebStormでよく使う、検索周りの機能とショートカットです。マウスを触らずに、ガンガン必要なところに飛んでいきましょう。

## Search Everywhere 「どこでも」

いろいろなものをまとめて検索します。

```bash

shift + shift


```

検索対象となるのは、

- ファイル
- クラス・メソッド
- WebStormのウインドウや機能
- preference(設定)の項目
- 定数・変数・HTMLのID/クラス・CSSセレクタ

以上のようなものです。ちょっと横着ですが、たたっとshiftを押すだけで万能に検索してくれるのは嬉しいですね。

## Action Search 「機能」

WebStormのウインドウや機能を検索します。

```bash

cmd + shift + A


```

## ファイル内

ファイル内検索のショートカットは、

```bath

cmd + f


```

もちろん正規表現が使えて、コメント内、文字列リテラル内、と限定した中での検索も可能です。

## Find in Path (ディレクトリ)

選択したディレクトリ以下を検索します。

```bash

プロジェクトツリーのファイルを選択して
cmd + shift + F


```

検索結果のファイル一覧が表示されるUIが見やすいです。

## Speed Search

エディタ以外のペインではタイプすると検索することができます。結果はハイライトされ、カーソルで移動できます。

おわります。
