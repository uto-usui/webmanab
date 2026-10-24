---
id: 21
type: tip
slug: "placeholder"
title: "input要素のplaceholder属性にスタイルを適用させる – 『CSS』"
date: 2016-05-31T17:39:52+09:00
modified: 2016-06-12T17:54:39+09:00
excerpt: "inputで入力を補助するためのplaceholder placeholder属性でinput要素やtextarea要素に記入例やヒントを表示させることができます。 デザインによってはブラウザのデフォルトスタイルから変更"
primaryTag: "css"
terms:
  - { id: 3, name: "css", slug: "css" }
  - { id: 18, name: "form", slug: "form" }
legacy:
  prev: mixin-family-scss
  next: css-hack
---

## inputで入力を補助するためのplaceholder

`placeholder`属性で`input`要素や`textarea`要素に記入例やヒントを表示させることができます。\
デザインによってはブラウザのデフォルトスタイルから変更したい時がありますが、その時に必要になるtipsです。

今のところ**ブラウザ毎にプレフィクスを記述する必要**があります。

#### css

```css

/* Chrome Safari Opera 15+ Android iOS */
.ex-input::-webkit-input-placeholder {
  color: black;
  opacity: 1;
}
/* IE10+ */
.ex-input:-ms-input-placeholder {
  color: black;
  opacity: 1;
}
/* Firefox19+ */
.ex-input::-moz-placeholder {
  color: black;
  opacity: 1;
}


```

上記コードでは`class`指定していますが、属性セレクタの`[type="text"]`や`[type="password"]`というように指定してあげることもできます。

上記以外のスタイルのプロパティ(`text-shadow`とか)も適用させることができます。

おわります。
