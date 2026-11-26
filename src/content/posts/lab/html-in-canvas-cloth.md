---
id: 3020
type: lab
slug: "html-in-canvas-cloth"
title: "HTML を WebGL のテクスチャにして、布のようにつまむ -『WebGL』"
date: 2026-11-08T00:42:13+09:00
excerpt: "canvas の子に置いた HTML を、HTML-in-Canvas の texElementSubImage2D で WebGL のテクスチャに写し、Verlet 積分で動かす格子に貼ると、欄に書いたりボタンを押したりできる布になります。API の基本の使い方と、布の動かし方、見た目と当たり判定がずれる間の扱いです。"
primaryTag: "WebGL"
terms:
  - { id: 340, name: "WebGL", slug: "webgl" }
  - { id: 176, name: "javascript", slug: "javascript" }
  - { id: 174, name: "canvas", slug: "canvas" }
demoUrl: https://labobal.dev/html-cloth/
draft: false
---

見出し、文、入力欄、チェックボックス、ボタンでできた HTML のカードを、WebGL で布のように描いています。余白をつまんで引っぱると持ち上がってしわが寄り、離すと机の上に戻ります。布が揺れている間も、欄に書いた文字はそのまま布に写ります。

<p><iframe src="https://labobal.dev/html-cloth/" width="100%" height="500" loading="lazy" title="HTML の布をつまむ（デモ）" allow="fullscreen"></iframe></p>

