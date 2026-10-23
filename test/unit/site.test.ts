import { expect, test } from 'vitest'
import {
  archiveDescription,
  pageTitle,
  POST_TYPE_OF,
  POST_TYPES,
  TAXONOMY_OF,
} from '../../src/lib/site'

test('title は旧サイトと同じ形', () => {
  expect(pageTitle()).toBe('webmanab.html／ウェブまなぶ')
  expect(pageTitle('tip')).toBe('tip | webmanab.html／ウェブまなぶ')
  expect(archiveDescription('clip')).toBe('clip archive page')
})

test('type とタクソノミーの対応は行きと帰りで一致する', () => {
  for (const type of POST_TYPES) {
    expect(POST_TYPE_OF[TAXONOMY_OF[type]]).toBe(type)
  }
})
