import apiClient from '../utils/axios'
import { useAuthStore } from '../stores/authStore'

// 评价星级类型
export type ReviewRating = 1 | 2 | 3 | 4 | 5

// 评价接口
export interface Review {
  id: string
  productId: string
  userId: string
  userName: string
  userAvatar?: string
  rating: ReviewRating
  content: string
  images?: string[]
  createdAt: string
  updatedAt: string
}

// 创建评价请求接口
export interface CreateReviewRequest {
  productId: string
  rating: ReviewRating
  content: string
  images?: string[]
}

// 评价列表响应
export interface ReviewListResponse {
  reviews: Review[]
  total: number
  page: number
  limit: number
}

// 获取商品评价列表
export async function apiGetProductReviews(
  productId: string,
  page = 1,
  limit = 10
): Promise<ReviewListResponse> {
  const params = { page, limit }
  const response = await apiClient.get(`/api/products/${productId}/reviews`, { params })
  return response.data
}

// 获取用户评价列表
export async function apiGetUserReviews(
  page = 1,
  limit = 10
): Promise<ReviewListResponse> {
  const params = { page, limit }
  const response = await apiClient.get('/api/user/reviews', { params })
  return response.data
}

// 创建评价
export async function apiCreateReview(reviewData: CreateReviewRequest): Promise<Review> {
  const response = await apiClient.post('/api/reviews', reviewData)
  return response.data
}

// 删除评价 (仅管理员可用)
export async function apiDeleteReview(id: string): Promise<void> {
  await apiClient.delete(`/api/admin/reviews/${id}`)
}

// 模拟评价数据
export const mockReviews: Review[] = Array.from({ length: 20 }).map((_, index) => ({
  id: `review-${index + 1}`,
  productId: `prod-${Math.floor(Math.random() * 10) + 1}`,
  userId: `user-${Math.floor(Math.random() * 5) + 1}`,
  userName: `用户${Math.floor(Math.random() * 1000) + 1}`,
  userAvatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`,
  rating: (Math.floor(Math.random() * 5) + 1) as ReviewRating,
  content: [
    '商品质量非常好，包装也很精美，物流速度快，值得购买！',
    '性价比很高，商品和描述一致，非常满意这次购物体验。',
    '商品还可以，但是感觉和描述的有些差距，希望商家能改进。',
    '收到货后发现有轻微划痕，但是客服态度很好，已经解决了问题。',
    '这个价格买到这个质量的商品很划算，推荐大家购买。'
  ][Math.floor(Math.random() * 5)],
  images: Math.random() > 0.6 ? Array.from({ length: Math.floor(Math.random() * 3) + 1 }).map((_, i) => 
    `https://picsum.photos/id/${Math.floor(Math.random() * 100) + 1}/400/300`
  ) : undefined,
  createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
  updatedAt: new Date().toISOString()
}))

// 模拟API函数，用于开发和测试
export const mockAPI = {
  getProductReviews: (
    productId: string,
    page = 1,
    limit = 10
  ): Promise<ReviewListResponse> => {
    const filteredReviews = mockReviews.filter(review => review.productId === productId)
    
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    
    return Promise.resolve({
      reviews: filteredReviews.slice(startIndex, endIndex),
      total: filteredReviews.length,
      page,
      limit
    })
  },
  
  getUserReviews: (
    userId: string,
    page = 1,
    limit = 10
  ): Promise<ReviewListResponse> => {
    const filteredReviews = mockReviews.filter(review => review.userId === userId)
    
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    
    return Promise.resolve({
      reviews: filteredReviews.slice(startIndex, endIndex),
      total: filteredReviews.length,
      page,
      limit
    })
  },
  
  createReview: (reviewData: CreateReviewRequest): Promise<Review> => {
    const authState = useAuthStore.getState()
    if (!authState.isAuthenticated || !authState.user) {
      return Promise.reject(new Error('需要登录才能发表评价'))
    }
    
    const newReview: Review = {
      id: `review-${mockReviews.length + 1}`,
      productId: reviewData.productId,
      userId: authState.user.id,
      userName: authState.user.name,
      userAvatar: authState.user.avatar,
      rating: reviewData.rating,
      content: reviewData.content,
      images: reviewData.images,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    mockReviews.unshift(newReview)
    return Promise.resolve(newReview)
  },
  
  deleteReview: (id: string): Promise<void> => {
    const authState = useAuthStore.getState()
    if (!authState.isAuthenticated || !authState.user) {
      return Promise.reject(new Error('需要登录才能删除评价'))
    }
    
    // 检查是否为管理员
    if (authState.user.role !== 'admin') {
      return Promise.reject(new Error('只有管理员可以删除评价'))
    }
    
    const index = mockReviews.findIndex(review => review.id === id)
    if (index === -1) {
      return Promise.reject(new Error('评价不存在'))
    }
    
    mockReviews.splice(index, 1)
    return Promise.resolve()
  }
} 