import EntryDemo from '../../components/EntryDemo.astro'
import { posts } from '../fixtures/posts'
import type { Meta, Story } from '../types'

export default {
  component: EntryDemo,
  args: { href: posts.lab.demoUrl! },
} satisfies Meta<typeof EntryDemo>

export const Default: Story<typeof EntryDemo> = {}

// ドットが矢印に変わる
export const Hover: Story<typeof EntryDemo> = {
  parameters: { catalog: { steps: [{ hover: '.entry_demo' }] } },
}
