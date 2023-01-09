import VueScrollTo from 'vue-scrollto'
import { defineNuxtPlugin } from 'nuxt/app'

export default defineNuxtPlugin(nuxtApp => {
  nuxtApp.vueApp.use(VueScrollTo, {
    easing: [1.0, 0.0, 0.0, 1.0],
    duration: 1000,
    offset: -65
  })
})
