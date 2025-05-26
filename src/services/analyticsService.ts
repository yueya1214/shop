// 用户行为分析服务

// 事件类型
export enum EventType {
  PAGE_VIEW = 'page_view',
  PRODUCT_VIEW = 'product_view',
  ADD_TO_CART = 'add_to_cart',
  REMOVE_FROM_CART = 'remove_from_cart',
  BEGIN_CHECKOUT = 'begin_checkout',
  PURCHASE = 'purchase',
  SEARCH = 'search',
  FILTER = 'filter',
  SHARE = 'share',
  WISHLIST_ADD = 'wishlist_add',
  WISHLIST_REMOVE = 'wishlist_remove',
  REVIEW = 'review',
  LOGIN = 'login',
  SIGNUP = 'signup',
  LOGOUT = 'logout'
}

// 事件数据接口
interface EventData {
  eventType: EventType
  userId?: string
  sessionId: string
  timestamp: Date
  properties: Record<string, any>
}

// 本地存储键名
const EVENTS_STORAGE_KEY = 'user_events'
const SESSION_ID_KEY = 'session_id'
const SESSION_TIMESTAMP_KEY = 'session_timestamp'
const SESSION_TIMEOUT = 30 * 60 * 1000 // 30分钟会话超时

// 获取或创建会话ID
function getOrCreateSessionId(): string {
  try {
    // 检查是否有现有会话
    const existingSessionId = localStorage.getItem(SESSION_ID_KEY)
    const sessionTimestampStr = localStorage.getItem(SESSION_TIMESTAMP_KEY)
    
    if (existingSessionId && sessionTimestampStr) {
      const sessionTimestamp = parseInt(sessionTimestampStr)
      const currentTime = Date.now()
      
      // 如果会话未超时，更新时间戳并返回现有会话ID
      if (currentTime - sessionTimestamp < SESSION_TIMEOUT) {
        localStorage.setItem(SESSION_TIMESTAMP_KEY, currentTime.toString())
        return existingSessionId
      }
    }
    
    // 创建新会话ID
    const newSessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9)
    localStorage.setItem(SESSION_ID_KEY, newSessionId)
    localStorage.setItem(SESSION_TIMESTAMP_KEY, Date.now().toString())
    
    return newSessionId
  } catch (error) {
    console.error('获取会话ID失败', error)
    return 'fallback_session_' + Date.now()
  }
}

// 记录事件
export function trackEvent(
  eventType: EventType,
  properties: Record<string, any> = {},
  userId?: string
): void {
  try {
    // 获取会话ID
    const sessionId = getOrCreateSessionId()
    
    // 创建事件数据
    const eventData: EventData = {
      eventType,
      userId,
      sessionId,
      timestamp: new Date(),
      properties
    }
    
    // 从本地存储获取现有事件
    const eventsString = localStorage.getItem(EVENTS_STORAGE_KEY)
    const events: EventData[] = eventsString 
      ? JSON.parse(eventsString) 
      : []
    
    // 添加新事件
    events.push(eventData)
    
    // 限制存储的事件数量，防止本地存储过大
    const maxEvents = 1000
    const trimmedEvents = events.length > maxEvents 
      ? events.slice(-maxEvents) 
      : events
    
    // 保存回本地存储
    localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(trimmedEvents))
    
    // 如果在生产环境，可以将事件发送到服务器
    if (process.env.NODE_ENV === 'production') {
      sendEventToServer(eventData).catch(error => {
        console.error('发送事件到服务器失败', error)
      })
    }
  } catch (error) {
    console.error('记录事件失败', error)
  }
}

// 发送事件到服务器（模拟）
async function sendEventToServer(eventData: EventData): Promise<void> {
  // 实际实现中，这里应该是一个API调用
  console.log('发送事件到服务器:', eventData)
  
  // 模拟API调用
  return new Promise((resolve) => {
    setTimeout(resolve, 100)
  })
}

// 获取用户事件
export function getUserEvents(userId?: string): EventData[] {
  try {
    const eventsString = localStorage.getItem(EVENTS_STORAGE_KEY)
    if (!eventsString) return []
    
    const events: EventData[] = JSON.parse(eventsString)
    
    // 如果指定了用户ID，则过滤该用户的事件
    if (userId) {
      return events
        .filter(event => event.userId === userId)
        .map(event => ({
          ...event,
          timestamp: new Date(event.timestamp)
        }))
    }
    
    // 否则返回所有事件
    return events.map(event => ({
      ...event,
      timestamp: new Date(event.timestamp)
    }))
  } catch (error) {
    console.error('获取用户事件失败', error)
    return []
  }
}

