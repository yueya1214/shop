import apiClient from '../utils/axios'
import { User } from '../stores/authStore'

// 登录请求接口
interface LoginRequest {
  email: string
  password: string
}

// 注册请求接口
interface RegisterRequest {
  name: string
  email: string
  password: string
}

// 认证响应接口
interface AuthResponse {
  token: string
  user: User
}

// 登录
export async function apiLogin(email: string, password: string): Promise<AuthResponse> {
  const response = await apiClient.post('/api/auth/login', { email, password })
  return response.data
}

// 管理员登录
export async function apiAdminLogin(email: string, password: string): Promise<AuthResponse> {
  const response = await apiClient.post('/api/auth/admin/login', { email, password })
  return response.data
}

// 注册
export async function apiRegister(name: string, email: string, password: string): Promise<AuthResponse> {
  const response = await apiClient.post('/api/auth/register', { name, email, password })
  return response.data
}

// 获取用户信息
export async function apiGetMe(): Promise<User> {
  const response = await apiClient.get('/api/auth/me')
  return response.data
}

// 更新用户信息
export async function apiUpdateMe(userData: Partial<Omit<User, 'id' | 'role'>>): Promise<User> {
  const response = await apiClient.put('/api/auth/me', userData)
  return response.data
}

// 更新密码
export async function apiUpdatePassword(
  currentPassword: string,
  newPassword: string
): Promise<void> {
  await apiClient.put('/api/auth/password', {
    currentPassword,
    newPassword
  })
}

// 模拟认证数据
const mockUsers: User[] = [
  {
    id: 'user-1',
    name: '张三',
    email: 'user@example.com',
    role: 'user'
  },
  {
    id: 'admin-1',
    name: '管理员',
    email: 'admin@example.com',
    role: 'admin'
  }
]

// 模拟API函数，用于开发和测试
export const mockAPI = {
  login: (email: string, password: string): Promise<AuthResponse> => {
    // 模拟登录，正常情况下应该验证密码
    const user = mockUsers.find(u => u.email === email && u.role === 'user')
    if (!user) {
      return Promise.reject(new Error('邮箱或密码错误'))
    }
    
    return Promise.resolve({
      token: 'mock-jwt-token',
      user
    })
  },
  
  adminLogin: (email: string, password: string): Promise<AuthResponse> => {
    // 模拟管理员登录
    const user = mockUsers.find(u => u.email === email && u.role === 'admin')
    if (!user) {
      return Promise.reject(new Error('邮箱或密码错误'))
    }
    
    return Promise.resolve({
      token: 'mock-admin-jwt-token',
      user
    })
  },
  
  register: (name: string, email: string, password: string): Promise<AuthResponse> => {
    // 检查是否已存在该邮箱
    if (mockUsers.some(u => u.email === email)) {
      return Promise.reject(new Error('该邮箱已被注册'))
    }
    
    // 创建新用户
    const newUser: User = {
      id: `user-${mockUsers.length + 1}`,
      name,
      email,
      role: 'user'
    }
    
    mockUsers.push(newUser)
    
    return Promise.resolve({
      token: 'mock-jwt-token',
      user: newUser
    })
  },
  
  getMe: (): Promise<User> => {
    // 模拟获取已登录用户信息
    return Promise.resolve(mockUsers[0])
  },
  
  updateMe: (userData: Partial<Omit<User, 'id' | 'role'>>): Promise<User> => {
    // 模拟更新用户信息
    const user = { ...mockUsers[0], ...userData }
    mockUsers[0] = user
    return Promise.resolve(user)
  },
  
  updatePassword: (): Promise<void> => {
    // 模拟更新密码
    return Promise.resolve()
  }
} 