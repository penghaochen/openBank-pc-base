/**
 * @description 入口文件
 * @author digua
 * @version 0.1.0
 */
import '@babel/polyfill'
import Vue from 'vue'

import 'normalize.css/normalize.css' // 保持浏览器的一些默认样式
import '@/styles/index.scss' // 公共样式
import '@/styles/base.scss' // 公共样式
import App from './App' // 入口页面
import store from './store' // 缓存数据
// import router from './router' // 路由
import router from './router/router.config' // 路由配置
import basicContainer from './components/BasicContainer/main' // 主界面容器模板

import i18n from './i18n/'// 国际化文件配置
import '@/filter/filter.config' // 公共过滤器
import mixin from '@/mixin/routerMixin' // 路由拦截器配置
import config from '@/settings/defaultSetting' // 添加公共配置文件
import '@/utils/validate'// 验证规则


import '@/icons' // 图标
import '@/permission' // 权限控制

//基础功能所需资源
import iView from 'iview'
import 'iview/dist/styles/iview.css'
import TreeTable from 'tree-table-vue'
Vue.component(TreeTable.name, TreeTable)
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import Treeselect from '@riophae/vue-treeselect'
Vue.component('treeselect', Treeselect)
//-------
Vue.mixin(mixin)
/**
 * If you don't want to use mock-server
 * you want to use MockJs for mock api
 * you can execute: mockXHR()
 *
 * Currently MockJs will be used in the production environment,
 * please remove it before going online! ! !
 */
// 模拟交易数据
import {
  mockXHR
} from '../mock'

if (process.env.NODE_ENV === 'development') {
// 使用mock数据 放开注释
  mockXHR()
}
// 注册全局容器
Vue.component('basicContainer', basicContainer)

Vue.use(iView, {

})
// 注册elementui框架 设置国际化
// Vue.use(ElementUI, {
// })
// 是否启动生产信息提示
Vue.config.productionTip = false
// vue实例化
// new Vue({
//   el: '#app',
//   router,
//   store,
//   render: h => h(App)
// })

const opt = {
  router,
  store,
  render: h => h(App)
}
if (config.useI18n) {
  opt.i18n = i18n
}
new Vue(opt).$mount('#app')