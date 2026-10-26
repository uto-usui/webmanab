import SearchForm from '../../components/SearchForm.astro'
import type { Meta, Story } from '../types'

// 検索ページと 404 の入力欄（#46）。結果の一覧は記事の索引が要るので、カタログでは扱わない
export default { component: SearchForm } satisfies Meta<typeof SearchForm>

export const Default: Story<typeof SearchForm> = {}

export const FocusInput: Story<typeof SearchForm> = {
  parameters: { catalog: { steps: [{ focus: '.search-form__input' }] } },
}

// 種類の選択は見た目の上では span なので、フォーカスの枠を span に出す。Tab で届くのは選んでいる 1 つだけ
export const FocusType: Story<typeof SearchForm> = {
  parameters: {
    catalog: { steps: [{ focus: '.search-form__type input:checked' }] },
  },
}

export const HoverButton: Story<typeof SearchForm> = {
  parameters: { catalog: { steps: [{ hover: '.search-form__button' }] } },
}
