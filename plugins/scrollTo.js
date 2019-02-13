import Vue from 'vue'
import VueScrollTo from 'vue-scrollto'

Vue.use(VueScrollTo, {
  easing: [1.0, 0.0, 0.0, 1.0],
  duration: 1000,
  offset: -65
})
