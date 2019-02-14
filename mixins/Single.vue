<script>
import HeadMixin from '~/mixins/Head'

export default {
  mixins: [HeadMixin],

  async fetch({ app, store, params, route, payload }) {
    let postType = route.matched[0].path
    postType = postType.replace('/', '').replace('/:id', '')

    // console.log('route route route', postType)

    store.commit(`${postType}/setCurrentPath`, route.path)

    const query = {
      slug: params.id,
      custom_per_page: 1,
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
      // TODO post ??
      // console.log(posts)
    }

    if (!store.state[postType].cachePages[store.state.currentPath]) {
      store.commit(`${postType}/setCachePages`, {
        path: route.path,
        posts: [store.state[postType].cachePosts[params.id]]
      })
    }

    store.commit(`${postType}/setCurrentQuery`, query)
  },

  computed: {
    article() {
      // prettier-ignore
      const page =
                this.$store.state[this.postType].cachePages[this.$store.state[this.postType].currentPath] || {}
      const slug = page.slugs ? page.slugs[0] : null
      return this.$store.state[this.postType].cachePosts[slug] || {}
    },
    featuredImage() {
      if (this.article && this.article.images && this.article.images[0]) {
        const featuredImage = this.article.images[0]
        return featuredImage.sizes.large || featuredImage.sizes.full || false
      } else {
        return { height: 0, width: 0 }
      }
    },
    title() {
      return `${this.article.title} | ${this.$store.state.meta.name}`
    },
    desc() {
      return this.article.excerpt
    }
  }
}
</script>
