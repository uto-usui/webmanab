---
id: 42
type: tip
slug: "check-whether-there-is"
title: "lengthプロパティで特定の要素の存在を判別して処理を実行する – 『JS / jQuery』"
date: 2016-06-05T14:32:48+09:00
modified: 2016-06-12T17:53:30+09:00
excerpt: "JavaScriptで特定の要素の存在を判別して処理を実行するスクリプトを記述したいときのtipsです。 .lengthとif文 lengthプロパティで指定したjQueryオブジェクトの要素数を取得することで、要素の有"
primaryTag: "javascript"
terms:
  - { id: 31, name: "if", slug: "if" }
  - { id: 29, name: "javascript", slug: "javascript" }
  - { id: 30, name: "jQuery", slug: "jquery" }
legacy:
  prev: default-value
  next: alert-redirect
---

JavaScriptで特定の要素の存在を判別して処理を実行するスクリプトを記述したいときのtipsです。

## .lengthとif文

`length`プロパティで指定したjQueryオブジェクトの要素数を取得することで、要素の有無を確認できます。\
それをif文で処理すると<strong>「要素があるかどうか」</strong>を判別する処理が実現します。

### 要素があるときだけ処理する

#### JavaScript

```js

if($('#ex').length) {
  console.log('Yes');
}

```

### 要素がないときだけ処理する

#### JavaScript

```js

if(!$('#ex').length) {
  console.log('No');
}

```

### 要素の有無で処理を変更する

#### JavaScript

```js

if($('#ex').length) {
  console.log('Yes');
} else {
  console.log('No');
}

```

おわります。
