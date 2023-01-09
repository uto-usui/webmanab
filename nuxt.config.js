const path = require('path')
const axios = require('axios')
const StylelintPlugin = require('stylelint-webpack-plugin')

const apiUrl = 'https://wp.webmanab-html.com/wp-json/wp/v2/'

module.exports = {
  mode: 'universal',

  /*
  ** Headers of the page
  */
  head: {
    title: 'webmanab.html／ウェブまなぶ',
    htmlAttrs: {
      lang: 'ja'
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      {
        hid: 'description',
        name: 'description',
        content:
          'ウェブ制作のあれこれについて学習したことをメモしたりクリップしたり気ままに綴っていきます。'
      }
    ],
    link: [
      { rel: 'shortcut icon', type: 'image/x-icon', href: '/favicon.ico' },
      { rel: 'apple-touch-icon-precomposed', href: '/apple-touch-icon.png' },
      {
        rel: 'stylesheet',
        href:
          'https://fonts.googleapis.com/css?family=Open+Sans:400,400italic,700,700italic|Source+Code+Pro'
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
    '@nuxtjs/feed',
    [
      '@nuxtjs/google-adsense',
      {
        id: 'ca-pub-2691922878827958'
      }
    ],
    ['@nuxtjs/google-gtag', { id: 'UA-69841076-1' }],
    [
      '~/modules/api',
      {
        config: '~/api.config.js',
        baseURI: `${apiUrl}`
      }
    ]
  ],

  /**
   * create rss feed
   */
  feed: [
    {
      path: '/feed.xml',
      async create(feed) {
        const res = await axios.get(`${apiUrl}tip?custom_per_page=50`)

        res.data.forEach(post => {
          const url = `https://webmanab-html.com/${post.type}/${post.slug}`
          feed.addItem({
            title: post.title,
            id: post.slug,
            link: url,
            description: post.excerpt.rendered,
            content: post.content.rendered
          })
        })

        feed.options = {
          title: 'webmanab.html／ウェブまなぶ',
          link: 'https://webmanab-html.com/feed.xml',
          description:
            'ウェブ制作のあれこれについて学習したことをメモしたりクリップしたり気ままに綴っていきます。'
        }

        feed.addCategory('frontend')

        feed.addContributor({
          name: 'uto usui',
          email: 'mee@uto-usui.com',
          link: 'https://webmanab-html.com/'
        })
      },
      cacheTime: 60 * 60 * 24 * 2, // 2days
      type: 'rss2'
    }
  ],

  /**
   * page transition
   */
  pageTransition: {
    css: false,
    enter(el, done) {
      done()
    },
    leave(el, done) {
      this.$store.getters.getMenuOpen &&
        this.$store.dispatch('setMenuOpen', false)
      done()
    }
  },

  sitemap: {
    path: '/sitemap.xml',
    hostname: 'https://webmanab-html.com',
    routes(callback) {
      Promise.all([
        axios.get(`${apiUrl}tip?custom_per_page=1000`),
        axios.get(`${apiUrl}clip?custom_per_page=1000`),
        axios.get(`${apiUrl}lab?custom_per_page=1000`),
        axios.get(`${apiUrl}tips`),
        axios.get(`${apiUrl}clips`),
        axios.get(`${apiUrl}labs`)
      ])
        .then(data => {
          const tip = data[0]
          const clip = data[1]
          const lab = data[2]
          const tips = data[3]
          const clips = data[4]
          const labs = data[5]
          const arr = tip.data
            .map(el => '/tip/' + el.slug)
            .concat(clip.data.map(el => '/clip/' + el.slug))
            .concat(lab.data.map(el => '/lab/' + el.slug))
            .concat(tips.data.map(el => '/tips/' + el.id))
            .concat(clips.data.map(el => '/clips/' + el.id))
            .concat(labs.data.map(el => '/labs/' + el.id))
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
    interval: 300,
    routes(callback) {
      Promise.all([
        axios.get(`${apiUrl}tip?custom_per_page=1000`),
        axios.get(`${apiUrl}clip?custom_per_page=1000`),
        axios.get(`${apiUrl}lab?custom_per_page=1000`),
        axios.get(`${apiUrl}tips`),
        axios.get(`${apiUrl}clips`),
        axios.get(`${apiUrl}labs`)
      ])
        .then(data => {
          const tip = data[0]
          const clip = data[1]
          const lab = data[2]
          const tips = data[3]
          const clips = data[4]
          const labs = data[5]

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
              lab.data.map(el => {
                return {
                  route: '/lab/' + el.slug,
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
            .concat(
              labs.data.map(el => {
                return {
                  route: '/labs/' + el.id,
                  payload: el
                }
              })
            )

          callback(null, arr)
        })

        .catch(callback)
    }
  },

  workbox: {
    skipWaiting: true,
    clientsClaim: true,
    // ios safari video support
    runtimeCaching: [
      // google fonts
      {
        urlPattern: '^https://fonts.(?:googleapis|gstatic).com/(.*)',
        handler: 'cacheFirst',
        method: 'GET',
        strategyOptions: { cacheableResponse: { statuses: [0, 200] } }
      },
      {
        // ex. poryfill
        urlPattern: 'https://cdn.jsdelivr.net/.*',
        handler: 'cacheFirst'
      },
      // assets
      {
        urlPattern: 'https://wp.webmanab-html.com/wp-content/uploads/',
        handler: 'cacheFirst'
      }
    ]
  }
}

// tax
// https://v2.wp-api.org/reference/taxonomies/

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
