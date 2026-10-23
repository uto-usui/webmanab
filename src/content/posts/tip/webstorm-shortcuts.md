---
id: 1581
type: tip
slug: "webstorm-shortcuts"
title: "Webstormで知っておきたいショートカットを集めました – 『editor』"
date: 2017-11-22T16:12:03+09:00
modified: 2018-02-10T23:38:20+09:00
excerpt: "WebStormはモダンなJavaScriptをスマートに開発するためのIDEです。 ぼくのまわりでは、JavaScriptを書くならデザイナーもエンジニアもWebStormがおすすめ、という雰囲気もありメインストリーム"
primaryTag: "webstorm"
terms:
  - { id: 269, name: "editor", slug: "editor" }
  - { id: 238, name: "frontend", slug: "frontend" }
  - { id: 29, name: "javascript", slug: "javascript" }
  - { id: 80, name: "tool", slug: "tool" }
  - { id: 337, name: "webstorm", slug: "webstorm" }
legacy:
  prev: prettydiff
  next: javascript-get-object
---

WebStormはモダンなJavaScriptをスマートに開発するためのIDEです。

ぼくのまわりでは、JavaScriptを書くならデザイナーもエンジニアもWebStormがおすすめ、という雰囲気もありメインストリームな感じなのを受けて、布教用とは言えないですが、ショートカット集をつくってみました。

ショートカットを覚えておくと、IDEの機能を少しづつ知っていくことにもつながるので、よく使う機能をピックアップしています。

- [WebStorm: The Smartest JavaScript IDE by JetBrains](https://www.jetbrains.com/webstorm/)
- [Keyboard Shortcuts By Category](https://www.jetbrains.com/help/webstorm/2016.2/keyboard-shortcuts-by-category.html)

## 一般

<dl><dt>webstormのコマンドを検索</dt><dd>cmd + shift + A</dd><dt>ファイルの絶対パスをコピー</dt><dd>cmd + shift + C</dd><dt>クリップボードを開く</dt><dd>cmd　＋　shift　＋　V</dd><dt>Bookmarkする</dt><dd>option + F3</dd><dt>Bookmarkを確認する</dt><dd>cmd + F3</dd><dt>環境設定を開く</dt><dd>cmd + ,</dd><dt>開いているファイルの切り替え</dt><dd>control + tab</dd><dt>開いているファイルのタブ前後移動</dt><dd>cmd + shift + [ or ]</dd></dl>

## JavaScript 関連

<dl><dt>変数名・関数名・クラス名を検索</dt><dd>comd + option + o</dd><dt>クラス名やメソッド名の宣言と呼び出し元を同時編集</dt><dd>shift + F6</dd><dt>クラス、メソッド、関数の情報を表示</dt><dd>cmd + カーソルを合わせる</dd><dt>宣言か呼び出し元に移動</dt><dd>cmd + b</dd><dt>変数の利用箇所に移動</dt><dd>cmd + option + f7</dd><dt>import　しているモジュールの整理 (ソート/未使用のものを削除)</dt><dd>control + option + O</dd><dt>選択したコードをメソッドとして抽出</dt><dd>cmd + option + M</dd><dt>アウトラインをポップアップ</dt><dd>cmd + F12</dd><dt>クイックドキュメント (JSDocコメントや、 メソッドの詳細) を表示</dt><dd>F1</dd><dt>引数の情報を表示</dt><dd>cmd + P</dd></dl>

## 移動

<dl><dt>エディタ内の上下移動</dt><dd>fn + ↑ or ↓</dd><dt>選択行を上下に移動</dt><dd>option + shift + ↑ or ↓</dd><dt>クラス名を指定して移動</dt><dd>cmd + o</dd><dt>ブロックの先頭か末尾に移動</dt><dd>option + cmd + [ or ]</dd><dt>前の編集地点に移動</dt><dd>shift + cmd + delete</dd><dt>編集ポイントに移動</dt><dd>control + option + ← or →</dd></dl>

## 編集

<dl><dt>現在と次の行を１行に</dt><dd>control + shift + J</dd><dt>コードフォーマットの適用</dt><dd>cmd + option + l</dd><dt>マルチカーソル(同じ項目にカーソルを増やす)</dt><dd>ある文字列を文字列を選択 + control + G</dd><dt>マルチカーソル編集</dt><dd>option + click</dd><dt>長さの異なる文字列の一括編集</dt><dd>option + double click</dd><dt>指定したディレクトリ内を検索</dt><dd>cmd + shift + F</dd><dt>指定したディレクトリ内を一括置換</dt><dd>cmd + shift + R</dd><dt>開きタグから閉じタグまでを選択</dt><dd>alt + ↑ or ↓</dd><dt>矩形選択</dt><dd>alt + 選択</dd><dt>次の同じ単語を選択</dt><dd>cmd + g</dd><dt>同じ単語を複数選択</dt><dd>control + g</dd><dt>同じ単語を全て選択</dt><dd>control + cmd + g</dd></dl>

## ファイルの展開

<dl><dt>いろいろ全検索</dt><dd>double shift</dd><dt>ファイル名検索</dt><dd>shift + cmd + O</dd><dt>ナビゲーションバーに移動</dt><dd>cmd + ↑</dd><dt>最近使用したファイル</dt><dd>cmd + shift + E</dd></dl>

## Emmet

<dl><dt>要素をラップする要素を作る</dt><dd>option + cmd + j</dd><dt>要素を削除する</dt><dd>shift + cmd + fn + delete</dd></dl>

## git

<dl><dt>add</dt><dd>cmd + option + a</dd><dt>コミット</dt><dd>cmd + K</dd><dt>プッシュ</dt><dd>cmd + shift + K</dd></dl>

おわります。
