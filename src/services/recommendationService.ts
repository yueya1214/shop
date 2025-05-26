import { Product } from './productService'

// 用户浏览历史记录
interface UserViewHistory {
  userId: string
  productId: string
  viewCount: number
  lastViewed: Date
}

// 用户购买历史
interface UserPurchaseHistory {
  userId: string
  productId: string
  purchaseCount: number
  lastPurchased: Date
}

// 本地存储键名
const USER_VIEW_HISTORY_KEY = 'user_view_history'
const USER_PURCHASE_HISTORY_KEY = 'user_purchase_history'

// 获取用户浏览历史
export function getUserViewHistory(userId: string): UserViewHistory[] {
  try {
    const historyString = localStorage.getItem(USER_VIEW_HISTORY_KEY)
    if (!historyString) return []
    
    const allHistory = JSON.parse(historyString) as UserViewHistory[]
    return allHistory.filter(item => item.userId === userId)
      .map(item => ({
        ...item,
        lastViewed: new Date(item.lastViewed)
      }))
  } catch (error) {
    console.error('获取浏览历史失败', error)
    return []
  }
}

// 获取用户购买历史
export function getUserPurchaseHistory(userId: string): UserPurchaseHistory[] {
  try {
    const historyString = localStorage.getItem(USER_PURCHASE_HISTORY_KEY)
    if (!historyString) return []
    
    const allHistory = JSON.parse(historyString) as UserPurchaseHistory[]
    return allHistory.filter(item => item.userId === userId)
      .map(item => ({
        ...item,
        lastPurchased: new Date(item.lastPurchased)
      }))
  } catch (error) {
    console.error('获取购买历史失败', error)
    return []
  }
}

// 记录用户查看商品
export function recordProductView(userId: string, productId: string): void {
  if (!userId || !productId) return
  
  try {
    // 获取所有历史记录
    const historyString = localStorage.getItem(USER_VIEW_HISTORY_KEY)
    const allHistory: UserViewHistory[] = historyString ? JSON.parse(historyString) : []
    
    // 查找当前用户对当前商品的记录
    const existingIndex = allHistory.findIndex(
      item => item.userId === userId && item.productId === productId
    )
    
    if (existingIndex >= 0) {
      // 更新现有记录
      allHistory[existingIndex].viewCount += 1
      allHistory[existingIndex].lastViewed = new Date()
    } else {
      // 添加新记录
      allHistory.push({
        userId,
        productId,
        viewCount: 1,
        lastViewed: new Date()
      })
    }
    
    // 保存回本地存储
    localStorage.setItem(USER_VIEW_HISTORY_KEY, JSON.stringify(allHistory))
  } catch (error) {
    console.error('记录商品浏览失败', error)
  }
}

// 记录用户购买商品
export function recordProductPurchase(userId: string, productId: string, quantity: number = 1): void {
  if (!userId || !productId) return
  
  try {
    // 获取所有历史记录
    const historyString = localStorage.getItem(USER_PURCHASE_HISTORY_KEY)
    const allHistory: UserPurchaseHistory[] = historyString ? JSON.parse(historyString) : []
    
    // 查找当前用户对当前商品的记录
    const existingIndex = allHistory.findIndex(
      item => item.userId === userId && item.productId === productId
    )
    
    if (existingIndex >= 0) {
      // 更新现有记录
      allHistory[existingIndex].purchaseCount += quantity
      allHistory[existingIndex].lastPurchased = new Date()
    } else {
      // 添加新记录
      allHistory.push({
        userId,
        productId,
        purchaseCount: quantity,
        lastPurchased: new Date()
      })
    }
    
    // 保存回本地存储
    localStorage.setItem(USER_PURCHASE_HISTORY_KEY, JSON.stringify(allHistory))
  } catch (error) {
    console.error('记录商品购买失败', error)
  }
}

// 计算商品相似度（基于分类和价格）
function calculateProductSimilarity(product1: Product, product2: Product): number {
  // 相同商品不比较
  if (product1.id === product2.id) return 0
  
  let similarity = 0
  
  // 分类相同加权重
  if (product1.category === product2.category) {
    similarity += 0.5
  }
  
  // 价格相似度（价格差异越小，相似度越高）
  const maxPrice = Math.max(product1.price, product2.price)
  const priceDiff = Math.abs(product1.price - product2.price)
  const priceRatio = 1 - (priceDiff / maxPrice)
  similarity += priceRatio * 0.3
  
  // 简单的文本相似度（名称中共同单词）
  const words1 = product1.name.toLowerCase().split(/\s+/)
  const words2 = product2.name.toLowerCase().split(/\s+/)
  const commonWords = words1.filter(word => words2.includes(word)).length
  const totalWords = new Set([...words1, ...words2]).size
  if (totalWords > 0) {
    similarity += (commonWords / totalWords) * 0.2
  }
  
  return similarity
}

