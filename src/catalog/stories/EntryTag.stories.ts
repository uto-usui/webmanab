import EntryTag from '../../components/EntryTag.astro'
import { posts, toEntry } from '../fixtures/posts'
import type { Meta, Story } from '../types'

export default {
  component: EntryTag,
  args: { entry: toEntry(posts.tip) },
} satisfies Meta<typeof EntryTag>

export const Few: Story<typeof EntryTag> = {}

// 折り返したときの縦の間隔は行の高さで作っている
export const Many: Story<typeof EntryTag> = {
  args: { entry: toEntry(posts.clipManyTerms) },
}

export const Hover: Story<typeof EntryTag> = {
  parameters: { catalog: { steps: [{ hover: '.entry-tag__target' }] } },
}
