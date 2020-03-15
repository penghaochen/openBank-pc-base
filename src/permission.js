/**
 * @description 权限控制配置
 * @author digua
 * @version 0.1.0
 */
import router from './router'
import store from './store'
import NProgress from 'nprogress' // 顶部进度条
import 'nprogress/nprogress.css' // 顶部进度条样式
import settings from '@/settings/index' // 获取公共参数
import {getStore} from '@/utils/store' // 获取存储数据
NProgress.configure({ showSpinner: false }) // 进度条配置

// 路由拦截器
router.beforeEach(async(to, from, next) => {
  // 进度条开启
  NProgress.start()
  // 设置标题
  document.title = to.meta.title || settings.title
  // 获取缓存中的access_token
  let sessionId=getStore({
    name: 'access_token',
    type: 'session'
  })

// 缓冲设置
// if (to.meta.keepAlive === true && store.state.tags.tagList.some(ele => {
//   return ele.value === to.fullPath
// })) {
//   to.meta.$keepAlive = true
// } else {
//   NProgress.start()
//   if (to.meta.keepAlive === true && validatenull(to.meta.$keepAlive)) {
//     to.meta.$keepAlive = true
//   } else {
//     to.meta.$keepAlive = false
//   }
// }
const meta = to.meta || {}
next()
  // if (sessionId) {
  //   // sessionStrage里有token
  //   if (to.path === '/login') {
  //     next({path: '/'})
  //   } else {
  //     // if (store.getters.roles.length === 0) {
  //       store.dispatch('user/GetUserInfo').then(() => {
  //         // next({...to, replace: true})
  //         next()
  //       }).catch(() => {
  //         store.dispatch('user/FedLogOut').then(() => {
  //           next({path: '/login'})
  //         })
  //       })
  //     // } else {
  //     //   const value = to.query.src || to.fullPath
  //     //   const label = to.query.name || to.name
  //     //   // if (meta.isTab !== false && !validatenull(value) && !validatenull(label)) {
  //     //   //   store.commit('ADD_TAG', {
  //     //   //     label: label,
  //     //   //     value: value,
  //     //   //     params: to.params,
  //     //   //     query: to.query,
  //     //   //     group: router.$avueRouter.group || []
  //     //   //   })
  //     //   // }
  //     //   next()
  //     // }
  //   }
  // } else {
  //   // sessionStrage里没有token
  //   if (meta.isAuth === false) {
  //     // 不需要登录
  //     next()
  //   } else {
  //     // 需要登录
  //     next('/login')
  //   }
  // }
})

router.afterEach(() => {
  // 进度条结束
  NProgress.done()
})
