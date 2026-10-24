import Header from '../../components/Header.astro'
import type { Meta, Story } from '../types'

// 現在地の aria-current は Astro.url から決まり props で渡せないので、story では扱わない
export default { component: Header } satisfies Meta<typeof Header>

export const Default: Story<typeof Header> = {}

// 固定は 1080px から（02 の 5.2）
export const Fixed: Story<typeof Header> = {
  parameters: {
    catalog: {
      steps: [{ scroll: 300 }],
      widths: [1080, 1480],
      minHeight: 2000,
      viewportOnly: true,
    },
  },
}

export const NotFixedOnTablet: Story<typeof Header> = {
  parameters: {
    catalog: {
      steps: [{ scroll: 300 }],
      widths: [768],
      minHeight: 2000,
      viewportOnly: true,
    },
  },
}
