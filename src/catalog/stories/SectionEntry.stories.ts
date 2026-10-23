import SectionEntry from '../../components/SectionEntry.astro'
import type { Meta, Story } from '../types'

export default {
  component: SectionEntry,
  args: { slot: '<p>記事ページの中身はこの枠の中に入る</p>' },
} satisfies Meta<typeof SectionEntry>

export const Default: Story<typeof SectionEntry> = {}
