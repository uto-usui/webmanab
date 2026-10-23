---
id: 845
type: tip
slug: "html5-responsive-image"
title: "簡単だった。HTML5.1にときめきつつ、そろそろレスポンシブイメージしたいからsrcset属性やpicture要素たちを知る -『HTML5』"
date: 2016-12-27T20:54:14+09:00
modified: 2017-02-17T22:01:49+09:00
excerpt: "HTML5.1ではhtmlだけで簡単にレスポンシブイメージを実装することができます。それを実現するために必要なのはsrcset属性やpicture要素たちを扱うことです。 html5 <picture> &l"
primaryTag: "responsive"
terms:
  - { id: 38, name: "html5", slug: "html5" }
  - { id: 39, name: "responsive", slug: "responsive" }
demoUrl: https://jsfiddle.net/yutousui/rpccyvyb/
legacy:
  prev: css-ellipsis-mixin
  next: license
---

HTML5.1ではhtmlだけで簡単にレスポンシブイメージを実装することができます。それを実現するために必要なのは`srcset`属性や`picture`要素たちを扱うことです。

#### html5

```

<picture>
  <source class="img" media="(max-width: 610px)" srcset="
    https://dummyimage.com/500x500/88ccff/686a82.gif&text=610w+1x 1x,
    https://dummyimage.com/500x500/88ccff/686a82.gif&text=610w+2x 2x, 
    https://dummyimage.com/500x500/88ccff/686a82.gif&text=610w+3x 3x
  ">
  <source class="img" media="(max-width: 980px)" srcset="
    https://dummyimage.com/500x500/88ccff/686a82.gif&text=980w+1x 1x,
    https://dummyimage.com/500x500/88ccff/686a82.gif&text=980w+2x 2x, 
    https://dummyimage.com/500x500/88ccff/686a82.gif&text=980w+3x 3x
  ">
  <img class="img" src="https://dummyimage.com/500x500/88ccff/686a82.gif&text=large+1x">
</picture>


```

上記のように記述することで、htmlで完結したレスポンシブイメージを実装することができます。

## HTML5.1にときめきつつ、そろそろレスポンシブイメージしたいからsrcset属性やpicture要素たちを知る

レスポンシブWebデザインで画像を扱う際に「PC / Tablet / SP」などのそれぞれの画面サイズや画面解像度に最適化された画像を選択してマルチデバイス対応をします。\
HTML5.1で登場する`picture`要素は、複数の条件で指定をした上で最適化した画像を提供することができます。`picture`要素でラップした複数の`source`要素と、`img`要素で画像を提供します。

### srcset属性

まずは`srcset`属性の扱い方です。

画像のURLをカンマで区切って列挙し、`srcset`属性と数値と`x`というキーワードで`srcset="url_nomal 1x, url_high 2x"`のように記述することで、デバイスのピクセル密度に応じて表示する画像を選択します。

#### html

```

<img class="img" src="http://dummyimage.com/500x500/88ccff/686a82.gif&text=image+1x" srcset="
https://dummyimage.com/500x500/88ccff/686a82.gif&text=1x 1x,
https://dummyimage.com/1000x1000/88ccff/686a82.gif&text=2x 2x,
https://dummyimage.com/2000x2000/88ccff/686a82.gif&text=3x 3x">


```

また、デバイスのサイズ別に画像を選択する場合はピクセル幅と`w`というキーワードを使います。

#### html

```

<img class="img" src="http://dummyimage.com/500x500/88ccff/686a82.gif&text=image+1x" srcset="
https://dummyimage.com/500x500/88ccff/686a82.gif&text=610w 610w,
https://dummyimage.com/1000x1000/88ccff/686a82.gif&text=980w 980w,
https://dummyimage.com/2000x2000/88ccff/686a82.gif&text=1200w 1200w">


```

### picture要素

`picture`要素を利用することで、画面解像度と画面サイズの両方の条件を掛け合わせて画像を選択することができるようになります。

`picture`要素の中には複数の`source`要素を記述します。`source`要素の`media`属性の値には、CSSのメディアクエリーで使用する値と同様に`media="(max-width: 1200px)"`のように値を記述します。`img`要素にはデフォルト(フォローバック用)の画像を、`source`要素は、各media属性の値にマッチした条件においてさらに画面解像度別に画像のURLと数値と`x`キーワードを列挙して指定します。

#### html

```

<picture>
  <source class="img" media="(max-width: 610px)" srcset="
    https://dummyimage.com/500x500/88ccff/686a82.gif&text=610w+1x 1x,
    https://dummyimage.com/500x500/88ccff/686a82.gif&text=610w+2x 2x, 
    https://dummyimage.com/500x500/88ccff/686a82.gif&text=610w+3x 3x
  ">
  <source class="img" media="(max-width: 980px)" srcset="
    https://dummyimage.com/500x500/88ccff/686a82.gif&text=980w+1x 1x,
    https://dummyimage.com/500x500/88ccff/686a82.gif&text=980w+2x 2x, 
    https://dummyimage.com/500x500/88ccff/686a82.gif&text=980w+3x 3x
  ">
  <img class="img" src="https://dummyimage.com/500x500/88ccff/686a82.gif&text=large+1x">
</picture>


```

注意点として`img`要素の後に書かれた`source`要素は無視されてしまうので`img`要素は必ず最後に記述します。ブラウザが`picture`要素をサポートしていない場合に`img`要素に指定された画像がフォローバックとして表示されます。

<p><iframe width="100%" height="500" src="//jsfiddle.net/yutousui/rpccyvyb/embedded/result,html/dark/" allowfullscreen frameborder="0"></iframe></p>

#### ブラウザの対応状況

- [caniuse / srcset](http://caniuse.com/#search=srcset)
- [caniuse / picture](http://caniuse.com/#search=picture)

おわります。
