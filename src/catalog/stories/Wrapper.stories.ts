import Wrapper from '../../components/Wrapper.astro'
import type { Meta, Story } from '../types'

export default {
  component: Wrapper,
  args: { slot: '<p>wrapper の中身</p>' },
} satisfies Meta<typeof Wrapper>

export const Default: Story<typeof Wrapper> = {}
