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

// 2026-10-25 以降に書き直した記事は、公開日の横に更新日を出す（#48）。日付は箱の上に出るのでまわりを空ける
export const Updated: Story<typeof EntryHead> = {
  parameters: { catalog: { padding: 40 } },
  args: {
    entry: toEntry({
      ...posts.tip,
      modified: new Date('2026-11-03T10:00:00+09:00'),
    }),
  },
}

export const LongTitle: Story<typeof EntryHead> = {
  args: { entry: toEntry(posts.clipLongTitle) },
}

export const TargetHover: Story<typeof EntryHead> = {
  parameters: {
    catalog: { steps: [{ hover: 'a.entry-head__target' }] },
  },
}
