// 往復検証。書き出した Markdown をサイトと同じ設定の Sätteri で HTML に戻し、旧サイトの本文と比べる。
// frontmatter とターム一覧も、旧データから作り直した値と照合する。
// node scripts/export-markdown/verify.ts [--snapshot <dir>] [--root <dir>] [--from-html [--no-fixes]] [--json <file>]
import fs from 'node:fs'
import path from 'node:path'
import { parseArgs } from 'node:util'
import { parse as parseYaml } from 'yaml'
import { htmlToMarkdown } from './convert.ts'
import {
  fileName,
  frontmatter,
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
const posts = loadSnapshot(snapshotHtmlDir(args.snapshot))
const knownPaths = new Set(posts.map(postPath))
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

// 日付は YAML のタイムスタンプとして読まれるので、瞬間で比べる
const instant = (v: unknown) =>
  v instanceof Date ? v.getTime() : Date.parse(String(v))
function checkFrontmatter(p: SnapshotPost, fm: Frontmatter): string[] {
  const fails: string[] = []
  const exp = frontmatter(p)
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
  if (!html.trim()) {
    // 本文のない記事は、Markdown 側も本文がないことだけ確かめる
    if (md.trim())
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
    buildTerms(posts.map(frontmatter)),
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
  console.log(`frontmatter mismatches ${fmFails.length}`)
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
