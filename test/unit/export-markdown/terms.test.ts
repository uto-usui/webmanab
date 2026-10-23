import { describe, expect, it } from 'vitest'
import type { Frontmatter } from '../../../scripts/export-markdown/frontmatter.ts'
import { buildTerms } from '../../../scripts/export-markdown/terms.ts'

const post = (
  type: Frontmatter['type'],
  terms: Frontmatter['terms'],
): Frontmatter => ({
  id: 1,
  type,
  slug: 's',
  title: 't',
  date: '2020-01-01T00:00:00+09:00',
  primaryTag: '',
  terms,
})

describe('buildTerms', () => {
  it('記事から数え、name の昇順（大文字・小文字を区別しない）に並べる', () => {
    const terms = buildTerms([
      post('tip', [
        { id: 2, name: 'Vue.js', slug: 'vue-js' },
        { id: 1, name: 'nuxt', slug: 'nuxt' },
      ]),
      post('tip', [{ id: 2, name: 'Vue.js', slug: 'vue-js' }]),
      post('tip', [{ id: 3, name: 'CSS', slug: 'css' }]),
      post('clip', [{ id: 9, name: 'web', slug: 'web' }]),
    ])
    expect(terms.tips).toEqual([
      { id: 3, name: 'CSS', slug: 'css', count: 1 },
      { id: 1, name: 'nuxt', slug: 'nuxt', count: 1 },
      { id: 2, name: 'Vue.js', slug: 'vue-js', count: 2 },
    ])
    expect(terms.clips).toEqual([{ id: 9, name: 'web', slug: 'web', count: 1 }])
  })

  it('記事が 0 件の labs 332 / 333 を count 0 で足す', () => {
    const { labs } = buildTerms([
      post('lab', [{ id: 212, name: 'animation', slug: 'animation' }]),
    ])
    expect(labs).toEqual([
      { id: 212, name: 'animation', slug: 'animation', count: 1 },
      { id: 332, name: 'interaction', slug: 'interaction', count: 0 },
      { id: 333, name: 'svg', slug: 'svg', count: 0 },
    ])
  })
})
