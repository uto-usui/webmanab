import Menu from '../../components/Menu.astro'
import { manyClips, typical } from '../fixtures/terms'
import type { Meta, Story } from '../types'

export default { component: Menu, args: typical } satisfies Meta<typeof Menu>

export const Closed: Story<typeof Menu> = {}

export const Open: Story<typeof Menu> = {
  parameters: {
    catalog: { steps: [{ click: '.menu__btn' }], viewportOnly: true },
  },
}

export const FocusVisible: Story<typeof Menu> = {
  parameters: { catalog: { steps: [{ focus: '.menu__btn' }] } },
}

// 〜767px で .menu-list の max-height を超えてスクロールする
export const ManyTerms: Story<typeof Menu> = {
  args: { clips: manyClips },
  parameters: {
    catalog: { steps: [{ click: '.menu__btn' }], viewportOnly: true },
  },
}

export const ItemHover: Story<typeof Menu> = {
  parameters: {
    catalog: {
      steps: [{ click: '.menu__btn' }, { hover: '.menu-list__target' }],
      viewportOnly: true,
    },
  },
}
