import { describe, expect, test } from 'vitest'
import {
  entryPath,
  infiniteListState,
  neighbors,
  paginate,
  postPath,
  postStaticPaths,
  postsInTerm,
  related,
  relatedPosts,
  sitePaths,
  sortByDateDesc,
} from '../../src/lib/posts'
import type { PostType } from '../../src/lib/site'

const post = (
  slug: string,
  date: string,
  { type = 'tip', primaryTag = 'js', terms = [] as number[] } = {},
) => ({
  data: {
    type: type as PostType,
    slug,
    date: new Date(date),
    primaryTag,
    terms: terms.map((id) => ({ id, name: `t${id}`, slug: `t${id}` })),
  },
})

const slugs = (entries: readonly { data: { slug: string } }[]) =>
  entries.map((e) => e.data.slug)

describe('postPath', () => {
  test('ASCII の slug はそのまま', () => {
    expect(postPath('tip', 'nuxt-static-site-tips')).toBe(
      '/tip/nuxt-static-site-tips/',
    )
    expect(postPath('clip', '_prefix')).toBe('/clip/_prefix/')
  })

  test('日本語と U+202F を含む slug はエンコードし、デコードすると元に戻る', () => {
    const cases = [
      ['clip', 'ね - nt'],
      ['lab', '無限ループするニュースティッカー-『javascript』'],
    ] as const
    for (const [type, slug] of cases) {
      const path = postPath(type, slug)
      expect(path).toMatch(/^\/(clip|lab)\/[%A-Za-z0-9\-_.]+\/$/)
      expect(decodeURIComponent(path.split('/')[2])).toBe(slug)
    }
    expect(postPath('clip', 'ね - nt')).toBe(
      '/clip/%E3%81%AD%E2%80%AF-%E2%80%AFnt/',
    )
  })

  test('entryPath は data の type と slug から作る', () => {
    expect(entryPath(post('a', '2020-01-01', { type: 'lab' }))).toBe('/lab/a/')
  })
})

describe('neighbors', () => {
  const all = [
    post('b', '2020-01-02'),
    post('a', '2020-01-01'),
    post('c', '2020-01-03'),
    post('x', '2020-01-02T12:00:00+09:00', { type: 'clip' }),
  ]

  test('prev は 1 つ古い記事、next は 1 つ新しい記事。ほかの type は混ぜない', () => {
    const { prev, next } = neighbors(all, all[0])
    expect(prev?.data.slug).toBe('a')
    expect(next?.data.slug).toBe('c')
  })

  test('最古の記事に prev はなく、最新の記事に next はない', () => {
    expect(neighbors(all, all[1]).prev).toBeNull()
    expect(neighbors(all, all[2]).next).toBeNull()
    expect(neighbors(all, all[3])).toEqual({ prev: null, next: null })
  })

  test('一覧にない記事を渡すと止める', () => {
    expect(() => neighbors(all, post('z', '2020-01-01'))).toThrow()
  })
})

describe('related', () => {
  const key = (tag: string) => tag.trim().toLowerCase()

  test('同じ type、キーが同じ記事を新しい順に 3 件。自分自身は除く', () => {
    const all = [
      post('self', '2020-01-05', { primaryTag: 'JavaScript' }),
      post('a', '2020-01-01', { primaryTag: 'javascript' }),
      post('b', '2020-01-02', { primaryTag: 'javaScript ' }),
      post('c', '2020-01-03', { primaryTag: 'JavaScript' }),
      post('d', '2020-01-04', { primaryTag: 'javascript' }),
      post('e', '2020-01-06', { primaryTag: 'css' }),
      post('f', '2020-01-07', { primaryTag: 'javascript', type: 'clip' }),
    ]
    expect(slugs(related(all, all[0], key))).toEqual(['d', 'c', 'b'])
  })

  test('キーの関数で寄せたものは同じタグとして扱う', () => {
    const typo = (tag: string) => (tag === 'aniamtion' ? 'animation' : tag)
    const all = [
      post('self', '2020-01-02', { primaryTag: 'animation' }),
      post('a', '2020-01-01', { primaryTag: 'aniamtion' }),
      post('b', '2020-01-03', { primaryTag: 'sports' }),
      post('c', '2020-01-04', { primaryTag: 'sport' }),
    ]
    expect(slugs(related(all, all[0], typo))).toEqual(['a'])
    expect(slugs(related(all, all[2], typo))).toEqual([])
  })

  test('primaryTag が空なら 0 件', () => {
    const all = [
      post('self', '2020-01-02', { primaryTag: '' }),
      post('a', '2020-01-01', { primaryTag: '' }),
    ]
    expect(related(all, all[0], key)).toEqual([])
  })

  test('同じタグの記事が自分だけなら 0 件', () => {
    const all = [
      post('self', '2020-01-02'),
      post('a', '2020-01-01', { primaryTag: 'css' }),
    ]
    expect(related(all, all[0], key)).toEqual([])
  })
})

