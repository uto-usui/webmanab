import { describe, expect, test } from 'vitest'
import { classify, extractLinks } from '../../scripts/check-links.ts'

describe('extractLinks', () => {
  const markdown = [
    '---',
    'id: 1',
    'clipUrl: "https://example.com/clip"',
    'demoUrl: //jsfiddle.net/u/abc/',
    '---',
    '',
    '[外](http://example.org/a#section) と [内](/tip/foo/) と <https://auto.example/>',
    '',
    '<p><iframe src="//jsfiddle.net/u/abc/embedded/" height="450"></iframe></p>',
    '<dl><dd><a href="https://html.example/?a=1&amp;b=2">x</a></dd></dl>',
    '',
    '`[コード](https://inline-code.example/)`',
    '',
    '```html',
    '<a href="https://fenced.example/">x</a>',
    '```',
  ].join('\n')

  test('frontmatter、Markdown のリンク、生 HTML から取り出し、コードの中は除く', () => {
    expect(extractLinks(markdown)).toEqual([
      { field: 'clipUrl', url: 'https://example.com/clip' },
      { field: 'demoUrl', url: 'https://jsfiddle.net/u/abc/' },
      { field: 'link', url: 'http://example.org/a' },
      { field: 'link', url: 'https://auto.example/' },
      { field: 'link', url: 'https://html.example/?a=1&b=2' },
      { field: 'iframe', url: 'https://jsfiddle.net/u/abc/embedded/' },
    ])
  })
})

describe('classify', () => {
  const url = 'https://www.example.com/a'

  test.each([
    [{ status: 200, url }, 'ok'],
    [{ status: 200, url: 'https://example.com/a' }, 'ok'],
    [{ status: 200, url: 'https://parked.example/' }, 'redirected'],
    [{ status: 404, url }, 'broken'],
    [{ status: 503, url }, 'broken'],
    [{ status: 403, url }, 'unverifiable'],
    [{ status: 429, url }, 'unverifiable'],
    [{ error: 'fetch failed', code: 'ENOTFOUND' }, 'broken'],
    [{ error: 'timeout', code: 'TIMEOUT' }, 'unverifiable'],
    [{ error: 'fetch failed', code: 'ECONNRESET' }, 'unverifiable'],
  ] as const)('%o → %s', (res, verdict) => {
    expect(classify(url, res).verdict).toBe(verdict)
  })
})
