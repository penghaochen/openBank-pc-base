/* 布局模板 */
import Layout from '@/layout'
export default [
  // 菜单页
  {
    path: '/lobby',
    component: Layout,
    name: 'Lobby',
    redirect: '/lobby/lobby',
    children: [
      {
        path: 'lobby',
        name: 'lobby',
        component: () => import('@/views/dashboard/index'),
        meta: {
          title: '欢迎',
          icon: 'dashboard'
        },
      },
    ],
    meta: {
      title: '首页欢迎',
      icon: 'dashboard'
    },
  },
  {
    path: '/sys',
    component: Layout,
    name: 'Sys',
    redirect: '/sys/patternStandard',
    meta: {
      title: '工具组件',
      icon: 'dashboard'
    },
    children: [
    // {
    //   path: 'patternStandard',
    //   name: 'PatternStandard',
    //   component: () => import('@/views/patternStandard/index'),
    //   meta: {
    //     title: '验证标准',
    //     icon: 'dashboard'
    //   },
    // },
    {
      path: 'empty',
      name: 'Empty',
      component: () => import('@/views/empty/index'),
      meta: {
        title: '测试用具',
        icon: 'dashboard'
      },
    },
  ]
  },
  {
    path: '/system',
    component: Layout,
    redirect: '/app/index',
    name: 'system',
    meta: { title: '系统管理', icon: 'exampl1e' },
    children: [
      // 应用管理
      {
        path: 'app/index',
        name: 'app',
        component: () => import('@/views/system/app/index'),
        meta: { title: '应用管理', icon: 'tree' }
      },
      // 角色管理
      {
        path: 'role/index',
        name: 'role',
        component: () => import('@/views/system/role/index'),
        meta: { title: '角色管理', icon: 'tree' }
      },
      // 用户管理
      {
        path: 'user/index',
        name: 'user',
        component: () => import('@/views/system/user/index'),
        meta: { title: '用户管理', icon: 'tree' }
      },
      // 开发者管理
      {
        path: 'developer/index',
        name: 'developer',
        component: () => import('@/views/system/developer/index'),
        meta: { title: '开发者管理', icon: 'tree' }
      },
      // 功能菜单
      {
        path: 'menus/index',
        name: 'menus',
        component: () => import('@/views/system/menus/index'),
        meta: { title: '功能菜单', icon: 'tree' }
      },
    ]
  },
  // // 菜单测试页
  // {
  //   path: '/lobby1',
  //   name: 'Lobby1',
  //   components: {
  //     default: () => import('@/views/home/lobby1')
  //   },
  //   meta: {
  //     isdisableback: 'true',
  //     keepAlive: true
  //   }
  // }
]
