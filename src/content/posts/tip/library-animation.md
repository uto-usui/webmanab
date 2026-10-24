---
id: 686
type: tip
slug: "library-animation"
title: "かわいく、かっこよく。素敵なアニメーションを実装するためのライブラリのまとめ -『animation』"
date: 2017-01-26T01:56:24+09:00
modified: 2019-12-16T15:10:20+09:00
excerpt: "単純なアニメーションならCSSの@keyframesやtransitionで実装できますが、複雑なアニメーションやサクッといいものを描くときにはアニメーションライブラリを使うと、くわしい知識や経験がなくても簡単に実装でき"
primaryTag: "animation"
terms:
  - { id: 2, name: "animation", slug: "animation" }
  - { id: 96, name: "effect", slug: "effect" }
  - { id: 29, name: "javascript", slug: "javascript" }
  - { id: 30, name: "jQuery", slug: "jquery" }
legacy:
  prev: url-query-action
  next: squarespace-logo
---

単純なアニメーションならCSSの`@keyframes`や`transition`で実装できますが、複雑なアニメーションやサクッといいものを描くときにはアニメーションライブラリを使うと、くわしい知識や経験がなくても簡単に実装できたり、複雑なアニメーションを構築することができます。また、アニメーションを実装する際の勉強や研究にもなるので、目を通しておきたいライブラリをまとめます。

## アニメーションを実装するためのライブラリまとめ (CSS)

### Tuesday

![tuesday](/images/uploads/2017/01/tuesday.png)

0.3秒くらいの短時間で終了するように作られた要素の表示／非表示に使える、シンプルなCSSアニメーションライブラリ。用意された`class`属性を付与するだけで簡単にアニメーションが実装できます。ソースはLessで記述されています。

