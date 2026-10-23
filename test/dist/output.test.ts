// ビルド出力のうち、ページがそろう前から成り立つもの（08 の 1.5）
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, test } from 'vitest'
import { DIST, distFiles, pagePath, readDist, startTags } from './dist.ts'

const htmlFiles = distFiles('**/*.html')

test('ads.txt が AdSense の発行者 ID を持つ', () => {
  // ads.txt の書き方は pub-…（ca- は付かない）
  expect(readDist('ads.txt')).toContain(
    'google.com, pub-2691922878827958, DIRECT, f08c47fec0942fa0',
  )
})

test('404 は Netlify の既定に任せるので、404.html を出さない', () => {
  expect(existsSync(join(DIST, '404.html'))).toBe(false)
})

test('CATALOG なしのビルドにカタログが出ていない', () => {
  expect(existsSync(join(DIST, 'catalog'))).toBe(false)
})

const legacy = new Set(
  readFileSync(new URL('../fixtures/legacy-urls.txt', import.meta.url), 'utf8')
    .split('\n')
    .filter(Boolean)
    .map((url) => decodeURIComponent(url)),
)

test('出力したページは、すべて旧サイトの URL にある（余分なページがない）', () => {
  const extra = htmlFiles.map(pagePath).filter((path) => !legacy.has(path))
  expect(extra).toEqual([])
})

describe('旧ドメイン（webmanab-html.com）', () => {
  // tip/url-query-action の本文にあるインラインコードの例だけは残す（04 の決定）
  const EXCEPTION = 'tip/url-query-action/index.html'

  test('HTML、XML、JSON、txt のどこにもない', () => {
    const found: string[] = []
    for (const file of distFiles('**/*.{html,xml,json,txt}')) {
      let text = readDist(file)
      if (file === EXCEPTION) {
        const inCode =
          text.match(/<code[^>]*>[^<]*webmanab-html\.com[^<]*<\/code>/g) ?? []
        expect(inCode.length).toBeLessThanOrEqual(1)
        for (const code of inCode) text = text.replace(code, '')
      }
      if (text.includes('webmanab-html.com')) found.push(file)
    }
    expect(found).toEqual([])
  })
})

describe.each(htmlFiles)('%s', (file) => {
  const html = readDist(file)
  const tags = startTags(html)

  test('<html lang="ja">', () => {
    expect(html).toMatch(/<html[^>]*\slang="ja"/)
  })

  test('<title> が空でない', () => {
    expect(html).toMatch(/<title>[^<]*\S[^<]*<\/title>/)
  })

  test('noindex の meta がない', () => {
    const robots = tags.filter((tag) => /name="robots"/i.test(tag))
    expect(robots.filter((tag) => /noindex/i.test(tag))).toEqual([])
  })

  test('変数なしのビルドに AdSense と GA のタグがない', () => {
    expect(html).not.toContain('adsbygoogle.js')
    expect(html).not.toContain('googletagmanager')
  })

  test('旧実装の独自属性 lazy が残っていない（data-lazy に変えた）', () => {
    expect(tags.filter((tag) => /\slazy(?=[\s=>/])/.test(tag))).toEqual([])
  })

  test('/ で始まる参照が dist/ のファイルを指す', () => {
    const refs: string[] = []
    for (const tag of tags) {
      for (const [, name, value] of tag.matchAll(
        /\s(href|src|srcset|style)="([^"]*)"/g,
      )) {
        if (name === 'srcset')
          refs.push(...value.split(',').map((s) => s.trim().split(/\s+/)[0]))
        else if (name === 'style')
          refs.push(
            ...[...value.matchAll(/url\((?:&quot;|['"])?([^)'"&]+)/g)].map(
              (m) => m[1],
            ),
          )
        else refs.push(value)
      }
    }
    const missing = refs
      .filter((ref) => ref.startsWith('/') && !ref.startsWith('//'))
      .map((ref) => decodeURIComponent(ref.replace(/&amp;/g, '&')))
      .map((ref) => ref.replace(/[?#].*$/, ''))
      // まだ作っていないページ（一覧は手順 8 など）への参照は通す。旧 URL がすべてそろうことは手順 12 の URL の一致テストで見る
      .filter((ref) => !legacy.has(ref))
      .filter((ref) => {
        const target = ref.endsWith('/') ? `${ref}index.html` : ref
        return !existsSync(join(DIST, target))
      })
    expect(missing).toEqual([])
  })
})
