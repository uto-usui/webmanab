import { normalizePrimaryTag, LABELS, type EyecatchKey, type PostType } from './categories.ts'
import glyphData from './glyphs.json' with { type: 'json' }
import { C, frame, RECIPES, type Ctx } from './motifs.ts'
import { createRng, hashString } from './rng.ts'
import { attrs, corners, doubleRect, r1, rect, shadowed } from './svg.ts'

export type EyecatchInput = {
  type: PostType
  primaryTag?: string | null
  terms?: { slug: string }[]
  id: number
  slug?: string
  title?: string
}

const W = 640
const H = 360

function makeCtx(seed: string, hint: string, prefix: string) {
  const defs: string[] = []
  const cache = new Map<string, string>()
  const register = (key: string, body: (id: string) => string) => {
    let id = cache.get(key)
    if (!id) {
      id = `${prefix}${cache.size}`
      cache.set(key, id)
      defs.push(body(id))
    }
    return `url(#${id})`
  }
  const ctx: Ctx = {
    rng: createRng(seed),
    W,
    H,
    hint,
    // 45 度のストライプ
    stripes: (color, period = 10, width = 3) =>
      register(`s${color}${period}${width}`, (id) =>
        `<pattern${attrs({ id, width: period, height: period, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' })}>${rect(0, 0, width, period, { fill: color })}</pattern>`),
    // 互い違いのドット
    dots: (color, step = 12, r = 2.5) =>
      register(`d${color}${step}${r}`, (id) =>
        `<pattern${attrs({ id, width: step, height: step, patternUnits: 'userSpaceOnUse' })}><circle${attrs({ cx: step / 4, cy: step / 4, r, fill: color })}/><circle${attrs({ cx: (step * 3) / 4, cy: (step * 3) / 4, r, fill: color })}/></pattern>`),
    // 十字（+）の格子
    plus: (color, step) =>
      register(`p${color}${step}`, (id) =>
        `<pattern${attrs({ id, width: step, height: step, patternUnits: 'userSpaceOnUse' })}>${rect(step / 2 - 7, step / 2 - 1.5, 14, 3, { fill: color })}${rect(step / 2 - 1.5, step / 2 - 7, 3, 14, { fill: color })}</pattern>`),
  }
  return { ctx, defs }
}

export function eyecatchKey(input: EyecatchInput): EyecatchKey {
  return normalizePrimaryTag(input.primaryTag, (input.terms ?? []).map((t) => t.slug), input.type)
}

// 記事の絵柄（背景なし）を返す。pattern の id は記事ごとに変えて、同じページに並べてもぶつからないようにする
function art(key: EyecatchKey, id: number, hint: string, withFrame = true) {
  const seed = `${key}:${id}`
  const prefix = `e${hashString(seed).toString(36)}`
  const { ctx, defs } = makeCtx(seed, hint, prefix)
  const recipe = RECIPES[key]
  // 模様や形が 640x360 の外へ出ても、描画系によらず枠で切れるようにする
  const clip = `${prefix}c`
  defs.push(`<clipPath id="${clip}">${rect(0, 0, W, H)}</clipPath>`)
  const body = `<g clip-path="url(#${clip})">${recipe.draw(ctx)}${withFrame ? frame(recipe.ink, ctx.rng) : ''}</g>`
  return { recipe, body, defs: `<defs>${defs.join('')}</defs>` }
}

export function renderEyecatch(input: EyecatchInput): string {
  const key = eyecatchKey(input)
  const { recipe, body, defs } = art(key, input.id, input.primaryTag ?? '')
  // 地がページと同じ #eeeeee だと境目が消えるので、サイトの二重線で縁取る
  const edge = recipe.ground === C.white ? doubleRect(0, 0, W, H, C.black, 4) : ''
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${defs}${rect(0, 0, W, H, { fill: recipe.ground })}${body}${edge}</svg>`
}

// ---- 文字（OGP 用）。Open Sans Bold Italic のアウトラインを JSON で持っているので、フォントに依存しない
type Glyphs = { em: number; capHeight: number; glyphs: Record<string, { d: string; adv: number }> }
const font = glyphData as Glyphs

export function textPath(text: string, x: number, baseline: number, size: number, a: Record<string, string> = {}) {
  const s = size / font.em
  let cursor = 0
  let out = ''
  for (const ch of text) {
    const gl = font.glyphs[ch] ?? font.glyphs[' ']
    if (gl.d) out += `<path transform="translate(${r1(x + cursor * s)} ${r1(baseline)}) scale(${s.toFixed(4)})" d="${gl.d}"/>`
    cursor += gl.adv
  }
  return { svg: `<g${attrs(a)}>${out}</g>`, width: cursor * s }
}

// OGP（1200 x 630）はカテゴリごとに 1 枚。上に 16:9 の絵柄、下の帯にカテゴリ名とサイト名を置く。
// 絵柄の左右の余りは背景色で埋める
export function renderOgp(key: EyecatchKey): string {
  const OW = 1200
  const OH = 630
  const { recipe, body, defs } = art(key, 0, '', false)
  const ah = 500
  const scale = ah / H
  const ox = (OW - W * scale) / 2
  const label = LABELS[key].toUpperCase()
  const size = 64
  const capH = size * (font.capHeight / font.em)
  // 暗い地では黒いチップが沈むので白黒を反転する
  const dark = recipe.ground === C.black || recipe.ground === C.gray
  const t = textPath(label, 0, 0, size, { fill: dark ? C.black : C.white })
  const pad = 22
  const bw = t.width + pad * 2
  const bh = capH + pad * 2
  const bx = 64
  const by = OH - 44 - bh
  const chip = (c: string) => rect(bx, by, bw, bh, { fill: c })
  const siteSize = 30
  const site = textPath('webmanab.html', 0, 0, siteSize, { fill: recipe.ink })
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${OW} ${OH}" width="${OW}" height="${OH}">${defs}` +
    rect(0, 0, OW, OH, { fill: recipe.ground }) +
    `<g transform="translate(${r1(ox)} 6) scale(${r1(scale * 1000) / 1000})">${body}</g>` +
    corners(28, 28, OW - 56, OH - 56, 48, recipe.ink, 6) +
    shadowed(chip, dark ? C.white : C.black, C.pink, 10) +
    `<g transform="translate(${r1(bx + pad)} ${r1(by + pad + capH)})">${t.svg}</g>` +
    `<g transform="translate(${r1(OW - 72 - site.width)} ${r1(by + pad + capH)})">${site.svg}</g>` +
    `</svg>`
  )
}

// サイト側が使う URL の組。SVG は記事ごと、OGP の PNG はカテゴリごと
export function eyecatchFor(input: EyecatchInput) {
  const category = eyecatchKey(input)
  return { category, svg: `/eyecatch/${input.type}/${input.id}.svg`, og: `/og/${category}.png` }
}

export { normalizePrimaryTag, LABELS }
