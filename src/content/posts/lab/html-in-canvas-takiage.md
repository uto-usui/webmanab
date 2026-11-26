---
id: 3022
type: lab
slug: "html-in-canvas-takiage"
title: "縦書きの textarea をちぎって、書いた字ごと燃やす -『WebGL』"
date: 2026-11-08T00:42:15+09:00
excerpt: "HTML-in-Canvas で縦書きの textarea を WebGL の紙に写し、綴じ目からちぎって篝火にくべると、書いた字ごと燃えるようにしました。燃え際が下から上がっていく熱の広げ方、ちぎれるかどうかの判定、継ぎ目の合う半券、当たり判定を置く短冊と外す短冊の分け方を説明します。"
primaryTag: "WebGL"
terms:
  - { id: 340, name: "WebGL", slug: "webgl" }
  - { id: 176, name: "javascript", slug: "javascript" }
  - { id: 174, name: "canvas", slug: "canvas" }
demoUrl: https://labobal.dev/html-takiage/
draft: false
---

夜の小さな社の焚き上げ所です。札掛けに和紙の短冊の束が綴じてあり、いちばん上の短冊に、手放したいことを縦書きで書けます。短冊の足もとをつまんで引くと綴じ目でちぎれ、篝火の上にかざすと、書いた字ごと燃えて灰と火の粉になって昇ります。綴じ目には、ちぎった数だけ半券が重なって残ります。

<p><iframe src="https://labobal.dev/html-takiage/" width="100%" height="500" loading="lazy" title="焚き上げの短冊（デモ）" allow="fullscreen"></iframe></p>

