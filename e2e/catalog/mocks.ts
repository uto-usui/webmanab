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
      // コピーの権限は headless の設定で変わるので、書き込みは成功したことにする
      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: { writeText: async () => {} },
      })
    }),
  // 利用者が共有の画面を閉じたときと同じ AbortError を返す
  'share-abort': (page) =>
    page.addInitScript(() => {
      Object.defineProperty(navigator, 'share', {
        configurable: true,
        value: async () => {
          throw new DOMException('closed', 'AbortError')
        },
      })
    }),
  // 1 秒以上の setTimeout を走らせない。コピー後の表示が 2 秒で戻る前に撮るため
  'hold-timers': (page) =>
    page.addInitScript(() => {
      const original = window.setTimeout
      window.setTimeout = ((
        handler: TimerHandler,
        ms?: number,
        ...rest: unknown[]
      ) =>
        (ms ?? 0) >= 1000
          ? 0
          : original(handler, ms, ...rest)) as typeof window.setTimeout
    }),
  // 応答を返さず、読み込み中のままにする
  'list-pending': (page) => page.route('**/catalog/data/**', () => {}),
  'eyecatch-pending': (page) => page.route('**/eyecatch/**', () => {}),
}
