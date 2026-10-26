// 記事ページの出力（08 の 1.5、2.4 の A-4、A-6〜A-8、A-10、3.3）。全記事のページをまとめて見て、外れたページを出す
import { expect, test } from 'vitest'
import { load, valid } from '../content/load'
import { distFiles, readDist, startTags } from './dist.ts'

const entries = valid(load('src/content').posts)

const articles = distFiles('{tip,clip,lab}/*/index.html').map((file) => ({
  file,
  type: file.split('/')[0],
  html: readDist(file),
}))

const failing = (check: (html: string, type: string) => boolean) =>
  articles
    .filter(({ html, type }) => !check(html, type))
    .map(({ file }) => file)

test('記事ページが src/content の記事と同じ数ある', () => {
  expect(articles).toHaveLength(entries.length)
})

test('外部リンクは新しいタブで開き、rel に noopener がある（README 3 章の 5）', () => {
  const found = articles.flatMap(({ file, html }) =>
    startTags(html)
      .filter((tag) => /^<a\s[^>]*href="(https?:)?\/\//.test(tag))
      .filter(
        (tag) =>
          !/target="_blank"/.test(tag) || !/rel="[^"]*\bnoopener\b/.test(tag),
      )
      .map((tag) => `${file}: ${tag}`),
  )
  expect(found).toEqual([])
})

test('clip の「visit to」のリンクに名前がある（A-4）', () => {
  const visits = articles.flatMap(({ file, html }) =>
    (html.match(/<a class="entry-clip__img"[^>]*>[\s\S]*?<\/a>/g) ?? []).map(
      (link) => ({ file, link }),
    ),
  )
  // clipUrl のある clip の数。旧記事では 815（08 の 1.3）
  expect(visits).toHaveLength(
    entries.filter(({ data }) => data.type === 'clip' && data.clipUrl).length,
  )
  expect(
    visits
      .filter(
        ({ link }) =>
          !/alt="[^"]+"/.test(link) && !/aria-label="[^"]+"/.test(link),
      )
      .map(({ file }) => file),
  ).toEqual([])
})

test('シェアは type="button" で、アイコンは読み上げず、結果を role="status" で伝える（A-6）', () => {
  expect(
    failing(
      (html) =>
        /<button type="button" class="entry-sns__target"/.test(html) &&
        /<svg class="entry-sns__icon"[^>]*aria-hidden="true"/.test(html) &&
        /role="status"/.test(html),
    ),
  ).toEqual([])
})

test('関連記事の枠はいつも出て、空の ul は出さない（A-7）', () => {
  expect(
    failing(
      (html) =>
        /class="entry-related"/.test(html) &&
        !/<ul class="entry-related__list"[^>]*>\s*<\/ul>/.test(html),
    ),
  ).toEqual([])
})

test('アイキャッチの img に width と height があり、tip の大きなアイキャッチは alt=""（A-8、3.3）', () => {
  const found = articles.flatMap(({ file, type, html }) =>
    startTags(html)
      .filter((tag) => /^<img\s[^>]*src="\/eyecatch\//.test(tag))
      .filter(
        (tag) =>
          !/\swidth="\d+"/.test(tag) ||
          !/\sheight="\d+"/.test(tag) ||
          (type === 'tip' && !/\salt=""/.test(tag)),
      )
      .map((tag) => `${file}: ${tag}`),
  )
  expect(found).toEqual([])
})

test('目次の項目は本文の見出しの id を指し、閉じた一覧は inert（A-3、A-10）', () => {
  const found = articles.flatMap(({ file, html }) => {
    if (!html.includes('class="entry-toc"')) return []
    const hrefs = [
      ...html.matchAll(
        /<a href="#([^"]*)" class="entry-toc__target"|<li class="toc-item__child"[^>]*><a href="#([^"]*)"/g,
      ),
    ].map((m) => m[1] ?? m[2])
    return [
      ...hrefs.filter(
        (id) => !/^a\d+$/.test(id) || !html.includes(`id="${id}"`),
      ),
      ...(/<ul class="entry-toc__list"[^>]*\sinert/.test(html)
        ? []
        : ['inert がない']),
    ].map((problem) => `${file}: ${problem}`)
  })
  expect(found).toEqual([])
})
