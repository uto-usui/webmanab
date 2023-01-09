import path from 'path'
import { defineNuxtModule, addPluginTemplate } from '@nuxt/kit'
import webpack from 'webpack'

const module = defineNuxtModule({
  setup(_options, nuxt) {
    const moduleOptions = _options.config
      ? Object.assign(
          {},
          require(_options.config.replace(/^(@|~)/, process.cwd())),
          _options
        )
      : _options
    const options = Object.assign({}, nuxt.options.api, moduleOptions)

    /* istanbul ignore if */
    if (process.env.API_URL_BROWSER) {
      options.browserBaseURL = process.env.API_URL_BROWSER
    }

    // Default browserBaseURL
    if (!options.browserBaseURL) {
      options.browserBaseURL = options.proxy ? prefix : options.baseURL
    }

    // Register plugin
    addPluginTemplate({
      src: path.resolve(__dirname, 'plugins/api.template.js'),
      filename: 'api.js',
      options
    })
  }
})
export default module
