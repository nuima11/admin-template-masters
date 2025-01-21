import { constantRoutes } from '@/router'
import store from '..'
import Layout from '@/layout/index.vue'
import { subMenuList } from '@/utils/auth'

/**
 * Use meta.role to determine if the current user has permission
 * @param roles
 * @param route
 */
function hasPermission(roles, route) {
  if (route.meta && route.meta.roles) {
    return roles.some(role => route.meta.roles.includes(role))
  } else {
    return true
  }
}

/**
 * Filter asynchronous routing tables by recursion
 * @param routes asyncRoutes
 * @param roles
 */
export function filterAsyncRoutes(routes, roles) {
  const res = []

  routes.forEach(route => {
    const tmp = { ...route }
    if (hasPermission(roles, tmp)) {
      if (tmp.children) {
        tmp.children = filterAsyncRoutes(tmp.children, roles)
      }
      res.push(tmp)
    }
  })

  return res
}

const state = {
  routes: [],
  addRoutes: []
}

const mutations = {
  SET_ROUTES: (state, routes) => {
    state.addRoutes = routes
    // 将静态路由和动态路由合并到一起
    state.routes = constantRoutes.concat(routes)
  }
}

// 动态路由配置
const actions = {
  generateRoutes({ commit }, roles) {
    // 定义一个变量，用来存放可以访问的路由表
    return new Promise(resolve => {
      let accessedRoutes
      let asyncRoutes = []
      // 获取异步路由
      const menus = store.getters.menus
      // 处理json菜单数据
      if (menus && menus.length > 0) {
        const menusListt = []
        for (let i = 0; i < menus.length; i++) {
          const obj = {}
          obj.path = menus[i].path
          obj.name = menus[i].name
          obj.redirect = menus[i].redirect
          obj.meta = menus[i].meta
          if (menus[i].component === 'Layout') {
            obj.component = Layout
          } else {
            const component = menus[i].component
            obj.component = (resolve) => require([`@/views${component}`], resolve)
            // obj.component = () => require([`@/views${component}`])
          }
          // 子菜单
          obj.children = subMenuList(menus[i].children)
          menusListt.push(obj)
        }
        asyncRoutes = menusListt // 赋值的时候不能push
      }
      // 判断当前的角色列表中，是否有包含admin
      if (roles.includes('admin')) {
        // 所有路由都可以访问
        accessedRoutes = asyncRoutes || []
      } else if (roles.includes('editor')) {
      // 根据角色,过滤不能访问的路由表
        accessedRoutes = filterAsyncRoutes(asyncRoutes, roles)
      } else {
        console.log('roles找不到解决方法')
        // 404 page must be placed at the end !!!
      }
      commit('SET_ROUTES', accessedRoutes)
      // 成功返回
      resolve(accessedRoutes)
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
