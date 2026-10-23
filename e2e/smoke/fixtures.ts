// smoke の page は、このサイトと Google Fonts だけを読む。本文の jsfiddle や Amazon の広告は
// 外のサイトの都合で読み込みが終わらなかったりエラーを出したりするので、止めて結果を安定させる
import { test as base } from '@playwright/test'

export { expect } from '@playwright/test'

export const isExternal = (url: string, baseURL: string) =>
  !new Set([
    new URL(baseURL).host,
    'fonts.googleapis.com',
    'fonts.gstatic.com',
  ]).has(new URL(url).host)

export const test = base.extend({
  page: async ({ page, baseURL }, use) => {
    await page.route('**/*', (route) =>
      isExternal(route.request().url(), baseURL!)
        ? route.abort()
        : route.continue(),
    )
    await use(page)
  },
})
