/**
 * auther: GeoffZhu
 * date: 20161120
 *
 * desc:为http请求做的封装，提供了如下功能
 *
 * 1.错误统一弹出处理,不需要在请求时候一个个的if(resp.status)
 * 2.请求接口统一加progressBar
 *
 * Todo:
 * 1.接口加前端缓存，不常变更的数据可以加local storage缓存
 * 2.增加接口错误统计，接口出错往百度统计发一个事件
 *
 * Usage:
 * this.$fetch({
 *   url: url, *必填
 *   params: params *必填
 *   ...
 *   ...
 *   ...
 * }).then((resp) => {
 *   //不需要在这处理resp.status
 * })
 * //这里的.catch也为非必要，如果想要更好，也可以加上
 */
'use strict'
import 'whatwg-fetch'

module.exports.install = function (Vue, initOptions = {}) {
  const isVueNext = Vue.version.split('.')[0] === '2'
  const inBrowser = typeof window !== 'undefined'

  const DEFAULT_OPTION = {
    url: '',
    type: 'GET',
    params: {},
    notify: true,
    progress: true,
    cache: false,
    fromCache: false,
    credentials: 'same-origin',
    errorMsg: '出错了，请稍后再试'
  }
  const fetchOptions = Object.assign(DEFAULT_OPTION, initOptions)

  let vueFetch = {
    $vm: null,
    init (vm) {
      this.$vm = vm
    },
    start (options) {
      options = Object.assign(JSON.parse(JSON.stringify(fetchOptions)), options)

      let url = options.url
      let fetchSetting = {
        method: options.type,
        credentials: options.credentials
      }
      if (options.type === 'GET') {
        let temp = '?'
        for(let key in options.params){
          temp += key + '=' + options.params[key] + '&'
        }
        url = url + temp
        url = url.substring(0, url.length-1)
      } else if(options.type === 'POST'){
        fetchSetting.body = JSON.stringify(options.params)
      }

      return new Promise((resolve, reject) => {
        console.time(url)
        if (options.progress) this.$vm.$Progress.start()
        window.fetch(url, fetchSetting).then((rawResp) => {
          console.timeEnd(url)
          if (rawResp.ok) {
            return rawResp.json()
          } else {
            return {
              status: false,
              msg: `${rawResp.status} ${rawResp.statusText}`
            }
          }
        }).then((resp) => {
          if (resp.status) {
            resolve(resp)
            if (options.progress) this.$vm.$Progress.finish()
          } else {
            reject(resp)
            if (options.progress) this.$vm.$Progress.fail()
            if (options.notify) {
              this.$vm.$notify.error({
                title: 'error',
                message: resp.msg || options.errorMsg
              })
            }
          }
        }).catch((err) => {
          reject(err)
          if (options.progress) this.$vm.$Progress.fail()
          if (options.notify) {
            this.$vm.$notify.error({
              title: 'error',
              message: options.errorMsg
            })
          }

        })
      })
    }
  }

  const VueFetchEventBus = new Vue({})

  if (inBrowser) {
    window.VueFetchEventBus = VueFetchEventBus
    window.VueFetch = vueFetch.start.bind(vueFetch)
    vueFetch.init(VueFetchEventBus)
  }
  Vue.prototype.$fetch = vueFetch.start.bind(vueFetch)
}