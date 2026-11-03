import { labobalCodeUrl, labobalSlug } from './markdown/labobal-demo-links.mjs'

/** labobal.dev のデモが公開している、動いている様子の短い動画とポスター画像 */
export interface DemoPreview {
  video: string
  poster: string
}

/** labobal.dev のポスター画像と動画の大きさ（480×300） */
export const DEMO_PREVIEW_WIDTH = 480
export const DEMO_PREVIEW_HEIGHT = 300

export { labobalSlug }

const ORIGIN = 'https://labobal.dev'

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
  return slug && labobalCodeUrl(slug)
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
