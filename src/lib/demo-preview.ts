/** labobal.dev のデモが公開している、動いている様子の短い動画とポスター画像 */
export interface DemoPreview {
  video: string
  poster: string
}

/** labobal.dev のポスター画像と動画の大きさ（480×300） */
export const DEMO_PREVIEW_WIDTH = 480
export const DEMO_PREVIEW_HEIGHT = 300

const ORIGIN = 'https://labobal.dev'

/**
 * `https://labobal.dev/<slug>/` のデモなら、`/previews/<slug>.webm` と `.jpg` を返す。
 * それ以外（jsfiddle など）は動画がないので undefined
 */
export const demoPreview = (demoUrl: string): DemoPreview | undefined => {
  let url: URL
  try {
    url = new URL(demoUrl)
  } catch {
    return undefined
  }
  if (url.origin !== ORIGIN) return undefined
  const slug = /^\/([a-z0-9-]+)\/?$/.exec(url.pathname)?.[1]
  if (!slug) return undefined
  return {
    video: `${ORIGIN}/previews/${slug}.webm`,
    poster: `${ORIGIN}/previews/${slug}.jpg`,
  }
}
