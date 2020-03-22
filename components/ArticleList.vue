<template>
  <div class="article-list">
    <div class="article-list__inner">
      <Article v-for="article in articles" :key="article.id" :article="article" />
    </div>
    <client-only>
      <InfiniteLoading
        v-if="infinite && articles.length % 8 === 0"
        ref="infiniteLoading"
        @infinite="moreArticles"
      >
        <Loader slot="spinner" />
        <span slot="no-results">
          <div>End</div>
        </span>
        <span slot="no-more">
          <div>End</div>
        </span>
      </InfiniteLoading>
    </client-only>
  </div>
</template>

<style lang="scss" scoped>
.article-list {
  margin-top: get-line-height(7, -2, 1);
  //
  @include desktop {
    margin-top: get-line-height(7, 0, 1);
  }
}

.article-list__inner {
  display: flex;
  flex-flow: wrap;
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
import InfiniteLoading from 'vue-infinite-loading'
import Article from '~/components/Article'

import Loader from '~/components/Loader'

export default {
  components: { Loader, Article, InfiniteLoading },
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
    },
    infinite: {
      type: Boolean,
      default: false
    },
    tax: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    ...mapGetters([`getCurrentPath`, `getCachePages`])
  },
  methods: {
    // prettier-ignore

    moreArticles(loadingState) {

      if (this.tax) {
        if (!this.$store.state.tax.cachePages[this.$store.state.tax.currentPath]) return
        this.$store.state.tax.cachePages[this.$store.state.tax.currentPath].paged++
        this.query.page = this.$store.state.tax.cachePages[this.$store.state.tax.currentPath].paged
        this.$api
          .get(`/${this.postType}`, this.query)
          .then(response => {
            this.$store.commit(`tax/setCachePages`, {
              path: this.$route.path,
              posts: response.data
            })
            this.$store.commit(`tax/setCachePosts`, response.data)
            this.$store.commit(`tax/setCurrentPosts`)
            loadingState.loaded()
            this.$forceUpdate()
          })
          .catch(() => {
            loadingState.complete()
          })
      } else {
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
      }
    }
  }
}
</script>
