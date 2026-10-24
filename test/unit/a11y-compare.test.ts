import { describe, expect, test } from 'vitest'
import { compare, type A11yFile } from '../../scripts/a11y-compare.ts'

const baseline: A11yFile = {
  axeCore: '4.13.0',
  pages: {
    'clip@375': { 'target-size': 4, 'landmark-unique': 1 },
    'home@1080': { 'image-alt': 16 },
  },
  metrics: { h1: { clip: 2, home: 1 }, focusRules: { clip: 0 } },
}

const messages = (report: A11yFile) =>
  compare(baseline, report).findings.map((f) => `${f.level} ${f.message}`)

describe('compare', () => {
  test('増えたら警告、減ったらお知らせ', () => {
    expect(
      messages({
        axeCore: '4.13.0',
        pages: {
          'clip@375': { 'target-size': 6 },
          'home@1080': { 'image-alt': 16 },
        },
      }),
    ).toEqual([
      'notice 減った（基準を下げられる）: clip@375 landmark-unique 1 → 0',
      'warning 増えた: clip@375 target-size 4 → 6',
    ])
  })

  test('基準にないルールとページは警告', () => {
    expect(
      messages({
        pages: {
          'clip@375': {
            'target-size': 4,
            'landmark-unique': 1,
            'link-name': 2,
          },
          'home@1080': { 'image-alt': 16 },
          'menu@375': { 'target-size': 3 },
        },
      }),
    ).toEqual([
      'warning 基準にないルール: clip@375 link-name 0 → 2',
      'warning 基準にないページ: menu@375 target-size 3',
    ])
  })

  test('結果にないページは未測定として表に出し、警告しない', () => {
    const { rows, findings } = compare(baseline, {
      pages: { 'clip@375': { 'target-size': 4, 'landmark-unique': 1 } },
    })
    expect(findings).toEqual([])
    expect(rows).toContainEqual({
      page: 'home@1080',
      item: '（未測定）',
      base: null,
      now: null,
    })
  })

  test('指標は幅を外したキーで基準を引き、向きを見て判定する', () => {
    expect(
      messages({
        pages: {},
        metrics: {
          h1: { 'clip@375': 1, 'clip@1080': 3, 'clip@768': 0 },
          focusRules: { 'clip@375': 2 },
        },
      }),
    ).toEqual([
      'notice 指標がよくなった（基準を置き直せる）: clip@375 h1 2 → 1',
      'warning 指標が悪くなった: clip@1080 h1 2 → 3',
      'notice 指標がよくなった（基準を置き直せる）: clip@375 focusRules 0 → 2',
    ])
    // h1 は 0 になっても悪くなった扱い
    expect(messages({ pages: {}, metrics: { h1: { 'home@375': 0 } } })).toEqual(
      ['warning 指標が悪くなった: home@375 h1 1 → 0'],
    )
  })

  test('axe-core の版が違えば警告', () => {
    expect(messages({ axeCore: '4.14.0', pages: {} })[0]).toMatch(
      /^warning axe-core の版/,
    )
  })
})
