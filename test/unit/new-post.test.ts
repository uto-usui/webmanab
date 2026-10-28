import { parseFrontmatter } from '@astrojs/internal-helpers/frontmatter'
import { describe, expect, test } from 'vitest'
import {
  clipSlug,
  jstTimestamp,
  nextPostId,
  postContent,
  readVault,
  resolveTerms,
} from '../../scripts/new-post/plan.ts'
import { planSync } from '../../scripts/sync-vault/plan.ts'
import { postSchema } from '../../src/lib/schema.ts'

const vaultPost = (
  path: string,
  lines: string[], // frontmatter の中身
) => ({ path, raw: ['---', ...lines, '---', '', '- 感想', ''].join('\n') })

const vault = readVault([
  vaultPost('clip/old.md', [
    'id: 2883',
    'type: clip',
    'slug: "old"',
    'terms:',
    '  - { id: 60, name: "animation", slug: "animation" }',
  ]),
  vaultPost('clip/example.md', [
    'id: 3001',
    'type: clip',
    'slug: "example"',
    'draft: true',
    'terms:',
    '  - { id: 367, name: "brutalism", slug: "brutalism" }',
  ]),
])

const terms = {
  tips: [{ id: 52, name: 'design', slug: 'design', count: 3 }],
  clips: [
    { id: 60, name: 'animation', slug: 'animation', count: 1 },
    { id: 112, name: '360°', slug: '360', count: 1 },
  ],
  labs: [{ id: 303, name: 'TweenMax', slug: 'tweenmax', count: 1 }],
}

describe('nextPostId', () => {
  test('下書きを含めた最大の次', () => {
    expect(nextPostId(vault)).toBe(3002)
  })

  test('新しい記事がなければ 3000', () => {
    expect(nextPostId(vault.slice(0, 1))).toBe(3000)
  })
})

describe('clipSlug', () => {
  test('区切りの前だけを使う', () => {
    expect(
      clipSlug('Studio Name | Creative agency', 'https://a.dev/', vault),
    ).toBe('studio-name')
    expect(
      clipSlug('Lusion – Award winning studio', 'https://a.dev/', vault),
    ).toBe('lusion')
  })

  test('英数字がなければホスト名から作る', () => {
    expect(clipSlug('ようこそ', 'https://www.studio.jp/', vault)).toBe(
      'studio-jp',
    )
  })

  test('vault の clip と重なれば番号を付ける', () => {
    expect(clipSlug('Example', 'https://example.com/', vault)).toBe('example-2')
  })
})

describe('resolveTerms', () => {
  test('名前か slug で探し、大文字・小文字を区別しない', () => {
    const { terms: found, created } = resolveTerms(
      ['Animation', '360'],
      'clip',
      terms,
      vault,
    )
    expect(found.map(({ id }) => id)).toEqual([60, 112])
    expect(created).toEqual([])
  })

  test('vault にだけある新しいタームも使う', () => {
    expect(resolveTerms(['brutalism'], 'clip', terms, vault).terms).toEqual([
      { id: 367, name: 'brutalism', slug: 'brutalism' },
    ])
  })

  test('ないものは、JSON と vault のどの id とも重ならない id で作る', () => {
    const { terms: found, created } = resolveTerms(
      ['Three.js', 'WebGL'],
      'clip',
      terms,
      vault,
    )
    expect(found).toEqual([
      { id: 368, name: 'Three.js', slug: 'three-js' },
      { id: 369, name: 'WebGL', slug: 'webgl' },
    ])
    expect(created).toEqual(found)
  })

  test('ほかの type のタームは使わない', () => {
    expect(resolveTerms(['design'], 'clip', terms, vault).created).toHaveLength(
      1,
    )
  })

  test('同じタームを 2 回書いても 1 つにする', () => {
    expect(
      resolveTerms(['animation', 'Animation'], 'clip', terms, vault).terms,
    ).toHaveLength(1)
  })

  test('slug を作れないタグは止める', () => {
    expect(() => resolveTerms(['写真'], 'clip', terms, vault)).toThrow(
      'slug を作れません',
    )
  })
})

test('jstTimestamp は動かす場所によらず日本時間', () => {
  expect(jstTimestamp(new Date('2026-10-27T01:00:00Z'))).toBe(
    '2026-10-27T10:00:00+09:00',
  )
})

describe('postContent', () => {
  const clip = postContent({
    id: 3002,
    type: 'clip',
    slug: 'studio-name',
    title: 'Studio Name | Creative agency',
    date: new Date('2026-10-27T01:00:00Z'),
    terms: [{ id: 60, name: 'animation', slug: 'animation' }],
    body: '- TODO: 見てよかったところを 1 行で書く\n',
    clipUrl: 'https://studio.example/',
    image: {
      src: '/images/clip/3002.webp',
      width: 1280,
      height: 720,
      thumb: '/images/clip/3002-640.webp',
    },
    fullImage: {
      src: '/images/clip/3002-full.webp',
      width: 1000,
      height: 4000,
    },
  })

  test('旧記事と同じ形で書き、draft を付ける', () => {
    expect(clip).toBe(`---
id: 3002
type: clip
slug: "studio-name"
title: "Studio Name | Creative agency"
date: 2026-10-27T10:00:00+09:00
primaryTag: "animation"
terms:
  - { id: 60, name: "animation", slug: "animation" }
clipUrl: https://studio.example/
image: { src: "/images/clip/3002.webp", width: 1280, height: 720, thumb: "/images/clip/3002-640.webp" }
fullImage: { src: "/images/clip/3002-full.webp", width: 1000, height: 4000 }
draft: true
---

- TODO: 見てよかったところを 1 行で書く
`)
    expect(
      postSchema.safeParse(parseFrontmatter(clip).frontmatter).success,
    ).toBe(true)
  })

  test('タグがなければ primaryTag は空', () => {
    const tip = postContent({
      id: 3003,
      type: 'tip',
      slug: 'example',
      title: 'TODO',
      date: new Date('2026-10-27T01:00:00Z'),
      terms: [],
      body: 'TODO\n',
    })
    expect(parseFrontmatter(tip).frontmatter).toMatchObject({
      primaryTag: '',
      terms: [],
      draft: true,
    })
  })

  test('draft を外して TODO が残っていれば sync が止める', () => {
    const plan = planSync({
      vaultPosts: [
        { path: 'clip/studio-name.md', raw: clip.replace('draft: true\n', '') },
      ],
      vaultImages: new Map([
        ['clip/3002.webp', Buffer.from('')],
        ['clip/3002-640.webp', Buffer.from('')],
        ['clip/3002-full.webp', Buffer.from('')],
      ]),
      sitePosts: new Map(),
      siteImage: () => undefined,
      terms,
    })
    expect(plan.problems).toEqual(['clip/studio-name.md: TODO が残っている'])
  })
})
