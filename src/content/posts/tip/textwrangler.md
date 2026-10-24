---
id: 1135
type: tip
slug: "textwrangler"
title: "Dreamweaverでアップロード時に差分をチェック。「TextWrangler」の設定方法 -『front-end』"
date: 2017-02-20T12:06:14+09:00
modified: 2017-02-20T12:08:50+09:00
excerpt: "Dreameweaverでファイルのアップロードを行う際に、ローカルとサーバ上のファイルの差分を簡単にチェックしたいので、比較ツールを設定します。Mac版の「TextWrangler」を使います。作業は簡単で無料で導入で"
primaryTag: "front-end"
terms:
  - { id: 270, name: "dreamweaver", slug: "dreamweaver" }
  - { id: 269, name: "editor", slug: "editor" }
  - { id: 238, name: "frontend", slug: "frontend" }
legacy:
  prev: macos-full-path-finder-head
  next: mac-tree
---

Dreameweaverでファイルのアップロードを行う際に、ローカルとサーバ上のファイルの差分を簡単にチェックしたいので、比較ツールを設定します。Mac版の「TextWrangler」を使います。作業は簡単で無料で導入できるツールです。

## Dreamweaverでアップロード時に差分をチェックする

オンライン上にも簡単に無料で扱えるツールが多いので、外部のツールを使ってもいいのですが、「Dreamweaver」ではファイルアップロード時にリモートサーバー上のファイルとローカル上のファイルの更新日時に差分あるとアラートを表示してくれるのですが、そのアラート画面から直接比較を行うことができるので、これがあると結構便利だとおもいます。

### TextWranglerのインストール

Mac版の「TextWrangler」をインストールします。\
ページ下部の「Download Now」からダウンロードして、インストールします。

- [Bare Bones Software | TextWrangler](http://www.barebones.com/products/textwrangler/)

### TextWranglerのコマンドラインツールをインストール

「TextWrangler」は単独で差分をチェックできるアプリケーションなのですが、このツールを直接「Dreamweaver」に設定しても動きません。「TextWrangler」のコマンドラインツールをインストールします。

- 「TextWrangler」メニュー >>>「Install Command-Line Tools」

### Dreamweaverでツールを設定する

「Dreamweaver」の環境設定で比較ツールの設定を行います。

1. 「Dreamweaver」メニュー >>> 「環境設定…」
2. サイドメニュー「ファイルの比較」 >>> 「参照」
3. 「/usr/local/bin/twdiff」を選択

以上で設定は完了です。

### TextWranglerの使い方

これでファイルアップロード時に更新日時に差分があると、アラート画面から「比較」を選択すると「TextWrangler」が立ち上がるようになります。

また、「Dreamweaver」のファイルパネルで右クリックしたメニューから「リモートサーバーとの比較」を選択するといつでも比較を実行することができます。

画面では、左パネルにサーバーのファイル、右パネルにローカルのファイルが表示されます。

差分のある部分がリスト化され、選択した項目がハイライトされます。パネル下部の「Apply」ボタンで項目ごとにマージさせることができます。

### ファイルが開けないことがある

「Dreamweaver」のバージョンにもよりますが、「Dreamweaver」がサポートしていないファイルについては、ファイルパネルの右クリックから差分チェックを行えない場合があります。

この現象が起きたときにはファイルアップロード時のアラート画面からの比較は行えるので、そちらから確認するようにします。

おわります。
