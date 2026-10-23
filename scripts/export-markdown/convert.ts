// WordPress の本文 HTML を Markdown にする（04-markdown-exporter.md の 3. と 4.）
import type { Element, ElementContent, Root as HastRoot } from 'hast'
import type { Handle } from 'hast-util-to-mdast'
import type { Nodes as MdastNodes, Root as MdastRoot } from 'mdast'
import { defaultHandlers } from 'hast-util-to-mdast'
import { toHtml } from 'hast-util-to-html'
import { toText } from 'hast-util-to-text'
import { classifyCharacter } from 'micromark-util-classify-character'
import rehypeParse from 'rehype-parse'
import rehypeRemark from 'rehype-remark'
import remarkGfm from 'remark-gfm'
import remarkStringify from 'remark-stringify'
import { unified } from 'unified'
import { SKIP, visit } from 'unist-util-visit'
import { isBlank } from './whitespace.ts'

// 変換で落としたもの・書き方を変えたもの・意図して直したものの記録
export type Note =
  | { kind: 'img-dropped'; alt: string | null; src: string }
  | { kind: 'target-dropped'; href: string }
  | { kind: 'raw-p'; tags: string }
  | { kind: 'attention-as-html'; tag: 'strong' | 'em' }
  | { kind: 'comment-restored'; value: string }
  | { kind: 'code-raw-element'; tag: string }
  | { kind: 'code-emoji-restored'; ref: string }
  | { kind: 'bare-url-linked'; url: string }
  | { kind: 'internal-link-rewritten'; from: string; to: string }
  | { kind: 'dead-link-unwrapped'; from: string }
  | { kind: 'style-unwrapped' }

export interface ConvertOptions {
  // 旧ドメインのリンクをルート相対に書き換えてよい記事のパス（/tip/<slug>/ の形）
  knownPaths?: ReadonlySet<string>
  // false にすると 4. の「意図して直すもの」を全部止める。往復検証の対照実験用
  fixes?: boolean
}

