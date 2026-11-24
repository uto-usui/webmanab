// About ページの中身と、構造化データ（ProfilePage / Person）に使う値
import { toIsoJst } from './date'

export const AUTHOR_NAME = 'uto usui'

export const ABOUT_PATH = '/about/'

/** sitemap の lastmod。About の文を直したら日付も上げる */
export const ABOUT_MODIFIED = new Date('2026-11-24T00:00:00+09:00')

export const ABOUT_DESCRIPTION =
  'webmanab.html は、ウェブ制作で学んだことを書き残している uto usui の個人サイトです。'

/** 本人の公開プロフィール。Person の sameAs にもそのまま使う */
export const PROFILE_LINKS = [
  { label: 'X', href: 'https://x.com/uto_ao' },
  { label: 'GitHub', href: 'https://github.com/uto-usui' },
  { label: 'Zenn', href: 'https://zenn.dev/uto_ao' },
  { label: 'note', href: 'https://note.com/okiniirinoao' },
  { label: 'labobal.dev', href: 'https://labobal.dev/' },
  { label: 'uto-usui.com', href: 'https://uto-usui.com/' },
] as const

export const profilePage = (site: URL) => {
  const url = new URL(ABOUT_PATH, site).href
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    url,
    dateModified: toIsoJst(ABOUT_MODIFIED),
    mainEntity: {
      '@type': 'Person',
      name: AUTHOR_NAME,
      url,
      sameAs: PROFILE_LINKS.map(({ href }) => href),
    },
  }
}
