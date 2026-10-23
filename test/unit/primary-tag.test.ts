import { describe, expect, it } from 'vitest'
import {
  EYECATCH_KEYS,
  LABELS,
  TYPOS,
  normalizePrimaryTag,
  primaryTagKey,
  type EyecatchKey,
  type PostType,
} from '../../src/lib/primary-tag.ts'

describe('primaryTagKey', () => {
  it('前後の空白を取って小文字にする', () => {
    expect(primaryTagKey(' wordpress')).toBe('wordpress')
    expect(primaryTagKey('studio ')).toBe('studio')
    expect(primaryTagKey('javaScript')).toBe('javascript')
    expect(primaryTagKey('Vue.js')).toBe('vue.js')
  })

  it('打ち間違い 7 語を直す', () => {
    expect(Object.keys(TYPOS)).toHaveLength(7)
    expect(primaryTagKey('aniamtion')).toBe('animation')
    expect(primaryTagKey('portpolio')).toBe('portfolio')
    expect(primaryTagKey('typograph')).toBe('typography')
    expect(primaryTagKey('edudation')).toBe('education')
    expect(primaryTagKey('holizon')).toBe('horizon')
    expect(primaryTagKey('spase')).toBe('space')
    expect(primaryTagKey('faniture')).toBe('furniture')
    expect(primaryTagKey(' Aniamtion ')).toBe('animation')
  })

  it('別の語はまとめない', () => {
    expect(primaryTagKey('sport')).not.toBe(primaryTagKey('sports'))
    expect(primaryTagKey('photo')).not.toBe(primaryTagKey('photograph'))
    expect(primaryTagKey('front-end')).not.toBe(primaryTagKey('frontend'))
  })

  it('空の値は空文字になる', () => {
    expect(primaryTagKey('')).toBe('')
    expect(primaryTagKey('  ')).toBe('')
    expect(primaryTagKey(null)).toBe('')
    expect(primaryTagKey(undefined)).toBe('')
  })
})

// 05-eyecatch.md 2 章の「代表カテゴリと正規化表」に載っている、旧データの値の振り分け
const TABLE: Record<EyecatchKey, Partial<Record<PostType, string[]>>> = {
  javascript: {
    tip: [
      'javascript',
      'plug-in',
      'jQuery',
      'JavaScript',
      'form',
      'event',
      'math',
      'mobile',
      'sp',
      'ES6',
      'mouse',
      'javaScript',
      'lightbox',
      'interactive',
      'regexp',
    ],
    lab: ['javascript', 'UI'],
  },
  css: {
    tip: [
      'css',
      'font',
      'CSS',
      'performance',
      'grid',
      'flex',
      'background',
      'svg',
      'navigation',
      'table',
      'bug',
    ],
    lab: ['CSS', 'css'],
  },
  sass: { tip: ['sass', 'Sass', 'mixin'] },
  html: {
    tip: ['html5', 'seo', 'responsive', 'favicon', 'SEO', 'viewport'],
    lab: ['responsive'],
  },
  vue: { tip: ['Vue.js', 'Nuxt'], clip: ['nuxt'], lab: ['Vue.js'] },
  typescript: { tip: ['typescript'] },
  wordpress: {
    tip: ['wordpress', 'admin', ' wordpress', ' Speed', 'WordPress'],
  },
  tooling: {
    tip: [
      'tool',
      'frontend',
      'git',
      'mac',
      'gulp',
      'webstorm',
      'ejs',
      'api',
      'brackets',
      'docker',
      'server',
      'android',
      'github',
      'terminal',
      'front-end',
      'slack',
      'photoshop',
    ],
  },
  canvas: {
    tip: ['createJS'],
    clip: ['canvas', 'geometric'],
    lab: ['processing.js', 'Createjs', 'createJS', 'CreateJs', 'noise'],
  },
  webgl: {
    tip: ['webGL', 'Threejs'],
    clip: ['webGL', 'WebGL', '360°', 'vr'],
    lab: ['WebGL'],
  },
  animation: {
    tip: ['animation', 'aniamtion'],
    clip: ['animation', 'interaction', 'slider', 'hover', 'loading', 'effect'],
    lab: ['animation', 'video', 'hover'],
  },
  scroll: { clip: ['scroll', 'parallax', 'fullscreen', 'horizon', 'holizon'] },
  studio: {
    tip: ['design', 'logo'],
    clip: ['studio', 'architecture', 'branding', 'studio ', 'creative'],
  },
  portfolio: {
    clip: [
      'portfolio',
      'gallery',
      'illustration',
      'photograph',
      'photo',
      'portpolio',
      'illust',
    ],
  },
  fashion: {
    clip: ['fashion', 'beauty', 'kawaii', 'woman', 'luxury', 'women'],
  },
  minimal: { clip: ['minimal', 'flat', 'soft', 'line'] },
  layout: {
    tip: ['UI'],
    clip: [
      'grid',
      'typography',
      'magazine',
      'layout',
      'UI',
      'media',
      'navigation',
      'responsive',
      'blog',
      'typograph',
    ],
  },
  food: { clip: ['food', 'drink', 'agriculture'] },
  culture: {
    clip: [
      'event',
      'music',
      'art',
      'movie',
      'japan',
      'education',
      'trip',
      'sports',
      'local',
      'video',
      'child',
      'audio',
      'leisure',
      'sport',
      'game',
      'edudation',
      'culture',
      'museum',
      'Japan',
      'school',
      'play',
    ],
  },
  color: {
    clip: [
      'dark',
      'red',
      'gradation',
      'yellow',
      'green',
      'blue',
      'vivid',
      'gold',
      'pink',
      'purple',
      'colorful',
      'color',
      'orange',
      'grey',
    ],
  },
  'generic-tip': {},
  'generic-clip': {
    clip: [
      'product',
      'corporate',
      'app',
      'sag',
      'ec',
      'car',
      'svg',
      'faniture',
      'community',
      'science',
      'technology',
      'hotel',
      'hospital',
      'factory',
      'recruit',
      'medical',
      'pet',
      '',
      'service',
      'traffic',
      'icon',
      'sea',
      'https://www.humbertpoyet.com/',
      'ffd',
      'wood',
      'nature',
      'spase',
      'shop',
      'form',
      'public',
    ],
  },
  'generic-lab': {},
}

