<template>
  <Wrapper>
    <Title1 :text="postType" />
    <ArticleList
      :articles="articles(postType)"
      :query="$store.state[postType].currentQuery"
      :post-type="postType"
      :infinite="infinite"
    />
  </Wrapper>
</template>

<script>
import Wrapper from '~/components/Wrapper'
import ArticleList from '~/components/ArticleList'
import Title1 from '~/components/Title1'

import ArchiveMixin from '~/mixins/Archive'

export default {
  components: {
    ArticleList,
    Wrapper,
    Title1
  },
  mixins: [ArchiveMixin],
  data() {
    return {
      postType: 'lab'
    }
  }
}
</script>
