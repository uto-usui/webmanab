import { readFileSync } from 'node:fs'
import { markdownToHtml } from 'satteri'
import { describe, expect, test } from 'vitest'
import { iframeTitle } from '../../src/lib/markdown/iframe-title.mjs'
import { hastPlugins, markdownFeatures } from '../../src/lib/markdown/index.mjs'

const render = (md: string) =>
  markdownToHtml(md, { features: markdownFeatures, hastPlugins }).html

const body = (fixture: string) =>
  readFileSync(`test/fixtures/posts/${fixture}.md`, 'utf8').replace(
    /^---\n[\s\S]*?\n---\n/,
    '',
  )

describe('コードブロック', () => {
  test('info string を元の class に戻し、旧サイトと同じ自動判定で色を付ける', () => {
    const html = render(
      [
        '```bath\n\ncd ./x\nyarn run dev\n\n\n```',
        '```bath\n\nyarn add @nuxtjs/style-resources\n\n\n```',
      ].join('\n\n'),
    )
    expect(html).toContain(
      '<pre class="hljs bash"><code class="bath">\n<span class="hljs-built_in">cd</span> ./x\nyarn run dev\n\n</code></pre>',
    )
    expect(html).toContain(
      '<pre class="hljs scss"><code class="bath">\nyarn add <span class="hljs-keyword">@nuxtjs</span>/style-resources\n\n</code></pre>',
    )
  })

  test('info string がなければ code に class を付けない。判定できなければ pre は hljs だけ', () => {
    expect(render('```\nnpx create-nuxt-app your-title\n\n```')).toBe(
      '<pre class="hljs"><code>npx create-nuxt-app your-title\n</code></pre>\n',
    )
  })

  test('info string の大文字小文字はそのまま', () => {
    expect(render('```HTML\n<p>a</p>\n```')).toMatch(
      /^<pre class="hljs xml"><code class="HTML">/,
    )
  })

  test('元の中身が改行で終わらないブロック（tip/divide-retina）に改行を足さない', () => {
    const html = render(body('tip/divide-retina'))
    const codes = [
      ...html.matchAll(/<code[^>]*>([\s\S]*?)<\/code><\/pre>/g),
    ].map((m) => m[1])
    expect(codes.length).toBeGreaterThan(0)
    expect(codes.at(-1)).toMatch(/[^\n]$/)
  })

  test('コードの中の記号はエスケープしたまま', () => {
    const html = render('```\n<h1 class="h1-old">title01</h1>\n```')
    expect(html).not.toContain('<h1')
    expect(html).toContain('title01')
  })
})

describe('見出しの id', () => {
  test('h2 は a0, a1、h3 は a{h2}{h3}', () => {
    expect(render('## A\n\n### B\n\n### C\n\n## D\n\n### E\n\n#### F\n')).toBe(
      [
        '<h2 id="a0">A</h2>',
        '<h3 id="a00">B</h3>',
        '<h3 id="a01">C</h3>',
        '<h2 id="a1">D</h2>',
        '<h3 id="a10">E</h3>',
        '<h4>F</h4>',
        '',
      ].join('\n'),
    )
  })

  test('最初の h2 より前の h3 は飛ばす（tip/os-x-el-capitan-appear-invisible-files）', () => {
    expect(render('### B\n\n## A\n\n### C\n')).toBe(
      '<h3>B</h3>\n<h2 id="a0">A</h2>\n<h3 id="a00">C</h3>\n',
    )
    // h2 がなく h3 だけの記事。id はどれにも付かない（Astro の描画では Astro 側の id が付く）
    const html = render(body('tip/os-x-el-capitan-appear-invisible-files'))
    expect(html).toContain('<h3>不可視ファイルを表示する</h3>')
    expect(html).not.toContain(' id=')
  })

  test('数え直しは文書ごとにリセットされる', () => {
    render('## A\n\n## B\n')
    expect(render('## C\n')).toBe('<h2 id="a0">C</h2>\n')
  })
})

describe('外部リンク', () => {
  test('http(s) とスキームなしのリンクは新しいタブで開き、rel="noopener" を付ける', () => {
    const html = render(
      '[a](https://example.com/) [b](http://example.com/) <https://example.org/x> www.example.net',
    )
    expect(html.match(/target="_blank" rel="noopener"/g)).toHaveLength(4)
    expect(render('<p><a href="//example.com/">c</a></p>')).toContain(
      '<a href="//example.com/" target="_blank" rel="noopener">c</a>',
    )
  })

  test('ルート相対・アンカー・相対・mailto は触らない', () => {
    const html = render(
      '[a](/tip/x/) [b](#a0) [c](kid.html) [d](mailto:a@example.com)',
    )
    expect(html).not.toContain('target=')
    expect(html).not.toContain('rel=')
  })

  test('生 HTML の中のリンクにも付け、既存の rel は残す', () => {
    const html = render(
      '<dl>\n<dt>x</dt>\n<dd><a href="https://wordpress.org/" rel="nofollow">wp</a></dd>\n</dl>',
    )
    expect(html).toContain(
      '<a href="https://wordpress.org/" rel="nofollow noopener" target="_blank">wp</a>',
    )
  })
})

describe('iframe', () => {
  test('生 HTML の iframe に title を足す。ほかの属性はそのまま', () => {
    const html = render(
      '<p><iframe width="100%" height="300" src="//jsfiddle.net/yutousui/d8knz11c/embedded/" allowfullscreen="allowfullscreen" frameborder="0"></iframe></p>',
    )
    expect(html).toContain('title="jsfiddle のデモ"')
    expect(html).toContain('src="//jsfiddle.net/yutousui/d8knz11c/embedded/"')
    expect(html).toContain('height="300"')
  })

  test('title がすでにあれば変えない', () => {
    expect(
      render('<p><iframe src="//jsfiddle.net/a/" title="デモ"></iframe></p>'),
    ).toContain('title="デモ"')
  })

  test('コードブロックの中の iframe は文字のまま', () => {
    expect(
      render('```\n<iframe src="//www.youtube.com/embed/exID"></iframe>\n```'),
    ).not.toContain('title=')
  })

  test('jsfiddle 以外はホスト名から文言を作る', () => {
    expect(iframeTitle('https://codepen.io/a/embed/b')).toBe(
      'codepen.io の埋め込み',
    )
    expect(iframeTitle('')).toBe('埋め込みコンテンツ')
  })
})

test('引用符・-- ・... を変えない（smartPunctuation を切っている）', () => {
  expect(render('"SSR" -- や...')).toBe('<p>"SSR" -- や...</p>\n')
})
