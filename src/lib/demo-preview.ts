/** labobal.dev のデモが公開している、動いている様子の短い動画とポスター画像 */
export interface DemoPreview {
  video: string
  poster: string
}

/** labobal.dev のポスター画像と動画の大きさ（480×300） */
export const DEMO_PREVIEW_WIDTH = 480
export const DEMO_PREVIEW_HEIGHT = 300

const ORIGIN = 'https://labobal.dev'
// リポジトリ名は laboobal-dev で、ドメインの labobal と綴りが違う
const CODE_BASE =
  'https://github.com/uto-usui/laboobal-dev/tree/master/src/demos'

/**
 * `https://labobal.dev/<slug>/` なら slug を返す。それ以外（jsfiddle など）は undefined。
 * 本文の iframe の src はスキームなし（`//…`）のこともあるので https として読む
 */
export const labobalSlug = (url: string): string | undefined => {
  let parsed: URL
  try {
    parsed = new URL(url, 'https://localhost/')
  } catch {
    return undefined
  }
  if (parsed.origin !== ORIGIN) return undefined
  return /^\/([a-z0-9-]+)\/?$/.exec(parsed.pathname)?.[1]
}

/** `/previews/<slug>.webm` と `.jpg`。labobal.dev のデモでなければ undefined */
export const demoPreview = (demoUrl: string): DemoPreview | undefined => {
  const slug = labobalSlug(demoUrl)
  if (!slug) return undefined
  return {
    video: `${ORIGIN}/previews/${slug}.webm`,
    poster: `${ORIGIN}/previews/${slug}.jpg`,
  }
}

/** GitHub のデモのコードのフォルダ。labobal.dev のデモでなければ undefined */
export const demoCodeUrl = (demoUrl: string): string | undefined => {
  const slug = labobalSlug(demoUrl)
  return slug && `${CODE_BASE}/${slug}/`
}

/** 本文の Markdown が、demoUrl と同じ labobal.dev のデモを iframe で埋め込んでいるか。コードの中は見ない */
export const embedsDemo = (markdown: string, demoUrl: string): boolean => {
  const slug = labobalSlug(demoUrl)
  if (!slug) return false
  const body = markdown
    .replace(/^(```|~~~)[^\n]*\n[\s\S]*?^\1[ \t]*$/gm, '')
    .replace(/(`+)[\s\S]*?\1/g, '')
  return [...body.matchAll(/<iframe\s[^>]*?src="([^"]+)"/gi)].some(
    (m) => labobalSlug(m[1]) === slug,
  )
}