// 基于协同过滤的推荐算法
export function getRecommendedProducts(
  userId: string, 
  allProducts: Product[], 
  limit: number = 5
): Product[] {
  if (!userId || !allProducts.length) return []
  
  // 获取用户历史
  const viewHistory = getUserViewHistory(userId)
  const purchaseHistory = getUserPurchaseHistory(userId)
  
  // 如果没有历史记录，返回随机推荐
  if (!viewHistory.length && !purchaseHistory.length) {
    return getRandomProducts(allProducts, limit)
  }
  
  // 为每个商品计算兴趣分数
  const productScores = new Map<string, number>()
  
  // 已查看或购买的商品ID
  const interactedProductIds = new Set([
    ...viewHistory.map(h => h.productId),
    ...purchaseHistory.map(h => h.productId)
  ])
  
  // 为每个未交互的商品计算分数
  allProducts.forEach(product => {
    // 跳过用户已交互的商品
    if (interactedProductIds.has(product.id)) return
    
    let score = 0
    
    // 基于浏览历史的相似度
    viewHistory.forEach(history => {
      const viewedProduct = allProducts.find(p => p.id === history.productId)
      if (viewedProduct) {
        const similarity = calculateProductSimilarity(product, viewedProduct)
        // 考虑浏览次数和时间衰减
        const daysSinceViewed = Math.max(1, (new Date().getTime() - history.lastViewed.getTime()) / (1000 * 3600 * 24))
        const timeDecay = 1 / Math.log(daysSinceViewed + 1)
        score += similarity * history.viewCount * timeDecay * 0.5
      }
    })
    
    // 基于购买历史的相似度（购买行为权重更高）
    purchaseHistory.forEach(history => {
      const purchasedProduct = allProducts.find(p => p.id === history.productId)
      if (purchasedProduct) {
        const similarity = calculateProductSimilarity(product, purchasedProduct)
        // 考虑购买次数和时间衰减
        const daysSincePurchased = Math.max(1, (new Date().getTime() - history.lastPurchased.getTime()) / (1000 * 3600 * 24))
        const timeDecay = 1 / Math.log(daysSincePurchased + 1)
        score += similarity * history.purchaseCount * timeDecay * 1.5
      }
    })
    
    productScores.set(product.id, score)
  })
  
  // 按分数排序并返回前N个商品
  return allProducts
    .filter(product => !interactedProductIds.has(product.id))
    .sort((a, b) => (productScores.get(b.id) || 0) - (productScores.get(a.id) || 0))
    .slice(0, limit)
}

// 获取随机商品（当无法基于历史记录推荐时）
export function getRandomProducts(products: Product[], limit: number = 5): Product[] {
  const shuffled = [...products].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, limit)
}

// 获取热门商品（基于所有用户的浏览和购买行为）
export function getPopularProducts(allProducts: Product[], limit: number = 5): Product[] {
  try {
    // 获取所有浏览历史
    const viewHistoryString = localStorage.getItem(USER_VIEW_HISTORY_KEY)
    const allViewHistory: UserViewHistory[] = viewHistoryString ? JSON.parse(viewHistoryString) : []
    
    // 获取所有购买历史
    const purchaseHistoryString = localStorage.getItem(USER_PURCHASE_HISTORY_KEY)
    const allPurchaseHistory: UserPurchaseHistory[] = purchaseHistoryString ? JSON.parse(purchaseHistoryString) : []
    
    // 计算每个商品的热度分数
    const popularityScores = new Map<string, number>()
    
    // 浏览贡献热度分数
    allViewHistory.forEach(history => {
      const currentScore = popularityScores.get(history.productId) || 0
      popularityScores.set(history.productId, currentScore + history.viewCount * 1)
    })
    
    // 购买贡献更多热度分数
    allPurchaseHistory.forEach(history => {
      const currentScore = popularityScores.get(history.productId) || 0
      popularityScores.set(history.productId, currentScore + history.purchaseCount * 5)
    })
    
    // 按热度排序并返回前N个商品
    return allProducts
      .filter(product => popularityScores.has(product.id))
      .sort((a, b) => (popularityScores.get(b.id) || 0) - (popularityScores.get(a.id) || 0))
      .slice(0, limit)
  } catch (error) {
    console.error('获取热门商品失败', error)
    return getRandomProducts(allProducts, limit)
  }
} 