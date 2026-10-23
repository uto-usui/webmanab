import EyecatchGrid from '../fixtures/EyecatchGrid.astro'
import type { Meta, Story } from '../types'

// 絵柄は幅で変わらないので 1 幅だけ撮る
export default {
  component: EyecatchGrid,
  args: { variant: 'default' },
  parameters: { catalog: { widths: [1480] } },
} satisfies Meta<typeof EyecatchGrid>

export const Categories: Story<typeof EyecatchGrid> = {}

// 前後記事ナビの背景に使う変種。上に 70% のグレーが重なる前の状態
export const Nav: Story<typeof EyecatchGrid> = { args: { variant: 'nav' } }
