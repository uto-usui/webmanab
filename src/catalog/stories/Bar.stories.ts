import type { Meta, Story } from '../types'
import Bars from '../fixtures/Bars.astro'

export default { component: Bars } satisfies Meta<typeof Bars>

export const Default: Story<typeof Bars> = {}
