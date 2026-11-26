---
id: 3021
type: lab
slug: "html-in-canvas-emaki"
title: "HTML の紙をつないで、先の場面が裏から透ける絵巻にする -『WebGL』"
date: 2026-11-08T00:42:14+09:00
excerpt: "HTML で描いた紙 8 枚を HTML-in-Canvas で 1 枚のテクスチャに並べ、頂点シェーダーで巻物の形に巻くと、横に引いて読める絵巻になります。巻いた部分に紙の裏から絵を透かす描き方、斜投影で当たり判定を見た目に合わせる方法、:has() で選んだものを先の場面に描く方法を書きます。"
primaryTag: "WebGL"
terms:
  - { id: 340, name: "WebGL", slug: "webgl" }
  - { id: 176, name: "javascript", slug: "javascript" }
  - { id: 174, name: "canvas", slug: "canvas" }
demoUrl: https://labobal.dev/html-emaki/
draft: false
---

HTML で描いた長い絵巻を、横に引いて読むデモです。題は「ともしび川絵巻」で、山のしずくが里と市をとおって夜の海へ出るまでの一日を、紙 8 枚に描いています。

<p><iframe src="https://labobal.dev/html-emaki/" width="100%" height="500" loading="lazy" title="透ける絵巻（デモ）" allow="fullscreen"></iframe></p>

