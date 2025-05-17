import axios from 'axios'
import { useAuthStore } from '../stores/authStore'

// 创建 axios 实例
const api = axios.create({
  // 从环境变量获取 API URL，或使用默认的 Worker URL
  // 注意：您需要将 '您的用户名' 替换为您的 Cloudflare 账户名或自定义子域名
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000, // 增加超时时间
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器，添加认证 token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    console.error('请求拦截器错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器，处理错误
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // 打印详细错误信息，帮助调试
    console.error('API 请求失败:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    })
    
    // 处理 401 未授权错误
    if (error.response && error.response.status === 401) {
      useAuthStore.getState().logout()
      window.location.href = '/login'
    }
    
    // 构造友好的错误信息
    const errorMsg = error.response?.data?.message || '请求失败，请稍后再试'
    return Promise.reject(new Error(errorMsg))
  }
)

export default api 