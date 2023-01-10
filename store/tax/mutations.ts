export const taxMutations = {
  /**
   * post data 記事の詳細
   * @param state
   * @param data
   */
  setCachePosts(state, data) {
    const postSlugs = Object.keys(state.cachePosts)
    // すでに post がない時にだけ追加する
    data.forEach(post => {
      if (postSlugs.indexOf(post.slug) === -1) {
        state.cachePosts[post.slug] = post
      }
    })
  },
  /**
   * list data 一覧データ (slug と ページ番号)
   * @param state
   * @param data
   */
  setCachePages(state, data) {
    if (state.cachePages[data.path]) {
      const pageSlugs = state.cachePages[data.path].slugs
      // console.log('posts data', data)
      data.posts.forEach(post => {
        if (pageSlugs.indexOf(post.slug) === -1) {
          state.cachePages[data.path].slugs.push(post.slug)
        }
      })
      state.cachePages[data.path].slugs = pageSlugs
    } else {
      state.cachePages[data.path] = {
        slugs: data.posts.map(post => post.slug),
        paged: 1
      }
    }
    // console.log('cachePages', state.cachePages)
  },
  /**
   *
   */
  setCurrentPosts(state) {
    state.currentPosts = state.cachePages[state.currentPath]
      ? state.cachePages[state.currentPath].slugs
      : []
  },
  /**
   * api に渡すクエリ
   */
  setCurrentQuery(state, data) {
    state.currentQuery = data
  },
  /**
   * page path (slug)
   */
  setCurrentPath(state, data) {
    state.currentPath = data
  },
  /**
   * set term id / reset posts and pages
   */
  setTerm(state, data) {
    state.cachePosts = {}
    state.cachePages = {}
    state.currentQuery = {}
    state.currentPath = null
    state.currentPosts = []
    state.cachePosts = {}
    state.cachePages = {}

    data && (state.term = data)
  }
}
