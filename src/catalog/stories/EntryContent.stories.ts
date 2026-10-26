import EntryContentSample from '../fixtures/EntryContentSample.astro'
import type { Meta, Story } from '../types'

export default {
  component: EntryContentSample,
  args: { sample: 'elements' },
} satisfies Meta<typeof EntryContentSample>

// 02 の 6.1 の要素をひととおり
export const Elements: Story<typeof EntryContentSample> = {}

// highlight.js 10.1.1 の色、先頭の空行、末尾の改行の数、はみ出す行
export const Code: Story<typeof EntryContentSample> = {
  args: { sample: 'code' },
}

// コードのコピーのボタンは、ブロックにマウスを載せたときだけ出る（#49）
export const CodeHover: Story<typeof EntryContentSample> = {
  args: { sample: 'code' },
  parameters: { catalog: { steps: [{ hover: '.code-copy-wrap' }] } },
}

// dl、style、input、figure、p > iframe
export const RawHtml: Story<typeof EntryContentSample> = {
  args: { sample: 'raw-html' },
}
