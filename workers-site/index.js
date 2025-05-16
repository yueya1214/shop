import { getAssetFromKV } from '@cloudflare/kv-asset-handler'
import jwt from '@tsndr/cloudflare-worker-jwt'

// 定义 KV 命名空间的绑定名称
// 这些命名空间需要在 Cloudflare 控制台中创建并绑定
const PRODUCTS_NAMESPACE = 'PRODUCTS'
const ORDERS_NAMESPACE = 'ORDERS'
const USERS_NAMESPACE = 'USERS'

// 定义 JWT 密钥
const JWT_SECRET = 'your-secret-key' // 在实际部署时应替换为环境变量

// API 路由处理程序
const apiRoutes = {
  // 用户认证相关 API
  'POST /api/auth/register': handleRegister,
  'POST /api/auth/login': handleLogin,
  'POST /api/auth/admin-login': handleAdminLogin,
  
  // 产品相关 API
  'GET /api/products': handleGetProducts,
  'GET /api/products/:id': handleGetProduct,
  'POST /api/products': handleCreateProduct,
  'PUT /api/products/:id': handleUpdateProduct,
  'DELETE /api/products/:id': handleDeleteProduct,
  'GET /api/products/categories': handleGetCategories,
  
  // 订单相关 API
  'GET /api/orders': handleGetUserOrders,
  'GET /api/orders/:id': handleGetOrder,
  'POST /api/orders': handleCreateOrder,
  'PUT /api/orders/:id/status': handleUpdateOrderStatus,
  
  // 管理员 API
  'GET /api/admin/orders': handleGetAllOrders,
  
  // 用户 API
  'GET /api/users/profile': handleGetProfile,
  'PUT /api/users/profile': handleUpdateProfile,
}

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event))
})

/**
 * 处理请求，根据路径分发到静态资源或 API 端点
 */
async function handleRequest(event) {
  const request = event.request
  const url = new URL(request.url)
  const path = url.pathname
  
  // 判断是否为 API 请求
  if (path.startsWith('/api/')) {
    return handleApiRequest(request, path)
  }
  
  try {
    // 尝试从 KV 获取静态资源
    return await getAssetFromKV(event)
  } catch (e) {
    // 如果静态资源不存在，返回 index.html 以支持 SPA 路由
    try {
      url.pathname = '/'
      return await getAssetFromKV(event, { mapRequestToAsset: req => new Request(url, req) })
    } catch (e) {
      return new Response('Not Found', { status: 404 })
    }
  }
}

/**
 * 处理 API 请求，路由到对应的处理函数
 */
