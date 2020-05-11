const silderMenus = [
  {
    path: '/system',
    meta: {
      title: '系统管理',
      icon: 'example'
    },
    children: [
      {
        path: 'app/index',
        meta: {
          title: '应用管理',
          icon: 'table'
        }
      }, {
        path: 'user/index',
        meta: {
          title: '用户管理',
          icon: 'table'
        }
      }, {
        path: 'developer/index',
        meta: {
          title: '开发者管理',
          icon: 'table'
        }
      }, {
        path: 'menus/index',
        meta: {
          title: '功能菜单',
          icon: 'table'
        }
      }, {
        path: 'role/index',
        meta: {
          title: '角色管理',
          icon: 'table'
        }
      }

    ]
  }

]

const navbarMenus = [{
  path: '/',
  title: '回到首页'
}, {
  path: '',
  title: '密码管理'
}, {
  path: '',
  title: '相关文档'
}]
// 左侧菜单数据
export function getSilderMenus() {
  return silderMenus
}
// 顶部右侧菜单数据
export function getNavbarMenus() {
  return navbarMenus
}
