// 往復検証: 元の本文 HTML と、Markdown を HTML に戻したものを比べる（04-markdown-exporter.md の 8.）
import type { Element, Nodes, Root } from 'hast'
import { toText } from 'hast-util-to-text'
import { normalizeUri } from 'micromark-util-sanitize-uri'
import rehypeParse from 'rehype-parse'
import { markdownToHtml } from 'satteri'
import { unified } from 'unified'
import { SKIP, visit } from 'unist-util-visit'
import type { Note } from './convert.ts'
import {
  collapseWhitespace,
  isBlank,
  removeWhitespace,
  trimWhitespace,
} from './whitespace.ts'

export const parseHtml = (html: string): Root =>
  unified().use(rehypeParse, { fragment: true }).parse(html)

// サイトと同じ設定（Astro の Sätteri、rawHtml あり、smartPunctuation なし）で HTML にする
export function renderMarkdown(md: string): Root {
  const { html } = markdownToHtml(md, {
    features: { gfm: true, rawHtml: true, smartPunctuation: false },
  })
  return parseHtml(html)
}

const isElement = (n: Nodes): n is Element => n.type === 'element'
const norm = (s: string) => trimWhitespace(collapseWhitespace(s))
const classOf = (n: Element) =>
  Array.isArray(n.properties.className) ? n.properties.className.join(' ') : ''
const codeOf = (pre: Element) =>
  pre.children.find(
    (c): c is Element => isElement(c) && c.tagName === 'code',
  ) ?? pre

// <code> の textContent。br は改行として数える（元の側で画面に見えていた改行）。何も削らない
function codeTextContent(n: Nodes): string {
  if (n.type === 'text') return n.value
  if (isElement(n) && n.tagName === 'br') return '\n'
  return 'children' in n
    ? n.children.map((c) => codeTextContent(c)).join('')
    : ''
}

// side: original は元の WP HTML、rendered は Markdown から戻した HTML
type Side = 'original' | 'rendered'

function codeBlock(pre: Element, side: Side) {
  const code = codeOf(pre)
  const cls = classOf(code)
  const text = codeTextContent(code)
  return side === 'original'
    ? { lang: cls || null, value: text }
    : // 描画側のプラグインと同じく、言語の class から language- を外し、フェンス付きコードが足した末尾の改行を 1 つ外す
      {
        lang: cls.replace(/^language-/, '') || null,
        value: text.replace(/\n$/, ''),
      }
}

const isImageOnlyP = (n: Nodes) =>
  isElement(n) &&
  n.tagName === 'p' &&
  n.children.some((c) => isElement(c) && c.tagName === 'img') &&
  n.children.every(
    (c) =>
      (c.type === 'text' && isBlank(c.value)) ||
      (isElement(c) && c.tagName === 'img'),
  )

const COUNTED = [
  'ul',
  'ol',
  'li',
  'dl',
  'dt',
  'dd',
  'blockquote',
  'p',
  'figure',
  'style',
  'input',
  'table',
]

export interface Metrics {
  headings: string[]
  codeBlocks: { lang: string | null; value: string }[]
  inlineCode: string[]
  hrefs: string[]
  iframes: string[]
  strong: string[]
  em: string[]
  brOutsidePre: number
  counts: Record<string, number>
  blocks: string[]
  textStrict: string
  textLoose: string
  canon: string
}