async function handleApiRequest(request, path) {
  const method = request.method
  const url = new URL(request.url)
  
  // 提取路由路径参数
  const routePath = path.replace(/\/api\//, '/')
  const segments = routePath.split('/')
  const routePattern = segments.map(segment => {
    // 将 ID 参数替换为占位符
    return segment.match(/^[a-f0-9]{24}$/) || segment.match(/^\d+$/) 
      ? ':id' 
      : segment
  }).join('/')
  
  // 构建路由键
  const routeKey = `${method} /api${routePattern}`
  
  // 找到匹配的路由处理程序
  const handler = apiRoutes[routeKey]
  
  if (!handler) {
    return jsonResponse({ error: 'Endpoint not found' }, 404)
  }
  
  // 验证需要认证的端点
  if (needsAuth(routeKey) && !await verifyAuthentication(request, routeKey)) {
    return jsonResponse({ error: 'Unauthorized' }, 401)
  }
  
  try {
    // 准备请求数据
    const params = extractParams(segments, routePattern)
    const queryParams = Object.fromEntries(url.searchParams)
    
    let body = null
    if (method !== 'GET' && method !== 'HEAD') {
      const contentType = request.headers.get('content-type') || ''
      if (contentType.includes('application/json')) {
        body = await request.json()
      }
    }
    
    // 调用路由处理程序
    return await handler(request, { params, query: queryParams, body })
  } catch (error) {
    console.error(`API Error (${routeKey}):`, error)
    return jsonResponse({ error: 'Internal Server Error' }, 500)
  }
}

/**
 * 判断路由是否需要认证
 */
function needsAuth(routeKey) {
  // 公共端点不需要认证
  const publicEndpoints = [
    'POST /api/auth/register',
    'POST /api/auth/login',
    'POST /api/auth/admin-login',
    'GET /api/products',
    'GET /api/products/:id',
    'GET /api/products/categories'
  ]
  
  return !publicEndpoints.includes(routeKey)
}

/**
 * 验证请求的 JWT 认证
 */
async function verifyAuthentication(request, routeKey) {
  const authHeader = request.headers.get('Authorization') || ''
  const token = authHeader.replace('Bearer ', '')
  
  if (!token) {
    return false
  }
  
  try {
    // 验证 JWT 令牌
    const isValid = await jwt.verify(token, JWT_SECRET)
    if (!isValid) return false
    
    // 解析 JWT 中的用户信息
    const decoded = jwt.decode(token)
    const user = decoded.payload.user
    
    // 检查管理员路径的权限
    if (routeKey.startsWith('GET /api/admin/') || routeKey.startsWith('POST /api/admin/') || 
        routeKey.startsWith('PUT /api/admin/') || routeKey.startsWith('DELETE /api/admin/')) {
      return user.role === 'admin'
    }
    
    return true
  } catch (error) {
    console.error('Auth Error:', error)
    return false
  }
}

/**
 * 从 URL 中提取参数
 */
function extractParams(segments, routePattern) {
  const params = {}
  const patternSegments = routePattern.split('/')
  
  segments.forEach((segment, i) => {
    if (patternSegments[i] === ':id') {
      params.id = segment
    }
  })
  
  return params
}

/**
 * 以 JSON 格式返回响应
 */
function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  })
}

/**
 * 生成唯一ID
 */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5)
}

// 以下是各 API 路由的处理函数

// 用户认证 API
async function handleRegister(request, { body }) {
  if (!body || !body.name || !body.email || !body.password) {
    return jsonResponse({ error: 'Missing required fields' }, 400)
  }

  // 检查邮箱是否已存在
  const existingUser = await USERS_NAMESPACE.get(`user:${body.email}`)
  if (existingUser) {
    return jsonResponse({ error: 'Email already exists' }, 409)
  }

  // 创建新用户
  const userId = generateId()
  const user = {
    id: userId,
    name: body.name,
    email: body.email,
    password: hashPassword(body.password), // 在实际项目中应使用安全的密码哈希方法
    role: 'user',
    createdAt: new Date().toISOString()
  }

  // 存储用户数据
  await USERS_NAMESPACE.put(`user:${userId}`, JSON.stringify(user))
  await USERS_NAMESPACE.put(`user:${body.email}`, userId) // 用于快速邮箱查找

  // 生成 JWT
  const token = await generateToken(user)

  // 返回不包含密码的用户信息和令牌
  const { password, ...userWithoutPassword } = user
  return jsonResponse({ token, user: userWithoutPassword })
}

async function handleLogin(request, { body }) {
  if (!body || !body.email || !body.password) {
    return jsonResponse({ error: 'Missing email or password' }, 400)
  }

  // 查找用户
  const userId = await USERS_NAMESPACE.get(`user:${body.email}`)
  if (!userId) {
    return jsonResponse({ error: 'Invalid credentials' }, 401)
  }

  const userJson = await USERS_NAMESPACE.get(`user:${userId}`)
  if (!userJson) {
    return jsonResponse({ error: 'User not found' }, 404)
  }

  const user = JSON.parse(userJson)

  // 验证密码
  if (user.password !== hashPassword(body.password)) {
    return jsonResponse({ error: 'Invalid credentials' }, 401)
  }

  // 生成 JWT
  const token = await generateToken(user)

  // 返回不包含密码的用户信息和令牌
  const { password, ...userWithoutPassword } = user
  return jsonResponse({ token, user: userWithoutPassword })
}

