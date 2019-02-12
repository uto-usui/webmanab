<template>
  <article class="">
    <LazyImage :src="featuredImage.source_url" :alt="featuredImage.alt" />
    <transition name="slide-fade">
      <div class="article-body" :class="{ 'expanded': expanded, 'no-featured-image': !featuredImage }">
        <header class="meta">
          <h1 class="title" v-html="article.title" />
          <div class="details">
            <span class="separator">
              |
            </span>
            <nuxt-link class="author fancy" :to="`/authors/${author.slug}`">
              {{ author.name }}
            </nuxt-link>
          </div>
        </header>
        <section v-html="article.content" />
      </div>
    </transition>
  </article>
</template>

<style lang="scss" scoped>
//
</style>

<script>
import { mapState } from 'vuex'
import LazyImage from '~/components/LazyImage.vue'
// import ArticleFeaturedImage from '~/components/ArticleFeaturedImage'
// import ArticleComments from '~/components/ArticleComments'

export default {
  async asyncData({ app, store, params, route, payload }) {
    console.log('params', params)
    store.commit('setCurrentPath', route.path)

    const query = {
      slug: params.id,
      _embed: 1
    }

    if (!store.state.cachePosts[params.id]) {
      const posts = payload
        ? { data: [app.$api.mapProparty(payload, 'clip')] }
        : await app.$api.get(`/clip`, query)
      store.commit('setCachePages', {
        path: route.path,
        posts: posts.data
      })
      store.commit('setCachePosts', posts.data)
    }

    if (!store.state.cachePages[store.state.currentPath]) {
      store.commit('setCachePages', {
        path: route.path,
        posts: [store.state.cachePosts[params.id]]
      })
    }

    store.commit('setCurrentPosts')
    store.commit('setCurrentQuery', query)
  },

  components: {
    // ArticleComments,
    // ArticleFeaturedImage
    LazyImage
  },

  mixins: {
    // longTimestamp: Function
  },

  data() {
    return {
      expanded: false
    }
  },

  computed: {
    article() {
      const page =
        this.$store.state.cachePages[this.$store.state.currentPath] || {}
      const slug = page.slugs ? page.slugs[0] : null
      return this.$store.state.cachePosts[slug] || {}
      // return this.$store.getters.post || {}
    },
    author() {
      return this.article.author || {}
    },
    featuredImage() {
      if (this.article && this.article.images && this.article.images[0]) {
        const featuredImage = this.article.images[0]
        return featuredImage.sizes.large || featuredImage.sizes.full || false
      } else {
        return { height: 0, width: 0 }
      }
    },
    ...mapState(['currentPath', 'cachePages'])
  },

  head() {
    return {
      title: `${this.article.title} | ${this.$store.state.meta.name}`,
      meta: [{ description: this.article.excerpt }]
    }
  },

  watch: {},

  created() {},

  methods: {}
}
</script>
