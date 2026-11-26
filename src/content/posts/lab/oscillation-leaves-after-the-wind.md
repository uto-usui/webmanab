---
id: 3035
type: lab
slug: "oscillation-leaves-after-the-wind"
title: "角ばねと減衰で、風のあとに葉が 1 枚ずつ違う周期で揺れ戻る -『WebGPU』"
date: 2026-11-19T10:15:46+09:00
excerpt: "葉柄の 3 つの角度を、静止角へ戻す角ばねと速さに比例する減衰で動かすと、風がやんだあとの葉が 1 枚ずつ違う周期で揺れ戻ります。The Nature of Code 3 章（振動）の考え方を葉に当てはめた方法と、CPU で解いた姿勢を WebGPU で描く流れです。"
primaryTag: "WebGPU"
terms:
  - { id: 368, name: "WebGPU", slug: "webgpu" }
  - { id: 369, name: "WGSL", slug: "wgsl" }
  - { id: 212, name: "animation", slug: "animation" }
  - { id: 332, name: "interaction", slug: "interaction" }
demoUrl: https://labobal.dev/nature-aspen/
draft: false
---

秋のアスペンの小枝に付いた葉を、横になぞった手の速さと向きを風にして揺らします。速くなぞると葉がねじれて裏返り、手を止めると、葉は 1 枚ずつ違う周期で揺れ戻って、揺れがだんだんそろわなくなります。

<p><iframe src="https://labobal.dev/nature-aspen/" width="100%" height="500" loading="lazy" title="風のあとに揺れる葉（デモ）" allow="fullscreen"></iframe></p>

