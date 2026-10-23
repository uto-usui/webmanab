// カテゴリごとの絵柄。座標は 640 x 360（16:9）。前後記事ナビは中央の y 73〜287 だけが見えるので、主役はその帯に置く
import type { EyecatchKey } from './categories.ts'
import type { Rng } from './rng.ts'
import { circle, corners, doubleRect, g, line, path, polygon, polyline, rect, shadowed, translate } from './svg.ts'

export const C = {
  pink: '#f50057',
  yellow: '#ffd740',
  teal: '#2a8379',
  white: '#eeeeee',
  black: '#222831',
  gray: '#393E46',
} as const

export type Ctx = {
  rng: Rng
  W: number
  H: number
  hint: string // 正規化前の primaryTag（color の色合わせにだけ使う）
  stripes(color: string, period?: number, width?: number): string
  dots(color: string, step?: number, r?: number): string
  plus(color: string, step: number): string
}

export type Recipe = {
  ground: string
  ink: string // コーナー線などの共通の線の色
  draw(ctx: Ctx): string
}

const CX = 320
const CY = 180

// 角度の付いた括弧（{ }）。ロゴではなく記号として描く
function brace(x: number, top: number, bottom: number, dir: 1 | -1) {
  const m = (top + bottom) / 2
  const k = 22 * dir
  return [
    [x + k * 1.2, top],
    [x, top],
    [x, m - 16],
    [x - k, m],
    [x, m + 16],
    [x, bottom],
    [x + k * 1.2, bottom],
  ] as [number, number][]
}

function codeBars(rng: Rng, x: number, y: number, rows: number, step: number, colors: string[], maxW = 160) {
  let out = ''
  let indent = 0
  for (let i = 0; i < rows; i++) {
    const w = rng.range(maxW * 0.3, maxW - indent * 28)
    out += rect(x + indent * 28, y + i * step, w, 12, { fill: rng.pick(colors) })
    indent = Math.max(0, Math.min(2, indent + rng.pick([-1, 0, 1])))
  }
  return out
}

