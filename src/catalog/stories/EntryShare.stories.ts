import EntryShare from '../../components/EntryShare.astro'
import { posts } from '../fixtures/posts'
import type { Meta, Story } from '../types'

// headless の Chromium には navigator.share がないので、どちらの分岐もモックで作る（02 の 9.1）
export default {
  component: EntryShare,
  args: {
    url: 'https://webmanab.netlify.app/tip/2016-2017-css-font/',
    title: posts.tip.title,
  },
} satisfies Meta<typeof EntryShare>

export const Supported: Story<typeof EntryShare> = {
  parameters: { catalog: { mocks: ['share-supported'] } },
}

export const Unsupported: Story<typeof EntryShare> = {
  parameters: { catalog: { mocks: ['share-unsupported'] } },
}

export const Copied: Story<typeof EntryShare> = {
  parameters: {
    catalog: {
      mocks: ['share-unsupported', 'hold-timers'],
      steps: [{ click: '.entry-sns__target' }],
    },
  },
}

export const FocusVisible: Story<typeof EntryShare> = {
  parameters: {
    catalog: {
      mocks: ['share-supported'],
      steps: [{ focus: '.entry-sns__target' }],
    },
  },
}

export const Hover: Story<typeof EntryShare> = {
  parameters: {
    catalog: {
      mocks: ['share-supported'],
      steps: [{ hover: '.entry-sns__target' }],
    },
  },
}
