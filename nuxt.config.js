const path = require('path')
const axios = require('axios')
const StylelintPlugin = require('stylelint-webpack-plugin')
const pkg = require('./package')

const apiUrl = 'https://webmanab-html.com/wp-json/wp/v2/'

module.exports = {
  mode: 'universal',

  /*
  ** Headers of the page
  */
  head: {
    title: pkg.name,
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: pkg.description }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      {
        rel: 'stylesheet',
        href:
          'https://fonts.googleapis.com/css?family=Open+Sans:400,400italic,700|Source+Code+Pro'
      }
    ]
  },

  /*
  ** Customize the progress-bar color
  */
  loading: { color: '#fff' },

  /*
  ** Global CSS
  */
  css: [],

  /*
  ** Plugins to load before mounting the App
  */
  plugins: ['~plugins/vue-lazyload.client.js', '~plugins/console.js'],

  /*
  ** Nuxt.js modules
  */
  modules: [
    '@nuxtjs/axios',
    '@nuxtjs/pwa',
    '@nuxtjs/style-resources',
    [
      '~/modules/api',
      {
        config: '~/api.config.js',
        baseURI: `${apiUrl}`
      }
    ]
  ],
  styleResources: {
    scss: [
      '~/assets/sass/foundation/variable/_variable.scss',
      '~/assets/sass/foundation/mixin/_mixin.scss'
    ]
  },
  /*
  ** Axios module configuration
  */
  axios: {
    // See https://github.com/nuxt-community/axios-module#options
  },

  /*
  ** Build configuration
  */
  build: {
    splitChunks: {
      layouts: true
    },
    postcss: [
      require('autoprefixer')({
        browsers: ['IE 11', 'last 2 versions'],
        grid: true
      })
    ],
    /*
    ** You can extend webpack config here
    */
    extend(config, ctx) {
      // Run ESLint on save
      if (ctx.isDev && ctx.isClient) {
        config.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /(node_modules)/
        })
        config.plugins.push(
          new StylelintPlugin({
            files: ['**/*.vue']
          })
        )
      }
      // import alias
      config.resolve.alias.Sass = path.resolve(__dirname, './assets/sass/')
      config.resolve.alias.Js = path.resolve(__dirname, './assets/js/')
      config.resolve.alias.Images = path.resolve(__dirname, './assets/images/')
      config.resolve.alias['~'] = path.resolve(__dirname)
      config.resolve.alias['@'] = path.resolve(__dirname)
    }
  },
  generate: {
    interval: 1000,
    routes() {
      return Promise.all([
        axios.get(`${apiUrl}tip?per_page=10&page=1&_embed`),
        axios.get(`${apiUrl}clip?per_page=10&page=1&_embed`)
      ]).then(data => {
        const tips = data[0]
        const clips = data[1]
        return tips.data
          .map(tip => {
            return {
              route: '/tip/' + tip.slug,
              payload: tip
            }
          })
          .concat(
            clips.data.map(clip => {
              return {
                route: '/clip/' + clip.slug,
                payload: clip
              }
            })
          )
      })
    }
  }
}

// tax
// https://v2.wp-api.org/reference/taxonomies/
// https://webmanab-html.com/wp-json/wp/v2/tips
// https://webmanab-html.com/wp-json/wp/v2/clips

// search
// https://webmanab-html.com/wp-json/wp/v2/tip?per_page=10&search=js

// max
// https://stackoverflow.com/questions/35728943/wordpress-rest-api-v2-return-all-posts

// pagenation
// https://developer.wordpress.org/rest-api/using-the-rest-api/pagination/

// next prev
// https://stackoverflow.com/questions/42546957/wordpress-api-json-how-to-get-prev-and-next-posts-in-single-post/48289814
// post_title;
// eye https://qiita.com/gatespace/items/34b9c71378bbfc20b6f0
// https://webmanab-html.com/tip/wordpress-eyecatch/

// pwa
// https://qiita.com/gyarasu/items/b5c34b6aac02cb325b79