async function handleAdminLogin(request, { body }) {
  if (!body || !body.email || !body.password) {
    return jsonResponse({ error: 'Missing email or password' }, 400)
  }

  // 查找用户
  const userId = await USERS_NAMESPACE.get(`user:${body.email}`)
  if (!userId) {
    return jsonResponse({ error: 'Invalid credentials' }, 401)
  }

  const userJson = await USERS_NAMESPACE.get(`user:${userId}`)
  if (!userJson) {
    return jsonResponse({ error: 'User not found' }, 404)
  }

  const user = JSON.parse(userJson)

  // 验证密码和管理员权限
  if (user.password !== hashPassword(body.password) || user.role !== 'admin') {
    return jsonResponse({ error: 'Invalid credentials or insufficient permissions' }, 401)
  }

  // 生成 JWT
  const token = await generateToken(user)

  // 返回不包含密码的用户信息和令牌
  const { password, ...userWithoutPassword } = user
  return jsonResponse({ token, user: userWithoutPassword })
}

// 产品 API
async function handleGetProducts(request, { query }) {
  const page = parseInt(query.page) || 1
  const limit = parseInt(query.limit) || 10
  const search = query.search || ''
  const category = query.category || ''
  
  // 从 KV 存储获取产品列表
  const productsListJson = await PRODUCTS_NAMESPACE.get('products:list')
  let productsList = productsListJson ? JSON.parse(productsListJson) : []
  
  // 应用搜索和分类过滤
  let filteredProducts = productsList
  
  if (search) {
    const searchLower = search.toLowerCase()
    filteredProducts = filteredProducts.filter(id => {
      const productJson = await PRODUCTS_NAMESPACE.get(`product:${id}`)
      if (!productJson) return false
      
      const product = JSON.parse(productJson)
      return product.name.toLowerCase().includes(searchLower) || 
             product.description.toLowerCase().includes(searchLower)
    })
  }
  
  if (category) {
    filteredProducts = filteredProducts.filter(id => {
      const productJson = await PRODUCTS_NAMESPACE.get(`product:${id}`)
      if (!productJson) return false
      
      const product = JSON.parse(productJson)
      return product.category === category
    })
  }
  
  // 计算分页
  const total = filteredProducts.length
  const startIndex = (page - 1) * limit
  const endIndex = startIndex + limit
  const paginatedIds = filteredProducts.slice(startIndex, endIndex)
  
  // 获取详细产品信息
  const products = []
  for (const id of paginatedIds) {
    const productJson = await PRODUCTS_NAMESPACE.get(`product:${id}`)
    if (productJson) {
      products.push(JSON.parse(productJson))
    }
  }
  
  return jsonResponse({ products, total })
}

async function handleGetProduct(request, { params }) {
  const productId = params.id
  
  // 从 KV 获取产品信息
  const productJson = await PRODUCTS_NAMESPACE.get(`product:${productId}`)
  
  if (!productJson) {
    return jsonResponse({ error: 'Product not found' }, 404)
  }
  
  return jsonResponse(JSON.parse(productJson))
}

