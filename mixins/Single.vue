<script>
export default {
  async asyncData({ app, store, params, route, payload }) {
    // get post type
    let postType = route.matched[0].path
    postType = postType.replace('/', '').replace('/:id', '')

    store.commit(`${postType}/setCurrentPath`, route.path)

    const query = {
      slug: params.id,
      _embed: 1
    }

    if (!store.state[postType].cachePosts[params.id]) {
      const posts = payload
        ? { data: [app.$api.mapProparty(payload, postType)] }
        : await app.$api.get(`/${postType}`, query)

      store.commit(`${postType}/setCachePages`, {
        path: route.path,
        posts: posts.data
      })
      store.commit(`${postType}/setCachePosts`, posts.data)
    }

    if (!store.state[postType].cachePages[store.state.currentPath]) {
      store.commit(`${postType}/setCachePages`, {
        path: route.path,
        posts: [store.state[postType].cachePosts[params.id]]
      })
    }

    store.commit(`${postType}/setCurrentPosts`)
    store.commit(`${postType}/setCurrentQuery`, query)
  },

  computed: {
    article() {
      // prettier-ignore
      const page =
              this.$store.state[this.postType].cachePages[this.$store.state[this.postType].currentPath] || {}
      const slug = page.slugs ? page.slugs[0] : null
      return this.$store.state[this.postType].cachePosts[slug] || {}
      // return this.$store.getters.post || {}
    },
    featuredImage() {
      if (this.article && this.article.images && this.article.images[0]) {
        const featuredImage = this.article.images[0]
        return featuredImage.sizes.large || featuredImage.sizes.full || false
      } else {
        return { height: 0, width: 0 }
      }
    }
  },

  head() {
    return {
      title: `${this.article.title} | ${this.$store.state.meta.name}`,
      meta: [{ description: this.article.excerpt }]
    }
  }
}
</script>
