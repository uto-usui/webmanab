// 容量の上限（08 の 3.2）。08 の案より実測（2026-10-23）がかなり小さかったものは、実測の約 1.5 倍に下げて
// 増えたときに気づけるようにした。上げるときは理由をコミットに書く
import { readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { gzipSync } from 'node:zlib'
import { describe, expect, test } from 'vitest'
import { DIST, distFiles, readDist, startTags } from './dist.ts'

const KB = 1024
// 1 ページの gzip 後の上限。実測の最大は HTML 15.2KB（tip/nuxt-static-site-tips）、JS 1.3KB（clip/）、CSS 5.5KB（tip/html5-global）
const PAGE = { html: 24 * KB, js: 2 * KB, css: 8 * KB }
const gzipSize = (text: string | Buffer) => gzipSync(text).length

function inline(html: string, tag: 'script' | 'style'): string {
  const re = new RegExp(`<${tag}(\\s[^>]*)?>([\\s\\S]*?)</${tag}>`, 'g')
  return [...html.matchAll(re)]
    .filter(([, attrs = '']) => !/type="application\/(ld\+)?json"/.test(attrs))
    .map(([, , body]) => body)
    .join('\n')
}

function linked(tags: string[], pattern: RegExp, attr: 'src' | 'href') {
  return tags
    .filter((tag) => pattern.test(tag))
    .map((tag) => tag.match(new RegExp(`\\s${attr}="(/[^/"][^"]*)"`))?.[1])
    .filter((path): path is string => !!path)
    .map((path) => readFileSync(join(DIST, path), 'utf8'))
    .join('\n')
}

describe.each(distFiles('**/*.html'))('%s', (file) => {
  const html = readDist(file)
  const tags = startTags(html)

  test(`HTML が gzip 後 ${PAGE.html / KB}KB 以下`, () => {
    expect(gzipSize(html)).toBeLessThanOrEqual(PAGE.html)
  })

  test(`自前の JS が gzip 後 ${PAGE.js / KB}KB 以下`, () => {
    const js = linked(tags, /^<script\s/, 'src') + inline(html, 'script')
    expect(gzipSize(js)).toBeLessThanOrEqual(PAGE.js)
  })

  test(`CSS（インラインを含む）が gzip 後 ${PAGE.css / KB}KB 以下`, () => {
    const css =
      linked(tags, /^<link\s[^>]*rel="stylesheet"/, 'href') +
      inline(html, 'style')
    expect(gzipSize(css)).toBeLessThanOrEqual(PAGE.css)
  })
})

// 件数は assets.test.ts が見る
test.each([
  // 実測の最大は 7.8KB（05 の目安 8KB のまま）、101KB（05 の 150KB のまま）、2.9KB
  ['eyecatch/**/*.svg', 8 * KB],
  ['og/*.png', 150 * KB],
  ['data/**/*.json', 5 * KB],
])('%s が 1 ファイル %i バイト以下', (pattern, limit) => {
  const over = distFiles(pattern).filter(
    (file) => statSync(join(DIST, file)).size > limit,
  )
  expect(over).toEqual([])
})