async function handleCreateProduct(request, { body }) {
  if (!body || !body.name || !body.price || !body.category) {
    return jsonResponse({ error: 'Missing required fields' }, 400)
  }
  
  // 创建产品对象
  const productId = generateId()
  const product = {
    id: productId,
    name: body.name,
    price: parseFloat(body.price),
    description: body.description || '',
    image: body.image || 'https://via.placeholder.com/150',
    category: body.category,
    stock: parseInt(body.stock || 0),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  
  // 存储产品数据
  await PRODUCTS_NAMESPACE.put(`product:${productId}`, JSON.stringify(product))
  
  // 更新产品列表
  const productsListJson = await PRODUCTS_NAMESPACE.get('products:list')
  let productsList = productsListJson ? JSON.parse(productsListJson) : []
  productsList.push(productId)
  await PRODUCTS_NAMESPACE.put('products:list', JSON.stringify(productsList))
  
  return jsonResponse(product)
}

async function handleUpdateProduct(request, { params, body }) {
  const productId = params.id
  
  // 检查产品是否存在
  const productJson = await PRODUCTS_NAMESPACE.get(`product:${productId}`)
  if (!productJson) {
    return jsonResponse({ error: 'Product not found' }, 404)
  }
  
  const existingProduct = JSON.parse(productJson)
  
  // 更新产品字段
  const updatedProduct = {
    ...existingProduct,
    ...body,
    price: body.price ? parseFloat(body.price) : existingProduct.price,
    stock: body.stock ? parseInt(body.stock) : existingProduct.stock,
    updatedAt: new Date().toISOString()
  }
  
  // 存储更新的产品
  await PRODUCTS_NAMESPACE.put(`product:${productId}`, JSON.stringify(updatedProduct))
  
  return jsonResponse(updatedProduct)
}

async function handleDeleteProduct(request, { params }) {
  const productId = params.id
  
  // 检查产品是否存在
  const productExists = await PRODUCTS_NAMESPACE.get(`product:${productId}`)
  if (!productExists) {
    return jsonResponse({ error: 'Product not found' }, 404)
  }
  
  // 删除产品
  await PRODUCTS_NAMESPACE.delete(`product:${productId}`)
  
  // 更新产品列表
  const productsListJson = await PRODUCTS_NAMESPACE.get('products:list')
  if (productsListJson) {
    let productsList = JSON.parse(productsListJson)
    productsList = productsList.filter(id => id !== productId)
    await PRODUCTS_NAMESPACE.put('products:list', JSON.stringify(productsList))
  }
  
  return jsonResponse({ success: true })
}

async function handleGetCategories(request) {
  // 获取所有产品
  const productsListJson = await PRODUCTS_NAMESPACE.get('products:list')
  
  if (!productsListJson) {
    return jsonResponse([])
  }
  
  const productsList = JSON.parse(productsListJson)
  const categories = new Set()
  
  // 收集所有唯一的类别
  for (const id of productsList) {
    const productJson = await PRODUCTS_NAMESPACE.get(`product:${id}`)
    if (productJson) {
      const product = JSON.parse(productJson)
      if (product.category) {
        categories.add(product.category)
      }
    }
  }
  
  return jsonResponse(Array.from(categories))
}

// 订单 API
async function handleGetUserOrders(request, { query }) {
  const page = parseInt(query.page) || 1
  const limit = parseInt(query.limit) || 10
  
  // 从令牌中获取用户ID
  const authHeader = request.headers.get('Authorization') || ''
  const token = authHeader.replace('Bearer ', '')
  const decoded = jwt.decode(token)
  const userId = decoded.payload.user.id
  
  // 获取用户订单列表
  const userOrdersListJson = await ORDERS_NAMESPACE.get(`user:${userId}:orders`)
  
  if (!userOrdersListJson) {
    return jsonResponse({ orders: [], total: 0 })
  }
  
  const orderIds = JSON.parse(userOrdersListJson)
  
  // 计算分页
  const total = orderIds.length
  const startIndex = (page - 1) * limit
  const endIndex = startIndex + limit
  const paginatedIds = orderIds.slice(startIndex, endIndex)
  
  // 获取订单详情
  const orders = []
  for (const id of paginatedIds) {
    const orderJson = await ORDERS_NAMESPACE.get(`order:${id}`)
    if (orderJson) {
      orders.push(JSON.parse(orderJson))
    }
  }
  
  return jsonResponse({ orders, total })
}

async function handleGetOrder(request, { params }) {
  const orderId = params.id
  
  // 从 KV 获取订单
  const orderJson = await ORDERS_NAMESPACE.get(`order:${orderId}`)
  
  if (!orderJson) {
    return jsonResponse({ error: 'Order not found' }, 404)
  }
  
  const order = JSON.parse(orderJson)
  
  // 从令牌中获取用户ID，验证订单所有权（管理员除外）
  const authHeader = request.headers.get('Authorization') || ''
  const token = authHeader.replace('Bearer ', '')
  const decoded = jwt.decode(token)
  const user = decoded.payload.user
  
  if (user.role !== 'admin' && order.userId !== user.id) {
    return jsonResponse({ error: 'Unauthorized' }, 403)
  }
  
  return jsonResponse(order)
}

async function handleCreateOrder(request, { body }) {
  if (!body || !body.items || !body.address) {
    return jsonResponse({ error: 'Missing required fields' }, 400)
  }
  
  // 从令牌中获取用户ID
  const authHeader = request.headers.get('Authorization') || ''
  const token = authHeader.replace('Bearer ', '')
  const decoded = jwt.decode(token)
  const userId = decoded.payload.user.id
  
  // 获取商品详情并计算总价
  const orderItems = []
  let totalAmount = 0
  
  for (const item of body.items) {
    const productJson = await PRODUCTS_NAMESPACE.get(`product:${item.id}`)
    
    if (!productJson) {
      return jsonResponse({ error: `Product not found: ${item.id}` }, 404)
    }
    
    const product = JSON.parse(productJson)
    
    // 检查库存
    if (product.stock < item.quantity) {
      return jsonResponse({ error: `Insufficient stock for product: ${product.name}` }, 400)
    }
    
    // 添加到订单商品
    orderItems.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: item.quantity
    })
    
    totalAmount += product.price * item.quantity
    
    // 更新库存
    product.stock -= item.quantity
    await PRODUCTS_NAMESPACE.put(`product:${product.id}`, JSON.stringify(product))
  }
  
  // 创建订单
  const orderId = generateId()
  const order = {
    id: orderId,
    userId,
    items: orderItems,
    totalAmount,
    status: '待处理',
    address: body.address,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  
  // 存储订单
  await ORDERS_NAMESPACE.put(`order:${orderId}`, JSON.stringify(order))
  
  // 更新用户的订单列表
  const userOrdersListJson = await ORDERS_NAMESPACE.get(`user:${userId}:orders`)
  let userOrdersList = userOrdersListJson ? JSON.parse(userOrdersListJson) : []
  userOrdersList.unshift(orderId) // 添加到列表开头
  await ORDERS_NAMESPACE.put(`user:${userId}:orders`, JSON.stringify(userOrdersList))
  
  // 更新全局订单列表
  const allOrdersListJson = await ORDERS_NAMESPACE.get('orders:list')
  let allOrdersList = allOrdersListJson ? JSON.parse(allOrdersListJson) : []
  allOrdersList.unshift(orderId)
  await ORDERS_NAMESPACE.put('orders:list', JSON.stringify(allOrdersList))
  
  return jsonResponse(order)
}

