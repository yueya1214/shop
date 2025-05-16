import apiClient from '../utils/axios'

// 商品接口
export interface Product {
  id: string
  name: string
  price: number
  description: string
  image: string
  category: string
  stock: number
  createdAt: string
  updatedAt: string
}

// 商品列表响应
interface ProductListResponse {
  products: Product[]
  total: number
  page: number
  limit: number
}

// 商品列表请求参数
interface ProductListParams {
  page?: number
  limit?: number
  search?: string
  category?: string
  sort?: string
}

// 获取商品列表
export async function apiGetProducts(params: ProductListParams = {}): Promise<ProductListResponse> {
  const response = await apiClient.get('/api/products', { params })
  return response.data
}

// 获取商品详情
export async function apiGetProduct(id: string): Promise<Product> {
  const response = await apiClient.get(`/api/products/${id}`)
  return response.data
}

// 创建商品
export async function apiCreateProduct(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
  const response = await apiClient.post('/api/products', productData)
  return response.data
}

// 更新商品
export async function apiUpdateProduct(id: string, productData: Partial<Product>): Promise<Product> {
  const response = await apiClient.put(`/api/products/${id}`, productData)
  return response.data
}

// 删除商品
export async function apiDeleteProduct(id: string): Promise<void> {
  await apiClient.delete(`/api/products/${id}`)
}

// 获取所有商品分类
export async function apiGetCategories(): Promise<string[]> {
  const response = await apiClient.get('/api/categories')
  return response.data
}

// 模拟数据
let mockProducts: Product[] = Array.from({ length: 20 }).map((_, index) => ({
  id: `prod-${index + 1}`,
  name: `商品 ${index + 1}`,
  price: Math.floor(Math.random() * 1000) + 10,
  description: `这是商品${index + 1}的详细描述。`,
  image: `https://picsum.photos/id/${index + 10}/400/300`,
  category: ['电子产品', '家居用品', '服装', '食品', '书籍'][Math.floor(Math.random() * 5)],
  stock: Math.floor(Math.random() * 100),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
}))

// 模拟API函数，用于开发和测试
export const mockAPI = {
  getProducts: (params: ProductListParams = {}): Promise<ProductListResponse> => {
    let filteredProducts = [...mockProducts]
    
    if (params.search) {
      const search = params.search.toLowerCase()
      filteredProducts = filteredProducts.filter(p => 
        p.name.toLowerCase().includes(search) || 
        p.description.toLowerCase().includes(search) ||
        p.category.toLowerCase().includes(search)
      )
    }
    
    if (params.category) {
      filteredProducts = filteredProducts.filter(p => p.category === params.category)
    }
    
    const page = params.page || 1
    const limit = params.limit || 10
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    
    return Promise.resolve({
      products: filteredProducts.slice(startIndex, endIndex),
      total: filteredProducts.length,
      page,
      limit
    })
  },
  
  getProduct: (id: string): Promise<Product> => {
    const product = mockProducts.find(p => p.id === id)
    if (!product) {
      return Promise.reject(new Error('商品不存在'))
    }
    return Promise.resolve(product)
  },
  
  createProduct: (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> => {
    const newProduct: Product = {
      id: `prod-${mockProducts.length + 1}`,
      ...productData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    mockProducts.unshift(newProduct)
    return Promise.resolve(newProduct)
  },
  
  updateProduct: (id: string, productData: Partial<Product>): Promise<Product> => {
    const index = mockProducts.findIndex(p => p.id === id)
    if (index === -1) {
      return Promise.reject(new Error('商品不存在'))
    }
    
    mockProducts[index] = {
      ...mockProducts[index],
      ...productData,
      updatedAt: new Date().toISOString()
    }
    
    return Promise.resolve(mockProducts[index])
  },
  
  deleteProduct: (id: string): Promise<void> => {
    mockProducts = mockProducts.filter(p => p.id !== id)
    return Promise.resolve()
  },
  
  getCategories: (): Promise<string[]> => {
    const categories = Array.from(new Set(mockProducts.map(p => p.category)))
    return Promise.resolve(categories)
  }
} 