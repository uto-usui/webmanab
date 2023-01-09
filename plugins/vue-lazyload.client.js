import VueLazyload from 'vue-lazyload'
import { defineNuxtPlugin } from 'nuxt/app'

export default defineNuxtPlugin(nuxtApp => {
  nuxtApp.vueApp.use(VueLazyload, {
    preLoad: 1.1,
    attempt: 1,
    observer: true,
    observerOptions: {
      rootMargin: '0px',
      threshold: 0.1
    },
    lazyComponent: true
  })
})
