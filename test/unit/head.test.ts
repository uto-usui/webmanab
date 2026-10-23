import { readFileSync } from 'node:fs'
import { parseFrontmatter } from '@astrojs/internal-helpers/frontmatter'
import { describe, expect, test } from 'vitest'
import { eyecatchFor } from '../../src/lib/eyecatch/index.ts'
import {
  adsenseScriptSrc,
  buildHead,
  gtagTags,
  serializeJsonLd,
  type HeadData,
} from '../../src/lib/head'
import { postSchema } from '../../src/lib/schema'

const site = new URL('https://webmanab.netlify.app')
const SITE = 'webmanab.html／ウェブまなぶ'

const fixture = (path: string) => ({
  data: postSchema.parse(
    parseFrontmatter(readFileSync(`test/fixtures/posts/${path}.md`, 'utf8'))
      .frontmatter,
  ),
})

const metaOf = (head: HeadData) =>
  Object.fromEntries(
    head.meta.map((tag) => [
      'name' in tag ? tag.name : tag.property,
      tag.content,
    ]),
  )

describe('buildHead', () => {
  test('トップ', () => {
    const head = buildHead({ kind: 'top' }, site)
    expect(head.title).toBe(SITE)
    expect(head.description).toBe(
      'ウェブ制作のあれこれについて学習したことをメモしたりクリップしたり気ままに綴っていきます。',
    )
    expect(head.canonical).toBe('https://webmanab.netlify.app/')
    expect(metaOf(head)['og:image']).toBe(
      'https://webmanab.netlify.app/ogp.png',
    )
    expect(head.jsonLd).toBeUndefined()
  })

  test('type の一覧とターム一覧は、どちらも tip の title と description', () => {
    const type = buildHead({ kind: 'type', type: 'tip' }, site)
    const term = buildHead({ kind: 'term', tax: 'tips', id: 366 }, site)
    for (const head of [type, term]) {
      expect(head.title).toBe(`tip | ${SITE}`)
      expect(head.description).toBe('tip archive page')
      expect(head.jsonLd).toBeUndefined()
    }
    expect(type.canonical).toBe('https://webmanab.netlify.app/tip/')
    expect(term.canonical).toBe('https://webmanab.netlify.app/tips/366/')
  })

  test('記事は title と抜粋、og:image はカテゴリの OGP 画像', () => {
    const entry = fixture('tip/sass-pickup')
    const head = buildHead({ kind: 'post', entry }, site)
    expect(head.title).toBe(`${entry.data.title} | ${SITE}`)
    expect(head.description).toBe(entry.data.excerpt)
    expect(head.canonical).toBe('https://webmanab.netlify.app/tip/sass-pickup/')
    expect(metaOf(head)['og:image']).toBe(
      new URL(eyecatchFor(entry.data).og, site).href,
    )
  })

  test('OGP と twitter の値。og:url は canonical と同じで、property="og:*" だけで出す', () => {
    const head = buildHead(
      { kind: 'post', entry: fixture('tip/sass-pickup') },
      site,
    )
    const meta = metaOf(head)
    expect(meta['og:url']).toBe(head.canonical)
    expect(meta['og:title']).toBe(head.title)
    expect(meta['og:description']).toBe(head.description)
    expect(meta['og:type']).toBe('website')
    expect(meta['og:locale']).toBe('ja_JP')
    expect(meta['twitter:card']).toBe('summary_large_image')
    expect(meta['twitter:site']).toBe('@uto_ao')
    expect(meta['twitter:image']).toBe(meta['og:image'])
    expect(
      head.meta.filter((tag) => 'name' in tag && tag.name.startsWith('og:')),
    ).toEqual([])
  })

  test('excerpt のない記事はサイトの説明文にする', () => {
    const head = buildHead(
      { kind: 'post', entry: fixture('clip/post-693') },
      site,
    )
    expect(head.description).toBe(
      'ウェブ制作のあれこれについて学習したことをメモしたりクリップしたり気ままに綴っていきます。',
    )
  })

  test('日本語 slug の canonical はエンコード済みのパス', () => {
    const head = buildHead(
      { kind: 'post', entry: fixture('clip/post-2831') },
      site,
    )
    expect(head.canonical).toBe(
      'https://webmanab.netlify.app/clip/%E3%81%AD%E2%80%AF-%E2%80%AFnt/',
    )
  })
})

describe('構造化データ', () => {
  test('BlogPosting に元の公開日・更新日・著者・canonical・画像を入れる', () => {
    const entry = fixture('tip/sass-pickup')
    const head = buildHead({ kind: 'post', entry }, site)
    const data = JSON.parse(head.jsonLd!)
    expect(data).toEqual({
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: entry.data.title,
      description: entry.data.excerpt,
      datePublished: '2017-01-11T17:50:24+09:00',
      dateModified: '2017-02-14T01:51:48+09:00',
      author: { '@type': 'Person', name: 'uto usui' },
      publisher: { '@type': 'Organization', name: SITE },
      mainEntityOfPage: { '@type': 'WebPage', '@id': head.canonical },
      url: head.canonical,
      image: metaOf(head)['og:image'],
    })
  })

  test('modified がない記事は dateModified に date を入れる', () => {
    const data = JSON.parse(
      buildHead({ kind: 'post', entry: fixture('clip/post-2831') }, site)
        .jsonLd!,
    )
    expect(data.dateModified).toBe(data.datePublished)
    expect(data.datePublished).toBe('2020-02-25T23:04:31+09:00')
  })

  test('</script> で閉じられないよう < をエスケープする', () => {
    const json = serializeJsonLd({ headline: '</script><b>' })
    expect(json).not.toContain('<')
    expect(JSON.parse(json).headline).toBe('</script><b>')
  })
})

describe('計測と広告', () => {
  test('ID がなければ何も返さない', () => {
    expect(gtagTags(undefined)).toBeNull()
    expect(gtagTags('')).toBeNull()
    expect(adsenseScriptSrc(undefined)).toBeNull()
    expect(adsenseScriptSrc('')).toBeNull()
  })

  test('ID があればタグの中身を返す', () => {
    expect(gtagTags('G-TEST123')).toEqual({
      src: 'https://www.googletagmanager.com/gtag/js?id=G-TEST123',
      inline: expect.stringContaining(`gtag('config',"G-TEST123")`),
    })
    expect(adsenseScriptSrc('ca-pub-2691922878827958')).toBe(
      'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2691922878827958',
    )
  })
})
