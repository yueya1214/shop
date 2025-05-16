<<<<<<< HEAD
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FiShoppingBag, FiPackage, FiUsers, FiDollarSign, FiTruck, FiCheck } from 'react-icons/fi'
import { apiGetAllOrders } from '../../services/orderService'
import { Product } from '../../services/productService'

interface DashboardStats {
  totalOrders: number
  totalRevenue: number
  totalProducts: number
  pendingOrders: number
  shippedOrders: number
  completedOrders: number
}

const DashboardPage = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    pendingOrders: 0,
    shippedOrders: 0,
    completedOrders: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true)
      setError('')
      
      try {
        // 获取所有订单
        const { orders, total } = await apiGetAllOrders(1, 100)
        
        // 计算统计数据
        const pendingOrders = orders.filter(order => order.status === '待处理').length
        const shippedOrders = orders.filter(order => order.status === '已发货').length
        const completedOrders = orders.filter(order => order.status === '已完成').length
        
        const totalRevenue = orders.reduce((sum, order) => {
          return order.status !== '已取消' ? sum + order.totalAmount : sum
        }, 0)
        
        // 获取最近的订单
        const sortedOrders = [...orders].sort((a, b) => {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        })
        
        // 设置仪表板数据
        setStats({
          totalOrders: total,
          totalRevenue,
          totalProducts: 0, // 需要从产品API获取
          pendingOrders,
          shippedOrders,
          completedOrders
        })
        
        setRecentOrders(sortedOrders.slice(0, 5))
      } catch (error) {
        console.error('加载仪表板数据失败', error)
        setError('加载仪表板数据失败，请稍后再试')
      } finally {
        setLoading(false)
      }
    }
    
    fetchDashboardData()
  }, [])
  
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        <p>{error}</p>
        <button 
          className="mt-2 btn btn-primary text-sm"
          onClick={() => window.location.reload()}
        >
          重试
        </button>
      </div>
    )
  }
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">管理员仪表盘</h1>
      
      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
              <FiShoppingBag size={24} />
            </div>
            <div>
              <p className="text-gray-500">总订单数</p>
              <p className="text-2xl font-semibold">{stats.totalOrders}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
              <FiDollarSign size={24} />
            </div>
            <div>
              <p className="text-gray-500">总收入</p>
              <p className="text-2xl font-semibold">¥{stats.totalRevenue.toFixed(2)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
              <FiPackage size={24} />
            </div>
            <div>
              <p className="text-gray-500">商品数</p>
              <p className="text-2xl font-semibold">{stats.totalProducts}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 mr-4">
              <FiShoppingBag size={24} />
            </div>
            <div>
              <p className="text-gray-500">待处理订单</p>
              <p className="text-2xl font-semibold">{stats.pendingOrders}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-indigo-100 text-indigo-600 mr-4">
              <FiTruck size={24} />
            </div>
            <div>
              <p className="text-gray-500">已发货订单</p>
              <p className="text-2xl font-semibold">{stats.shippedOrders}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-teal-100 text-teal-600 mr-4">
              <FiCheck size={24} />
            </div>
            <div>
              <p className="text-gray-500">已完成订单</p>
              <p className="text-2xl font-semibold">{stats.completedOrders}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* 最近订单 */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold">最近订单</h2>
          <Link 
            to="/admin/orders" 
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            查看全部
          </Link>
        </div>
        
        {recentOrders.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            暂无订单数据
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    订单ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    日期
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    客户
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    金额
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    状态
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link to={`/admin/orders/${order.id}`} className="text-blue-600 hover:text-blue-900">
                        {order.id.slice(0, 8)}...
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(order.createdAt).toLocaleDateString('zh-CN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {order.address.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      ¥{order.totalAmount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span 
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${
                          order.status === '待处理' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === '已确认' ? 'bg-blue-100 text-blue-800' :
                          order.status === '已发货' ? 'bg-purple-100 text-purple-800' :
                          order.status === '已完成' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* 快速链接 */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 bg-gray-50 border-b">
          <h2 className="text-lg font-semibold">快速操作</h2>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link to="/admin/products/new" className="btn btn-primary flex items-center justify-center">
            <FiPackage className="mr-2" />
            添加新商品
          </Link>
          <Link to="/admin/orders" className="btn btn-secondary flex items-center justify-center">
            <FiShoppingBag className="mr-2" />
            管理订单
          </Link>
        </div>
      </div>
    </div>
  )
}

=======
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FiShoppingBag, FiPackage, FiUsers, FiDollarSign, FiTruck, FiCheck } from 'react-icons/fi'
import { apiGetAllOrders } from '../../services/orderService'
import { Product } from '../../services/productService'

interface DashboardStats {
  totalOrders: number
  totalRevenue: number
  totalProducts: number
  pendingOrders: number
  shippedOrders: number
  completedOrders: number
}

const DashboardPage = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    pendingOrders: 0,
    shippedOrders: 0,
    completedOrders: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true)
      setError('')
      
      try {
        // 获取所有订单
        const { orders, total } = await apiGetAllOrders(1, 100)
        
        // 计算统计数据
        const pendingOrders = orders.filter(order => order.status === '待处理').length
        const shippedOrders = orders.filter(order => order.status === '已发货').length
        const completedOrders = orders.filter(order => order.status === '已完成').length
        
        const totalRevenue = orders.reduce((sum, order) => {
          return order.status !== '已取消' ? sum + order.totalAmount : sum
        }, 0)
        
        // 获取最近的订单
        const sortedOrders = [...orders].sort((a, b) => {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        })
        
        // 设置仪表板数据
        setStats({
          totalOrders: total,
          totalRevenue,
          totalProducts: 0, // 需要从产品API获取
          pendingOrders,
          shippedOrders,
          completedOrders
        })
        
        setRecentOrders(sortedOrders.slice(0, 5))
      } catch (error) {
        console.error('加载仪表板数据失败', error)
        setError('加载仪表板数据失败，请稍后再试')
      } finally {
        setLoading(false)
      }
    }
    
    fetchDashboardData()
  }, [])
  
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        <p>{error}</p>
        <button 
          className="mt-2 btn btn-primary text-sm"
          onClick={() => window.location.reload()}
        >
          重试
        </button>
      </div>
    )
  }
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">管理员仪表盘</h1>
      
      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
              <FiShoppingBag size={24} />
            </div>
            <div>
              <p className="text-gray-500">总订单数</p>
              <p className="text-2xl font-semibold">{stats.totalOrders}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
              <FiDollarSign size={24} />
            </div>
            <div>
              <p className="text-gray-500">总收入</p>
              <p className="text-2xl font-semibold">¥{stats.totalRevenue.toFixed(2)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
              <FiPackage size={24} />
            </div>
            <div>
              <p className="text-gray-500">商品数</p>
              <p className="text-2xl font-semibold">{stats.totalProducts}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 mr-4">
              <FiShoppingBag size={24} />
            </div>
            <div>
              <p className="text-gray-500">待处理订单</p>
              <p className="text-2xl font-semibold">{stats.pendingOrders}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-indigo-100 text-indigo-600 mr-4">
              <FiTruck size={24} />
            </div>
            <div>
              <p className="text-gray-500">已发货订单</p>
              <p className="text-2xl font-semibold">{stats.shippedOrders}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-teal-100 text-teal-600 mr-4">
              <FiCheck size={24} />
            </div>
            <div>
              <p className="text-gray-500">已完成订单</p>
              <p className="text-2xl font-semibold">{stats.completedOrders}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* 最近订单 */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold">最近订单</h2>
          <Link 
            to="/admin/orders" 
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            查看全部
          </Link>
        </div>
        
        {recentOrders.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            暂无订单数据
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    订单ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    日期
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    客户
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    金额
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    状态
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link to={`/admin/orders/${order.id}`} className="text-blue-600 hover:text-blue-900">
                        {order.id.slice(0, 8)}...
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(order.createdAt).toLocaleDateString('zh-CN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {order.address.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      ¥{order.totalAmount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span 
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${
                          order.status === '待处理' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === '已确认' ? 'bg-blue-100 text-blue-800' :
                          order.status === '已发货' ? 'bg-purple-100 text-purple-800' :
                          order.status === '已完成' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* 快速链接 */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 bg-gray-50 border-b">
          <h2 className="text-lg font-semibold">快速操作</h2>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link to="/admin/products/new" className="btn btn-primary flex items-center justify-center">
            <FiPackage className="mr-2" />
            添加新商品
          </Link>
          <Link to="/admin/orders" className="btn btn-secondary flex items-center justify-center">
            <FiShoppingBag className="mr-2" />
            管理订单
          </Link>
        </div>
      </div>
    </div>
  )
}

>>>>>>> master
export default DashboardPage 