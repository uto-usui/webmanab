---
id: 3037
type: lab
slug: "l-system-tree-growth"
title: "芽を一斉に書き換えて、タップした所に木を育てる -『WebGPU』"
date: 2026-11-19T10:16:20+09:00
excerpt: "枝と芽の 2 つの記号を、世代ごとに一斉に書き換える L-system で木を育てます。The Nature of Code 8 章のフラクタルの考え方をもとに、書き換えの世代を WebGPU で時間に割り当てて、木が育つ様子を見せます。"
primaryTag: "WebGPU"
terms:
  - { id: 368, name: "WebGPU", slug: "webgpu" }
  - { id: 369, name: "WGSL", slug: "wgsl" }
  - { id: 367, name: "interactive", slug: "interactive" }
  - { id: 212, name: "animation", slug: "animation" }
demoUrl: https://labobal.dev/nature-grove/
draft: false
---

地面をタップすると、その場所に苗が植わり、約 4 秒で枝葉を広げた若木に育ちます。植えるたびに幹の高さや枝の分かれ方が違う木になり、何本も植えると小さな林ができます。

<p><iframe src="https://labobal.dev/nature-grove/" width="100%" height="500" loading="lazy" title="タップした所に木が育つ林（デモ）" allow="fullscreen"></iframe></p>

