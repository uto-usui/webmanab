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

// labobal.dev のデモには動画と、GitHub のコードへの CODE を添える。テストでは外への通信を止めるので、動画とポスター画像は出ず枠だけになる
export const Preview: Story<typeof EntryDemo> = {
  args: { href: 'https://labobal.dev/three-video/' },
}

// 動画に触れると、右下に一時停止のボタンが出る
export const PreviewHover: Story<typeof EntryDemo> = {
  args: { href: 'https://labobal.dev/three-video/' },
  parameters: { catalog: { steps: [{ hover: '.entry-demo__preview' }] } },
}

// 本文に同じデモの iframe があるときは、動画を出さず DEMO と CODE だけにする
export const Embedded: Story<typeof EntryDemo> = {
  args: {
    href: 'https://labobal.dev/three-video/',
    body: '<p><iframe src="https://labobal.dev/three-video/"></iframe></p>',
  },
}
