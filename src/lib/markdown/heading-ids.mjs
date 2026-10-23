// 旧 EntryContent.vue の createToc と同じ id を振る。h2 は a0, a1, …、h3 は a{h2 の番号}{h3 の番号}。
// 目次は render() の headings（このプラグインの id が入る）から作る
import { defineHastPlugin } from 'satteri'

// Sätteri は関数のプラグインを文書ごとに呼ぶので、数え直しが記事ごとにリセットされる
export const headingIdsPlugin = () => {
  let h2 = -1
  let h3 = 0
  return defineHastPlugin({
    name: 'webmanab-heading-ids',
    element: {
      filter: ['h2', 'h3'],
      visit(node, ctx) {
        if (node.tagName === 'h2') {
          h2 += 1
          h3 = 0
          ctx.setProperty(node, 'id', `a${h2}`)
        } else if (h2 >= 0) {
          // 最初の h2 より前の h3 は飛ばす（旧実装はここで例外になり、以降の id 付けが止まっていた）
          ctx.setProperty(node, 'id', `a${h2}${h3}`)
          h3 += 1
        }
      },
    },
  })
}