[別のタブで開く](https://labobal.dev/nature-aspen/) / [コードを見る（GitHub）](https://github.com/uto-usui/laboobal-dev/tree/master/src/demos/nature-aspen)

WebGPU が使えるブラウザで動きます。使えないブラウザでは、同じ配置の葉を静止画で表示します。左右の矢印キーでも風を送れます。

The Nature of Code（Daniel Shiffman、2024 年版）の章の考え方を、自然の 1 場面にして WebGPU で動かすシリーズの 1 本で、この記事は 3 章「振動」を扱います。固定の刻みで 1 歩ずつ進める組み立ては、[イワシの群れの記事](https://webmanab.com/lab/boids-sardine-school-webgpu/)の「WebGPU で 1/60 秒ずつ進める」と同じです。

## 3 章の考え方

3 章は、角度の動きと、行ったり来たりする動き（振動）の章です。このデモでは、そのうち次の 4 つをつかっています。

1. 角度にも速さと加速度がある。位置を速度で進め、速度を加速度で進めるのと同じ手順で、角度を角速度で進め、角速度を角加速度で進められる
2. 元の位置からのずれに比例して戻そうとする力（ばねの力）がかかると、物はその位置を中心に往復する
3. 振り子では、重力のうち振れる向きにかかる分が、振れた角度の sin に比例する。これを角加速度にすると、振り子が往復する
4. 1 歩ごとに角速度をすこしずつ小さくすると、揺れが収まっていく（減衰）

葉は、葉柄の付け根を支点にして回り、葉柄の硬さで元の向きへ戻ります。デモでは、この 4 つと、風から受ける力を次のように当てはめています。

| 考え方 | デモでの置き換え |
|---|---|
| 角度・角速度・角加速度 | 葉柄の傾き（2 軸）とねじれの、3 つの角度と角速度 |
| ばねの力 | 静止角からのずれに比例して戻すトルク |
| 振り子の重力 | 傾きの 2 軸にだけ、静止角からのずれの sin に比例して戻すトルク |
| 減衰 | 角速度に比例する逆向きのトルク。設定の「揺れの収まり」（標準 0.68） |
| 風から受ける力 | 風速から求めたトルク |

減衰は、角速度に 1 より小さい数を掛けるのではなく、角速度に比例する逆向きのトルクとして、ばねや風と同じ式に入れています。こうすると、次の節の式から周期と収まる速さを計算できます。

葉身のたわみも、風と傾きで決まる目標の値へ近づくばねとして別に解いています。小枝も 1 つの角ばねで、葉が受けた風の合計に押されて揺れ、葉の付け根ごと回ります。

## しくみ

### 葉柄の 3 つの角度を角ばねで戻す

1 枚の葉は、静止角（読み込むたびに乱数で変わる、風がないときの向き）からのずれとして、3 つの角度 `leaf.angle` と角速度 `leaf.velocity` を持ちます。並びは、画面の奥と手前への傾き、ねじれ、画面の中での左右の傾きの順です。

次のコードは、[simulation.ts](https://github.com/uto-usui/laboobal-dev/blob/master/src/demos/nature-aspen/simulation.ts) の `integrateLeaf` から、3 つの角度を 1 歩（1/120 秒）ぶん進めるループを引いたものです。`forces` は風から求めた 3 つの軸のトルク（あとの「風をトルクにする」）、`leaf.stiffness` は葉ごとの硬さ、`leaf.inertia` は葉ごとの慣性（回しにくさ）、`settings.damping` は減衰の係数、`dt` は 1 歩の時間（1/120 秒）です。

```ts
for (let axis = 0; axis < 3; axis++) {
  const a = leaf.angle[axis]
  // ばね定数は、葉の硬さに軸ごとの倍率を掛ける。ねじれ（axis 1）がいちばん柔らかい
  const k = leaf.stiffness * [1.3, 0.72, 1][axis]
  // 傾きの 2 軸には、ずれの sin に比例して静止角へ戻すトルクを足す
  const gravity = axis === 1 ? 0 : 2.3 * Math.sin(a)
  // 可動域（静止角からのずれで、ねじれは 1.65rad、傾きは 0.9rad）
  const limit = axis === 1 ? 1.65 : 0.9
  const excess = Math.max(0, Math.abs(a) - limit)
  // 可動域を超えた分に比例する強いばねと、外へ向かう速さに比例する減衰で押し返す
  const stop =
    Math.sign(a) *
    (320 * excess +
      (excess > 0 ? 10 * Math.max(0, Math.sign(a) * leaf.velocity[axis]) : 0))
  // 風のトルク − ばね − 重力 − 減衰 − 可動域
  const torque =
    forces[axis] -
    k * a -
    gravity -
    settings.damping * leaf.velocity[axis] -
    stop
  // トルクを慣性で割って角加速度にし、先に角速度を進める（±8 で止める）
  leaf.velocity[axis] = Math.max(
    -8,
    Math.min(8, leaf.velocity[axis] + (torque / leaf.inertia) * dt),
  )
  // 進めたあとの角速度で角度を進める
  leaf.angle[axis] += leaf.velocity[axis] * dt
}
```

トルクを慣性で割ると角加速度になります。位置の運動で、力を質量で割ると加速度になるのと同じ関係です。

最後の 2 行は、先に角速度を進め、その進めたあとの角速度で角度を進めています（半陰的 Euler 法）。進める前の角速度で角度を進める Euler 法では、1 歩ごとに、ばねの往復へすこしずつエネルギーが足され、減衰が弱いと振れ幅が大きくなっていきます。順番を入れ替えると、往復のエネルギーがほぼ保たれます。

可動域は静止角からのずれで測ります。強い風でねじれが大きくなると葉の裏が見え、可動域を超えると `stop` が押し返すので、長く風を送っても葉柄が何周も回りません。

### 葉ごとに周期をずらす

ばねで戻る往復の周期は、慣性と硬さで決まります。慣性が大きいほど、硬さが小さいほど、ゆっくり往復します。振れ幅が小さくなる速さは、慣性と減衰で決まります。

小さく揺れるときの目安として、ばね定数 k、慣性 I、減衰の係数 c から次の式で求められます。

- 周期: 2π ÷ √(k / I − (c / 2I)²)
- 振れ幅が 1/e（約 37%）になるまでの時間: 2I / c

ねじれのばね定数 k は、葉の硬さ `stiffness` の 0.72 倍で、重力は入りません。葉を作る順に、慣性と硬さを次の値にしていて、上の式で計算したねじれの周期は次の表のとおりです。可動域のばねと、葉がじぶんの動きで受ける風（次の節の `relative`）による減衰は入れていないので、大きく揺れるときは表より早く収まります。

| 葉 | 慣性 I | 硬さ stiffness | ねじれの周期 | 振れ幅が 1/e になるまで |
|---|---|---|---|---|
| 1 枚目 | 0.80 | 15 | 約 1.7 秒 | 約 2.4 秒 |
| 2 枚目 | 0.96 | 11 | 約 2.2 秒 | 約 2.8 秒 |
| 3 枚目 | 1.12 | 8.2 | 約 2.8 秒 | 約 3.3 秒 |
| 4 枚目 | 1.28 | 16 | 約 2.1 秒 | 約 3.8 秒 |
| 5 枚目 | 1.44 | 12 | 約 2.6 秒 | 約 4.2 秒 |
| 6 枚目 | 1.60 | 13 | 約 2.6 秒 | 約 4.7 秒 |

デモを表示する領域の幅が 600px 未満のときは、配置と大きさの違う 3 枚を描き、慣性と硬さは表の 1〜3 枚目と同じ値にしています。傾きの 2 軸はばね定数の倍率が大きく、重力の分も足されるので、周期は 1.2〜2.1 秒と短くなります。

同じ風を受けて同時に揺れはじめても、ねじれの周期が 1.7〜2.8 秒にばらけているので、1〜2 回往復するうちに葉ごとの向きがずれていきます。減衰の係数は全部の葉で同じなので、慣性の大きい葉ほど長く揺れ続けます。

### 風をトルクにする

風は、葉の位置での横向きの風速 1 つで表します。なぞったときは、なぞる速さ（px/秒）を 420 で割った値を、なぞった向きの符号付きで全部の葉に渡します。±3.5 で止め、なぞる手を止めて 0.1 秒たつと 0 にします。なぞっている間と離したあとの 4 秒は、ときどき吹く風と弱いそよ風も止めます。その間の葉は、風を受けずにじぶんの周期で揺れ戻ります。

次のコードは、`integrateLeaf` の冒頭で、その風速 `wind` から 3 つの軸のトルクを求めるところです。`leaf.rest` は静止角、`leaf.stem` は葉柄の長さ、`leaf.length` は葉身の長さです。1 行目の `pitch` と `roll` は、ここではつかわず、関数の後ろでたわみの目標を求めるときにつかいます。

```ts
const [pitch, yaw, roll] = leaf.angle
// 葉のねじれの動きの分を引いて、葉から見た風速にする
const relative = wind - leaf.velocity[1] * 0.13
// 面の向きで受け方を変える係数。静止角と合わせたねじれで 0.32〜1 の間を動く
const incidence = 0.32 + 0.68 * Math.abs(Math.cos(leaf.rest[1] + yaw))
// 風速の 2 乗に比例させ、向きは残す
const pressure = relative * Math.abs(relative) * incidence
// 葉身の根元から 45% の位置で押されるとして、支点からの距離を掛ける（1.4 は大きさをそろえる定数）
const torqueScale = (pressure * (leaf.stem + leaf.length * 0.45)) / 1.4
// 3 つの軸に配る。ねじれのトルクをいちばん大きくする
const forces = [torqueScale * 0.28, torqueScale * 4.2, torqueScale * 0.45]
```

3 つの軸のうち、ねじれのトルクをいちばん大きくしています。速くなぞると葉が裏返るのはこのためです。

`incidence` は、静止角とねじれの角度から決まります。同じ風速を全部の葉に渡しても、葉ごとに静止角が違うので受けるトルクが違い、揺れはじめの振れ幅もそろいません。

左右の矢印キーと、ときどき吹く風は、なぞったときと違い、幅のある風の帯が秒速 5（シーンの単位）で葉の並びを横切ります。帯が通った順に、葉がすこしずつ遅れて揺れはじめます。

### 固定の刻みで進める

物理は、前のフレームからの経過時間に合わせて、1 歩 1/120 秒の固定の刻みで進めます。1 フレームに進めるのは 2 歩までで、上限に届いたフレームでは、残りの時間を捨てます。

次のコードは [main.ts](https://github.com/uto-usui/laboobal-dev/blob/master/src/demos/nature-aspen/main.ts) からの抜き出しです。`advance` は、葉ごとの風速を求め、全部の葉の `integrateLeaf` と次の節の当たりの処理、小枝の揺れを 1 歩ぶん進める関数です。ここの `dt` は、前の節までの 1 歩の時間とは別の、前のフレームからの経過時間（秒）です。

```ts
const stepper = fixedStepper(1 / 120, 2)
// …（毎フレーム呼ばれるループの中）
// 経過時間 dt に応じた歩数だけ、風と葉を進める
for (let steps = stepper.advance(dt); steps > 0; steps--) advance()
```

### 葉どうしと小枝に当たる

振動とは別に、葉身と葉柄のすべての組と、小枝とが突き抜けないように、1 歩ごとに距離を確かめています。近すぎる葉は、位置を直すか当たる手前で止め、近づく向きの速さだけを取り除きます。反発や摩擦の力は加えません。反発のばねをつかうと、いちばん近い部分が入れ替わって距離が段差のように変わる場所で、止まっている葉にばねが力を加え続けてしまうためです。当たりの処理は [contacts.ts](https://github.com/uto-usui/laboobal-dev/blob/master/src/demos/nature-aspen/contacts.ts) にあります。

### CPU で解いた姿勢を WebGPU で描く

物理は CPU の TypeScript で解き、GPU には 1 フレームに 1 回、葉ごとの姿勢と寸法、色を storage buffer で渡します。葉は頂点バッファを持たず、頂点シェーダーが頂点の番号から葉の面の点を計算します。

まず CPU 側です。静止角と 3 つの角度から葉の向きの 3 軸（横、縦、面の向き）を求め、付け根の位置や寸法と一緒に、1 枚 32 個の数（`vec4f` が 8 つ、128 バイト）に詰めます。次のコードは main.ts の `render` からの抜き出しで、`leafData` は 6 枚分の `Float32Array`、`branchAngle` は小枝の揺れの角度です。

```ts
for (let i = 0; i < leaves.length; i++) {
  const leaf = leaves[i]
  // 静止角と 3 つの角度、小枝の角度から、葉の 3 軸を求める
  const basis = leafBasis(leaf, branchAngle)
  leafData.set(
    [
      // 付け根の位置と葉柄の長さ
      ...leafPivot(leaf, branchAngle),
      leaf.stem,
      // 横の軸と葉身の幅
      ...basis[0],
      leaf.width,
      // 縦の軸と葉身の長さ
      ...basis[1],
      leaf.length,
      // 面の向きと、反りの量（たわみを足す）
      ...basis[2],
      0.07 + leaf.bend,
      // …（色と厚さ、葉ごとの位相と付け根の位置、葉柄の出る向き、輪郭の形の 4 つの vec4f）
    ],
    i * 32,
  )
}
// …（uniform の書き込み）
// 全部の葉を 1 回で GPU へ送る
device.queue.writeBuffer(leafBuffer, 0, leafData)
```

GPU 側では、同じ並びの構造体の配列として読みます。次の WGSL は [shaders.ts](https://github.com/uto-usui/laboobal-dev/blob/master/src/demos/nature-aspen/shaders.ts) からの抜き出しです。

```wgsl
struct Leaf {
  pivot: vec4f,   // xyz: 付け根の位置、w: 葉柄の長さ
  axisX: vec4f,   // xyz: 横の軸、w: 葉身の幅
  axisY: vec4f,   // xyz: 縦の軸、w: 葉身の長さ
  axisZ: vec4f,   // xyz: 面の向き、w: 反りの量
  color: vec4f,
  detail: vec4f,
  contact: vec4f,
  shape: vec4f,
}
@group(0) @binding(1) var<storage, read> leaves: array<Leaf>;

// 葉の座標の点 p を、付け根の位置と 3 軸でシーンの座標へ移す
fn leafWorld(p: vec3f, leaf: Leaf) -> vec3f {
  return leaf.pivot.xyz + leaf.axisX.xyz * p.x + leaf.axisY.xyz * p.y + leaf.axisZ.xyz * p.z;
}
```

葉の面は 72 行 × 24 列の格子で、1 マスを三角形 2 つ（頂点 6 つ）で描きます。描くときは、頂点の数を `72 × 24 × 6`、インスタンスの数を葉の枚数にして `draw` を呼びます。頂点シェーダーは、インスタンスの番号で `leaves` から 1 枚を取り、頂点の番号からマスの位置を求めて、葉の座標の点を作ってから `leafWorld` で移します。

次の `makeLeaf` の中の `${COLUMNS}` と `${ROWS}` には、WGSL を TypeScript のテンプレート文字列で組み立てるときに 24 と 72 が入ります。

```wgsl
fn makeLeaf(vertex: u32, id: u32) -> Surface {
  // id はインスタンスの番号。何枚目の葉か
  let leaf = leaves[id];
  // 頂点 6 つで 1 マス。c はマスの中の角（0 か 1 の組）
  let cell = vertex / 6u;
  let c = corner(vertex);
  // s は葉の横の位置（-1〜1）、t は付け根から先端までの位置（0〜1）
  let s = (f32(cell % ${COLUMNS}u) + c.x) / ${COLUMNS}.0 * 2.0 - 1.0;
  let t = (f32(cell / ${COLUMNS}u) + c.y) / ${ROWS}.0;
  // 輪郭、くぼみ、反りを入れた、葉の座標の点
  let p = leafLocal(s, t, leaf);
  // …（法線の計算）
  var o: Surface;
  o.world = leafWorld(p, leaf);
  // …（法線、色を塗る座標、画面上の位置を入れて返す）
}
```

CPU が送るのは 1 枚 128 バイトで、1 枚あたり 1 万を超える葉の頂点は、毎フレーム GPU が作ります。同じ頂点シェーダーの関数を、影を描くための深度のパスでもつかっています。

### 光を透かす

葉の色は、透けてくる光の計算にもつかっています。葉を通る光は、厚さに応じて指数的に弱まるとみなします（Beer–Lambert の法則）。葉の色を厚さ 1 のときに通す光の割合とみなして吸収の強さに直し、厚さを掛けて弱め方を求めます。葉脈は厚さと吸収を足して、明るい光の中でも暗い線として残します。

次の 2 行の変数は、それぞれ次の値です。

- `transmittedPigment`: 葉の色。明るいところではすこし金色へ寄せる
- `thickness`: 葉の厚さ。縁に近いほど、葉脈の上ほど、光に対して傾くほど厚い
- `vein`: 葉脈の上で大きくなる値。主脈で 1、側脈で 0.74 まで

```wgsl
// 色（通す割合）を吸収の強さに直す。0 に近い色は 0.015 で止める
let absorption = -log(max(transmittedPigment, vec3f(0.015)));
// 厚さを掛けて弱め、葉脈の分の吸収をさらに足す
let transmission = exp(-absorption * thickness - vec3f(vein * 0.95));
```

後ろの玉ぼけや空の抜けと重なるところほど、この透過光を明るくしています。

## 参考にしたもの

- [The Nature of Code, Chapter 3: Oscillation](https://natureofcode.com/oscillation/)
