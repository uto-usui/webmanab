---
id: 1806
type: tip
slug: "webgl-three-start"
title: "Three.jsを気軽にはじめてみる。-『WebGL』"
date: 2017-12-22T14:36:27+09:00
modified: 2017-12-22T14:41:36+09:00
excerpt: "Three.js は、WebGLによる描画を直感的に扱うためのJavaScriptライブラリです。WebGLを複雑な手順を省略しながら、3DCGをJavaScriptとHTMLの知識で記述できます。 Three.js 初"
primaryTag: "Threejs"
terms:
  - { id: 128, name: "interactive", slug: "interactive" }
  - { id: 29, name: "javascript", slug: "javascript" }
  - { id: 304, name: "Threejs", slug: "threejs" }
  - { id: 129, name: "webGL", slug: "webgl" }
demoUrl: https://jsfiddle.net/yutousui/ctds2L6x/
legacy:
  prev: vuejs-animation
  next: ffmpeg-mp4-to-mp3
---

Three.js は、WebGLによる描画を直感的に扱うためのJavaScriptライブラリです。WebGLを複雑な手順を省略しながら、3DCGをJavaScriptとHTMLの知識で記述できます。

Three.js 初学者が、回転する立方体をGUIでコントロールできるところまでを実装していきます。細かい仕様の説明などは省いて、いい感じに描画してデバッグできるところまでを近道で紹介します。

## 描画までの大まかなイメージ

Three.js でオブジェクトを描画するまでの流れは、

- モデルが置かれる「シーン」(場所)を設定
- モデルを撮影するカメラや、「ライト」(光源)を準備
- 3Dモデルの「形」とその「表面素材」(光をどのように反射するか)を用意
- これらを合わせて「レンダラー」に渡す

そして実際の処理はざっくりと、

1. レンダラーを用意
2. シーンを用意
3. カメラを用意
4. 光源を用意
5. メッシュを用意
   1. ジオメトリー（形状）を用意
   2. マテリアル（表面素材）を用意
6. レンダリング
7. アニメーション

このような手順です。

### できるもの

順を追って説明していきますが、最終的なコードはこのようになります。

