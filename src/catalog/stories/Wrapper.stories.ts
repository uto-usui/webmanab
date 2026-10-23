import type { Meta, Story } from '../types'
import WrapperPage from '../fixtures/WrapperPage.astro'

export default { component: WrapperPage } satisfies Meta<typeof WrapperPage>

export const Default: Story<typeof WrapperPage> = {}
