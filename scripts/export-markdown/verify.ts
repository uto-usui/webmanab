// 往復検証。書き出した Markdown をサイトと同じ設定の Sätteri で HTML に戻し、旧サイトの本文と比べる。
// frontmatter とターム一覧も、旧データから作り直した値と照合する。
// node scripts/export-markdown/verify.ts [--snapshot <dir>] [--root <dir>] [--from-html [--no-fixes]] [--json <file>]
import fs from 'node:fs'
import path from 'node:path'
import { parseArgs } from 'node:util'
import { decodeHTML } from 'entities'
import { parse as parseYaml } from 'yaml'
import { htmlToMarkdown } from './convert.ts'
import {
  collectNavTitles,
  fileName,
  frontmatter,
  TAXONOMY,
  wpRaw,
  type Frontmatter,
} from './frontmatter.ts'
import { postsDir, repoRoot, snapshotHtmlDir, termsDir } from './paths.ts'
import {
  compare,
  intendedKinds,
  metrics,
  parseHtml,
  renderMarkdown,
  unexplained,
} from './roundtrip.ts'
import { loadSnapshot, postPath, type SnapshotPost } from './snapshot.ts'
import { buildTerms } from './terms.ts'
import { collapseWhitespace, isBlank, trimWhitespace } from './whitespace.ts'

const { values: args } = parseArgs({
  options: {
    snapshot: { type: 'string' },
    // 書き出し先（export.ts の --out と同じもの）
    root: { type: 'string' },
    // ファイルを読まずにその場で変換して比べる。--no-fixes と組み合わせて、手当てを止めた対照実験に使う
    'from-html': { type: 'boolean', default: false },
    'no-fixes': { type: 'boolean', default: false },
    json: { type: 'string' },
  },
})

const root = path.resolve(args.root ?? repoRoot)
const htmlDir = snapshotHtmlDir(args.snapshot)
const posts = loadSnapshot(htmlDir)
const knownPaths = new Set(posts.map(postPath))
const navTitles = collectNavTitles(posts)
const fromFiles = !args['from-html']
const key = (p: SnapshotPost) => `${p.type}/${decodeURIComponent(p.slug)}`

function readPost(p: SnapshotPost): { fm: Frontmatter; md: string } {
  const src = fs.readFileSync(
    path.join(postsDir(root), p.type, `${fileName(p)}.md`),
    'utf8',
  )
  const m = src.match(/^---\n([\s\S]*?)\n---\n\n?([\s\S]*)$/)
  if (!m) throw new Error(`frontmatter が読めません: ${key(p)}`)
  return { fm: parseYaml(m[1]), md: m[2] }
}

const display = (html: string) =>
  trimWhitespace(collapseWhitespace(decodeHTML(html)))
const pageHtml = (type: string, slug: string) => {
  const file = path.join(htmlDir, type, slug, 'index.html')
  return fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : null
}

// 旧サイトの記事ページで h1 に表示されていたタイトル（ブラウザと同じく HTML の空白だけ詰める）
function legacyTitle(p: SnapshotPost): string | null {
  const m = pageHtml(p.type, decodeURIComponent(p.slug))?.match(
    /<h1 class="entry-head__title"[^>]*>([^<]*)<\/h1>/,
  )
  return m ? display(m[1]) : null
}

// 旧サイトの前後記事ナビに表示されていたタイトル。リンク先のパスごとに集める
const legacyNavTitles = new Map<string, Set<string>>()
for (const p of posts) {
  if (p.source !== 'single') continue
  const html = pageHtml(p.type, decodeURIComponent(p.slug)) ?? ''
  const navs = html.matchAll(
    /<a href="([^"]+)" class="entry-nav__target"[^>]*>[\s\S]*?<h3 class="entry-nav__title"[^>]*>([^<]*)<\/h3>/g,
  )
  for (const [, href, title] of navs) {
    const k = decodeURIComponent(href)
    if (!legacyNavTitles.has(k)) legacyNavTitles.set(k, new Set())
    legacyNavTitles.get(k)!.add(display(title))
  }
}

