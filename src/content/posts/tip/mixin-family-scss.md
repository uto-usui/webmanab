---
id: 9
type: tip
slug: "mixin-family-scss"
title: "痒いところに手が届く、n番目の要素にスタイルを…を楽にしてくれるmixin集「Family.scss」 – 『Mixin』"
date: 2016-05-30T11:04:28+09:00
modified: 2016-06-12T17:54:20+09:00
excerpt: "CSSのスタイルの指定において、n番目の要素にスタイルを適応させる際に:nth-childや:nth-first-childなどの擬似クラスを利用します。 シンプルな「n番目」は簡単な擬似クラスの指定で事足りますが、「n"
primaryTag: "sass"
terms:
  - { id: 7, name: "memo", slug: "memo" }
  - { id: 5, name: "mixin", slug: "mixin" }
  - { id: 6, name: "sass", slug: "sass" }
legacy:
  prev: null
  next: placeholder
---

CSSのスタイルの指定において、n番目の要素にスタイルを適応させる際に`:nth-child`や`:nth-first-child`などの擬似クラスを利用します。\
シンプルな「n番目」は簡単な擬似クラスの指定で事足りますが、「n番目からm番目」、「n番目からm番目の間をl番目おきに」などの複雑な条件を指定するのはむつかしいです。

## n番目を快適にしてくれる「Family.scss」

これを簡単でわかり易い記述に助けてくれるのが**Family.scss**です。\
Sass(scss)の利用が前提で、詳細は[Family.scssの配布サイト](http://lukyvj.github.io/family.scss/)にわかりやすくまとまっています。

### デモサイトがわかりやすい

デモサイトのサンプルを見て試してみると、有用性はもちろん、今まで想像してなかったような条件を記述できることを発見できました。\
いろいろ試していく中で、今まで打ち消すようなスタイルを記述していた箇所を、修正して省いていけそうです。

久しぶりに便利で利用頻度が高くなりそうな`mixin`に巡り合ったので、プリセットのツールとして導入しつつ備忘録とします。

おわります。
