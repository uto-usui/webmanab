export const SITE_NAME = 'webmanab.html／ウェブまなぶ'

export const SITE_DESCRIPTION =
  'ウェブ制作のあれこれについて学習したことをメモしたりクリップしたり気ままに綴っていきます。'

export const POST_TYPES = ['tip', 'clip', 'lab'] as const
export type PostType = (typeof POST_TYPES)[number]

export const TAXONOMIES = ['tips', 'clips', 'labs'] as const
export type Taxonomy = (typeof TAXONOMIES)[number]

export const TAXONOMY_OF = {
  tip: 'tips',
  clip: 'clips',
  lab: 'labs',
} as const satisfies Record<PostType, Taxonomy>

export const POST_TYPE_OF = {
  tips: 'tip',
  clips: 'clip',
  labs: 'lab',
} as const satisfies Record<Taxonomy, PostType>

export const PER_PAGE = 8

/** トップは名前だけ、それ以外は `{title} | {サイト名}`（旧サイトと同じ） */
export const pageTitle = (title?: string) =>
  title ? `${title} | ${SITE_NAME}` : SITE_NAME

/** 一覧ページの description。ターム一覧も `tips` ではなく `tip` を入れる（旧サイトと同じ） */
export const archiveDescription = (type: PostType) => `${type} archive page`
