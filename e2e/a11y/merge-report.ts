// report.spec.ts がページ×幅ごとに書いた結果を、scripts/a11y-compare.ts が読む 1 つの JSON にまとめる。
// playwright.config.ts の globalTeardown。a11y のプロジェクトを回さなかったときは何もしない
import { globSync, readFileSync, writeFileSync } from 'node:fs'

export const A11Y_RESULT = 'a11y-result.json'
export const A11Y_REPORT = 'test-results/e2e/a11y-report.json'

export type PageResult =
  | { skipped: string }
  | {
      axeCore: string
      counts: Record<string, number>
      metrics: Record<string, number>
      details: unknown
    }

export default function mergeReport() {
  // outputDir は実行のたびに Playwright が空にするので、古い結果は混ざらない
  const files = globSync(`test-results/e2e/**/${A11Y_RESULT}`)
  if (files.length === 0) return
  const report = {
    axeCore: undefined as string | undefined,
    pages: {} as Record<string, Record<string, number>>,
    metrics: {} as Record<string, Record<string, number>>,
    details: {} as Record<string, unknown>,
    skipped: {} as Record<string, string>,
  }
  for (const file of files.sort()) {
    const { key, ...result } = JSON.parse(readFileSync(file, 'utf8')) as {
      key: string
    } & PageResult
    if ('skipped' in result) {
      report.skipped[key] = result.skipped
      continue
    }
    report.axeCore = result.axeCore
    report.pages[key] = result.counts
    report.details[key] = result.details
    for (const [name, value] of Object.entries(result.metrics))
      (report.metrics[name] ??= {})[key] = value
  }
  writeFileSync(A11Y_REPORT, `${JSON.stringify(report, null, 2)}\n`)
}
