<template>
  <Wrapper>
    <Title1 />
    <ArticleList
      :articles="articles"
      :query="$store.state.tip.currentQuery"
      :post-type="`tip`"
    />
  </Wrapper>
</template>

<script>
import Wrapper from '~/components/Wrapper'
import ArticleList from '~/components/ArticleList'
import { mapGetters, mapState } from 'vuex'
import Title1 from '~/components/Title1'

const postType = 'tip'

export default {
  components: {
    Title1,
    ArticleList,
    Wrapper
  },
  async asyncData({ app, store, params, route, payload }) {
    store.commit(`${postType}/setCurrentPath`, route.path)

    const query = {
      orderby: 'date',
      per_page: 16,
      page: 1,
      _embed: 1
    }

    if (!store.state.tip.cachePages[route.path]) {
      // api get response
      const posts = payload
        ? { data: [app.$api.mapProparty(payload, postType)] }
        : await app.$api.get(`/${postType}`, query)

      store.commit(`${postType}/setCachePages`, {
        path: route.path,
        posts: posts.data
      })
      store.commit(`${postType}/setCachePosts`, posts.data)
    }

    store.commit(`${postType}/setCurrentPosts`)
    store.commit(`${postType}/setCurrentQuery`, query)
  },
  computed: {
    articles() {
      // const page = this.$store.state.cachePages[this.$store.state.currentPath] || {}
      return this.$store.state[postType].currentPosts.map(postSlug => {
        return this.$store.state[postType].cachePosts[postSlug] || {}
      })
    },
    ...mapState([]),
    ...mapGetters([])
  },
  async mounted() {
    const res = await this.$axios.get(
      'https://webmanab-html.com/wp-json/wp/v2/clip?page=1'
    )
    console.log(res)
  }
}
</script>
