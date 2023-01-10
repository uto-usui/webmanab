export const taxGetters = {
  currentPage(state) {
    return state.cachePages[state.currentPath] || {}
  },
  posts(state, getters) {
    return getters.currentPage.slugs
      ? getters.currentPage.slugs.map(postSlug => {
          return state.cachePosts[postSlug] || {}
        })
      : []
  },
  post(state, getters) {
    return getters.posts[0] || {}
  },
  getCurrentQuery(state) {
    return state.currentQuery
  },
  getCurrentPath(state) {
    return state.currentPath
  },
  getCurrentPosts(state) {
    return state.currentPosts
  },
  getCachePosts(state) {
    return state.cachePosts
  },
  getCachePages(state) {
    return state.cachePages
  },
  getCacheCategories(state) {
    return state.cacheCategories
  },
  getCacheAuthors(state) {
    return state.cacheAuthors
  }
}
