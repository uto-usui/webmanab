import {
  LABELS,
  normalizePrimaryTag,
  type EyecatchKey,
  type PostType,
} from '../primary-tag.ts'
import glyphData from './glyphs.json' with { type: 'json' }
import { C, frame, RECIPES, type Ctx } from './motifs.ts'
import { createRng, hashString } from './rng.ts'
import {
  attrs,
  corners,
  doubleRect,
  r1,
  rect,
  shadowed,
  type Attrs,
} from './svg.ts'

// frontmatter の記事をそのまま渡せる形。terms は { id, name, slug } のままでよい
export type EyecatchInput = {
  type: PostType
  id: number
  primaryTag?: string | null
  terms?: readonly { slug: string }[]
}

// nav は前後記事ナビの背景用。70% のグレーが重なっても形が残るよう、明暗の差を強める
export type EyecatchVariant = 'default' | 'nav'

export const EYECATCH_WIDTH = 640
export const EYECATCH_HEIGHT = 360
const W = EYECATCH_WIDTH
const H = EYECATCH_HEIGHT

export function eyecatchKey(input: EyecatchInput): EyecatchKey {
  return normalizePrimaryTag(
    input.primaryTag,
    (input.terms ?? []).map((t) => t.slug),
    input.type,
  )
}

// サイト側が使う URL の組。SVG は記事ごと、OGP の PNG はカテゴリごと
export function eyecatchFor(input: EyecatchInput) {
  const category = eyecatchKey(input)
  const base = `/eyecatch/${input.type}/${input.id}`
  return {
    category,
    svg: `${base}.svg`,
    nav: `${base}-nav.svg`,
    og: `/og/${category}.png`,
  }
}

// ナビ用の色。上に rgba(57, 62, 70, .7) が重なると明るく残るのは白と黄だけなので、
// 地は黒にし、地と同じ色（切り抜きとして使っている部分）は黒、ピンクは黄、それ以外は白にする
function navColor(hex: string, ground: string): string {
  if (hex === ground) return C.black
  if (hex === C.pink || hex === C.yellow) return C.yellow
  return C.white
}

function makeCtx(
  seed: string,
  hint: string,
  prefix: string,
  ground: string,
  nav: boolean,
) {
  const defs: string[] = []
  const cache = new Map<string, string>()
  // nav では模様を単色の塗りにする（被せた後はざらつきにしか見えないため）
  const register = (
    key: string,
    color: string,
    body: (id: string) => string,
  ) => {
    if (nav) return color
    let id = cache.get(key)
    if (!id) {
      id = `${prefix}${cache.size}`
      cache.set(key, id)
      defs.push(body(id))
    }
    return `url(#${id})`
  }
  const pattern = (id: string, size: number, a: Attrs, children: string) =>
    `<pattern${attrs({ id, width: size, height: size, patternUnits: 'userSpaceOnUse', ...a })}>${children}</pattern>`
  const ctx: Ctx = {
    rng: createRng(seed),
    hint,
    // 45 度のストライプ
    stripes: (color, period = 10, width = 3) =>
      register(`s${color}${period}${width}`, color, (id) =>
        pattern(
          id,
          period,
          { patternTransform: 'rotate(45)' },
          rect(0, 0, width, period, { fill: color }),
        ),
      ),
    // 互い違いのドット
    dots: (color, step = 12, r = 2.5) =>
      register(`d${color}${step}${r}`, color, (id) =>
        pattern(
          id,
          step,
          {},
          `<circle${attrs({ cx: step / 4, cy: step / 4, r, fill: color })}/>` +
            `<circle${attrs({ cx: (step * 3) / 4, cy: (step * 3) / 4, r, fill: color })}/>`,
        ),
      ),
    // 十字（+）の格子
    plus: (color, step) =>
      register(`p${color}${step}`, color, (id) =>
        pattern(
          id,
          step,
          {},
          rect(step / 2 - 7, step / 2 - 1.5, 14, 3, { fill: color }) +
            rect(step / 2 - 1.5, step / 2 - 7, 3, 14, { fill: color }),
        ),
      ),
    backdrop: (svg) => (nav ? '' : svg),
    // nav で影と本体が同じ色になるときは、太って見えるだけなので影を描かない
    shadowed: (draw, main, shadow, d) =>
      nav && navColor(main, ground) === navColor(shadow, ground)
        ? draw(main)
        : shadowed(draw, main, shadow, d),
  }
  return { ctx, defs }
}

// nav の色と線幅の置き換え。絵柄の文字列はこのモジュールの関数だけで組み立てているので、
// 色は 6 色の "#rrggbb"、線幅は stroke-width="数" の形でしか出てこない
function toNav(body: string, ground: string) {
  return body
    .replace(
      /"(#[0-9a-fA-F]{6})"/g,
      (_, hex: string) => `"${navColor(hex, ground)}"`,
    )
    .replace(
      /stroke-width="([\d.]+)"/g,
      (_, n: string) => `stroke-width="${r1(Number(n) * 1.5)}"`,
    )
}

