import { describe, expect, test } from 'vitest'
import {
  compare,
  demoKey,
  readPost,
  summary,
  type Demo,
} from '../../scripts/check-demos.ts'

describe('demoKey', () => {
  test.each([
    ['https://jsfiddle.net/yutousui/d8knz11c/', 'jsfiddle:yutousui/d8knz11c'],
    [
      'https://jsfiddle.net/yutousui/6t7780ua/2/embedded/js,html,result/dark/',
      'jsfiddle:yutousui/6t7780ua',
    ],
    ['https://labobal.dev/marquee/', 'labobal:marquee'],
    ['https://labobal.dev/marquee', 'labobal:marquee'],
    ['https://labobal.dev/', undefined],
    ['https://labobal.dev/previews/marquee.webm', undefined],
    ['https://www.youtube.com/embed/exID', undefined],
  ])('%s → %s', (url, key) => {
    expect(demoKey(url)).toBe(key)
  })
})

const post = (path: string, demoUrl: string | undefined, body: string) =>
  readPost(
    [
      '---',
      `type: ${path.split('/')[0]}`,
      `slug: "${path.split('/')[1]}"`,
      ...(demoUrl ? [`demoUrl: ${demoUrl}`] : []),
      '---',
      '',
      body,
    ].join('\n'),
  )
const iframe = (src: string) => `<p><iframe src="${src}"></iframe></p>`
const demo = (slug: string, article?: string): Demo => ({
  slug,
  title: slug,
  article: article && `https://webmanab.com/${article}/`,
  origin: '',
})

describe('compare', () => {
  test('(a) demos.json の article が指す記事が、まだ jsfiddle を埋め込んでいる', () => {
    const r = compare(
      [
        post(
          'lab/toc',
          'https://jsfiddle.net/yutousui/aaa/',
          iframe('//jsfiddle.net/yutousui/aaa/embedded/result/'),
        ),
        post(
          'lab/styling-input',
          'https://labobal.dev/styling-input/',
          iframe('https://labobal.dev/styling-input/'),
        ),
      ],
      [
        demo('toc', 'lab/toc'),
        demo('styling-input', 'lab/styling-input'),
        demo('nowhere', 'lab/nowhere'),
        demo('marquee'),
      ],
    )
    expect(r.stillJsfiddle).toEqual([
      {
        demo: 'toc',
        post: 'lab/toc',
        jsfiddle: ['https://jsfiddle.net/yutousui/aaa/embedded/result/'],
        hasLabobal: false,
      },
    ])
    expect(r.missingArticle).toEqual([
      { demo: 'nowhere', article: 'https://webmanab.com/lab/nowhere/' },
    ])
  })

  test('(b) demoUrl と本文の iframe が別のデモを指している（tip/scroll-box-animation の形）', () => {
    const r = compare(
      [
        post(
          'tip/scroll-box-animation',
          'https://jsfiddle.net/yutousui/d8knz11c/',
          iframe('//jsfiddle.net/yutousui/5y2gor7c/embedded/result,js/dark/'),
        ),
        // 版の番号や embedded の有無は同じデモとして扱う
        post(
          'tip/same',
          'https://jsfiddle.net/yutousui/gcb4wkuo/19/',
          iframe('//jsfiddle.net/yutousui/gcb4wkuo/embedded/'),
        ),
        // 本文にデモの iframe がなければ比べない
        post('tip/no-iframe', 'https://jsfiddle.net/yutousui/x/', '本文'),
      ],
      [],
    )
    expect(r.mismatched).toEqual([
      {
        post: 'tip/scroll-box-animation',
        demoUrl: 'https://jsfiddle.net/yutousui/d8knz11c/',
        iframes: [
          'https://jsfiddle.net/yutousui/5y2gor7c/embedded/result,js/dark/',
        ],
      },
    ])
  })

  test('(c) demoUrl、iframe、リンクが指す labobal.dev の slug が demos.json にない', () => {
    const r = compare(
      [
        post(
          'lab/a',
          'https://labobal.dev/typo/',
          `${iframe('https://labobal.dev/typo/')}\n\n[コード](https://labobal.dev/marquee/)`,
        ),
      ],
      [demo('marquee')],
    )
    expect(r.unknownSlug).toEqual([{ post: 'lab/a', slug: 'typo' }])
  })

  test('(d) jsfiddle の残りを数える', () => {
    const r = compare(
      [
        post(
          'lab/a',
          'https://jsfiddle.net/yutousui/a/',
          `${iframe('//jsfiddle.net/yutousui/a/embedded/')}\n\n${iframe('//jsfiddle.net/yutousui/b/embedded/')}`,
        ),
        post('tip/b', 'https://jsfiddle.net/yutousui/c/', '本文'),
        post(
          'lab/c',
          'https://labobal.dev/marquee/',
          iframe('https://labobal.dev/marquee/'),
        ),
      ],
      [demo('marquee')],
    )
    expect(r.jsfiddle).toEqual({ posts: 2, iframes: 2, demoUrls: 2 })
    expect(r.labobalPosts).toBe(1)
    expect(summary(r)).toBe(
      'デモの食い違い 0 件。jsfiddle の残りは記事 2 本（iframe 2、demoUrl 2）、labobal.dev を埋め込む記事は 1 本',
    )
  })
})