export function metrics(tree: Root, side: Side): Metrics {
  const original = side === 'original'
  // 画像だけの段落は変換で落とすと決めたので、元の側では数えない
  const m: Metrics = {
    headings: [],
    codeBlocks: [],
    inlineCode: [],
    hrefs: [],
    iframes: [],
    strong: [],
    em: [],
    brOutsidePre: 0,
    counts: {},
    blocks: tree.children
      .filter((n) => isElement(n) && !(original && isImageOnlyP(n)))
      .map((n) => (n as Element).tagName),
    textStrict: '',
    textLoose: '',
    canon: canon(tree, side),
  }
  // 元の側の href は CommonMark と同じ方法でエンコードしてから比べる
  const href = (n: Element) =>
    original
      ? normalizeUri(String(n.properties.href))
      : String(n.properties.href)
  const walk = (n: Nodes, inPre: boolean) => {
    if (!isElement(n)) {
      if ('children' in n) for (const c of n.children) walk(c, inPre)
      return
    }
    const t = n.tagName
    if (/^h[1-6]$/.test(t) && !inPre) m.headings.push(`${t}:${norm(toText(n))}`)
    if (t === 'pre') m.codeBlocks.push(codeBlock(n, side))
    if (t === 'code' && !inPre)
      m.inlineCode.push(toText(n, { whitespace: 'pre' }))
    if (t === 'a') m.hrefs.push(href(n))
    if (t === 'br' && !inPre) m.brOutsidePre++
    if (t === 'iframe') m.iframes.push(String(n.properties.src))
    if (t === 'strong' || t === 'b') m.strong.push(norm(toText(n)))
    if (t === 'em' || t === 'i') m.em.push(norm(toText(n)))
    if (COUNTED.includes(t) && !inPre && !(original && isImageOnlyP(n)))
      m.counts[t] = (m.counts[t] ?? 0) + 1
    for (const c of n.children) walk(c, inPre || t === 'pre')
  }
  walk(tree, false)
  // テキストは pre と style を除いて比べる（コードは codeBlocks で別に比べる）
  const noPre = structuredClone(tree)
  visit(noPre, 'element', (n, i, parent) => {
    if (
      parent &&
      i !== undefined &&
      (n.tagName === 'pre' || n.tagName === 'style')
    ) {
      parent.children.splice(i, 1)
      return [SKIP, i]
    }
  })
  const text = toText(noPre)
  m.textStrict = norm(text)
  m.textLoose = removeWhitespace(text)
  return m
}

// 構造ごと比べるための正規形。タグ名・href・src・class と、空白を詰めたテキストだけを残す。
// 入れ子や強調の位置のずれもここで分かる
function canon(tree: Root, side: Side): string {
  const original = side === 'original'
  const out: string[] = []
  const walk = (n: Nodes) => {
    if (n.type === 'text') return void out.push(collapseWhitespace(n.value))
    if (n.type === 'comment') return
    if (!isElement(n)) {
      if ('children' in n) n.children.forEach(walk)
      return
    }
    const t = n.tagName
    if (t === 'img') return
    if (t === 'span' && !Object.keys(n.properties).length)
      return n.children.forEach(walk)
    if (t === 'pre') {
      const { lang, value } = codeBlock(n, side)
      return void out.push(`<pre ${lang ?? ''}>${JSON.stringify(value)}</pre>`)
    }
    const attrs = [t]
    if (t === 'a')
      attrs.push(
        `href=${original ? normalizeUri(String(n.properties.href)) : n.properties.href}`,
      )
    if (n.properties.src) attrs.push(`src=${n.properties.src}`)
    const cls = classOf(n)
      .split(' ')
      .filter((c) => c && c !== 'fancybox-iframe')
    if (cls.length) attrs.push(`class=${cls.join(' ')}`)
    if (t === 'input') attrs.push(`placeholder=${n.properties.placeholder}`)
    out.push(`<${attrs.join(' ')}>`)
    if (t === 'style') out.push(norm(toText(n)))
    else n.children.forEach(walk)
    out.push(`</${t}>`)
  }
  walk(tree)
  return out
    .join('')
    .replace(/[ \t\n\f\r]*(<[^>]+>)[ \t\n\f\r]*/g, '$1')
    .replaceAll('<p></p>', '')
}

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b)
const sorted = (a: string[]) => [...a].sort()

