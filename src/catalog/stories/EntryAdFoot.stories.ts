import EntryAdFoot from '../../components/EntryAdFoot.astro'
import type { Meta, Story } from '../types'

// Amazon の画像は外部なので、テストでは読み込まず壊れた画像として出る
export default { component: EntryAdFoot } satisfies Meta<typeof EntryAdFoot>

export const Default: Story<typeof EntryAdFoot> = {}
