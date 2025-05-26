import axios from 'axios'
import { useAuthStore } from '../stores/authStore'

// 创建 axios 实例
const api = axios.create({
  // 从环境变量获取 API URL，或使用默认的 Worker URL
  // 注意：您需要将 '您的用户名' 替换为您的 Cloudflare 账户名或自定义子域名
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://shopping-api.workers.dev',
  timeout: 20000, // 增加超时时间到 20 秒
  headers: {
    'Content-Type': 'application/json',
  },
  // 重试配置
  validateStatus: (status) => {
    return status >= 200 && status < 500; // 只有服务器错误才会被视为失败
  }
})

// 请求拦截器，添加认证 token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    
    // 确保OPTIONS请求被正确处理
    if (config.method === 'options') {
      config.headers['Access-Control-Request-Method'] = config.method
      config.headers['Access-Control-Request-Headers'] = 'Content-Type, Authorization'
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
      message: error.message,
      isNetworkError: error.isAxiosError && !error.response,
      isTimeout: error.code === 'ECONNABORTED'
    })
    
    // 处理不同类型的错误
    let errorMsg = '请求失败，请稍后再试';
    
    if (error.isAxiosError && !error.response) {
      // 网络错误
      errorMsg = '网络连接错误，请检查您的网络连接';
    } else if (error.code === 'ECONNABORTED') {
      // 请求超时
      errorMsg = '请求超时，请稍后再试';
    } else if (error.response) {
      // 服务器返回了错误状态码
      switch (error.response.status) {
        case 400:
          errorMsg = error.response.data?.message || error.response.data?.error || '请求参数错误';
          break;
        case 401:
          errorMsg = '未授权，请重新登录';
          useAuthStore.getState().logout();
          window.location.href = '/login';
          break;
        case 403:
          errorMsg = '您没有权限执行此操作';
          break;
        case 404:
          errorMsg = '请求的资源不存在';
          break;
        case 405:
          errorMsg = '请求方法不允许';
          console.error('405错误 - 请求方法不允许:', {
            url: error.config?.url,
            method: error.config?.method,
            allowedMethods: error.response.headers['allow']
          });
          break;
        case 500:
          errorMsg = '服务器内部错误';
          break;
        default:
          errorMsg = error.response.data?.message || error.response.data?.error || '请求失败，请稍后再试';
      }
    }
    
    return Promise.reject(new Error(errorMsg))
  }
)

export default api 