- [Tuesday](http://shakrmedia.github.io/tuesday/)
- [Tuesday github](https://github.com/ShakrMedia/tuesday)

```
<div class="animated tdDropInLeft">animate_</div>

```

### csshake

![csshake](/images/uploads/2017/01/csshake.png)

ガクガクブルブル震わせるCSSライブラリ。派手楽しいですが、とてもおしゃれ。用意されている`class`属性を付与します。SCSSで記述されていて、カスタマイズ用の`mixin`が用意されています。

- [csshake](http://elrumordelaluz.github.io/csshake/)
- [csshake github](https://github.com/elrumordelaluz/csshake/)

```

.my-shake {
  @include do-shake('my-shake', 40, 40, 20, 100ms); // name x y r time
}


```

### animate.css

![animate-css](/images/uploads/2017/01/animate-css.png)

`class`属性を付与して様々なアニメーションを実装します。とても有名で人気のあるCSSアニメーションライブラリ。

- [animate.css](https://daneden.github.io/animate.css/)
- [animate.css github](https://github.com/daneden/animate.css)

```
<div class="animated infinite bounce">animation_</div>

```

SCSSでMixinが用意されている「animate.scss」もあります。実務でカスタマイズの必要があるときはこっちを利用すると、必要なアニメーションだけを必要なオプションを与えて呼び出すことができるので自由度が高く便利です。

- [animate.scss](https://github.com/geoffgraham/animax1te.scss)

### animatable

![animatable](/images/uploads/2017/01/animatable.png)

CSSのプロパティ別にアニメーションを実装した例のまとめ。オブジェクトをクリックするとプロパティを変化させている値の幅を見ることができます。

- [animatable](http://leaverou.github.io/animatable/)

### motion UI

![zurb-playground-motion](/images/uploads/2017/01/zurb-playground-motion.png)

豊富なアニメーションがSassで用意されています。Mixinでいろいろな拡張ができるようになっていて、もともと用意されているアニメーションをミックスしたり、アニメーションに順序を与えることが簡単にできます。JavaScriptで制御することができるようになっています。ドキュメントはちょっと難しめ。

- [motion-ui](http://zurb.com/playground/motion-ui)
- [motion-ui github](https://github.com/zurb/motion-ui)

### Magic Animations CSS3

![magic_animations](/images/uploads/2017/01/magic_animations.png)

クラスを付与することで、可愛い動きを実装できます。ユーザーがクリックした時など、UIのアクションに向いています。

- [magic_animations](https://www.minimamente.com/example/magic_animations/)
- [magic_animations github](https://github.com/miniMAC/magic)

`class`名もなんだかかわいいです。

#### javascript

```

$('.animate').on('click', function() {
  $(this).addClass('magictime puffIn');
});


```

#### html

```
<div class="animte">animate_</div>

```

## アニメーションを実装するためのライブラリまとめ 《JavaScript》

### bouncejs

![bouncejs](/images/uploads/2017/01/bouncejs.png)

少し激しめでトリッキーな動きが用意されています。デモページではプリセットされたアニメーションを直感的にエディット／プレビューしてカスタマイズできます。CSSのコードがエクスポートできるようになっていて、出力された`transform: matrix3d()`を利用した `@keyframes`アニメーションをコピペすることができます。

そのコードを生成しているライブラリ本体を利用することも可能で、使いやすいです。

- [bouncejs](http://bouncejs.com/)
- [bounce.js github](https://github.com/tictail/bounce.js)

#### javascript

```

var bounce = new Bounce();
bounce
  .translate({
    from: { x: -300, y: 0 },
    to: { x: 0, y: 0 },
    duration: 600,
    stiffness: 4
  })
  .scale({
    from: { x: 1, y: 1 },
    to: { x: 0.1, y: 2.3 },
    easing: "sway",
    duration: 800,
    delay: 65,
    stiffness: 2
  })
  .scale({
    from: { x: 1, y: 1},
    to: { x: 5, y: 1 },
    easing: "sway",
    duration: 300,
    delay: 30,
  })
  .applyTo(document.querySelectorAll('.anim_'));


```

### voxel.css

![voxelcss](/images/uploads/2017/01/voxelcss.png)

JavaScriptで四角い立方体を並べて、3D空間をCSSのプロパティで実現するライブラリ。光源の概念があるのがすごい。マウスイベントが簡単に実装できて箱の増減や回転のインタラクションをつけることができる。

- [voxel.css](http://www.voxelcss.com/)
- [voxel.css demo](http://voxelcss.com/demo)

```

const init = (element) => {
  let PI          = Math.PI,
  scene       = new voxelcss.Scene(),
  lightSource = new voxelcss.LightSource(300, 300, 300, 750, 0.3, 1),
  world       = new voxelcss.World(scene),
  editor      = new voxelcss.Editor(world);

  scene.rotate(-PI / 8, PI / 4, 0);
  scene.attach(element);
  scene.addLightSource(lightSource);

  editor.add(new voxelcss.Voxel(0, 0, 0, 100, {
    mesh: voxelcss.Meshes.grass
  }));

}

init(document.body);


```

### aos

![aos](/images/uploads/2017/01/aos.jpg)

スクロールをトリガーに発生するアニメーション。`data-*`属性を使ってパラメータを渡します。豊富なイージングが用意されています。どれくらい可視範囲に入ってきてからどれくらいの時間で、というように細かい内容を直感的に記述できるところが魅力です。

- [aos](http://michalsnik.github.io/aos/)
- [aos github](https://github.com/michalsnik/aos)

#### html

```
<div data-aos="fade-zoom-in" data-aos-offset="200" data-aos-delay="100" data-aos-easing="ease-in-sine" data-aos-duration="600" data-aos-anchor=".selector">

```

`data-aos-anchor`に値を渡すと、自分ではない他の要素をトリガーにアニメーションを発生させることができます。

初期値の設定は`init()`にオプションで値を渡します。レスポンシブデザインで、モバイル端末で指定を解除したいときは、`disable`に`true`を渡すように式を記述します。

#### javascript

```

AOS.init({
  offset: 200,
  duration: 600,
  easing: 'ease-in-sine',
  delay: 100,
  disable: $(window).height() < 980
});


```

### animsition

![animsition](/images/uploads/2017/01/animsition.png)

画面遷移にアニメーションを与えることができます。オプションやコールバックが豊富なので、画面遷移をなめらかに表現して体感速度を高めたり、リッチな表現に向いています。

- [animsition](http://git.blivesta.com/animsition/)
- [animsition github](https://github.com/blivesta/animsition)

### Morf.js

![joelambert](/images/uploads/2017/01/joelambert.png)

豊富に用意されたイージングを探索できます。

- [Morf.js](http://www.joelambert.co.uk/morf/)

#### javascript

```

var elem = document.getElementById('elem');

var trans = Morf.transition(elem, {
  '-webkit-transform': 'translate3d(300px, 0, 0) rotate(90deg)',
  'background-color': '#FF0000'
}, {
  duration: '1500ms',
  timingFunction: 'bounce',
  callback: function (elem) {
    // some func
  }
});


```

### tweenmax

Googleが推奨する最強のモーションを作るためのトゥイーンライブラリ。

- [tweenmax](https://greensock.com/tweenmax)

他のライブラリに比べて、実行速度が速く、パフォーマンスに優れています。多くのオブジェクトを動かしたいときなどwebGLなど重い動作を実装したいときに真価を発揮します。モジュールを分解して読み込むことが可能なので、小分けにすると容量を軽くすることもできます。

- [HTML5 Animation Speed Test](https://greensock.com/js/speed.html)

記述においては、CSSの`transform`プロパティにアクセスしやすいところが素敵です。

#### javascript

```

TweenMax.to('.animate_', // セレクタ
  1.0, // 時間
  {
    x: 100,
    repeat: -1,
    ease: Cubic.easeOut
  }
);


```

#### 参考

- [TweenMaxの使い方メモ](http://qiita.com/ANTON072/items/a1302f4761bf0ffcf525)

### anime.js

![anime-js](/images/uploads/2017/01/anime-js.png)

「anime.js」にはランダム関数が用意されていたり、`svg`のパス上でのアニメーションや、オブジェクトの値を変化させることもできる表現力の高いライブラリ。オプションやイベントが豊富で人気があります。

TweenMaxよりはパフォーマンスが劣るので、重いwebGLの処理などは得意ではありません。小さなアニメーションやインタラクションに実装します。

- [anime.js](http://anime-js.com/)
- [anime.js github](https://github.com/juliangarnier/anime)

`elasticity`というはずみ具合をコントロールできるおもしろいパラメータがあります。

#### javascript

```

anime({
  targets: '.amimation_', // セレクタ
  translateX: '5rem', // 現在地基準に移動
  scale: [.75, .9], // .75から.9へ変化
  delay: function(el, index) { // function(el, i){...}で複数の要素に処理
    return index * 80;
  },
  direction: 'alternate',
  loop: true,
  elasticity: 800
});


```

#### demo

- [ItemRevealer](http://tympanus.net/Development/ItemRevealer/)
- [LetterEffects](http://tympanus.net/Development/LetterEffects/)

#### 参考

- [軽量・簡単なのにいきいきしたアニメーションが付けられる！anime.jsを触ってみた](https://liginc.co.jp/302886)
- [CSSライクでデザイナーに優しい！anime.jsはDOMアニメーションの新定番だ！](https://www.webprofessional.jp/animating-the-dom-with-anime-js/)
- [アニメーションライブラリ決定版か!?anime.jsで軽量・軽快に実装！](http://qiita.com/kyota/items/c46f44340a384e059a5e)

### velocity.js

jQuery版とJavaSCript版が用意されています。javascriptの`requestAnimationFrame`を利用してアニメーションを実行します。jQueryの`animate()`関数の煩雑になりがちなところを、同じような記述で補完するような使い方ができます。

- [velocityjs](http://velocityjs.org/)
- [velocityjs github](https://github.com/julianshapiro/velocity)

#### javascript

```

var element = document.querySelector('.animate_');

Velocity(element,
  {
    translateX: 1000,
    width: 200,
  }, {
    easing: 'easeInSine',
    duration: 1000,
    loop: true
  }
);


```

#### 参考

- [Velocity.js よみほぐし](http://qiita.com/mag4n/items/90f2897351f236a1067b)

### turnbox.js

あらゆるものを箱型にするスクリプト。

- [turnbox](http://noht.co.jp/turnbox)

## アニメーションを作成するためのツール

### cssanimate

![cssanimate](/images/uploads/2017/01/cssanimate.png)

キーフレームをタイムラインで調整しながら、オブジェクトをドラッグしたり変形させたりして、プロパティの値を直感的に触りながらプレビューできます。

- [cssanimate](http://cssanimate.com/)

### waitanimate

CSSの`@keyframes`を待機時間を含めたコードを吐き出すジェネレーターです。プリセットに素敵なアニメーションが実装されています。用意された`mixin`を利用してオリジナルのアニメーションを作成するのも簡単です。

以前に紹介してました。

- [CSSのkeyframesアニメーションで待機時間を指定したものを吐き出す WAIT! Animate](/tip/wait-animate/)

## svgアニメーション

### DrawSVG

- [jquery-drawsvg](http://leocs.me/jquery-drawsvg/)

### Lazy Line Painter

- [lazylinepainter](http://lazylinepainter.info/)

### vivus

- [vivus](https://maxwellito.github.io/vivus/)

### Walkway

- [walkway](https://connoratherton.com/walkway)

### mo.js

- [mo.js](http://mojs.io/)

## 素敵すぎるチュートリアル

- [BlockRevealers](https://tympanus.net/Development/BlockRevealers/)
- [MirrorEffect](https://tympanus.net/Development/MirrorEffect/)
- [ElasticCircleSlideshow](https://tympanus.net/Development/ElasticCircleSlideshow/)
- [Bubble Layout](http://codepen.io/sol0mka/pen/yNOage)

おわります。
