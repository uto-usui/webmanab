<script>
import HeadMixin from '~/mixins/Head'

export default {
  mixins: [HeadMixin],
  data() {
    return {
      infinite: true
    }
  },
  async fetch({ app, store, params, route, payload }) {
    let postType = route.matched[0].path
    postType = postType.replace('/', '').replace('/:id', '')

    store.commit(`${postType}/setCurrentPath`, route.path)

    const query = {
      orderby: 'date',
      custom_per_page: 8,
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
        return this.$store.state[postType].currentPosts.map(postSlug => {
          return this.$store.state[postType].cachePosts[postSlug] || {}
        })
      }
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
