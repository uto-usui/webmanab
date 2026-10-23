import EntryToc from '../../components/EntryToc.astro'
import { headings } from '../fixtures/toc'
import type { Meta, Story } from '../types'

const open = { click: '.entry-toc__title' }

export default {
  component: EntryToc,
  args: { headings: headings.typical },
} satisfies Meta<typeof EntryToc>

export const Closed: Story<typeof EntryToc> = {}

export const Open: Story<typeof EntryToc> = {
  parameters: { catalog: { steps: [open] } },
}

// 開くと max-height の 1400px で切れる量
export const Many: Story<typeof EntryToc> = {
  args: { headings: headings.many },
  parameters: { catalog: { steps: [open] } },
}

export const Empty: Story<typeof EntryToc> = {
  args: { headings: headings.empty },
}
