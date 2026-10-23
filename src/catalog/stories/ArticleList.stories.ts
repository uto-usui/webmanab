import ArticleList from '../../components/ArticleList.astro'
import { lists } from '../fixtures/list'
import type { Meta, Story } from '../types'

// endpoint は src/catalog/data.json.ts が fixtures から出す JSON。いちばん下までスクロールして続きを読ませる
const scrollToEnd = { scroll: 100_000 }

export default {
  component: ArticleList,
  args: { posts: lists.eight },
} satisfies Meta<typeof ArticleList>

// トップの形。endpoint がないので 8 件で止まり、読み込み口も出ない
export const Eight: Story<typeof ArticleList> = {}

export const Loading: Story<typeof ArticleList> = {
  args: { posts: lists.sixteen, endpoint: '/catalog/data/sixteen/' },
  parameters: {
    catalog: {
      mocks: ['list-pending'],
      steps: [scrollToEnd, { waitFor: '[data-infinite-loader]:not([hidden])' }],
      viewportOnly: true,
    },
  },
}

// 16 件は 8 の倍数なので、2 ページ目のあと End が出る
export const End: Story<typeof ArticleList> = {
  args: { posts: lists.sixteen, endpoint: '/catalog/data/sixteen/' },
  parameters: {
    catalog: {
      steps: [scrollToEnd, { waitFor: '[data-infinite-end]:not([hidden])' }],
    },
  },
}

// 12 件は 8 の倍数でないので、2 ページ目のあと読み込み口ごと消える
export const NoMore: Story<typeof ArticleList> = {
  args: { posts: lists.twelve, endpoint: '/catalog/data/twelve/' },
  parameters: {
    catalog: {
      steps: [scrollToEnd, { waitFor: '.article-item:nth-child(12)' }],
    },
  },
}

// 0 件でも読み込み口は出て、すぐ End になる
export const Empty: Story<typeof ArticleList> = {
  args: { posts: lists.empty, endpoint: '/catalog/data/empty/' },
  parameters: {
    catalog: { steps: [{ waitFor: '[data-infinite-end]:not([hidden])' }] },
  },
}