export const RECIPES: Record<EyecatchKey, Recipe> = {
  javascript: {
    ground: C.black,
    ink: C.white,
    draw({ rng, dots }) {
      const dx = rng.range(-24, 24)
      const top = 82
      const bottom = 278
      const lx = 196 + dx
      const rx = 444 + dx
      const st = { stroke: '', 'stroke-width': 18, 'stroke-linejoin': 'miter', 'stroke-linecap': 'square' }
      const braces = (c: string) =>
        polyline(brace(lx, top, bottom, 1), { ...st, stroke: c }) + polyline(brace(rx, top, bottom, -1), { ...st, stroke: c })
      return (
        rect(rng.range(380, 460), 0, 260, 360, { fill: dots(C.gray, 14, 3) }) +
        shadowed(braces, C.yellow, C.pink, 9) +
        codeBars(rng, lx + 44, 118, 5, 28, [C.white, C.white, C.pink, C.gray], rx - lx - 44 - 56 - 36)
      )
    },
  },

  css: {
    ground: C.white,
    ink: C.black,
    draw({ rng, stripes }) {
      const n = rng.int(4, 5)
      const w = 168
      const h = 44
      const sx = n === 5 ? 56 : 66
      const sy = n === 5 ? 46 : 58
      const x0 = CX - ((n - 1) * sx + w) / 2 + rng.range(-20, 20)
      const y0 = CY - ((n - 1) * sy + h) / 2
      const fills = rng.shuffle([C.teal, stripes(C.black), C.black, C.pink, stripes(C.teal)])
      let out = ''
      for (let i = 0; i < n; i++) {
        const x = x0 + i * sx
        const y = y0 + i * sy
        out += shadowed((c) => rect(x, y, w, h, { fill: c }), fills[i], C.gray, 7)
      }
      return out
    },
  },

  sass: {
    ground: C.gray,
    ink: C.white,
    draw({ rng, stripes }) {
      const x0 = 150 + rng.range(-20, 20)
      const rows = 6
      const step = 34
      const y0 = CY - (rows * step) / 2 + 8
      let out = rect(x0 - 40, y0 - 26, 360, rows * step + 30, { fill: stripes(C.black, 10, 3) })
      for (let l = 1; l <= 2; l++) out += line(x0 + l * 40 - 14, y0, x0 + l * 40 - 14, y0 + rows * step - 20, { stroke: C.white, 'stroke-width': 2, 'stroke-dasharray': '4 6', opacity: 0.5 })
      let level = 0
      for (let i = 0; i < rows; i++) {
        const w = rng.range(90, 230)
        const fill = level === 0 ? C.pink : i % 3 === 2 ? C.yellow : C.white
        out += rect(x0 + level * 40, y0 + i * step, w, 16, { fill, rx: 8 })
        level = i === rows - 2 ? 0 : Math.max(0, Math.min(2, level + rng.pick([1, 1, 0, -1])))
      }
      return out
    },
  },

  html: {
    ground: C.yellow,
    ink: C.black,
    draw({ rng, stripes }) {
      const cx = CX + rng.range(-20, 20)
      const s = 78
      const st = { fill: 'none', 'stroke-width': 26, 'stroke-linejoin': 'miter', 'stroke-linecap': 'square', stroke: '' }
      const lt = (c: string) =>
        polyline([[cx - 70, CY - s], [cx - 70 - s, CY], [cx - 70, CY + s]], { ...st, stroke: c }) +
        polyline([[cx + 70, CY - s], [cx + 70 + s, CY], [cx + 70, CY + s]], { ...st, stroke: c })
      const bx = rng.pick([60, 420])
      return (
        rect(bx, rng.range(40, 120), 160, 200, { fill: stripes(C.black, 10, 2.5) }) +
        shadowed(lt, C.black, C.pink, 10) +
        line(cx + 34, CY - 92, cx - 34, CY + 92, { stroke: C.pink, 'stroke-width': 22, 'stroke-linecap': 'square' })
      )
    },
  },

  vue: {
    ground: C.teal,
    ink: C.white,
    draw({ rng, dots }) {
      const levels = [96, 180, 264]
      const root = { x: CX + rng.range(-40, 40), y: levels[0] }
      const kids = rng.int(2, 3)
      const nodes: { x: number; y: number; d: number }[] = [{ ...root, d: 0 }]
      const edges: [number, number, number, number][] = []
      const span = kids === 2 ? 220 : 300
      for (let i = 0; i < kids; i++) {
        const x = CX - span / 2 + (span / (kids - 1)) * i
        nodes.push({ x, y: levels[1], d: 1 })
        edges.push([root.x, root.y, x, levels[1]])
        const gk = rng.int(0, 2)
        for (let j = 0; j < gk; j++) {
          const gx = x + (gk === 1 ? 0 : j === 0 ? -40 : 40)
          nodes.push({ x: gx, y: levels[2], d: 2 })
          edges.push([x, levels[1], gx, levels[2]])
        }
      }
      const hi = rng.int(1, nodes.length - 1)
      let out = rect(0, 0, rng.range(140, 220), 360, { fill: dots(C.black, 14, 3) })
      for (const [x1, y1, x2, y2] of edges) {
        const my = (y1 + y2) / 2
        out += polyline([[x1, y1], [x1, my], [x2, my], [x2, y2]], { stroke: C.white, 'stroke-width': 4 })
      }
      nodes.forEach((n, i) => {
        const s = n.d === 0 ? 44 : n.d === 1 ? 34 : 26
        if (i === hi) out += shadowed((c) => rect(n.x - s / 2, n.y - s / 2, s, s, { fill: c }), C.yellow, C.black, 6)
        else if (n.d === 2) out += circle(n.x, n.y, s / 2, { fill: C.teal, stroke: C.white, 'stroke-width': 4 })
        else out += rect(n.x - s / 2, n.y - s / 2, s, s, { fill: n.d === 0 ? C.black : C.white })
      })
      return out
    },
  },

  typescript: {
    ground: C.white,
    ink: C.black,
    draw({ rng, stripes }) {
      const s = 150
      const x = CX - 150 + rng.range(-20, 20)
      const y = CY - s / 2 + 10
      const ox = rng.range(46, 66)
      const oy = -rng.range(30, 46)
      return (
        rect(x - 70, y + 40, 120, 130, { fill: stripes(C.black, 10, 2.5) }) +
        rect(x, y, s, s, { fill: C.black }) +
        rect(x + ox, y + oy, s, s, { fill: 'none', stroke: C.teal, 'stroke-width': 8, 'stroke-dasharray': '18 10' }) +
        shadowed((c) => rect(x + s + ox + 40, CY - 34, 24, 24, { fill: c }) + rect(x + s + ox + 40, CY + 14, 24, 24, { fill: c }), C.pink, C.gray, 6) +
        rect(x + s + ox + 90, CY + 14, rng.range(50, 90), 24, { fill: C.teal })
      )
    },
  },

  wordpress: {
    ground: C.black,
    ink: C.white,
    draw({ rng, dots }) {
      const w = 230
      const h = 150
      const x = CX - w / 2 - 20 + rng.range(-20, 20)
      const y = CY - h / 2 + 20
      let out = rect(rng.pick([0, 460]), 0, 180, 360, { fill: dots(C.gray, 14, 3) })
      for (let i = 2; i >= 1; i--) out += rect(x + i * 26, y - i * 22, w, h, { fill: 'none', stroke: C.white, 'stroke-width': 3 })
      out += shadowed((c) => rect(x, y, w, h, { fill: c }), C.white, C.pink, 9)
      out += rect(x + 20, y + 22, rng.range(110, 170), 18, { fill: C.black })
      for (let i = 0; i < 3; i++) out += rect(x + 20, y + 62 + i * 22, rng.range(120, 190), 8, { fill: C.gray })
      out += rect(x + w - 56, y - 10, 40, 20, { fill: C.yellow })
      return out
    },
  },

  tooling: {
    ground: C.black,
    ink: C.white,
    draw({ rng }) {
      const px = 96 + rng.range(-10, 10)
      const prompt = (c: string) =>
        polyline([[px, CY - 52], [px + 52, CY], [px, CY + 52]], { stroke: c, 'stroke-width': 20, 'stroke-linejoin': 'miter', 'stroke-linecap': 'square' })
      let out = shadowed(prompt, C.yellow, C.pink, 8)
      out += rect(px + 76, CY + 34, 54, 16, { fill: C.white })
      // ブランチの線（main と、分かれて戻る枝）
      const x0 = 270
      const x1 = 580
      const my = CY + 40
      const by = CY - 50
      const bs = rng.range(305, 330)
      const be = rng.range(500, 540)
      out += line(x0, my, x1, my, { stroke: C.teal, 'stroke-width': 8 })
      out += polyline([[bs, my], [bs + 50, by], [be - 50, by], [be, my]], { stroke: C.white, 'stroke-width': 6 })
      const commits = [x0 + 6, bs, (bs + be) / 2, be, x1 - 6]
      for (const cx of commits) out += circle(cx, my, 12, { fill: C.black, stroke: C.teal, 'stroke-width': 6 })
      const top = be - bs - 100
      for (const k of [1, 2]) out += circle(bs + 50 + (top * k) / 3, by, 11, { fill: C.pink })
      return out
    },
  },

  canvas: {
    ground: C.black,
    ink: C.white,
    draw({ rng }) {
      const cols = 11
      const rows = 5
      const step = 44
      const x0 = CX - ((cols - 1) * step) / 2
      const y0 = CY - ((rows - 1) * step) / 2
      const fx = rng.range(0.4, 0.9)
      const fy = rng.range(0.5, 1.2)
      const ph = rng.range(0, Math.PI * 2)
      let out = ''
      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          const v = (Math.sin(i * fx + ph) + Math.cos(j * fy + ph * 0.7)) / 2 // -1..1
          const r = 3 + ((v + 1) / 2) * 17
          const x = x0 + i * step
          const y = y0 + j * step
          if (v > 0.55) out += circle(x, y, r, { fill: C.pink })
          else if (v > 0.1) out += circle(x, y, r - 2, { fill: 'none', stroke: C.white, 'stroke-width': 3 })
          else out += circle(x, y, Math.max(2.5, r * 0.4), { fill: C.gray })
        }
      }
      const amp = rng.range(40, 70)
      const wave: [number, number][] = []
      for (let x = 40; x <= 600; x += 10) wave.push([x, CY + Math.sin(x / 48 + ph) * amp])
      out += polyline(wave, { stroke: C.yellow, 'stroke-width': 5 })
      return out
    },
  },

  webgl: {
    ground: C.black,
    ink: C.white,
    draw({ rng, stripes }) {
      let out = ''
      // 背景の三角格子
      const t = 40
      const hgt = t * Math.sqrt(3) / 2
      for (let y = 0; y <= 360; y += hgt) out += line(0, y, 640, y, { stroke: C.gray, 'stroke-width': 1.5 })
      for (let k = -12; k <= 22; k++) {
        out += line(k * t, 0, k * t + 360 / Math.sqrt(3), 360, { stroke: C.gray, 'stroke-width': 1.5 })
        out += line(k * t, 0, k * t - 360 / Math.sqrt(3), 360, { stroke: C.gray, 'stroke-width': 1.5 })
      }
      // 等角投影の立方体。(cx, cy) は手前の上の頂点、s は横幅の半分
      const faces = (cx: number, cy: number, s: number) => {
        const h = s * 0.577
        const e = s * 1.155
        return {
          top: [[cx, cy - 2 * h], [cx + s, cy - h], [cx, cy], [cx - s, cy - h]] as [number, number][],
          left: [[cx - s, cy - h], [cx, cy], [cx, cy + e], [cx - s, cy - h + e]] as [number, number][],
          right: [[cx, cy], [cx + s, cy - h], [cx + s, cy - h + e], [cx, cy + e]] as [number, number][],
        }
      }
      const cx = CX + rng.range(-60, 60)
      const big = faces(cx, CY - 10, 92)
      out += polygon(big.top, { fill: C.yellow }) + polygon(big.left, { fill: stripes(C.white, 9, 3) }) + polygon(big.right, { fill: C.teal })
      const small = faces(cx + rng.pick([-200, 190]), CY + rng.range(-30, 20), 34)
      const wire = { fill: 'none', stroke: C.pink, 'stroke-width': 4, 'stroke-linejoin': 'round' }
      out += polygon(small.top, wire) + polygon(small.left, wire) + polygon(small.right, wire)
      return out
    },
  },

  animation: {
    ground: C.yellow,
    ink: C.black,
    draw({ rng }) {
      // ease-out で進みながら回る四角の残像
      const n = 6
      const s = 68
      const x0 = 110
      const x1 = 470
      const rot = rng.pick([90, 135, 180])
      const ease = (t: number) => 1 - Math.pow(1 - t, 3)
      const y0 = CY + rng.range(20, 50)
      const y1 = CY - rng.range(20, 50)
      const ty = 300
      let out = line(x0, ty, x1 + s, ty, { stroke: C.black, 'stroke-width': 4 })
      for (let i = 0; i <= 10; i++) {
        const x = x0 + (x1 + s - x0) * ease(i / 10)
        out += line(x, ty - 10, x, ty + 10, { stroke: C.black, 'stroke-width': 4 })
      }
      out += path(`M${x0 + s / 2} ${y0 + s / 2}C${x0 + 160} ${y0 + s / 2} ${x1 - 60} ${y1 + s / 2} ${x1 + s / 2} ${y1 + s / 2}`, { fill: 'none', stroke: C.black, 'stroke-width': 3, 'stroke-dasharray': '8 8' })
      for (let i = 0; i < n; i++) {
        const t = ease(i / (n - 1))
        const x = x0 + (x1 - x0) * t
        const y = y0 + (y1 - y0) * t
        const tr = `rotate(${Math.round(rot * t)} ${Math.round(x + s / 2)} ${Math.round(y + s / 2)})`
        if (i === n - 1) out += shadowed((c) => rect(x, y, s, s, { fill: c, transform: tr }), C.pink, C.black, 9)
        else out += rect(x, y, s, s, { fill: 'none', stroke: C.black, 'stroke-width': 5, transform: tr, opacity: 0.3 + 0.6 * (i / n) })
      }
      return out
    },
  },

  scroll: {
    ground: C.white,
    ink: C.black,
    draw({ rng, stripes, dots }) {
      const fills = rng.shuffle([C.black, stripes(C.black, 10, 3), dots(C.black, 12, 3), C.teal])
      const ys = [72, 124, 186, 238]
      const hs = [40, 50, 40, 46]
      let out = ''
      ys.forEach((y, i) => {
        const w = rng.range(260, 420)
        const x = 40 + rng.range(0, 480 - w)
        out += rect(x, y, w, hs[i], { fill: fills[i] })
      })
      const ty = 62
      const th = 236
      out += rect(592, ty, 14, th, { fill: 'none', stroke: C.black, 'stroke-width': 3 })
      out += shadowed((c) => rect(592, ty + rng.range(0, th - 64), 14, 64, { fill: c }), C.pink, C.gray, 5)
      return out
    },
  },

  studio: {
    ground: C.black,
    ink: C.white,
    draw({ rng, stripes }) {
      const shapes = [
        (x: number, y: number, c: string) => circle(x, y, 96, { fill: c }),
        (x: number, y: number, c: string) => rect(x - 80, y - 80, 160, 160, { fill: c }),
        (x: number, y: number, c: string) => polygon([[x, y - 92], [x + 96, y + 76], [x - 96, y + 76]], { fill: c }),
        (x: number, y: number, c: string) => path(`M${x - 96} ${y + 48}A96 96 0 0 1 ${x + 96} ${y + 48}Z`, { fill: c }),
      ]
      const slots: [number, number][] = [[170, CY + 4], [320, CY - 10], [470, CY + 6]]
      const order = rng.shuffle([0, 1, 2, 3]).slice(0, 3)
      const colors = rng.shuffle([C.pink, C.white, C.yellow, C.teal])
      let out = rect(rng.pick([40, 380]), 40, 220, 120, { fill: stripes(C.gray, 10, 3) })
      order.forEach((k, i) => {
        const [x, y] = slots[i]
        out += i === 1 ? shadowed((c) => shapes[k](x, y, c), colors[i], colors[i] === C.pink ? C.yellow : C.pink, 8) : shapes[k](x, y, colors[i])
      })
      return out
    },
  },

  portfolio: {
    ground: C.gray,
    ink: C.white,
    draw({ rng, stripes, dots }) {
      const cols = 4
      const w = 116
      const h = 74
      const gap = 18
      const x0 = CX - (cols * w + (cols - 1) * gap) / 2
      const y0 = CY - (2 * h + gap) / 2
      const hi = rng.int(0, 7)
      let out = ''
      for (let i = 0; i < 8; i++) {
        const x = x0 + (i % cols) * (w + gap)
        const y = y0 + Math.floor(i / cols) * (h + gap)
        if (i === hi) continue
        const kind = rng.pick(['line', 'line', 'stripe', 'dot', 'fill'])
        if (kind === 'line') out += rect(x + 1.5, y + 1.5, w - 3, h - 3, { fill: 'none', stroke: C.white, 'stroke-width': 3 })
        else if (kind === 'stripe') out += rect(x, y, w, h, { fill: stripes(C.white, 10, 2.5) })
        else if (kind === 'dot') out += rect(x, y, w, h, { fill: dots(C.white, 12, 2.5) })
        else out += rect(x, y, w, h, { fill: C.white })
      }
      const x = x0 + (hi % cols) * (w + gap)
      const y = y0 + Math.floor(hi / cols) * (h + gap)
      out += shadowed((c) => rect(x, y, w, h, { fill: c }), C.pink, C.yellow, 10)
      return out
    },
  },

  fashion: {
    ground: C.white,
    ink: C.black,
    draw({ rng, stripes }) {
      const n = 9
      const w = 34
      const step = 50
      const x0 = CX - ((n - 1) * step) / 2
      const fills = [C.pink, C.black, stripes(C.black, 9, 3), C.black, C.pink]
      const off = rng.int(0, 4)
      let out = line(40, CY, 600, CY, { stroke: C.black, 'stroke-width': 3 })
      for (let i = 0; i < n; i++) {
        const hh = 120 + Math.abs(Math.sin(i * 0.9 + off)) * 110
        const x = x0 + i * step
        const y = CY - hh / 2 + rng.range(-12, 12)
        const k = hh * 0.35
        out += polygon([[x - w / 2 + k / 2, y], [x + w / 2 + k / 2, y], [x + w / 2 - k / 2, y + hh], [x - w / 2 - k / 2, y + hh]], { fill: fills[(i + off) % fills.length] })
      }
      return out
    },
  },

  minimal: {
    ground: C.white,
    ink: C.black,
    draw({ rng }) {
      const s = rng.range(44, 64)
      const x = rng.pick([180, 400]) + rng.range(-20, 20)
      const y = CY - s / 2 + rng.range(-20, 20)
      return (
        line(80, CY + 60, 560, CY + 60, { stroke: C.black, 'stroke-width': 3 }) +
        rect(x, y, s, s, { fill: C.black }) +
        circle(x > 300 ? 200 : 460, CY - 30 + rng.range(-10, 10), 10, { fill: C.pink }) +
        rect(x > 300 ? 120 : 470, CY + 76, 50, 6, { fill: C.teal })
      )
    },
  },

  layout: {
    ground: C.white,
    ink: C.black,
    draw({ rng, stripes, dots }) {
      const cols = 12
      const gx0 = 80
      const gw = 480
      const cw = gw / cols
      let out = ''
      for (let i = 0; i <= cols; i++) out += line(gx0 + i * cw, 40, gx0 + i * cw, 320, { stroke: C.gray, 'stroke-width': 1.5, opacity: 0.25 })
      const rows: [number, number][] = [[72, 92], [178, 50], [242, 44]]
      const fills = rng.shuffle([C.black, stripes(C.black, 10, 3), dots(C.black, 12, 3), C.teal, C.pink, C.black])
      let f = 0
      for (const [y, h] of rows) {
        const a = rng.pick([4, 5, 6, 7, 8])
        const spans = rng.chance(0.5) ? [a, cols - a] : [3, a - 3 > 0 ? a - 3 : 2, cols - 3 - (a - 3 > 0 ? a - 3 : 2)]
        let c = 0
        for (const sp of spans) {
          if (sp <= 0) continue
          out += rect(gx0 + c * cw + 4, y, sp * cw - 8, h, { fill: fills[f++ % fills.length] })
          c += sp
        }
      }
      return out
    },
  },

  food: {
    ground: C.teal,
    ink: C.white,
    draw({ rng }) {
      const x = CX - 30 + rng.range(-30, 30)
      let out = shadowed((c) => circle(x, CY, 104, { fill: c }), C.white, C.black, 9)
      out += circle(x, CY, 82, { fill: 'none', stroke: C.teal, 'stroke-width': 4 })
      out += circle(x + rng.range(-20, 20), CY + rng.range(-20, 20), 44, { fill: C.pink })
      out += circle(x + 150, CY - 40 + rng.range(-20, 20), 40, { fill: C.yellow })
      // 皿の外にだけ散らす
      for (let i = 0, placed = 0; i < 40 && placed < 8; i++) {
        const px = rng.range(60, 580)
        const py = rng.range(50, 310)
        if (Math.hypot(px - x, py - CY) < 124 || Math.abs(px - x - 130) < 70) continue
        out += circle(px, py, rng.range(3, 6), { fill: C.black, opacity: 0.6 })
        placed++
      }
      const sx = x + 118
      out += line(sx, CY + 120, sx + 120, CY - 110, { stroke: C.black, 'stroke-width': 8 })
      out += line(sx + 24, CY + 124, sx + 144, CY - 106, { stroke: C.black, 'stroke-width': 8 })
      return out
    },
  },

  culture: {
    ground: C.black,
    ink: C.white,
    draw({ rng }) {
      const n = 15
      const w = 14
      const gap = 10
      const left = rng.chance(0.5)
      const x0 = left ? 220 : 60
      let out = ''
      for (let i = 0; i < n; i++) {
        const h = 24 + Math.abs(Math.sin(i * 0.7 + rng.range(0, 0.6))) * rng.range(120, 190)
        const c = i % 5 === 2 ? C.pink : i === 9 ? C.yellow : C.white
        out += rect(x0 + i * (w + gap), CY - h / 2, w, h, { fill: c })
      }
      const rx = left ? 120 : 520
      for (let k = 1; k <= 4; k++) out += circle(rx, CY, k * 22, { fill: 'none', stroke: k === 4 ? C.pink : C.gray, 'stroke-width': 4 })
      return out
    },
  },

  color: {
    ground: C.white,
    ink: C.black,
    draw({ rng, stripes, hint }) {
      const tag = hint.trim().toLowerCase()
      const lead = /red|pink|purple/.test(tag) ? C.pink : /yellow|gold|orange/.test(tag) ? C.yellow : /green|blue/.test(tag) ? C.teal : /dark|grey/.test(tag) ? C.black : null
      const base = rng.shuffle([C.pink, C.yellow, C.teal, C.black, C.gray])
      const list = lead ? [lead, ...base.filter((c) => c !== lead)] : base
      const ws = list.map((_, i) => (i === 0 ? 132 : rng.range(48, 72)))
      const gap = 12
      let x = (640 - (ws.reduce((a, b) => a + b, 0) + gap * list.length + 56)) / 2
      let out = ''
      list.forEach((c, i) => {
        const w = ws[i]
        const y = 70 + (i % 2) * 20 + rng.range(-10, 10)
        if (i === 0) out += shadowed((cc) => rect(x, y, w, 210, { fill: cc }), c, C.gray, 8)
        else out += rect(x, y, w, 210, { fill: c })
        x += w + gap
      })
      out += rect(x, 90, 56, 190, { fill: stripes(C.black, 10, 3) })
      return out
    },
  },

  'generic-tip': {
    ground: C.gray,
    ink: C.white,
    draw({ rng, dots }) {
      const lx = 150
      const st = { 'stroke-width': 14, 'stroke-linecap': 'square', stroke: C.white }
      return (
        rect(rng.pick([0, 440]), 0, 200, 360, { fill: dots(C.black, 14, 3) }) +
        polyline([[lx + 26, 90], [lx, 90], [lx, 270], [lx + 26, 270]], st) +
        polyline([[490 - 26, 90], [490, 90], [490, 270], [490 - 26, 270]], st) +
        codeBars(rng, lx + 50, 118, 5, 28, [C.white, C.yellow, C.pink, C.white], 230)
      )
    },
  },

  'generic-clip': {
    ground: C.gray,
    ink: C.white,
    draw({ rng, stripes, dots }) {
      const w = 360
      const h = 210
      const x = CX - w / 2 + rng.range(-30, 30)
      const y = CY - h / 2 + 8
      let out = rect(rng.pick([64, 436]), 64, 140, 232, { fill: dots(C.black, 12, 2.5) })
      out += shadowed((c) => rect(x, y, w, h, { fill: c }), C.white, C.pink, 10)
      out += rect(x, y, w, h, { fill: 'none', stroke: C.black, 'stroke-width': 4 })
      out += rect(x, y, w, 30, { fill: C.black })
      ;[C.pink, C.yellow, C.teal].forEach((c, i) => (out += circle(x + 20 + i * 20, y + 15, 6, { fill: c })))
      const hero = rng.pick([stripes(C.black, 10, 3), C.teal, C.pink])
      out += rect(x + 20, y + 48, w - 40, 70, { fill: hero })
      for (let i = 0; i < 3; i++) out += rect(x + 20 + i * 112, y + 134, 96, 56, { fill: i === rng.int(0, 2) ? C.yellow : C.gray })
      return out
    },
  },

  'generic-lab': {
    ground: C.teal,
    ink: C.white,
    draw({ rng, plus }) {
      let out = rect(60, 60, 540, 240, { fill: plus(C.white, 60), opacity: 0.6 })
      const cx = CX + rng.range(-60, 60)
      out += circle(cx, CY, 110, { fill: 'none', stroke: C.white, 'stroke-width': 4 })
      out += circle(cx, CY, 62, { fill: 'none', stroke: C.black, 'stroke-width': 4, 'stroke-dasharray': '10 8' })
      const a = rng.range(0, Math.PI * 2)
      out += shadowed((c) => circle(cx + Math.cos(a) * 110, CY + Math.sin(a) * 110, 18, { fill: c }), C.pink, C.black, 6)
      out += circle(cx, CY, 22, { fill: C.yellow })
      return out
    },
  },
}

// どのカテゴリにも重ねる共通の飾り（コーナー線）
export function frame(ink: string, rng: Rng) {
  return corners(22, 22, 596, 316, 34, ink, 4, rng.chance(0.5))
}

export { doubleRect, g, translate }
