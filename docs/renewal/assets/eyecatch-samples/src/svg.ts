// SVG 文字列を組み立てる小さな関数群。数値は小数 1 桁に丸めてファイルを小さく、出力を安定させる
export const r1 = (n: number) => Math.round(n * 10) / 10

type Attrs = Record<string, string | number | undefined | false>

export function attrs(o: Attrs): string {
  let s = ''
  for (const [k, v] of Object.entries(o)) {
    if (v === undefined || v === false) continue
    s += ` ${k}="${typeof v === 'number' ? r1(v) : v}"`
  }
  return s
}

export const rect = (x: number, y: number, w: number, h: number, a: Attrs = {}) =>
  `<rect${attrs({ x, y, width: w, height: h, ...a })}/>`
export const circle = (cx: number, cy: number, r: number, a: Attrs = {}) => `<circle${attrs({ cx, cy, r, ...a })}/>`
export const line = (x1: number, y1: number, x2: number, y2: number, a: Attrs = {}) =>
  `<line${attrs({ x1, y1, x2, y2, ...a })}/>`
export const path = (d: string, a: Attrs = {}) => `<path${attrs({ d, ...a })}/>`
export const pts = (p: [number, number][]) => p.map(([x, y]) => `${r1(x)},${r1(y)}`).join(' ')
export const polygon = (p: [number, number][], a: Attrs = {}) => `<polygon${attrs({ points: pts(p), ...a })}/>`
export const polyline = (p: [number, number][], a: Attrs = {}) =>
  `<polyline${attrs({ points: pts(p), fill: 'none', ...a })}/>`
export const g = (children: string | string[], a: Attrs = {}) =>
  `<g${attrs(a)}>${Array.isArray(children) ? children.join('') : children}</g>`
export const translate = (dx: number, dy: number) => `translate(${r1(dx)} ${r1(dy)})`

// サイトの `-5px 5px 0` のずらした影。左下にずらした複製を先に描く
export function shadowed(draw: (color: string) => string, main: string, shadow: string, d = 8) {
  return g(draw(shadow), { transform: translate(-d, d) }) + draw(main)
}

// サイトの `border: 6px double`。3 / 3 / 3 の二重線（640 幅の座標系）
export function doubleRect(x: number, y: number, w: number, h: number, color: string, unit = 3) {
  const o = unit / 2
  const i = unit * 2 + unit / 2
  return (
    rect(x + o, y + o, w - unit, h - unit, { fill: 'none', stroke: color, 'stroke-width': unit }) +
    rect(x + i, y + i, w - i * 2, h - i * 2, { fill: 'none', stroke: color, 'stroke-width': unit })
  )
}

// 見出しの角括弧のようなコーナー線。左上と右下（flip で右上と左下）
export function corners(x: number, y: number, w: number, h: number, len: number, color: string, sw = 4, flip = false) {
  const a = { fill: 'none', stroke: color, 'stroke-width': sw, 'stroke-linecap': 'square' as const }
  if (!flip) {
    return (
      polyline([[x, y + len], [x, y], [x + len, y]], a) +
      polyline([[x + w, y + h - len], [x + w, y + h], [x + w - len, y + h]], a)
    )
  }
  return (
    polyline([[x + w - len, y], [x + w, y], [x + w, y + len]], a) +
    polyline([[x, y + h - len], [x, y + h], [x + len, y + h]], a)
  )
}
