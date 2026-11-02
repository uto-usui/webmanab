import { describe, expect, it } from 'vitest'
import { demoPreview } from '../../src/lib/demo-preview.ts'

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
