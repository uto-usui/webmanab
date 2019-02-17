const path = require('path')
const axios = require('axios')
const StylelintPlugin = require('stylelint-webpack-plugin')
const pkg = require('./package')

const apiUrl = 'https://wp.webmanab-html.com/wp-json/wp/v2/'

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
      { rel: 'shortcut icon', type: 'image/x-icon', href: '/favicon.ico' },
      { rel: 'apple-touch-icon-precomposed', href: '/apple-touch-icon.png' },
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
  plugins: [
    '~plugins/vue-lazyload.client.js',
    '~plugins/console.js',
    '~plugins/scrollTo.js'
  ],

  /*
  ** Nuxt.js modules
  */
  modules: [
    '@nuxtjs/axios',
    '@nuxtjs/pwa',
    '@nuxtjs/style-resources',
    '@nuxtjs/sitemap',
    [
      '@nuxtjs/google-adsense',
      {
        id: 'ca-pub-2691922878827958'
      }
    ],
    [
      '~/modules/api',
      {
        config: '~/api.config.js',
        baseURI: `${apiUrl}`
      }
    ]
  ],

  sitemap: {
    path: '/sitemap.xml',
    hostname: 'https://webmanab-html.com',
    generate: true,
    routes(callback) {
      Promise.all([
        axios.get(`${apiUrl}tip?custom_per_page=1000`),
        axios.get(`${apiUrl}clip?custom_per_page=1000`),
        axios.get(`${apiUrl}tips`),
        axios.get(`${apiUrl}clips`)
      ])
        .then(data => {
          const tip = data[0]
          const clip = data[1]
          const tips = data[2]
          const clips = data[3]

          const arr = tip.data
            .map(el => {
              return {
                route: '/tip/' + el.slug,
                payload: el
              }
            })
            .concat(
              clip.data.map(el => {
                return {
                  route: '/clip/' + el.slug,
                  payload: el
                }
              })
            )
            .concat(
              tips.data.map(el => {
                return {
                  route: '/tips/' + el.id,
                  payload: el
                }
              })
            )
            .concat(
              clips.data.map(el => {
                return {
                  route: '/clips/' + el.id,
                  payload: el
                }
              })
            )

          callback(null, arr)
        })

        .catch(callback)
    }
  },

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
    interval: 500,
    routes(callback) {
      Promise.all([
        axios.get(`${apiUrl}tip?custom_per_page=1000&_embed=1`),
        axios.get(`${apiUrl}clip?custom_per_page=1000&_embed=1`),
        axios.get(`${apiUrl}tips`),
        axios.get(`${apiUrl}clips`)
      ])
        .then(data => {
          const tip = data[0]
          const clip = data[1]
          const tips = data[2]
          const clips = data[3]

          const arr = tip.data
            .map(el => {
              return {
                route: '/tip/' + el.slug,
                payload: el
              }
            })
            .concat(
              clip.data.map(el => {
                return {
                  route: '/clip/' + el.slug,
                  payload: el
                }
              })
            )
            .concat(
              tips.data.map(el => {
                return {
                  route: '/tips/' + el.id,
                  payload: el
                }
              })
            )
            .concat(
              clips.data.map(el => {
                return {
                  route: '/clips/' + el.id,
                  payload: el
                }
              })
            )

          callback(null, arr)
        })

        .catch(callback)
    }
  }
}

// tax
// https://v2.wp-api.org/reference/taxonomies/
// https://webmanab-html.com/wp-json/wp/v2/tips
// https://webmanab-html.com/wp-json/wp/v2/clips

// acf
// https://wordpress.org/plugins/wp-rest-filter/#description
// https://webmanab-html.com/wp-json/wp/v2/tip?filter[meta_key]=primary-tag&filter[meta_value]=javascript
// https://webmanab-html.com/wp-json/wp/v2/tip?filter[taxonomy]=tips&filter[term_id]=80

// search
// https://webmanab-html.com/wp-json/wp/v2/tip?per_page=10&search=js

// max
// https://stackoverflow.com/questions/35728943/wordpress-rest-api-v2-return-all-posts

// pagination
// https://developer.wordpress.org/rest-api/using-the-rest-api/pagination/

// next prev

// pwa
// https://qiita.com/gyarasu/items/b5c34b6aac02cb325b79

// term を slug にする
// https://github.com/WP-API/rest-filter
