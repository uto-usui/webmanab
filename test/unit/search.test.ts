import { describe, expect, test } from 'vitest'
import { itemFromMeta, readQuery, statusText } from '../../src/lib/search'

describe('readQuery', () => {
  test('q の前後の空白を落とし、type で絞る', () => {
    expect(readQuery('?q=%20grid%20&type=clip')).toEqual({
      q: 'grid',
      type: 'clip',
    })
  })

  test('日本語の q を読む', () => {
    expect(readQuery(`?q=${encodeURIComponent('変数')}`)).toEqual({ q: '変数' })
  })

  test('知らない type と空の type は絞らない', () => {
    expect(readQuery('?q=a&type=post')).toEqual({ q: 'a' })
    expect(readQuery('?q=a&type=')).toEqual({ q: 'a' })
  })

  test('q がなければ空文字', () => {
    expect(readQuery('')).toEqual({ q: '' })
  })
})

describe('itemFromMeta', () => {
  const item = {
    type: 'tip',
    slug: 'variable-javascript',
    path: '/tip/variable-javascript/',
    title: '変数 -『JavaScript』',
    date: '2016-10-21T18:36:05+09:00',
    dateLabel: '2016-10-21',
    primaryTag: 'javascript',
    eyecatch: '/eyecatch/tip/468.svg',
  }

  test('meta の item の JSON を戻す', () => {
    expect(itemFromMeta({ item: JSON.stringify(item) })).toEqual(item)
  })

  test('item がない、壊れている、path か title がないときは null', () => {
    expect(itemFromMeta({})).toBeNull()
    expect(itemFromMeta({ item: '{' })).toBeNull()
    expect(itemFromMeta({ item: JSON.stringify({ path: '/' }) })).toBeNull()
    expect(itemFromMeta({ item: 'null' })).toBeNull()
  })
})

test('statusText', () => {
  expect(statusText(0)).toBe('見つかりませんでした')
  expect(statusText(23)).toBe('23 件')
})
