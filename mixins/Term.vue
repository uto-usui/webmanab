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
  async fetch({ app, store, params, route }) {
    let postType = route.matched[0].path
    postType = postType.replace('/', '').replace('s/:id?', '')

    const taxonomy = `${postType}s`
    // set tax / reset pages and posts

    store.commit(`tax/setTerm`, params.id)
    store.commit(`tax/setCurrentPath`, route.path)

    const query = {
      per_page: 8,
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

      console.log('posts.data posts.data posts.data', posts.data)
      console.log('state.tax state.tax state.tax', store.state.tax)
    }

    store.commit(`tax/setCurrentPosts`)
    store.commit(`tax/setCurrentQuery`, query)

    console.log('taxonomy taxonomy taxonomy', taxonomy)
    console.log('query query query', query)
    console.log('postType postType postType', postType)
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
  }
}
</script>
