---
id: 3034
type: lab
slug: "boids-sardine-school-webgpu"
title: "イワシの群れと捕食魚を、1 匹ずつの操舵の力で泳がせる -『WebGPU』"
date: 2026-11-19T10:15:20+09:00
excerpt: "8,192 匹のイワシが近い 7 匹に合わせて泳ぎ、捕食魚が群れの縁を狙って突っ込みます。The Nature of Code の 5 章にある操舵の力と群れの 3 つの力を、イワシは WebGPU の compute shader で、捕食魚は CPU で動かしたしくみです。"
primaryTag: "WebGPU"
terms:
  - { id: 368, name: "WebGPU", slug: "webgpu" }
  - { id: 369, name: "WGSL", slug: "wgsl" }
  - { id: 176, name: "javascript", slug: "javascript" }
  - { id: 212, name: "animation", slug: "animation" }
demoUrl: https://labobal.dev/nature-school/
draft: false
---

青い海のなかを 8,192 匹のイワシが丸い塊で泳ぎ、曲がるたびに横腹が銀色に光って、群れのなかを光の帯が流れていきます。捕食魚が群れの縁へ突っ込むと群れが割れて、またまとまります。左下の「自分で動かす」に切り替えると捕食魚がカーソルや指を追い、クリックやタップで水を叩くと、その場所から群れが広がります。

<p><iframe src="https://labobal.dev/nature-school/" width="100%" height="500" loading="lazy" title="イワシの群れと捕食魚（デモ）" allow="fullscreen"></iframe></p>

