import apiClient from '../utils/axios'
import { CartItem } from '../stores/cartStore'

// 订单项接口
export interface OrderItem {
  productId: string
  name: string
  price: number
  quantity: number
  image: string
}

// 地址接口
export interface Address {
  fullName: string
  phone: string
  province: string
  city: string
  district: string
  address: string
  zipCode: string
}

// 订单状态类型
export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled'

// 订单接口
export interface Order {
  id: string
  userId: string
  items: OrderItem[]
  address: Address
  total: number
  status: OrderStatus
  paymentMethod: string
  trackingNumber?: string
  createdAt: string
  updatedAt: string
}

// 创建订单请求接口
export interface CreateOrderRequest {
  items: CartItem[]
  address: Address
  paymentMethod: string
}

// 订单列表响应
export interface OrderListResponse {
  orders: Order[]
  total: number
  page: number
  limit: number
}

// 获取用户订单列表
export async function apiGetUserOrders(
  page = 1,
  limit = 10,
  status?: OrderStatus
): Promise<OrderListResponse> {
  const params = { page, limit, status }
  const response = await apiClient.get('/api/orders', { params })
  return response.data
}

// 获取单个订单
export async function apiGetOrder(id: string): Promise<Order> {
  const response = await apiClient.get(`/api/orders/${id}`)
  return response.data
}

// 创建订单
export async function apiCreateOrder(orderData: CreateOrderRequest): Promise<Order> {
  const response = await apiClient.post('/api/orders', orderData)
  return response.data
}

// 取消订单
export async function apiCancelOrder(id: string): Promise<Order> {
  const response = await apiClient.post(`/api/orders/${id}/cancel`)
  return response.data
}

// 管理员获取所有订单
export async function apiGetAllOrders(
  page = 1,
  limit = 10,
  status?: OrderStatus,
  search?: string
): Promise<OrderListResponse> {
  const params = { page, limit, status, search }
  const response = await apiClient.get('/api/admin/orders', { params })
  return response.data
}

// 管理员更新订单状态
export async function apiUpdateOrderStatus(
  id: string,
  status: OrderStatus,
  trackingNumber?: string
): Promise<Order> {
  const response = await apiClient.put(`/api/admin/orders/${id}/status`, {
    status,
    trackingNumber
  })
  return response.data
}

// 模拟订单数据
export const mockOrders: Order[] = Array.from({ length: 10 }).map((_, index) => ({
  id: `order-${index + 1}`,
  userId: 'user-1',
  items: Array.from({ length: Math.floor(Math.random() * 4) + 1 }).map((_, itemIndex) => ({
    productId: `prod-${itemIndex + 1}`,
    name: `商品 ${itemIndex + 1}`,
    price: Math.floor(Math.random() * 1000) + 10,
    quantity: Math.floor(Math.random() * 3) + 1,
    image: `https://picsum.photos/id/${itemIndex + 20}/400/300`,
  })),
  address: {
    fullName: '张三',
    phone: '13800138000',
    province: '北京市',
    city: '北京市',
    district: '海淀区',
    address: '清华大学',
    zipCode: '100084'
  },
  total: 0, // 将在下面计算
  status: ['pending', 'paid', 'shipped', 'delivered', 'cancelled'][Math.floor(Math.random() * 5)] as OrderStatus,
  paymentMethod: ['alipay', 'wechat', 'creditcard'][Math.floor(Math.random() * 3)],
  trackingNumber: index % 3 === 0 ? `SF${Math.floor(Math.random() * 1000000000)}` : undefined,
  createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
  updatedAt: new Date().toISOString()
})).map(order => ({
  ...order,
  total: order.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
}))

// 模拟API函数，用于开发和测试
export const mockAPI = {
  getUserOrders: (
    page = 1,
    limit = 10,
    status?: OrderStatus
  ): Promise<OrderListResponse> => {
    let filteredOrders = [...mockOrders]
    
    if (status) {
      filteredOrders = filteredOrders.filter(o => o.status === status)
    }
    
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    
    return Promise.resolve({
      orders: filteredOrders.slice(startIndex, endIndex),
      total: filteredOrders.length,
      page,
      limit
    })
  },
  
  getOrder: (id: string): Promise<Order> => {
    const order = mockOrders.find(o => o.id === id)
    if (!order) {
      return Promise.reject(new Error('订单不存在'))
    }
    return Promise.resolve(order)
  },
  
  createOrder: (orderData: CreateOrderRequest): Promise<Order> => {
    const newOrder: Order = {
      id: `order-${mockOrders.length + 1}`,
      userId: 'user-1',
      items: orderData.items.map(item => ({
        productId: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image
      })),
      address: orderData.address,
      total: orderData.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
      status: 'pending',
      paymentMethod: orderData.paymentMethod,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    mockOrders.unshift(newOrder)
    return Promise.resolve(newOrder)
  },
  
  cancelOrder: (id: string): Promise<Order> => {
    const order = mockOrders.find(o => o.id === id)
    if (!order) {
      return Promise.reject(new Error('订单不存在'))
    }
    
    if (order.status !== 'pending') {
      return Promise.reject(new Error('只能取消待支付的订单'))
    }
    
    order.status = 'cancelled'
    order.updatedAt = new Date().toISOString()
    
    return Promise.resolve(order)
  },
  
  getAllOrders: (
    page = 1,
    limit = 10,
    status?: OrderStatus,
    search?: string
  ): Promise<OrderListResponse> => {
    let filteredOrders = [...mockOrders]
    
    if (status) {
      filteredOrders = filteredOrders.filter(o => o.status === status)
    }
    
    if (search) {
      const searchLower = search.toLowerCase()
      filteredOrders = filteredOrders.filter(o => 
        o.id.toLowerCase().includes(searchLower) ||
        o.address.fullName.toLowerCase().includes(searchLower)
      )
    }
    
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    
    return Promise.resolve({
      orders: filteredOrders.slice(startIndex, endIndex),
      total: filteredOrders.length,
      page,
      limit
    })
  },
  
  updateOrderStatus: (
    id: string,
    status: OrderStatus,
    trackingNumber?: string
  ): Promise<Order> => {
    const order = mockOrders.find(o => o.id === id)
    if (!order) {
      return Promise.reject(new Error('订单不存在'))
    }
    
    order.status = status
    if (trackingNumber) {
      order.trackingNumber = trackingNumber
    }
    order.updatedAt = new Date().toISOString()
    
    return Promise.resolve(order)
  }
} 