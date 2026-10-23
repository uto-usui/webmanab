// 全 story × 4 幅で、axe（記録だけ）とスクリーンショットと状態の確かめを回す（07 の 10〜12 章）
import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { loadStories, openStory } from './story'

// best-practice はページの構造を見るものが多いので 08 のページ単位の検査だけが拾う（08 の 2.7）
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']
const PAGE_LEVEL_RULES = ['document-title', 'html-has-lang']

// steps のあとの状態の確かめ。こちらは失敗したらテストを落とす（07 の 12 章）
const checks: Record<string, (page: Page) => Promise<void>> = {
  'header/default': (page) =>
    expect(page.locator('.header')).not.toHaveClass(/\bis-fixed\b/),
  'header/fixed': async (page) => {
    await expect(page.locator('.header')).toHaveClass(/\bis-fixed\b/)
    await expect(page.locator('.header__inner')).toHaveClass(/\bis-fixed\b/)
  },
  'header/not-fixed-on-tablet': (page) =>
    expect(page.locator('.header')).not.toHaveClass(/\bis-fixed\b/),
  'layout/menu-open': (page) =>
    expect(page.locator('.menu')).toHaveClass(/\bis-open\b/),
  'menu/closed': (page) =>
    expect(page.locator('.menu')).not.toHaveClass(/\bis-open\b/),
  'menu/open': (page) =>
    expect(page.locator('.menu')).toHaveClass(/\bis-open\b/),
  'menu/many-terms': (page) =>
    expect(page.locator('.menu')).toHaveClass(/\bis-open\b/),
  'menu/item-hover': (page) =>
    expect(page.locator('.menu')).toHaveClass(/\bis-open\b/),
}

for (const story of loadStories()) {
  test(story.id, async ({ page }, info) => {
    const width = page.viewportSize()!.width
    test.skip(
      !story.widths.includes(width as never),
      `${width}px は撮らない story`,
    )

    await openStory(page, story)
    await checks[story.id]?.(page)

    const result = await new AxeBuilder({ page })
      .include('.default-layout')
      .withTags(TAGS)
      .disableRules(PAGE_LEVEL_RULES)
      .analyze()
    // a11y は報告だけ。違反があってもテストは落とさない（07 の 10.2）
    const violations = result.violations.map((v) => ({
      id: v.id,
      impact: v.impact,
      tags: v.tags.filter((t) => t.startsWith('wcag')),
      targets: v.nodes.map((n) => n.target.join(' ')),
    }))
    const dir = join(info.project.outputDir, 'a11y')
    mkdirSync(dir, { recursive: true })
    writeFileSync(
      join(dir, `${story.id.replace('/', '--')}@${width}.json`),
      JSON.stringify({
        story: story.id,
        width,
        axeCore: result.testEngine.version,
        violations,
      }),
    )
    if (violations.length)
      info.annotations.push({
        type: 'a11y',
        description: violations.map((v) => `${v.id}(${v.impact})`).join(', '),
      })

    await expect(page).toHaveScreenshot(`${story.id.replace('/', '--')}.png`, {
      fullPage: !story.viewportOnly,
    })
  })
}
