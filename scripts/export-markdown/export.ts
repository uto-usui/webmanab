// 旧サイトの HTML から src/content/posts/*.md と src/content/terms/*.json を書き出す。
// node scripts/export-markdown/export.ts [--snapshot <dir>] [--out <dir>] [--force]
import fs from 'node:fs'
import path from 'node:path'
import { parseArgs } from 'node:util'
import { htmlToMarkdown, type Note } from './convert.ts'
import {
  collectNavTitles,
  fileName,
  frontmatter,
  postFile,
  type Frontmatter,
} from './frontmatter.ts'
import {
  postsDir,
  repoRoot,
  reportFile,
  snapshotHtmlDir,
  termsDir,
} from './paths.ts'
import { loadSnapshot, postPath } from './snapshot.ts'
import { buildTerms } from './terms.ts'
import { isBlank } from './whitespace.ts'

const { values: args } = parseArgs({
  options: {
    snapshot: { type: 'string' },
    // 手直し済みのファイルと新しい変換結果を見比べるときに、別の場所へ書き出す
    out: { type: 'string' },
    force: { type: 'boolean', default: false },
  },
})

const out = path.resolve(args.out ?? repoRoot)
const posts = loadSnapshot(snapshotHtmlDir(args.snapshot))
const knownPaths = new Set(posts.map(postPath))
const navTitles = collectNavTitles(posts)

let written = 0
let skipped = 0
// 書き出したあとは Markdown が正なので、既にあるファイルは --force のときだけ上書きする
function write(file: string, content: string) {
  fs.mkdirSync(path.dirname(file), { recursive: true })
  if (fs.existsSync(file) && !args.force) {
    skipped++
    return
  }
  fs.writeFileSync(file, content)
  written++
}

const fms: Frontmatter[] = []
const files = new Set<string>()
const report: { key: string; file: string; notes: Note[] }[] = []
for (const p of posts) {
  const fm = frontmatter(p, navTitles)
  const { md, notes } = htmlToMarkdown(p.content ?? '', { knownPaths })
  const file = path.join(postsDir(out), p.type, `${fileName(p)}.md`)
  if (files.has(file)) throw new Error(`ファイル名が重複しています: ${file}`)
  files.add(file)
  write(file, postFile(fm, md))
  fms.push(fm)
  if (notes.length)
    report.push({
      key: `${p.type}/${fm.slug}`,
      file: path.relative(out, file),
      notes,
    })
}

for (const [tax, list] of Object.entries(buildTerms(fms))) {
  write(
    path.join(termsDir(out), `${tax}.json`),
    `${JSON.stringify(list, null, 2)}\n`,
  )
}

// 落とした画像の alt、落とした target、意図して直したものなどの記録。PR で見られるようにコミットする
const counts: Record<string, number> = {}
for (const r of report)
  for (const n of r.notes) counts[n.kind] = (counts[n.kind] ?? 0) + 1
const summary = {
  posts: posts.length,
  withoutBody: posts.filter((p) => isBlank(p.content ?? '')).length,
  fromListPage: posts
    .filter((p) => p.source === 'list')
    .map((p) => `${p.type}/${decodeURIComponent(p.slug)}`),
  notes: Object.fromEntries(Object.entries(counts).sort()),
}
fs.mkdirSync(path.dirname(reportFile(out)), { recursive: true })
fs.writeFileSync(
  reportFile(out),
  `${JSON.stringify({ summary, posts: report }, null, 2)}\n`,
)

console.log(
  `posts ${posts.length}, written ${written}, skipped (exists) ${skipped}`,
)
console.log(`report ${path.relative(process.cwd(), reportFile(out))}`)
