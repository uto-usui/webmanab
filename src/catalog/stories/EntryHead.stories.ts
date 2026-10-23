import EntryHead from '../../components/EntryHead.astro'
import { posts, toEntry } from '../fixtures/posts'
import type { Meta, Story } from '../types'

export default {
  component: EntryHead,
  args: { entry: toEntry(posts.tip) },
} satisfies Meta<typeof EntryHead>

export const Default: Story<typeof EntryHead> = {}

// タームが 19 件で折り返す
export const ManyTerms: Story<typeof EntryHead> = {
  args: { entry: toEntry(posts.clipManyTerms) },
}

export const LongTitle: Story<typeof EntryHead> = {
  args: { entry: toEntry(posts.clipLongTitle) },
}

export const TargetHover: Story<typeof EntryHead> = {
  parameters: {
    catalog: { steps: [{ hover: 'a.entry-head__target' }] },
  },
}
