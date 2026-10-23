// 部品のカタログのテスト（07）。先に pnpm build:catalog で dist-catalog を作っておく
import { defineConfig, devices } from '@playwright/test'
import { WIDTHS } from './src/catalog/types'

const port = Number(process.env.CATALOG_PORT ?? 4401)
const baseURL = `http://localhost:${port}`

export default defineConfig({
  testDir: 'e2e/catalog',
  // 既定の test-results/ は QA の playwright.config.ts も使い、実行のたびに空にされるので分ける
  outputDir: 'test-results/catalog',
  snapshotPathTemplate:
    '{testDir}/__screenshots__/{platform}/{arg}-{projectName}{ext}',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  reporter: process.env.CI ? 'github' : 'list',
  globalTeardown: './e2e/catalog/a11y-summary.mjs',
  use: {
    baseURL,
    locale: 'ja-JP',
    timezoneId: 'Asia/Tokyo',
    serviceWorkers: 'block',
  },
  webServer: {
    command: 'node e2e/catalog/serve.mjs',
    url: `${baseURL}/catalog/`,
    reuseExistingServer: !process.env.CI,
    env: { CATALOG_PORT: String(port) },
  },
  projects: WIDTHS.map((width) => ({
    name: `w${width}`,
    use: { ...devices['Desktop Chrome'], viewport: { width, height: 900 } },
  })),
  expect: {
    toHaveScreenshot: {
      animations: 'disabled',
      caret: 'hide',
      // 同じビルドを続けて撮っても、和文の縁が 2px ほど揺れることがあった（--repeat-each=5 で 455 回中 1 回）
      maxDiffPixels: 10,
    },
  },
})
