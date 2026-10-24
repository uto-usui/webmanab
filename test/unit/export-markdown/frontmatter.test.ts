import { describe, expect, it } from 'vitest'
import {
  fileName,
  frontmatter,
  postFile,
} from '../../../scripts/export-markdown/frontmatter.ts'
import type { SnapshotPost } from '../../../scripts/export-markdown/snapshot.ts'

const post = (over: Partial<SnapshotPost> = {}): SnapshotPost => ({
  id: 2883,
  type: 'tip',
  slug: 'nuxt-static-site-tips',
  title: 'Nuxt.js  の Tips &#8211; 『Nuxt』 ',
  content: '<p>a</p>',
  excerpt: '<p>Nuxt.js は &amp; …提供..more</p>\n',
  date: '2020-03-22T00:26:34',
  prev: { title: 'x', slug: 'dart-sass-with-nuxt', img: '' },
  next: [],
  images: { alt: { modified: '2020-03-22T22:13:43' } },
  terms: {
    tips: [{ term_id: 366, name: 'nuxt', slug: 'nuxt' }],
    writer: [{ term_id: 8, name: 'uto usui', slug: 'uto-usui' }],
  },
  fields: { 'demo-true': false, 'demo-url': '', 'primary-tag': ' Nuxt ' },
  source: 'single',
  ...over,
})

describe('fileName', () => {
  it('英小文字・数字・ハイフン・アンダースコアだけの slug はそのまま使う', () => {
    expect(fileName({ id: 1, slug: 'gulp-from-utf-8-to-shift_jis' })).toBe(
      'gulp-from-utf-8-to-shift_jis',
    )
  })

  it('日本語・エンコード済み・先頭が _ の slug は post-<id> にする', () => {
    expect(fileName({ id: 2831, slug: '%e3%81%ad%e2%80%af-%e2%80%afnt' })).toBe(
      'post-2831',
    )
    expect(fileName({ id: 693, slug: '_prefix' })).toBe('post-693')
  })
})

describe('frontmatter', () => {
  it('値をデコードして詰め、キーを決まった順に並べる', () => {
    const fm = frontmatter(post())
    expect(fm).toEqual({
      id: 2883,
      type: 'tip',
      slug: 'nuxt-static-site-tips',
      title: 'Nuxt.js の Tips – 『Nuxt』',
      date: '2020-03-22T00:26:34+09:00',
      modified: '2020-03-22T22:13:43+09:00',
      excerpt: 'Nuxt.js は & …提供',
      primaryTag: 'Nuxt',
      terms: [{ id: 366, name: 'nuxt', slug: 'nuxt' }],
      legacy: { prev: 'dart-sass-with-nuxt', next: null },
    })
    expect(Object.keys(fm)).toEqual([
      'id',
      'type',
      'slug',
      'title',
      'date',
      'modified',
      'excerpt',
      'primaryTag',
      'terms',
      'legacy',
    ])
  })

  it('HTML の空白だけを詰め、U+3000 や U+202F などはそのまま残す', () => {
    const fm = frontmatter(
      post({
        title: ' ね\u202f&#8212;\u202fNT　|\t a　',
        excerpt: '<p>上品な　ホバー\u00a0エフェクト..more</p>\n',
        fields: { 'primary-tag': '\u3000Nuxt ' },
      }),
    )
    expect(fm.title).toBe('ね\u202f—\u202fNT　| a　')
    expect(fm.excerpt).toBe('上品な　ホバー\u00a0エフェクト')
    expect(fm.primaryTag).toBe('\u3000Nuxt')
  })

  it('一覧ページからしか取れなかった記事には modified と legacy を出さない', () => {
    const fm = frontmatter(
      post({ source: 'list', images: undefined, slug: '%e3%81%ad' }),
    )
    expect(fm.slug).toBe('ね')
    expect(fm).not.toHaveProperty('modified')
    expect(fm).not.toHaveProperty('legacy')
  })

  it('空の excerpt とタームなしの扱い', () => {
    const fm = frontmatter(post({ excerpt: '', terms: { tips: false } }))
    expect(fm).not.toHaveProperty('excerpt')
    expect(fm.terms).toEqual([])
  })

  it('clipUrl は http(s) のものだけ出し、空なら demo-url を使う', () => {
    const clip = (fields: Record<string, unknown>) =>
      frontmatter(
        post({
          type: 'clip',
          terms: {},
          fields: { 'primary-tag': '', ...fields },
        }),
      )
    expect(clip({ 'clip-url': 'https://a.example/' }).clipUrl).toBe(
      'https://a.example/',
    )
    expect(
      clip({ 'clip-url': '', 'demo-url': 'http://www.thegigi.it/en' }).clipUrl,
    ).toBe('http://www.thegigi.it/en')
    expect(clip({ 'clip-url': 'v' })).not.toHaveProperty('clipUrl')
    expect(clip({ 'clip-url': 'v' }).primaryTag).toBe('')
  })

  it('demoUrl は tip と lab で demo-true のときだけ出し、抜けたコロンを補う', () => {
    const demo = (
      type: SnapshotPost['type'],
      fields: Record<string, unknown>,
    ) =>
      frontmatter(
        post({ type, terms: {}, fields: { 'primary-tag': 'x', ...fields } }),
      ).demoUrl
    expect(
      demo('lab', { 'demo-true': true, 'demo-url': 'https//jsfiddle.net/a/' }),
    ).toBe('https://jsfiddle.net/a/')
    expect(
      demo('tip', {
        'demo-true': false,
        'demo-url': 'http://re-vite.com/test/demo/',
      }),
    ).toBeUndefined()
    expect(
      demo('clip', { 'demo-true': true, 'demo-url': 'https://a.example/' }),
    ).toBeUndefined()
  })
})

describe('postFile', () => {
  it('文字列はダブルクォート、日付はタイムスタンプ、terms は 1 項目 1 行で書く', () => {
    const fm = frontmatter(post({ slug: '913' }))
    expect(
      postFile({ ...fm, legacy: { prev: '913', next: null } }, 'a\n'),
    ).toBe(
      [
        '---',
        'id: 2883',
        'type: tip',
        'slug: "913"',
        'title: "Nuxt.js の Tips – 『Nuxt』"',
        'date: 2020-03-22T00:26:34+09:00',
        'modified: 2020-03-22T22:13:43+09:00',
        'excerpt: "Nuxt.js は & …提供"',
        'primaryTag: "Nuxt"',
        'terms:',
        '  - { id: 366, name: "nuxt", slug: "nuxt" }',
        'legacy:',
        '  prev: "913"',
        '  next: null',
        '---',
        '',
        'a',
        '',
      ].join('\n'),
    )
  })

  it('本文がなければ frontmatter だけにする', () => {
    expect(postFile(frontmatter(post({ terms: {} })), '')).toMatch(
      /\nterms: \[\]\nlegacy:\n {2}prev: dart-sass-with-nuxt\n {2}next: null\n---\n$/,
    )
  })
})
