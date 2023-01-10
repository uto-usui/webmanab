import { createStore } from 'vuex'

import { tipState } from '~/store/tip/state'
import { tipMutations } from '~/store/tip/mutations'
import { tipActions } from '~/store/tip/actions'
import { tipGetters } from '~/store/tip/getters'

import { taxState } from '~/store/tax/state'
import { taxMutations } from '~/store/tax/mutations'
import { taxActions } from '~/store/tax/actions'
import { taxGetters } from '~/store/tax/getters'

import { state } from '~/store/state'
import { mutations } from '~/store/mutations'
import { actions } from '~/store/actions'
import { getters } from '~/store/getters'

const store = createStore({
  modules: {
    tip: {
      namespaced: true,
      state: tipState,
      mutations: tipMutations,
      actions: tipActions,
      getters: tipGetters
    },
    tax: {
      namespaced: true,
      state: taxState,
      mutations: taxMutations,
      actions: taxActions,
      getters: taxGetters
    }
  },
  state,
  mutations,
  actions,
  getters
})

export default defineNuxtPlugin(nuxtApp => {
  nuxtApp.vueApp.use(store)
})
