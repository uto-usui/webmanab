// props から DOM の形が決まるだけの確認は、ブラウザを使わず Container API で見る（07 の 4.3）。
// experimental_ の名前なので、Astro の更新で変わったらここを直す
import { experimental_AstroContainer as AstroContainer } from 'astro/container'
import { beforeAll, describe, expect, test } from 'vitest'
import EntryNav from '../../src/components/EntryNav.astro'
import EntryRelated from '../../src/components/EntryRelated.astro'
import EntryToc from '../../src/components/EntryToc.astro'
import Title2 from '../../src/components/Title2.astro'
import { lists } from '../../src/catalog/fixtures/list'
import { headings } from '../../src/catalog/fixtures/toc'

let container: AstroContainer
beforeAll(async () => {
  container = await AstroContainer.create()
})

const count = (html: string, pattern: RegExp) =>
  html.match(new RegExp(pattern, 'g'))?.length ?? 0

describe('EntryToc', () => {
  test('h3 のない h2 には入れ子の ul を出さない', async () => {
    const html = await container.renderToString(EntryToc, {
      props: { headings: headings.typical },
    })
    // 外側の ul と、h3 を持つ 2 つの h2 の ul
    expect(count(html, /<ul/)).toBe(3)
    expect(html).toContain('href="#a0"')
    expect(html).toContain('href="#a21"')
  })

  test('a0 / a00 の形でない id の見出しは目次に入れない', async () => {
    const html = await container.renderToString(EntryToc, {
      props: {
        headings: [
          { depth: 2, slug: 'a0', text: '一つ目' },
          { depth: 2, slug: 'custom-id', text: '外す' },
        ],
      },
    })
    expect(count(html, /class="entry-toc__item"/)).toBe(1)
    expect(html).not.toContain('外す')
  })

  test('見出しがなくても枠は出す', async () => {
    const html = await container.renderToString(EntryToc, {
      props: { headings: [] },
    })
    expect(html).toContain('class="entry-toc"')
    expect(count(html, /<li/)).toBe(0)
  })
})

describe('EntryNav', () => {
  const [next, prev] = lists.eight

  test('prev だけのときは li が 1 つ', async () => {
    const html = await container.renderToString(EntryNav, {
      props: { prev, next: null },
    })
    expect(count(html, /<li/)).toBe(1)
    expect(html).toContain('entry-nav__item--prev')
  })

  test('next だけのときは右に寄せる', async () => {
    const html = await container.renderToString(EntryNav, {
      props: { prev: null, next },
    })
    expect(count(html, /<li/)).toBe(1)
    expect(html).toMatch(/entry-nav__item--next[^"]*u-text-right/)
    expect(html).toContain(`/eyecatch/tip/${next.data.id}-nav.svg`)
  })
})

test('EntryRelated は 0 件のとき見出しだけ出して ul を出さない', async () => {
  const html = await container.renderToString(EntryRelated, {
    props: { posts: [] },
  })
  expect(html).toContain('class="title2"')
  expect(count(html, /<ul/)).toBe(0)
})

test('Title2 は scoped の属性を持つ h2（A11Y-10）', async () => {
  const html = await container.renderToString(Title2, {
    slots: { default: 'share <br />ー' },
  })
  expect(html).toMatch(/<h2 class="title2" data-astro-cid-/)
})
