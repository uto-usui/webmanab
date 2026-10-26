// 本文の描画の回帰（08 の 1.4）。全記事は指紋で、代表 12 本は読める HTML で固定する。
// 本文やプラグインを意図して変えたときは `pnpm test:dist -u` で更新し、PR の差分で変わった記事を確かめる。
// 指紋は pnpm verify:md が「説明のつかない差 0」を出した状態のビルドから作った
import { createHash } from 'node:crypto'
import type { Element, Nodes, Root } from 'hast'
import { toHtml } from 'hast-util-to-html'
import rehypeParse from 'rehype-parse'
import { unified } from 'unified'
import { describe, expect, test } from 'vitest'
import { load, valid } from '../content/load'
import { isLegacy } from '../content/pages'
import { distFiles, readDist } from './dist.ts'

const sha1 = (text: string) => createHash('sha1').update(text).digest('hex')
const isElement = (n: Nodes): n is Element => n.type === 'element'
const classOf = (n: Element) =>
  Array.isArray(n.properties.className) ? n.properties.className.join(' ') : ''

function findBody(n: Nodes): Element | undefined {
  if (isElement(n) && classOf(n).split(' ').includes('entry-content__inner'))
    return n
  if (!('children' in n)) return undefined
  for (const child of n.children) {
    const found = findBody(child)
    if (found) return found
  }
}

const textOf = (n: Nodes): string =>
  n.type === 'text'
    ? n.value
    : 'children' in n
      ? n.children.map(textOf).join('')
      : ''

// タグ名、class、href / src と、空白を詰めたテキストだけを残す。属性の順や空白の縮め方が変わっても指紋は変わらない
function canon(n: Nodes): string {
  if (n.type === 'text') return n.value.replace(/\s+/g, ' ')
  if (!isElement(n))
    return 'children' in n ? n.children.map(canon).join('') : ''
  const attrs = [n.tagName]
  if (classOf(n)) attrs.push(`class=${classOf(n)}`)
  for (const name of ['href', 'src'] as const)
    if (n.properties[name] !== undefined)
      attrs.push(`${name}=${n.properties[name]}`)
  return `<${attrs.join(' ')}>${n.children.map(canon).join('')}</${n.tagName}>`
}

function codeBlocks(n: Nodes): [string, string, string][] {
  if (!isElement(n))
    return 'children' in n ? n.children.flatMap(codeBlocks) : []
  if (n.tagName !== 'pre') return n.children.flatMap(codeBlocks)
  const code = n.children.find(
    (c): c is Element => isElement(c) && c.tagName === 'code',
  )
  return [[classOf(n), code ? classOf(code) : '', sha1(textOf(code ?? n))]]
}

const articles = distFiles('{tip,clip,lab}/*/index.html').map((file) => {
  const tree = unified().use(rehypeParse).parse(readDist(file)) as Root
  return { name: file.replace(/\/index\.html$/, ''), body: findBody(tree) }
})

test('すべての記事に本文の枠がある', () => {
  expect(articles.filter(({ body }) => !body).map(({ name }) => name)).toEqual(
    [],
  )
})

// 新しい記事を足すたびに -u を求めると描画の回帰を見るものでなくなるので、旧記事だけを指紋にする
const added = new Set(
  valid(load('src/content').posts)
    .filter((entry) => !isLegacy(entry))
    .map(({ data }) => `${data.type}/${decodeURIComponent(data.slug)}`),
)

test('旧記事の本文とコードブロックの指紋', async () => {
  const fingerprint = Object.fromEntries(
    articles
      .filter(({ name }) => !added.has(name))
      .map(({ name, body }) => [
        name,
        {
          body: sha1(canon(body!).replace(/\s*(<[^>]+>)\s*/g, '$1')),
          code: codeBlocks(body!),
        },
      ]),
  )
  // 1 記事 1 行にして、PR の差分で変わった記事がそのまま読めるようにする
  const json = `{\n${Object.entries(fingerprint)
    .map(([name, value]) => `${JSON.stringify(name)}: ${JSON.stringify(value)}`)
    .join(',\n')}\n}\n`
  await expect(json).toMatchFileSnapshot(
    '../fixtures/rendered-fingerprint.json',
  )
})

// 02 の 1.1 の基準ページ、意図して直した記事、末尾が改行で終わらない記事、和文の強調を <strong> にした記事
const SAMPLES = [
  'tip/method-control',
  'tip/sass-pickup',
  'tip/webgl-three-start',
  'tip/dart-sass-with-nuxt',
  'clip/2016-jsconf-is',
  'lab/createjs-node-motion',
  'tip/frontnote',
  'tip/javascript-es6',
  'tip/html5-basic',
  'tip/easy-instagram-feed',
  'tip/divide-retina',
  'tip/html5-global',
]

describe('代表 12 本の本文', () => {
  test.each(SAMPLES)('%s', async (name) => {
    const body = articles.find((article) => article.name === name)?.body
    expect(body).toBeDefined()
    // 差分が読めるよう、ブロックの終わりで改行する
    const html = toHtml(body!.children).replace(
      /(<\/(?:p|h[1-6]|pre|ul|ol|li|dl|dt|dd|div|figure|table|blockquote)>)/g,
      '$1\n',
    )
    await expect(`${html}\n`).toMatchFileSnapshot(
      `../fixtures/rendered/${name.replace('/', '__')}.html`,
    )
  })
})
