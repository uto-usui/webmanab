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

/** 新しい記事の id はここから振る（docs/operations の 1 章）。旧 WordPress の id は 2883 まで */
export const NEW_POST_ID = 3000
/** 旧 WordPress のターム id の最大。新しいタームはこれより大きい id にする */
export const LEGACY_TERM_MAX_ID = 366

/** トップは名前だけ、それ以外は `{title} | {サイト名}`（旧サイトと同じ） */
export const pageTitle = (title?: string) =>
  title ? `${title} | ${SITE_NAME}` : SITE_NAME

/** 一覧ページの description。ターム一覧も `tips` ではなく `tip` を入れる（旧サイトと同じ） */
export const archiveDescription = (type: PostType) => `${type} archive page`
