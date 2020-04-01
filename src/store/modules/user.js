/**
 * @description 用户信息配置
 */
// import {fetchDo} from "@/utils/fetch";
import {setStore,removeStore} from '@/utils/store'
const state = {
  userInfo: {},
  permissions: {},
  roles: [],
  name: '',
  avatar: '',
  access_token:'',
  expires_in:'',
  refresh_token:'',
  isLock:false,
  lockPasswd:''
}
const mutations = {
  // 存储access_token ，记录用户token
  SET_ACCESS_TOKEN: (state, access_token) => {
    state.access_token = access_token
    setStore({
      name: 'access_token',
      content: state.access_token,
      type: 'session'
    })
  },
  // 存储 session过期时间
  SET_EXPIRES_IN: (state, expires_in) => {
    state.expires_in = expires_in
    setStore({
      name: 'expires_in',
      content: state.expires_in,
      type: 'session'
    })
  },
  // 存储 session刷新时间
  SET_REFRESH_TOKEN: (state, rfToken) => {
    state.refresh_token = rfToken
    setStore({
      name: 'refresh_token',
      content: state.refresh_token,
      type: 'session'
    })
  },
  SET_USERIFNO: (state, userInfo) => {
    state.userInfo = userInfo
  },
  SET_MENU: (state, menu) => {
    state.menu = menu
    setStore({
      name: 'menu',
      content: state.menu,
      type: 'session'
    })
  },
  SET_MENU_ALL: (state, menuAll) => {
    state.menuAll = menuAll
  },
  SET_ROLES: (state, roles) => {
    state.roles = roles
  },
  SET_PERMISSIONS: (state, permissions) => {
    const list = {}
    for (let i = 0; i < permissions.length; i++) {
      list[permissions[i]] = true
    }
    state.permissions = list
  },
  // 存储 清空锁屏密码（demo工程有）
  CLEAR_LOCK: (state) => {
    state.isLock = false
    state.lockPasswd = ''
    removeStore({
      name: 'lockPasswd'
    })
    removeStore({
      name: 'isLock'
    })
  },

}

const actions = {
  // 根据用户名登录
  LoginByUsername({commit}, userInfo) {
    const user = encryption({
      data: userInfo,
      key: 'loongloongloongx',
      param: ['password']
    })
    return new Promise((resolve, reject) => {
      debugger
      loginByUsername(user.username, user.password, user.code, user.randomStr).then(response => {
        const data = response.data
        commit('SET_ACCESS_TOKEN', data.access_token)
        commit('SET_REFRESH_TOKEN', data.refresh_token)
        commit('SET_EXPIRES_IN', data.expires_in)
        commit('CLEAR_LOCK')
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },
  // 根据手机号登录
  LoginByPhone({commit}, userInfo) {
    return new Promise((resolve, reject) => {
      loginByMobile(userInfo.mobile, userInfo.code).then(response => {
        const data = response.data
        commit('SET_ACCESS_TOKEN', data.access_token)
        commit('SET_REFRESH_TOKEN', data.refresh_token)
        commit('SET_EXPIRES_IN', data.expires_in)
        commit('CLEAR_LOCK')
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },
  // 根据OpenId登录
  LoginBySocial({commit}, param) {
    return new Promise((resolve, reject) => {
      loginBySocial(param.state, param.code).then(response => {
        const data = response.data
        commit('SET_ACCESS_TOKEN', data.access_token)
        commit('SET_REFRESH_TOKEN', data.refresh_token)
        commit('SET_EXPIRES_IN', data.expires_in)
        commit('CLEAR_LOCK')
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },
  GetUserInfo({commit}) {
    
    return new Promise((resolve, reject) => {
      resolve()
      // fetchDo('/admin/user/info',"",'get').then(res => {
        
      //   const data = res.data.data || {}
      //   commit('SET_USERIFNO', data.sysUser)
      //   commit('SET_ROLES', data.roles || [])
      //   commit('SET_PERMISSIONS', data.permissions || [])
      //   resolve(data)
      // }).catch((err) => {
      //   reject()
      // })

    })
  },
  // 刷新token
  RefreshToken({commit, state}) {
    return new Promise((resolve, reject) => {
      refreshToken(state.refresh_token).then(response => {
        const data = response.data
        commit('SET_ACCESS_TOKEN', data.access_token)
        commit('SET_REFRESH_TOKEN', data.refresh_token)
        commit('SET_EXPIRES_IN', data.expires_in)
        commit('CLEAR_LOCK')
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },
  // 登出
  LogOut({commit}) {
    return new Promise((resolve, reject) => {
      resolve()
      // logout().then(() => {
      //   commit('SET_MENU', [])
      //   commit('SET_PERMISSIONS', [])
      //   // commit('SET_USER_INFO', {})
        commit('SET_ACCESS_TOKEN', '')
        commit('SET_REFRESH_TOKEN', '')
        commit('SET_EXPIRES_IN', '')
        commit('SET_ROLES', [])
        // commit('DEL_ALL_TAG')
      //   commit('CLEAR_LOCK')
      //   resolve()
      // }).catch(error => {
      //   reject(error)
      // })
    })
  },
  // 注销session
  FedLogOut({commit}) {
    return new Promise(resolve => {
      commit('SET_MENU', [])
      commit('SET_PERMISSIONS', [])
      // commit('SET_USER_INFO', {})
      commit('SET_ACCESS_TOKEN', '')
      commit('SET_REFRESH_TOKEN', '')
      commit('SET_ROLES', [])
      // commit('DEL_ALL_TAG')
      commit('CLEAR_LOCK')
      resolve()
    })
  },
}
const user ={
  namespaced: true,
  state:state,
  mutations:mutations,
  actions:actions
}
export default user

