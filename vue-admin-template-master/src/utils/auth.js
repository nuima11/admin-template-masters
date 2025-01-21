import Cookies from 'js-cookie'
import Layout from '@/layout'
const TokenKey = 'vue_admin_template_token'

export function getToken() {
  return Cookies.get(TokenKey)
}

export function setToken(token) {
  return Cookies.set(TokenKey, token)
}

export function removeToken() {
  return Cookies.remove(TokenKey)
}

// 菜单的函数
export function subMenuList(subMenu) {
  const arr = [] // 修改为正确命名的变量
  if (subMenu && subMenu.length > 0) {
    for (let i = 0; i < subMenu.length; i++) {
      const obj = {}
      obj.path = subMenu[i].path
      obj.name = subMenu[i].name
      obj.redirect = subMenu[i].redirect
      obj.meta = subMenu[i].meta
      obj.parent_id = subMenu[i].parent_id

      // 判断组件
      if (subMenu[i].component === 'Layout') {
        obj.component = Layout
      } else {
        const component = subMenu[i].component
        obj.component = (resolve) => require([`@/views${component}`], resolve)
        // obj.component = () => require([`@/views${component}`])
      }
      // 子菜单
      obj.chidren = subMenuList(subMenu[i].chidren)
      // 将对象推入列表
      arr.push(obj) // 确保使用正确的变量
    }
    return arr // 返回处理后的数组
  }
}
