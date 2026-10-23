// axe の結果を基準の件数と比べる（08 の 2.6、07 の 10.3）。マージは止めないので終了コードは常に 0。
// 使い方: node scripts/a11y-compare.ts [--baseline test/a11y/baseline.json] [--report test-results/e2e/a11y-report.json]
import { appendFileSync, existsSync, readFileSync } from 'node:fs'
import { parseArgs } from 'node:util'

type Counts = Record<string, Record<string, number>>

export interface A11yFile {
  axeCore?: string
  /** "ページのキー@幅" → ルール → 要素の数 */
  pages: Counts
  /** 指標の名前 → ページのキー（基準）か "ページのキー@幅"（結果）→ 値 */
  metrics?: Counts
}

export interface Row {
  page: string
  item: string
  base: number | null
  now: number | null
}

export interface Finding {
  level: 'warning' | 'notice'
  message: string
}

// 指標の悪さ。大きくなったら警告にする。h1 は 1 つがよく、0 も 2 も悪い
const badness: Record<string, (v: number) => number> = {
  h1: (v) => Math.abs(v - 1),
  focusRules: (v) => -v,
  reducedMotionRules: (v) => -v,
}

export function compare(
  baseline: A11yFile,
  report: A11yFile,
): { rows: Row[]; findings: Finding[] } {
  const rows: Row[] = []
  const findings: Finding[] = []
  const warn = (message: string) => findings.push({ level: 'warning', message })
  const notice = (message: string) =>
    findings.push({ level: 'notice', message })

  if (
    baseline.axeCore &&
    report.axeCore &&
    baseline.axeCore !== report.axeCore
  ) {
    warn(
      `axe-core の版が基準（${baseline.axeCore}）と違う（${report.axeCore}）。08 の 2.6 の手順で基準を置き直す`,
    )
  }

  const pages = [
    ...new Set([...Object.keys(baseline.pages), ...Object.keys(report.pages)]),
  ]
  for (const page of pages) {
    const base = baseline.pages[page]
    const now = report.pages[page]
    if (!now) {
      rows.push({ page, item: '（未測定）', base: null, now: null })
      continue
    }
    const rules = [
      ...new Set([...Object.keys(base ?? {}), ...Object.keys(now)]),
    ].sort()
    for (const rule of rules) {
      const b = base?.[rule] ?? 0
      const n = now[rule] ?? 0
      if (b === 0 && n === 0) continue
      rows.push({ page, item: rule, base: base ? b : null, now: n })
      if (!base) warn(`基準にないページ: ${page} ${rule} ${n}`)
      else if (b === 0) warn(`基準にないルール: ${page} ${rule} 0 → ${n}`)
      else if (n > b) warn(`増えた: ${page} ${rule} ${b} → ${n}`)
      else if (n < b)
        notice(`減った（基準を下げられる）: ${page} ${rule} ${b} → ${n}`)
    }
  }

  for (const [metric, values] of Object.entries(report.metrics ?? {})) {
    for (const [key, n] of Object.entries(values)) {
      const b = baseline.metrics?.[metric]?.[key.split('@')[0]]
      rows.push({
        page: key,
        item: `metric: ${metric}`,
        base: b ?? null,
        now: n,
      })
      if (b === undefined) continue
      const bad = badness[metric] ?? ((v: number) => v)
      if (bad(n) > bad(b))
        warn(`指標が悪くなった: ${key} ${metric} ${b} → ${n}`)
      else if (bad(n) < bad(b))
        notice(
          `指標がよくなった（基準を置き直せる）: ${key} ${metric} ${b} → ${n}`,
        )
    }
  }

  return { rows, findings }
}

export function toMarkdown(
  title: string,
  rows: Row[],
  findings: Finding[],
): string {
  const cell = (v: number | null) => (v === null ? '-' : String(v))
  const lines = [
    `## ${title}`,
    '',
    `警告 ${findings.filter((f) => f.level === 'warning').length} 件、お知らせ ${findings.filter((f) => f.level === 'notice').length} 件`,
    '',
    '| ページ@幅 | ルール・指標 | 基準 | 今 |',
    '| --- | --- | --- | --- |',
    ...rows.map(
      (r) => `| ${r.page} | ${r.item} | ${cell(r.base)} | ${cell(r.now)} |`,
    ),
    '',
  ]
  return lines.join('\n')
}

function main() {
  const { values } = parseArgs({
    options: {
      baseline: { type: 'string', default: 'test/a11y/baseline.json' },
      report: { type: 'string', default: 'test-results/e2e/a11y-report.json' },
    },
  })
  const gh = !!process.env.GITHUB_ACTIONS
  const emit = (f: Finding) =>
    console.log(gh ? `::${f.level}::${f.message}` : `${f.level}: ${f.message}`)

  // カタログの基準（baseline-catalog.json）は 07 があとで作るので、ないときは知らせるだけ
  for (const path of [values.baseline, values.report]) {
    if (!existsSync(path)) {
      emit({ level: 'notice', message: `${path} がないので比べなかった` })
      return
    }
  }
  const read = (path: string) =>
    JSON.parse(readFileSync(path, 'utf8')) as A11yFile
  const { rows, findings } = compare(read(values.baseline), read(values.report))
  findings.forEach(emit)
  const md = toMarkdown(
    `a11y: ${values.report} と ${values.baseline}`,
    rows,
    findings,
  )
  if (process.env.GITHUB_STEP_SUMMARY)
    appendFileSync(process.env.GITHUB_STEP_SUMMARY, md)
  else console.log(`\n${md}`)
}

if (import.meta.main) main()
