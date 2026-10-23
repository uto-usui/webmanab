import { describe, expect, test } from 'vitest'
import {
  forMenu,
  getTerms,
  parseTerms,
  sortTerms,
  termPath,
} from '../../src/lib/terms'

const term = (id: number, name: string, count = 1) => ({
  id,
  name,
  slug: name,
  count,
})

describe('terms', () => {
  test('名前順に並べる。大文字小文字は区別しない', () => {
    const sorted = sortTerms([
      term(1, 'Vue.js'),
      term(2, 'API'),
      term(3, '.htaccess'),
      term(4, 'animation'),
      term(5, 'vue'),
    ])
    expect(sorted.map((t) => t.name)).toEqual([
      '.htaccess',
      'animation',
      'API',
      'vue',
      'Vue.js',
    ])
  })

  test('parseTerms はスキーマに合わない JSON を止める', () => {
    expect(() => parseTerms([{ id: 1, name: 'a' }])).toThrow()
    expect(parseTerms([term(2, 'b'), term(1, 'a')]).map((t) => t.id)).toEqual([
      1, 2,
    ])
  })

  test('メニューには投稿 0 件のタームを出さない', () => {
    expect(
      forMenu([term(1, 'a'), term(332, 'interaction', 0)]).map((t) => t.id),
    ).toEqual([1])
  })

  test('termPath', () => {
    expect(termPath('labs', 332)).toBe('/labs/332/')
  })

  test('ターム JSON がまだなくても空の一覧を返す', () => {
    expect(Array.isArray(getTerms('tips'))).toBe(true)
  })
})