async function handleUpdateOrderStatus(request, { params, body }) {
  const orderId = params.id
  
  if (!body || !body.status) {
    return jsonResponse({ error: 'Missing status' }, 400)
  }
  
  // 验证状态值
  const validStatuses = ['待处理', '已确认', '已发货', '已完成', '已取消']
  if (!validStatuses.includes(body.status)) {
    return jsonResponse({ error: 'Invalid status' }, 400)
  }
  
  // 从 KV 获取订单
  const orderJson = await ORDERS_NAMESPACE.get(`order:${orderId}`)
  
  if (!orderJson) {
    return jsonResponse({ error: 'Order not found' }, 404)
  }
  
  const order = JSON.parse(orderJson)
  
  // 从令牌中获取用户信息
  const authHeader = request.headers.get('Authorization') || ''
  const token = authHeader.replace('Bearer ', '')
  const decoded = jwt.decode(token)
  const user = decoded.payload.user
  
  // 只有管理员可以更改订单状态（订单所有者只能取消未发货的订单）
  if (user.role !== 'admin') {
    if (order.userId !== user.id) {
      return jsonResponse({ error: 'Unauthorized' }, 403)
    }
    
    if (body.status !== '已取消') {
      return jsonResponse({ error: 'Users can only cancel orders' }, 403)
    }
    
    if (order.status === '已发货' || order.status === '已完成') {
      return jsonResponse({ error: 'Cannot cancel shipped or completed orders' }, 400)
    }
  }
  
  // 更新订单状态
  order.status = body.status
  order.updatedAt = new Date().toISOString()
  
  // 如果取消订单，恢复库存
  if (body.status === '已取消' && order.status !== '已取消') {
    for (const item of order.items) {
      const productJson = await PRODUCTS_NAMESPACE.get(`product:${item.id}`)
      
      if (productJson) {
        const product = JSON.parse(productJson)
        product.stock += item.quantity
        await PRODUCTS_NAMESPACE.put(`product:${item.id}`, JSON.stringify(product))
      }
    }
  }
  
  // 存储更新的订单
  await ORDERS_NAMESPACE.put(`order:${orderId}`, JSON.stringify(order))
  
  return jsonResponse(order)
}

