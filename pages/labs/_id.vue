<template>
  <Wrapper>
    <Title1 :text="`${postType}s`" />
    <ArticleList
      :articles="articles"
      :infinite="infinite"
      :tax="tax"
      :query="$store.state.tax.currentQuery"
      :post-type="postType"
    />
  </Wrapper>
</template>

<script>
import Wrapper from '~/components/Wrapper'
import ArticleList from '~/components/ArticleList'
import Title1 from '~/components/Title1'

import TermMixin from '~/mixins/Term'

export default {
  components: {
    ArticleList,
    Wrapper,
    Title1
  },
  mixins: [TermMixin],
  data() {
    return {
      postType: 'lab'
    }
  }
}
</script>
