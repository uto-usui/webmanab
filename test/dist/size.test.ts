// 容量の上限（08 の 3.2）。最初のビルドで実測して見直す
import { readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { gzipSync } from 'node:zlib'
import { describe, expect, test } from 'vitest'
import { DIST, distFiles, readDist, startTags } from './dist.ts'

const KB = 1024
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

  test('HTML が gzip 後 50KB 以下', () => {
    expect(gzipSize(html)).toBeLessThanOrEqual(50 * KB)
  })

  test('自前の JS が gzip 後 10KB 以下', () => {
    const js = linked(tags, /^<script\s/, 'src') + inline(html, 'script')
    expect(gzipSize(js)).toBeLessThanOrEqual(10 * KB)
  })

  test('CSS（インラインを含む）が gzip 後 30KB 以下', () => {
    const css =
      linked(tags, /^<link\s[^>]*rel="stylesheet"/, 'href') +
      inline(html, 'style')
    expect(gzipSize(css)).toBeLessThanOrEqual(30 * KB)
  })
})

// 件数のテストは手順 8 と 10 で足す。ここではあるものの大きさだけを見る
test.each([
  ['eyecatch/**/*.svg', 8 * KB],
  ['og/*.png', 150 * KB],
  ['data/**/*.json', 8 * KB],
])('%s が 1 ファイル %i バイト以下', (pattern, limit) => {
  const over = distFiles(pattern).filter(
    (file) => statSync(join(DIST, file)).size > limit,
  )
  expect(over).toEqual([])
})