const cases = Object.entries(TABLE).flatMap(([key, byType]) =>
  Object.entries(byType).flatMap(([type, raws]) =>
    raws.map((raw) => [type as PostType, raw, key as EyecatchKey] as const),
  ),
)

describe('normalizePrimaryTag', () => {
  it.each(cases)('%s の %j は %s', (type, raw, key) => {
    expect(normalizePrimaryTag(raw, [], type)).toBe(key)
  })

  it('type で意味が変わる値を type ごとに振り分ける', () => {
    expect(normalizePrimaryTag('event', [], 'tip')).toBe('javascript')
    expect(normalizePrimaryTag('event', [], 'clip')).toBe('culture')
    expect(normalizePrimaryTag('grid', [], 'tip')).toBe('css')
    expect(normalizePrimaryTag('grid', [], 'clip')).toBe('layout')
  })

  it('primaryTag で決まらない tip と lab はタームを順に引く', () => {
    expect(normalizePrimaryTag('', ['unknown', 'gulp', 'css'], 'tip')).toBe(
      'tooling',
    )
    expect(normalizePrimaryTag('???', ['form'], 'lab')).toBe('javascript')
    expect(normalizePrimaryTag('???', ['form'], 'tip')).toBe('javascript')
  })

  it('primaryTag で決まるときはタームを見ない', () => {
    expect(normalizePrimaryTag('css', ['gulp'], 'tip')).toBe('css')
  })

  it('clip はタームを見ない', () => {
    expect(normalizePrimaryTag('product', ['animation'], 'clip')).toBe(
      'generic-clip',
    )
  })

  it('どこにもなければ type ごとの汎用にする', () => {
    expect(normalizePrimaryTag('', [], 'tip')).toBe('generic-tip')
    expect(normalizePrimaryTag(null, ['nothing'], 'lab')).toBe('generic-lab')
    expect(normalizePrimaryTag(undefined, [], 'clip')).toBe('generic-clip')
  })
})

describe('EYECATCH_KEYS', () => {
  it('20 カテゴリと汎用 3 つで、どれにも表示名がある', () => {
    expect(EYECATCH_KEYS).toHaveLength(23)
    expect(new Set(EYECATCH_KEYS).size).toBe(23)
    expect(Object.keys(LABELS).sort()).toEqual([...EYECATCH_KEYS].sort())
  })
})
