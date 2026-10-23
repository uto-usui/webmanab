// 本文の Markdown のリンクと生 HTML（08 の 1.3 の 2〜5）。スキーマと件数は posts.test.ts が見る
import { existsSync } from 'node:fs'
import { describe, expect, test } from 'vitest'
import { sitePaths } from '../../src/lib/posts'
import { termListSchema } from '../../src/lib/schema'
import { load, valid } from './load'

// フェンスとインラインのコードを除く。コードの中の例はリンクでも生 HTML でもない
const stripCode = (markdown: string) =>
  markdown
    .replace(/^[ \t]*(`{3,}|~{3,})[^\n]*\n[\s\S]*?^[ \t]*\1[ \t]*$/gm, '')
    .replace(/(`+)[\s\S]*?\1/g, '')

const startTags = (html: string) => html.match(/<[a-zA-Z][^>]*>/g) ?? []

describe.skipIf(!existsSync('src/content/posts'))('src/content の本文', () => {
  const { posts, terms } = load('src/content')
  const articles = posts.map(({ dir, file, frontmatter, body }) => ({
    name: `${dir}/${file}`,
    frontmatter,
    body: stripCode(body),
  }))

  test('/ で始まるリンクが、すべて実在のページを指す', () => {
    const pages = new Set(
      sitePaths(valid(posts), {
        tips: termListSchema.parse(terms.tips),
        clips: termListSchema.parse(terms.clips),
        labs: termListSchema.parse(terms.labs),
      }).map((path) => decodeURIComponent(path)),
    )
    const links = articles.flatMap(({ name, body }) =>
      [
        ...body.matchAll(/\]\(\s*<?(\/[^)\s>]*)/g),
        ...body.matchAll(/<a\s[^>]*?href="(\/[^"]*)"/gi),
      ].map(([, href]) => ({ name, href })),
    )
    // 0 件で通ってしまわないように（04 の 4 章で 14 か所）
    expect(links.length).toBeGreaterThan(0)
    const broken = links.filter(
      ({ href }) => !pages.has(decodeURIComponent(href.replace(/#.*$/, ''))),
    )
    expect(broken).toEqual([])
  })

  test('旧ドメインへのリンクが、本文のリンク先と clipUrl / demoUrl にない', () => {
    const found = articles.flatMap(({ name, frontmatter, body }) => {
      const targets = [
        frontmatter.clipUrl,
        frontmatter.demoUrl,
        ...[...body.matchAll(/\]\(\s*<?([^)\s>]+)/g)].map((m) => m[1]),
        ...startTags(body).flatMap((tag) =>
          [...tag.matchAll(/\s(?:href|src)="([^"]*)"/g)].map((m) => m[1]),
        ),
      ]
      return targets
        .filter((url) => String(url ?? '').includes('webmanab-html.com'))
        .map((url) => `${name}: ${url}`)
    })
    expect(found).toEqual([])
  })

  test('コードの外に <script>、on* 属性、javascript: がない', () => {
    const found = articles.flatMap(({ name, body }) => [
      ...(/<script[\s>]/i.test(body) ? [`${name}: <script>`] : []),
      ...startTags(body)
        .filter((tag) => /\son\w+\s*=/i.test(tag))
        .map((tag) => `${name}: ${tag}`),
      ...(/javascript:/i.test(body) ? [`${name}: javascript:`] : []),
    ])
    expect(found).toEqual([])
  })

  test('iframe は jsfiddle だけで 60 個', () => {
    const srcs = articles.flatMap(({ body }) =>
      [...body.matchAll(/<iframe\s[^>]*?src="([^"]*)"/gi)].map((m) => m[1]),
    )
    expect(srcs).toHaveLength(60)
    expect(
      srcs.filter((src) => !/^(https?:)?\/\/jsfiddle\.net\//.test(src)),
    ).toEqual([])
  })

  test('<style> があるのは tip/html5-global と tip/transition だけ', () => {
    expect(
      articles
        .filter(({ body }) => /<style[\s>]/i.test(body))
        .map(({ name }) => name),
    ).toEqual(['tip/html5-global.md', 'tip/transition.md'])
  })

  // 空行があると Markdown の HTML ブロックがそこで切れて、残りが段落として描画される（03 の 2.3）
  test('生 HTML のブロックの中に空行がない', () => {
    const found: string[] = []
    for (const { name, body } of articles) {
      const lines = body.split('\n')
      for (let i = 0; i < lines.length; i++) {
        const tag = lines[i].match(/^<(dl|p|style|figure|div|table)[\s>]/i)?.[1]
        if (!tag) continue
        for (let j = i; j < lines.length; j++) {
          if (lines[j].includes(`</${tag}>`)) {
            i = j
            break
          }
          if (lines[j].trim() === '') {
            found.push(`${name}: ${lines[i]}`)
            break
          }
        }
      }
    }
    expect(found).toEqual([])
  })
})
