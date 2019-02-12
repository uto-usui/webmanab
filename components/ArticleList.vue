<template>
  <div class="article-list">
    <div class="article-list__inner">
      <Article v-for="article in articles" :key="article.id" :article="article" />
    </div>
    <no-ssr>
      <InfiniteLoading
        ref="infiniteLoading"
        @infinite="moreArticles"
      >
        <span slot="spinner">
          loading
        </span>
        <span slot="no-results">
          <div>Sorry</div>
        </span>
        <span slot="no-more">
          <div>End</div>
        </span>
      </InfiniteLoading>
    </no-ssr>
  </div>
</template>

<style lang="scss" scoped>
.article-list {
  //
}

.article-list__inner {
  display: flex;
  flex-flow: wrap;
  margin-top: 50px;
  //
  &.js-tab-item {
    display: none;
    //
    &.is-active {
      display: flex;
    }
  }
}
</style>

<script>
import { mapGetters } from 'vuex'
import Article from '~/components/Article.vue'

import InfiniteLoading from 'vue-infinite-loading'

export default {
  components: { Article, InfiniteLoading },
  props: {
    articles: {
      type: Array,
      default: () => []
    },
    query: {
      type: Object,
      default: () => {}
    },
    postType: {
      type: String,
      default: 'tip'
    }
  },
  computed: {
    ...mapGetters([`getCurrentPath`, `getCachePages`])
  },
  methods: {
    // prettier-ignore

    moreArticles(loadingState) {
      // this.$store.state.tip.cachePosts
      if (!this.$store.state[this.postType].cachePages[this.$store.state[this.postType].currentPath]) return
      this.$store.state[this.postType].cachePages[this.$store.state[this.postType].currentPath].paged++
      this.query.page = this.$store.state[this.postType].cachePages[this.$store.state[this.postType].currentPath].paged
      this.$api
        .get(`/${this.postType}`, this.query)
        .then(response => {
          this.$store.commit(`${this.postType}/setCachePages`, {
            path: this.$route.path,
            posts: response.data
          })
          this.$store.commit(`${this.postType}/setCachePosts`, response.data)
          this.$store.commit(`${this.postType}/setCurrentPosts`)
          loadingState.loaded()
          this.$forceUpdate()
        })
        .catch(() => {
          loadingState.complete()
        })

      console.log('ccccc',this[`${this.postType}/setCachePosts`])

    }
  }
}
</script>
