// 本文の iframe（jsfiddle のデモ）には title がない（A11Y-07）。Markdown は触らず描画で足す
import { URL } from 'node:url'
import { defineHastPlugin } from 'satteri'

const hostOf = (src) => {
  if (!src) return ''
  try {
    // src は //jsfiddle.net/… のようにスキームなしで書かれている
    return new URL(src, 'https://localhost/').hostname
  } catch {
    return ''
  }
}

export const iframeTitle = (src) => {
  const host = hostOf(src)
  if (host === 'jsfiddle.net') return 'jsfiddle のデモ'
  return host ? `${host} の埋め込み` : '埋め込みコンテンツ'
}

export const iframeTitlePlugin = defineHastPlugin({
  name: 'webmanab-iframe-title',
  element: {
    filter: ['iframe'],
    visit(node, ctx) {
      const { title, src } = node.properties ?? {}
      if (typeof title === 'string' && title.trim() !== '') return
      ctx.setProperty(
        node,
        'title',
        iframeTitle(typeof src === 'string' ? src : ''),
      )
    },
  },
})
