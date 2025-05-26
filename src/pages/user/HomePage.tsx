import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { 
  FiShoppingCart, FiSearch, FiAward, FiTrendingUp, FiClock, 
  FiHeart, FiStar, FiCalendar, FiThumbsUp, FiChevronRight, 
  FiGift, FiTag, FiShield, FiPercent
} from 'react-icons/fi'
import { useCartStore } from '../../stores/cartStore'
import { useAuthStore } from '../../stores/authStore'
import { apiGetProducts, apiGetCategories, Product, mockAPI } from '../../services/productService'
import { getRecommendedProducts, getPopularProducts, recordProductView } from '../../services/recommendationService'
import { searchProducts, getSearchSuggestions } from '../../services/searchService'
import { ActivityType, performDailyCheckIn, hasCheckedInToday, getUserLevel, getUserPoints, getPointsToNextLevel } from '../../services/userActivityService'
import { trackPageView, trackSearch, getUserInterests } from '../../services/analyticsService'

const HomePage: React.FC = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuthStore()
  const { addItem } = useCartStore()
  
  // 商品数据
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [displayProducts, setDisplayProducts] = useState<Product[]>([])
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([])
  const [popularProducts, setPopularProducts] = useState<Product[]>([])
  const [recentlyViewedProducts, setRecentlyViewedProducts] = useState<Product[]>([])
  
  // 搜索相关
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '')
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  
  // 用户相关
  const [userLevel, setUserLevel] = useState<any>(null)
  const [userPoints, setUserPoints] = useState(0)
  const [pointsToNextLevel, setPointsToNextLevel] = useState<any>(null)
  const [hasCheckedIn, setHasCheckedIn] = useState(false)
  const [checkInPoints, setCheckInPoints] = useState<number | null>(null)
  const [userInterests, setUserInterests] = useState<string[]>([])
  
  // 加载状态
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  // 初始化数据
  useEffect(() => {
    const initData = async () => {
      setLoading(true)
      setError('')
      
      try {
        // 获取所有商品
        let productsData
        try {
          productsData = await apiGetProducts({ limit: 100 })
        } catch (apiError) {
          console.error('API请求失败，使用模拟数据', apiError)
          productsData = await mockAPI.getProducts({ limit: 100 })
        }
        
        const products = productsData.products || []
        setAllProducts(products)
        
        // 如果有搜索查询，执行搜索
        if (searchQuery) {
          const searchResults = searchProducts(products, searchQuery)
          setDisplayProducts(searchResults.map(result => result.item))
          
          // 记录搜索事件
          trackSearch(searchQuery, searchResults.length, user?.id)
        } else {
          // 否则显示所有商品
          setDisplayProducts(products)
        }
        
        // 获取推荐商品
        if (isAuthenticated && user) {
          const recommended = getRecommendedProducts(user.id, products, 4)
          setRecommendedProducts(recommended)
          
          // 获取用户等级和积分
          const level = getUserLevel(user.id)
          const points = getUserPoints(user.id)
          const nextLevel = getPointsToNextLevel(user.id)
          
          setUserLevel(level)
          setUserPoints(points)
          setPointsToNextLevel(nextLevel)
          
          // 检查是否已签到
          const checkedIn = hasCheckedInToday(user.id)
          setHasCheckedIn(checkedIn)
          
          // 获取用户兴趣
          const interests = getUserInterests(user.id)
          setUserInterests(interests)
        }
        
        // 获取热门商品
        const popular = getPopularProducts(products, 4)
        setPopularProducts(popular)
        
        // 记录页面浏览
        trackPageView('/home', '首页', user?.id)
        
      } catch (error) {
        console.error('加载数据失败', error)
        setError('加载数据失败，请稍后再试')
      } finally {
        setLoading(false)
      }
    }
    
    initData()
  }, [searchQuery, isAuthenticated, user])
  
  // 处理搜索输入变化
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
    
    // 获取搜索建议
    if (value.trim()) {
      const suggestions = getSearchSuggestions(allProducts, value)
      setSearchSuggestions(suggestions)
      setShowSuggestions(true)
    } else {
      setSearchSuggestions([])
      setShowSuggestions(false)
    }
  }
  
  // 处理搜索提交
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setShowSuggestions(false)
    
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`)
    } else {
      navigate('/')
    }
  }
  
  // 处理搜索建议点击
  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion)
    setShowSuggestions(false)
    navigate(`/?search=${encodeURIComponent(suggestion)}`)
  }
  
  // 处理商品点击
  const handleProductClick = (product: Product) => {
    // 记录商品浏览
    if (user) {
      recordProductView(user.id, product.id)
    }
    
    navigate(`/product/${product.id}`)
  }
  
  // 处理添加到购物车
  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation() // 防止触发商品点击
    addItem(product, 1)
    
    // 显示添加成功的提示（可以通过状态管理实现）
    alert(`已将 ${product.name} 添加到购物车`)
  }
  
  // 处理每日签到
  const handleCheckIn = () => {
    if (!isAuthenticated || !user || hasCheckedIn) return
    
    const points = performDailyCheckIn(user.id)
    if (points) {
      setHasCheckedIn(true)
      setCheckInPoints(points)
      
      // 更新用户积分
      setUserPoints(prevPoints => prevPoints + points)
    }
  }
  
  // 会员等级对应的颜色
  const getLevelColor = (level: number) => {
    switch (level) {
      case 1: return 'from-amber-500 to-amber-700'; // 铜牌
      case 2: return 'from-gray-300 to-gray-500'; // 银牌
      case 3: return 'from-yellow-300 to-yellow-500'; // 金牌
      case 4: return 'from-blue-300 to-purple-500'; // 钻石
      default: return 'from-blue-500 to-blue-700';
    }
  }
  
  return (
    <div className="space-y-6 pb-12">
      {/* 欢迎横幅 - 升级为更现代的设计 */}
      <div className={`relative overflow-hidden rounded-xl shadow-2xl ${
        isAuthenticated && userLevel 
          ? `bg-gradient-to-r ${getLevelColor(userLevel.level)}` 
          : 'bg-gradient-to-r from-blue-600 to-indigo-700'
      }`}>
        {/* 装饰性背景元素 */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-10 rounded-full -translate-y-1/2 translate-x-1/4"></div>
        <div className="absolute bottom-0 left-1/4 w-24 h-24 bg-white opacity-10 rounded-full translate-y-1/2"></div>
        
        <div className="relative z-10 p-8 text-white">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <h1 className="text-3xl md:text-4xl font-bold mb-3 tracking-tight">
                {isAuthenticated && user 
                  ? `欢迎回来，${user.name}！` 
                  : '探索品质生活'}
              </h1>
              <p className="text-lg text-white/90 max-w-md">
                {isAuthenticated && user
                  ? '为您精选最适合的商品，尊享会员专属优惠'
                  : '发现精选优质商品，立即注册获取专属优惠与推荐'}
              </p>
              
              {!isAuthenticated && (
                <button 
                  onClick={() => navigate('/login')}
                  className="mt-4 px-6 py-2 bg-white text-blue-700 rounded-full font-medium hover:bg-blue-50 transition-colors flex items-center"
                >
                  立即登录
                  <FiChevronRight className="ml-1" />
                </button>
              )}
            </div>
            
            {isAuthenticated && user && (
              <div className="w-full md:w-auto backdrop-blur-sm bg-white/20 p-6 rounded-xl border border-white/30 shadow-lg">
                <div className="flex items-center mb-3">
                  <FiAward className="text-yellow-300 mr-2" size={24} />
                  <span className="font-bold text-lg">{userLevel?.name || '会员'}</span>
                </div>
                
                {/* 积分进度条 */}
                {pointsToNextLevel?.nextLevel && (
                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span>当前积分: {userPoints}</span>
                      <span>{pointsToNextLevel.nextLevel.minPoints}</span>
                    </div>
                    <div className="w-full bg-white/30 rounded-full h-2">
                      <div 
                        className="bg-yellow-300 h-2 rounded-full" 
                        style={{ 
                          width: `${Math.min(100, (userPoints / pointsToNextLevel.nextLevel.minPoints) * 100)}%` 
                        }}
                      ></div>
                    </div>
                    <p className="text-sm mt-1">
                      距离 {pointsToNextLevel.nextLevel.name} 还需 {pointsToNextLevel.pointsNeeded} 积分
                    </p>
                  </div>
                )}
                
                {/* 会员特权展示 */}
                {userLevel?.benefits && (
                  <div className="mb-3 grid grid-cols-2 gap-2">
                    {userLevel.benefits.slice(0, 4).map((benefit: string, index: number) => (
                      <div key={index} className="flex items-center text-sm">
                        {index === 0 && <FiPercent className="mr-1 text-yellow-300" size={12} />}
                        {index === 1 && <FiGift className="mr-1 text-yellow-300" size={12} />}
                        {index === 2 && <FiTag className="mr-1 text-yellow-300" size={12} />}
                        {index === 3 && <FiShield className="mr-1 text-yellow-300" size={12} />}
                        <span>{benefit}</span>
                      </div>
                    ))}
                  </div>
                )}
                
                <button
                  onClick={handleCheckIn}
                  disabled={hasCheckedIn}
                  className={`w-full px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center ${
                    hasCheckedIn 
                      ? 'bg-white/30 text-white/70 cursor-not-allowed' 
                      : 'bg-white text-blue-700 hover:bg-blue-50 transition-colors'
                  }`}
                >
                  <FiCalendar className="mr-2" />
                  {hasCheckedIn ? '今日已签到' : '每日签到 +20积分'}
                </button>
                
                {checkInPoints !== null && (
                  <div className="mt-2 text-center text-yellow-300 font-bold animate-pulse">
                    +{checkInPoints} 积分!
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* 搜索框 - 改进设计 */}
      <div className="relative max-w-3xl mx-auto">
        <form onSubmit={handleSearchSubmit} className="flex">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" size={18} />
            </div>
            <input
              type="text"
              placeholder="搜索商品、品牌或分类..."
              className="w-full pl-10 pr-4 py-3 rounded-l-xl border-2 border-r-0 border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
              value={searchQuery}
              onChange={handleSearchInputChange}
              onFocus={() => searchQuery && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            />
            {showSuggestions && searchSuggestions.length > 0 && (
              <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-b-lg shadow-xl mt-1">
                {searchSuggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-center border-b border-gray-100 last:border-b-0"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    <FiSearch className="text-gray-400 mr-3" />
                    <span className="font-medium">{suggestion}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 rounded-r-xl flex items-center justify-center transition-colors shadow-sm"
          >
            <span className="font-medium">搜索</span>
          </button>
        </form>
      </div>
      
      {/* 用户兴趣分类 - 改进设计 */}
      {isAuthenticated && userInterests.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-800">
            <FiHeart className="text-red-500 mr-2" />
            您感兴趣的分类
          </h2>
          <div className="flex flex-wrap gap-2">
            {userInterests.map((category, index) => (
              <a
                key={index}
                href={`/?category=${encodeURIComponent(category)}`}
                className="px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-700 transition-colors border border-gray-200 hover:border-blue-200"
              >
                {category}
              </a>
            ))}
          </div>
        </div>
      )}
      
      {/* 推荐商品 - 改进卡片设计 */}
      {isAuthenticated && recommendedProducts.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold flex items-center text-gray-800">
              <FiThumbsUp className="text-blue-500 mr-2" />
              为您推荐
            </h2>
            <a href="/recommendations" className="text-blue-600 hover:text-blue-800 flex items-center text-sm font-medium">
              查看更多 <FiChevronRight className="ml-1" />
            </a>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {recommendedProducts.map(product => (
              <div
                key={product.id}
                className="group relative bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer"
                onClick={() => handleProductClick(product)}
              >
                <div className="absolute top-3 right-3 z-10">
                  <button 
                    onClick={(e) => handleAddToCart(e, product)}
                    className="bg-white p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-50"
                  >
                    <FiShoppingCart className="text-blue-600" />
                  </button>
                </div>
                <div className="h-48 overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-gray-800 truncate group-hover:text-blue-600 transition-colors">{product.name}</h3>
                  <p className="text-red-600 font-bold mt-2">¥{product.price.toFixed(2)}</p>
                  <div className="mt-2 flex items-center">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <FiStar key={i} className={`${i < 4 ? 'text-yellow-400' : 'text-gray-300'} w-4 h-4`} />
                      ))}
                    </div>
                    <span className="text-xs text-gray-500 ml-1">(24)</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* 热门商品 - 改进卡片设计 */}
      {popularProducts.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold flex items-center text-gray-800">
              <FiTrendingUp className="text-orange-500 mr-2" />
              热门商品
            </h2>
            <a href="/popular" className="text-blue-600 hover:text-blue-800 flex items-center text-sm font-medium">
              查看更多 <FiChevronRight className="ml-1" />
            </a>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {popularProducts.map(product => (
              <div
                key={product.id}
                className="group relative bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer"
                onClick={() => handleProductClick(product)}
              >
                {/* 热门标签 */}
                <div className="absolute top-0 left-0 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-br-lg z-10">
                  热门
                </div>
                <div className="absolute top-3 right-3 z-10">
                  <button 
                    onClick={(e) => handleAddToCart(e, product)}
                    className="bg-white p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-50"
                  >
                    <FiShoppingCart className="text-blue-600" />
                  </button>
                </div>
                <div className="h-48 overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-gray-800 truncate group-hover:text-blue-600 transition-colors">{product.name}</h3>
                  <p className="text-red-600 font-bold mt-2">¥{product.price.toFixed(2)}</p>
                  <div className="mt-2 flex items-center">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <FiStar key={i} className={`${i < 5 ? 'text-yellow-400' : 'text-gray-300'} w-4 h-4`} />
                      ))}
                    </div>
                    <span className="text-xs text-gray-500 ml-1">(36)</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* 所有商品 - 改进卡片设计 */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h2 className="text-xl font-semibold mb-6 text-gray-800">
          {searchQuery ? `"${searchQuery}" 的搜索结果` : '所有商品'}
        </h2>
        
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
            <div className="flex items-center">
              <FiSearch className="text-red-500 mr-2" />
              {error}
            </div>
          </div>
        ) : displayProducts.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <FiSearch className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-xl font-medium">
              {searchQuery ? '没有找到匹配的商品' : '暂无商品'}
            </p>
            <p className="mt-2 text-gray-400">
              {searchQuery ? '请尝试使用其他关键词搜索' : '请稍后再来查看'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {displayProducts.map(product => (
              <div
                key={product.id}
                className="group relative bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer"
                onClick={() => handleProductClick(product)}
              >
                <div className="absolute top-3 right-3 z-10">
                  <button 
                    onClick={(e) => handleAddToCart(e, product)}
                    className="bg-white p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-50"
                  >
                    <FiShoppingCart className="text-blue-600" />
                  </button>
                </div>
                <div className="h-56 overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-4">
                  <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-full">
                    {product.category}
                  </span>
                  <h3 className="font-medium text-gray-800 mt-2 group-hover:text-blue-600 transition-colors">{product.name}</h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2 h-10">{product.description}</p>
                  <div className="mt-3 flex justify-between items-center">
                    <p className="text-red-600 font-bold">¥{product.price.toFixed(2)}</p>
                    <div className="flex items-center text-xs text-gray-500">
                      <FiStar className="text-yellow-400 mr-1" />
                      4.8
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default HomePage 