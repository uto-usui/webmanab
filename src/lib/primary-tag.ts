// primaryTag の正規化。関連記事は primaryTagKey（タグそのものの比較キー）、
// アイキャッチは normalizePrimaryTag（20 カテゴリと type ごとの汎用にまとめる）を使う
export type PostType = 'tip' | 'clip' | 'lab'

export const CATEGORIES = [
  'javascript',
  'css',
  'sass',
  'html',
  'vue',
  'typescript',
  'wordpress',
  'tooling',
  'canvas',
  'webgl',
  'animation',
  'scroll',
  'studio',
  'portfolio',
  'fashion',
  'minimal',
  'layout',
  'food',
  'culture',
  'color',
] as const
export type Category = (typeof CATEGORIES)[number]
export type EyecatchKey = Category | `generic-${PostType}`

export const EYECATCH_KEYS: readonly EyecatchKey[] = [
  ...CATEGORIES,
  'generic-tip',
  'generic-clip',
  'generic-lab',
]

// OGP のカテゴリ名にだけ使う
export const LABELS: Record<EyecatchKey, string> = {
  javascript: 'JavaScript',
  css: 'CSS',
  sass: 'Sass',
  html: 'HTML',
  vue: 'Vue',
  typescript: 'TypeScript',
  wordpress: 'WordPress',
  tooling: 'Front-end Tools',
  canvas: 'Creative Coding',
  webgl: 'WebGL',
  animation: 'Animation',
  scroll: 'Scroll',
  studio: 'Studio',
  portfolio: 'Portfolio',
  fashion: 'Fashion',
  minimal: 'Minimal',
  layout: 'Layout',
  food: 'Food',
  culture: 'Culture',
  color: 'Color',
  'generic-tip': 'Tip',
  'generic-clip': 'Clip',
  'generic-lab': 'Lab',
}

// 関連記事の比較キーにも使うので、明らかな綴りの誤りだけを入れる。
// sport と sports、photo と photograph のような別の語はここでまとめない
export const TYPOS: Readonly<Record<string, string>> = {
  aniamtion: 'animation',
  portpolio: 'portfolio',
  typograph: 'typography',
  edudation: 'education',
  holizon: 'horizon',
  spase: 'space',
  faniture: 'furniture',
}

