// 外部リンクは新しいタブで開く（README 3 章の 5）。Markdown には target を書かない決まり
import { defineHastPlugin } from 'satteri'
import { NEW_TAB_ID } from '../new-tab.mjs'

// サイト内のリンクはルート相対で書く決まりなので、スキームかホストを持つ http(s) のリンクを外部とみなす
const EXTERNAL = /^(?:https?:)?\/\//i

const tokens = (value) =>
  Array.isArray(value)
    ? value.map(String)
    : typeof value === 'string'
      ? value.split(/\s+/).filter(Boolean)
      : []

export const externalLinksPlugin = defineHastPlugin({
  name: 'webmanab-external-links',
  element: {
    filter: ['a'],
    visit(node, ctx) {
      const href = node.properties?.href
      if (typeof href !== 'string' || !EXTERNAL.test(href)) return
      ctx.setProperty(node, 'target', '_blank')
      const rel = tokens(node.properties.rel)
      if (!rel.includes('noopener'))
        ctx.setProperty(node, 'rel', [...rel, 'noopener'])
      ctx.setProperty(node, 'ariaDescribedBy', NEW_TAB_ID)
    },
  },
})
