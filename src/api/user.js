import request from '@/utils/request'

// 登陆
export function login(data) {
  return request({
    url: '/auth/sign_in',
    method: 'post',
    data
  })
}

// 登陆时获取用户信息
export function getInfo(token) {
  return request({
    url: '/users/me',
    method: 'get',
    params: { token }
  })
}

// 退出接口
export function logout() {
  return request({
    url: '/auth/logout',
    method: 'post'
  })
}

/**
 *
 *充值接口
 *
 * */
export function recharge(params) {
  return request({
    url: '/admin/users/recharge',
    method: 'post',
    data: params.data, // 从参数提取数据
    headers: params.headers // 从参数提取请求头
  })
}

