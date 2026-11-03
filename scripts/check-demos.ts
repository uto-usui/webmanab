// 記事が埋め込むデモと labobal.dev のデモの一覧（demos.json）を突き合わせ、食い違いを一覧にする。
// jsfiddle から labobal.dev への差し替えの漏れを見つけるため。check-links.ts と同じく一覧を出すだけで、
// 記事は直さない。合否はないので、調べ終われば終了コードは 0
// 使い方: node scripts/check-demos.ts [--dir src/content/posts] [--demos https://labobal.dev/demos.json]
import { appendFileSync, globSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { parseArgs } from 'node:util'
import { parse as parseYaml } from 'yaml'
import { extractLinks } from './check-links.ts'

const LABOBAL = 'https://labobal.dev'

/** demos.json の 1 件（laboobal-dev の src/lib/demos.ts の DemoMeta）のうち、ここで使うもの */
export interface Demo {
  slug: string
  title: string
  /** lab の記事の URL。記事が出るまでは無い */
  article?: string
  /** もとのデモの場所。jsfiddle から移したものは fiddle の URL */
  origin: string
}

export interface Post {
  /** `lab/<slug>` */
  path: string
  /** frontmatter の demoUrl */
  demoUrl?: string
  /** 本文の iframe の src */
  iframes: string[]
  /** 本文のリンク（iframe を除く） */
  links: string[]
}

/**
 * 同じデモかどうかを比べるための鍵。jsfiddle は `/embedded/…` や版の番号を除いた `<user>/<id>`、
 * labobal.dev は slug。どちらでもなければ undefined
 */
export function demoKey(url: string): string | undefined {
  let u: URL
  try {
    u = new URL(url)
  } catch {
    return undefined
  }
  const parts = u.pathname.split('/').filter(Boolean)
  if (u.hostname.replace(/^www\./, '') === 'jsfiddle.net') {
    // /<user>/<id>/[<版>/]embedded/… の先頭 2 つ。ユーザー名のない古い形（/<id>/）もある
    return parts.length >= 2 && parts[1] !== 'embedded'
      ? `jsfiddle:${parts[0]}/${parts[1]}`
      : parts[0] && `jsfiddle:${parts[0]}`
  }
  if (u.origin === LABOBAL && parts.length === 1) return `labobal:${parts[0]}`
  return undefined
}

const isJsfiddle = (url: string) => demoKey(url)?.startsWith('jsfiddle:')
const labobalSlug = (url: string) => demoKey(url)?.match(/^labobal:(.+)$/)?.[1]

export function readPost(markdown: string): Post {
  const fm = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)
  const data = fm ? (parseYaml(fm[1]) ?? {}) : {}
  const found = extractLinks(markdown)
  return {
    path: `${data.type}/${data.slug}`,
    demoUrl: found.find((f) => f.field === 'demoUrl')?.url,
    iframes: found.filter((f) => f.field === 'iframe').map((f) => f.url),
    links: found.filter((f) => f.field === 'link').map((f) => f.url),
  }
}

/** `https://webmanab.com/lab/<slug>/` → `lab/<slug>`。ドメインは見ない（SITE_URL を替えても同じに扱う） */
const articlePath = (article: string) =>
  decodeURIComponent(new URL(article).pathname).replace(/^\/|\/$/g, '')

export interface Report {
  /** (a) demos.json の article がこの記事を指しているのに、記事がまだ jsfiddle を埋め込んでいる */
  stillJsfiddle: {
    demo: string
    post: string
    jsfiddle: string[]
    /** 本文にそのデモの iframe がもうあるか */
    hasLabobal: boolean
  }[]
  /** demos.json の article が指す記事が見つからない */
  missingArticle: { demo: string; article: string }[]
  /** (b) demoUrl と本文の iframe が別のデモを指している */
  mismatched: { post: string; demoUrl: string; iframes: string[] }[]
  /** (c) 記事が指す labobal.dev の slug が demos.json にない */
  unknownSlug: { post: string; slug: string }[]
  /** (d) jsfiddle の残り */
  jsfiddle: { posts: number; iframes: number; demoUrls: number }
  /** labobal.dev を埋め込んでいる記事の数 */
  labobalPosts: number
}