[別のタブで開く](https://labobal.dev/html-emaki/) / [コードを見る（GitHub）](https://github.com/uto-usui/laboobal-dev/tree/master/src/demos/html-emaki)

絵巻なので、右から左へ読みます。左へ引くと、読んだところは右の巻きに巻きとられ、まだ開いていないところが左の巻きからほどけて出てきます。

市の場面で灯籠を選ぶと、選んだ灯籠が渡し舟、灯籠流し、海の場面に描きこまれ、最後の奥書には、流した灯籠の数が入ります。渡しの場面で岸を選ぶと、夕立の詞書と雨やどりの場所、灯籠を流す岸が変わります。変わった先の場面は、まだ巻かれたままでも、巻きの外のほうに来ていれば紙の裏から透けて見えます。

紙はどれも HTML で、灯籠はチェックボックス、岸はラジオボタンです。HTML-in-Canvas の基本（`<canvas content="drawable">`、`paint` イベントと `texElementSubImage2D`、`updateElementGeometry` での当たり判定）は[布をつまむデモの記事](https://webmanab.com/lab/html-in-canvas-cloth/)に書いたので、ここでは、布のデモになかったことを書きます。

記事のコードは、その節の説明にあたる部分だけを抜き出しています。全体は上の GitHub のリンクから読めます。

## 紙 8 枚を 1 枚のテクスチャに並べる

絵巻は、900 × 360px の紙を 8 枚つないだもので、長さは 7200px あります。次の HTML のように、紙 1 枚を `drawable` の付いた要素 1 つにして、canvas の子に並べています。

```html
<canvas class="view" content="drawable">
  <section class="sheet s0" drawable><!-- 表紙、見返し、序 --></section>
  <section class="sheet s1" drawable><!-- 一　みなもと --></section>
  <!-- … -->
  <section class="sheet s7 night" drawable><!-- 七　海へ、奥書 --></section>
</canvas>
```

WebGL の側では、8 枚を 1 枚のテクスチャ（atlas）に写します。紙 0 を右の端に置き、左へ順に並べるので、atlas の中でも巻物と同じ向きに絵がつながります。

次のコードは、紙 1 枚を atlas の決まったマスに写します。`gl` は WebGL2 のコンテキスト、`texture` は atlas のテクスチャです。`atlas` は、1 枚ぶんの幅と高さ（`tw`、`th`）と、1 段に並べる枚数（`cols`）を持っています。

```ts
const upload = (index: number, el: Element) => {
  // 紙 0 をいちばん右の列に置き、番号が増えるほど左の列へ
  const col = atlas.cols - 1 - (index % atlas.cols)
  // 1 段に入りきらない紙は、次の段へ折り返す
  const row = Math.floor(index / atlas.cols)
  gl.bindTexture(gl.TEXTURE_2D, texture)
  // 紙の HTML を、atlas の (col, row) のマスに写す
  gl.texElementSubImage2D(gl.TEXTURE_2D, 0, col * atlas.tw, row * atlas.th, el)
}
```

1 枚ぶんの大きさは `getElementImageDefaultSize` で取ります。この値は canvas の解像度の px で返るので、高解像度の画面では 8 枚が `MAX_TEXTURE_SIZE` の幅に収まらないことがあります。そのため `cols` は、atlas を取るときに `MAX_TEXTURE_SIZE` を 1 枚の幅で割って決めています（8 より大きくはしない）。8 枚が 1 段に入らない画面では、2 段目に折り返します。

紙を写すのは `paint` の中です。`paint` は、canvas の子のどれかの見た目が変わると来ます。イベントの `changedElements` には、見た目が変わった子だけが入っています。そこに入った紙だけを写し直せば、灯籠を 1 つ選んだときに 8 枚すべてを写さずに済みます。

次のコードは、`paint` のたびに、見た目の変わった紙だけを atlas に写し直します。`sheets` は 8 枚の紙の要素、`scene.upload` は上の `upload` です。`scene.allocate` は、1 枚ぶんの大きさが前と違えば atlas を取り直し、そのときだけ `true` を返します。

```ts
canvas.addEventListener('paint', (e) => {
  // 紙 1 枚ぶんの大きさ（canvas の解像度の px）
  const size = canvas.getElementImageDefaultSize(sheets[0])
  const tw = Math.ceil(size.width)
  const th = Math.ceil(size.height)
  if (!tw || !th) return
  // atlas を取り直したときと、最初の 1 回は 8 枚とも写す
  const all = scene.allocate(tw, th) || !ready
  // changedElements は型にまだないので、型を足して読む
  const list = (e as Event & { changedElements?: Iterable<Element> })
    .changedElements
  const changed = list ? new Set(list) : undefined
  // 見た目の変わった紙だけを写し直す。changedElements がなければ全部
  for (const [i, sheet] of sheets.entries())
    if (all || !changed || changed.has(sheet)) scene.upload(i, sheet)
  ready = true
  dirty = true
})
```

`ready` は一度でも写したかの印、`dirty` は次のフレームで描き直すかの印です。描き直しは `requestAnimationFrame` のループの中で、`dirty` が立っているときだけ行います。

シェーダーでは、紙の上の位置を、巻物の始まり（右の端）からの長さ `s` で表します。次の関数は、`s` と天地の位置 `y` を受け取り、そこに描かれている絵の色を atlas から読んで返します。つかう uniform は次の 4 つです。

- `uTex`: atlas
- `uSheetW`: 紙 1 枚の幅
- `uPH`: 紙の高さ
- `uAtlas`: 1 枚の幅と高さ（atlas 全体に対する割合）、1 段の枚数、紙の枚数

```glsl
vec3 ink(float s, float y) {
  // 何枚目の紙か
  float i = clamp(floor(s / uSheetW), 0.0, uAtlas.w - 1.0);
  // 紙の中の横の位置（0 が左端、1 が右端）。s は右から数えるので向きを逆にする
  float u = 1.0 - clamp((s - i * uSheetW) / uSheetW, 0.0, 1.0);
  // その紙が atlas のどの列と段にあるか。upload と同じ並べ方
  float col = uAtlas.z - 1.0 - mod(i, uAtlas.z);
  float row = floor(i / uAtlas.z);
  // 天地は紙の中にとどめ、わずかに内側を読む。atlas が 2 段のとき、
  // となりの段の紙の色が混ざらないように（seep がずらして読んだ点も含む）
  vec2 uv = vec2((col + u) * uAtlas.x, (row + clamp(y / uPH, 0.002, 0.998)) * uAtlas.y);
  return texture(uTex, uv).rgb;
}
```

atlas の並べ方を `upload` と合わせてあるので、絵巻のどこを読むときも、割り算と余りだけで atlas の中の位置が出ます。横の向きに同じ処理がないのは、左右のとなりのマスが続きの紙なので、となりの色を拾っても絵がつながるだけだからです。巻きの形を作るときも、裏から透けた絵を作るときも、この `ink` で色を読みます。

## 巻きの形は頂点シェーダーで決める

紙は、右の巻き、平らなところ、左の巻きの 3 つに分かれます。読んだ長さを `read` とします。`s` が `read` より小さいところは、右の巻きに入っています。そこから平らなところの幅だけ進んだ先が、左の巻きです。

JavaScript で絵巻を描き直すたびに計算するのは、2 つの巻きの中心の x、外の半径、芯の半径、平らなところとの境目の `s` だけです。次のコードは、`read` からこの 4 つの値を巻きごとに作ります。`LEN` は絵巻の長さ（7200）、`flatW` は平らに開く幅、`CORE_R` と `CORE_L` は右と左の芯の半径です。

```ts
const rolls = (): Rolls => {
  // 右の巻きに入っている長さ。読んだ長さと同じ
  const sR = clamp(read, 0, LEN)
  // 平らに開いている幅の先からが、左の巻き
  const sL = clamp(read + openWidth(), sR, LEN)
  // 紙の上の位置 s が来る、机の上の x。右の巻きの中心が x = flatW に来る
  const x = (s: number) => flatW - (s - read)
  return {
    // 中心の x、外の半径、芯の半径、平らなところとの境目の s
    right: [x(sR), rollRadius(CORE_R, sR), CORE_R, sR],
    // 左の巻きの半径は、まだ巻かれている長さ LEN - sL から出す
    left: [x(sL), rollRadius(CORE_L, LEN - sL), CORE_L, sL],
  }
}
```

`openWidth()` は、平らに開いている幅を返します。絵巻は最初、巻いたまま右に置いてあり、この幅が 2.6 秒かけて 0 から `flatW` まで広がります。

### 巻きは等間隔の渦にする

巻いた紙の断面は、芯のまわりの渦です。外の半径を R、芯の半径を c とすると、紙の厚みが一定なら、断面の面積 π(R² − c²) は、紙の厚み × 巻いた長さと同じになります。これを R について解くと、巻いた長さから外の半径が出ます。次の関数が、その式です。

```ts
/** 紙の厚み。本物より厚くして、木口の渦が見えるようにしている */
const THICK = 0.9

// π(R² − core²) = THICK × length を R について解いたもの
const rollRadius = (core: number, length: number) =>
  Math.sqrt(core * core + (THICK * length) / Math.PI)
```

右の巻きには `read` の長さが入り、左の巻きには `LEN - sL` の長さが残っています。読み進めるほど右の巻きが太くなり、左の巻きが細くなります。

紙の上の各点の位置は、頂点シェーダーで同じ式から求めます。頂点に入れるのは、紙の上の位置 `s` と天地の `y` だけです。紙を `s` の向きに 2px ごとの帯に分け、帯ごとに天と地の 2 点を置くので、頂点は 7202 個です。描くときは `TRIANGLE_STRIP` で、帯をつないだ 1 枚の紙として描きます。巻きの形は uniform だけで決まるので、このバッファーは最初に 1 回作ったら変えません。描き直すたびに送るのは、`rolls()` の値などの uniform だけです。

頂点シェーダーの入力は、attribute の `aSY`（紙の上の位置 `s` と天地の `y`）と、次の uniform です。

- `uRollR`、`uRollL`: 右と左の巻き。`rolls()` が返す 4 つの値
- `uLen`: 絵巻の長さ
- `uThick`: 紙の厚み
- `uLift`: 速く引いている間に、平らな紙を浮かせる高さ

出力は `gl_Position` で、机の上の 3D の点 `p` を画面に写したものです。次のコードは、`s` が右の巻き、左の巻き、平らなところのどれに入るかで分けて、`p` を決めます。光を当てるための向きや、フラグメントシェーダーへ渡す値の計算は省いています。シェーダーの全体は [shaders.ts](https://github.com/uto-usui/laboobal-dev/blob/master/src/demos/html-emaki/shaders.ts) にあります。

```glsl
// p は机の上の点。x は横、y は紙の天から地、z は机からの高さ
float s = aSY.x;
float y = aSY.y;
vec3 p;
float r = 0.0;
if (s < uRollR.w) {
  // 右の巻き。ここまでに巻いた長さ s から、この点の半径を出す（rollRadius と同じ式）
  r = sqrt(uRollR.z * uRollR.z + uThick * s / PI);
  // 外の半径から厚み 1 つ分内側に入るごとに、角度が 1 周進む
  float th = 2.0 * PI * (uRollR.y - r) / uThick;
  // 巻きの中心は (uRollR.x, 高さ uRollR.y)。角度 0 が、机に接する真下の点
  p = vec3(uRollR.x + r * sin(th), y, uRollR.y - r * cos(th));
} else if (s > uRollL.w) {
  // 左の巻き。まだ巻かれている長さ uLen - s で数え、x の向きを逆にする
  r = sqrt(uRollL.z * uRollL.z + uThick * (uLen - s) / PI);
  float th = 2.0 * PI * (uRollL.y - r) / uThick;
  p = vec3(uRollL.x - r * sin(th), y, uRollL.y - r * cos(th));
} else {
  // 平らなところ。右の巻きの境目から、進んだ分だけ左へ
  float x = uRollR.x - (s - uRollR.w);
  // 速く引いている間だけ、まんなかを uLift の高さまで浮かせる
  float span = max(uRollR.x - uRollL.x, 1.0);
  p = vec3(x, y, uLift * sin(PI * (x - uRollL.x) / span));
}
// …
gl_Position = toClip(p);
```

巻きの中心を高さ R（外の半径）に置いているので、巻きは机に接しています。境目の `s` では r が R、角度が 0 になり、点が `(中心の x, y, 0)` に来ます。平らな紙の端と同じ点なので、巻きと平らな紙は切れ目なくつながります。

`toClip` は 3D の点を画面に写す関数です。中身は、あとの斜投影の節で書きます。

### 木口に渦の線を描く

巻きの手前の端（木口）は、地の側だけが見えます。ここには、巻きの断面がちょうど入る正方形（一辺は外の半径の 2 倍）を描きます。フラグメントシェーダーで円の外を捨てたうえで、層の境目を渦の線にしています。

木口のフラグメントシェーダーの入力は、次の 3 つです。出力は木口の色です。

- `vLocal`: 巻きの中心からの位置。正方形の中で、x と y がそれぞれ −R から R まで動く
- `uRoll`: 中心の x、外の半径、芯の半径、巻く向き（左の巻きは 1、右は −1）
- `uThick`: 紙の厚み

```glsl
float rho = length(vLocal);
float R = uRoll.y;
float core = uRoll.z;
// 円の外は捨てる
if (rho > R) discard;
// 芯の断面は、こげ茶で塗る
if (rho < core) {
  outColor = vec4(vec3(0.16, 0.1, 0.07) * (0.7 + 0.3 * rho / core), 1.0);
  return;
}
// 紙が下の接点から巻き始める向きで測った角度
float th = mod(atan(-uRoll.w * vLocal.x, -vLocal.y), 2.0 * PI);
// 外から何巻き目か。紙の層の境目で整数になる
float k = (R - rho) / uThick - th / (2.0 * PI);
float f = fract(k);
float w = fwidth(k);
// 整数に近いほど 1（層の境目の線）
float gap = 1.0 - smoothstep(0.0, w * 1.3 + 0.02, min(f, 1.0 - f));
// 線が細かすぎて潰れるところほど 1
float dense = smoothstep(0.35, 0.8, w);
// 層ごとに紙の明るさをすこし変える
vec3 paper = vec3(0.85, 0.8, 0.7) * (0.9 + 0.1 * hash(vec2(floor(k), 3.0)));
// 線は半分の明るさ。潰れるところは、線を描かずに 0.84 倍で塗る
vec3 col = paper * mix(1.0 - 0.5 * gap, 0.84, dense);
// …
outColor = vec4(col, 1.0);
```

`k` は、その点が外から何巻き目にあるかを表す値で、中心からの距離と角度から出します。同じ距離でも角度が 1 周進むと 1 つ内側の層になるので、角度の分を引いています。こうすると、線が同心円ではなく渦になります。

`fwidth` は、となりの画素とのあいだで `k` がどれだけ変わるかです。巻きが画面で小さく写ると、1 画素のあいだに何層もまたぐので、この値が大きくなります。そこでは線が詰まって潰れるので、線を消して平均の濃さで塗ります。

### 芯は軸と八双

左の巻きの芯は、絵巻の終わりに付く軸です。半径 9px の軸に、黒漆に金の帯を巻いた軸首を付け、紙の天地から 11px 出しています。右の巻きの芯は、絵巻の始まりに付く八双（細い竹）で、半径は 3.5px です。読みはじめは右の巻きに紙がほとんど入っていないので、右には細い八双だけが見えます。

軸も八双も、y の向きの円柱を同じ `toClip` で描いています。

## 裏から透ける

巻きの外に見えているのは紙の裏です。絵は内側を向いているので、外からは、墨や絵具が紙を通して薄く見えるはずです。そこで、巻いた部分では同じ位置 `s` の絵を読み、ぼかして色をすこし抜いてから、紙の裏の色に薄く重ねています。巻きの上の面では、紙の進む向きが平らなところと逆になります。そのため、同じ位置を読むだけで、透けた絵は本物の紙と同じく左右が逆に見えます。

次の関数は、位置 `s`、`y` の絵を、裏から透けた色にして返します。`blur` はぼかす幅、`sat` は色の残し方（0 で灰色、1 でもとの色）です。返すのは色そのものではなく、紙の裏の色に掛ける比です。

```glsl
// 紙の地の色。HTML の紙の背景色と同じ
const vec3 PAPER = vec3(0.937, 0.902, 0.824);

vec3 seep(float s, float y, float blur, float sat) {
  // まわりの 4 点を読んで足す。あとで 4 で割って、ぼかした色にする
  vec3 t = ink(s + blur, y + blur * 0.6) + ink(s - blur, y - blur * 0.6)
    + ink(s + blur * 0.6, y - blur) + ink(s - blur * 0.6, y + blur);
  // 地の色で割る。何も描いていない部分は 1、絵のある部分は 1 より小さい
  vec3 ratio = clamp(t * 0.25 / PAPER, 0.0, 1.15);
  // 灰色と混ぜて、色をすこし抜く
  return mix(vec3(dot(ratio, vec3(0.3333))), ratio, sat);
}
```

この比を紙の裏の色に掛けるので、絵のない部分の裏の色は変わりません。絵のある部分だけが暗く、すこし色づきます。ぼかすのは、紙の中で光が散るからです。

巻いた部分の色は、この `seep` を 2 回重ねて作ります。次のコードは、巻いた部分の 1 点の色 `col` を作ります。つかう値は次のとおりです。

- `BACK`: 紙の裏の色
- `cloud`、`fib`: 紙のむらと繊維のノイズ（0〜1）
- `seam`: 紙継ぎの上で 1 になる値
- `vSide`、`vR`: 巻きの向き（右は −1、左は 1）と、この点の半径。頂点シェーダーから受け取る

```glsl
// 紙の裏の色に、むらと繊維を入れる
vec3 back = BACK * (0.955 + 0.06 * cloud - 0.05 * fib);
// 1 回目: この点の絵を、すこしぼかして 36% の濃さで重ねる。紙継ぎでは透けにくい
col = back * mix(vec3(1.0), seep(s, y, 1.4, 0.75), 0.36 * (1.0 - 0.45 * seam));
// 2 回目: 1 巻き内側の絵。1 周の長さ 2πr だけ、巻きの奥へ進んだ位置
float s2 = s + vSide * 2.0 * PI * vR;
// 絵巻の外に出たら重ねない
if (s2 > 0.0 && s2 < uLen) {
  // もっとぼかして色を抜き、14% の濃さで重ねる
  col *= mix(vec3(1.0), seep(s2, y, 3.0, 0.5), 0.14);
}
```

右の巻きでは奥ほど `s` が小さく、左の巻きでは奥ほど `s` が大きいので、`vSide` を掛けて向きを合わせています。1 巻き内側の絵は、もう 2 枚ぶんの紙を通して見ることになるので、1 回目より強くぼかし、色を抜き、薄く重ねています。

夜の場面が左の巻きに近づくと、暗い夜の絵が透けてくるので、左の巻き全体が暗く見えます。これは別に書いた処理ではなく、透けを足したら自然にそうなりました。

紙の質感にも手を入れています。

- 紙継ぎ: 紙と紙の境目の数 px は、2 枚が重なって厚いので、すこし暗くし、透け方を 45% 弱める
- 耳: 紙の天地の縁を、ノイズで決めた幅だけ `discard` で削り、不揃いにする
- 繊維とむら: 向きの違う細長いノイズを 3 つ重ねて楮の繊維にし、別のノイズで明るさのむらを入れる

## 斜投影にすると、当たり判定が平行移動と拡大だけで済む

巻きは立体なので、3D の点を画面へ写す必要があります。このデモでは、透視ではなく、z の分だけ画面の上へずらす斜投影をつかっています。

次の関数 `toClip` は、机の上の点 `p` を受け取り、WebGL のクリップ座標を返します。`p` の x は横、y は紙の天から地、z は机からの高さで、どれも縮める前の px です。つかう uniform は次の 4 つです。

- `uView`: canvas の大きさ（CSS の px）
- `uOrigin`: 机の座標の原点が来る画面の位置
- `uK`: 縮める倍率
- `uKy`: 高さを上へずらす割合（0.42）

```glsl
vec4 toClip(vec3 p) {
  // 高さ z の点は、uKy × z だけ上に写す。z = 0 なら平行移動と拡大だけ
  vec2 sc = uOrigin + uK * vec2(p.x, p.y - uKy * p.z);
  // 画面の px を -1〜1 に直す
  vec2 c = sc / uView * 2.0 - 1.0;
  // 画面の y は下向き、クリップ座標の y は上向きなので、上下を逆にする。
  // 深さは、目の向き (0, uKy, 1) に進んだ点ほど手前にする
  return vec4(c.x, -c.y, -(uKy * p.y + p.z) / 3000.0, 1.0);
}
```

巻きの膨らみと木口は、斜め上から見た形に描かれます。一方、机に置いた平らな紙は z = 0 なので、画面への写し方は `uOrigin + uK * (x, y)`、つまり平行移動と拡大だけです。HTML の当たり判定にも、同じ平行移動と拡大を `updateElementGeometry` の `canvasTransform` に渡せば、見えている紙と当たり判定がずれません。

絵巻では、建物の中を描くときに屋根や天井を外し（吹抜屋台）、奥行きを斜め上へずらす平行投影で描きます。このデモは、巻物そのものを、絵巻の中の絵と同じ投影で描いています。

### 平らに見えているところだけに当たり判定を置く

当たり判定を置くのは、平らに見えているところだけです。巻きは、紙が机に接する境目から、平らなところの側へ半径の幅だけはみ出しています。その下に隠れる幅も外します。巻きにかかりかけた灯籠や岸の札は、見えていても押せません。

次のコードは、絵巻を描き直すたびに、紙ごとに平らに見えている範囲を出し、その範囲が画面のどこに写るかを計算します。`r` は `rolls()` の値です。`view.ox`、`view.oy`、`view.k` は、`toClip` の `uOrigin` と `uK` に渡しているのと同じ値です。`lift` は平らな紙の浮きの高さ、`SHEET_W` は紙 1 枚の幅（900）です。

```ts
// hitKeys[i] は、紙 i に前に渡した値
const hitKeys: string[] = []
const placeHitAreas = (r: Rolls) => {
  // 平らに見えている範囲（s）。巻きの境目から、半径の幅だけ内側
  const from = r.right[3] + r.right[1]
  const to = r.left[3] - r.left[1]
  for (const [i, sheet] of sheets.entries()) {
    // 紙 i（s で i × 900 から (i + 1) × 900）のうち、平らに見えている範囲
    const a = Math.max(from, i * SHEET_W)
    const b = Math.min(to, (i + 1) * SHEET_W)
    // 平らなところに出ていないか、紙が浮いているときは外す
    const off = lift > 1 || b - a < 1
    // 紙の左の端（s = (i + 1) × 900）が写る画面の x。rolls() の x(s) を toClip と同じく写す
    const tx =
      view.ox + view.k * (r.right[0] - ((i + 1) * SHEET_W - r.right[3]))
    // （次の抜粋へ続く）
```

紙 1 枚のうち平らに見えているところは、いつもひと続きです。1 つの要素に付けられる当たり判定は四角 1 つだけですが、紙ごとに四角 1 つで足ります。

次のコードは、上のループの続きです。計算した値を、前のフレームと違うときだけ HTML の当たり判定に渡します。

```ts
    // 前のフレームと同じ値なら、渡さずに次の紙へ
    const key = off ? 'off' : `${tx},${a},${b},${view.k},${view.oy}`
    if (hitKeys[i] === key) continue
    hitKeys[i] = key
    if (off) {
      canvas.clearElementGeometry(sheet)
      continue
    }
    canvas.updateElementGeometry(sheet, {
      // toClip で z = 0 の点を写すのと同じ、平行移動と拡大
      canvasTransform: new DOMMatrix().translate(tx, view.oy).scale(view.k),
      // 要素の中の座標で、s が a から b の部分だけを残す
      canvasClip: {
        x: (i + 1) * SHEET_W - b,
        y: 0,
        width: b - a,
        height: PAPER_H,
      },
    })
  }
}
```

`canvasClip` の座標は、canvas の座標ではなく、要素の中の座標です。`s` は右の端から数えているので、紙 `i` の左の端は `s = (i + 1) × 900` です。`s` が `a` から `b` までを残すには、要素の中の x で `(i + 1) × 900 − b` から幅 `b − a` を渡します。

`canvasClip` を渡すと、値が同じでも、その要素に `paint` が来ます。`paint` の中では `dirty` を立てるので、毎フレーム渡すと、絵巻が止まっていても描き直しと 8 枚の写し直しが止まりません。そこで、`hitKeys` に前のフレームの値を覚えておき、変わったときだけ `updateElementGeometry` を呼んでいます。

## 選んだ灯籠と岸を :has() だけで先の場面に描く

選んだ灯籠と岸は、CSS の `:has()` だけで先の場面に描き入れています。`.view` は canvas そのもので、8 枚の紙はどれもその中にあります。canvas に `:has()` を付けると、市の紙のチェックボックスを見て、渡しや灯籠流しの紙の絵を変えられます。

次の CSS は、canvas の中のチェックボックスとラジオボタンを見て、先の紙の絵を出し分けます。`#lan-1`〜`#lan-5` は市の紙にある灯籠のチェックボックスです。`.lan-1` などは、先の場面に描いた同じ色の灯籠で、ふだんは `display: none` にしてあります。`#bank-far` は、渡しの紙にある「むこう岸」のラジオボタンです。

```css
/* 選んだ灯籠を、渡し舟、灯籠流し、海の場面に出す */
.view:has(#lan-1:checked) .lan-1,
.view:has(#lan-2:checked) .lan-2,
.view:has(#lan-3:checked) .lan-3,
.view:has(#lan-4:checked) .lan-4,
.view:has(#lan-5:checked) .lan-5 {
  display: block;
}

/* むこう岸を選んだら、舟をむこう岸へ寄せる */
.view:has(#bank-far:checked) .boat {
  transform: translate(10px, -50px) scale(0.92);
}
/* こちらの岸のときだけの詞書と絵を消し、むこう岸のときだけのものを出す */
.view:has(#bank-far:checked) .near-only {
  display: none;
}
.view:has(#bank-far:checked) .far-only {
  display: inline;
}
/* 灯籠流しの灯籠を、奥の岸寄りに浮かべる */
.view:has(#bank-far:checked) .float {
  top: 252px;
}

/* 灯籠をひとつでも選んだら、灯籠流しの詞書を替える */
.view:has(.lantern input:checked) .some-only {
  display: block;
}
.view:has(.lantern input:checked) .none-only {
  display: none;
}
```

灯籠を選ぶと `paint` が来ます。`changedElements` には絵の変わった紙だけが入っているので、その紙だけを atlas に写し直します。巻いた部分の透けも同じ atlas から読んでいるので、まだ巻かれたままの先の場面にも、選んだ灯籠が裏から透けて見えます。

JavaScript で書きこむのは、奥書に入れる灯籠の数と日付だけです。どちらも漢数字にしています。数はチェックボックスが変わるたびに数え直し、0 のときは「灯籠をひとつも流す」と書きます。日付はページを開いたときの日で、年は「二〇二六」のように 1 字ずつ、月と日は「十一」のように十をつかって書きます。

## 巻きの奥に入った紙の CSS animation を止める

紙の絵には、霧、水車、夕立、浮かぶ灯籠などの CSS animation があります。animation が動いている間は、その紙の見た目が毎フレーム変わるので、`paint` も毎フレーム来ます。巻きの奥に入って見えない紙まで写し続けるのはむだなので、その紙の animation を止めています。

次のコードは、絵巻を描き直すたびに、紙ごとに巻きの奥に入ったかを見て、入った紙に `is-rolled` のクラスを付けます。`r` は `rolls()` の値で、`r.right[3]` は右の巻きの境目の `s`、`r.right[1]` は外の半径です。

```ts
// awake[i] は、紙 i を動かしているか
const awake: boolean[] = []
const pauseHidden = (r: Rolls) => {
  // 巻きの境目から、外の 1 周の長さの 2 倍までは動かしておく
  const from = r.right[3] - 2 * Math.PI * r.right[1] * 2
  const to = r.left[3] + 2 * Math.PI * r.left[1] * 2
  for (const [i, sheet] of sheets.entries()) {
    // 紙 i が、動かしておく範囲にすこしでもかかっているか
    const on = (i + 1) * SHEET_W > from && i * SHEET_W < to
    // 変わったときだけクラスを付け替える
    if (awake[i] === on) continue
    awake[i] = on
    sheet.classList.toggle('is-rolled', !on)
  }
}
```

`is-rolled` の付いた紙は、次の CSS で、中の animation をすべて止めます。

```css
.sheet.is-rolled,
.sheet.is-rolled * {
  animation-play-state: paused !important;
}
```

巻きの外に見えている層では、`seep` の 1 回目がその層の絵を、2 回目が 1 巻き内側の絵を読みます。読むのは境目からおよそ 2 周の範囲なので、そこまでは止めません。内側の巻きほど 1 周が短いので、外の 1 周で数えておけば足ります。

## 操作

引く以外の操作も用意しています。記事に埋めこんだとき、読む人のスクロールを邪魔しないようにもしています。

- 横にドラッグすると、指の動いた分だけ読み進む。離したときの速さで慣性が付き、止めてから離すと（最後の動きから 80ms 以上）流れない。端を越えて引くと 0.3 倍しか動かず、離すと戻る
- 灯籠や岸の札の上で押したときは引かず、札を選ぶ操作になる。引いたあとの click は、紙の上の札に届かせない
- トラックパッドの横のスワイプでも動く。縦のホイールは記事のスクロールに残す
- タッチでは、縦になぞると記事がスクロールする。タップしたあとの 4 秒は、縦に動かしても絵巻を引ける
- ← → キーで、平らなところの 6 割ずつ進む。ラジオボタンにフォーカスがあるときは、ラジオボタンが矢印キーをつかうので動かさない
- Tab で巻かれた札に来たら、その札が平らなところの真ん中に来るまで開く。クリックでフォーカスが移ったときは動かさない

次のコードは、ホイールの動きのうち、横の量が縦の量より大きいものだけを受け取って読み進めます。`read` は読んだ長さ、`resist` は端を越えた分を 0.3 倍にする関数です。`target` はキーで寄せていく先、`velocity` は慣性の速さです。

```ts
stage.addEventListener(
  'wheel',
  (e) => {
    // 縦の動きのほうが大きければ、何もせず記事のスクロールに任せる
    if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return
    e.preventDefault()
    // 行単位で来たときは px に直す
    const unit = e.deltaMode === 1 ? 16 : 1
    // キーで寄せている途中の動きと、慣性を止める
    target = undefined
    velocity = 0
    // 画面の px を、縮める前の紙の px に直して動かす
    read = resist(read - (e.deltaX * unit) / view.k)
    dirty = true
  },
  { passive: false },
)
```

`passive: false` で登録しているのは、`preventDefault` でページの横スクロールを止めるためです。縦のときは `preventDefault` を呼ばずに戻るので、記事のスクロールはそのまま動きます。

Tab で来たかどうかは、`focusin` の中で、フォーカスを受けた要素が `:focus-visible` に当たるかどうかで見分けています。次のコードは、紙の中の要素にキーボードでフォーカスが来たとき、その要素が巻きにかかっていれば、平らなところの真ん中まで開きます。`goTo` は、読んだ長さを指定の値までなめらかに寄せる関数です。

```ts
canvas.addEventListener('focusin', (e) => {
  const el = e.target as HTMLElement
  const sheet = el.closest<HTMLElement>('.sheet')
  // クリックで来たときは :focus-visible に当たらないので、動かさない
  if (!sheet || !el.matches(':focus-visible')) return
  // …
  // 要素が平らなところの真ん中に来るまで開く
  goTo(s - flatW / 2)
})
```

省いたところでは、要素の真ん中が紙の上のどの位置 `s` にあるかを出しています。`offsetParent` をたどって `offsetLeft` を足し、紙の左の端から要素の真ん中までの距離を求めます。紙の左の端の `s` からその距離を引いたものが `s` です。その位置が平らなところの内側（両端から 40px より内）にあれば、開かずに戻ります。

動きを減らす設定のときは、最初に開く動き、慣性、紙の浮き、水や雨の animation を止めます。キーと Tab で動かすときも、なめらかに寄せずにすぐ移ります。ドラッグはそのまま、指に合わせて動きます。

## 捨てた案

ぼくは最初、縦にスクロールする短い巻物を作っていました。ところが、巻いた感じが出ませんでした。そこで、裏からの透けを足し、中身もずっと長くして、右から左へ読む横の絵巻にしました。木口の渦、紙継ぎ、耳も、巻いた紙に見えるように足したものです。

紙を 12 枚にする案もありました。枚数より先に巻きの形と透け、絵の出来を詰めたかったので、8 枚にしています。
