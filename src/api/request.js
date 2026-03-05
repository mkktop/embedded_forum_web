/**
 * Axios请求封装模块
 * 功能：创建axios实例，配置请求/响应拦截器，统一处理错误
 */
import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'

// API基础地址
const BASE_URL = '/api'

// 请求超时时间（毫秒）
const REQUEST_TIMEOUT = 10000

/**
 * 创建axios实例
 * 配置基础URL、超时时间、默认请求头
 */
const request = axios.create({
  baseURL: BASE_URL,
  timeout: REQUEST_TIMEOUT,
  headers: {
    'Content-Type': 'application/json'
  }
})

/**
 * 请求拦截器
 * 功能：在请求发送前自动添加JWT Token到请求头
 * @param {Object} config - 请求配置对象
 * @returns {Object} 处理后的请求配置
 */
request.interceptors.request.use(
  config => {
    // 从本地存储获取token
    const token = localStorage.getItem('token')
    // 如果token存在，添加到Authorization请求头
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

/**
 * 响应拦截器
 * 功能：统一处理响应数据和错误
 * @param {Object} response - 响应对象
 * @returns {Object} 处理后的响应数据
 */
request.interceptors.response.use(
  response => {
    // 打印响应数据用于调试
    console.log('API响应:', response.config.url, response.data)
    
    // 请求成功，返回数据
    if (response.data.success) {
      return response.data
    }
    // 业务逻辑失败，显示错误信息
    ElMessage.error(response.data.message || '请求失败')
    return Promise.reject(new Error(response.data.message || '请求失败'))
  },
  error => {
    // 打印错误详情用于调试
    console.log('API错误:', error.config?.url, error.response?.data)
    
    // 处理HTTP错误状态码
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // 未授权：清除登录状态，跳转登录页
          localStorage.removeItem('token')
          localStorage.removeItem('userInfo')
          ElMessage.error('登录已过期，请重新登录')
          router.push('/login')
          break
        case 403:
          // 禁止访问
          ElMessage.error('没有权限执行此操作')
          break
        case 404:
          // 资源不存在
          ElMessage.error('请求的资源不存在')
          break
        case 500:
          // 服务器错误
          ElMessage.error('服务器错误，请稍后重试')
          break
        default:
          // 其他错误
          ElMessage.error(error.response.data?.message || '请求失败')
      }
    } else {
      // 网络错误
      ElMessage.error('网络连接失败，请检查网络')
    }
    return Promise.reject(error)
  }
)

export default request
