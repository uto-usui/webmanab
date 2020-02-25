<script>
import HeadMixin from '~/mixins/Head'

export default {
  mixins: [HeadMixin],
  data() {
    return {
      infinite: true,
      tax: true
    }
  },
  computed: {
    articles() {
      return this.$store.state.tax.currentPosts.map(postSlug => {
        return this.$store.state.tax.cachePosts[postSlug] || {}
      })
    },
    title() {
      return `${this.postType} | ${this.$store.state.meta.name}`
    },
    desc() {
      return `${this.postType} archive page`
    }
  },
  async fetch({ app, store, params, route }) {
    let postType = route.matched[0].path
    postType = postType.replace('/', '').replace('s/:id?', '')

    const taxonomy = `${postType}s`

    store.commit(`tax/setTerm`, params.id)
    store.commit(`tax/setCurrentPath`, route.path)

    const query = {
      custom_per_page: 8,
      page: 1,
      _embed: 1
    }
    // taxonomy に term の idをセットする
    query[taxonomy] = params.id

    if (!store.state.tax.cachePages[route.path]) {
      const posts = await app.$api.get(`/${postType}`, query)

      store.commit(`tax/setCachePages`, {
        path: route.path,
        posts: posts.data
      })
      store.commit(`tax/setCachePosts`, posts.data)
    }

    store.commit(`tax/setCurrentPosts`)
    store.commit(`tax/setCurrentQuery`, query)
  }
}
</script>
