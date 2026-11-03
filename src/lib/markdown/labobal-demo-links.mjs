// 本文の labobal.dev の iframe の下に、単体のページと GitHub のコードへのリンクを足す。
// jsfiddle の埋め込みにあったコードのタブの代わり。記事は書き換えず、描画で全記事に効かせる
import { URL } from 'node:url'
import { defineHastPlugin } from 'satteri'

const ORIGIN = 'https://labobal.dev'
// リポジトリ名は laboobal-dev で、ドメインの labobal と綴りが違う
const CODE_BASE =
  'https://github.com/uto-usui/laboobal-dev/tree/master/src/demos'

/** `https://labobal.dev/<slug>/` なら slug を返す。それ以外は undefined */
export const labobalSlug = (src) => {
  if (typeof src !== 'string' || src === '') return undefined
  let url
  try {
    // 本文の src は //jsfiddle.net/… のようにスキームなしのこともある
    url = new URL(src, 'https://localhost/')
  } catch {
    return undefined
  }
  if (url.origin !== ORIGIN) return undefined
  return /^\/([a-z0-9-]+)\/?$/.exec(url.pathname)?.[1]
}

export const labobalPageUrl = (slug) => `${ORIGIN}/${slug}/`
export const labobalCodeUrl = (slug) => `${CODE_BASE}/${slug}/`

const isBlank = (child) =>
  child.type === 'comment' ||
  (child.type === 'text' && child.value.trim() === '')

/** 中身がリンク 1 つだけで、その行き先が同じデモのページの段落か */
const isPageLinkOnly = (node, slug) => {
  if (node?.type !== 'element' || node.tagName !== 'p') return false
  const rest = node.children.filter((c) => !isBlank(c))
  return (
    rest.length === 1 &&
    rest[0].type === 'element' &&
    rest[0].tagName === 'a' &&
    labobalSlug(rest[0].properties?.href) === slug
  )
}

const link = (href, text) => ({
  type: 'element',
  tagName: 'a',
  properties: { href },
  children: [{ type: 'text', value: text }],
})

export const labobalDemoLinksPlugin = defineHastPlugin({
  name: 'webmanab-labobal-demo-links',
  element: {
    filter: ['iframe'],
    visit(node, ctx) {
      const slug = labobalSlug(node.properties?.src)
      if (!slug) return
      const { title, loading } = node.properties
      // 1 本の記事に WebGL のデモがいくつもあると、描画のコンテキストを同時にいくつも作ってしまう
      if (!loading) ctx.setProperty(node, 'loading', 'lazy')
      if (typeof title !== 'string' || title.trim() === '')
        ctx.setProperty(node, 'title', `labobal.dev のデモ（${slug}）`)

      // 埋め込みは <p><iframe></p> で書く決まり。段落の中には段落を置けないので、段落の後ろに置く
      const parent = ctx.parent(node)
      const anchor =
        parent?.type === 'element' && parent.tagName === 'p' ? parent : node
      // 原稿で手で書いた「[別のタブで開く](同じ URL)」の段落が直後にあれば、出さずにこちらに置き換える
      const siblings = ctx.parent(anchor)?.children ?? []
      const next = siblings
        .slice((ctx.indexOf(anchor) ?? siblings.length) + 1)
        .find((c) => !isBlank(c))
      if (isPageLinkOnly(next, slug)) ctx.removeNode(next)

      ctx.insertAfter(anchor, {
        type: 'element',
        tagName: 'p',
        properties: { className: ['entry-content__demo-links'] },
        children: [
          link(labobalPageUrl(slug), '別のタブで開く'),
          link(labobalCodeUrl(slug), 'GitHub でコードを見る'),
        ],
      })
    },
  },
})