[別のタブで開く](https://labobal.dev/nature-grove/) / [コードを見る（GitHub）](https://github.com/uto-usui/laboobal-dev/tree/master/src/demos/nature-grove)

WebGPU で描いています。WebGPU が使えないブラウザでは、デモの中に「このデモには WebGPU が必要です」と出ます。

右上の「次に植える木」を開くと、「芽の分岐」（芽がおもに 2 本に分かれるか、3 本に分かれるか）と、枝の角度（18〜42 度）を変えられます。変えた値は次に植える木からつかい、すでに植えた木は変えません。Enter か Space でも、見えている地面の空いたところに 1 本ずつ植えられます。木は 12 本までで、13 本目を植えると、いちばん古い木が薄くなって消えます。

The Nature of Code（Daniel Shiffman、2024 年版）の章の考え方を、自然の 1 場面にして WebGPU で動かすシリーズの 1 本で、この記事は 8 章「フラクタル」を扱います。

## 木はフラクタルの形をしている

The Nature of Code の 8 章は、フラクタルの章です。フラクタルは、一部を取り出して拡大すると、全体と似た形が出てくる図形です。

木はその例になります。幹が何本かの枝に分かれ、その枝がまた細い枝に分かれます。1 本の枝から先だけを見ると、小さな木の形をしています。そのため、「枝を 1 本伸ばし、先で何本かに分かれ、分かれた先でも同じことをする」という手順をくり返すと、木の形ができます。

8 章には、木の形をこのくり返しで書く方法として、再帰と L-system が出てきます。

| 方法 | くり返し方 |
| --- | --- |
| 再帰 | 枝を描く関数が、長さを縮めて同じ関数をもう一度呼び出す。枝が一定の長さより短くなったら止まる |
| L-system | 記号の並びを、記号ごとに決めた規則で書き換える。書き換えを 1 回するごとに世代が 1 つ進む |

章の木の節では、分かれる本数や角度を乱数で決めて、描くたびに違う木を作る話も出てきます。このデモは、L-system の書き換えに、この乱数を組み合わせています。

L-system では、1 回の書き換えで、そのときの芽が全部同時に枝になります。n 回目まで書き換えた形は、どの芽も同じ回数だけ書き換えを受けた形です。デモはこの性質をつかい、書き換え 1 回分を 0.7 秒の成長として見せています。再帰で描く順に枝を伸ばすと、1 本の枝の先が最後まで伸びてから次の枝に移るので、こうはなりません。

## しくみ

### 枝と芽の 2 つの記号

デモの規則は、枝 `F` と芽 `X` の 2 つの記号で書けます。

```text
X → F[X][X]
```

芽 `X` は、1 回の書き換えで、枝 `F` と、その先のあたらしい芽になります。`[` で枝の先の位置と向きを覚え、`]` でそこへ戻るので、間の芽は枝の先から分かれて伸びます。`F` を書き換える規則はないので、一度できた枝はそのまま残ります。向きを変える記号は書いていません。どちらへ伸びるかは、芽ごとに持たせています。

最初の並びを `X`（芽が 1 つ）にして書き換えると、次のように増えます。

```text
0 回目: X
1 回目: F[X][X]
2 回目: F[F[X][X]][F[X][X]]
```

1 回目で幹が 1 本と芽が 2 つ、2 回目で枝が 3 本と芽が 4 つになります。書き換えるたびに、前の回の芽が全部同時に枝へ変わります。

デモは、この並びを文字列としては持っていません。芽を配列で持ち、1 つずつに「どの枝の先にあるか」「どの向きへ伸びるか」「どの長さで伸びるか」を持たせています。書き換えでは、配列の芽を 1 つずつ枝に変え、その先に置く次の芽をあたらしい配列に入れます。芽が枝になるときは芽の長さで伸び、次の芽にはすこし縮めた長さを渡します（幹の先の芽だけは、幹の長さでなく木の高さから決めます）。

書き換えは 6 回で、植えたときに 6 回とも済ませます。育つ様子は、できあがった枝を世代の順に見せているもので、時間で書き換えているわけではありません（後の「書き換えの回を時間に割り当てる」で書きます）。

### 分かれる本数を確率で選ぶ

規則が `X → F[X][X]` の 1 つだけだと、どの木も同じ形になります。デモでは、芽が枝になったあと、次の芽をいくつ置くかを、世代ごとの確率で選びます。「芽の分岐」を 2 本にしたときの確率は次のとおりです。

| 世代 | 0 個（止まる） | 1 個 | 2 個 | 3 個 |
| --- | --- | --- | --- | --- |
| 1（幹） | なし | なし | 76% | 24% |
| 2 | なし | 27% | 約 55% | 約 18% |
| 3 以降 | 12% | 15% | 約 55% | 約 18% |

3 本にしたときは、2 個と 3 個の列が入れ替わります。0 個はその枝の先で伸びるのが止まること、1 個は分かれずに 1 本のまま先へ伸びることです。幹は必ず 2 本以上に分かれます。

1 回の書き換えのループは次のとおりです。`rng` は種（植えるたびに取る乱数のもとの値）から作った乱数、`traits` は同じ種から決めた木の性質、`branches` はできた枝の配列、`root` は根元の位置です。`settings` は右上で選んだ値です。`forks` が芽の分岐、`angle` が枝の角度、`generations` が書き換えの回数（6）です。`traits` の項目は次の節の表に書きます。`add`、`sub`、`mul`、`unit`、`cross` は 3 次元のベクトルの足し算、引き算、数を掛ける、長さを 1 にする、外積の関数です。`bendNoise` は位置からゆるやかに変わるノイズを返す関数、`light` は後で書く、近くの木を避ける向きです。枝の形を決める計算は省いています。全体は GitHub で読めます。

```ts
// 最初の芽は 1 つ。根元から上へ（traits.lean の分だけ傾けて）伸びる
let buds: Bud[] = [
  {
    parent: -1,
    heading: unit(add([0, 1, 0], traits.lean)),
    length: 1.02 * traits.height * traits.trunk,
  },
]
for (let generation = 1; generation <= settings.generations; generation++) {
  const next: Bud[] = [] // この回の書き換えでできる、次の芽
  for (const bud of buds) {
    const parent = branches[bud.parent]
    // 枝の起点。親の枝の先端か、親がなければ根元
    const a: V3 = parent ? parent.d : [...root]
    // 芽の向きに、近くの木を避ける向き light、片側へ寄せる分、
    // 上向きの補正、根元からの位置で決まるゆるいノイズを足す
    const steering = add(
      add(
        add(bud.heading, mul(light, 0.65)),
        mul(traits.bias, traits.dominance * 0.2),
      ),
      add([0, 0.1, 0], bendNoise(sub(a, root), traits.phase)),
    )
    // 枝が地面へ向かないよう、上への伸びを少し残す
    const direction = unit([
      steering[0],
      Math.max(0.08, steering[1]),
      steering[2],
    ])
    // …親の枝の先端の向き（幹は根元の傾いた向き）を start として決める
    const length = bud.length
    // …a から direction へ length 進んだ先端 d と、枝を曲げる 3 次ベジェ曲線の
    //   制御点 b、c を決める。b は start の向きに沿わせ、親の枝となめらかにつなぐ
    const id = branches.length
    branches.push({ id, parent: bud.parent, generation, a, b, c, d, length })
    // 次の芽の数。幹は必ず分け、2 世代目から一芽、3 世代目から止まる芽を混ぜる
    const chance = rng()
    const count =
      generation > 2 && chance < 0.12
        ? 0
        : generation > 1 && chance < 0.27
          ? 1
          : rng() < 0.24
            ? settings.forks === 2
              ? 3
              : 2
            : settings.forks
    // direction に直交する 2 つの向き。direction が z 軸に近いときは x 軸を基準にする
    const across = unit(
      cross(direction, Math.abs(direction[2]) < 0.85 ? [0, 0, 1] : [1, 0, 0]),
    )
    const side = cross(direction, across)
    // 芽を並べはじめる角度。世代ごとに回し、乱数でずらす
    const rotation = traits.phase + generation * 1.15 + (rng() - 0.5) * 1.4
    for (let i = 0; i < count; i++) {
      // 枝のまわりに等間隔で並べ、少しずつずらす
      const azimuth =
        rotation + (i * Math.PI * 2) / count + (rng() - 0.5) * 0.6
      // 枝から開く角度。一芽のときはほぼまっすぐ先へ伸ばす
      const turn =
        ((settings.angle * Math.PI) / 180) *
        traits.spread *
        (count === 1 ? 0.2 : 0.65 + rng() * 0.7)
      const lateral = add(
        mul(across, Math.cos(azimuth)),
        mul(side, Math.sin(azimuth)),
      )
      const heading = unit(
        add(
          add(mul(direction, Math.cos(turn)), mul(lateral, Math.sin(turn))),
          // 少し上向きと、木ごとに決めた片側（bias）へ寄せる分を足す
          add([0, 0.08, 0], mul(traits.bias, traits.dominance)),
        ),
      )
      next.push({
        parent: id,
        heading,
        // 次の芽の長さ。幹の先の芽だけは、幹の長さでなく木の高さから決める
        length:
          (parent ? length : 1.02 * traits.height) *
          traits.shrink *
          (0.8 + rng() * 0.36),
      })
    }
  }
  buds = next // 次の回は、この回にできた芽を全部書き換える
  rounds.push({ branches: branches.length, buds: buds.length }) // 回ごとの枝と芽の数を返り値に控える
}
```

`buds` の芽を全部枝にしてから `buds = next` で入れ替えるので、1 回の書き換えで、その回の芽が全部同時に枝になります。

### 1 本ずつ違う木にする

分かれ方の確率のほかに、木全体の性質も種から決めます。

| 性質 | 範囲 | 何につかうか |
| --- | --- | --- |
| `height` | 0.7〜1.3 倍 | 枝の長さの基準 |
| `trunk` | 0.68〜1.48 倍 | 幹の長さ。最初に分かれる高さを、木の高さとは別に変える |
| `thickness` | 0.75〜1.3 倍 | 枝の太さ |
| `spread` | 0.65〜1.5 倍 | 枝が開く角度 |
| `shrink` | 0.7〜0.85 倍 | 次の芽の長さ。さらに芽ごとに 0.8〜1.16 倍する |
| `lean`、`bias` | 向きは 1 周のどこか（2 つは同じ向き） | 根元の傾きと、片側へ伸びやすい向き |
| `dominance` | 0〜0.25 | 片側へ寄せる強さ |
| `phase` | 0〜2π | 芽を並べはじめる角度と、ノイズのずらし |

`trunk` を `height` と別にしているので、長い 1 本の幹から高いところで分かれる木と、低いところで分かれて広がる木の両方ができます。枝の曲がりは、根元からの位置に応じてゆるやかに変わるノイズで付け、植えたときに形を固めます。

あとから植える木は、近くにある先の木から離れる向きへすこし伸びます。日の当たる側へ伸びる様子を、近くの木の位置だけからおおまかにまねています。3 m 以内にある木から離れる向きを、近いほど重くして足し合わせ、長さを 0.22 までに抑えます。

```ts
// root は新しく植える木の根元、neighbors は先に植えた木の根元
export const lightDirection = (root: V3, neighbors: V3[]): V3 => {
  let away: V3 = [0, 0, 0]
  for (const other of neighbors) {
    const dx = root[0] - other[0]
    const dz = root[2] - other[2]
    const distance = Math.hypot(dx, dz)
    // 同じ場所（離れる向きが決まらない）と、3 m より遠い木は数えない
    if (distance < 0.01 || distance > 3) continue
    const weight = (1 - distance / 3) ** 2 // 近いほど重い
    away = add(away, [(dx / distance) * weight, 0, (dz / distance) * weight])
  }
  // 足し合わせた向きの長さを 0.22 までにして、木が横倒しにならないようにする
  return Math.hypot(...away) > 0.001
    ? mul(unit(away), Math.min(0.22, Math.hypot(...away) * 0.2))
    : away
}
```

この向きは、どの世代の枝の向きにも 0.65 倍して足します。計算するのはあたらしく植える木だけで、先に植えた木の形は変えません。

### 書き換えの回を時間に割り当てる

木を植えたときに、6 回分の枝と葉の頂点を CPU で全部作り、GPU に送ります。そのあと頂点のバッファは書き換えません。頂点には、完成の位置と、成長につかう次の 2 つの値を持たせています。

| 値 | 枝 | 葉 |
| --- | --- | --- |
| 生まれる時刻 | （世代 - 1）× 0.7 秒 | その枝の生まれる時刻 + 0.52 秒 |
| 伸びはじめる点 | 枝の起点 | 枝の先端 |

育っている木について、毎フレーム CPU から送るのは、植えてからの秒数 `age` などの数個の値です。頂点シェーダーが `age` と生まれる時刻を比べて、頂点を伸びはじめる点から完成の位置へ動かします。枝は 0.52 秒で伸び、伸びきってから葉が 0.18 秒で開きます。1 回の書き換えが 0.7 秒なので、6 回で 4.2 秒です。同じ世代の枝は生まれる時刻が同じなので、一斉に伸びます。

頂点シェーダーの中で位置を決める関数は次のとおりです。`treeState` は木ごとの uniform、`scene` はカメラなどを入れた共通の uniform、`input.position` は完成の位置、`input.anchor` は伸びはじめる点です。

```wgsl
fn growthPosition(input: SurfaceIn) -> vec3f {
  // detail.z は生まれる時刻、detail.w は頂点の種類
  // （-1 は地面、0 は枝と奥の林の幹、1 は 1 枚ずつの葉、2 は葉をまとめた面、3 は奥の林の冠）
  let material = input.detail.w;
  if (material < 0.0) { return input.position; } // 地面は動かさない
  let isLeaf = material > 0.5;
  let duration = select(0.52, 0.18, isLeaf); // 枝は 0.52 秒、葉は 0.18 秒で伸びる
  var growth = smoothstep(0.0, duration, treeState.age - input.detail.z);
  // 幹（生まれる時刻が 0 の枝）は、32% まで伸びた苗から始める
  if (!isLeaf && input.detail.z < 0.01) { growth = 0.32 + growth * 0.68; }
  // 葉の幅が画面で何 px になるか
  let distanceAlongView = max(1.0, dot(input.anchor - scene.eye, scene.forward));
  let leafPixels = 0.17 * treeState.leafScale * scene.pixelHeight / (2.0 * scene.tangent * distanceAlongView);
  // 9 px より小さいときは葉をまとめた面を、大きいときは 1 枚ずつの葉を使い、もう一方は伸ばさない
  if ((material == 1.0 && leafPixels < 9.0) || (material == 2.0 && leafPixels >= 9.0)) { growth = 0.0; }
  // 伸びはじめる点 anchor から、完成の位置へ近づける
  let grown = mix(input.anchor, input.position, growth);
  // 育ちきった木が画面に収まるよう、根元を中心に縮める（modelScale は植えたときと、画面の大きさが変わったときに決める）
  return treeState.root + (grown - treeState.root) * treeState.modelScale;
}
```

`mix` は、伸びはじめる点と完成の位置を直線で結んだ間をとります。枝は 3 次ベジェ曲線で曲げてありますが、伸びる途中の頂点は曲線に沿わず、伸びはじめる点から完成の位置へまっすぐ動きます。ソースの WGSL では、0.17 と 9 を TypeScript の定数から埋め込んでいます。

影を描く深度のパスも、同じ `growthPosition` で頂点の位置を決めます。そのため、伸びている途中の枝には、伸びている途中の影ができます。

`age` は木ごとの uniform に入れています。uniform の並びは 1 か所に書き、[`createUniform`](https://github.com/uto-usui/laboobal-dev/blob/master/src/shared/gpu/uniform.ts) でそこから WGSL の struct と、JS から書き込む口を作ります。並びを WGSL と JS の両方に手で書くと、項目を足したときにずれて、値が入れ違うためです。

```ts
// 木ごとの uniform。この並びから WGSL の struct TreeObject を作る
export const OBJECT_FIELDS = {
  age: 'f32', // 植えてからの秒数
  opacity: 'f32', // 消えるときに下げる不透明度
  leafScale: 'f32', // 葉の大きさ（画面に収める倍率を掛けた値）
  padding: 'f32', // 詰め物
  root: 'vec3f', // 根元の位置
  modelScale: 'f32',
} as const
```

木を育てている間は、毎フレーム（最大で毎秒 30 回）、木ごとにこの uniform を書いて送ります。`tree.mesh.state` は木ごとに `createUniform` で作った uniform、`tree.retirement` は消えはじめてからの秒数（消えていない木では `undefined`）です。

```ts
const writeState = (tree: Planted) => {
  tree.mesh.state.set({
    age: tree.age,
    // 消えていく木は 0.7 秒で不透明度を 0 にする（smooth は 0〜1 をなめらかにつなぐ関数）
    opacity:
      tree.retirement === undefined ? 1 : 1 - smooth(tree.retirement / 0.7),
  })
  tree.mesh.state.upload()
}
```

育てている間は、カメラなどを入れた共通の uniform も毎フレーム送り、影も描き直します。どの木も育ちきって、消えていく木もなくなったら、フレームのループを止めます。

## 参考にしたもの

- [The Nature of Code, Chapter 8: Fractals](https://natureofcode.com/fractals/)（[Trees](https://natureofcode.com/fractals/#trees)、[L-systems](https://natureofcode.com/fractals/#l-systems)）