// 管理员 API
async function handleGetAllOrders(request, { query }) {
  const page = parseInt(query.page) || 1
  const limit = parseInt(query.limit) || 10
  const status = query.status || ''
  
  // 获取所有订单
  const allOrdersListJson = await ORDERS_NAMESPACE.get('orders:list')
  
  if (!allOrdersListJson) {
    return jsonResponse({ orders: [], total: 0 })
  }
  
  let orderIds = JSON.parse(allOrdersListJson)
  
  // 按状态过滤
  if (status) {
    const filteredIds = []
    for (const id of orderIds) {
      const orderJson = await ORDERS_NAMESPACE.get(`order:${id}`)
      if (orderJson) {
        const order = JSON.parse(orderJson)
        if (order.status === status) {
          filteredIds.push(id)
        }
      }
    }
    orderIds = filteredIds
  }
  
  // 计算分页
  const total = orderIds.length
  const startIndex = (page - 1) * limit
  const endIndex = startIndex + limit
  const paginatedIds = orderIds.slice(startIndex, endIndex)
  
  // 获取订单详情
  const orders = []
  for (const id of paginatedIds) {
    const orderJson = await ORDERS_NAMESPACE.get(`order:${id}`)
    if (orderJson) {
      orders.push(JSON.parse(orderJson))
    }
  }
  
  return jsonResponse({ orders, total })
}

// 用户 API
async function handleGetProfile(request) {
  // 从令牌中获取用户ID
  const authHeader = request.headers.get('Authorization') || ''
  const token = authHeader.replace('Bearer ', '')
  const decoded = jwt.decode(token)
  const userId = decoded.payload.user.id
  
  // 从 KV 获取用户信息
  const userJson = await USERS_NAMESPACE.get(`user:${userId}`)
  
  if (!userJson) {
    return jsonResponse({ error: 'User not found' }, 404)
  }
  
  const user = JSON.parse(userJson)
  const { password, ...userWithoutPassword } = user
  
  return jsonResponse(userWithoutPassword)
}

async function handleUpdateProfile(request, { body }) {
  if (!body) {
    return jsonResponse({ error: 'Missing request body' }, 400)
  }
  
  // 从令牌中获取用户ID
  const authHeader = request.headers.get('Authorization') || ''
  const token = authHeader.replace('Bearer ', '')
  const decoded = jwt.decode(token)
  const userId = decoded.payload.user.id
  
  // 从 KV 获取用户信息
  const userJson = await USERS_NAMESPACE.get(`user:${userId}`)
  
  if (!userJson) {
    return jsonResponse({ error: 'User not found' }, 404)
  }
  
  const user = JSON.parse(userJson)
  
  // 更新用户信息（只允许更新部分字段）
  const updatedUser = {
    ...user,
    name: body.name || user.name,
    updatedAt: new Date().toISOString()
  }
  
  // 存储更新的用户信息
  await USERS_NAMESPACE.put(`user:${userId}`, JSON.stringify(updatedUser))
  
  // 返回不包含密码的用户信息
  const { password, ...userWithoutPassword } = updatedUser
  return jsonResponse(userWithoutPassword)
}

// 辅助函数
// 简单的密码哈希（在实际项目中应使用更安全的方法）
function hashPassword(password) {
  // 实际项目中应使用 bcrypt 等安全哈希算法
  return password + '-hashed'
}

// 生成 JWT 令牌
async function generateToken(user) {
  const payload = {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    }
  }
  
  return await jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
} 