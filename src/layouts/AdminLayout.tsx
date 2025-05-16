import { useState } from 'react'
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { FiMenu, FiX, FiHome, FiPackage, FiShoppingBag, FiLogOut, FiUser } from 'react-icons/fi'
import { useAuthStore } from '../stores/authStore'

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuthStore()
  
  const handleLogout = () => {
    logout()
    navigate('/admin/login')
  }
  
  const isActivePath = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`)
  }
  
  return (
    <div className="flex h-screen bg-gray-100">
      {/* 移动端侧边栏覆盖层 */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-50 transition-opacity lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* 侧边栏 */}
      <div
        className={`fixed inset-y-0 left-0 z-30 w-64 transform bg-gray-900 transition duration-300 lg:translate-x-0 lg:static lg:inset-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-center h-16 bg-gray-800 text-white">
          <span className="text-xl font-semibold">管理员后台</span>
          <button
            className="absolute right-4 top-4 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <FiX className="h-6 w-6 text-white" />
          </button>
        </div>
        
        <div className="py-4">
          <nav>
            <Link
              to="/admin"
              className={`flex items-center px-6 py-3 text-gray-300 hover:bg-gray-800 hover:text-white ${
                isActivePath('/admin') && !isActivePath('/admin/products') && !isActivePath('/admin/orders')
                  ? 'bg-gray-800 text-white'
                  : ''
              }`}
              onClick={() => setSidebarOpen(false)}
            >
              <FiHome className="mr-3" />
              仪表盘
            </Link>
            
            <Link
              to="/admin/products"
              className={`flex items-center px-6 py-3 text-gray-300 hover:bg-gray-800 hover:text-white ${
                isActivePath('/admin/products') ? 'bg-gray-800 text-white' : ''
              }`}
              onClick={() => setSidebarOpen(false)}
            >
              <FiPackage className="mr-3" />
              商品管理
            </Link>
            
            <Link
              to="/admin/orders"
              className={`flex items-center px-6 py-3 text-gray-300 hover:bg-gray-800 hover:text-white ${
                isActivePath('/admin/orders') ? 'bg-gray-800 text-white' : ''
              }`}
              onClick={() => setSidebarOpen(false)}
            >
              <FiShoppingBag className="mr-3" />
              订单管理
            </Link>
          </nav>
        </div>
      </div>
      
      {/* 主内容区 */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* 顶部导航栏 */}
        <header className="bg-white shadow-md">
          <div className="flex items-center justify-between h-16 px-6">
            <button
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <FiMenu className="h-6 w-6 text-gray-600" />
            </button>
            
            <div className="flex items-center ml-auto">
              <div className="mr-4 text-sm text-gray-600">
                {user?.name} <span className="text-blue-600">(管理员)</span>
              </div>
              
              <div className="relative">
                <div className="flex items-center space-x-4">
                  <Link to="/admin/profile" className="text-gray-600 hover:text-gray-900">
                    <FiUser />
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    <FiLogOut />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>
        
        {/* 页面内容 */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout 