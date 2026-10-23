// 旧サイトはブラウザで highlight.js 10.1.1 の highlightBlock(pre) を全ての <pre> に実行していた。
// 言語は <code class> を見ずに自動判定する。同じ結果を出すため、ビルド時に同じ版を DOM 実装の上で動かす。
// 10.7 / 11 系は自動判定の結果が 100〜165 ブロック変わるので上げない（03 の 2.4）
import { createRequire } from 'node:module'
import { parseHTML } from 'linkedom'
import { defineHastPlugin } from 'satteri'

const require = createRequire(import.meta.url)
const hljs = require('hljs10/lib/core')
// 旧サイトが登録していた 7 言語。自動判定の候補になるので増やさない
for (const name of [
  'javascript',
  'scss',
  'typescript',
  'xml',
  'bash',
  'php',
  'yaml',
]) {
  hljs.registerLanguage(name, require(`hljs10/lib/languages/${name}`))
}

const escapeHtml = (s) =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

const classList = (value) =>
  Array.isArray(value)
    ? value.map(String)
    : typeof value === 'string'
      ? value.split(/\s+/)
      : []

export const hljsPlugin = defineHastPlugin({
  name: 'webmanab-hljs',
  element: {
    filter: ['pre'],
    visit(node, ctx) {
      const code = node.children.find(
        (c) => c.type === 'element' && c.tagName === 'code',
      )
      if (!code) return
      // fenced code の info string は language-<元の class> になるので、旧サイトの class（bath なども）に戻す
      const lang = classList(code.properties?.className).find((c) =>
        c.startsWith('language-'),
      )
      const cls = lang
        ? ` class="${escapeHtml(lang.slice('language-'.length))}"`
        : ''
      // fenced code の中身は必ず改行で終わるので、エクスポーターは元の中身の後ろに改行を 1 つ足して書く。その 1 つを外す
      const text = ctx.textContent(code).replace(/\n$/, '')
      // 旧本文の先頭の <br /> は改行になっている。旧サイトでは <br> が判定の入力（textContent）に入らなかったので、
      // 先頭の改行は外して判定し、あとで戻す。改行のまま判定すると 8 ブロックで結果が変わる
      const [, head, body] = text.match(/^(\n*)([\s\S]*)$/)
      const { document } = parseHTML(
        `<!doctype html><html><body><div class="entry-content__inner"><pre><code${cls}>${escapeHtml(body)}</code></pre></div></body></html>`,
      )
      const pre = document.querySelector('pre')
      // highlightBlock はグローバルの document.createElement を呼ぶ
      globalThis.document = document
      try {
        hljs.highlightBlock(pre)
      } finally {
        delete globalThis.document
      }
      pre.querySelector('code').prepend(head)
      ctx.replaceNode(node, { type: 'raw', value: pre.outerHTML })
    },
  },
})
