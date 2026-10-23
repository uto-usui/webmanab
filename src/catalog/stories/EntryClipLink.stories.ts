import EntryClipLink from '../../components/EntryClipLink.astro'
import { eyecatchFor } from '../../lib/eyecatch'
import { posts } from '../fixtures/posts'
import type { Meta, Story } from '../types'

const post = posts.clipManyTerms

export default {
  component: EntryClipLink,
  args: {
    href: post.clipUrl!,
    title: post.title,
    src: eyecatchFor(post).svg,
  },
} satisfies Meta<typeof EntryClipLink>

export const Default: Story<typeof EntryClipLink> = {}

// ストライプと clip-path、「visit to」
export const Hover: Story<typeof EntryClipLink> = {
  parameters: { catalog: { steps: [{ hover: '.entry-clip__img' }] } },
}
