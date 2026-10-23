// 旧サイトの生成済み HTML（.snapshot/html）から、window.__NUXT__ に入っている記事を集める
import fs from 'node:fs'
import path from 'node:path'
import vm from 'node:vm'

export type PostType = 'tip' | 'clip' | 'lab'

export interface WpTerm {
  term_id: number
  name: string
  slug: string
}

export interface WpPost {
  id: number
  type: PostType
  slug: string
  title: string
  content: string
  excerpt: string
  date: string
  prev?: unknown
  next?: unknown
  // 旧実装の変換の不具合で、単一ページでは images.alt に WP REST API の生の記事がそのまま入っている
  images?: { alt?: unknown }
  terms?: Record<string, WpTerm[] | false | undefined>
  fields?: Record<string, unknown>
}

export interface SnapshotPost extends WpPost {
  // single: 記事ページの state、list: 一覧ページの state（記事ページがない 2 件だけ）
  source: 'single' | 'list'
}

interface NuxtState {
  state: Record<string, { cachePosts?: Record<string, WpPost | null> }>
}

const STORES = ['tip', 'clip', 'lab', 'tax']

function* walk(dir: string): Generator<string> {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) yield* walk(p)
    else if (e.name === 'index.html') yield p
  }
}

export function readNuxtState(html: string): NuxtState | null {
  const m = html.match(/<script>window\.__NUXT__=([\s\S]*?)<\/script>/)
  if (!m) return null
  const ctx: { window: { __NUXT__?: NuxtState } } = { window: {} }
  vm.createContext(ctx)
  vm.runInContext(`window.__NUXT__=${m[1]}`, ctx, { timeout: 5000 })
  return ctx.window.__NUXT__ ?? null
}

// 記事ページの値を正とし、記事ページがない記事だけ一覧ページの値を使う。
// 両方にある 590 件で全項目が一致することを確かめてある
export function loadSnapshot(htmlDir: string): SnapshotPost[] {
  const single = new Map<string, WpPost>()
  const listed = new Map<string, WpPost>()
  for (const file of walk(htmlDir)) {
    const nuxt = readNuxtState(fs.readFileSync(file, 'utf8'))
    if (!nuxt) continue
    const page = path
      .relative(htmlDir, path.dirname(file))
      .split(path.sep)
      .join('/')
    for (const store of STORES) {
      for (const p of Object.values(nuxt.state[store]?.cachePosts ?? {})) {
        if (!p?.slug) continue
        const key = `${p.type}/${p.slug}`
        if (page === key || page === `${p.type}/${decodeURIComponent(p.slug)}`)
          single.set(key, p)
        else if (!listed.has(key)) listed.set(key, p)
      }
    }
  }
  const keys = [...new Set([...single.keys(), ...listed.keys()])].sort()
  return keys.map((k) => {
    const s = single.get(k)
    // vm のコンテキストで作られたオブジェクトなので、structuredClone でこちらの realm に移す
    return s
      ? { ...structuredClone(s), source: 'single' }
      : { ...structuredClone(listed.get(k)!), source: 'list' }
  })
}

export const postPath = (p: Pick<WpPost, 'type' | 'slug'>) =>
  `/${p.type}/${decodeURIComponent(p.slug)}/`
