import { describe, expect, it } from 'vitest'
import {
  demoCodeUrl,
  demoPreview,
  embedsDemo,
} from '../../src/lib/demo-preview.ts'

describe('demoPreview', () => {
  it('labobal.dev のデモには動画とポスター画像を返す', () => {
    expect(demoPreview('https://labobal.dev/three-video/')).toEqual({
      video: 'https://labobal.dev/previews/three-video.webm',
      poster: 'https://labobal.dev/previews/three-video.jpg',
    })
  })

  it('末尾のスラッシュがなくても同じ', () => {
    expect(demoPreview('https://labobal.dev/three-video')?.video).toBe(
      'https://labobal.dev/previews/three-video.webm',
    )
  })

  it('クエリやハッシュは無視する', () => {
    expect(demoPreview('https://labobal.dev/marquee/?a=1#b')?.poster).toBe(
      'https://labobal.dev/previews/marquee.jpg',
    )
  })

  it.each([
    'https://labobal.dev/',
    'https://labobal.dev/previews/three-video.webm',
    'https://labobal.dev/a/b/',
    'http://labobal.dev/three-video/',
    'https://www.labobal.dev/three-video/',
    'https://jsfiddle.net/yutousui/d2y41xkn/',
    'http://glslsandbox.com/e#48225.0',
    'https://github.com/uto-usui/template_1.0.0',
    'not a url',
  ])('%s には動画がない', (url) => {
    expect(demoPreview(url)).toBeUndefined()
  })
})

describe('demoCodeUrl', () => {
  it('labobal.dev のデモは GitHub のフォルダを返す。リポジトリ名は laboobal-dev', () => {
    expect(demoCodeUrl('https://labobal.dev/three-video')).toBe(
      'https://github.com/uto-usui/laboobal-dev/tree/master/src/demos/three-video/',
    )
  })

  it('jsfiddle などは undefined', () => {
    expect(
      demoCodeUrl('https://jsfiddle.net/yutousui/d2y41xkn/'),
    ).toBeUndefined()
  })
})

describe('embedsDemo', () => {
  const demoUrl = 'https://labobal.dev/marquee/'

  it('同じデモの iframe があれば true', () => {
    expect(
      embedsDemo(
        '文\n\n<p><iframe src="https://labobal.dev/marquee/" title="x"></iframe></p>',
        demoUrl,
      ),
    ).toBe(true)
    // src がスキームなしでも、末尾のスラッシュがなくても同じデモ
    expect(
      embedsDemo('<iframe width="100%" src="//labobal.dev/marquee">', demoUrl),
    ).toBe(true)
  })

  it('別のデモ、リンクだけ、コードの中の iframe は false', () => {
    for (const markdown of [
      '<p><iframe src="https://labobal.dev/blob/"></iframe></p>',
      '[別のタブで開く](https://labobal.dev/marquee/)',
      '```html\n<iframe src="https://labobal.dev/marquee/"></iframe>\n```',
    ]) {
      expect(embedsDemo(markdown, demoUrl)).toBe(false)
    }
  })

  it('demoUrl が labobal.dev でなければ false', () => {
    expect(
      embedsDemo(
        '<iframe src="//jsfiddle.net/yutousui/d2y41xkn/embedded/"></iframe>',
        'https://jsfiddle.net/yutousui/d2y41xkn/',
      ),
    ).toBe(false)
  })
})
