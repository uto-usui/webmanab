---
id: 1170
type: tip
slug: "static-random-gradation-color-for-updating-random-values-at-compile-time"
title: "コンパイル時にランダム値を更新する、静的なランダムなグラデーションカラーを生成する。 -『Sass/SCSS』"
date: 2017-02-28T14:37:43+09:00
modified: 2019-02-14T19:01:40+09:00
excerpt: "Sassの記述のみでランダムなカラーを抽出します。 random()関数でランダム値を得る ランダムカラーといっても動的に変更できるわけではないですが、random()関数を使うことでSCSSからCSSにコンパイルすると"
primaryTag: "sass"
terms:
  - { id: 272, name: "color", slug: "color" }
  - { id: 3, name: "css", slug: "css" }
  - { id: 273, name: "random", slug: "random" }
  - { id: 6, name: "sass", slug: "sass" }
legacy:
  prev: mac-tree
  next: control-random-values
---

Sassの記述のみでランダムなカラーを抽出します。

## random()関数でランダム値を得る

ランダムカラーといっても動的に変更できるわけではないですが、`random()`関数を使うことでSCSSからCSSにコンパイルするときにランダム値を返すことを利用します。

`random()`関数には引数に最大値を与えることできるので、0から最大値までの値をランダムで返してくれます。

```

random(100)
// コンパイル時に0から100までの値をランダムに返す


```

これを利用してランダムカラーを出力します。

#### scss

```
@mixin bg-gradient($color: hsla(180, 65, 75, 1), $degrees: 180deg, $angle: 60deg, $start: 15%, $stop: 90%) {
  background-image: linear-gradient($angle, $color $start, adjust-hue($color, $degrees) $stop);
}

$baseHue: 180;
$swingWidth: 100;
$randHue: $baseHue - random($swingWidth) + random($swingWidth);
$randHsla: hsla($randHue, 65, 75, 1);

body {
  width: 100%;
  min-height: 100vh;
  @include bg-gradient($randHsla, 100deg, 90deg, 0%, 100%);
}

```

グラデーションの背景を出力する`mixin`もあわせて用意しました。

## コードをゆっくり解説

### hsla()関数でカラーをコントロール

最終的にhsla()関数で値をCSSの`color`や`background`に渡すようにします。\
理由としては、rgba()関数よりhsla()関数の方が、値を渡したときに変化をコントロールしやすいからです。

#### scss

```
hsla(180, 50, 50, 1)
// hsla(色相環の角度, 彩度, 明度, 透明度)

```

色相環の角度、彩度、明度、透明度それぞれをランダムにしたり固定したりすることで、ばらつき加減をコントロールしやすいです。

### ランダム値をある程度コントロール

今回はこの色相環の角度にランダム値を渡すことでランダムカラーを実現しています。

色相環はこれです。

![色相環](/images/uploads/2017/02/hue-circle.jpg)

この色相環の色を抽出する角度に変化をつけてあげます。

ただ単純にランダムカラーを生成するのではおもしろみに欠けるので、基準となる色からのランダム値の振れ幅を指定できるように記述しました。

#### scss

```

$baseHue: 180; // ベースとなる色相環の角度
$swingWidth: 100; // ランダム値の振れ幅
$randHue: $baseHue - random($swingWidth) + random($swingWidth);  // 180から前後100のランダム値を計算
$randHsla: hsla($randHue, 65, 75, 1);  // ランダムカラー 彩度、明度、透明度を固定


```

完全にランダムな値を取り出したい場合は、以下のように記述します。

#### scss

```
$randHsla: hsla(random(360), random(100), random(360), random(1));

```

これを背景色にするとランダムな背景の実現します。

#### scss

```

body {
  background-color: $randHsla;
}


```

### ランダム値をグラデーションを生成するmixinに渡していい感じに

この生成したランダムカラーをグラデーションの`mixin`に渡すことでいい感じにします。

[WebクリエイターボックスのManaさんのコード](http://www.webcreatorbox.com/tech/sass-colours/)からインスピレーションを得た感じの`mixin`になりました。

#### scss

```

@mixin bg-gradient($color: hsla(180, 65, 75, 1), $degrees: 180deg, $angle: 60deg, $start: 15%, $stop: 90%) {
  background-image: linear-gradient($angle, $color $start, adjust-hue($color, $degrees) $stop);
}


```

ランダム値をSassの`aduiust-hue()`関数で指定した角度分ずらして、ランダムカラーからそこに向かってグラデーションさせています。一応`mixin`にデフォルト値を与えていて、変更したくなるところをいろいろ設定できるようにしました。

#### scss

```

body {
  width: 100%;
  min-height: 100vh;
  @include bg-gradient($randHsla, 100deg, 90deg, 0%, 100%);
  // @include bg-gradient($randHsla, グラデーションの変化色を示す角度, グラデーションの方向を示す角度, グラデーションを始めるポジション, グラデーションを終えるポジション);
}


```

おわります。