// 合わなかった検証項目の名前を返す
export function compare(a: Metrics, b: Metrics): string[] {
  const fails: string[] = []
  if (a.textLoose !== b.textLoose) fails.push('text')
  else if (a.textStrict !== b.textStrict) fails.push('text-whitespace')
  if (!same(a.headings, b.headings)) fails.push('headings')
  if (a.codeBlocks.length !== b.codeBlocks.length) fails.push('code-count')
  else {
    if (
      !same(
        a.codeBlocks.map((c) => c.value),
        b.codeBlocks.map((c) => c.value),
      )
    )
      fails.push('code-value')
    if (
      !same(
        a.codeBlocks.map((c) => c.lang),
        b.codeBlocks.map((c) => c.lang),
      )
    )
      fails.push('code-lang')
  }
  if (!same(a.inlineCode, b.inlineCode)) fails.push('inline-code')
  if (!same(sorted(a.hrefs), sorted(b.hrefs))) fails.push('hrefs')
  if (!same(a.iframes, b.iframes)) fails.push('iframes')
  if (!same(a.strong, b.strong)) fails.push('strong')
  if (!same(a.em, b.em)) fails.push('em')
  if (a.brOutsidePre !== b.brOutsidePre) fails.push('br')
  for (const k of new Set([
    ...Object.keys(a.counts),
    ...Object.keys(b.counts),
  ])) {
    if ((a.counts[k] ?? 0) !== (b.counts[k] ?? 0)) fails.push(`count-${k}`)
  }
  if (!same(a.blocks, b.blocks)) fails.push('blocks')
  if (a.canon !== b.canon) fails.push('dom')
  return fails
}

// 意図して直したもの（記録の種類）と、それで合わなくなる検証項目
const INTENDED: Partial<Record<Note['kind'], string[]>> = {
  'bare-url-linked': ['hrefs', 'dom'],
  'internal-link-rewritten': ['hrefs', 'dom'],
  'dead-link-unwrapped': ['hrefs', 'dom'],
  'code-raw-element': ['code-value', 'dom'],
  'code-emoji-restored': ['code-value', 'dom'],
  'comment-restored': ['text', 'dom'],
  'style-unwrapped': ['count-p', 'blocks', 'dom'],
}

export const intendedKinds = (notes: Note[]) => [
  ...new Set(notes.map((n) => n.kind).filter((k) => k in INTENDED)),
]

// 記録で説明できない不一致
export function unexplained(fails: string[], notes: Note[]): string[] {
  const ok = new Set(notes.flatMap((n) => INTENDED[n.kind] ?? []))
  return fails.filter((f) => !ok.has(f))
}

// 旧サイトの前後記事ナビは WP の生の post_title を出していて、記事の title（title.rendered）にかかっている
// wptexturize と capital_P_dangit の置き換えがない。新サイトはナビにも title を出す（README 4 章）
const NAV_TITLE_RULES: [kind: string, from: RegExp, to: string][] = [
  ['dash', /–/g, '-'],
  ['quote', /[‘’]/g, "'"],
  ['double-quote', /[“”]/g, '"'],
  ['prime', /′/g, "'"],
  ['ellipsis', /…/g, '...'],
  ['capital-p', /WordPress/g, 'Wordpress'],
]
const applyRules = (s: string, rules: typeof NAV_TITLE_RULES) =>
  rules.reduce((acc, [, from, to]) => acc.replace(from, to), s)

// 旧ナビの文字と title の違いが、上の置き換えだけで説明できるなら使った置き換えの種類を返す。説明できなければ null
export function navTitleDiff(title: string, nav: string): string[] | null {
  if (applyRules(title, NAV_TITLE_RULES) !== applyRules(nav, NAV_TITLE_RULES))
    return null
  // 外すと一致しなくなる置き換えだけを、使った種類として数える
  return NAV_TITLE_RULES.filter((rule) => {
    const others = NAV_TITLE_RULES.filter((r) => r !== rule)
    return applyRules(title, others) !== applyRules(nav, others)
  }).map(([kind]) => kind)
}
