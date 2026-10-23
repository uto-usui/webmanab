import ArticleCard from '../fixtures/ArticleCard.astro'
import { posts } from '../fixtures/posts'
import type { Meta, Story } from '../types'

export default {
  component: ArticleCard,
  args: { post: posts.tip },
} satisfies Meta<typeof ArticleCard>

export const Tip: Story<typeof ArticleCard> = {}

// タイトルのリンクは clipUrl へ新しいタブで
export const Clip: Story<typeof ArticleCard> = {
  args: { post: posts.clipManyTerms },
}

export const Lab: Story<typeof ArticleCard> = { args: { post: posts.lab } }

export const LongTitle: Story<typeof ArticleCard> = {
  args: { post: posts.clipLongTitle },
}

// 白抜きの頭文字がなく、タグの線だけが出る
export const EmptyPrimaryTag: Story<typeof ArticleCard> = {
  args: { post: posts.clipEmptyPrimaryTag },
}

export const ImageLoading: Story<typeof ArticleCard> = {
  parameters: { catalog: { mocks: ['eyecatch-pending'] } },
}

export const ImageHover: Story<typeof ArticleCard> = {
  parameters: { catalog: { steps: [{ hover: '.article-item__img-wrap' }] } },
}

export const TitleHover: Story<typeof ArticleCard> = {
  parameters: { catalog: { steps: [{ hover: '.article-item__target' }] } },
}
