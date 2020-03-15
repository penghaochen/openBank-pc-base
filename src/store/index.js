/**
 * @description vuex入口文件
 * @author digua
 * @version 0.1.0
 */
import Vue from 'vue'
import Vuex from 'vuex'
import getters from './getters'
import app from './modules/app' // 菜单类标识
import settings from './modules/settings' // 设置类标识
import user from './modules/user' // 用户类标识
import tagsView from './modules/tagsView' // tag标签导航
Vue.use(Vuex)
// vuex实例化
const store = new Vuex.Store({
  modules: {
    app,
    settings,
    user,
    tagsView
  },
  getters
})

export default store
