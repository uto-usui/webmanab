// story を開いて、モックと操作を済ませた状態にする。stories.spec.ts と menu.spec.ts から使う
import type { Page } from '@playwright/test'
import { readFileSync } from 'node:fs'
import type { Step, StoryEntry } from '../../src/catalog/types'
import { mocks } from './mocks'

const indexFile = new URL(
  '../../dist-catalog/catalog/index.json',
  import.meta.url,
)

// テストの一覧を作る時点で story が要るので、サーバーではなくビルドの出力を直接読む
export function loadStories(): StoryEntry[] {
  try {
    return JSON.parse(readFileSync(indexFile, 'utf8')).stories
  } catch (error) {
    throw new Error('dist-catalog がない。先に pnpm build:catalog を走らせる', {
      cause: error,
    })
  }
}

export function findStory(id: string): StoryEntry {
  const story = loadStories().find((s) => s.id === id)
  if (!story) throw new Error(`story がない: ${id}`)
  return story
}

const allowedHosts = new Set(['fonts.googleapis.com', 'fonts.gstatic.com'])

export async function openStory(page: Page, story: StoryEntry) {
  for (const name of story.mocks ?? []) await mocks[name](page)
  // フォント以外の外部への通信を止めて、外のサイトの状態で結果が変わらないようにする
  await page.route(
    (url) => url.hostname !== 'localhost' && !allowedHosts.has(url.hostname),
    (route) => route.abort(),
  )
  await page.goto(`/catalog/${story.id}/`)
  await page.evaluate(() => document.fonts.ready)
  for (const step of story.steps ?? []) await runStep(page, step)
  await settle(page)
}

/** Tab を押して selector の要素にフォーカスを当てる。:focus-visible はキーボードでないと付かない */
export async function tabTo(page: Page, selector: string, limit = 50) {
  const target = page.locator(selector).first()
  for (let i = 0; i < limit; i++) {
    await page.keyboard.press('Tab')
    if (await target.evaluate((el) => el === document.activeElement)) return
  }
  throw new Error(`Tab を ${limit} 回押しても ${selector} に届かない`)
}

async function runStep(page: Page, step: Step) {
  if ('click' in step) await page.click(step.click)
  else if ('hover' in step) await page.hover(step.hover)
  else if ('focus' in step) await tabTo(page, step.focus)
  else if ('scroll' in step) {
    await page.evaluate((y) => scrollTo(0, y), step.scroll)
    // header-fixed.ts は scroll のあと requestAnimationFrame で class を付ける
    await nextFrames(page)
  } else await page.waitForTimeout(step.wait)
}

function nextFrames(page: Page) {
  return page.evaluate(
    () =>
      new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      ),
  )
}

/** transition が終わるまで待つ。途中の色で axe の color-contrast が揺れるのを防ぐ */
export async function settle(page: Page) {
  await nextFrames(page)
  await page.evaluate(() =>
    Promise.all(
      document
        .getAnimations()
        // 無限に回るもの（Loader など）は終わらないので待たない
        .filter((a) => a.effect?.getComputedTiming().endTime !== Infinity)
        .map((a) => a.finished.catch(() => {})),
    ),
  )
}
