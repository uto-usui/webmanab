import EntryClipLink from '../../components/EntryClipLink.astro'
import { entryImageFor } from '../../lib/post-image'
import { posts } from '../fixtures/posts'
import type { Meta, Story } from '../types'

const post = posts.clipManyTerms

export default {
  component: EntryClipLink,
  args: {
    href: post.clipUrl!,
    title: post.title,
    image: entryImageFor(post),
  },
} satisfies Meta<typeof EntryClipLink>

export const Default: Story<typeof EntryClipLink> = {}

// ストライプと clip-path、「visit to」
export const Hover: Story<typeof EntryClipLink> = {
  parameters: { catalog: { steps: [{ hover: '.entry-clip__img' }] } },
}
