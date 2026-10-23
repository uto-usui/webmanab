import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://localhost:4321',
    viewport: { width: 1080, height: 800 },
  },
  webServer: {
    command: 'pnpm preview --port 4321',
    url: 'http://localhost:4321/',
    reuseExistingServer: !process.env.CI,
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
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1080, height: 800 },
      },
    },
    // 旧サイトとの比較。ローカルの macOS だけで回す
    {
      name: 'visual',
      testDir: 'e2e/visual',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})
