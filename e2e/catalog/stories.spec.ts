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
  'article/tip': (page) =>
    expect(page.locator('.article-item__img > img')).toHaveAttribute(
      'data-lazy',
      'loaded',
    ),
  'article/clip': async (page) => {
    const title = page.locator('.article-item__target')
    await expect(title).toHaveAttribute('href', /^https:/)
    await expect(title).toHaveAttribute('target', '_blank')
    await expect(title).toHaveAttribute('rel', 'noopener')
  },
  'article/image-loading': (page) =>
    expect(page.locator('.article-item__img > img')).toHaveAttribute(
      'data-lazy',
      'loading',
    ),
  // 無限スクロールの出し分け（07 の 12 章、03 の 4.3）
  'article-list/eight': async (page) => {
    await expect(page.locator('.article-item')).toHaveCount(8)
    await expect(page.locator('.infinite-loading-container')).toHaveCount(0)
  },
  'article-list/loading': async (page) => {
    await expect(page.locator('.loader')).toBeVisible()
    await expect(page.locator('.article-item')).toHaveCount(8)
  },
  'article-list/end': async (page) => {
    await expect(page.locator('.article-item')).toHaveCount(16)
    await expect(page.locator('[data-infinite-end]')).toBeVisible()
    await expect(page.locator('.loader')).toBeHidden()
    // 足したカードは 1 件目の複製なので、中身が 2 ページ目の記事に入れ替わっていること
    const last = page.locator('.article-item').last()
    await expect(last.locator('.article-item__target')).toHaveText(
      '複数の画像を手早くsipsコマンドで一括リサイズする -『Mac』',
    )
    await expect(last.locator('.article-item__target')).toHaveAttribute(
      'href',
      '/tip/sips/',
    )
    await expect(last.locator('img')).toHaveAttribute('src', /\/2308\.svg$/)
    await expect(last.locator('img')).toHaveAttribute('data-lazy', 'loaded')
  },
  'article-list/no-more': async (page) => {
    await expect(page.locator('.article-item')).toHaveCount(12)
    await expect(page.locator('.infinite-loading-container')).toHaveCount(0)
  },
  'article-list/empty': async (page) => {
    await expect(page.locator('.article-item')).toHaveCount(0)
    await expect(page.locator('[data-infinite-end]')).toBeVisible()
  },
  'entry-toc/closed': async (page) => {
    await expect(page.locator('.entry-toc')).not.toHaveClass(/\bis-open\b/)
    await expect(page.locator('.entry-toc__list')).toHaveJSProperty(
      'inert',
      true,
    )
  },
  'entry-toc/open': async (page) => {
    await expect(page.locator('.entry-toc')).toHaveClass(/\bis-open\b/)
    await expect(page.locator('.entry-toc__list')).toHaveJSProperty(
      'inert',
      false,
    )
  },
  'entry-share/supported': (page) =>
    expect(page.locator('.entry-sns__label')).toHaveText('share this page'),
  'entry-share/unsupported': (page) =>
    expect(page.locator('.entry-sns__label')).toHaveText('copy link'),
  'entry-share/copied': async (page) => {
    await expect(page.locator('.entry-sns__target')).toHaveClass(
      /\bis-copied\b/,
    )
    await expect(page.locator('.entry-sns__label')).toHaveText('copied')
    await expect(page.getByRole('status')).toHaveText('リンクをコピーしました')
  },
  'entry-related/empty': (page) =>
    expect(page.locator('.entry-related ul')).toHaveCount(0),
  'entry-nav/prev-only': async (page) => {
    await expect(page.locator('.entry-nav__item')).toHaveCount(1)
    await expect(page.locator('.entry-nav__item--prev')).toHaveCount(1)
  },
  'entry-nav/next-only': async (page) => {
    await expect(page.locator('.entry-nav__item')).toHaveCount(1)
    await expect(page.locator('.entry-nav__item--next')).toHaveClass(
      /\bu-text-right\b/,
    )
  },
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
