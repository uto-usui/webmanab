import { describe, expect, it } from 'vitest'
import { htmlToMarkdown } from '../../../scripts/export-markdown/convert.ts'
import {
  compare,
  metrics,
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

const roundtrip = (md: string) =>
  compare(
    metrics(parseHtml(HTML), 'original'),
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
