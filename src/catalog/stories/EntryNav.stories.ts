import EntryNav from '../../components/EntryNav.astro'
import { lists } from '../fixtures/list'
import type { Meta, Story } from '../types'

// 背景はナビ用のアイキャッチ（/eyecatch/tip/{id}-nav.svg）。fixtures の id は実在の記事
const [next, prev] = lists.eight

export default {
  component: EntryNav,
  args: { prev, next },
} satisfies Meta<typeof EntryNav>

export const Both: Story<typeof EntryNav> = {}

export const PrevOnly: Story<typeof EntryNav> = { args: { next: null } }

// 片方だけのとき next は右に寄る（README 4 章）
export const NextOnly: Story<typeof EntryNav> = { args: { prev: null } }

export const HoverPrev: Story<typeof EntryNav> = {
  parameters: {
    catalog: {
      steps: [{ hover: '.entry-nav__item--prev .entry-nav__target' }],
    },
  },
}

export const HoverNext: Story<typeof EntryNav> = {
  parameters: {
    catalog: {
      steps: [{ hover: '.entry-nav__item--next .entry-nav__target' }],
    },
  },
}
