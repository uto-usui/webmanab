import Title1 from '../../components/Title1.astro'
import type { Meta, Story } from '../types'

// ホバーで上に出る「All View」と左右にずれる影が切れないよう、まわりを空ける
export default {
  component: Title1,
  args: { text: 'tip' },
  parameters: { catalog: { padding: 160 } },
} satisfies Meta<typeof Title1>

export const Tip: Story<typeof Title1> = {}

export const Clip: Story<typeof Title1> = { args: { text: 'clip' } }

export const Lab: Story<typeof Title1> = { args: { text: 'lab' } }

// ターム一覧の見出し。/tips/ のページはないので一覧へ向ける
export const Tips: Story<typeof Title1> = {
  args: { text: 'tips', href: '/tip/' },
}

export const Hover: Story<typeof Title1> = {
  parameters: { catalog: { steps: [{ hover: '.h1__inner > a' }] } },
}
