---
id: 1950
type: tip
slug: "youtube-dl"
title: "youtube-dlでコマンドラインから動画をダウンロードする方法。 -『tool』"
date: 2018-01-14T13:38:53+09:00
modified: 2020-03-02T19:40:05+09:00
excerpt: "youtube-dl はコマンドラインで動く、Youtube等の動画サイトから動画をダウンロードするツールです。 豊富なオプションが用意されていて、スクレイビングして正規表現に当てはまるものまとめてダウンロードしたり、高"
primaryTag: "tool"
terms:
  - { id: 238, name: "frontend", slug: "frontend" }
  - { id: 226, name: "movie", slug: "movie" }
  - { id: 318, name: "sound", slug: "sound" }
  - { id: 80, name: "tool", slug: "tool" }
legacy:
  prev: ffmpeg-mp4-to-mp3
  next: adele
---

youtube-dl はコマンドラインで動く、Youtube等の動画サイトから動画をダウンロードするツールです。

豊富なオプションが用意されていて、スクレイビングして正規表現に当てはまるものまとめてダウンロードしたり、高度な使い方をすることができます。詳しくは公式の README.md にまとまっていますが、ここではよく使う基本的な機能を日本語でまとめておきます。

- [youtube-dl/README.md at master · rg3/youtube-dl · GitHub](https://github.com/rg3/youtube-dl/blob/master/README.md)

## インストールする

Mac 環境なので[Homebrew ](https://brew.sh/index_ja.html)を使ってインストールします。

```bash

brew install youtube-dl


```

## 動画をダウンロードする

ダウンロードするのは簡単で、その動画のURLを入力するだけです。

```bash

youtube-dl [url]


```

### プレイリストごとダウンロード

プレイリストごとをまとめてダウンロードできます。 `-i` というオプションで、ダウンロードエラーを無視してくれます。

```bash

youtube-dl -i [url]


```

### 一番品質のいい mp4 をダウンロード

まず、アップロードされているファイル形式を調べます。

```bash

youtube-dl -F xxxidxxx


```

取得した一覧のなかから品質の良い mp4 と m4a のフォーマットコードを組み合わせて DL します。

```bash

 youtube-dl -f 137+140 --merge-output-format mp4 xxxidxxx


```

audio ファイルが webm だと ffmpeg がエラーを起こすので、その場合は手動マージします。

```bash

ffmpeg -i video.webm -i audio.webm -c:a aac -map 0:v:0 -map 1:a:0 output.mp4


```

## 音声のみダウンロードする

動画をダウンロードした後に、 ffmpeg で自動的に音声ファイルに変換します。`-x` で音声ファイルに抜き出し、`--audio-format` で形式を指定、`--audio-quality` でビットレートを指定します。

```bash

youtube-dl -x --audio-format mp3 --audio-quality 0 xxxidxxx


```

## その他のコマンド

その他のヘルパーのように使うコマンドです。

### ヘルプを表示

```bash

youtube-dl -h


```

### 対応サイトを表示する

```bash

--list-extractors


```

おわります。