[別のタブで開く](https://labobal.dev/html-cloth/) / [コードを見る（GitHub）](https://github.com/uto-usui/laboobal-dev/tree/master/src/demos/html-cloth)

デモは Chrome 157 以降で動きます。ほかのブラウザでは、カードをふつうの HTML として置いた表示になります。

## HTML-in-Canvas とは

`<canvas>` の子に置いた HTML を、その canvas に描ける API です。これまで canvas の子は、canvas が使えないときに出す代わりの中身で、canvas が使えるブラウザでは表示されませんでした。HTML-in-Canvas では、canvas の子もふつうの HTML と同じようにレイアウトされ、クリックやフォーカスを受け取ります。ただし画面には出ず、JavaScript で canvas に描いたときだけ見えます。

描くときは、2D なら `drawElementImage`、WebGL なら `texElementSubImage2D` をつかいます。HTML の見た目が変わるたびに、その時点の見た目を写し直します。欄に文字を打てば、写っている欄にも文字が増えます。

ゆがめて描いても、HTML の要素は canvas の中に残っているので、入力やフォーカスはそのまま働きます。ただし、どこを押せばその要素に届くかは、ブラウザにじぶんで伝えます（あとの「当たり判定の位置を渡す」）。

## 基本の流れ

WebGL で HTML を描くまでの流れは次のとおりです。

1. canvas に `content="drawable"`、描きたい子に `drawable` を付ける
2. `paint` イベントが来たら、その子を WebGL のテクスチャに写す
3. 最初と、大きさが変わったときは、`requestPaint()` で `paint` を起こす
4. 当たり判定の位置を `updateElementGeometry` で渡す

### canvas の子に HTML を置く

デモでは、カード全体の `<article>` 1 つに `drawable` を付けています。次の HTML は、[Demo.astro](https://github.com/uto-usui/laboobal-dev/blob/master/src/demos/html-cloth/Demo.astro) からカードの部分を抜き出したものです。

```html
<div class="stage">
  <!-- 子の HTML を、この canvas に描けるようにする -->
  <canvas class="cloth" content="drawable">
    <!-- カードを中身ごと 1 枚の絵として描く -->
    <article class="sheet" drawable>
      <p class="kicker">html in canvas</p>
      <h1>この布は本物の HTML</h1>
      <!-- … -->
      <label class="field">
        <span>なまえ</span>
        <input type="text" placeholder="ここに書く" autocomplete="off">
      </label>
      <div class="row">
        <label class="check"><input type="checkbox" autocomplete="off"> 重い布</label>
        <button type="button">押した回数 <output>0</output></button>
      </div>
    </article>
  </canvas>
</div>
```

`drawable` を付けた要素は、その中身ごと 1 枚の絵として描かれます。中の入力欄やボタンを別々に動かしたいときは、それぞれに `drawable` を付けると、親の絵から外れて別に描けます。布のデモはカードを 1 枚の布として動かすので、`<article>` だけに付けています。

### paint でテクスチャに写す

canvas の子の見た目が変わると、canvas に `paint` イベントが来ます。デモでは、文字を打つ、チェックを入れる、フォーカスが移る、といったときに来ます。

次のコードは、`paint` が来るたびに、カードの大きさに合わせてテクスチャの領域を用意し、カードのいまの見た目を写します。

```ts
// gl は WebGL2 のコンテキスト、sheet はカードの <article>
const texture = gl.createTexture()
let texW = 0 // いま確保してあるテクスチャの幅と高さ
let texH = 0
// …

canvas.addEventListener('paint', () => {
  // カードを描いたときの大きさ（canvas の画素）
  const size = canvas.getElementImageDefaultSize(sheet)
  const w = Math.ceil(size.width)
  const h = Math.ceil(size.height)
  if (!w || !h) return
  gl.bindTexture(gl.TEXTURE_2D, texture)
  if (w !== texW || h !== texH) {
    texW = w
    texH = h
    // 領域だけを取る。中身は送らない（最後の null）
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
  }
  // カードのいまの見た目を、テクスチャの左上から書き込む
  gl.texElementSubImage2D(gl.TEXTURE_2D, 0, 0, 0, sheet)
  // 止まっていた描画のループを起こす（このあと説明）
  awake = true
})
```

`texElementSubImage2D` は、すでにあるテクスチャの一部を書き換える関数です。この関数は領域を確保しないので、先に `texImage2D` で確保しておきます。確保し直すのはカードの大きさが変わったときだけで、ふだんは同じ領域に上書きするだけです。

`texElementSubImage2D` の引数は、テクスチャの種類、ミップマップの段、書き込む位置の x と y、要素の順です。位置を変えれば、1 枚のテクスチャに複数の要素を並べて写せます。

`paint` の中では布を描いていません。布は HTML が変わらなくても毎フレーム動くので、描くのは `requestAnimationFrame` で回しているループの側です。

次のコードが、そのループです。毎フレーム布を動かして描き、布が止まったら休みます。

```ts
// loop は requestAnimationFrame で毎フレーム呼び、前のフレームからの秒数を渡す
loop((dt) => {
  // 休んでいる間と、格子（count）やテクスチャ（texW）がまだないときは何もしない
  if (!awake || !count || !texW) return
  // 布を動かし、いちばん大きく動いた点の移動量を受け取る
  const moved = simulate(dt)
  render()
  // 誰もつまんでおらず、布がほぼ動かなくなったら休む
  if (grabbed < 0 && moved < 0.001 && lift < 0.01) awake = false
})
```

布が机の上で止まり、HTML も変わらない間は、何も描きません。

### requestPaint で描き直しを頼む

HTML が変わっていなくても写し直したいときは、`canvas.requestPaint()` を呼びます。次のフレームで `paint` が 1 回来ます。

デモでは、画面やカードの大きさが変わったときに呼んでいます。`getElementImageDefaultSize` が返す大きさは、canvas の画素で数えた値です。canvas の解像度を変えるとこの大きさも変わるので、HTML の中身が変わっていなくても、テクスチャを確保し直して写し直します。

次のコードは、大きさが変わるたびに、canvas の解像度とカードの置き場所を決め直し、最後に `paint` を頼みます。

```ts
const layout = () => {
  const rect = canvas.getBoundingClientRect()
  W = rect.width
  H = rect.height
  // canvas の画素を画面の画素にそろえる（pixelRatio は devicePixelRatio を 2 で止めた値）
  const dpr = pixelRatio()
  canvas.width = Math.round(W * dpr)
  canvas.height = Math.round(H * dpr)
  // カードの幅は 340px まで。狭い画面では左右に 16px ずつ空ける
  sheet.style.width = `${Math.min(340, W - 32)}px`
  sheetW = sheet.offsetWidth
  sheetH = sheet.offsetHeight
  // カードを canvas の真ん中に置く
  originX = (W - sheetW) / 2
  originY = (H - sheetH) / 2
  build() // 布の格子を、カードの大きさで作り直す
  placeHitArea() // 当たり判定を置き直す（次の節）
  canvas.requestPaint() // 次のフレームで paint を起こし、テクスチャを写し直す
}
// onResize は ResizeObserver で、大きさが変わるたびに呼ぶ
onResize(canvas, layout)
// カードの高さだけが変わったときも置き直す
onResize(sheet, () => {
  if (sheet.offsetHeight !== sheetH && W) layout()
})
```

ResizeObserver は監視を始めたときにも 1 回呼ぶので、ページを開いた直後の最初のテクスチャも、この `requestPaint` で写ります。ループは `texW` が 0 の間は描かないので、最初の `paint` が来るまで待ちます。

### 当たり判定の位置を渡す

canvas の子は、画面に出ていなくてもクリックやフォーカスを受け取ります。そのためには、要素が canvas のどこに描かれているかを、ブラウザに伝える必要があります。

2D の `drawElementImage` は、描いた位置をブラウザが自動で当たり判定につかいます。WebGL では、テクスチャをどの形に貼るかはシェーダーの中で決まるので、ブラウザからはわかりません。そこで `canvas.updateElementGeometry` に `canvasTransform` を渡して、描いた位置を伝えます。`canvasTransform` は、要素の border-box を canvas の上の描いた位置へ移す行列で、値は CSS ピクセルで書きます。

次のコードは、カードの当たり判定を、平らに置いた布と同じ位置に置きます。

```ts
const placeHitArea = () => {
  canvas.updateElementGeometry(sheet, {
    // カードの左上を (originX, originY) へ動かすだけ。大きさと向きはそのまま
    canvasTransform: new DOMMatrix().translate(originX, originY),
  })
}
```

布は平らなとき、カードと同じ大きさで `originX`、`originY` に描かれるので、平行移動だけの行列になります。この位置は画面やカードの大きさが変わったときにしか動かないので、`layout` の中で 1 回だけ呼んでいます。布が浮いている間の当たり判定をどうしているかは、次の節で書きます。

## 布が浮いている間は、HTML に触らせない

当たり判定は、布を机の上に平らに置いた位置に固定しています。`updateElementGeometry` に渡せるのは行列 1 つなので、当たり判定はカードの四角を動かしたり傾けたりした形にしかなりません。しわの寄った布の形には合わせられないので、布が浮いている間は、見た目と当たり判定がずれます。

そこで、欄やボタンが使えるのは、布が平らに置かれているときだけにしました。布が浮いている間は、どこを押しても布をつまむ側になります。

次のコードは、押されたときに、HTML にそのまま任せるか、布をつまむかを決めます。

```ts
// HTML に任せる要素。平らなときに、ここを押したら布はつままない
const INTERACTIVE = 'input, button, label, a, select, textarea'

// stage は canvas を囲む要素
stage.addEventListener('pointerdown', (e) => {
  if (e.button !== 0) return
  const target = e.target as Element
  // 平らに置かれていて、欄やボタンを押したときは、何もせず HTML に任せる
  if (isFlat() && target.closest(INTERACTIVE)) return
  const [x, y] = local(e) // canvas の左上からの位置
  const n = pick(x, y) // 画面の上でいちばん近い格子の点。布から離れすぎていたら -1
  if (n < 0) return
  // フォーカスを動かさない
  e.preventDefault()
  grabbed = n // つまんでいる点の番号。離すと -1 に戻す
  // …
  stage.setPointerCapture(e.pointerId) // stage の外へ出ても、離すまで動きを受け取る
})
```

`isFlat` は、布の格子のすべての点が置いた場所から 2px 以内にあり、高さも 2px 以下なら `true` を返します。布が浮いているときは、見た目では余白を押したつもりでも、当たり判定では入力欄の上を押していることがあります。それでもつまむ側に回るので、思わぬ欄にフォーカスが移ることはありません。

`e.preventDefault()` で、つまんだときにフォーカスが動かないようにしています。入力欄に書きかけのまま布をつまんでも、フォーカスは欄に残ります。つまんでいる間にキーを打てば、揺れている布の上で文字が増えていきます。

## 使えるかを確かめ、使えないときは canvas の外へ出す

使えないブラウザでは、canvas の子は描かれません。何もしなければ、デモの場所は空白になります。そこで、使えるかを先に確かめ、使えないときはカードを canvas の外へ出して、ふつうの HTML として置きます。

次のコードは、使えるかを確かめ、使えないときはカードを canvas の外へ移して、その下に 1 行の案内を添えます。

```ts
const gl = canvas.getContext('webgl2', {
  antialias: true,
  premultipliedAlpha: true,
})
// canvas の側と WebGL の側の両方が対応しているか
const supported =
  canvas.content === 'drawable' && !!gl && 'texElementSubImage2D' in gl

if (!supported) {
  // stage は canvas を囲む要素。is-flat でカードを真ん中に置く CSS に切り替える
  stage.classList.add('is-flat')
  // drawable を付けたままだと、canvas の外では描かれない
  sheet.removeAttribute('drawable')
  stage.append(sheet) // カードを canvas の外へ移す
  canvas.remove()
  // カードの下に、使えないことを 1 行添える
  const note = document.createElement('p')
  note.className = 'flat-note'
  note.textContent =
    'この環境では HTML-in-Canvas が使えないので、ふつうの HTML のまま置いています'
  stage.append(note)
} else {
  start(gl!) // 布のデモを始める
}
```

`canvas.content` は、使えるブラウザでは属性の値の `'drawable'` を返し、使えないブラウザでは `undefined` になります。デモでは、canvas が `content="drawable"` に対応していることと、WebGL2 のコンテキストに `texElementSubImage2D` があることの両方を確かめています。WebGL2 のコンテキストが取れないときも、使えないときと同じ扱いです。

カードを canvas から出すときは、`drawable` 属性も取ります。使えるブラウザでは、`drawable` を付けた要素は canvas の外では描かれないためです。付けたままにすると、WebGL2 だけが取れなかったときに、カードが消えます。

## 布の動かし方

ここからは HTML-in-Canvas から離れて、布そのものの動かし方です。布の計算と描画は、どちらも [main.ts](https://github.com/uto-usui/laboobal-dev/blob/master/src/demos/html-cloth/main.ts) の中にあります。

### Verlet の格子と距離の拘束

布は、横を 24 マスに分けた格子です。縦の分割数は、カードの縦横比から決めます。格子の各点は、位置 `pos` と 1 ステップ前の位置 `prev` を持ち、その差を速度としてつかう Verlet 積分で動かします。

点どうしは、決めた距離を保とうとする拘束でつないでいます。

| つなぎ方 | 役割 | 強さ |
| --- | --- | --- |
| 隣どうし（縦、横） | 布が伸びないようにする | 1 |
| 斜め | 格子がひし形につぶれないようにする | 1 |
| 1 つ飛ばし（縦、横、斜め） | 折れ曲がりにくくする | 0.22（重い布は 0.6） |

1 つ飛ばしのつなぎを強くするほど、布は張りのある厚い布のようになり、弱くするほど、細かいしわが寄ります。カードの「重い布」にチェックを入れると、この強さを 0.6 にし、重力も 2 倍にします。

次のコードは、すべてのつなぎについて、両端の 2 点の距離を決めた長さに近づけます。1 ステップの中では、先に次の節のコードで各点を進めてから、この拘束を 10 回くり返して解きます。

```ts
// pos は点ごとに x, y, z の 3 つを並べた配列
// constraints は { a, b, len, k }。点 a と点 b を、長さ len、強さ k でつなぐ
const isHeavy = heavy.checked // 「重い布」のチェック
const bend = isHeavy ? 0.6 : 0.22
// …
for (let it = 0; it < 10; it++) {
  for (const c of constraints) {
    // 1 つ飛ばしのつなぎは k を -1 にしてあり、布の重さで強さを替える
    const k = c.k < 0 ? bend : c.k
    const a = c.a * 3
    const b = c.b * 3
    const dx = pos[b] - pos[a]
    const dy = pos[b + 1] - pos[a + 1]
    const dz = pos[b + 2] - pos[a + 2]
    const d = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1
    // 決めた長さからのずれを、両端から半分ずつ詰める（k が小さいほど少しだけ）
    const f = ((d - c.len) / d) * 0.5 * k
    pos[a] += dx * f
    pos[a + 1] += dy * f
    pos[a + 2] += dz * f
    pos[b] -= dx * f
    pos[b + 1] -= dy * f
    pos[b + 2] -= dz * f
  }
  // … つまんだ点を置き直し（あとで説明）、机より下へ行った点を z = 0 に戻す
}
```

1 回で全部のつなぎを正しい長さにはできません。ある 2 点を直すと、その点につながるほかのつなぎがずれるからです。何回かくり返すうちに、全体が決めた長さに近づいていきます。

1 ステップは 1/120 秒で固定し、前のフレームからの経過時間をためて、その分だけステップを進めます。画面のリフレッシュレートが違っても、布の動きは変わりません。

### 机に着いているところは止める

布は机の上にあるので、高さ `z` が 0 より下にはいきません。机に着いている点と浮いている点で、動き方を変えています。

次のコードは、1 ステップごとに格子の点を 1 つずつ Verlet 積分で進めます。机に着いているかどうかで、減速の強さと、置いた場所へ引き戻す強さを変えます。

```ts
// rest は点ごとに、机の上に置いたときの x, y。STEP は 1/120 秒
const gravity = isHeavy ? 5200 : 2600 // 重力。「重い布」では 2 倍
for (let n = 0; n < count; n++) {
  const p = n * 3
  const x = pos[p]
  const y = pos[p + 1]
  const z = pos[p + 2]
  const onTable = z <= 0.01
  // 机に着いている点は摩擦で止まり、強く戻る。浮いた点は自由に動き、ゆっくり戻る
  const damp = onTable ? 0.7 : 0.985
  const home = onTable ? 90 : 18
  // 前のステップからの移動を速度とみなし、減速を掛ける
  const vx = (x - prev[p]) * damp
  const vy = (y - prev[p + 1]) * damp
  const vz = (z - prev[p + 2]) * 0.985
  prev[p] = x
  prev[p + 1] = y
  prev[p + 2] = z
  // 置いた場所へ引き戻す力。離れているほど強い
  const ax = (rest[n * 2] - x) * home
  const ay = (rest[n * 2 + 1] - y) * home
  // 速度と力から次の位置を決める。高さには重力を掛ける
  pos[p] = x + vx + ax * STEP * STEP
  pos[p + 1] = y + vy + ay * STEP * STEP
  pos[p + 2] = z + vz - gravity * STEP * STEP
}
```

机に着いている点は、速度を毎ステップ 0.7 倍にするので、すぐに止まります。浮いている点は 0.985 倍で、ほとんど減速しません。引き戻す強さも 90 と 18 で 5 倍ちがい、机に着いている点は置いた場所から離れにくくなっています。

この分け方がないと、角をつまんで引いたときに、布全体がずるっと机の上を滑って回ってしまいます。机に着いているところが止まっているので、つまんだところのまわりだけが持ち上がり、そこにしわが寄ります。

### 遠くへ引くほど高く持ち上げる

つまんだ点を持ち上げる高さは、つまんだ場所から遠くへ引くほど高くしています。

次のコードは、つまんだ点の目標の高さを決め、いまの高さ `lift` をそこへすこしずつ近づけます。

```ts
const LIFT = 40 // つまんだ直後の高さ（px）
const LIFT_MAX = 130 // 高さの上限（px）
// …
// grabRestX, grabRestY はつまんだ点の置いた場所、grabX, grabY はいまのポインターの位置
const target =
  grabbed >= 0
    ? Math.min(LIFT_MAX, LIFT + Math.hypot(grabX - grabRestX, grabY - grabRestY) * 0.35)
    : 0 // 離したら机の高さへ
// 1 ステップごとに、目標との差の 8% だけ近づける
lift += (target - lift) * 0.08
```

`Math.hypot` の部分が、つまんだ点を元の場所からどれだけ引いたかです。その 0.35 倍を 40px に足すので、200px 引くと 110px の高さになります。

布の端をつまんで内側へ寄せると、寄せた分だけ布が余ります。高さが一定だと、余った布は机の上で重なってつぶれますが、高く持ち上げておくと、布が上へ逃げて折り返り、しわになります。

つまんだ点は、ポインターの真下に見える位置へ置きます。布の点は、描くときに次の `project` で透視を付けて画面の位置に直しています。高さ `z` の点は、画面の中心からの距離が `FOCAL / (FOCAL - z)` 倍になって見えます。

```ts
const FOCAL = 1400 // 画面から目までの距離（px）
// 高さ z の点が、画面のどこに見えるか
const project = (x: number, y: number, z: number) => {
  const s = FOCAL / (FOCAL - z)
  return [W / 2 + (x - W / 2) * s, H / 2 + (y - H / 2) * s]
}
```

次のコードは、拘束を解くたびに、つまんだ点をポインターの真下に見える位置へ置き直します。`project` で広がる分を、先に中心へ縮めておきます。

```ts
if (grabbed >= 0) {
  const g = grabbed * 3
  // project の倍率の逆数。高さ lift で広がる分を打ち消す
  const s = (FOCAL - lift) / FOCAL
  pos[g] = W / 2 + (grabX - W / 2) * s
  pos[g + 1] = H / 2 + (grabY - H / 2) * s
  pos[g + 2] = lift
}
```

### 陰と影

布の陰は、フラグメントシェーダーで付けています。各点の法線は、JavaScript で左右と上下の点の差から求め、画面の位置と一緒に頂点のデータとして渡します。

次のシェーダーは、HTML を写したテクスチャに、法線と光の向きから求めた明るさを掛けます。入力は、頂点シェーダーから受け取る `vUv`（テクスチャの座標）と `vNormal`（法線）、JavaScript から渡す `uTex`（HTML を写したテクスチャ）です。出力は、その画素の色 `outColor` です。

```glsl
in vec2 vUv; // テクスチャの座標。カードの左上が (0, 0)、右下が (1, 1)
in vec3 vNormal; // その点の布の法線
uniform sampler2D uTex; // HTML を写したテクスチャ
out vec4 outColor;

void main() {
  vec3 n = normalize(vNormal);
  vec3 light = normalize(vec3(-0.35, -0.55, 1.0)); // 左上の手前から来る光
  if (!gl_FrontFacing) {
    // 裏返ったところは、テクスチャを貼らずに布の裏の色で塗る
    float shade = 0.75 + 0.35 * abs(dot(n, light));
    outColor = vec4(vec3(0.86, 0.84, 0.79) * shade, 1.0);
    return;
  }
  vec4 tex = texture(uTex, vUv);
  // 平らなとき（n が真上を向くとき）に 1 になるよう、light.z を引いてある
  float shade = clamp(1.0 + 0.7 * (dot(n, light) - light.z), 0.6, 1.08);
  // つや。これも平らなときに 0 になるよう引いてある
  vec3 h = normalize(light + vec3(0.0, 0.0, 1.0));
  float sheen = pow(max(dot(n, h), 0.0), 40.0) - pow(h.z, 40.0);
  outColor = vec4(tex.rgb * shade + max(sheen, 0.0) * 0.25 * tex.a, tex.a);
}
```

平らなとき、法線は真上の (0, 0, 1) なので、`dot(n, light)` は `light.z` と同じ値になり、明るさはちょうど 1 になります。机の上に置いたときは、もとの HTML の色がそのまま出ます。布が傾くと、光の来る左上を向いたところは明るく、反対を向いたところは暗くなります。

影は、同じ格子をもう 1 回、布の下に描いています。次のコードは、頂点のデータを作るときに、影の各点を高さに比例して右下へずらします。

```ts
// 格子の点ごとに。p は pos の中の位置、o は頂点データの中の位置、z は点の高さ
// 影は左上からの光で落ちる。高い点ほど右下へ離す。透視は付けず、机の上に置く
shadowVbo[o] = pos[p] + 3 + z * 0.35
shadowVbo[o + 1] = pos[p + 1] + 5 + z * 0.55
```

影のシェーダーは、布の端に近いところほど薄くして、影の輪郭をぼかします。入力はテクスチャの座標 `vUv` と点の高さ `vZ`、出力は影の色 `outColor` です。

```glsl
in vec2 vUv; // 布の上の位置。端が 0 と 1
in float vZ; // その点の高さ（px）
out vec4 outColor;

void main() {
  // 高い点ほど、端のぼかし幅を広げる
  float blur = 0.01 + vZ / 3000.0;
  vec2 e = smoothstep(vec2(0.0), vec2(blur), vUv) * smoothstep(vec2(0.0), vec2(blur), 1.0 - vUv);
  // 濃さは、机に着いたところで 0.32、高さ 120px 以上で 0.12
  float a = e.x * e.y * mix(0.32, 0.12, clamp(vZ / 120.0, 0.0, 1.0));
  // premultiplied alpha で出すので、色は 0 のまま濃さだけを渡す
  outColor = vec4(0.0, 0.0, 0.0, a);
}
```

持ち上げたところだけ影が離れて広がり、薄くなるので、どこが浮いているかがわかります。

### スマホで記事のスクロールを奪わない

スマホでは、デモの上を縦になぞっても記事を読み進められるようにしています。ふだんは `touch-action: pan-y` にしておき、縦になぞると記事がスクロールします。横に引くか、デモを 1 回タップしたあとなら、布を引っぱれます。

## API の名前と、Chrome 157 で確かめたこと（2026-11 時点）

HTML-in-Canvas は、オリジントライアルの間に、名前や引数が何度か変わっています。Chrome の [HTML-in-Canvas updates](https://developer.chrome.com/blog/html-in-canvas-ot-changes) によると、次のとおりです。

- Chrome 150: WebGL の `texElementImage2D` から、要らなかった引数（`level`、`srcFormat`、`destType`）がなくなった
- Chrome 155: `texElementImage2D` が `texElementSubImage2D` に変わり、書き込む位置の x と y の引数が増えた。テクスチャの領域は自動で確保されなくなったので、先に `texImage2D` で確保する
- Chrome 155: canvas の `layoutsubtree` 属性が `content="drawable"` になり、描く子に `drawable` を付けるようになった（改名の議論は [WICG/html-in-canvas の issue #169](https://github.com/WICG/html-in-canvas/issues/169)）
- Chrome 155: 2D の `drawElementImage` が値を返さなくなり、描いた位置がそのまま当たり判定の位置になった。それまでは、戻り値の行列を要素の `style.transform` にじぶんで当てていた

そのあと Chrome 157 で、正式に使えるようになりました（[HTML-in-Canvas in Chrome 157](https://developer.chrome.com/blog/html-in-canvas)）。早い時期の解説記事やデモには、`layoutsubtree` と `texElementImage2D` で書かれたものが残っています。今から書くなら、`content="drawable"` と `texElementSubImage2D` をつかいます。

ぼくは Chrome 157 で触りながら作り、次のことを確かめました。

- `drawable` を付けた要素は、canvas の外に置くと描かれない
- Playwright に入っている Chromium は 156 で、この API がまだない。E2E のテストは、使えないときの表示で通ることしか確かめられなかった

## three をつかわなかった理由

`texElementSubImage2D` は、いまバインドされている WebGL のテクスチャに HTML を直に写す API です。three の `Texture` を通すと、three が中で持っている WebGL のテクスチャを取り出してバインドする手間がかかります。描くものも布 1 枚とその影だけなので、WebGL2 を直に書きました。

## 同じ API で作ったほかのデモ

同じ API で、ほかに 3 つのデモを作りました。それぞれの記事では、ここに書いた基本を前提に、そのデモで加えたことを書いています。

4 本のデモで大事にしたのは、次の 2 つです。1 つは、置いたものに、その場にある理由があることです。もう 1 つは、紙なら紙に、水なら水に見えることです。絵巻・焚き上げ・水占みくじは、どれもこの 2 つに合わない案を捨てて、いまの形になりました。その経緯は、それぞれの記事の最後に書いています。

- [透ける絵巻](https://webmanab.com/lab/html-in-canvas-emaki/): 横に引いて読む絵巻。まだ開いていない巻きに、先の場面が裏から透けて見える
- [焚き上げの短冊](https://webmanab.com/lab/html-in-canvas-takiage/): 和紙の短冊に縦書きで書き、ちぎって篝火にくべると、書いた字ごと燃える
- [水占みくじ](https://webmanab.com/lab/html-in-canvas-mizu-mikuji/): 石の水盤を傾けると水が寄り、水にひたったところだけおみくじの字が出る

## 参考にしたもの

- [WICG/html-in-canvas](https://github.com/WICG/html-in-canvas)（[仕様](https://wicg.github.io/html-in-canvas/)）
- Chrome for Developers
  - [HTML-in-Canvas in Chrome 157: Interactive DOM inside 2D, WebGL, and WebGPU](https://developer.chrome.com/blog/html-in-canvas)
  - [HTML-in-Canvas: Technical concepts](https://developer.chrome.com/docs/web-platform/html-in-canvas/concepts)（`paint`、`requestPaint`、`updateElementGeometry` の説明）
  - [HTML in WebGL canvas](https://developer.chrome.com/docs/web-platform/html-in-canvas/webgl)（`texImage2D` で確保してから `texElementSubImage2D` で写す流れ）
  - [HTML-in-Canvas updates: Iterating toward a better Web API](https://developer.chrome.com/blog/html-in-canvas-ot-changes)（名前と引数の変わり方）
- [html-in-canvas.dev](https://html-in-canvas.dev/)（`layoutsubtree`、`drawElementImage`、`paint` イベントの説明と、使えるブラウザの案内。canvas には `layoutsubtree` と `content="drawable"` を両方付ける書き方です）
- [新API「HTML-in-Canvas」を紹介 - CanvasにHTMLを描くAPIは何を解決するのか？](https://ics.media/entry/260825/)（ICS MEDIA）
- Amit Sheen「[The Web Is Fun Again: First Experiments with HTML in Canvas](https://blog.master.dev/the-web-is-fun-again-first-experiments-with-html-in-canvas/)」（古い名前の `layoutsubtree` と `texElementImage2D` で書かれています）
