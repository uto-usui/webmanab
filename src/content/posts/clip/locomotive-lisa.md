---
id: 3000
type: clip
slug: "locomotive-lisa"
title: "Locomotive — L.I.S.A."
date: 2026-10-29T10:12:22+09:00
primaryTag: "webGL"
terms:
  - { id: 57, name: "webGL", slug: "webgl" }
  - { id: 324, name: "vue", slug: "vue" }
  - { id: 276, name: "character", slug: "character" }
  - { id: 279, name: "sound", slug: "sound" }
  - { id: 224, name: "form", slug: "form" }
  - { id: 49, name: "interaction", slug: "interaction" }
  - { id: 59, name: "studio", slug: "studio" }
clipUrl: https://lisa.locomotive.ca/en
image: { src: "/images/clip/3000.webp", width: 1280, height: 720, thumb: "/images/clip/3000-640.webp" }
fullImage: { src: "/images/clip/3000-full.webp", width: 1000, height: 563 }
excerpt: "モントリオールのスタジオ Locomotive の、仕事の相談や応募を受けつけるページです。ブラウン管のテレビを頭にかぶった L.I.S.A. が、声と文字で話しかけてきます。"
---

モントリオールのスタジオ Locomotive の、仕事の相談や応募を受けつけるページです。ブラウン管のテレビを頭にかぶった L.I.S.A. が、声と文字で話しかけてきます。「Start a project」「Join the team」「Discover our culture」のどれかを選ぶと始まります。

マウスを動かすと、テレビの頭がそっちを向くのがおもしろい。まだなにも読んでいないのに、こっちを見ている人がいるので、ついクリックしてしまう。話しはじめると、画面がついて目があらわれます。前のセリフはぼけながら上に流れていって、チャットを読んでいるみたい。

Blender から glTF で書き出したモデルを、three.js で表示しています。glTF にアニメーションはついておらず、首と胴とケーブルにボーンが入っている。首と胴はマウスの位置をゆっくり追いかけていて、首は大きく、胴はすこしだけ回るので、体ごとこっちを向こうとする。ケーブルは、マウスを動かす速さに合わせて揺れて、止めると落ちつく。肩は、何もしていなくても ease-in-out でゆっくり往復しつづけています。スマホでは、ジャイロセンサーの値を拾って、同じように首が動く。

セリフは音声ファイルで用意されていて、再生中の音量を Web Audio の AnalyserNode で取って目のシェーダーに渡し、目の光がしゃべるのに合わせて変わる。話しているあいだは BGM を 5 分の 1 の音量まで下げて、話しおわると 2 秒かけて戻す。こういう細かいところまで手を入れて、テレビ頭の人と話している世界を心地よくつくっているのが素敵です。

で、やっていることは、名前や予算を聞いて送るだけのフォームなんですよね。それなのに、相談の質問には、どれもセリフがいくつか用意されていて、予算を聞くところでは「Is it rude to talk about money? I have no manners, I’m a computer.」なんて言ってくる。フォームひとつに、ここまでやるのか、と笑ってしまった。
