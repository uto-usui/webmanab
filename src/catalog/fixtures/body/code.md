## コードブロック

info string は旧サイトの class をそのまま書く（README 3 章の 1）。

<!-- 末尾の空行と長い行を見本として残すため、prettier に整形させない -->
<!-- prettier-ignore-start -->

```js
// 先頭に空行がないもの
const add = (a, b) => a + b
export default add
```

```bath

# 先頭に空行があるもの
npm install --save-dev sass
```

```scss
// 末尾に改行が 2 つ
.box {
  color: $glay;

  &:hover {
    color: $primary-color;
  }
}

```

```html
<!-- 末尾に改行が 3 つ -->
<div class="box">
  <p>text</p>
</div>


```

段落の中の `inline code` と、長い行がはみ出すコードです。

```js
const veryLongLine = ['はみ出す行の見本', 'はみ出す行の見本', 'はみ出す行の見本', 'はみ出す行の見本', 'はみ出す行の見本']
```

<!-- prettier-ignore-end -->