// 絵柄（地の色なし）を返す。pattern と clipPath の id は記事ごと・変種ごとに変えて、
// 同じページに並べてもぶつからないようにする
function art(
  key: EyecatchKey,
  id: number,
  hint: string,
  { withFrame, nav }: { withFrame: boolean; nav: boolean },
) {
  const seed = `${key}:${id}`
  const prefix = `${nav ? 'n' : 'e'}${hashString(seed).toString(36)}`
  const recipe = RECIPES[key]
  const { ctx, defs } = makeCtx(seed, hint, prefix, recipe.ground, nav)
  // 模様や格子は描きやすさのために枠の外まで伸ばしているので、描画系によらず枠で切る
  const clip = `${prefix}c`
  defs.push(`<clipPath id="${clip}">${rect(0, 0, W, H)}</clipPath>`)
  let drawn = recipe.draw(ctx)
  if (nav) drawn = toNav(drawn, recipe.ground)
  // コーナー線はナビの文字と重なるので nav では描かない
  else if (withFrame) drawn += frame(recipe.ink, ctx.rng)
  const body = `<g clip-path="url(#${clip})">${drawn}</g>`
  return { recipe, body, defs: `<defs>${defs.join('')}</defs>` }
}

const svgOpen = (w: number, h: number) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">`

// 640x360 の SVG 文字列。同じ入力なら必ず同じ文字列になる
export function renderEyecatch(
  input: EyecatchInput,
  { variant = 'default' }: { variant?: EyecatchVariant } = {},
): string {
  const key = eyecatchKey(input)
  const nav = variant === 'nav'
  const { recipe, body, defs } = art(key, input.id, input.primaryTag ?? '', {
    withFrame: true,
    nav,
  })
  const ground = nav ? C.black : recipe.ground
  // 地がページと同じ #eeeeee だと境目が消えるので、サイトの二重線で縁取る
  const edge = ground === C.white ? doubleRect(0, 0, W, H, C.black, 4) : ''
  return `${svgOpen(W, H)}${defs}${rect(0, 0, W, H, { fill: ground })}${body}${edge}</svg>`
}

// ---- OGP の文字。Open Sans Bold Italic のアウトラインを JSON で持ち、フォントに依存しない
type Glyphs = {
  em: number
  capHeight: number
  glyphs: Record<string, { d: string; adv: number }>
}
const font: Glyphs = glyphData

function textPath(text: string, size: number, a: Attrs) {
  const s = size / font.em
  let cursor = 0
  let out = ''
  for (const ch of text) {
    const gl = font.glyphs[ch] ?? font.glyphs[' ']
    if (gl.d)
      out += `<path transform="translate(${r1(cursor * s)} 0) scale(${s.toFixed(4)})" d="${gl.d}"/>`
    cursor += gl.adv
  }
  return { svg: `<g${attrs(a)}>${out}</g>`, width: cursor * s }
}

// 1200x630 の OGP。カテゴリごとに 1 枚で、記事ごとの値は使わない。
// 上に 16:9 の絵柄（左右の余りは地の色）、下の帯にカテゴリ名とサイト名を置く
export function renderOgp(key: EyecatchKey): string {
  const OW = 1200
  const OH = 630
  const { recipe, body, defs } = art(key, 0, '', {
    withFrame: false,
    nav: false,
  })
  const ah = 500
  const scale = ah / H
  const ox = (OW - W * scale) / 2
  const size = 64
  const capH = size * (font.capHeight / font.em)
  // 暗い地では黒いチップが沈むので白黒を反転する
  const dark = recipe.ground === C.black || recipe.ground === C.gray
  const label = textPath(LABELS[key].toUpperCase(), size, {
    fill: dark ? C.black : C.white,
  })
  const pad = 22
  const bw = label.width + pad * 2
  const bh = capH + pad * 2
  const bx = 64
  const by = OH - 44 - bh
  const chip = (c: string) => rect(bx, by, bw, bh, { fill: c })
  const site = textPath('webmanab.html', 30, { fill: recipe.ink })
  return (
    svgOpen(OW, OH) +
    defs +
    rect(0, 0, OW, OH, { fill: recipe.ground }) +
    `<g transform="translate(${r1(ox)} 6) scale(${r1(scale * 1000) / 1000})">${body}</g>` +
    corners(28, 28, OW - 56, OH - 56, 48, recipe.ink, 6) +
    shadowed(chip, dark ? C.white : C.black, C.pink, 10) +
    `<g transform="translate(${r1(bx + pad)} ${r1(by + pad + capH)})">${label.svg}</g>` +
    `<g transform="translate(${r1(OW - 72 - site.width)} ${r1(by + pad + capH)})">${site.svg}</g>` +
    `</svg>`
  )
}
