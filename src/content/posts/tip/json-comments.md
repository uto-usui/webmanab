---
id: 757
type: tip
slug: "json-comments"
title: "JSONにはコメントを記述できないので代替の方法を考える – 『javascript』"
date: 2016-11-25T14:54:36+09:00
modified: 2017-02-14T21:05:38+09:00
excerpt: "JSONにはコメントを付けることができないのですが、JSONを利用するときは相互に共有したい設定ファイル等で利用すること多いので、何らかのルールをつくってコメントを残す方法を考えるtipsです。 JSONにコメントを記述"
primaryTag: "javascript"
terms:
  - { id: 29, name: "javascript", slug: "javascript" }
  - { id: 222, name: "JSON", slug: "json" }
legacy:
  prev: youtube-responsive-css
  next: wordpress-custum-field-if
---

JSONにはコメントを付けることができないのですが、JSONを利用するときは相互に共有したい設定ファイル等で利用すること多いので、何らかのルールをつくってコメントを残す方法を考えるtipsです。

## JSONにコメントを記述できないから代替の方法を考えてみた

もちろんいろいろな諸氏がすでに取り組んでいるので、有用そうなものを２つピックアップして記しておきます。

- `"_comment"`のvalueとしてコメントを記述する
- `"//"`のvalueとしてコメントを記述する

### `"_comment"`のvalueとしてコメントを記述する

`"_comment"`というキーを用意して、その値にコメントを記述していく方法です。配列を渡しておくことで複数行の記述を表現します。しっかりとコメントとして明示してあげることと先頭に持ってくることで、まあわかってもらえるのではないでしょうか。ただしこの方法だと取り出すときにこの値を取り除く処理を考えておく必要があります。

#### JSON

```

{
  "_comment": [
    "this is comment text",
    "this is comment text",
    "this is comment text"
  ],
  "name": "site title",
  "description": "this is my site",
  "title": "site title",
  "lang": "ja",
}


```

### `"//"`のvalueとしてコメントを記述する

`"//"`というキーを用意して、その値にコメントを記述していく方法です。これも配列を渡しておくことで複数行を表現します。JavaScriptのコメント行っぽいのを表している雰囲気が出ているので、これもコメントを表すキーとして使えるのではないでしょうか。この場合も取り出すときに記述したコメントの値を無視するようにします。

#### JSON

```

{
  "//": [
    "this is comment text",
    "this is comment text",
    "this is comment text"
  ],
  "name": "site title",
  "description": "this is my site",
  "title": "site title",
  "lang": "ja",
}


```

ぼくの感覚的には`"//"`の値としてつらつら書いていくのが一番しっくりくるかなあという印象です。擬似的なコメントなのでチームでルールを決めて運用して有効に利用したいです。.ejsの設定ファイルなどHTMLコーダーにもJSONを触ってもらったりする機会があるので、目的を明示しておくことで使いやすくしていきたいです。

おわります。
