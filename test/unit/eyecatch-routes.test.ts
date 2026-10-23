import { expect, test } from 'vitest'
import { eyecatchStaticPaths } from '../../src/lib/eyecatch-routes'
import { eyecatchFor } from '../../src/lib/eyecatch/index.ts'

const entry = (
  type: 'tip' | 'clip' | 'lab',
  id: number,
  primaryTag: string,
) => ({
  data: { type, id, primaryTag, terms: [{ id: 1, name: 'css', slug: 'css' }] },
})

test('通常版とナビ用の 2 つを出し、URL が eyecatchFor の svg / nav と一致する', () => {
  const entries = [
    entry('tip', 2883, 'Nuxt'),
    entry('clip', 2831, ''),
    entry('lab', 1564, 'javascript'),
  ]
  const paths = eyecatchStaticPaths(entries)
  expect(paths).toHaveLength(6)
  const urls = paths.map(
    ({ params }) => `/eyecatch/${params.type}/${params.id}.svg`,
  )
  const expected = entries.flatMap(({ data }) => {
    const { svg, nav } = eyecatchFor(data)
    return [svg, nav]
  })
  expect(urls).toEqual(expected)
  expect(paths.map(({ props }) => props.variant)).toEqual([
    'default',
    'nav',
    'default',
    'nav',
    'default',
    'nav',
  ])
})
