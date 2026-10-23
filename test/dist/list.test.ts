// 一覧ページの出力（08 の 2.4 の A-8、A-11、3.3）。動きは e2e/smoke/list.spec.ts が見る
import { expect, test } from 'vitest'
import { distFiles, readDist, startTags } from './dist.ts'

const lists = distFiles(
  '{index.html,{tip,clip,lab}/index.html,{tips,clips,labs}/*/index.html}',
).map((file) => ({ file, html: readDist(file) }))

test('トップ、type の一覧 3 つ、ターム一覧 289 がある', () => {
  expect(lists).toHaveLength(1 + 3 + 289)
})

test('サムネイルは alt="" で、width と height がある（A-8、A11Y-01、3.3）', () => {
  const found = lists.flatMap(({ file, html }) =>
    startTags(html)
      .filter((tag) => /^<img\s[^>]*src="\/eyecatch\//.test(tag))
      .filter(
        (tag) =>
          !/\salt=""/.test(tag) ||
          !/\swidth="\d+"/.test(tag) ||
          !/\sheight="\d+"/.test(tag),
      )
      .map((tag) => `${file}: ${tag}`),
  )
  expect(found).toEqual([])
})

test('無限スクロールの Loader は読み上げない（A-11）', () => {
  const found = lists.flatMap(({ file, html }) =>
    startTags(html)
      .filter((tag) => /\sclass="[^"]*\bloader\b/.test(tag))
      .filter((tag) => !/\saria-hidden="true"/.test(tag))
      .map((tag) => `${file}: ${tag}`),
  )
  expect(found).toEqual([])
})
