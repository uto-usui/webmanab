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

// labobal.dev のデモには動画を添える。テストでは外への通信を止めるので、動画とポスター画像は出ず枠だけになる
export const Preview: Story<typeof EntryDemo> = {
  args: { href: 'https://labobal.dev/three-video/' },
}
