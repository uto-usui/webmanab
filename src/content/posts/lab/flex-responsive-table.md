---
id: 977
type: lab
slug: "flex-responsive-table"
title: "flexレイアウトを使ってレスポンシブテーブルをつくる -『responsive』"
date: 2017-01-31T12:46:32+09:00
modified: 2017-01-31T12:47:23+09:00
excerpt: "flexレイアウトを使って、レスポンシブに変化するテーブルをつくります。 @media (min-width: 769px) { .table { display: flex; // tr { display: flex"
primaryTag: "responsive"
terms:
  - { id: 257, name: "responsive", slug: "responsive" }
  - { id: 258, name: "table", slug: "table" }
legacy:
  prev: hover-effect-to-change-the-background-colo
  next: count-textarea
---

`flex`レイアウトを使って、レスポンシブに変化するテーブルをつくります。

```

@media (min-width: 769px) {
  .table {
    display: flex;
    //
    tr {
      display: flex;
      flex-direction: column;
    }
    th {
      border-top: 0;
      border-bottom: 0 !important;
    }
    td {
      border-top: 0;
    }
  }
  .table_body {
    display: flex;
  }
}

.table_head {
  background-color: rgba(black,.1);
}

.table_body {
  background-color: rgba(white,.35);
}


```

<p><iframe width="100%" height="450" src="//jsfiddle.net/yutousui/pLfa203m/embedded/result,css,html/dark/" allowfullscreen frameborder="0"></iframe></p>