[別のタブで開く](https://labobal.dev/html-takiage/) / [コードを見る（GitHub）](https://github.com/uto-usui/laboobal-dev/tree/master/src/demos/html-takiage)

HTML-in-Canvas の基本（`<canvas content="drawable">` と子の `drawable`、`paint` イベントと `texElementSubImage2D`、`requestPaint`、`updateElementGeometry` の `canvasTransform`）は、[布をつまむデモの記事](https://webmanab.com/lab/html-in-canvas-cloth/)に書きました。この記事では、焚き上げのデモであたらしくつかったところを説明します。

コードは 3 つのファイルに分かれています。短冊の出し入れ、つまむ操作、火の粉などの粒は [`main.ts`](https://github.com/uto-usui/laboobal-dev/blob/master/src/demos/html-takiage/main.ts)、紙の格子の動きと熱の計算は [`paper.ts`](https://github.com/uto-usui/laboobal-dev/blob/master/src/demos/html-takiage/paper.ts)、シェーダーと描く処理は [`render.ts`](https://github.com/uto-usui/laboobal-dev/blob/master/src/demos/html-takiage/render.ts) にあります。

## 燃えるのは本物の欄

次の HTML が短冊 1 枚です。`drawable` を付けた `<section>` の中に、字を書く textarea と、下の端に押した印を置いています。

```html
<canvas class="view" content="drawable">
  <!-- 短冊 1 枚。この要素がそのまま WebGL のテクスチャになる -->
  <section class="slip washi" drawable>
    <textarea
      class="words"
      maxlength="48"
      placeholder="手放したいことを、ひとつ"
      aria-label="短冊に書く。Ctrl か ⌘ を押しながら Enter で、ちぎってくべる"
    ></textarea>
    <span class="seal" aria-hidden="true">灯</span>
  </section>
</canvas>
```

textarea は CSS の `writing-mode: vertical-rl` で縦書きにし、`overflow: hidden` であふれた字を隠しています。字の大きさは 20px から始めます。

短冊は細いので、長く書くとすぐ欄からあふれます。次の `fitText` は、欄に収まるまで字を小さくする関数です。字を打つたびに呼びます。

```ts
const fitText = (text: HTMLTextAreaElement) => {
  // 毎回 20px に戻してから測る。字を消したときに大きさを戻すため
  let size = 20
  text.style.fontSize = `${size}px`
  // 横にあふれているあいだ、1px ずつ小さくする（12px まで）
  while (text.scrollWidth > text.clientWidth + 1 && size > 12) {
    size -= 1
    text.style.fontSize = `${size}px`
  }
}

text.addEventListener('input', () => fitText(text))
```

縦書きでは行が左へ増えていくので、あふれると `scrollHeight` ではなく `scrollWidth` が `clientWidth` より大きくなります。

WebGL の紙に貼っているテクスチャは、この textarea をそのまま写したものです。そのため、変換して確定した字も、`fitText` で字が小さくなった行も、書いたときの見た目のまま焦げていきます。

ちぎった短冊の字を書き直せないよう、綴じ目が切れ終わったら欄を `readOnly` にします。

もう 1 つ、短冊の要素は、CSS の `left` と `top` でも WebGL に描く位置と同じところへ置いています。`drawable` の子は画面には出ませんが、日本語入力の変換候補は要素が置かれた位置に出るので、こうしておくと変換候補が短冊のすぐ横に出ます。

### 短冊ごとに写し直す

短冊 1 枚を canvas の直下の `drawable` 1 つにして、テクスチャも 1 枚ずつ持たせています。束の短冊へ字を書いているあいだも、ちぎった短冊は火の上で燃えています。燃えている短冊の HTML は変わらないので、字を打っても写し直さなくて済みます。`paint` イベントの `changedElements` で変わった要素だけを写し直すやり方は、[絵巻の記事](https://webmanab.com/lab/html-in-canvas-emaki/)と同じです。

テクスチャへ写す `upload()` の中身は、`getElementImageDefaultSize` で大きさを取り、変わっていたらテクスチャの領域を確保し直して `texElementSubImage2D` で写すだけです。

短冊をちぎると、束には次の短冊が加わります。HTML に最初から書いてある短冊を `cloneNode` で複製し、`value` を空に、`readOnly` を false に、字の大きさを元に戻してから canvas の子に足します。複製には最初の短冊に書いた字と状態が残っているためです。足した短冊はテクスチャを作って束に貼り、`requestPaint` で写します。

燃えつきた短冊は、要素ごと外してテクスチャも消します。

## 燃え際の作り方

紙は 9 × 37 点の格子で、布の記事と同じく Verlet 積分で動かしています。熱は格子の点ごとに 0〜1 の値で持たせ、頂点の属性としてシェーダーに渡します。0.5 を超えると火が付き、1 で燃えつきます。熱の計算は `paper.ts` の `burnSheet` で、毎フレーム呼んでいます。

### 炎の根もとほど熱くする

炎の形の中にある点は熱が上がります。上がる速さは、炎の根もとに近いほど大きくしています。炎の先のほうでは熱がゆっくり上がるので、火はまず根もとで付き、そこから上へ燃え広がります。炎の上にかざしたときは、触れる前から下の端が焦げ始めます。ただし、炎の外では熱を 0.34 までしか上げず、火は付けません。

次のコードは、格子の点 1 つについて、炎から受ける熱を足します。

```ts
// x, y は点の位置。fire は炎の根もとの位置（x, y）と幅（w）と高さ（h）
// speed はふだん 1。動きを減らす設定では 3 にして、早く燃えつきさせる
// 炎のまん中からの横の離れ方。炎の端で 1 になる
const dx = Math.abs(x - fire.x) / (fire.w / 2)
// 炎の根もとからの高さ
const above = fire.y - y
if (dx < 1 && above > -16) {
  // 炎の形は上ほど細い。端に寄るほど低い所で炎の外になる
  const inside = above < fire.h * (1 - dx * 0.6)
  if (inside)
    // 根もとでは 1、炎の先では 0.3 の速さで熱が上がる
    heat[n] +=
      dt * 0.8 * speed * jitter[n] * (0.3 + 0.7 * (1 - above / fire.h) ** 2)
  else {
    // 炎の先から 70px 上までは、近いほど速く焦げる。0.34 で止めて火は付けない
    const near = 1 - (above - fire.h * (1 - dx * 0.6)) / 70
    if (near > 0)
      heat[n] = Math.max(heat[n], Math.min(0.34, heat[n] + dt * 0.5 * near))
  }
}
```

熱の上がる速さは、根もとからの高さの割合 `above / fire.h` の 2 乗で落とします。根もとから半分の高さでは、速さは根もとの 5 割ほど（0.3 + 0.7 × 0.25）、炎の先では 3 割になります。炎の先のほうでは、火が付くまでに時間がかかります。`above > -16` で、炎の根もとより 16px 下までを炎の中に数えています。篝籠の炭の上に乗った紙も、炎の中に入ります。

### 紙の中で隣へ燃え広がる

火の付いた点は、じぶんの熱を上げながら、上下左右の隣の点の熱も上げます。上の点へは速く、横と下へは遅く広げています。次のコードは、`burnSheet` の後半で、火の付いた点ごとに、熱の進みと燃え広がりを計算します。

```ts
// stride は 1 行の点の数（9）。heat と jitter は点ごとの熱と速さのむら
for (let n = 0; n < s.count; n++) {
  if (gone[n] || heat[n] < 0.5) continue // 火の付いた点だけを見る
  // 自分の熱を上げる。炭になったら（0.62 から）速く燃えつきる
  heat[n] += dt * (heat[n] > 0.62 ? 0.42 : 0.17) * speed * jitter[n]
  const i = n % stride // 列
  const j = (n - i) / stride // 行
  const spread = dt * 1.8 * speed * jitter[n]
  // 隣の点と、広げる速さの重み。上の行（j - 1）へは速く、横と下へは遅く
  const near = [
    [i, j - 1, 1.5],
    [i - 1, j, 0.7],
    [i + 1, j, 0.7],
    [i, j + 1, 0.6],
  ]
  for (const [a, b, k] of near) {
    if (a < 0 || a > s.cols || b < 0 || b > s.rows) continue // 格子の外
    const m = b * stride + a
    // 隣は 0.55 まで上げる。火が付く 0.5 をすこし超えたところで止め、そこから先は隣が自分で燃え進む
    if (heat[m] < 0.55) heat[m] += spread * k
  }
  // …（熱が 1 になった点を、燃えつきた点にする）
}
```

短冊の幅は炎の幅より狭く、下の端が横一列のまま炎に入るので、燃え際は横に並んだ 1 本の線になります。隣へは上へいちばん速く広がるので、この線が字の上を下から順に通っていきます。

炭になってからの熱の上がり方（0.42）は、火が付いたばかりのころ（0.17）の 2 倍半ほどです。黒い紙が長く残らないよう、炭になったら早く燃えつきさせています。

`jitter` は点ごとに 0.6〜1.4 の範囲で決めた、燃え広がる速さのむらです。ただ、点ごとの速さをばらつかせても、三角形の中の熱は 3 つの頂点の値をなめらかにつないだものになります。格子が粗い（横は 9 点）ので、燃え際は三角形の辺をなぞる折れ線に見えます。

そこで、紙を描くフラグメントシェーダーで、熱にノイズを足しています。入力の `vHeat` は頂点の熱を三角形の中でつないだ値、`vUv` は短冊の中の位置（0〜1）です。

```glsl
// fbm は、粗さの違うノイズを 4 段重ねた、おおよそ 0〜1 の値
// 短冊は縦に長いので、縦（20）を横（4）より細かくして、粒の大きさを縦横でおおよそそろえる
// uSeam.z は短冊ごとの種。短冊ごとに燃え方の模様を変える
float h = vHeat + (fbm(vUv * vec2(4.0, 20.0) + uSeam.z) - 0.5) * 0.24;
// 燃えつきた所は描かない
if (h > 1.0) discard;
```

ノイズで熱を ±0.12 ずらすので、点と点のあいだも燃え際がぎざぎざになり、燃えつきたところの縁もぎざぎざに欠けます。

### 熱の段階で見た目を分ける

シェーダーでは、熱 `h` の値で見た目を分けています。

| 熱 | 見た目 |
| --- | --- |
| 0.12〜0.5 | 茶色く焦げていく。炎の外で焦げるのは 0.34 まで |
| 0.4〜0.62 | 墨の濃いところ（字）だけが赤く光る |
| 0.66〜0.84 | 黒い炭になる |
| 0.9 前後 | 燃え際。橙に光る |
| 1 | 消える |

燃え際の手前で、字だけが先に赤く光ってから焦げます。字かどうかは、テクスチャの色の明るさで見ています。明るい和紙に比べて墨は暗いので、暗いところほど強く光らせます。

次のコードは、紙の色に焦げ、炭、燃え際の光、字の赤い光を順に重ねます。入力の `base` はテクスチャの色、`color` は `base` を月明かりと火の明かりで照らした色です。`h` は上でノイズを足した熱です。

```glsl
// 焦げ: 熱 0.12〜0.5 で、茶色を掛けて暗くしていく
float scorch = smoothstep(0.12, 0.5, h);
color *= mix(vec3(1.0), vec3(0.55, 0.36, 0.2), scorch);
// 墨の濃さ: テクスチャの色が暗いほど 1 に近い
float ink = 1.0 - smoothstep(0.15, 0.6, dot(base, vec3(0.3, 0.55, 0.15)));
// 燃え際: 熱 0.9 の前後 0.07 だけ 1 に近い
float edge = 1.0 - smoothstep(0.0, 0.07, abs(h - 0.9));
// 炭: 熱 0.66〜0.84 で、炭の色（ash）に置き換えていく
float charred = smoothstep(0.66, 0.84, h);
color = mix(color, ash, charred);
// 燃え際を橙に光らせる。flick は時間で揺らすノイズ
color += vec3(1.0, 0.42, 0.1) * edge * 1.4 * flick;
// 燃え際が墨の字に届くと、字が先に赤く光る。炭になったら光らない
float near = smoothstep(0.4, 0.62, h) * (1.0 - charred);
color += vec3(1.0, 0.3, 0.06) * ink * near * 1.2 * flick;
```

`ash` は、ノイズで濃淡を付けた暗い灰色です。光は色を足して出しているので、焦げや炭で暗くなった上からでも明るく見えます。字の赤い光は `ink` を掛けているので、和紙のところではほとんど光らず、墨のところだけが光ります。

熱が 0.62 を超えたところは、点どうしをつなぐ拘束の長さを 9 割に縮めます。あわせて、熱 0.6 を超えた点を z の向きへ押して、紙を反らせます。手前と奥のどちらへ反るかは、短冊ごとに決めています（`curl`）。次のコードは、`burnSheet` で拘束の長さを縮めるところと、`stepSheet` で点を動かすところです。

```ts
// burnSheet: 両端の点がどちらも炭なら、つなぐ長さを 9 割にする
// base はもとの長さ、len は今の長さ
const c = Math.min(heat[a], heat[b])
s.len[k] = s.base[k] * (c > 0.62 ? 0.9 : 1)

// stepSheet: 炭になった所は軽くなって落ちにくくなり、手前か奥へ反る
// g は重力で 1 ステップに進む量。curl は短冊ごとに 1 か -1
const char = Math.max(0, heat[n] - 0.6)
pos[p + 1] += vy + g * (1 - char * 1.6)
pos[p + 2] += vz + o.curl * char * 120 * dt * dt
```

`char` は熱が 0.6 を超えた分で、燃えつきる直前で 0.4 です。そのとき重力は 4 割弱まで弱まり（1 − 0.4 × 1.6）、炭になったところは軽くなり、ゆっくり落ちます。

### 炎を紙の奥と手前に描く

炎は加算で描きます。1 フレームの中で、紙より先に `flame(1)` で濃く描き、紙のあとに `flame(0.35)` で 35% の明るさでもう一度重ねます。手前に濃く重ねると、燃えていく字が炎の色に埋もれて見えなくなります。手前に薄く重ねるのは、紙が炎の中にあるように見せながら、字が読めるようにするためです。

札掛けや地面は canvas の下に置いた HTML で、canvas の透明なところから見えています。火の明かりは、canvas いっぱいの四角形に、炎から離れるほど暗くなる橙色を canvas の中で加算して描き、この HTML を照らします。

### 加算の光にもアルファを持たせる

この canvas は premultiplied alpha で、色にあらかじめアルファを掛けた値を持ちます。そのため、どの画素も、色の値がアルファ以下でないといけません。光を「色だけ足して、アルファは 0」で出すと、この決まりから外れます。外れた画素をページと重ねたときの見え方は決まっておらず、環境によっては炎も火の明かりも消えます。

そこで、炎と火の明かり、それに火の粉など加算で描く粒は、アルファを RGB のうちいちばん大きい値にそろえて出しています。次のコードは、炎のフラグメントシェーダーの最後です。

```glsl
// rgb は炎の色。アルファを色の最大値にして、色がアルファを超えないようにする
outColor = vec4(rgb, max(rgb.r, max(rgb.g, rgb.b)));
```

アルファを持たせたぶん、炎の明るいところほど、下の HTML は透けにくくなります。

紙も同じ決まりに合わせています。燃え際の光を足すと、紙の色は 1 を超えることがあります。炭になってアルファが下がったところでは、そのままだとアルファを掛けたあとの色がアルファを超えます。そこで、紙の色は `min(color, vec3(1.0))` で 1 に抑えてから、アルファを掛けています。

### 燃えつきた点は止める

`stepSheet` で点を動かすループでも、距離の拘束のループでも、燃えつきた点（`gone` が 1 の点）は飛ばして、その場で止めます。燃えつきた点は描きませんが、三角形の頂点としては残っています。燃えつきた点が動くと、残っている紙の点とのあいだの三角形が引き伸ばされて、細長い三角が見えます。

まだ燃えていない点が 4 つより少なくなったら、短冊を要素ごと外します。

## ちぎれるかどうかの判定

束に貼られた短冊は、上の行の点が、毎ステップ綴じ目の位置へ引き戻されています。次の 3 つのどれかになったら、綴じ目を切り始めます。

1. 綴じ目が 30px 伸びた
2. 綴じ目が 6px 以上伸びていて、指が毎秒 650px より速く動いている
3. つまんだ点が、束に貼られていたときの位置から 60px 離れた

次のコードは、束の短冊をつまんでいるあいだ、毎フレームこの 3 つを調べます。

```ts
const TEAR_FAR = 30 // 1 の伸び（px）
const TEAR_FAST = 6 // 2 の伸び（px）
const TEAR_SPEED = 650 // 2 の指の速さ（px/秒）
const TEAR_PULL = 60 // 3 の離れた長さ（px）

// grab はつまんでいる指の状態。x, y が指の位置、vx, vy が指の速さ、
// ox, oy が指からつまんでいる点までのずれ、index がつまんでいる格子の点
// rest は、束に貼られていたときの各点の位置
const speed = Math.hypot(grab.vx, grab.vy)
// つまんでいる点が、束に貼られていたときの位置からどれだけ離れたか
const pulled = Math.hypot(
  grab.x + grab.ox - rest[grab.index * 2],
  grab.y + grab.oy - rest[grab.index * 2 + 1],
)
if (
  s.stretch > TEAR_FAR ||
  (s.stretch > TEAR_FAST && speed > TEAR_SPEED) ||
  pulled > TEAR_PULL
)
  // つまんでいる点の列から切り始める
  startTear(s, grab.index % (s.sheet.cols + 1))
```

`s.stretch` は、綴じ目の点がもとの位置からいちばん離れている長さです。綴じ目の近くをつまんで引いたときは、これがすぐに伸びます。指の速さ `vx`、`vy` は、`pointermove` ごとの移動から求め、急に跳ねないよう、直近 0.04 秒ほどの動きを重く見る平均でならしています。

綴じ目の伸びだけで判定すると、短冊の下の端をつまんだときは、いくら引いてもちぎれません。紙が途中で曲がるだけで、綴じ目まで力が届かないためです。3 つめの条件で、つまんだ点が束に貼られていたときの位置（`rest`）から 60px 離れたら、どこをつまんでいてもちぎれるようにしています。すこし引くだけなら、綴じ目が白く伸びるだけで、離すと戻ります。

綴じ目は一度に切らず、つまんだ列に近いほうから 1 列ずつ切ります。次のコードの `startTear` は、切る列の順番を決めます。`tearStep` は毎フレーム呼ばれ、その順に列を綴じ目から外します。

```ts
const startTear = (s: Slip, col: number) => {
  // 0〜8 列を、つまんだ列 col に近い順に並べる
  const order = Array.from({ length: s.sheet.cols + 1 }, (_, i) => i).sort(
    (a, b) => Math.abs(a - col) - Math.abs(b - col),
  )
  s.cutting = { order, t: 0 }
}

const tearStep = (s: Slip, dt: number) => {
  const c = s.cutting
  if (!c) return
  c.t += dt
  // 0.012 秒ごとに、次の 1 列を綴じ目から外す
  while (c.order.length && c.t > 0.012) {
    c.t -= 0.012
    const i = c.order.shift()!
    s.sheet.anchored[i] = 0
    // …（切れた所から、紙の繊維の粒を飛ばす）
  }
  // …（全部切れたら、短冊を束から外す）
}
```

`anchored` は、上の行の列ごとに、まだ綴じ目につながっているかを持つ配列です。0 にした列は、綴じ目へ引き戻されなくなります。9 列を切り終えるまでは 0.1 秒ほどで、紙はつまんだところから両側へ裂けていきます。

### ちぎったあとは上の端から吊るす

足もとをつまんでちぎると、短冊は指から逆さまに垂れることになります。それでは字が逆さまになり、火にも上の端から入ってしまいます。そこで、ちぎれたときに、指の位置はそのままで、つまんでいる点を上の端に近い行のまん中に替えています。次のコードは、`tearStep` で綴じ目が全部切れたときに動きます。

```ts
// 上から 2 行目（1 行に 9 点なので、9 番から始まる行）のまん中の点
const top = s.sheet.cols + 1 + Math.floor(s.sheet.cols / 2)
// 指から、その点までのずれを覚える。指の位置は動かさない
grab.ox = s.sheet.pos[top * 3] - grab.x
grab.oy = s.sheet.pos[top * 3 + 1] - grab.y
// これからは、その点を指についてこさせる
grab.index = top
```

紙の計算では、つまんでいる点を毎ステップ「指の位置 + ずれ」に置きます。指を動かすと、指からすこし離れた上の端が一緒に動き、短冊はそこから垂れ下がります。字は上向きのまま垂れ、火には下の端から入ります。

## 継ぎ目の合う半券

綴じ目に残る半券は、短冊の上の部分を別の小さな格子で描いています。本体の格子はちぎれ線の 6px 上から始まり、半券の格子はちぎれ線の 6px 下で終わります。2 つが重なる帯では、シェーダーでぎざぎざの線より上を半券に、下を本体に割り振り、反対側は `discard` で捨てます。

本体と半券は、同じシェーダーで描きます。入力の uniform は次の 3 つです。

- `uSeam`: x はちぎれ線の高さ（要素の上から 27px）、y はぎざぎざの大きさ（2.6px）、z は短冊ごとの種
- `uPart`: 0 なら本体、1 なら半券を描く
- `uSize`: 短冊の要素の幅と高さ（px）

次のコードの `seamAt` は、短冊の左端からの位置 `x` での、ちぎれ線の高さを返します。

```glsl
float seamAt(float x) {
  return uSeam.x
    // ゆるい波。ノイズの種に uSeam.z を混ぜて、短冊ごとに線を変える
    + (noise(vec2(x * 0.09, uSeam.z)) - 0.5) * 2.0 * uSeam.y
    // 1.4px ごとに変わる細かい段。紙の繊維のけば立ち
    + (hash(vec2(floor(x * 0.7), uSeam.z)) - 0.5) * 1.6;
}

void main() {
  // 短冊の左上からの位置（px）に直す
  vec2 local = vUv * uSize;
  // ちぎれ線より下なら正、上なら負
  float below = local.y - seamAt(local.x);
  // 本体は線より上を、半券は線より下を捨てる
  if (uPart < 0.5 ? below < 0.0 : below > 0.0) discard;
  // …（色を付ける）
}
```

ちぎれ線は、ゆるい波（±2.6px）と、細かい段（±0.8px）を足した線です。本体と半券は、同じ種（`uSeam.z`）のノイズの線で切ります。ちぎる前は、2 つの格子が線の上でぴったり接するので、継ぎ目は見えません。ちぎったあとに本体を半券のそばへ戻すと、ぎざぎざがそのまま合います。

短冊がちぎれたら、その短冊の種と、半券ごとの上下のずれ `dy`（0.5〜2.5px）を一覧 `stubs` に足します。ちぎった短冊のテクスチャは残さず、半券は、いま束の上にある短冊のテクスチャで描きます。欄はちぎれ線より下にあり、半券になるところには何も書かれていないので、どの短冊のテクスチャでも同じに見えます。切る線だけを、ちぎった短冊の種で決めます。

次のコードは、束の上の短冊を描いたあと、その上に半券をあたらしいものから順に描きます。あとから描くものほど手前に出るので、古い半券ほど手前に重なります。

```ts
// draw(短冊, 格子, 行列, 本体か半券か, 種, ちぎれた口の白さ, 明るさ)
// s は束の上の短冊、s.top はその上の部分の小さな格子
// 新しいものから古いものへ、最大 14 枚
for (let i = stubs.length - 1; i >= Math.max(0, stubs.length - 14); i--) {
  const k = stubs.length - 1 - i // 新しいものから数えて何枚目か
  draw(
    s,
    s.top,
    // 古い半券ほど 1.3px ずつ上へずらす
    matrix.translate(0, stubs[i].dy - k * 1.3, 0),
    1, // 半券の側を描く
    stubs[i].seed, // ちぎった短冊の種で、線を切る
    1, // ちぎれた口を白く見せる
    0.97 - k * 0.012, // 古い半券ほど暗く、焼けた色に
  )
}
```

ずらす量 `dy - k * 1.3` は、あたらしい半券では下向き（0.5〜2.5px）で、古くなるほど上へ上がっていきます。半券どうしのぎざぎざがすこしずつずれて重なり、綴じ目に紙の端が積み重なって見えます。

## 当たり判定を置くところと外すところ

当たり判定は、束に貼られている短冊だけに置きます。束の上で短冊は平らなので、`canvasTransform` は平行移動だけで足ります。次のコードは、短冊を束へ貼るとき、その短冊の当たり判定を置きます。

```ts
// TEAR_Y は、短冊の上からちぎれ線までの長さ（27px）
canvas.updateElementGeometry(s.el, {
  // 要素の左上を、束に貼った位置へ動かす
  canvasTransform: new DOMMatrix().translate(L.slipX, L.slipY),
  // 要素の上から 31px までは、押しても短冊に届かないようにする
  canvasClip: { x: 0, y: TEAR_Y + 4, width: s.w, height: s.h - TEAR_Y - 4 },
})
```

`canvasClip` で、短冊の上から `TEAR_Y + 4`（31px）までを当たり判定から外しています。この範囲には、綴じ具と、半券になるところがあります。綴じ具は canvas の上に重ねた HTML で、`pointer-events: none` にしてあり、押すと下の canvas に届きます。そのまま短冊の当たり判定が残っていると、綴じ具を押したのに、その下の短冊の上の端をつまむことになります。

`canvasClip` は要素の中の座標なので、`{ x: 0, y: 31 }` は短冊をどこへ動かしても短冊の左上から 31px 下を指します。

当たり判定の中を押すと、`pointerdown` の `target` が短冊の中の要素になります。textarea を押したときは書くための操作なので何もせず、短冊の縁や足もとを押したときだけ、押した点にいちばん近い格子の点をつまみます。次のコードは、押したところから、つまむ短冊と格子の点を決めます。

```ts
stage.addEventListener('pointerdown', (e) => {
  const target = e.target as Element
  const p = local(e) // 押した位置を canvas の中の px に直す
  let slip: Slip | undefined // つまむ短冊
  let index = -1 // つまむ格子の点
  // 束の短冊の当たり判定の中なら、target は短冊の中の要素になる
  const padEl = target.closest<HTMLElement>('.slip')
  if (padEl) {
    // 欄は書くための所。短冊の足もとや縁をつかんで引く
    if (target.closest('textarea')) return
    slip = slips.find((s) => s.el === padEl && s.state === 'pad')
    // 押した位置から 40px 以内で、いちばん近い格子の点
    if (slip) index = nearest(slip.sheet, p.x, p.y, 40)
  } else {
    // ちぎった短冊は、手前に描いているものから順に、格子の点を自分で探す
    for (const s of [...slips].reverse()) {
      if (s.state !== 'free') continue
      index = nearest(s.sheet, p.x, p.y, 26)
      if (index >= 0) {
        slip = s
        break
      }
    }
  }
  // …（見つかったら、その点を指についてこさせる）
})
```

`nearest` は、まだ燃えていない格子の点のうち、押した位置から指定の長さ以内でいちばん近い点の番号を返し、なければ -1 を返します。`slips` は描く順に並んでいて、最後のものがいちばん手前なので、逆順に探します。

ちぎった短冊は、揺れて曲がり、燃えて欠けていきます。四角い当たり判定では形が合わないので、ちぎった時点で `clearElementGeometry` で外します。欄はもう読みとり専用なので、要素として押せなくなっても困りません。

## キーボードと動きを減らす設定

欄で Ctrl（Mac は ⌘）を押しながら Enter を押すと、短冊をちぎって火の上まで運び、そこで離します。欄の `keydown` でこの組み合わせを受け取ったら、改行を入れずに `offer` を呼びます。束に貼られている短冊のときだけです。

`offer` は、指でつまんだときと同じ `grab` を作り、指の代わりにたどる道を持たせます。

```ts
const offer = (s: Slip) => {
  // まん中の列から綴じ目を切り始める
  startTear(s, Math.floor(s.sheet.cols / 2))
  // 上から 3 行目のまん中の点をつまむ
  const index = 2 * (s.sheet.cols + 1) + Math.floor(s.sheet.cols / 2)
  const from = { x: s.sheet.pos[index * 3], y: s.sheet.pos[index * 3 + 1] }
  // 炎の先の 30px 上（画面の上から 20px より下）
  const to = { x: L.fireX, y: Math.max(20, L.coalY - L.flameH - 30) }
  grab = { slip: s, index, /* … */ path: { from, to, t: 0 } }
}
```

毎フレームの計算では、`grab.path` があれば、指の位置の代わりにこの道の上の位置をつかいます。進み方は始めと終わりをゆっくりにし、道の途中では最大 60px 持ち上げて弧を描きます。1.1 秒で火の上に着いたら、手を離したときと同じく `grab` を消し、短冊は火へ落ちます。

動きを減らす設定（`prefers-reduced-motion: reduce`）では、火の粉・灰・煙・紙の繊維は出さず、炎は止まった絵にして明るさも揺らしません。炭になった紙も反らせません。キーボードでくべたときの運ぶ動きも、1.1 秒から一瞬（0.05 秒）に縮めます。離した短冊は、落ちる途中は見せず、止まる位置へすぐ置きます。燃えるのも 3 倍の速さで済ませます。指についてくる動きと、燃え際が字の上を通るところは残しています。

## 割る案から焚き上げへ

焚き上げの短冊は、HTML を割る案から始まりました。

最初の案は「割れて戻るカード」でしたが、カードを割る意味がありませんでした。文字を割る別の案も、何のために割るのかがわからず、並んだ欄が ToDo リストに見えてしまいました。

焚き上げの短冊にしたのは、ちぎることと燃やすことに理由があるからです。手放したいことを書いてちぎり、火にくべるという焚き上げの手順が、欄に書く・要素をちぎる・テクスチャを焦がすという操作にそのまま重なります。

この焚き上げ所は、[水占みくじ](https://webmanab.com/lab/html-in-canvas-mizu-mikuji/)の昼の水盤と同じ社にあり、近くを[絵巻](https://webmanab.com/lab/html-in-canvas-emaki/)の川が流れています。
