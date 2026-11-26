---
id: 3038
type: lab
slug: "cellular-automaton-cone-shell"
title: "1 列のセル・オートマトンで、育つ巻貝の殻に模様を残す -『WebGPU』"
date: 2026-11-19T10:16:37+09:00
excerpt: "殻口の縁に並べた 1 列のセルを 1 世代ずつ進め、その状態を伸びた殻に 1 行ずつ残すと、育ちながら三角の模様を描く巻貝になります。The Nature of Code 7 章のセル・オートマトンの考え方と、三角ができる決まり、それを WebGPU のテクスチャと曲面で描く方法です。"
primaryTag: "WebGPU"
terms:
  - { id: 368, name: "WebGPU", slug: "webgpu" }
  - { id: 369, name: "WGSL", slug: "wgsl" }
  - { id: 332, name: "interaction", slug: "interaction" }
demoUrl: https://labobal.dev/nature-shell/
draft: false
---

巻貝が育ちながら、殻口の縁に並んだセルの状態を 1 行ずつ殻に残していきます。殻には白と焦げ茶の三角の模様ができます。縁の近くをクリック（スマホではタップ）すると、そこからあたらしい三角が広がります。殻のないところをドラッグすると、殻を見る向きが変わります。

<p><iframe src="https://labobal.dev/nature-shell/" width="100%" height="500" loading="lazy" title="育ちながら殻に模様を残す巻貝（デモ）" allow="fullscreen"></iframe></p>

