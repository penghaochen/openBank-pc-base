/**
 * @description 操作cookies文件
 * @author digua
 * @version 0.1.0
 */
import Cookies from 'js-cookie'

// const TokenKey = 'vue_admin_template_token'
// 获取cookies
export function getCookies(key) {
  return Cookies.get(key)
}
// 设置cookies
export function setCookies(key ,value) {
  return Cookies.set(key, value)
}
// 删除cookies
export function removeCookies(key) {
  return Cookies.remove(key)
}
