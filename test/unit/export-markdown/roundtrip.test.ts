import { describe, expect, it } from 'vitest'
import { htmlToMarkdown } from '../../../scripts/export-markdown/convert.ts'
import {
  compare,
  metrics,
  navTitleDiff,
  parseHtml,
  renderMarkdown,
  unexplained,
} from '../../../scripts/export-markdown/roundtrip.ts'

const HTML = [
  '<p>それをif文で処理すると<strong>「要素」</strong>を判別する。<strong>強調</strong>と<code>code</code></p>',
  '<h3>見出し</h3>',
  '<pre><code class="bath"><br />npm i\n  --save\n</code></pre>',
  '<ul>\n<li>a<br />\nb</li>\n<li><a href="https://example.com/a b">link</a></li>\n</ul>',
  '<dl>\n<dt>t</dt>\n<dd><code>x</code></dd>\n</dl>',
  '<p><img src="x.png" alt="" /></p>',
  '<p><iframe src="https://example.com/embed"></iframe></p>',
].join('\n')

// 対応表を渡さずに変換するので、画像は落ちる
const roundtrip = (md: string) =>
  compare(
    metrics(parseHtml(HTML), 'original', true),
    metrics(renderMarkdown(md), 'rendered'),
  )

describe('往復検証', () => {
  const { md, notes } = htmlToMarkdown(HTML)

  it('変換した Markdown は元の HTML と一致する', () => {
    expect(roundtrip(md)).toEqual([])
  })

  it('強調を壊すと検出する', () => {
    expect(roundtrip(md.replace('**', '*'))).toContain('strong')
  })

  it('コードの行末に空白を足すと検出する', () => {
    expect(roundtrip(md.replace('npm i', 'npm i '))).toContain('code-value')
  })

  it('言語の class が変わると検出する', () => {
    expect(roundtrip(md.replace('```bath', '```bash'))).toContain('code-lang')
  })

  it('バックスラッシュ改行を消すと検出する', () => {
    expect(roundtrip(md.replace('\\\n', '\n'))).toContain('br')
  })

  it('</code> と </pre> の間の改行を落とすと検出する', () => {
    const html = '<pre><code>a\n</code>\n</pre>'
    const a = metrics(parseHtml(html), 'original')
    const render = (md: string) =>
      compare(a, metrics(renderMarkdown(md), 'rendered'))
    expect(render(htmlToMarkdown(html).md)).toEqual([])
    expect(render('```\na\n\n```\n')).toContain('code-value')
  })

  it('U+3000 などを普通の空白に変えると検出する', () => {
    const html = '<p>上品な　ホバー</p>'
    const a = metrics(parseHtml(html), 'original')
    expect(
      compare(a, metrics(renderMarkdown('上品な　ホバー\n'), 'rendered')),
    ).toEqual([])
    expect(
      compare(a, metrics(renderMarkdown('上品な ホバー\n'), 'rendered')),
    ).toContain('text')
  })

  it('残した画像は alt まで比べる', () => {
    const html = '<p>a</p>\n<p><img src="x.png" alt="図" /></p>'
    const images = { 'x.png': '/images/uploads/x.png' }
    const a = metrics(parseHtml(html), 'original')
    const render = (md: string) =>
      compare(a, metrics(renderMarkdown(md), 'rendered'))
    expect(render(htmlToMarkdown(html, { images }).md)).toEqual([])
    expect(render('a\n\n![別](/images/uploads/x.png)\n')).toContain('dom')
    expect(render('a\n')).toContain('count-p')
  })

  it('意図して直したものだけを、記録の種類で説明できる差として扱う', () => {
    const fails = ['hrefs', 'dom', 'strong']
    expect(
      unexplained(fails, [
        { kind: 'internal-link-rewritten', from: 'a', to: 'b' },
      ]),
    ).toEqual(['strong'])
    expect(unexplained(fails, notes)).toEqual(fails)
  })
})

describe('navTitleDiff', () => {
  it('旧ナビとの違いが wptexturize と capital_P_dangit だけなら種類を返す', () => {
    expect(navTitleDiff('a', 'a')).toEqual([])
    expect(
      navTitleDiff(
        'Balsan, la Griffe de l’uniforme',
        "Balsan, la Griffe de l'uniforme",
      ),
    ).toEqual(['quote'])
    expect(
      navTitleDiff('WordPressの末尾の[…] – x', 'Wordpressの末尾の[...] - x'),
    ).toEqual(['dash', 'ellipsis', 'capital-p'])
  })

  it('それ以外の違いは null', () => {
    expect(navTitleDiff('ね\u202f—\u202fNT', 'ね — NT')).toBeNull()
    expect(navTitleDiff('a – b', 'a - c')).toBeNull()
  })
})