[別のタブで開く](https://labobal.dev/nature-shell/) / [コードを見る（GitHub）](https://github.com/uto-usui/laboobal-dev/tree/master/src/demos/nature-shell)

デモは WebGPU が使えるブラウザで動きます。使えないブラウザでは、暗い背景に「このブラウザは WebGPU に対応していません」と出ます。

The Nature of Code（Daniel Shiffman、2024 年版）の章の考え方を、自然の 1 場面にして WebGPU で動かすシリーズの 1 本で、この記事は 7 章「セル・オートマトン」を扱います。

## 殻は縁の 1 列の記録

巻貝の殻は、殻口の縁で伸びていきます。縁で付いた色は、伸びたあとの殻に残ります。殻の表面は、縁の 1 列の状態を古い順に並べた記録です。

デモでは、この 1 列を 1 次元のセル・オートマトンとして動かします。セル・オートマトンでは、並んだセルがそれぞれ状態を持ち、次の世代の状態を、そのセルと近く（近傍）のセルの今の状態から、全部のセルに同じ決まりを当てて求めます。全部のセルを一斉に更新するので、ある世代の計算には前の世代の値だけをつかいます。1 次元のセル・オートマトンは、世代を進めるたびにあたらしい列を前の列の下に並べて描くと、縦の向きが時間を表し、1 列の変化が 1 枚の模様として見えます。殻では、この縦の向きが殻の伸びる向きです。

いちばん単純な形では、状態が 0 と 1 の 2 つで、近傍が左隣、そのセル、右隣の 3 つです。3 つの値の組み合わせは 8 通りあり、それぞれの次の状態を 0 か 1 に決めるので、決まりは 2 の 8 乗の 256 通りになります。そのうちのルール 30 の模様は、イモガイの殻によく似ています。

このデモはルール 30 をつかわず、この基本形を広げた決まりで動かしています。セルの状態は 0 と 1 の 2 つではなく、活性、不応期の残り、前線、抑制の前線を持ちます。不応期の残りは、そのセルがすこし前に止められたことを覚えておく値で、自然発火は決まった確率で起きる発火です。決まりに確率を入れることや、セルに前の状態を覚えさせることは、7 章でも基本形の広げ方として挙げられています。

デモでは、セル・オートマトンの要素を次のように殻に当てています。

| セル・オートマトン | デモ |
| --- | --- |
| セル | 殻口の縁に並べた 384 個 |
| 近傍 | 縁で左右に隣り合うセル。縁は閉じた輪なので、0 番のセルの左隣は 383 番 |
| 状態 | 色素を出しているか（活性）、再び発火できるまでの残り（不応期）、左右へ進む前線、活性のセルを止めていく抑制の前線 |
| 1 世代 | 殻が 1 行伸びる。全部で 1,536 行 |

殻は 65% まで育ったところ（999 行目）から始まり、1 秒に 48 行ずつ伸びて、約 11 秒で育ちきります。最初の 999 行も同じ決まりで計算してから描いているので、始めから殻に模様の履歴があります。何も触らずに育ちきると、5 秒後に別の乱数の種で、65% のところから育ち直します。

## しくみ

### 三角ができる決まり

縁の上では、発火したセルから左右へ前線が進み、前線どうしがぶつかると、そこから抑制が返って活性のセルを止めていきます。この記事では、1 か所の発火から、抑制が止め終えるまでのひとまとまりを波と呼びます。1 行ごとに次の順で進めます。手順の中の数は「三角」の決まりの値です。

1. 不応期のセルの残りを 1 減らす
2. 前線を左右へ 1 セル進め、着いたセルを活性にする
3. 前線どうしがぶつかったセルを抑制する。抑制したセルは前線と色素を消して不応期に入り、左右へ抑制を返す。不応期のセルに着いた前線も、同じように抑制する
4. 抑制を左右へ 2 セル進める。抑制は活性のセルの上だけを進み、通ったセルの色素を止めて不応期に入れる
5. 活性と不応期のどちらでもないセルを、低い確率で発火させる（自然発火）
6. 各セルの活性と不応期の残りを、殻の 1 行として書き出す

三角は、この決まりから次のようにできます。

- 1 か所で発火すると、前線が 1 行に 1 セルずつ左右へ広がる。活性のセルは白く記録されるので、発火したところを頂点にして白い面が広がる
- 隣から来た前線とぶつかると、そこから抑制が返る。抑制は 1 行に 2 セル進み、前線が広がるより速いので、白い面はぶつかったところから削られていく。抑制は反対側へ広がっている前線にも追いついて、白い面を閉じる

40 セル離れた 2 か所を同時に発火させると、発火から 20 行で前線がぶつかり、59 行で波が消えます。三角の大きさや寿命を乱数で先に決める処理はなく、どこで発火し、どこでぶつかったかで形が決まります。

コードは [automaton.ts](https://github.com/uto-usui/laboobal-dev/blob/master/src/demos/nature-shell/automaton.ts) の `advance()` です。セルの状態は、セルの数（`CELLS`、384）の長さの配列で持ちます。`left` と `right` は左向きと右向きの前線があるか、`active` は活性か、`refractory` は不応期の残りの行数です。`inhibitLeft` と `inhibitRight` は、左向きと右向きの抑制の前線があるかです。`collision` は、その刻みで前線どうしがすれ違ったセルの印です。`next` の付く配列には次の状態を書き、書き終えてから今の配列と入れ替えます。`options` は決まりの値で、`spread` は 1 行で前線を進めるセル数、`inhibition` は抑制を進めるセル数、`rest` は不応期の長さです。

手順 2 と 3 は次のとおりです。

```ts
// 縁は閉じた輪なので、端の隣は反対の端
const wrap = (i: number) => (i + CELLS) % CELLS
// …（乱数と、セルを発火させる ignite は省略）

// セルを抑制する。色素と前線を消し、不応期に入れ、左右へ抑制を返す
const inhibit = (i: number) => {
  active[i] = left[i] = right[i] = 0
  refractory[i] = options.rest
  inhibitLeft[i] = inhibitRight[i] = 1
}
// …（advance() の始まりと、手順 1 の不応期を 1 減らす行は省略）

// 前線を 1 セルずつ、spread 回進める
for (let step = 0; step < options.spread; step++) {
  nextLeft.fill(0)
  nextRight.fill(0)
  collision.fill(0)
  for (let i = 0; i < CELLS; i++) {
    const before = wrap(i - 1)
    const after = wrap(i + 1)
    // 右向きと左向きの前線が、隣り合うセルの間ですれ違う
    if (right[i] && left[after]) {
      collision[i] = collision[after] = 1
    }
    if (left[i]) nextLeft[before] = 1
    if (right[i]) nextRight[after] = 1
  }
  for (let i = 0; i < CELLS; i++) {
    // すれ違ったか、左右の前線が同じセルに着いた
    if (collision[i] || (nextLeft[i] && nextRight[i])) {
      inhibit(i)
      nextLeft[i] = nextRight[i] = 0
    } else if (nextLeft[i] || nextRight[i]) {
      if (refractory[i]) {
        // 不応期のセルに着いた前線も消え、抑制を返す
        inhibit(i)
        nextLeft[i] = nextRight[i] = 0
      } else active[i] = 1
    }
  }
  // 次の状態を今の状態にする
  ;[left, nextLeft] = [nextLeft, left]
  ;[right, nextRight] = [nextRight, right]
}
```

前線どうしのぶつかり方は 2 通りあります。左右の前線が同じセルに着く場合と、隣り合う 2 つのセルの間ですれ違う場合です。前線どうしの間が偶数セルか奇数セルかで、どちらになるかが変わります。すれ違う場合を数えないと、前線は互いを通り抜けてしまいます。

手順 4 の抑制は、隣のセルが活性のときに限って進みます。

```ts
// 抑制を 1 セルずつ、inhibition 回進める
for (let step = 0; step < options.inhibition; step++) {
  nextInhibitLeft.fill(0)
  nextInhibitRight.fill(0)
  for (let i = 0; i < CELLS; i++) {
    // 隣が活性のときだけ、抑制がそこへ進む
    if (inhibitLeft[i] && active[wrap(i - 1)])
      nextInhibitLeft[wrap(i - 1)] = 1
    if (inhibitRight[i] && active[wrap(i + 1)])
      nextInhibitRight[wrap(i + 1)] = 1
  }
  for (let i = 0; i < CELLS; i++)
    if (nextInhibitLeft[i] || nextInhibitRight[i]) {
      // 抑制が着いたセルの色素と前線を止め、不応期に入れる
      active[i] = left[i] = right[i] = 0
      refractory[i] = options.rest
    }
  ;[inhibitLeft, nextInhibitLeft] = [nextInhibitLeft, inhibitLeft]
  ;[inhibitRight, nextInhibitRight] = [nextInhibitRight, inhibitRight]
}
```

抑制は活性のないところへは進まないので、白い面を閉じ終えた抑制はそこで消えます。

手順 5 と 6 では、自然発火のあとに、その行の状態を色の履歴（`history`）に書き出します。`history` は 384 × 1,536 の画像の RGBA の値を並べた配列で、横がセル、縦が行です。`automatic` は何も触っていない間だけ `true` で、`random()` は種を決めた乱数、`ignite(i)` はそのセルを活性にして左右へ前線を出す関数です。`historyRow(row)` は、何行目かを画像の行の番号に直す関数です（育ちきったあとの扱いは「WebGPU で殻に描く」で書きます）。

```ts
// 何も触っていない間は、休んでいるセルをまれに発火させる
if (automatic)
  for (let i = 0; i < CELLS; i++)
    if (!active[i] && !refractory[i] && random() < options.spontaneous)
      ignite(i)
const offset = historyRow(row) * CELLS * 4
for (let i = 0; i < CELLS; i++) {
  // R は活性（0 か 255）、G は不応期の残り（0〜255）
  history[offset + i * 4] = active[i] * 255
  history[offset + i * 4 + 1] = Math.min(
    255,
    Math.round((refractory[i] / options.rest) * 255),
  )
  history[offset + i * 4 + 3] = 255
}
row++
```

書き出すのはセルの状態で、三角の輪郭や色の濃淡を足す処理はありません。殻の白いところは R が 255 のセルで、ほかは焦げ茶から黄土の地です。

### 決まりの値を変える

右上の「設定」を開くと、「模様の決まり」で 3 つの値の組を選べます。手順はどれも同じで、変えているのは次の 4 つの値です。

| 決まり | 前線の速さ（セル/行） | 抑制の速さ（セル/行） | 不応期（行） | 自然発火の確率 |
| --- | --- | --- | --- | --- |
| 三角 | 1 | 2 | 1 | 0.0018 |
| 縞 | 3 | 6 | 54 | 0.0018 |
| 網目 | 1 | 1 | 22 | 0.003 |

自然発火の確率は、活性と不応期のどちらでもないセルが、1 行のうちに発火する確率です。決まりを変えても殻は作り直さず、それまでの模様を残したまま、次の行からあたらしい値で進めます。変えたときは 192 番のセルを発火させるので、あたらしい決まりの波がそこから広がります。まだデモに触っていなければ、発火させる前に見本の波と自然発火を止めます。一度触ったあとなら、進んでいる波は残り、あたらしい値で進みます。「設定」の「新しい貝」で殻を作り直すと、選んだ決まりの自然発火の確率で育ちます。

### WebGPU で殻に描く

オートマトンは JavaScript で進め、GPU には書き出した行を送ります。殻の色は 384 × 1,536 のテクスチャ 1 枚で、上の `history` を写したものです。描くまでの流れは次のとおりです。

1. フレームごとに、そのあいだに進めた行をテクスチャに書き込む
2. 殻の曲面の頂点に、成長の向きの位置（何行目か）と、縁の周りの位置（どのセルか）を持たせる。頂点シェーダーがこの 2 つから 3 次元の位置を計算し、同じ 2 つをテクスチャの座標にする
3. 育ったところまでの三角形を描く

1 の書き込みは [main.ts](https://github.com/uto-usui/laboobal-dev/blob/master/src/demos/nature-shell/main.ts) の `uploadRange` です。殻を遠くから見ると 1 画素に何行も入るので、縮小した画像（ミップマップ）も JavaScript で作って送っています。`mips(from, to)` は、行 `from` から `to` までに関わるところを縮小した各段で平均し直し、段ごとに書き換えた範囲（`start` から `end`）とデータを返します。

```ts
const uploadRange = (from: number, to: number) => {
  for (const [mipLevel, level] of mips(from, to).entries()) {
    // この段で書き換えた行がなければ飛ばす
    if (level.end <= level.start) continue
    // 書き換えた行を、その段のその位置へ送る
    device.queue.writeTexture(
      { texture, mipLevel, origin: [0, level.start] },
      level.data.subarray(
        level.start * level.width * 4,
        level.end * level.width * 4,
      ),
      { bytesPerRow: level.width * 4, rowsPerImage: level.end - level.start },
      [level.width, level.end - level.start],
    )
  }
}
```

殻が育ちきったあとも縁で波を起こせるよう、最後の 192 行（殻口に近い 12.5%）は、あたらしい行を書くと古い行を押し出す形にしています。その内側の 1,344 行はそのまま残ります。書くときは、`historyRow(row)` が 1,536 行目より先の行を、この 192 行のどれかへ割り当てます。読むときは、フラグメントシェーダーが 192 行の中を書いた分（`historyOffset`）だけずらして、いちばんあたらしい行が殻口へ来るようにしています。

2 の頂点は、位置を持っていません。[geometry.ts](https://github.com/uto-usui/laboobal-dev/blob/master/src/demos/nature-shell/geometry.ts) の `createMesh` の中の `sheet` で、頂点ごとに 3 つの数を入れています。`sheet` は殻の本体と、殻口の外唇（薄い半円の断面の唇）の 2 回呼びます。本体では `steps` は成長の向きの分割数（1,536）で、外唇では 12 です。外唇の 1 つ目の数は、唇の断面の上の位置です。`SECTIONS` は縁の周りの分割数（256）、`layer` は本体なら 0、外唇なら 1 です。

```ts
// (成長の向きの位置, 縁の周りの位置, 本体か外唇か) を持つ
for (let j = 0; j <= steps; j++)
  for (let i = 0; i <= SECTIONS; i++)
    vertices.push(j / steps, i / SECTIONS, layer)
```

頂点シェーダーでは、この数を `param` として受け取り、位置とテクスチャの座標（`uv`）を同じ数から作ります。`shell.growth` はいまの殻の大きさ（完成で 1）、`START_SIZE` は始めの断面の大きさ（0.035）、`shape(size, v)` は大きさ `size` の殻の、縁の周りの位置 `v` の点です。WGSL は TypeScript の文字列で書いていて、`${}` のところには定数が入ります。

位置は `surfacePoint` で求めます。

```wgsl
fn surfacePoint(param: vec3f) -> vec3f {
  // その頂点が縁だったときの殻の大きさ。まだ育っていない頂点は、いまの縁に重ねる
  let size = min(${START_SIZE} + param.x * ${1 - START_SIZE}, shell.growth);
  // 本体は、その大きさのときの縁の点
  if (param.z < 0.5) { return shape(size, param.y); }
  // …（外唇の断面の計算は省略）
}
```

テクスチャの座標は、頂点シェーダーの出力（`o`）を作る `surface` で求めます。この `size` は `surfacePoint` と同じ値を別の式で書いたものです。シェーダーの `historyRow` は、上の TypeScript の `historyRow(row)` とは別の変数で、何行目かを 0〜1 の割合で持ちます。

```wgsl
let p = surfacePoint(param);
// …（接線の計算は省略）
let size = ${START_SIZE} + min(param.x, (shell.growth - ${START_SIZE}) / ${1 - START_SIZE}) * ${1 - START_SIZE};
// …（法線の計算は省略）
o.position = shell.viewProj * vec4f(p, 1.0);
// …（ほかの出力は省略）
// 何行目に記録したか（0〜1）。外唇はいまの縁の行を読む
let deposited = (size - ${START_SIZE}) / ${1 - START_SIZE};
let historyRow = select(deposited, (shell.growth - ${START_SIZE}) / ${1 - START_SIZE}, param.z > 0.5);
// 横はセル、縦は行。画素の中心を読むよう 0.5 ずらす
o.uv = vec2f((param.y * ${CELLS - 1}.0 + 0.5) / ${CELLS}.0, (historyRow * ${ROWS - 1}.0 + 0.5) / ${ROWS}.0);
```

育ちきる前は、殻のある点の色が、その点が縁だった行の、そのセルの状態になります。殻の形は、断面を `size` 倍に広げながら、`size` の対数に比例する角度だけ回して作っています。大きさが同じ割合で増えるたびに同じ角度だけ回るので、殻は等角螺旋に沿って巻きます。角度は `size` といまの大きさ `shell.growth` の比から決めているので、伸びている縁はいつも同じ角度になり、殻が育つにつれて古いところがその分だけ回っていきます。

フラグメントシェーダーでは、テクスチャの G（不応期の残り）で地の色を焦げ茶から黄土のほうへ寄せ、R でその地と白を混ぜています。

3 は、インデックスを古い行から並べておき、育った行までの数を描きます。1 行には縁の周りの 256 個の四角形があり、四角形 1 つは三角形 2 つ（インデックス 6 つ）です。`progress` は育った割合（0〜1）、`GROWTH_STEPS` は行の数（1,536）です。外唇のインデックスは本体のあとに並べてあり、`mesh.lipOffset` から `mesh.lipCount` 個を毎回描きます。

```ts
// 育った行までの、本体のインデックスの数
const bodyCount = Math.ceil(progress * GROWTH_STEPS) * SECTIONS * 6
// …（影の描画は省略。影も同じ数を描く）
if (bodyCount > 0) pass.drawIndexed(bodyCount)
// 外唇は本体のあとに並べてあり、毎回全部描く
pass.drawIndexed(mesh.lipCount, 1, mesh.lipOffset)
```

殻を伸ばす速さは、ほかのデモと共通の [`fixedStepper`](https://github.com/uto-usui/laboobal-dev/blob/master/src/shared/gpu/stepper.ts) で決めています。1/48 秒ごとに 1 世代（1 行）進めるので、画面の更新が 60Hz でも 120Hz でも、1 秒に進む世代の数は変わりません。

### 縁をクリックして波を起こす

クリックしたところからどのセルを発火させるかは、縁の 384 個のセルを 1 つずつ画面に投影して、クリックした位置との距離で決めます。40px 以内でいちばん近いセルを選び、40px 以内にセルがなければ、どのセルも発火させません。距離は CSS の px で測るので、画面の大きさや画素の密度が変わっても、届く範囲は同じです。

コードは geometry.ts の `nearestRimCell` です。`cells` はセルの数（384）、`matrix` はカメラの行列です。`shellPoint(growth, v, growth)` は、いまの縁の、位置 `v`（0〜1）の 3 次元の点で、`projectPoint` はその点を画面の -1〜1 の座標に直します。

```ts
export const nearestRimCell = (
  x: number, // クリックした位置（canvas の左上から、CSS px）
  y: number,
  width: number, // canvas の大きさ（CSS px）
  height: number,
  growth: number,
  matrix: Float32Array,
  cells: number,
) => {
  // ちょうど 40px の入力を、計算の丸めで落とさないよう少し広げる
  let nearest = 40 ** 2 + 1e-8
  let selected: number | undefined
  for (let i = 0; i < cells; i++) {
    // いまの縁の i 番のセルを、画面の位置に直す
    const point = projectPoint(
      shellPoint(growth, i / (cells - 1), growth),
      matrix,
    )
    const px = ((point[0] + 1) * width) / 2
    const py = ((1 - point[1]) * height) / 2
    const distance = (x - px) ** 2 + (y - py) ** 2
    // 40px 以内で、それまででいちばん近ければ選ぶ
    if (distance <= nearest) {
      nearest = distance
      selected = i
    }
  }
  return selected
}
```

殻の手前と奥のどちらの縁かは区別していません。縁の近くを押したのに、殻に隠れていると判定されて反応しない、ということが起きないようにしています。

選んだセルは、不応期の途中でも発火させます。1 行だけでは殻を小さく描いたときに見えないので、クリックの直後に同じ決まりで 8 行進めます。

デモのどこかを一度でも押すと（縁のクリックでも、ドラッグでも）、見本の波と自然発火を止め、クリックで起こした波だけを進めます。はじめて決まりを変えたときも同じです。波が全部消えると、殻も伸びるのをやめます。

ほかに波がないときに 1 か所だけクリックすると、前線にはぶつかる相手がいません。前線は縁を半周し、発火から 192 行で、反対側で互いにぶつかります。白い面がほぼ全周に広がってから閉じるので、大きな三角になり、波は発火から 288 行（約 6 秒）で消えます。何か所かクリックすると、前線が早くぶつかり、三角は小さくなります。

動きを減らす設定にしているときは、65% まで育った殻を止めたまま描き、クリックしたときに 96 行進めて描き直します。

## 参考にしたもの

- [The Nature of Code, Chapter 7: Cellular Automata](https://natureofcode.com/cellular-automata/)
- [Conus textile a1.jpg（MerlinCharon、Wikimedia Commons）](https://commons.wikimedia.org/wiki/File:Conus_textile_a1.jpg)