// 文字・数字・HTML の空白以外の文字（引用符、ダッシュ、記号、U+3000 や U+202F などの空白類）。
// 旧データ（実体参照のまま）から frontmatter() と別の道筋で取り出し、数と種類が変わっていないかを見る
const SYMBOL = /[^\p{L}\p{N} \t\n\f\r]/gu
const symbols = (values: unknown[], decode: boolean) =>
  values
    .map((v) => String(v ?? ''))
    .flatMap((v) => [...(decode ? decodeHTML(v) : v).matchAll(SYMBOL)])
    .map((m) => m[0])
    .sort()
    .join('')

// 日付は YAML のタイムスタンプとして読まれるので、瞬間で比べる
const instant = (v: unknown) =>
  v instanceof Date ? v.getTime() : Date.parse(String(v))
function checkFrontmatter(p: SnapshotPost, fm: Frontmatter): string[] {
  const fails: string[] = []
  const exp = frontmatter(p, navTitles)
  const raw = wpRaw(p)
  if (instant(fm.date) !== Date.parse(exp.date)) fails.push('date')
  // 独立した照合として、WP の date_gmt / modified_gmt と同じ瞬間かも確かめる
  if (raw.date_gmt && instant(fm.date) !== Date.parse(`${raw.date_gmt}Z`))
    fails.push('date_gmt')
  if (
    raw.modified_gmt &&
    instant(fm.modified) !== Date.parse(`${raw.modified_gmt}Z`)
  )
    fails.push('modified_gmt')
  for (const k of new Set([...Object.keys(exp), ...Object.keys(fm)]) as Set<
    keyof Frontmatter
  >) {
    if (k === 'date' || k === 'modified') {
      if (k in exp !== k in fm) fails.push(k)
    } else if (JSON.stringify(fm[k]) !== JSON.stringify(exp[k])) fails.push(k)
  }
  // 上の照合は同じ frontmatter() との比較なので、旧データからの独立した照合も足す
  const title = legacyTitle(p)
  if (title !== null && fm.title !== title) fails.push('title-h1')
  const nav = legacyNavTitles.get(postPath(p))
  if (nav && [...nav].some((t) => t !== (fm.navTitle ?? fm.title)))
    fails.push('nav-title')
  const rawTerms = p.terms?.[TAXONOMY[p.type]]
  const pairs: [unknown[], unknown[]][] = [
    [[p.title], [fm.title]],
    [
      [
        String(p.excerpt ?? '')
          .replace(/<[^>]*>/g, '')
          .replace(/\.\.more\s*$/, ''),
      ],
      [fm.excerpt],
    ],
    [[p.fields?.['primary-tag']], [fm.primaryTag]],
    [
      Array.isArray(rawTerms) ? rawTerms.map((t) => t.name) : [],
      fm.terms.map((t) => t.name),
    ],
  ]
  for (const [a, b] of pairs) {
    if (symbols(a, true) !== symbols(b, false)) {
      fails.push('symbols')
      break
    }
  }
  return fails
}

