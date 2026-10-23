import { experimental_AstroContainer as AstroContainer } from 'astro/container'
import { describe, expect, test } from 'vitest'
import AdScript from '../../src/components/AdScript.astro'
import Head from '../../src/components/Head.astro'
import { buildHead } from '../../src/lib/head'

const site = new URL('https://webmanab.netlify.app')
const render = async (
  component: Parameters<AstroContainer['renderToString']>[0],
  props: Record<string, unknown>,
) => (await AstroContainer.create()).renderToString(component, { props })

describe('Head.astro', () => {
  test('canonical、meta、構造化データを出し、<title> は出さない', async () => {
    const head = buildHead({ kind: 'term', tax: 'labs', id: 332 }, site)
    const html = await render(Head, { head })
    expect(html).toContain(
      '<link rel="canonical" href="https://webmanab.netlify.app/labs/332/">',
    )
    expect(html).toContain(
      '<meta property="og:url" content="https://webmanab.netlify.app/labs/332/">',
    )
    expect(html).toContain(
      '<meta name="description" content="lab archive page">',
    )
    expect(html.match(/<meta /g)).toHaveLength(head.meta.length)
    expect(html).not.toContain('<title')
    expect(html).not.toContain('ld+json')
    expect(html).not.toContain('googletagmanager')
  })

  test('GA4 の ID を渡したときだけ gtag を出す', async () => {
    const html = await render(Head, {
      head: buildHead({ kind: 'top' }, site),
      ga4Id: 'G-TEST123',
    })
    expect(html).toContain(
      '<script async src="https://www.googletagmanager.com/gtag/js?id=G-TEST123"></script>',
    )
    expect(html).toContain(`gtag('config',"G-TEST123")`)
  })
})

describe('AdScript.astro', () => {
  test('クライアント ID がなければ何も出さない', async () => {
    expect((await render(AdScript, {})).trim()).toBe('')
  })

  test('クライアント ID があれば adsbygoogle.js を async で読む', async () => {
    const html = await render(AdScript, { client: 'ca-pub-2691922878827958' })
    expect(html).toBe(
      '<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2691922878827958" crossorigin="anonymous"></script>',
    )
  })
})
