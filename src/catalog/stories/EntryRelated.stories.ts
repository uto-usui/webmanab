import EntryRelated from '../../components/EntryRelated.astro'
import { lists } from '../fixtures/list'
import { posts, toEntry } from '../fixtures/posts'
import type { Meta, Story } from '../types'

export default {
  component: EntryRelated,
  args: { posts: lists.eight.slice(0, 3) },
} satisfies Meta<typeof EntryRelated>

export const Three: Story<typeof EntryRelated> = {}

// 同じタグの記事がない。枠と見出しだけ出る（03 の 5.1）
export const Empty: Story<typeof EntryRelated> = { args: { posts: [] } }

export const LongTitles: Story<typeof EntryRelated> = {
  args: {
    posts: [posts.clipLongTitle, posts.tip, posts.clipManyTerms].map(toEntry),
  },
}

export const Hover: Story<typeof EntryRelated> = {
  parameters: { catalog: { steps: [{ hover: '.entry-related__target' }] } },
}
