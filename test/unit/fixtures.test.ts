import { readFileSync } from 'node:fs'
import { describe, expect, test } from 'vitest'

// URL の一致テスト（README 3 章の 13）の正本なので、手で崩れていないかを見る
describe('test/fixtures/legacy-urls.txt', () => {
  const lines = readFileSync(
    new URL('../fixtures/legacy-urls.txt', import.meta.url),
    'utf8',
  )
    .split('\n')
    .filter(Boolean)

  test('旧 sitemap の 1323 件で、重複がない', () => {
    expect(lines).toHaveLength(1323)
    expect(new Set(lines).size).toBe(1323)
  })

  test('すべてルート相対で、末尾がスラッシュ', () => {
    for (const line of lines) expect(line).toMatch(/^\/(.*\/)?$/)
  })

  test('エンコードされた日本語 slug の 2 件が、デコードできる', () => {
    const encoded = lines.filter((line) => line.includes('%'))
    expect(encoded).toHaveLength(2)
    for (const line of encoded)
      expect(() => decodeURIComponent(line)).not.toThrow()
  })
})
