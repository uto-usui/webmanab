<script>
export default {
  data() {
    return {
      infinite: true
    }
  },
  async asyncData({ app, store, params, route, payload }) {
    let postType = route.matched[0].path
    postType = postType.replace('/', '').replace('/:id', '')

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
  },
  computed: {
    articles() {
      return postType => {
        // const page = this.$store.state.cachePages[this.$store.state.currentPath] || {}
        return this.$store.state[postType].currentPosts.map(postSlug => {
          return this.$store.state[postType].cachePosts[postSlug] || {}
        })
      }
    }
  },

  head() {
    return {
      title: `${this.postType} | ${this.$store.state.meta.name}`,
      meta: [
        {
          description:
            (this.article && this.article.excerpt) ||
            `${this.postType} archive page`
        }
      ]
    }
  }
}
</script>
