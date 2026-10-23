import { defineConfig, devices } from '@playwright/test'

// 複数の worktree で同時に回すときは E2E_PORT で分ける
const port = Number(process.env.E2E_PORT ?? 4321)

export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: `http://localhost:${port}`,
    viewport: { width: 1080, height: 800 },
  },
  webServer: {
    // Astro 7.4 はエージェントの環境を検知すると preview を裏に回して終了する。--ignore-lock なら前面のまま動く
    command: `pnpm preview --port ${port} --ignore-lock`,
    url: `http://localhost:${port}/`,
    // 他の worktree の preview を拾って別の dist/ を試さないよう、使い回さない
    reuseExistingServer: false,
  },
  projects: [
    {
      name: 'smoke',
      testDir: 'e2e/smoke',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1080, height: 800 },
      },
    },
    {
      name: 'a11y',
      testDir: 'e2e/a11y',
      // 結果を 1 つの JSON にまとめるので、1 つの worker で順に回す
      fullyParallel: false,
      use: { ...devices['Desktop Chrome'] },
    },
    // 旧サイトとの比較。ローカルの macOS だけで回す
    {
      name: 'visual',
      testDir: 'e2e/visual',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})
