
/**
 * @description 请求的公共逻辑
 * @author digua
 * @version 0.1.0
 */
import request from '@/utils/request'
import { encryption } from '@/utils/encrypt'
/**
 *
 * @description 所有页面的路由表
 * @param url 请求名
 * @param data 上传参数
 * @param method 请求方式 get post put delete
 *
 * @example
 * 例子如下:
 * fetchDo('/auth/oauth/token',params,'post').then(response => {
 *      do somthing...
 * });
 *
 */
export function fetchDo(url, data, method) {
  if (method === 'get') {
    // get请求
    return request({
      url: url,
      method: 'get',
      params: data
    })
  } else {
    // 登录
    if (url.indexOf('/auth/oauth/token') !== -1) {
      const user = encryption({
        data: data,
        key: 'loongloongloongx',
        param: ['password']
      })
      return request({
        url: url,
        method: method || 'post',
        headers: {
          'isToken': false,
          'TENANT_ID': '1',
          'Authorization': 'Basic bG9vbmc6bG9vbmc='
        },
        params: {
          username: user.username,
          password: user.password,
          randomStr: user.randomStr,
          code: user.code,
          grant_type: 'password',
          scope: 'server' }
      })
    } else {
      // 其他交易
      return request({
        url: url,
        method: method || 'post',
        params: data
      })
    }
  }
}