// Markdown で書けるインライン要素。これ以外を含む段落は段落ごと HTML で残す
const PHRASING = new Set(['a', 'code', 'strong', 'em', 'b', 'i', 'br'])
const OLD_HOST = /^https?:\/\/(?:www\.)?webmanab-html\.com\//
const OLD_POST =
  /^https?:\/\/(?:www\.)?webmanab-html\.com(\/(?:tip|clip|lab)\/[^/?#]+)\/?$/

const isElement = (n: unknown): n is Element =>
  typeof n === 'object' && n !== null && (n as Element).type === 'element'
const isBlankText = (n: ElementContent) => n.type === 'text' && isBlank(n.value)
const str = (v: unknown) => (v == null ? '' : String(v))
const classList = (n: Element) =>
  Array.isArray(n.properties.className)
    ? n.properties.className.map(String)
    : []

// 生 HTML として残す部分は、&#x26; ではなく &amp; のような名前付き参照で書く
const rawHtml = (node: Element): MdastNodes => ({
  type: 'html',
  value: toHtml(node, { characterReferences: { useNamedReferences: true } }),
})

// pre > code の中身を、書き手が書いた文字列として取り出す。
// 先頭の空行（wpautop の <br /> や <code> 直後の改行）も末尾の改行も削らない。
// フェンス付きコードは描画で最後に改行が 1 つ付くので、その 1 つは描画側で外す
export function codeText(code: Element, notes: Note[], fixes = true): string {
  let s = ''
  for (const c of code.children) {
    if (c.type === 'text') s += c.value
    else if (isElement(c) && c.tagName === 'br') s += '\n'
    else if (!isElement(c)) continue
    else if (!fixes) s += toText(c, { whitespace: 'pre' })
    else {
      // エスケープ漏れでタグとして解釈されていたもの（tip/frontnote の <h1>）は元の文字列に戻す
      s += toHtml(c)
      notes.push({ kind: 'code-raw-element', tag: c.tagName })
    }
  }
  if (!fixes) return s
  // WordPress が絵文字を &#x1f363; にしたあと、コード内でさらにエスケープしていたので絵文字に戻す
  return s.replace(/&#x(1f[0-9a-f]{3});/gi, (ref, hex: string) => {
    notes.push({ kind: 'code-emoji-restored', ref })
    return String.fromCodePoint(parseInt(hex, 16))
  })
}

// 地の文の URL は GFM の自動リンクになり、続く日本語まで URL に取り込まれる（tip/easy-instagram-feed）。
// 境界を正しくするために、URL の部分だけを明示的なリンクにする
export function linkBareUrls(node: Element, notes: Note[]): void {
  node.children = node.children.flatMap((c): ElementContent[] => {
    if (c.type !== 'text') return [c]
    const parts: ElementContent[] = []
    let last = 0
    for (const m of c.value.matchAll(/https?:\/\/[\w-]+(?:\.[\w-]+)+[!-~]*/g)) {
      parts.push({ type: 'text', value: c.value.slice(last, m.index) })
      parts.push({
        type: 'element',
        tagName: 'a',
        properties: { href: m[0] },
        children: [{ type: 'text', value: m[0] }],
      })
      notes.push({ kind: 'bare-url-linked', url: m[0] })
      last = m.index + m[0].length
    }
    if (!parts.length) return [c]
    parts.push({ type: 'text', value: c.value.slice(last) })
    return parts
  })
}

// hast の段階で、Markdown に移す前の手直しをする
function prepare(
  notes: Note[],
  { knownPaths = new Set(), fixes = true }: ConvertOptions,
) {
  return (tree: HastRoot) => {
    visit(tree, (node, index, parent) => {
      if (!parent || index === undefined) return
      if (node.type === 'comment') {
        if (!fixes) {
          parent.children.splice(index, 1)
          return index
        }
        // 地の文に書いた「<!--」がコメントとして解釈され、文字が消えていたので戻す（tip/html5-basic）
        parent.children[index] = { type: 'text', value: `<!--${node.value}-->` }
        notes.push({ kind: 'comment-restored', value: node.value })
        return
      }
      if (node.type !== 'element') return
      if (node.tagName === 'pre') return SKIP
      if (node.tagName === 'img') {
        notes.push({
          kind: 'img-dropped',
          alt: node.properties.alt == null ? null : str(node.properties.alt),
          src: str(node.properties.src),
        })
        parent.children.splice(index, 1)
        return [SKIP, index]
      }
      if (node.tagName === 'span' && !Object.keys(node.properties).length) {
        parent.children.splice(index, 1, ...node.children)
        return [SKIP, index]
      }
      if (fixes && (node.tagName === 'p' || node.tagName === 'li'))
        linkBareUrls(node, notes)
      if (node.tagName !== 'a') return
      const href = str(node.properties.href)
      if (fixes && OLD_HOST.test(href)) {
        // 旧ドメインは失効して駐車ページになっているので、残っている記事へのリンクはルート相対にする
        const to = `${href.match(OLD_POST)?.[1]}/`
        if (knownPaths.has(to)) {
          node.properties.href = to
          notes.push({ kind: 'internal-link-rewritten', from: href, to })
        } else {
          // 記事データにないページ（/reference/shape/）は行き先がないので、リンクを外して文字だけ残す
          parent.children.splice(index, 1, ...node.children)
          notes.push({ kind: 'dead-link-unwrapped', from: href })
          return [SKIP, index]
        }
      }
      // 外部リンクを新しいタブで開くかは描画側で決める
      if (node.properties.target) notes.push({ kind: 'target-dropped', href })
      delete node.properties.target
      delete node.properties.rel
      // fancybox-iframe は旧テーマのライトボックス用で、いまは意味がない
      const cls = classList(node).filter((c) => c !== 'fancybox-iframe')
      if (cls.length) node.properties.className = cls
      else delete node.properties.className
    })
    // 画像を抜いて空になった段落を消す
    visit(tree, 'element', (node, index, parent) => {
      if (
        parent &&
        index !== undefined &&
        node.tagName === 'p' &&
        node.children.every(isBlankText)
      ) {
        parent.children.splice(index, 1)
        return [SKIP, index]
      }
    })
  }
}

function handlers(notes: Note[], fixes: boolean): Record<string, Handle> {
  const raw: Handle = (_state, node) => rawHtml(node)
  return {
    pre(state, node) {
      const code = node.children.find(
        (c) => isElement(c) && c.tagName === 'code',
      ) as Element | undefined
      // info string には元の class をそのまま書く（bath、CSS なども直さない）。描画側で同じ class に戻す
      const lang = code ? classList(code).join(' ') : ''
      // </code> と </pre> の間の改行（115 ブロック）は、旧サイトではコードの最後の空行として見えていたので中身に含める
      const after = code
        ? node.children
            .slice(node.children.indexOf(code) + 1)
            .map((c) => (c.type === 'text' ? c.value : ''))
            .join('')
        : ''
      const result: MdastNodes = {
        type: 'code',
        lang: lang || null,
        meta: null,
        value: codeText(code ?? node, notes, fixes) + after,
      }
      state.patch(node, result)
      return result
    },
    p(state, node) {
      const kids = node.children.filter((c) => !isBlankText(c))
      // デモ用の <style>（tip/html5-global、tip/transition）。p で包む意味はないので外す
      if (
        fixes &&
        kids.length &&
        kids.every((c) => isElement(c) && c.tagName === 'style')
      ) {
        notes.push({ kind: 'style-unwrapped' })
        return (kids as Element[]).map(rawHtml)
      }
      let keepHtml = false
      visit(node, 'element', (n) => {
        if (n !== node && !PHRASING.has(n.tagName)) keepHtml = true
        // デモが class で CSS を当てているリンク（a.ex01）
        if (n.tagName === 'a' && classList(n).length) keepHtml = true
      })
      if (!keepHtml) return defaultHandlers.p(state, node)
      notes.push({
        kind: 'raw-p',
        tags: kids.map((c) => (isElement(c) ? c.tagName : '#text')).join(' '),
      })
      return rawHtml(node)
    },
    li(state, node) {
      // 既定では入れ子の ol を持つ li があると全項目が <p> で包まれるので、元に p があるときだけゆるいリストにする
      const result = defaultHandlers.li(state, node)
      result.spread = node.children.some(
        (c) => isElement(c) && c.tagName === 'p',
      )
      return result
    },
    dl: raw,
    figure: raw,
    div: raw,
    iframe: raw,
    style: raw,
    input: raw,
  }
}

// 和文で **「強調」**を のように区切り記号が約物と和字に挟まれると、CommonMark では強調が成立しない。
// remark-stringify は隣の文字を &#x3068; のような参照にして逃がすが、人が読みにくいので
// 成立しないものだけインラインの <strong> / <em> で書く
type Ch = string | undefined
function edgeChar(n: MdastNodes, end: 'first' | 'last'): Ch {
  const first = end === 'first'
  switch (n.type) {
    case 'text':
      return first ? n.value[0] : n.value.at(-1)
    case 'inlineCode':
      return '`'
    case 'link':
      return first ? '[' : ')'
    case 'break':
      return '\n'
    case 'html':
      return first ? '<' : '>'
  }
  const kids = 'children' in n ? (n.children as MdastNodes[]) : []
  return kids.length
    ? edgeChar(first ? kids[0] : kids[kids.length - 1], end)
    : '*'
}
// micromark と同じ分類: 1 = 空白（行頭・行末を含む）、2 = 約物、undefined = それ以外
const charKind = (ch: Ch) =>
  ch === undefined ? 1 : classifyCharacter(ch.codePointAt(0)!)
export const leftFlanking = (before: Ch, after: Ch) =>
  charKind(after) !== 1 &&
  (charKind(after) !== 2 || charKind(before) !== undefined)
export const rightFlanking = (before: Ch, after: Ch) =>
  charKind(before) !== 1 &&
  (charKind(before) !== 2 || charKind(after) !== undefined)

function htmlAttention(notes: Note[]) {
  return (tree: MdastRoot) => {
    visit(tree, (node, index, parent) => {
      if (node.type !== 'strong' && node.type !== 'emphasis') return
      if (!parent || index === undefined || !node.children.length) return
      const siblings = parent.children as MdastNodes[]
      const before =
        index > 0 ? edgeChar(siblings[index - 1], 'last') : undefined
      const after =
        index < siblings.length - 1
          ? edgeChar(siblings[index + 1], 'first')
          : undefined
      const opens = leftFlanking(before, edgeChar(node, 'first'))
      const closes = rightFlanking(edgeChar(node, 'last'), after)
      if (opens && closes) return
      const tag = node.type === 'strong' ? 'strong' : 'em'
      notes.push({ kind: 'attention-as-html', tag })
      siblings.splice(
        index,
        1,
        { type: 'html', value: `<${tag}>` },
        ...node.children,
        { type: 'html', value: `</${tag}>` },
      )
      return index + node.children.length + 2
    })
  }
}

export function htmlToMarkdown(
  html: string,
  options: ConvertOptions = {},
): { md: string; notes: Note[] } {
  const fixes = options.fixes ?? true
  const notes: Note[] = []
  const processor = unified()
    .use(rehypeParse, { fragment: true })
    .use(() => prepare(notes, options))
    .use(rehypeRemark, { handlers: handlers(notes, fixes) })
    .use(remarkGfm)
    .use(() => htmlAttention(notes))
    .use(remarkStringify, {
      bullet: '-',
      emphasis: '*',
      strong: '*',
      fence: '`',
      fences: true,
      listItemIndent: 'one',
      rule: '-',
    })
  return { md: String(processor.processSync(html)), notes }
}