const t0 = Date.now()
const results = []
const fmFails: string[] = []
let codeTotal = 0
let codeExact = 0
const codeNg: string[] = []
for (const p of posts) {
  const html = p.content ?? ''
  const { md: converted, notes } = htmlToMarkdown(html, {
    knownPaths,
    fixes: !args['no-fixes'],
  })
  let md = converted
  if (fromFiles) {
    const file = readPost(p)
    md = file.md
    const f = checkFrontmatter(p, file.fm)
    if (f.length) fmFails.push(`${key(p)} ${f.join(',')}`)
  }
  if (isBlank(html)) {
    // 本文のない記事は、Markdown 側も本文がないことだけ確かめる
    if (!isBlank(md))
      results.push({
        key: key(p),
        empty: true,
        fails: ['not-empty'],
        unexplained: ['not-empty'],
        notes,
      })
    else
      results.push({
        key: key(p),
        empty: true,
        fails: [],
        unexplained: [],
        notes,
      })
    continue
  }
  const a = metrics(parseHtml(html), 'original')
  const b = metrics(renderMarkdown(md), 'rendered')
  const fails = compare(a, b)
  a.codeBlocks.forEach((c, i) => {
    codeTotal++
    const d = b.codeBlocks[i]
    if (d && d.lang === c.lang && d.value === c.value) codeExact++
    else codeNg.push(`${key(p)}#${i}`)
  })
  results.push({
    key: key(p),
    empty: false,
    fails,
    unexplained: unexplained(fails, notes),
    notes,
  })
}

// 書き出し先に、旧データにない記事ファイルが混ざっていないか
const strayFiles: string[] = []
if (fromFiles) {
  const expected = new Set(
    posts.map((p) => path.join(p.type, `${fileName(p)}.md`)),
  )
  for (const type of fs.readdirSync(postsDir(root))) {
    for (const f of fs.readdirSync(path.join(postsDir(root), type))) {
      if (!expected.has(path.join(type, f))) strayFiles.push(path.join(type, f))
    }
  }
}

// ターム一覧は、記事の frontmatter から作り直した値と比べる
const termFails: string[] = []
if (fromFiles) {
  for (const [tax, list] of Object.entries(
    buildTerms(posts.map((p) => frontmatter(p, navTitles))),
  )) {
    const file = JSON.parse(
      fs.readFileSync(path.join(termsDir(root), `${tax}.json`), 'utf8'),
    )
    if (JSON.stringify(file) !== JSON.stringify(list)) termFails.push(tax)
  }
}

const withBody = results.filter((r) => !r.empty)
const failed = withBody.filter((r) => r.fails.length)
const intendedOnly = failed.filter((r) => !r.unexplained.length)
const bad = results.filter((r) => r.unexplained.length)
const byCheck: Record<string, number> = {}
for (const r of results)
  for (const f of r.fails) byCheck[f] = (byCheck[f] ?? 0) + 1

console.log(
  `source: ${fromFiles ? path.relative(process.cwd(), postsDir(root)) || '.' : 'in-memory conversion'}${args['no-fixes'] ? ' (no fixes)' : ''}`,
)
console.log(`posts ${results.length}, with body ${withBody.length}`)
console.log(`  exact match ${withBody.length - failed.length}`)
console.log(`  intended differences only ${intendedOnly.length}`)
console.log(`  unexplained ${bad.length}`)
console.log(`failed checks ${JSON.stringify(byCheck)}`)
console.log(
  `code blocks ${codeTotal}, class and textContent exact ${codeExact}`,
)
if (codeNg.length) console.log(`  differ: ${codeNg.join(' ')}`)
for (const r of intendedOnly)
  console.log(`intended: ${r.key} [${intendedKinds(r.notes).join(', ')}]`)
for (const r of bad)
  console.log(`UNEXPLAINED: ${r.key} ${r.unexplained.join(',')}`)
if (fromFiles) {
  console.log(
    `frontmatter mismatches ${fmFails.length} (old nav titles for ${legacyNavTitles.size} posts)`,
  )
  for (const f of fmFails) console.log(`  ${f}`)
  console.log(
    `stray files ${strayFiles.length}${strayFiles.length ? `: ${strayFiles.join(' ')}` : ''}`,
  )
  console.log(
    `term lists mismatched ${termFails.length}${termFails.length ? `: ${termFails.join(' ')}` : ''}`,
  )
}
console.log(`${Date.now() - t0}ms`)

if (args.json)
  fs.writeFileSync(args.json, `${JSON.stringify(results, null, 1)}\n`)
if (bad.length || fmFails.length || strayFiles.length || termFails.length)
  process.exitCode = 1