// キーは primaryTagKey を通した値
const ALIASES: Readonly<Record<string, Category>> = {
  // tip / lab の技術
  javascript: 'javascript',
  js: 'javascript',
  es6: 'javascript',
  jquery: 'javascript',
  'plug-in': 'javascript',
  math: 'javascript',
  mouse: 'javascript',
  sp: 'javascript',
  mobile: 'javascript',
  regexp: 'javascript',
  lightbox: 'javascript',
  interactive: 'javascript',
  css: 'css',
  flex: 'css',
  font: 'css',
  background: 'css',
  bug: 'css',
  performance: 'css',
  table: 'css',
  sass: 'sass',
  scss: 'sass',
  mixin: 'sass',
  html5: 'html',
  html: 'html',
  viewport: 'html',
  favicon: 'html',
  seo: 'html',
  'vue.js': 'vue',
  vue: 'vue',
  nuxt: 'vue',
  vuex: 'vue',
  typescript: 'typescript',
  ts: 'typescript',
  wordpress: 'wordpress',
  admin: 'wordpress',
  speed: 'wordpress',
  tool: 'tooling',
  frontend: 'tooling',
  'front-end': 'tooling',
  git: 'tooling',
  github: 'tooling',
  gulp: 'tooling',
  mac: 'tooling',
  terminal: 'tooling',
  docker: 'tooling',
  webstorm: 'tooling',
  ejs: 'tooling',
  brackets: 'tooling',
  slack: 'tooling',
  server: 'tooling',
  api: 'tooling',
  android: 'tooling',
  photoshop: 'tooling',
  createjs: 'canvas',
  'processing.js': 'canvas',
  'processing-js': 'canvas',
  canvas: 'canvas',
  noise: 'canvas',
  geometry: 'canvas',
  geometric: 'canvas',
  webgl: 'webgl',
  threejs: 'webgl',
  glsl: 'webgl',
  vr: 'webgl',
  '360°': 'webgl',
  animation: 'animation',
  hover: 'animation',
  effect: 'animation',
  interaction: 'animation',
  loading: 'animation',
  slider: 'animation',
  tweenmax: 'animation',
  scroll: 'scroll',
  parallax: 'scroll',
  fullscreen: 'scroll',
  horizon: 'scroll',
  // clip のジャンル
  studio: 'studio',
  creative: 'studio',
  design: 'studio',
  logo: 'studio',
  branding: 'studio',
  architecture: 'studio',
  portfolio: 'portfolio',
  gallery: 'portfolio',
  photograph: 'portfolio',
  photo: 'portfolio',
  illustration: 'portfolio',
  illust: 'portfolio',
  fashion: 'fashion',
  beauty: 'fashion',
  luxury: 'fashion',
  women: 'fashion',
  woman: 'fashion',
  kawaii: 'fashion',
  minimal: 'minimal',
  flat: 'minimal',
  white: 'minimal',
  soft: 'minimal',
  line: 'minimal',
  grid: 'layout',
  layout: 'layout',
  typography: 'layout',
  magazine: 'layout',
  media: 'layout',
  blog: 'layout',
  navigation: 'layout',
  ui: 'layout',
  food: 'food',
  drink: 'food',
  agriculture: 'food',
  event: 'culture',
  music: 'culture',
  art: 'culture',
  movie: 'culture',
  museum: 'culture',
  culture: 'culture',
  audio: 'culture',
  video: 'culture',
  game: 'culture',
  play: 'culture',
  sports: 'culture',
  sport: 'culture',
  leisure: 'culture',
  trip: 'culture',
  education: 'culture',
  school: 'culture',
  child: 'culture',
  japan: 'culture',
  local: 'culture',
  red: 'color',
  yellow: 'color',
  green: 'color',
  blue: 'color',
  pink: 'color',
  purple: 'color',
  orange: 'color',
  gold: 'color',
  grey: 'color',
  colorful: 'color',
  vivid: 'color',
  color: 'color',
  gradation: 'color',
  dark: 'color',
}

// 同じ値でも type で意味が変わるもの（tip の event は JS のイベント、clip の event は催し物のサイト）
const TYPE_ALIASES: Readonly<
  Partial<Record<PostType, Readonly<Record<string, Category>>>>
> = {
  tip: {
    event: 'javascript',
    grid: 'css',
    svg: 'css',
    navigation: 'css',
    form: 'javascript',
    responsive: 'html',
  },
  lab: {
    video: 'animation',
    ui: 'javascript',
    form: 'javascript',
    responsive: 'html',
  },
  clip: { responsive: 'layout' },
}

// 関連記事用の比較キー。trim + 小文字 + 打ち間違いの修正だけで、カテゴリにはまとめない
export function primaryTagKey(raw: string | null | undefined): string {
  const k = (raw ?? '').trim().toLowerCase()
  return TYPOS[k] ?? k
}

function lookup(type: PostType, key: string): Category | undefined {
  return TYPE_ALIASES[type]?.[key] ?? ALIASES[key]
}

// アイキャッチ用のカテゴリ
export function normalizePrimaryTag(
  raw: string | null | undefined,
  termSlugs: readonly string[],
  type: PostType,
): EyecatchKey {
  const hit = lookup(type, primaryTagKey(raw))
  if (hit) return hit
  // clip のタームは見た目の特徴（responsive、white など）でジャンルを表さないので使わない
  if (type === 'clip') return 'generic-clip'
  for (const slug of termSlugs) {
    const t = lookup(type, slug)
    if (t) return t
  }
  return `generic-${type}`
}
