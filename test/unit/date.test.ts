import { describe, expect, test } from 'vitest'
import { formatDate, toIsoJst } from '../../src/lib/date'

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
