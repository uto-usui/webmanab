import { describe, expect, test } from 'vitest'
import {
  hasWikilink,
  MAX_REMOVE,
  planSync,
  toSiteRaw,
  type SyncInput,
} from '../../scripts/sync-vault/plan.ts'

const post = (
  fields: Record<string, string | number | boolean>,
  body = '- 感想',
  terms = '[]',
) =>
  [
    '---',
    ...Object.entries({
      id: 3000,
      type: 'clip',
      slug: 'example',
      title: 'Example',
      date: '2026-10-27T10:00:00+09:00',
      primaryTag: '""',
      clipUrl: 'https://example.com/',
      ...fields,
    }).map(([key, value]) => `${key}: ${value}`),
    `terms: ${terms}`,
    '---',
    '',
    body,
    '',
  ].join('\n')

const input = (overrides: Partial<SyncInput> = {}): SyncInput => ({
  vaultPosts: [],
  vaultImages: new Map(),
  sitePosts: new Map(),
  siteImage: () => undefined,
  terms: {
    tips: [],
    clips: [{ id: 60, name: 'animation', slug: 'animation', count: 1 }],
    labs: [],
  },
  ...overrides,
})

describe('planSync', () => {
  test('同じ記事なら何も変えない', () => {
    const raw = post(
      { id: 2628 },
      '- 感想',
      '[{ id: 60, name: animation, slug: animation }]',
    )
    const plan = planSync(
      input({
        vaultPosts: [{ path: 'clip/example.md', raw }],
        sitePosts: new Map([['clip/example.md', raw]]),
      }),
    )
    expect(plan.problems).toEqual([])
    expect([plan.added, plan.updated, plan.removed, plan.termsChanged]).toEqual(
      [[], [], [], []],
    )
  })

  test('下書きは写さず、id の重なりだけを見る', () => {
    const plan = planSync(
      input({
        vaultPosts: [
          { path: 'clip/example.md', raw: post({}) },
          {
            path: 'clip/draft.md',
            raw: post({ slug: 'draft', draft: true, title: 'TODO' }),
          },
        ],
      }),
    )
    expect(plan.problems).toEqual([
      'clip/draft.md: id 3000 が clip/example.md と重なる',
    ])
    expect(plan.added).toEqual(['clip/example.md'])
  })

  test('draft: false の記事は写す', () => {
    const plan = planSync(
      input({
        vaultPosts: [{ path: 'clip/example.md', raw: post({ draft: false }) }],
      }),
    )
    expect(plan.problems).toEqual([])
    expect(plan.added).toEqual(['clip/example.md'])
  })

  test('本文の ../images/ を /images/ にし、vault にない画像で止まる', () => {
    const body = '![a](../images/posts/3000/a.webp)'
    const ok = planSync(
      input({
        vaultPosts: [{ path: 'clip/example.md', raw: post({}, body) }],
        vaultImages: new Map([['posts/3000/a.webp', Buffer.from('a')]]),
      }),
    )
    expect(ok.problems).toEqual([])
    expect(ok.write.get('clip/example.md')).toContain(
      '](/images/posts/3000/a.webp)',
    )
    expect(ok.images).toEqual(['posts/3000/a.webp'])

    const missing = planSync(
      input({ vaultPosts: [{ path: 'clip/example.md', raw: post({}, body) }] }),
    )
    expect(missing.problems).toEqual([
      'clip/example.md: 本文の画像 ../images/posts/3000/a.webp が vault にない',
    ])
  })

  test('public/images/ の中身の違う同じ名前の画像は上書きしない', () => {
    const plan = planSync(
      input({
        vaultImages: new Map([['clip/2628.webp', Buffer.from('new')]]),
        siteImage: () => Buffer.from('old'),
      }),
    )
    expect(plan.problems).toEqual([
      'images/clip/2628.webp: public/images/ に中身の違う同じ名前の画像がある',
    ])
  })

  test('新しい記事の TODO、wikilink、ファイル名、置き場所で止まる', () => {
    const plan = planSync(
      input({
        vaultPosts: [
          {
            path: 'clip/example.md',
            raw: post({ title: 'TODO' }, 'see [[note]]'),
          },
          { path: 'tip/other.md', raw: post({ id: 3001, slug: 'other' }) },
          { path: 'clip/Wrong.md', raw: post({ id: 3002, slug: 'right' }) },
        ],
      }),
    )
    expect(plan.problems).toEqual([
      'clip/example.md: 本文に wikilink（[[）がある',
      'clip/example.md: TODO が残っている',
      'tip/other.md: type が clip なのに tip/ にある',
      'clip/Wrong.md: ファイル名は right.md にする',
    ])
  })

  test('旧記事の TODO は止めない', () => {
    const plan = planSync(
      input({
        vaultPosts: [
          { path: 'clip/example.md', raw: post({ id: 2628 }, '- TODO を書く') },
        ],
      }),
    )
    expect(plan.problems).toEqual([])
  })

  test(`記事が ${MAX_REMOVE} 本を超えて消えるときは --allow-delete が要る`, () => {
    const sitePosts = new Map(
      Array.from(
        { length: MAX_REMOVE + 1 },
        (_, i) => [`clip/p${i}.md`, ''] as const,
      ),
    )
    expect(planSync(input({ sitePosts })).problems).toHaveLength(1)
    const allowed = planSync(input({ sitePosts, allowDelete: true }))
    expect(allowed.problems).toEqual([])
    expect(allowed.removed).toHaveLength(MAX_REMOVE + 1)
  })

  test('ターム: 新しいものを足して数え直し、旧 id や名前の食い違いで止まる', () => {
    const plan = planSync(
      input({
        vaultPosts: [
          {
            path: 'clip/example.md',
            raw: post(
              {},
              '- 感想',
              '[{ id: 367, name: shader, slug: shader }, { id: 60, name: animation, slug: animation }]',
            ),
          },
        ],
      }),
    )
    expect(plan.problems).toEqual([])
    expect(plan.termsChanged).toEqual(['clips'])
    expect(plan.terms.clips).toEqual([
      { id: 60, name: 'animation', slug: 'animation', count: 1 },
      { id: 367, name: 'shader', slug: 'shader', count: 1 },
    ])

    const bad = planSync(
      input({
        vaultPosts: [
          {
            path: 'clip/example.md',
            raw: post(
              {},
              '- 感想',
              '[{ id: 12, name: new, slug: new }, { id: 60, name: anim, slug: anim }]',
            ),
          },
        ],
      }),
    )
    expect(bad.problems).toEqual([
      'clip/example のターム 12: 新しいタームの id は 367 以上にする',
      'clip/example のターム 60: JSON では animation（animation）なのに anim（anim）',
    ])
  })
})

describe('hasWikilink と toSiteRaw', () => {
  test('コードの中の [[ は wikilink にしない', () => {
    expect(hasWikilink('`a[[0]]`\n\n```js\nb[[1]]\n```\n')).toBe(false)
    expect(hasWikilink('![[image.png]]')).toBe(true)
  })

  test('frontmatter の ../images/ は書き換えない', () => {
    const raw = '---\nnote: "](../images/x)"\n---\n\n![](../images/y.webp)\n'
    expect(toSiteRaw(raw)).toBe(
      '---\nnote: "](../images/x)"\n---\n\n![](/images/y.webp)\n',
    )
  })
})
