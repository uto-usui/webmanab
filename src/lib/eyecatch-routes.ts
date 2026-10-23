import { type EyecatchVariant } from './eyecatch/index.ts'
import type { PostData } from './schema'

type Input = { data: Pick<PostData, 'type' | 'id' | 'primaryTag' | 'terms'> }

const VARIANTS = [
  'default',
  'nav',
] as const satisfies readonly EyecatchVariant[]

/**
 * `eyecatch/[type]/[id].svg.ts` の getStaticPaths 用。記事ごとに通常版 `{id}.svg` と
 * ナビ用 `{id}-nav.svg` を出す。URL は eyecatchFor() の svg / nav と同じ
 */
export const eyecatchStaticPaths = <T extends Input>(entries: readonly T[]) =>
  entries.flatMap(({ data }) =>
    VARIANTS.map((variant) => ({
      params: {
        type: data.type,
        id: variant === 'nav' ? `${data.id}-nav` : String(data.id),
      },
      props: { data, variant },
    })),
  )
