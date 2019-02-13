<template>
  <Wrapper>
    <SectionList v-for="(item, index) in $store.state.postTypes" :key="`postType${index}`">
      <Title1 :text="item" />
      <ArticleList
        :articles="articles(item)"
        :query="$store.state[item].currentQuery"
        :post-type="item"
      />
    </SectionList>
  </Wrapper>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import Wrapper from '~/components/Wrapper'
import ArticleList from '~/components/ArticleList'
import Title1 from '~/components/Title1'
import SectionList from '~/components/SectionList'

export default {
  components: {
    Title1,
    ArticleList,
    Wrapper,
    SectionList
  },
  async asyncData({ app, store, params, route, payload }) {
    for (const postType of store.state.postTypes) {
      store.commit(`${postType}/setCurrentPath`, route.path)

      const query = {
        orderby: 'date',
        per_page: 8,
        page: 1,
        _embed: 1
      }

      if (!store.state[postType].cachePages[route.path]) {
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
    }
  },
  computed: {
    /**
     * 引数として postType を与える
     * @return {function(*): (*|{})[]}
     */
    articles() {
      return postType => {
        // const page = this.$store.state.cachePages[this.$store.state.currentPath] || {}
        return this.$store.state[postType].currentPosts.map(postSlug => {
          return this.$store.state[postType].cachePosts[postSlug] || {}
        })
      }
    },
    // articlesClip() {
    //   // const page = this.$store.state.cachePages[this.$store.state.currentPath] || {}
    //   return this.$store.state[postTypes[1]].currentPosts.map(postSlug => {
    //     return this.$store.state[postTypes[1]].cachePosts[postSlug] || {}
    //   })
    // },
    ...mapState([]),
    ...mapGetters([])
  }
  // async mounted() {
  //   const res = await this.$axios.get(
  //     'https://webmanab-html.com/wp-json/wp/v2/clip?page=1'
  //   )
  //   console.log(res)
  // }
}
</script>
