import axios from 'axios'
import { useAuthStore } from '../stores/authStore'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://api.binggo.ip-ddns.com',
  timeout: 10000,
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
    return Promise.reject(error)
  }
)

// 响应拦截器，处理错误
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
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