import React, { useState, useEffect } from 'react'
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { 
  FiHome, 
  FiShoppingCart, 
  FiUser, 
  FiPackage, 
  FiLogIn, 
  FiLogOut,
  FiSearch,
  FiMenu,
  FiSettings
} from 'react-icons/fi'
import { useAuthStore } from '../stores/authStore'
import { useCartStore } from '../stores/cartStore'

const UserLayout: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user, isAuthenticated, logout } = useAuthStore()
  const { items: cartItems, syncCart } = useCartStore()
  const navigate = useNavigate()
  const location = useLocation()
  
  // 关闭移动端菜单
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname])
  
  // 用户登录/登出状态变化时同步购物车
  useEffect(() => {
    syncCart(user?.id);
  }, [syncCart, user?.id, isAuthenticated]);
  
  // 处理搜索提交
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
    }
  }
  
  // 处理登出
  const handleLogout = () => {
    logout()
    // 登出后清空当前购物车显示
    syncCart(null)
    navigate('/')
  }
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* 左侧 Logo 和搜索 */}
            <div className="flex items-center">
              <Link to="/" className="flex-shrink-0 flex items-center">
                <span className="font-bold text-xl text-blue-600">商城</span>
              </Link>
              
              <div className="hidden sm:ml-6 sm:flex">
                <form onSubmit={handleSearch} className="flex items-center">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiSearch className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="搜索商品..."
                      className="border border-gray-300 rounded-lg py-2 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 w-80"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <button
                    type="submit"
                    className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    搜索
                  </button>
                </form>
              </div>
            </div>
            
            {/* 移动端菜单按钮 */}
            <div className="flex items-center sm:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              >
                <FiMenu className="h-6 w-6" />
              </button>
            </div>
            
            {/* 右侧导航链接 */}
            <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
              <Link
                to="/"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  location.pathname === '/' 
                    ? 'bg-gray-100 text-gray-900' 
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <span className="flex items-center">
                  <FiHome className="mr-1" />
                  首页
                </span>
              </Link>
              
              <Link
                to="/cart"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  location.pathname === '/cart' 
                    ? 'bg-gray-100 text-gray-900' 
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <span className="flex items-center">
                  <FiShoppingCart className="mr-1" />
                  购物车
                  {cartItems.length > 0 && (
                    <span className="ml-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                      {cartItems.length}
                    </span>
                  )}
                </span>
              </Link>
              
              {isAuthenticated ? (
                <>
                  <Link
                    to="/orders"
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      location.pathname === '/orders' 
                        ? 'bg-gray-100 text-gray-900' 
                        : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <span className="flex items-center">
                      <FiPackage className="mr-1" />
                      我的订单
                    </span>
                  </Link>
                  
                  <Link
                    to="/profile"
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      location.pathname === '/profile' 
                        ? 'bg-gray-100 text-gray-900' 
                        : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <span className="flex items-center">
                      <FiUser className="mr-1" />
                      {user?.name || '我的账户'}
                    </span>
                  </Link>
                  
                  {user?.role === 'admin' && (
                    <Link
                      to="/admin"
                      className={`px-3 py-2 rounded-md text-sm font-medium ${
                        location.pathname.startsWith('/admin') 
                          ? 'bg-gray-100 text-gray-900' 
                          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      <span className="flex items-center">
                        <FiSettings className="mr-1" />
                        管理后台
                      </span>
                    </Link>
                  )}
                  
                  <button
                    onClick={handleLogout}
                    className="px-3 py-2 rounded-md text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                  >
                    <span className="flex items-center">
                      <FiLogOut className="mr-1" />
                      退出
                    </span>
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                >
                  <span className="flex items-center">
                    <FiLogIn className="mr-1" />
                    登录/注册
                  </span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>
      
      {/* 移动端导航菜单 */}
      {mobileMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <Link
              to="/"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                location.pathname === '/' 
                  ? 'bg-gray-100 text-gray-900' 
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <span className="flex items-center">
                <FiHome className="mr-2" />
                首页
              </span>
            </Link>
            
            <Link
              to="/cart"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                location.pathname === '/cart' 
                  ? 'bg-gray-100 text-gray-900' 
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <span className="flex items-center">
                <FiShoppingCart className="mr-2" />
                购物车
                {cartItems.length > 0 && (
                  <span className="ml-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                    {cartItems.length}
                  </span>
                )}
              </span>
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link
                  to="/orders"
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    location.pathname === '/orders' 
                      ? 'bg-gray-100 text-gray-900' 
                      : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <span className="flex items-center">
                    <FiPackage className="mr-2" />
                    我的订单
                  </span>
                </Link>
                
                <Link
                  to="/profile"
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    location.pathname === '/profile' 
                      ? 'bg-gray-100 text-gray-900' 
                      : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <span className="flex items-center">
                    <FiUser className="mr-2" />
                    {user?.name || '我的账户'}
                  </span>
                </Link>
                
                {user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    className={`block px-3 py-2 rounded-md text-base font-medium ${
                      location.pathname.startsWith('/admin') 
                        ? 'bg-gray-100 text-gray-900' 
                        : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <span className="flex items-center">
                      <FiSettings className="mr-2" />
                      管理后台
                    </span>
                  </Link>
                )}
                
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                >
                  <span className="flex items-center">
                    <FiLogOut className="mr-2" />
                    退出
                  </span>
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-900"
              >
                <span className="flex items-center">
                  <FiLogIn className="mr-2" />
                  登录/注册
                </span>
              </Link>
            )}
            
            <form onSubmit={handleSearch} className="px-3 py-2">
              <div className="mt-1 flex rounded-md shadow-sm">
                <div className="relative flex items-stretch flex-grow">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiSearch className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="搜索商品..."
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  className="-ml-px relative inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  搜索
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* 页面内容 */}
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>
      
      {/* 页脚 */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-gray-500 text-sm">
                © {new Date().getFullYear()} 购物商城. 版权所有.
              </p>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-gray-500">
                关于我们
              </a>
              <Link to="/customer-service" className="text-gray-400 hover:text-gray-500">
                联系客服
              </Link>
              <Link to="/delivery-info" className="text-gray-400 hover:text-gray-500">
                配送信息
              </Link>
              <a href="#" className="text-gray-400 hover:text-gray-500">
                隐私政策
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default UserLayout 