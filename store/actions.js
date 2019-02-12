export default {
  nuxtServerInit({ commit, state }, { app }) {
    const description =
      app.head.meta && app.head.meta.find(meta => meta.name === 'description')
    commit('setMeta', {
      name: app.head.title,
      description: description ? description.content : ''
    })
  }
}
