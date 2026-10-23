---
id: 941
type: tip
slug: "javascript-contains-string"
title: "特定の文字列が含むかどうかをチェックする -『javascript』"
date: 2017-01-17T11:18:13+09:00
modified: 2017-02-13T09:56:05+09:00
excerpt: "特定の文字列が含まれるかどうかで処理を行ったり、分岐させるためのスクリプトです。 特定の文字列が含むかどうかをチェックする match()をつかう match()で文字列が含まれれば配列、文字列が含まれなければnullが"
primaryTag: "javascript"
terms:
  - { id: 31, name: "if", slug: "if" }
  - { id: 29, name: "javascript", slug: "javascript" }
legacy:
  prev: wordpress-move-site
  next: google-fonts-asynchronous
---

特定の文字列が含まれるかどうかで処理を行ったり、分岐させるためのスクリプトです。

## 特定の文字列が含むかどうかをチェックする

### match()をつかう

`match()`で文字列が含まれれば配列、文字列が含まれなければnullが返ることを利用します。

```

var text = 'this is text'
if ( text.match(/text/)) {
  console.log('match!!');
}


```

### indexOfを使う

`indexOf()`で文字列があれば文字列がある場所(1以上の値)、文字列がなければ-1が返ることを利用します。

```

var text = 'this is text'
if ( text.indexOf(/text/) != -1) {
  console.log('match!!');
}


```

おわります。
