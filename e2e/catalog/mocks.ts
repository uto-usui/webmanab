// story の parameters.catalog.mocks で名前を指定する差し替え（07 の 6 章、12 章）
import type { Page } from '@playwright/test'
import type { MockName } from '../../src/catalog/types'

export const mocks: Record<MockName, (page: Page) => Promise<unknown>> = {
  // headless の Chromium には navigator.share がないので足す。押されたら解決するだけ
  'share-supported': (page) =>
    page.addInitScript(() => {
      Object.defineProperty(navigator, 'share', {
        configurable: true,
        value: async () => {},
      })
    }),
  'share-unsupported': (page) =>
    page.addInitScript(() => {
      // 'share' in navigator で見分けられても無い側に入るよう、prototype から消す
      Reflect.deleteProperty(Navigator.prototype, 'share')
    }),
}
