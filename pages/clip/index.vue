<template>
  <section class="container">
    <div>
      <ArticleList
        :articles="articles"
        :query="$store.state.currentQuery"
      />
    </div>
  </section>
</template>

<script>
import ArticleList from '~/components/ArticleList'
import { mapGetters, mapState } from 'vuex'

export default {
  components: {
    ArticleList
  },
  async asyncData({ app, store, params, route }) {
    store.commit('setCurrentPath', route.path)

    const query = {
      orderby: 'date',
      per_page: 2,
      page: 1,
      _embed: 1
    }

    if (!store.state.cachePages[route.path]) {
      // api get response
      const posts = await app.$api.get('/clip', query)

      store.commit('setCachePages', {
        path: route.path,
        posts: posts.data
      })
      store.commit('setCachePosts', posts.data)
    }

    store.commit('setCurrentPosts')
    store.commit('setCurrentQuery', query)
  },
  computed: {
    articles() {
      // const page = this.$store.state.cachePages[this.$store.state.currentPath] || {}
      return this.$store.state.currentPosts.map(postSlug => {
        return this.$store.state.cachePosts[postSlug] || {}
      })
    },
    ...mapState([]),
    ...mapGetters([])
  }
}
</script>

<style>
.container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  margin: 0 auto;
  text-align: center;
}

.title {
  display: block;
  font-family: 'Quicksand', 'Source Sans Pro', -apple-system, BlinkMacSystemFont,
    'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  font-size: 100px;
  font-weight: 300;
  color: #35495e;
  letter-spacing: 1px;
}
</style>
