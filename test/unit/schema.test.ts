import { describe, expect, test } from 'vitest'
import { postSchema, termListSchema } from '../../src/lib/schema'

const base = {
  id: 2883,
  type: 'tip',
  slug: 'nuxt-static-site-tips',
  title: 'Nuxt.js の Tips 集',
  date: '2020-03-22T00:26:34+09:00',
  primaryTag: 'Nuxt',
  terms: [{ id: 366, name: 'nuxt', slug: 'nuxt' }],
}

const ok = (data: object) => postSchema.safeParse(data).success

describe('postSchema', () => {
  test('最小の記事が通り、date は Date になる', () => {
    const parsed = postSchema.parse(base)
    expect(parsed.date.toISOString()).toBe('2020-03-21T15:26:34.000Z')
  })

  test('任意の項目（modified、excerpt、legacy）があっても通る', () => {
    expect(
      ok({
        ...base,
        modified: '2020-03-22T22:13:43+09:00',
        excerpt: '抜粋',
        legacy: { prev: 'dart-sass-with-nuxt', next: null },
      }),
    ).toBe(true)
  })

  test('primaryTag は空文字を許すが、キーがないと止める', () => {
    expect(ok({ ...base, primaryTag: '' })).toBe(true)
    expect(ok({ ...base, primaryTag: undefined })).toBe(false)
  })

  test('知らないキーは止める', () => {
    expect(ok({ ...base, thumbnail: 'x.png' })).toBe(false)
    expect(ok({ ...base, legacy: { prev: null, next: null, extra: 1 } })).toBe(
      false,
    )
  })

  test('clipUrl は clip だけ', () => {
    expect(ok({ ...base, type: 'clip', clipUrl: 'https://example.com/' })).toBe(
      true,
    )
    expect(ok({ ...base, clipUrl: 'https://example.com/' })).toBe(false)
  })

  test('demoUrl は tip と lab だけ', () => {
    const demoUrl = 'https://jsfiddle.net/yutousui/d8knz11c/'
    expect(ok({ ...base, demoUrl })).toBe(true)
    expect(ok({ ...base, type: 'lab', demoUrl })).toBe(true)
    expect(ok({ ...base, type: 'clip', demoUrl })).toBe(false)
  })

  test('URL でない clipUrl と demoUrl は止める', () => {
    expect(ok({ ...base, type: 'clip', clipUrl: 'v' })).toBe(false)
    expect(ok({ ...base, demoUrl: 'https//jsfiddle.net/x/' })).toBe(false)
  })

  test('空の excerpt は止める（エクスポーターはキーごと出さない）', () => {
    expect(ok({ ...base, excerpt: '' })).toBe(false)
  })
})

describe('termListSchema', () => {
  test('count 0 のタームも通る', () => {
    expect(
      termListSchema.safeParse([
        { id: 332, name: 'interaction', slug: 'interaction', count: 0 },
      ]).success,
    ).toBe(true)
  })

  test('count がないものは止める', () => {
    expect(
      termListSchema.safeParse([{ id: 1, name: 'a', slug: 'a' }]).success,
    ).toBe(false)
  })
})
