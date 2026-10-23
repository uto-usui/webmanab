import EntryAd from '../../components/EntryAd.astro'
import type { Meta, Story } from '../types'

// PUBLIC_ADSENSE_CLIENT のないビルドなので、本番以外と同じく枠だけが出る（03 の 9 章）
export default {
  component: EntryAd,
  args: { adSlot: '6597241020' },
} satisfies Meta<typeof EntryAd>

export const Placeholder: Story<typeof EntryAd> = {}
