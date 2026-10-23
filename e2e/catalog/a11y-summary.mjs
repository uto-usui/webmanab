// stories.spec.ts が story × 幅ごとに書いた axe の結果を 2 つにまとめる（07 の 10.2）。
// a11y-report.json は scripts/a11y-compare.ts が読む形（08 の 2.7）、a11y-report.md は人が読む一覧。
// playwright.catalog.config.ts の globalTeardown で走る。node e2e/catalog/a11y-summary.mjs でも走らせられる
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const root = new URL('../../', import.meta.url)
const resultDir = new URL('test-results/catalog/a11y/', root)

export default function summarize() {
  if (!existsSync(resultDir)) return
  const results = readdirSync(resultDir)
    .filter((f) => f.endsWith('.json'))
    .map((f) => JSON.parse(readFileSync(new URL(f, resultDir), 'utf8')))
    .sort((a, b) => a.story.localeCompare(b.story) || a.width - b.width)
  if (!results.length) return

  const ids = JSON.parse(
    readFileSync(new URL('a11y-ids.json', import.meta.url), 'utf8'),
  )
  const axeCore = results[0].axeCore
  const pages = {}
  const details = {}
  // 「部品/ルール」ごとに 1 行にまとめる
  const rows = new Map()
  for (const r of results) {
    const key = `${r.story}@${r.width}`
    pages[key] = Object.fromEntries(
      r.violations.map((v) => [v.id, v.targets.length]),
    )
    details[key] = r.violations
    const component = r.story.split('/')[0]
    for (const v of r.violations) {
      const id = `${component}/${v.id}`
      const row = rows.get(id) ?? {
        component,
        rule: v.id,
        impact: v.impact,
        tags: v.tags,
        stories: new Set(),
        widths: new Set(),
        targets: new Set(),
      }
      row.stories.add(r.story)
      row.widths.add(r.width)
      v.targets.forEach((t) => row.targets.add(t))
      rows.set(id, row)
    }
  }

  writeFileSync(
    new URL('a11y-report.json', root),
    `${JSON.stringify({ axeCore, pages, details }, null, 2)}\n`,
  )

  const list = (set, sep) => [...set].join(sep)
  const md = [
    '## a11y: 部品のカタログ',
    '',
    `検査した story × 幅: ${results.length}（axe-core ${axeCore}）。違反があってもテストは落ちない。`,
    '',
  ]
  if (rows.size === 0) md.push('違反なし')
  else
    md.push(
      '| 部品 | ルール | 影響 | WCAG | 08 の ID | story | 幅 | 要素 |',
      '| --- | --- | --- | --- | --- | --- | --- | --- |',
      ...[...rows.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(
          ([id, r]) =>
            `| ${r.component} | ${r.rule} | ${r.impact} | ${r.tags.join(' ')} | ${ids[id] ?? '未登録'} | ${list(r.stories, '<br>')} | ${list(r.widths, ' ')} | \`${list(r.targets, '`<br>`')}\` |`,
        ),
    )
  writeFileSync(new URL('a11y-report.md', root), `${md.join('\n')}\n`)
}

if (process.argv[1] === fileURLToPath(import.meta.url)) summarize()