[🔨　DEMO: Three.js start – JSFiddle](https://jsfiddle.net/yutousui/ctds2L6x/)

```js

const init = () => {

  // サイズ
  const width = window.innerWidth;
  const height = window.innerHeight;

  // レンダラー
  const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#canvas')
  });
  // retina
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(width, height);
  // 背景色
  renderer.setClearColor(new THREE.Color(0x121212));

  // シーンを作成
  const scene = new THREE.Scene();

  // カメラを作成
  const camera = new THREE.PerspectiveCamera(45, width / height, .1, 10000);
  camera.position.set(0, 0, +1000);

  // x y z軸のガイド
  const axes = new THREE.AxesHelper(300);
  scene.add(axes);

  // 平行光源
  const directionalLight = new THREE.DirectionalLight(0xFFFFFF);
  directionalLight.position.set(0, 0, 1000);
  // シーンに追加
  scene.add(directionalLight);

  // 形状
  const geometry = new THREE.BoxGeometry(160, 90, 90);
  const material = new THREE.MeshStandardMaterial(.1);
  // オブジェクトとマテリアルをまとめる
  const mesh = new THREE.Mesh(geometry, material);
  // シーンに追加
  scene.add(mesh);

  // dat.GUI
  const controls = new function() {
    this.rotationSpeedX = 0.01;
    this.rotationSpeedY = 0.01;
  };

  const gui = new dat.GUI();
  gui.add(controls, 'rotationSpeedX', 0, 0.4);
  gui.add(controls, 'rotationSpeedY', 0, 0.4);

  // マウスイベント
  // X座標に追従
  let r = 0;
  let mouseX = 0;
  document.addEventListener('mousemove', (e) => {
    mouseX = e.pageX;
  });

  // 描画を更新してアニメーション
  const tick = () => {

    // マウスの位置の値を角度に変換
    const targetR = (mouseX / width) * 360;
    // イージング
    r += (targetR - r) * 0.04;

    // ラジアンに変換する
    const radian = r * Math.PI / 180;
    // 角度に応じてカメラの位置を設定
    camera.position.x = 1000 * Math.sin(radian);
    camera.position.z = 1000 * Math.cos(radian);
    // 原点方向を見る
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    // 回転
    mesh.rotation.x += controls.rotationSpeedX;
    mesh.rotation.y += controls.rotationSpeedY;

    renderer.render(scene, camera);

    // 最適なFPSで描画
    requestAnimationFrame(tick);

  };

  tick();

};

window.onload = init;


```

これを手順のとおりに説明していきます。

## 準備

描画する `canvas` を用意します。

```html

<canvas id="canvas"></canvas>


```

`three` を`yarn add` します。

```shell

yarn add three


```

`import` します。コンパイルはwebpackを通しているイメージです。

- 👍 [最新版で学ぶweb pack 3入門 – BabelでES2017環境の構築(React, Three.js, jQueryのサンプル付き) – ICS MEDIA](https://ics.media/entry/16028/2)

```js

import * as THREE from 'three';


```

webpack環境を省略するなら、CDNでもいいです。

```html

<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/89/three.min.js"></script>


```

## 実装

### レンダラーを用意

レンダラーはカメラの角度に基づいて、シーンがどのように見えるか計算してくれます。

`canvas` の指定、高解像対応、サイズ、背景色を指定します。

```js

// サイズ
const width = window.innerWidth;
const height = window.innerHeight;

// レンダラー
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#canvas')
});
// retina
renderer.setPixelRatio(window.devicePixelRatio);
// サイズをセット
renderer.setSize(width, height);
// 背景色
renderer.setClearColor(new THREE.Color(0x121212));


```

### シーンを用意

シーンは表示したい物体と光源を保存して管理するコンテナです。WebGLの世界をここで定義する感じです。

```js

// シーンを作成
const scene = new THREE.Scene();


```

### カメラを用意

`THREE.PerspectiveCamera(fov, aspect, near, far)` で画角、縦横比、クリッピング手前、クリッピング奥を設定します。

- 画角は視点から広がる角度を指定します。
- 縦横比は `canvas` 領域の縦と横に合わせたいので、幅を高さで割った比を与えます。
- クリッピング手前とクリッピング奥は、どこからどこまでの奥行を描画するか指定します。

`position.set(x, y, z)` でカメラの位置を決定します。

`scene.add(camera)` でシーンにカメラを追加します。

```js

// カメラを作成
const camera = new THREE.PerspectiveCamera(45, width / height, .1, 10000);
camera.position.set(0, 0, +1000);
scene.add(camera);


```

### 光源を設定

`THREE.DirectionalLight()` で、一定の方向で全体を照らす平行光源を作ります。`position.set()` で位置を決定します。`scene.add(directionalLight)` でシーンに光源を追加します。

```js

// 平行光源
const directionalLight = new THREE.DirectionalLight(0xFFFFFF);
directionalLight.position.set(0, 0, 1000);
// シーンに追加
scene.add(directionalLight);


```

### メッシュを作成

メッシュとはポリゴン (多角形) の集合で作られた3Dモデルのことで、2つの要素からできています。形の座標情報のジオメトリと、表面材質(光の反射具合)のマテリアルです。

ジオメトリとマテリアルを別々に定義してメッシュを作ります。

#### ジオメトリーの作成

ジオメトリを定義します。ジオメトリは形状を描画するための座標を指定することになります。

`THREE.BoxGeometry(x, y, z)` で箱型のジオメトリーを作ります。

#### マテリアルの作成

ジオメトリのマテリアル (表面材質) を作ります。表面材質は光が当たったときどのような反射をするのかを決定します。

`THREE.MeshStandardMaterial()` で簡易的な物理レンダリングのマテリアルを作ります。

#### メッシュにジオメトリとマテリアルをセットする

ジオメトリーとマテリアルを合わせて1つのメッシュにします。`THREE.Mesh(geometry, material)` というように渡します。`scene.add(mesh)` シーンにメッシュを追加します。

```js

// メッシュを作る
const geometry = new THREE.BoxGeometry(160, 90, 90);
const material = new THREE.MeshPhongMaterial();
// オブジェクトとマテリアルをまとめる
const mesh = new THREE.Mesh(geometry, material);
// シーンに追加
scene.add(mesh);


```

### レンダリング

これで描画に必要な準備ができました。`renderer` にシーンとカメラをセットして、レンダリングを実行することで描画が実現します。

```js

renderer.render(scene, camera);


```

### アニメーション

このままだとモデルもカメラも静止状態なので、あまり3Dを感じることができません。ここにアニメーションを実装することで3Dな描画になります。

`requestAnimationFrame` を使って連続してレンダリングして、その都度カメラやメッシュを動かすと、アニメーションが実現します。

マウスのx座標にカメラに追従させ、メッシュをゆっくり自転させてみます。

```js

// マウスイベント
// X座標に追従
let r = 0;
let mouseX = 0;
document.addEventListener('mousemove', (e) => {
  mouseX = e.pageX;
});

// 描画を更新してアニメーション
const tick = () => {

  // マウスの位置の値を角度に変換
  const targetR = (mouseX / width) * 360;
  // 簡単なイージング
  r += (targetR - r) * 0.04;

  // ラジアンに変換する
  const radian = r * Math.PI / 180;
  // 角度に応じてカメラの位置を設定
  camera.position.x = 1000 * Math.sin(radian);
  camera.position.z = 1000 * Math.cos(radian);
  // 原点方向を見る
  camera.lookAt(new THREE.Vector3(0, 0, 0));

  // 回転
  mesh.rotation.x += 0.01;
  mesh.rotation.y += 0.02;

  renderer.render(scene, camera);

  // 最適なFPSで描画
  requestAnimationFrame(tick);

};

tick();


```

これでアニメーションを含んだ、Three.js での3DCGの描画ができました。

## ユーティリティ

開発に便利なユーティリティ的なツールも実装してみます。

### dat.GUIで値を試せるようにする

アニメーションなどをdat.GUIでリアルタイムに変更できるようにします。こうすることで、実験的に値を試しながらコーディングを進めることができます。

```bash

yarn add dat.gui


```

```js

import * as dat from 'dat.gui/build/dat.gui.js';


```

もしくは、CDNで読み込みます。

```html

<script src="https://cdnjs.cloudflare.com/ajax/libs/dat-gui/0.6.5/dat.gui.min.js"></script>


```

変更したいプロパティを持たせたオブジェクトを作ります。初期値をここで指定します。

```js

const controls = new function() {
  this.rotationSpeedX = 0.01;
  this.rotationSpeedY = 0.01;
};


```

作成したオブジェクトをdatに渡します。値の変更できる範囲を指定します。

```js

const gui = new dat.GUI();
gui.add(controls, 'rotationSpeedX', 0, 0.4);
gui.add(controls, 'rotationSpeedY', 0, 0.4);


```

描画側にも渡します。

```js

mesh.rotation.x += controls.rotationSpeedX;
mesh.rotation.y += controls.rotationSpeedY;


```

### 3Dガイドを引いてわかりやすく

`THREE.AxesHelper()` でデバッグ用の原点からのガイド線を引くことができます。オブジェクトが空間のどこに描画されているかわかりやすくなります。

```js

const axes = new THREE.AxesHelper(300);
scene.add(axes);


```

これでようやく最初に挙げたデモと同じソースコードが完成しました◎

- [🔨　DEMO: Three.js start – JSFiddle](https://jsfiddle.net/yutousui/ctds2L6x/)

## もっと Three.js をはじめよう。

今回は近道で描画までたどり着きたかったので、メソッドの仕様や、アニメーションの仕組みなど細かいことは省略してしまいました。

ここから発展させていくには、いろいろなリソースがあるので、公式のリファレンスや、最近リリースされたICSさんの素晴らしい入門記事、またはオライリー本などを参考にしていくといいかな、と思います。

- [📖　three.js / documentation](https://threejs.org/docs/index.html#manual/introduction/Creating-a-scene)
- [📖　Three.js入門サイト – ICS MEDIA](https://ics.media/tutorial-three/index.html)
- [📖　O’Reilly Japan – 初めてのThree.js 第2版](https://www.oreilly.co.jp/books/9784873117706/)

おわります。
