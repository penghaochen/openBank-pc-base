/**
 * @description 通讯公共方法
 * @author digua
 * @version 0.1.0
 */
import axios from 'axios'
import store from '@/store'
import {
  baseUrl,
  timeout,
  headers
} from '@/api/api.config'
import router from '@/router/router.config'
import { encrypt, decrypt } from '@/utils/encryption/aes' // aes加解密方法
// axios 配置
const service = axios.create({
  baseURL: baseUrl, // 请求根路径
  timeout: timeout // 超时时间
})

// request interceptor
service.interceptors.request.use(
  config => {
    // do something before request is sent
    const isToken = (config.headers || {}).isToken === false
    const token = store.getters.access_token
    if (token && !isToken) {
      config.headers['Authorization'] = 'Bearer ' + token// token
    }
    // if (store.getters.token) {
    //   // let each request carry token
    //   // ['X-Token'] is a custom headers key
    //   // please modify it according to the actual situation
    //   config.headers['X-Token'] = getCookies()
    // }
    // 遮罩打开

    return config
  },
  error => {
    // 遮罩关闭

    // do something with request error
    console.log(error) // for debug
    return Promise.reject(error)
  }
)

// response interceptor
service.interceptors.response.use(
  /**
   * If you want to get http information such as headers or status
   * Please return  response => response
  */

  /**
   * Determine the request status by custom code
   * Here is just an example
   * You can also judge the status by HTTP Status Code
   */
  response => {
    const res = response
    // 遮罩关闭

    return res
  },
  error => {
    // 遮罩关闭

    alert(error.message)
    return Promise.reject(error)
  }
)

export default service
