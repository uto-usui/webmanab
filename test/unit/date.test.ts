import { describe, expect, test } from 'vitest'
import { formatDate, shownModified, toIsoJst } from '../../src/lib/date'

describe('date', () => {
  test('テストは UTC で走っている（Netlify と同じ条件）', () => {
    expect(new Date('2020-03-22T00:26:34+09:00').getDate()).toBe(21)
  })

  test('+09:00 の日時を日本時間の日付で出す', () => {
    expect(formatDate(new Date('2020-03-22T00:26:34+09:00'))).toBe('2020-03-22')
    expect(formatDate(new Date('2016-11-12T23:59:59+09:00'))).toBe('2016-11-12')
  })

  test('toIsoJst は +09:00 付きの元の表記に戻す', () => {
    expect(toIsoJst(new Date('2020-03-22T00:26:34+09:00'))).toBe(
      '2020-03-22T00:26:34+09:00',
    )
    expect(toIsoJst(new Date('2020-03-21T15:00:00Z'))).toBe(
      '2020-03-22T00:00:00+09:00',
    )
  })
})

describe('shownModified', () => {
  const date = new Date('2019-07-24T10:00:00+09:00')

  test('2026-10-25 以降の modified だけを出す', () => {
    const modified = new Date('2026-11-03T10:00:00+09:00')
    expect(shownModified({ date, modified })).toBe(modified)
    expect(
      shownModified({ date, modified: new Date('2026-10-24T23:59:59+09:00') }),
    ).toBeUndefined()
  })

  test('境目は日本時間で見る（UTC では 10/24 でも、日本時間で 10/25 なら出す）', () => {
    const modified = new Date('2026-10-24T15:00:00Z')
    expect(shownModified({ date, modified })).toBe(modified)
  })

  test('公開日と日本時間で同じ日なら出さない', () => {
    const published = new Date('2026-11-03T09:00:00+09:00')
    expect(
      shownModified({
        date: published,
        modified: new Date('2026-11-03T23:00:00+09:00'),
      }),
    ).toBeUndefined()
  })

  test('modified がなければ出さない', () => {
    expect(shownModified({ date })).toBeUndefined()
  })
})
