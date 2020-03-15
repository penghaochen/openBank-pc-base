/**
 * @description 可配参数文件(没用)
 */
import defaultSettings from '@/settings/index'

const { showSettings, tagsView,fixedHeader, sidebarLogo } = defaultSettings

const state = {
  showSettings: showSettings,
  tagsView: tagsView,
  fixedHeader: fixedHeader,
  sidebarLogo: sidebarLogo
}

const mutations = {
  CHANGE_SETTING: (state, { key, value }) => {
    if (state.hasOwnProperty(key)) {
      state[key] = value
    }
  }
}

const actions = {
  changeSetting({ commit }, data) {
    commit('CHANGE_SETTING', data)
  }
}

export default {
  namespaced: true, // 引用该模块时需要加模块名称 this.$store.dispatch('settings/changeSetting')
  state,
  mutations,
  actions
}