describe('postsInTerm', () => {
  test('そのタクソノミーの type で、タームを持つ記事を新しい順に返す', () => {
    const all = [
      post('a', '2020-01-01', { terms: [1, 2] }),
      post('b', '2020-01-03', { terms: [2] }),
      post('c', '2020-01-02', { terms: [3] }),
      post('d', '2020-01-04', { terms: [2], type: 'clip' }),
    ]
    expect(slugs(postsInTerm(all, 'tips', 2))).toEqual(['b', 'a'])
    expect(slugs(postsInTerm(all, 'clips', 2))).toEqual(['d'])
    expect(postsInTerm(all, 'labs', 2)).toEqual([])
  })
})

describe('paginate', () => {
  test('8 件ずつ分ける', () => {
    const items = Array.from({ length: 17 }, (_, i) => i)
    expect(paginate(items).map((page) => page.length)).toEqual([8, 8, 1])
    expect(paginate(items)[1][0]).toBe(8)
  })

  test('0 件でも空の 1 ページ目を返す', () => {
    expect(paginate([])).toEqual([[]])
  })
})

describe('infiniteListState', () => {
  test('件数が 8 の倍数なら、読み込み口を出し、最後に End を出す', () => {
    expect(infiniteListState(16)).toEqual({
      lastPage: 2,
      hasLoader: true,
      showEndAfterLast: true,
    })
  })

  test('8 の倍数でなく 8 件より多いなら、読み込み口を出し、最後は読み込み口ごと消す', () => {
    expect(infiniteListState(17)).toEqual({
      lastPage: 3,
      hasLoader: true,
      showEndAfterLast: false,
    })
  })

  test('8 件未満なら読み込み口を出さない', () => {
    expect(infiniteListState(5)).toEqual({
      lastPage: 1,
      hasLoader: false,
      showEndAfterLast: false,
    })
  })

  test('0 件のターム（/labs/332/）は読み込み口を出して End にする', () => {
    expect(infiniteListState(0)).toEqual({
      lastPage: 1,
      hasLoader: true,
      showEndAfterLast: true,
    })
  })
})

describe('静的なパス', () => {
  const all = [
    post('b', '2020-01-02'),
    post('ね - nt', '2020-01-03', { type: 'clip' }),
    post('a', '2020-01-01'),
  ]

  test('postStaticPaths は type ごとに、デコード済みの slug を params に入れる', () => {
    expect(postStaticPaths(all, 'clip')).toEqual([
      { params: { slug: 'ね - nt' }, props: { entry: all[1] } },
    ])
    expect(postStaticPaths(all, 'tip').map((p) => p.params.slug)).toEqual([
      'b',
      'a',
    ])
  })

  test('sitePaths はトップ、type の一覧、記事、ターム一覧を並べる', () => {
    expect(
      sitePaths(all, {
        tips: [{ id: 1 }],
        clips: [],
        labs: [{ id: 332 }],
      }),
    ).toEqual([
      '/',
      '/tip/',
      '/clip/',
      '/lab/',
      '/clip/%E3%81%AD%E2%80%AF-%E2%80%AFnt/',
      '/tip/b/',
      '/tip/a/',
      '/tips/1/',
      '/labs/332/',
    ])
  })

  test('sortByDateDesc は元の配列を変えない', () => {
    const before = slugs(all)
    expect(slugs(sortByDateDesc(all))).toEqual(['ね - nt', 'b', 'a'])
    expect(slugs(all)).toEqual(before)
  })
})

describe('relatedPosts', () => {
  test('primaryTagKey で空白・大文字小文字・打ち間違いを寄せて比べる', () => {
    const all = [
      post('self', '2020-01-05', { primaryTag: 'Animation' }),
      post('a', '2020-01-01', { primaryTag: 'aniamtion' }),
      post('b', '2020-01-02', { primaryTag: ' animation ' }),
      post('c', '2020-01-03', { primaryTag: 'sport' }),
      post('d', '2020-01-04', { primaryTag: 'animation', type: 'lab' }),
    ]
    expect(slugs(relatedPosts(all, all[0]))).toEqual(['b', 'a'])
  })
})
