---
id: 1044
type: lab
slug: "css-background-clip-text"
title: "任意のテキストで画像をクリップしてくり抜く -『CSS』"
date: 2017-02-05T17:35:51+09:00
modified: 2017-02-05T17:36:25+09:00
excerpt: "background-clip: textのプロパティを使うことで画像をテキストでくり抜くことができます。Photoshopでクリッピングマスクかける感じですね。 background-clip: text CSS .c"
primaryTag: "CSS"
terms:
  - { id: 211, name: "css", slug: "css" }
demoUrl: https://jsfiddle.net/yutousui/tg2h1ety/
legacy:
  prev: processing-js-random-walk
  next: jqueryui-simple-calender
---

`background-clip: text`のプロパティを使うことで画像をテキストでくり抜くことができます。Photoshopでクリッピングマスクかける感じですね。

```
background-clip: text

```

#### CSS

```

.clip {
  background-size: cover;
  -webkit-background-clip: text;
  background-clip: text;
  background-image: url("https://c1.staticflickr.com/1/361/19427534675_ffc194fddf_o.jpg");
  color: transparent;
  font-size: 8em;
  line-height: 1.05;
  font-weight: bold;
  text-align: center;
}


```

<p><iframe width="100%" height="500" src="//jsfiddle.net/yutousui/tg2h1ety/embedded/result,css,html/dark/" allowfullscreen frameborder="0"></iframe></p>

おわります。
