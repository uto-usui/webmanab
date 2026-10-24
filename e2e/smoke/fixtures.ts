// smoke の page は、このサイトだけを読む。本文の jsfiddle や Amazon の広告は
// 外のサイトの都合で読み込みが終わらなかったりエラーを出したりするので、止めて結果を安定させる
import { test as base } from '@playwright/test'

export { expect } from '@playwright/test'

export const isExternal = (url: string, baseURL: string) =>
  new URL(url).host !== new URL(baseURL).host

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