[別のタブで開く](https://labobal.dev/nature-school/) / [コードを見る（GitHub）](https://github.com/uto-usui/laboobal-dev/tree/master/src/demos/nature-school)

WebGPU が使えるブラウザで動きます。WebGPU が使えないブラウザや、GPU を使えない環境では、デモの場所に「このブラウザは WebGPU に対応していません」と出ます。

The Nature of Code（Daniel Shiffman、2024 年版）の章の考え方を、自然の 1 場面にして WebGPU で動かすシリーズの 1 本で、この記事は 5 章「自律エージェント」を扱います。2 枚のバッファを交互につかい、固定の刻みで 1 歩ずつ進める組み立ては、シリーズのほかの記事でも同じで、この記事の最後の「WebGPU で 1/60 秒ずつ進める」に書いています。

## しくみ

The Nature of Code の 5 章「Autonomous Agents」の考え方を、WebGPU で動かしています。話題ごとに、章の考え方とこのデモでの使いかたを並べ、最後に WebGPU で 1 歩を進めるしくみを書きます。コードの全体は GitHub の[デモのフォルダ](https://github.com/uto-usui/laboobal-dev/tree/master/src/demos/nature-school)で読めます。2 本のバッファの入れ替えや 1/60 秒の刻みのような、ほかのデモと共通のコードは [`src/shared/gpu/`](https://github.com/uto-usui/laboobal-dev/tree/master/src/shared/gpu) にあります。

### 1 匹ずつの 1 歩

このデモで舵を取るのは、イワシと捕食魚です。どちらも、次の順で動きを決めます。

1. まわりから、合わせる相手や狙う相手を探す
2. 目標の位置と速さから、望む速度を決める
3. 望む速度と今の速度の差を力にして、速度を変える

群れ全体をまとめて動かす計算はなく、力は 1 匹ずつにかけています。群れの形は、1 匹ずつの動きを重ねた結果です。

| | 数 | 見るもの | 計算する場所 |
|---|---|---|---|
| イワシ | 8,192 匹（4,096 と 16,384 にも切り替えられる） | 近い 7 匹と、0.8 より近い魚、捕食魚、叩いた場所 | GPU（WGSL の compute shader） |
| 捕食魚 | 1 匹 | 「自動」のときは群れから等間隔に選んだ 256 匹、「自分で動かす」のときはカーソルや指の位置 | CPU（TypeScript） |

### 操舵の力

章の「[The Steering Force](https://natureofcode.com/autonomous-agents/#the-steering-force)」の節にあたるところです。むかいたい向きと速さを「望む速度」にし、望む速度から今の速度を引いた差を力にします。差が大きいほど強く舵を切り、望む速度に追いつけば力は 0 になります。章では、力の大きさと速さに上限を設けます。このデモの捕食魚では、力の大きさ、速さの変化、曲がる角度に上限をかけます。上限があるので、向きを急には変えられず、弧を描いて曲がります。

目標に近づいたら速さを落とす振る舞いが arrive です。目標までの距離が決めた距離より短くなったら、距離に比例して望む速さを小さくします。

捕食魚の 1 歩の前半がこの計算です。`target` は目標の位置、`speed` は望む速さ、`arrival` は減速を始める距離（0 なら減速しない）です。どれも、あとで書く状態ごとに変えます。`mode` は「自動」（`'auto'`）か「自分で動かす」（`'manual'`）か、`this.pos` と `this.vel` は捕食魚の位置と速度、`dt` は 1 歩の秒数（1/60）、`sub`、`add`、`mul`、`unit`、`length` は 3 次元のベクトルの引き算、足し算、定数倍、長さを 1 にする関数、長さ、`clamp` は値を範囲に収める関数です。

```ts
const delta = sub(target, this.pos)
// 自分で動かすときは、目標にほぼ着いたら止まる
if (mode === 'manual' && length(delta) < 0.3) speed = 0
// arrive: 減速を始める距離より近ければ、近いほど遅くする
if (arrival > 0) speed *= Math.min(1, length(delta) / arrival)
// 望む速度: 目標の向きに、望む速さで
const desired = mul(unit(delta), speed)
// 操舵の力: 望む速度 − 今の速度。0.65 秒で差を埋める強さにする
let force = mul(sub(desired, this.vel), 1 / 0.65)
// 力の大きさを 13 までにする
const maxAcc = 13
force = mul(force, Math.min(1, maxAcc / Math.max(length(force), 1e-8)))
// 力を速度に足した、次の速度の候補
const proposed = add(this.vel, mul(force, dt))
```

このあと、次の速度の候補をそのままつかわず、向きと速さに分けてもう一度上限をかけます。

- 速さの変化は、1 秒あたり 13 まで
- 曲がる角度は、1 秒あたり 1.05 ラジアンまで
- 横向きの加速は、速さを変える加速と合わせた大きさが 13 を超えない分まで（速く泳いでいるほど曲がる角度が小さくなる）

こうして、全長がイワシの約 7 倍ある捕食魚が、その場で向きを変えずに大きく回り込みます。

### 捕食魚: 振る舞いを状態で切り替える

章の本文では seek（目標へむかう）と arrive を例として扱い、wander（ふらふらと歩き回る）は考え方を紹介しています。pursue（相手の行き先を予測して追う）と wander の実装は演習です。このデモの捕食魚は、どの状態でも目標と望む速さと減速を始める距離を替え、そのあとは上の操舵の力の計算で動きます。

捕食魚は「自動」のとき、4 つの状態を順に回り、状態ごとに目標と望む速さと減速の距離を替えます。表の s は群れの大きさに合わせた倍率で、8,192 匹のときは約 0.79 です。

| 状態 | 目標 | 望む速さ | 減速を始める距離 | 次へ移るとき |
|---|---|---|---|---|
| 近づく | 狙った塊のすこし先（pursue） | 5.5 | 3 | 目標まで 11 × s より近いか、6 秒たった |
| 突っ込む | 塊の向こう 16 × s の出口。画面の範囲に収める（seek） | 21 | なし | 出口まで 3 より近いか、2.7 秒たった |
| 流す | 進む向きの 9 × s 先 | 5 | なし | 1.4 秒たった |
| 戻る | 横へ、群れの空間の中心側に 13 × s 寄せた回り込み先のまわり（wander） | 6 | 5 | 回り込み先まで 5 より近いか、4.5 秒たった |

突っ込んだあと、逃げた魚を追ってその場で回らず、出口まで抜けてから大きく回って戻るので、群れが割れてまたまとまる時間ができます。

「近づく」の目標は pursue で決めます。`this.prey` は狙った塊の平均の位置と速度です。塊までの距離が遠いほど先を読みます。

```ts
// 先を読む秒数。塊までの距離を 17 で割り、0〜0.9 秒に収める
const lead = clamp(length(sub(this.prey.pos, this.pos)) / 17, 0, 0.9)
// pursue: 塊が今の速度で lead 秒進んだ位置を目標にする
target = add(this.prey.pos, mul(this.prey.vel, lead))
```

「戻る」の目標は、wander と同じく円の上で揺らします（円の中心は回り込み先）。`this.orbit` は回り込み先の点、`this.wander` は毎歩すこしずつランダムに動かす角度です。回り込み先のまわりで揺れる点を目標にするので、毎回同じ線をたどりません。

```ts
// 角度を少しだけランダムに動かす。1 歩の秒数の平方根に比例させる
this.wander += (Math.random() - 0.5) * 2.5 * Math.sqrt(dt)
// 回り込み先のまわりで、水平に半径 2 の円を描き、上下にも 1 まで揺れる点を目標にする
target = add(this.orbit, [
  Math.cos(this.wander) * 2,
  Math.sin(this.wander * 0.7),
  Math.sin(this.wander) * 2,
])
```

どの塊を狙うかは、群れから等間隔に選んだ 256 匹を見て決めます。「近づく」の間、0.8 秒ごとに選び直します。

1. 256 匹の平均を群れの中心とする
2. 1 匹ずつ、4.5 × s 以内にいる魚をじぶんを含めて数える。3 匹より少なければ、はぐれた 1 匹として外す
3. 群れの中心から、群れの楕円の大きさで割って測った距離が 0.55 より短ければ、内側として外す
4. 残りを「中心から遠いほど」「まわりの魚が少ないほど」「捕食魚から近いほど」「捕食魚の向いている先にあるほど」高くなる点数で比べ、いちばん高い魚を選ぶ
5. 選んだ魚から 4.5 × s 以内にいる魚の平均の位置と速度を、狙った塊にする

「自分で動かす」に切り替えると、カーソルや指の位置を、群れの空間（楕円体）の中心と同じ奥行きの面に写した点が目標になります。望む速さは 17、減速を始める距離は 7 で、力と曲がる角度の上限は自動のときと同じです。そのため、カーソルを急に動かしても捕食魚は弧を描いて追います。

### イワシ: 離れる・そろえる・寄る

章の「[Flocking](https://natureofcode.com/autonomous-agents/#flocking)」の節にあたるところです。Craig Reynolds の Boids と同じく、群れは 1 匹ずつにかかる 3 つの力でできています。

- 離れる: 近すぎる魚から離れる
- そろえる: 近所の魚と同じ向き、同じ速さで泳ごうとする。近所の平均の速度を望む速度にした操舵の力
- 寄る: 近所の魚のいるほうへ寄る

近所をどう決めるかが、このデモで変えたところです。そろえる力と寄る力は、近い順に 7 匹までの魚から求めます。ムクドリの群れを観測した Ballerini らの研究では、1 羽が反応する相手は、決まった距離の内側の全員ではなく、近い 6〜7 羽でした。このデモでは、1.2 の距離の内側から、近い順で 7 匹を選びます。密なところでも合わせる相手は 7 匹までで、1.2 より遠い魚は、7 匹に満たなくても相手にしません。離れる力だけは、0.8 より近い魚全員から受けます。

次の WGSL は、近い 7 匹からそろえる力と寄る力を求めるところです。`NEAR` は 7、`nj` は近い順に並べた 7 匹の番号で、7 匹に満たないときは空きにじぶんの番号 `i` が入っています。`sep` は前のループで、0.8 より近い魚から押し返される向きを足したものです。`src` は 1 歩前の全員の値、`p` と `v` はじぶんの位置と速度、`me.p.w` はじぶんのおびえ（0〜1）、`F` は設定の値をまとめた uniform です。

```wgsl
var ali = vec3f(0.0);
var coh = vec3f(0.0);
var fearNear = 0.0;
var m = 0.0;
for (var k = 0u; k < NEAR; k++) {
  // 空き（自分の番号）まで来たら終わる
  if (nj[k] == i) { break; }
  let o = src[nj[k]];
  // そろえる: 相手の速度を足す
  ali += o.v.xyz;
  // 寄る: 相手への向きを足す
  coh += o.p.xyz - p;
  // おびえは、驚いた直後の魚からだけ受け取る（「おびえを近所へ渡す」の節）
  if (o.reaction.y > 0.08) { fearNear = max(fearNear, o.reaction.w); }
  m += 1.0;
}

var stress = me.p.w;
var acc = vec3f(0.0);
if (m > 0.0) {
  // おびえている魚ほど、そろえる力と寄る力を強める
  let follow = F.ali * (1.0 + 2.0 * stress);
  // そろえる: 平均の速度 − 今の速度。寄る: 平均の位置への向き
  acc += (ali / m - v) * follow + (coh / m) * F.coh * (1.0 + 3.0 * stress);
}
// 離れる
acc += sep * F.sep;
```

おびえている魚は、そろえる力を最大 3 倍、寄る力を最大 4 倍にします。逃げる向きを近所に合わせながら塊へ戻るので、捕食魚が抜けたあとに群れがまとまります。

このあと、群れの空間に留める力、ゆっくり向きの変わる弱い潮の流れ、捕食魚や叩いた場所から逃げる力を足し、力の大きさを 30 まで（おびえているときは最大 75 まで）に切ります。速さはふだん 2.5〜6 の間に保ち、おびえているほど速く（最大 7.8 まで）泳ぎます。

### 群れの空間に留める

章には、壁に近づいたら内側へむかう速度を望む速度にする例があります。このデモでは、壁の代わりに群れの空間を楕円体で決め、縁に近づいたときだけ内側へ引きます。`F.center` と `F.radii` は楕円体の中心と 3 方向の半径、`F.boundary` は楕円体の外へ出たときに引き戻す強さ（40）です。

```wgsl
// 楕円体の大きさで割った位置。長さが 1 なら縁の上
let q = (p - F.center) / F.radii;
let ql = length(q);
// 楕円体の面に垂直な、内側への向き
let gradient = q / F.radii;
let inward = -gradient / max(length(gradient), 1e-5);
// 縁の 7 割より外で弱く引き、外へ出たら出た分だけ強く引く
acc += inward * (smoothstep(0.7, 1.0, ql) * 4.0 + max(0.0, ql - 1.0) * F.boundary);
```

どこにいても中心へ引くばねにすると、全員が同じ周期で中心を通り、群れが 1 点に潰れます。縁でだけ引くと、内側の魚は近所の魚だけを見て泳ぎます。

### 近所を升で探す

8,192 匹の 1 匹ずつがほかの全員との距離を測ると、1 歩で 6,700 万回ほどになります。章の「[Spatial Subdivisions](https://natureofcode.com/autonomous-agents/#spatial-subdivisions)」の節にあるとおり、空間を升に分け、じぶんのいる升とまわりの升の魚だけを見れば、距離を測る数が大きく減ります。

升の 1 辺は、近い 7 匹を探す距離と同じ 1.2 にしています。こうすると、探す相手はじぶんの升と、それを囲む升の合わせて 27 升のなかに必ずいます。格子は 70 × 50 × 60 升で、群れがいちばん大きいときにも余白を残しています。

GPU で升ごとの魚の一覧を作るには、升ごとの数を数え、その累積和で魚を升の順に並べ替える作り方があります。ただ、この格子は 21 万升あり、ほとんどが空です。空の升の累積和を毎歩取らないよう、魚がいる升だけに連結リストを作ります。

- 升の番号をハッシュで 32,768 個の桶にまとめ、桶ごとに先頭の魚の番号を持つ（`heads`）
- 魚ごとに、同じ桶の次の魚の番号を持つ（`next`）

次の compute shader が、1 匹に 1 つのスレッドでじぶんを桶の先頭に差し込みます。`atomicExchange` は、桶の先頭をじぶんの番号に替え、それまでの先頭を返します。何匹が同時に同じ桶へ差し込んでも、ひとつながりのリストになります。毎歩、`heads` を 0 で消してから動かします。`items` は全員の値を `vec4f` の列として見たもので、1 匹は `grid.stride`（3）個ずつ並び、その先頭の `xyz` が位置です。`grid.n` は魚の数、`gridCell()` は位置から升を求める関数、`gridIndex()` は升の番号をハッシュして桶を返す関数です。

```wgsl
@compute @workgroup_size(256) fn main(@builtin(global_invocation_id) id: vec3u) {
  let i = id.x;
  // 魚の数より多いスレッドは何もしない
  if (i >= grid.n) { return; }
  // 自分の位置から升を求め、升の番号をハッシュして桶を決める
  let bucket = gridIndex(gridCell(items[i * grid.stride].xyz));
  // 0 をリストの終わりにするため、魚の番号は 1 を足して持つ
  next[i] = atomicExchange(&heads[bucket], i + 1u);
}
```

近所を探すほうでは、27 升をじぶんの升から近い順に回り、桶のリストをたどります。違う升が同じ桶に入ることがあるので、相手の魚の升を求め直して、今見ている升と違えば飛ばします。見つけた魚は、0.8 より近ければ離れる力に足し、近い 7 匹の一覧より近ければ一覧に差し込みます。`MAX_SEEN` は 256、`F.sepRadius` は 0.8、`gridInside()` は升が格子の内側かを返す関数、`gridHead()` は升の桶の先頭の魚、`gridLink()` は `next` から次の魚を返す関数です。`c0` はじぶんの升、`OFFSETS` は 27 升へのずれ（じぶんの升、面で接する升、辺で接する升、角で接する升の順）、`nd` は一覧の 7 匹までの距離の 2 乗で、はじめは 1.2 の 2 乗が入っています。

```wgsl
var seen = 0u;
// 見た魚が 256 匹に届いたら、残りは見ない
for (var o = 0u; o < 27u && seen < MAX_SEEN; o++) {
  let c = c0 + OFFSETS[o];
  // 格子の外の升は飛ばす
  if (!gridInside(c)) { continue; }
  var link = gridHead(c);
  // 桶のリストを、終わり（0）までたどる
  while (link != 0u && seen < MAX_SEEN) {
    let j = link - 1u;
    link = gridLink(j);
    // 自分は飛ばす
    if (j == i) { continue; }
    let other = src[j];
    // 同じ桶に入った別の升の魚は飛ばす
    if (any(gridCell(other.p.xyz) != c)) { continue; }
    seen++;
    let d = other.p.xyz - p;
    let r2 = dot(d, d);
    if (r2 < F.sepRadius * F.sepRadius) {
      // 離れる: 近いほど強く、0.8 の距離で 0 になる押し返し
      let rr = sqrt(r2) + 1e-4;
      sep -= d / rr * (1.0 - rr / F.sepRadius);
    }
    if (r2 < nd[NEAR - 1u]) {
      // 近い 7 匹の一覧に、距離の順を保って差し込む
      var at = NEAR - 1u;
      while (at > 0u && nd[at - 1u] > r2) {
        nd[at] = nd[at - 1u];
        nj[at] = nj[at - 1u];
        at--;
      }
      nd[at] = r2;
      nj[at] = j;
    }
  }
}
```

1 匹が見る魚は、密なところでも 256 匹までにして、重さに上限を設けています。じぶんの升から先に回るので、上限で見ずに残るのは遠い升の魚です。

### おびえを近所へ渡す

ここからは章になく、このデモで足したところです。捕食魚に近い魚が驚くと、そのおびえが近い 7 匹へすこし遅れて伝わり、驚いた魚が横腹を返すので、銀色の波が群れに広がります。

捕食魚からの距離は、捕食魚の胴の前後を結んだ線分から測ります。この線分から 5 より近い魚がおびえ、近いほど強く逃げます。

1 匹ずつ、次の 4 つの値を持っています（`reaction`）。

| | 値 | 使いかた |
|---|---|---|
| x | 待った時間 | 近所から受けたおびえが続いた秒数。0.1 秒たつと驚く |
| y | 横腹を返す残りの時間 | 驚いたときに 0.28 秒にし、減らしていく。0.08 より大きい間だけ近所へ渡す |
| z | 次に驚けるまでの時間 | 驚いたときに 1.5 秒にする。この間は驚かない |
| w | 次へ渡す強さ | 驚いたときの強さを持っておく |

`fear` は捕食魚か叩いた場所から直接受けたおびえ（0〜1）、`fearNear` は近い 7 匹のうち驚いた直後の魚が渡す強さのいちばん大きい値、`F.relay` は 1 匹渡るごとに掛ける値（0.93）、`F.calm` はおびえが冷める速さ、`F.dt` は 1 歩の秒数です。

```wgsl
// 横腹を返す残りの時間と、次に驚けるまでの時間を 1 歩ぶん減らす（0 より下にはしない）
var reaction = max(me.reaction - vec4f(0.0, F.dt, F.dt, 0.0), vec4f(0.0));
// 近所から受けるおびえは、1 匹渡るごとに少し弱める
let relayed = fearNear * F.relay;
// 受けたおびえが続く間だけ、待った時間を増やす
if (reaction.z <= 0.0 && relayed > 0.18) {
  reaction.x += F.dt;
} else {
  reaction.x = 0.0;
}
// 驚くのは、落ち着いていた魚（おびえ 0.18 未満）が直接おびえたときか、近所から 0.1 秒受け続けたとき
let startled = reaction.z <= 0.0 &&
  ((fear > 0.18 && me.p.w < 0.18) || reaction.x >= 0.1);
// おびえは少しずつ冷めるが、直接のおびえより下にはしない
stress = max(stress - F.calm * F.dt, fear);
if (startled) {
  stress = max(stress, relayed);
  // 直接おびえた魚は 0.85 以上、近所から受けた魚は受けた強さを次へ渡す
  let signalStrength = select(relayed, max(fear, 0.85), fear > 0.18);
  reaction = vec4f(0.0, 0.28, 1.5, signalStrength);
}
```

渡す強さには、1 匹渡るごとに 0.93 を掛けます。0.18 を下回ると渡らなくなるので、0.85 で出たおびえは 20 回ほど渡ったところで止まります。驚いたあと 1.5 秒は驚かないので、2 匹の間でおびえを送り合い続けることもありません。

横腹の光も、近所に合わせる動きから出ています。イワシは、曲がる向きの加速に合わせて体を傾け、驚いたときは大きく傾けます。描くときは、目からの視線を横腹で跳ね返した向きが上（明るい水面）なら光らせ、下（暗い深み）なら暗くします。曲がる動きが近所へ順に伝わると、隣り合う魚が続けて光るので、光の帯が群れのなかを流れていきます。

### WebGPU で 1/60 秒ずつ進める

イワシ 1 匹ぶんの値は、3 つの `vec4f`（48 バイト）です。

| | x, y, z | w |
|---|---|---|
| 1 つめ | 位置 | おびえ |
| 2 つめ | 速度 | 体の傾き |
| 3 つめ | おびえを渡すための 4 つの値（上の表） | |

この値を入れるバッファを 2 本作り、1 歩ごとに読む側と書く側を入れ替えます。全員が 1 歩前の同じ時点の値を読んで、もう 1 本に書くので、先に計算した魚の結果を、あとの魚が読んでしまうことがありません。

1 歩は、格子を作る compute pass と、群れを動かす compute pass の 2 つです。`grid.encode()` は `heads` を 0 で消して、上の連結リストを作る compute pass を積みます。`fish` は 2 本のバッファの組で、`fish.read` が今の値のあるほう、`fish.index` がその番号（0 か 1）、`fish.flip()` が読む側と書く側を入れ替える関数です。`n` は魚の数、`simP` は群れを動かす compute pipeline、`simG` は 2 本のどちらを読むかに合わせて 2 組用意した bind group です。

```ts
const encodeSteps = (encoder: GPUCommandEncoder, steps: number) => {
  for (let s = 0; s < steps; s++) {
    // 今の位置で、升ごとの連結リストを作り直す
    grid.encode(encoder, fish!.read, n)
    // 群れを 1 歩進める。256 匹ずつのまとまりで、全員を動かす
    const pass = encoder.beginComputePass({ label: 'school sim' })
    pass.setPipeline(simP)
    pass.setBindGroup(0, simG[fish!.index])
    pass.dispatchWorkgroups(Math.ceil(n / 256))
    pass.end()
    // 書いた方を、次の歩で読む側にする
    fish!.flip()
  }
}
```

画面を描くたびに、次の順で動かします。

1. 前の描画からの時間を 1/60 秒の歩数に直す。画面の更新が 60Hz でも 120Hz でも、1 秒に進む歩数は同じ。1 回の描画で進めるのは 3 歩までで、それより遅れたら遅れを捨てる
2. CPU で捕食魚を同じ歩数だけ進め、胴の線分の両端を uniform に書く
3. `encodeSteps()` で群れを進める
4. 描く。1 匹ずつの投影と横腹の光を compute pass で 1 回だけ求め、イワシは 1 匹を 4 頂点の四角 1 枚にして、インスタンスの描画 1 回で全員を描く。捕食魚は立体のメッシュで描く
5. 「自動」のときは 0.6 秒に 1 回、群れから等間隔に 256 匹を小さなバッファに詰め、CPU へ読み戻す

5 の読み戻しは `mapAsync()` で始め、描画のループではその終わりを待ちません。読み戻せたら、次に塊を選ぶときにつかいます。8,192 匹全員の値を読み戻すと 384KiB ですが、256 匹なら 12KiB です。

## 参考にしたもの

- [The Nature of Code, Chapter 5: Autonomous Agents](https://natureofcode.com/autonomous-agents/)
- [Craig Reynolds, Boids (Flocks, Herds, and Schools: a Distributed Behavioral Model)](https://www.red3d.com/cwr/boids/)
- [Craig Reynolds, Steering Behaviors For Autonomous Characters](https://www.red3d.com/cwr/steer/)
- [M. Ballerini et al., Interaction ruling animal collective behavior depends on topological rather than metric distance: Evidence from a field study (PNAS, 2008)](https://doi.org/10.1073/pnas.0711437105)