// 获取当前会话的事件
export function getCurrentSessionEvents(): EventData[] {
  try {
    const sessionId = localStorage.getItem(SESSION_ID_KEY)
    if (!sessionId) return []
    
    const eventsString = localStorage.getItem(EVENTS_STORAGE_KEY)
    if (!eventsString) return []
    
    const events: EventData[] = JSON.parse(eventsString)
    
    return events
      .filter(event => event.sessionId === sessionId)
      .map(event => ({
        ...event,
        timestamp: new Date(event.timestamp)
      }))
  } catch (error) {
    console.error('获取当前会话事件失败', error)
    return []
  }
}

// 计算用户参与度分数
export function calculateEngagementScore(userId?: string): number {
  const events = userId ? getUserEvents(userId) : getCurrentSessionEvents()
  
  if (events.length === 0) return 0
  
  // 定义不同事件类型的权重
  const eventWeights: Record<EventType, number> = {
    [EventType.PAGE_VIEW]: 1,
    [EventType.PRODUCT_VIEW]: 2,
    [EventType.ADD_TO_CART]: 5,
    [EventType.REMOVE_FROM_CART]: -2,
    [EventType.BEGIN_CHECKOUT]: 7,
    [EventType.PURCHASE]: 20,
    [EventType.SEARCH]: 3,
    [EventType.FILTER]: 2,
    [EventType.SHARE]: 10,
    [EventType.WISHLIST_ADD]: 4,
    [EventType.WISHLIST_REMOVE]: -1,
    [EventType.REVIEW]: 15,
    [EventType.LOGIN]: 3,
    [EventType.SIGNUP]: 10,
    [EventType.LOGOUT]: 0
  }
  
  // 计算总分
  let totalScore = 0
  
  for (const event of events) {
    totalScore += eventWeights[event.eventType] || 0
  }
  
  return totalScore
}

// 获取用户兴趣分类
export function getUserInterests(userId?: string, limit: number = 3): string[] {
  const events = userId ? getUserEvents(userId) : getCurrentSessionEvents()
  
  // 筛选产品相关事件
  const productEvents = events.filter(event => 
    [EventType.PRODUCT_VIEW, EventType.ADD_TO_CART, EventType.WISHLIST_ADD, EventType.PURCHASE].includes(event.eventType)
  )
  
  if (productEvents.length === 0) return []
  
  // 统计各分类的兴趣分数
  const categoryScores: Record<string, number> = {}
  
  for (const event of productEvents) {
    const category = event.properties.category
    if (!category) continue
    
    // 根据事件类型分配不同的权重
    let weight = 1
    switch (event.eventType) {
      case EventType.PURCHASE:
        weight = 10
        break
      case EventType.ADD_TO_CART:
        weight = 5
        break
      case EventType.WISHLIST_ADD:
        weight = 3
        break
      case EventType.PRODUCT_VIEW:
        weight = 1
        break
    }
    
    categoryScores[category] = (categoryScores[category] || 0) + weight
  }
  
  // 按分数排序并返回前N个分类
  return Object.entries(categoryScores)
    .sort(([, scoreA], [, scoreB]) => scoreB - scoreA)
    .slice(0, limit)
    .map(([category]) => category)
}

// 追踪页面浏览
export function trackPageView(
  pagePath: string, 
  pageTitle: string, 
  userId?: string
): void {
  trackEvent(EventType.PAGE_VIEW, {
    pagePath,
    pageTitle,
    referrer: document.referrer,
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight
  }, userId)
}

// 追踪商品浏览
export function trackProductView(
  productId: string,
  productName: string,
  category: string,
  price: number,
  userId?: string
): void {
  trackEvent(EventType.PRODUCT_VIEW, {
    productId,
    productName,
    category,
    price
  }, userId)
}

// 追踪添加到购物车
export function trackAddToCart(
  productId: string,
  productName: string,
  category: string,
  price: number,
  quantity: number,
  userId?: string
): void {
  trackEvent(EventType.ADD_TO_CART, {
    productId,
    productName,
    category,
    price,
    quantity,
    value: price * quantity
  }, userId)
}

// 追踪购买
export function trackPurchase(
  orderId: string,
  products: Array<{
    productId: string,
    productName: string,
    category: string,
    price: number,
    quantity: number
  }>,
  totalValue: number,
  userId?: string
): void {
  trackEvent(EventType.PURCHASE, {
    orderId,
    products,
    itemCount: products.length,
    totalValue
  }, userId)
}

// 追踪搜索
export function trackSearch(
  searchTerm: string,
  resultsCount: number,
  userId?: string
): void {
  trackEvent(EventType.SEARCH, {
    searchTerm,
    resultsCount
  }, userId)
} 