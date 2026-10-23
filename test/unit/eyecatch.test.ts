import { createHash } from 'node:crypto'
import { Resvg } from '@resvg/resvg-js'
import { describe, expect, it } from 'vitest'
import {
  eyecatchFor,
  eyecatchKey,
  renderEyecatch,
  renderOgp,
  type EyecatchInput,
} from '../../src/lib/eyecatch/index.ts'
import { EYECATCH_KEYS, type EyecatchKey } from '../../src/lib/primary-tag.ts'

// カテゴリごとに、そのカテゴリになる入力を 1 つ
const SAMPLES: Record<EyecatchKey, Omit<EyecatchInput, 'id'>> = {
  javascript: { type: 'tip', primaryTag: 'javascript' },
  css: { type: 'tip', primaryTag: 'css' },
  sass: { type: 'tip', primaryTag: 'sass' },
  html: { type: 'tip', primaryTag: 'html5' },
  vue: { type: 'tip', primaryTag: 'Vue.js' },
  typescript: { type: 'tip', primaryTag: 'typescript' },
  wordpress: { type: 'tip', primaryTag: 'wordpress' },
  tooling: { type: 'tip', primaryTag: 'tool' },
  canvas: { type: 'lab', primaryTag: 'processing.js' },
  webgl: { type: 'clip', primaryTag: 'webGL' },
  animation: { type: 'clip', primaryTag: 'animation' },
  scroll: { type: 'clip', primaryTag: 'scroll' },
  studio: { type: 'clip', primaryTag: 'studio' },
  portfolio: { type: 'clip', primaryTag: 'portfolio' },
  fashion: { type: 'clip', primaryTag: 'fashion' },
  minimal: { type: 'clip', primaryTag: 'minimal' },
  layout: { type: 'clip', primaryTag: 'grid' },
  food: { type: 'clip', primaryTag: 'food' },
  culture: { type: 'clip', primaryTag: 'music' },
  color: { type: 'clip', primaryTag: 'red' },
  'generic-tip': { type: 'tip', primaryTag: '' },
  'generic-clip': { type: 'clip', primaryTag: 'product' },
  'generic-lab': { type: 'lab', primaryTag: '' },
}

const IDS = Array.from({ length: 30 }, (_, i) => 1000 + i * 37)
const inputs = EYECATCH_KEYS.flatMap((key) =>
  IDS.map((id) => ({ key, input: { ...SAMPLES[key], id } })),
)
const all = inputs.flatMap(({ input }) => [
  renderEyecatch(input),
  renderEyecatch(input, { variant: 'nav' }),
])
const sha256 = (s: string) => createHash('sha256').update(s).digest('hex')
// 文字はパスで埋め込んでいるので、システムのフォントは読まない（読むと 1 枚ごとに遅くなる）
const rasterize = (svg: string) =>
  new Resvg(svg, { font: { loadSystemFonts: false } }).render()
const ids = (svg: string) =>
  [...svg.matchAll(/ id="([^"]+)"/g)].map((m) => m[1])

describe('eyecatchKey / eyecatchFor', () => {
  it('見本の入力がそれぞれのカテゴリになる', () => {
    for (const key of EYECATCH_KEYS)
      expect(eyecatchKey({ ...SAMPLES[key], id: 1 })).toBe(key)
  })

  it('記事の SVG とナビ用の SVG は id で、OGP はカテゴリで URL を作る', () => {
    expect(
      eyecatchFor({
        type: 'tip',
        id: 2883,
        primaryTag: 'Nuxt',
        terms: [{ slug: 'nuxt' }],
      }),
    ).toEqual({
      category: 'vue',
      svg: '/eyecatch/tip/2883.svg',
      nav: '/eyecatch/tip/2883-nav.svg',
      og: '/og/vue.png',
    })
  })
})

describe('renderEyecatch', () => {
  it('同じ入力なら同じ文字列になる', () => {
    for (const { input } of inputs.slice(0, 50)) {
      expect(renderEyecatch({ ...input })).toBe(renderEyecatch(input))
      expect(renderEyecatch({ ...input }, { variant: 'nav' })).toBe(
        renderEyecatch(input, { variant: 'nav' }),
      )
    }
  })

  it('記事ごと・変種ごとに違う絵になる', () => {
    expect(new Set(all).size).toBe(all.length)
  })

  it('絵柄を変えていない（変えたときはこの値を更新する）', () => {
    expect(sha256(all.join('\n'))).toBe(
      'c0a6806d5ce96f7224fad171413344a4c9608a8d6abee6987ede1a06133c67fe',
    )
  })

  it('640x360 で、NaN や undefined が混ざらず、8KB 以内', () => {
    for (const svg of all) {
      expect(svg).toMatch(/^<svg [^>]*viewBox="0 0 640 360"/)
      expect(svg).not.toMatch(/NaN|undefined|Infinity/)
      expect(Buffer.byteLength(svg)).toBeLessThanOrEqual(8 * 1024)
    }
  })

  it('同じページに並べても id がぶつからない', () => {
    const seen = new Set<string>()
    for (const svg of all) {
      for (const id of ids(svg)) {
        expect(seen.has(id)).toBe(false)
        seen.add(id)
      }
    }
  })

  it('ナビ用は地が黒で、模様を使わず、白・黄・黒だけで描く', () => {
    for (const { input } of inputs) {
      const svg = renderEyecatch(input, { variant: 'nav' })
      expect(svg).not.toContain('<pattern')
      expect(svg).toContain(
        '<rect x="0" y="0" width="640" height="360" fill="#222831"/>',
      )
      for (const c of new Set(svg.match(/#[0-9a-fA-F]{6}/g)))
        expect(['#222831', '#eeeeee', '#ffd740']).toContain(c)
    }
  })

  it('resvg で描画できる', () => {
    for (const key of EYECATCH_KEYS) {
      const input = { ...SAMPLES[key], id: 1 }
      for (const svg of [
        renderEyecatch(input),
        renderEyecatch(input, { variant: 'nav' }),
      ]) {
        const png = rasterize(svg)
        expect([png.width, png.height]).toEqual([640, 360])
      }
    }
  })
})

describe('renderOgp', () => {
  it('23 カテゴリとも 1200x630 で描画でき、同じ入力なら同じ文字列になる', () => {
    for (const key of EYECATCH_KEYS) {
      const svg = renderOgp(key)
      expect(renderOgp(key)).toBe(svg)
      expect(svg).toMatch(/^<svg [^>]*viewBox="0 0 1200 630"/)
      expect(svg).not.toMatch(/NaN|undefined|Infinity/)
      const png = rasterize(svg)
      expect([png.width, png.height]).toEqual([1200, 630])
    }
  })
})
