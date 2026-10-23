import { describe, expect, it } from 'vitest'
import {
  htmlToMarkdown,
  leftFlanking,
  rightFlanking,
} from '../../../scripts/export-markdown/convert.ts'

const md = (html: string, options?: Parameters<typeof htmlToMarkdown>[1]) =>
  htmlToMarkdown(html, options).md
const kinds = (html: string) => htmlToMarkdown(html).notes.map((n) => n.kind)

describe('コードブロック', () => {
  it('info string に元の class をそのまま書き、先頭の <br /> と末尾の改行を残す', () => {
    expect(
      md('<pre><code class="bath"><br />npx create-nuxt-app\n\n</code></pre>'),
    ).toBe('```bath\n\nnpx create-nuxt-app\n\n\n```\n')
  })

  it('class がなければ info string は空。改行で終わらない中身もそのまま', () => {
    expect(md('<pre><code>a {\n}</code></pre>')).toBe('```\na {\n}\n```\n')
  })

  it('中身に ``` があるとフェンスを長くする', () => {
    expect(md('<pre><code>```js\n```</code></pre>')).toBe(
      '````\n```js\n```\n````\n',
    )
  })

  it('コード中の実体参照は文字にする', () => {
    expect(
      md('<pre><code class="html">&lt;div&gt; &amp;amp;#9312;</code></pre>'),
    ).toBe('```html\n<div> &amp;#9312;\n```\n')
  })

  it('エスケープ漏れでタグになっていたものを文字に戻す', () => {
    const { md: out, notes } = htmlToMarkdown(
      '<pre><code>a<h1 class="x">t</h1></code></pre>',
    )
    expect(out).toBe('```\na<h1 class="x">t</h1>\n```\n')
    expect(notes).toEqual([{ kind: 'code-raw-element', tag: 'h1' }])
  })

  it('二重にエスケープされた絵文字を戻す', () => {
    expect(md('<pre><code>&amp;#x1f363;</code></pre>')).toBe('```\n🍣\n```\n')
  })
})

describe('和文の強調', () => {
  it('区切り記号が成立しない強調は <strong> で書く', () => {
    const html =
      '<p>それをif文で処理すると<strong>「要素があるかどうか」</strong>を判別する</p>'
    expect(md(html)).toBe(
      'それをif文で処理すると<strong>「要素があるかどうか」</strong>を判別する\n',
    )
    expect(kinds(html)).toEqual(['attention-as-html'])
  })

  it('成立する強調は ** のまま', () => {
    expect(md('<p>これは<strong>強調</strong>です</p>')).toBe(
      'これは**強調**です\n',
    )
    expect(md('<p>a <em>b</em> c</p>')).toBe('a *b* c\n')
  })

  it('flanking の判定は micromark と同じ', () => {
    // 和字の後ろで約物から始まる強調は開けない
    expect(leftFlanking('と', '「')).toBe(false)
    expect(leftFlanking(' ', '「')).toBe(true)
    expect(rightFlanking('」', 'を')).toBe(false)
    expect(rightFlanking('」', undefined)).toBe(true)
  })
})

describe('段落とインライン', () => {
  it('段落中の <br> はバックスラッシュ改行にする', () => {
    expect(md('<p>a<br />\nb</p>')).toBe('a\\\nb\n')
  })

  it('画像だけの段落は消し、alt を記録に残す', () => {
    const { md: out, notes } = htmlToMarkdown(
      '<p>a</p>\n<p><img src="x.png" alt="図" /></p>\n<p>b</p>',
    )
    expect(out).toBe('a\n\nb\n')
    expect(notes).toEqual([{ kind: 'img-dropped', alt: '図', src: 'x.png' }])
  })

  it('属性のない span は外す', () => {
    expect(md('<h4><span>見出し</span></h4>')).toBe('#### 見出し\n')
  })

  it('target と rel を落とし、記録に残す', () => {
    const { md: out, notes } = htmlToMarkdown(
      '<p><a href="https://example.com/" target="_blank" rel="noopener">x</a></p>',
    )
    expect(out).toBe('[x](https://example.com/)\n')
    expect(notes).toEqual([
      { kind: 'target-dropped', href: 'https://example.com/' },
    ])
  })

  it('地の文に続く日本語を URL に含めないよう、URL の部分だけリンクにする', () => {
    expect(md('<p>https://example.com/a?b=c&amp;d=e に「X」と入れる</p>')).toBe(
      '<https://example.com/a?b=c&d=e> に「X」と入れる\n',
    )
    expect(md('<p>https://example.com/a?b=c&amp;d=eに「X」と入れる</p>')).toBe(
      '<https://example.com/a?b=c&d=e>に「X」と入れる\n',
    )
  })

  it('地の文の HTML コメントを文字に戻す', () => {
    expect(md('<p>「<!-- x -->」で囲む</p>')).toBe('「\\<!-- x -->」で囲む\n')
  })
})

describe('旧ドメインのリンク', () => {
  const knownPaths = new Set(['/tip/svg-height/'])

  it('残っている記事へのリンクはルート相対にする', () => {
    const { md: out, notes } = htmlToMarkdown(
      '<p><a href="http://webmanab-html.com/tip/svg-height">x</a></p>',
      {
        knownPaths,
      },
    )
    expect(out).toBe('[x](/tip/svg-height/)\n')
    expect(notes).toEqual([
      {
        kind: 'internal-link-rewritten',
        from: 'http://webmanab-html.com/tip/svg-height',
        to: '/tip/svg-height/',
      },
    ])
  })

  it('行き先のないページへのリンクは外して文字だけ残す', () => {
    expect(
      md(
        '<p><a href="https://webmanab-html.com/reference/shape/">shape</a> を見る</p>',
        { knownPaths },
      ),
    ).toBe('shape を見る\n')
  })

  it('fixes: false なら書き換えない', () => {
    expect(
      md('<p><a href="https://webmanab-html.com/tip/svg-height/">x</a></p>', {
        knownPaths,
        fixes: false,
      }),
    ).toBe('[x](https://webmanab-html.com/tip/svg-height/)\n')
  })
})

describe('HTML のまま残すもの', () => {
  it('dl は名前付き参照の HTML ブロックにし、中に空行を入れない', () => {
    expect(
      md(
        '<dl>\n<dt>a &amp; b</dt>\n\n<dd><code>x</code></dd>\n</dl>\n<p>c</p>',
      ),
    ).toBe('<dl><dt>a &amp; b</dt><dd><code>x</code></dd></dl>\n\nc\n')
  })

  it('iframe を含む段落は段落ごと残す', () => {
    const html =
      '<p><iframe src="https://example.com/embed" width="100%"></iframe></p>'
    expect(md(html)).toBe(`${html}\n`)
    expect(kinds(html)).toEqual(['raw-p'])
  })

  it('デモ用の style を包む段落は外す', () => {
    expect(md('<p><style>.a{color:red}</style></p>')).toBe(
      '<style>.a{color:red}</style>\n',
    )
  })
})

describe('リスト', () => {
  it('元の li に p がなければ詰めたリストにする', () => {
    expect(
      md('<ol>\n<li>a\n<ol>\n<li>b</li>\n</ol>\n</li>\n<li>c</li>\n</ol>'),
    ).toBe('1. a\n   1. b\n2. c\n')
  })

  it('元の li に p があればゆるいリストにする', () => {
    expect(md('<ul>\n<li><p>a</p></li>\n<li><p>b</p></li>\n</ul>')).toBe(
      '- a\n\n- b\n',
    )
  })
})
