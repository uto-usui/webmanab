// ビルド出力のうち、ページがそろう前から成り立つもの（08 の 1.5）
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, test } from 'vitest'
import { load, valid } from '../content/load'
import { allowedPaths } from '../content/pages'
import {
  DIST,
  distFiles,
  legacyPaths,
  pagePath,
  readDist,
  startTags,
} from './dist.ts'

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

test('出力したページは、旧サイトの URL か許したページ（余分なページがない）', () => {
  const { posts, terms } = load('src/content')
  const allowed = allowedPaths(valid(posts), terms)
  const extra = htmlFiles.map(pagePath).filter((path) => !allowed.has(path))
  expect(extra).toEqual([])
})

// README 6 章の完了の条件。日本語 slug は dist/ にデコードした名前で出る
test('旧サイトの URL 1323 件が、すべて dist/ にある', () => {
  const built = new Set(htmlFiles.map(pagePath))
  expect([...legacyPaths].filter((path) => !built.has(path))).toEqual([])
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

  // 本文のコードの例（tip/nuxt-static-site-tips）にも同じ文字があるので、script の src で見る
  test('変数なしのビルドに AdSense と GA の script がない', () => {
    expect(
      tags.filter(
        (tag) =>
          tag.startsWith('<script') &&
          /\ssrc="[^"]*(adsbygoogle\.js|googletagmanager\.com)/.test(tag),
      ),
    ).toEqual([])
  })

  if (/^(tip|clip|lab)\/[^/]+\/index\.html$/.test(file)) {
    test('記事ページに広告の枠（.entry-ad）は出ている', () => {
      expect(html).toContain('class="entry-ad"')
    })
  }

  // 正の tabindex は Tab の順を見た目の順から外す（08 の 2.2）。
  // tip/html5-global の本文は tabindex を説明するデモの input を 3 つ持つので、その 3 つだけ通す
  test('tabindex に正の値がない', () => {
    const positive = tags.filter((tag) => /\stabindex="[1-9]/.test(tag))
    expect(positive).toHaveLength(
      file === 'tip/html5-global/index.html' ? 3 : 0,
    )
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
      .filter((ref) => {
        const target = ref.endsWith('/') ? `${ref}index.html` : ref
        return !existsSync(join(DIST, target))
      })
    expect(missing).toEqual([])
  })
})
