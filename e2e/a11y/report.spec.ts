// ページ単位の axe と数値の指標を test-results/a11y-report.json に書く（08 の 2.6）。
// 報告だけなので expect を使わない。比べるのは scripts/a11y-compare.ts。
// 条件は旧サイトの監査（08 の 2.3、.snapshot/prototypes/qa/audit.mjs）に合わせる。
import AxeBuilder from '@axe-core/playwright'
import { test, type Page } from '@playwright/test'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'

const OUT = 'test-results/a11y-report.json'
const TAGS = [
  'wcag2a',
  'wcag2aa',
  'wcag21a',
  'wcag21aa',
  'wcag22aa',
  'best-practice',
]
const WIDTHS = [
  { width: 1080, height: 900 },
  { width: 375, height: 812 },
]

interface Target {
  key: string
  path: string
  open?: (page: Page) => Promise<void>
}

// キーは test/a11y/baseline.json と同じ
const TARGETS: Target[] = [
  { key: 'home', path: '/' },
  { key: 'list', path: '/tip/' },
  { key: 'term', path: '/tips/29/' },
  { key: 'tip-a', path: '/tip/method-control/' },
  { key: 'tip-b', path: '/tip/sass-pickup/' },
  { key: 'clip', path: '/clip/2016-jsconf-is/' },
  { key: 'lab', path: '/lab/createjs-node-motion/' },
  {
    key: 'menu',
    path: '/',
    open: async (page) => {
      await page.click('.menu__btn', { timeout: 2000 })
      await page.waitForTimeout(1500)
    },
  },
  {
    key: 'toc',
    path: '/tip/method-control/',
    open: async (page) => {
      await page.locator('.entry-toc').scrollIntoViewIfNeeded({ timeout: 2000 })
      await page.click('.entry-toc__title', { timeout: 2000 })
      await page.waitForTimeout(1000)
    },
  },
]

interface Report {
  axeCore?: string
  pages: Record<string, Record<string, number>>
  metrics: Record<string, Record<string, number>>
  details: Record<string, unknown>
  skipped: Record<string, string>
}

// テストが落ちて worker が替わっても結果が消えないよう、1 件ごとにファイルへ足す。
// test-results/ は実行のたびに Playwright が空にする
function save(update: (report: Report) => void) {
  const report: Report = existsSync(OUT)
    ? JSON.parse(readFileSync(OUT, 'utf8'))
    : { pages: {}, metrics: {}, details: {}, skipped: {} }
  update(report)
  mkdirSync(dirname(OUT), { recursive: true })
  writeFileSync(OUT, `${JSON.stringify(report, null, 2)}\n`)
}

// axe では見えない数値（08 の 2.6 の metrics）
function collectMetrics(page: Page) {
  return page.evaluate(() => {
    let focusRules = 0
    let reducedMotionRules = 0
    for (const sheet of document.styleSheets) {
      let rules: CSSRuleList
      try {
        rules = sheet.cssRules
      } catch {
        // Google Fonts など別オリジンの CSS は読めない
        continue
      }
      for (const rule of rules) {
        if (
          rule instanceof CSSMediaRule &&
          rule.media.mediaText.includes('prefers-reduced-motion')
        )
          reducedMotionRules++
        if (
          rule instanceof CSSStyleRule &&
          rule.selectorText.includes(':focus')
        )
          focusRules++
      }
    }
    const metrics: Record<string, number> = {
      h1: document.querySelectorAll('h1').length,
      hashLinks: document.querySelectorAll('a[href="#"]').length,
      focusRules,
      reducedMotionRules,
    }
    if (!document.querySelector('.menu.is-open')) {
      const focusable = document.querySelectorAll(
        '.menu__inner :is(a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"]))',
      )
      metrics.focusableInClosedMenu = [...focusable].filter(
        (el) =>
          !el.closest('[inert]') &&
          el.checkVisibility({ visibilityProperty: true }),
      ).length
    }
    return metrics
  })
}

test.use({ serviceWorkers: 'block', locale: 'ja-JP', timezoneId: 'Asia/Tokyo' })

for (const viewport of WIDTHS) {
  test.describe(`${viewport.width}px`, () => {
    test.use({ viewport })

    for (const target of TARGETS) {
      const key = `${target.key}@${viewport.width}`
      test(key, async ({ page, baseURL }) => {
        const allowed = new Set([
          new URL(baseURL!).host,
          'fonts.googleapis.com',
          'fonts.gstatic.com',
        ])
        await page.route('**/*', (route) =>
          allowed.has(new URL(route.request().url()).host)
            ? route.continue()
            : route.abort(),
        )
        try {
          const res = await page.goto(target.path, { waitUntil: 'load' })
          if (res?.status() !== 200) {
            save((r) => (r.skipped[key] = `HTTP ${res?.status()}`))
            return
          }
          await page.waitForTimeout(1500)
          await target.open?.(page)
          const result = await new AxeBuilder({ page }).withTags(TAGS).analyze()
          const metrics = await collectMetrics(page)
          save((r) => {
            r.axeCore = result.testEngine.version
            r.pages[key] = Object.fromEntries(
              result.violations.map((v) => [v.id, v.nodes.length]),
            )
            for (const [name, value] of Object.entries(metrics))
              (r.metrics[name] ??= {})[key] = value
            r.details[key] = result.violations.map((v) => ({
              id: v.id,
              impact: v.impact,
              targets: v.nodes.map((n) => n.target.join(' ')),
            }))
          })
        } catch (e) {
          // ページの部品がまだない（メニューや目次）ときもここに来る
          save((r) => (r.skipped[key] = String(e).split('\n')[0]))
        }
      })
    }
  })
}
