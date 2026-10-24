import Loader from '../../components/Loader.astro'
import type { Meta, Story } from '../types'

// position: fixed で画面の中央に出る
export default {
  component: Loader,
  parameters: { catalog: { viewportOnly: true } },
} satisfies Meta<typeof Loader>

export const Default: Story<typeof Loader> = {}
