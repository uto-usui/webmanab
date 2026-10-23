---
id: 289
type: tip
slug: "mulch-border"
title: "ひとつの要素で簡単にボーダーを擬似的に複数指定する方法 -『CSS』"
date: 2016-07-26T08:25:39+09:00
modified: 2017-02-17T18:13:34+09:00
excerpt: "ボーダーを複数指定するプロパティは今のところ策定されていません。 要素を複製作成するなどして擬似的にボーダーを複数表示するハックが一般的かもしれませんが、box-shadowプロパティを使うことで１つの要素でこの要件を実"
primaryTag: "css"
terms:
  - { id: 135, name: "border", slug: "border" }
  - { id: 3, name: "css", slug: "css" }
legacy:
  prev: aquarelle
  next: css-background
---

ボーダーを複数指定するプロパティは今のところ策定されていません。\
要素を複製作成するなどして擬似的にボーダーを複数表示するハックが一般的かもしれませんが、`box-shadow`プロパティを使うことで１つの要素でこの要件を実現することができます。

## box-shadowの拡散半径

`box-shadow`プロパティを多用して影として要素を表示することができますが、\
この`box-shadow`の４つ目のパラメータの**拡散半径**をうまく指定することで、ボーダーの表現ができます。

正の値では影が広がり、負の値では影が狭まる挙動になります。\
オフセットとぼかしを0にして、拡散半径に正の値を指定しましょう。\
これを複数続けて指定することで影がボーダーのように見える表示になります。

#### css

```CSS

.item {
  box-shadow: 0 0 0 10px rgba(0,0,0,.5),
              0 0 0 20px rgba(0,0,0,.5),
              0 0 0 50px rgba(0,0,0,.5);
              // X軸, Y軸, ぼかし, 拡散半径, 色
}

```

### bos-shadowはレイアウトに影響を与えない

`box-shadow`プロパティはレイアウトに影響を与えないので、ボーダーのように要素の大きさとしてはボックスモデルに認識されません。\
`box-sizing`も無視して要素の外側に表示されます。\
**マウス操作もこの擬似ボーダーの上では発生しない**ため、これを解決するために、要素の大きさをハックするには、\
`padding`で内側に`inset`パラメータで内側に影を指定することで、調整することが必要です。

<p><iframe width="100%" height="500" src="//jsfiddle.net/yutousui/v50uwgbj/embedded/result,css,html/dark/" allowfullscreen frameborder="0"></iframe></p>

おわります。
