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

/** 新しい記事の id はここから振る。旧 WordPress の id は 2883 まで */
export const NEW_POST_ID = 3000
/** 旧 WordPress のターム id の最大。新しいタームはこれより大きい id にする */
export const LEGACY_TERM_MAX_ID = 366

/** トップは名前だけ、それ以外は `{title} | {サイト名}`（旧サイトと同じ） */
export const pageTitle = (title?: string) =>
  title ? `${title} | ${SITE_NAME}` : SITE_NAME

/**
 * 検索結果とシェアに出す記事の題名。旧記事の題名の末尾にある「 -『CSS』」のようなカテゴリを外す。
 * カテゴリはタグとして記事に出ているので、検索結果では題名の語を前に残す。画面の見出しは元の題名のまま
 */
export const searchTitle = (title: string) =>
  title.replace(/\s*[-–]\s*『[^』]*』\s*$/, '')

/** 種類ごとの一覧ページの description */
export const archiveDescription = (type: PostType) => `${type} archive page`

/** ターム一覧の title。種類の一覧と同じ title だと、検索結果でどのタグの一覧か見分けられない */
export const termTitle = (name: string, type: PostType) =>
  pageTitle(`${name} - ${type}`)

export const termDescription = (name: string, type: PostType) =>
  `${name} のタグが付いた ${type} の一覧です。`
