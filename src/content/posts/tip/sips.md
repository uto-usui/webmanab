---
id: 2308
type: tip
slug: "sips"
title: "複数の画像を手早くsipsコマンドで一括リサイズする -『Mac』"
date: 2018-03-25T12:37:42+09:00
modified: 2018-03-25T12:38:44+09:00
excerpt: "画像をリサイズする退屈な作業を一括で行ったり自動化する方法はいくつかあります。フロントエンド開発ではタスクランナーを使ったり、よく使うのはPhotoshopのスクリプトを利用したりするのではないでしょうか。そこで、アプリ"
primaryTag: "mac"
terms:
  - { id: 52, name: "design", slug: "design" }
  - { id: 238, name: "frontend", slug: "frontend" }
  - { id: 53, name: "mac", slug: "mac" }
legacy:
  prev: decaffeinate
  next: fonts-that-people-actually-use
---

画像をリサイズする退屈な作業を一括で行ったり自動化する方法はいくつかあります。フロントエンド開発ではタスクランナーを使ったり、よく使うのはPhotoshopのスクリプトを利用したりするのではないでしょうか。そこで、アプリを立ち上げるのが面倒なときに Mac のターミナルでサクッと sips コマンドでリサイズをする tips です。

Terminal を開いて cd コマンドで 任意のディレクトリに移動して、次のコマンドを実行します。

#### terminal

```bath

sips -Z 500 *.jpg


```

<dl><dt>-Z</dt><dd>比率を保つ</dd><dt>640</dt><dd>高さと幅の最大値</dd><dt>*.jpg</dt><dd>拡張子の選択、画像の拡張子が .JPG であれば、ここを変更する</dd></dl>

という簡単なコマンドで一括リサイズすることができました。今回はサムネイルを作るようなイメージですね。ぼくはカメラの大きな画像をこれでリサイズしてカメラロールのようなものを生成することにしています。

sips コマンドでは他にも色々な画像の加工ができるので、こちらを参考にどうぞ。

- [Macのターミナルで簡単に画像処理できるsipsの使い方](https://qiita.com/livlea/items/53b755e5067d4ebc5b43)

おわります。
