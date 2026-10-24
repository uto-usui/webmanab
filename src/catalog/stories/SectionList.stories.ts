import SectionListPair from '../fixtures/SectionListPair.astro'
import type { Meta, Story } from '../types'

export default { component: SectionListPair } satisfies Meta<
  typeof SectionListPair
>

export const TwoSections: Story<typeof SectionListPair> = {}
