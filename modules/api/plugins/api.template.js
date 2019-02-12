const axios = require('axios')

class ApiMapper {

  /**
   * @param options {{}} api.config.js
   */
  constructor(options) {
    /**
     * base url
     * @type {string}
     */
    this.baseURI = options.baseURI
    /**
     * rest api を叩くためのパス一覧を格納したオブジェクト
     * @type {module.exports.api|{sale, post, meta, tip, page, category}}
     */
    this.api = options.api
    /**
     * get したデータの name を整形するための設定オブジェクト
     * @type {{}}
     */
    this.propMap = options.map
    /**
     * 削る key の配列
     * @type {string[]}
     */
    this.reservedWords = ['one', 'base', 'extends', 'props', 'categories', 'excerpt']
  }

  /**
   * api get method
   * @param endpoint {string}
   * @param params {string}
   * @returns {Promise<{}>}
   */
  async get(endpoint, params) {
    /**
     * api.config.js からえた値
     * @type {{name, path}}
     */
    const serviceEndpoint = this.getServiceEndpoint('get', endpoint)
    if (!serviceEndpoint) return null

    /**
     * get data with axios
     */
    const res = await axios.get(this.baseURI + serviceEndpoint.path, { params })
    res.data = this.mapProparty(res.data, serviceEndpoint.name)

    return res
  }

  async post(endpoint, params) {
    const serviceEndpoint = this.getServiceEndpoint('post', endpoint)
    if (!serviceEndpoint) return null
    const res = await axios.post(this.baseURI + serviceEndpoint.path, params)
    res.data = this.mapProparty(res.data, serviceEndpoint.name)
    return res
  }

  async put(endpoint, params) {
    const serviceEndpoint = this.getServiceEndpoint('put', endpoint)
    if (!serviceEndpoint) return null
    const res = await axios.put(this.baseURI + serviceEndpoint.path, params)
    res.data = this.mapProparty(res.data, serviceEndpoint.name)
    return res
  }

  /**
   * this.api を走査して method.endpoint を取得してオブジェクトをつくる
   * @param method {string} method name
   * @param endpoint {string} api entry path
   * @returns {{}} method.endpoint のオブジェクト
   */
  getServiceEndpoint(method, endpoint) {
    const name = Object.keys(this.api).filter((name) => {
      return this.api[name][method] && this.api[name][method][endpoint]
    })[0] || null

    if (!name) return null

    return {
      name,
      path: this.api[name][method][endpoint]
    }
  }

  /**
   * get した originData を整形する
   * @param originData
   * @param name
   * @returns {*}
   *
   * .ex) res.data, serviceEndpoint.name (data, tip)
   */
  mapProparty(originData, name) {
    if (this.propMap && this.propMap[name]) {
      const propValue = this.propMap[name] || {}
      return this.getMappingData(originData, propValue)
    } else {
      return originData
    }
  }

  /**
   * originData を propValue でマッピングした配列を返す
   * @param originData {{}} getting data
   * @param propValue {{}} mapped value
   * @returns {Array}
   */
  getMappingData(originData, propValue) {
    const props = this.getProps(propValue)
    const basePropStr = propValue['base'] || ''

    originData = this.getDeepData(originData, basePropStr)

    if (propValue['one']) {
      const index = typeof propValue['one'] === 'number' ? propValue['one'] - 1 : 0
      originData = originData[index] || originData[0] || {}
    }

    if (Array.isArray(originData)) {
      const mappingData = []
      originData.forEach((data, i) => {
        mappingData.push(this.getMappingData(data, propValue))
      })
      return mappingData
    }

    return this.mergeProps(originData, props)
  }

  /**
   *
   * @param data
   * @param basePropStr
   * @returns {*}
   */
  getDeepData(data, basePropStr) {
    if (!basePropStr || typeof basePropStr !== 'string') return data

    const basePropKeys = basePropStr.split('.')
    basePropKeys.forEach((basePropKey) => {
      if (data.hasOwnProperty(basePropKey)) {
        data = data[basePropKey]
      }
    })

    return data
  }

  /**
   * propValue.props がなければ extends で指定した key のプロパティを参照する
   *
   * @param propValue {{}}
   * @returns {{}} prop オブジェクト
   */
  getProps(propValue) {
    let props = propValue['props'] || propValue || {}

    // props を持っていない場合は extends  で指定した key のプロパティを参照
    if (propValue && propValue['extends']) {
      const extendPropValue = this.propMap[propValue['extends']] || null
      if (extendPropValue) {
        props = Object.assign({}, props, extendPropValue['props'] || extendPropValue)
      } else {
        console.error('Extend Props doesn\'t exists')
      }
    }

    // 指定した予約語があれば消す
    this.reservedWords.forEach((reservedWord) => {
      delete props[reservedWord]
    })

    return props
  }

  hasNestedProps(propValue) {
    return propValue['props'] || propValue['extends']
  }

  /**
   * @param originData {{}}
   * @param props {{}}
   * @return {{}}
   */
  mergeProps(originData, props) {
    const data = {}
    Object.keys(props).forEach((propKey) => {
      const propValue = props[propKey]
      if (this.hasNestedProps(propValue)) {
        data[propKey] = this.getMappingData(originData, propValue)
      } else if (typeof propValue === 'string') {
        data[propKey] = this.getDeepData(originData, propValue)
      }
    })
    return data
  }
}

export default (ctx, inject) => {
  const api = new ApiMapper( <%= JSON.stringify(options) %>, )
  ctx.$api = api
  inject('api', api)
}
