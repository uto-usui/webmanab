import type { Meta, Story } from '../types'
import LayoutPage from '../fixtures/LayoutPage.astro'

export default {
  component: LayoutPage,
  parameters: { catalog: { page: true } },
} satisfies Meta<typeof LayoutPage>

export const Default: Story<typeof LayoutPage> = {}

export const MenuOpen: Story<typeof LayoutPage> = {
  parameters: {
    catalog: {
      page: true,
      steps: [{ click: '.menu__btn' }],
      viewportOnly: true,
    },
  },
}