export function compare(posts: Post[], demos: Demo[]): Report {
  const byPath = new Map(posts.map((p) => [p.path, p]))
  const slugs = new Set(demos.map((d) => d.slug))
  const report: Report = {
    stillJsfiddle: [],
    missingArticle: [],
    mismatched: [],
    unknownSlug: [],
    jsfiddle: { posts: 0, iframes: 0, demoUrls: 0 },
    labobalPosts: 0,
  }

  for (const demo of demos) {
    if (!demo.article) continue
    const post = byPath.get(articlePath(demo.article))
    if (!post) {
      report.missingArticle.push({ demo: demo.slug, article: demo.article })
      continue
    }
    const jsfiddle = post.iframes.filter(isJsfiddle)
    if (jsfiddle.length === 0) continue
    report.stillJsfiddle.push({
      demo: demo.slug,
      post: post.path,
      jsfiddle,
      hasLabobal: post.iframes.some((u) => labobalSlug(u) === demo.slug),
    })
  }

  for (const post of posts) {
    const iframeKeys = post.iframes.map(demoKey).filter(Boolean)
    const demoUrlKey = post.demoUrl && demoKey(post.demoUrl)
    // 本文にデモの iframe があるのに、demoUrl がそのどれとも違う
    if (demoUrlKey && iframeKeys.length > 0 && !iframeKeys.includes(demoUrlKey))
      report.mismatched.push({
        post: post.path,
        demoUrl: post.demoUrl!,
        iframes: post.iframes.filter((u) => demoKey(u)),
      })

    const referenced = new Set(
      [post.demoUrl, ...post.iframes, ...post.links]
        .filter((u): u is string => !!u)
        .map(labobalSlug)
        .filter((s): s is string => !!s),
    )
    for (const slug of referenced) {
      if (!slugs.has(slug)) report.unknownSlug.push({ post: post.path, slug })
    }

    const fiddles = post.iframes.filter(isJsfiddle).length
    const fiddleDemoUrl = post.demoUrl && isJsfiddle(post.demoUrl) ? 1 : 0
    if (fiddles + fiddleDemoUrl > 0) report.jsfiddle.posts += 1
    report.jsfiddle.iframes += fiddles
    report.jsfiddle.demoUrls += fiddleDemoUrl
    if (post.iframes.some(labobalSlug)) report.labobalPosts += 1
  }
  return report
}

export function summary(r: Report): string {
  const found =
    r.stillJsfiddle.length +
    r.missingArticle.length +
    r.mismatched.length +
    r.unknownSlug.length
  return `デモの食い違い ${found} 件。jsfiddle の残りは記事 ${r.jsfiddle.posts} 本（iframe ${r.jsfiddle.iframes}、demoUrl ${r.jsfiddle.demoUrls}）、labobal.dev を埋め込む記事は ${r.labobalPosts} 本`
}

export function toMarkdown(r: Report): string {
  const lines = ['## 記事と labobal.dev のデモ', '', summary(r), '']
  const table = (title: string, head: string[], rows: string[][]) => {
    if (rows.length === 0) return
    lines.push(`### ${title}: ${rows.length} 件`, '')
    lines.push(
      `| ${head.join(' | ')} |`,
      `| ${head.map(() => '---').join(' | ')} |`,
    )
    for (const row of rows) lines.push(`| ${row.join(' | ')} |`)
    lines.push('')
  }
  table(
    'labobal.dev にデモがあるのに、記事がまだ jsfiddle を埋め込んでいる',
    ['デモ', '記事', 'jsfiddle', 'labobal.dev の iframe'],
    r.stillJsfiddle.map((x) => [
      x.demo,
      x.post,
      x.jsfiddle.join('<br>'),
      x.hasLabobal ? 'ある' : 'ない',
    ]),
  )
  table(
    'demos.json の article が指す記事がない',
    ['デモ', 'article'],
    r.missingArticle.map((x) => [x.demo, x.article]),
  )
  table(
    'demoUrl と本文の iframe が別のデモを指している',
    ['記事', 'demoUrl', '本文の iframe'],
    r.mismatched.map((x) => [x.post, x.demoUrl, x.iframes.join('<br>')]),
  )
  table(
    '記事が指す labobal.dev の slug が demos.json にない',
    ['記事', 'slug'],
    r.unknownSlug.map((x) => [x.post, x.slug]),
  )
  return lines.join('\n')
}

async function loadDemos(source: string): Promise<Demo[]> {
  if (!/^https?:\/\//.test(source))
    return JSON.parse(readFileSync(source, 'utf8'))
  const res = await fetch(source, { signal: AbortSignal.timeout(20_000) })
  if (!res.ok) throw new Error(`${source} が ${res.status}`)
  return res.json()
}

async function main() {
  const { values } = parseArgs({
    options: {
      dir: { type: 'string', default: 'src/content/posts' },
      demos: { type: 'string', default: `${LABOBAL}/demos.json` },
    },
  })
  const posts = globSync('**/*.md', { cwd: values.dir })
    .sort()
    .map((file) => readPost(readFileSync(join(values.dir, file), 'utf8')))
  const demos = await loadDemos(values.demos)
  const md = toMarkdown(compare(posts, demos))
  console.log(md)
  if (process.env.GITHUB_STEP_SUMMARY)
    appendFileSync(process.env.GITHUB_STEP_SUMMARY, `\n${md}\n`)
}

if (import.meta.main) await main()
