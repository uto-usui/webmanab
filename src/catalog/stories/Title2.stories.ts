import Title2 from '../../components/Title2.astro'
import type { Meta, Story } from '../types'

export default { component: Title2 } satisfies Meta<typeof Title2>

export const Share: Story<typeof Title2> = { args: { slot: 'share <br />ー' } }

export const Tag: Story<typeof Title2> = { args: { slot: 'tag <br />ー' } }

export const Related: Story<typeof Title2> = {
  args: { slot: 'related <br />ー' },
}
