<<<<<<< HEAD
import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { FiEye, FiSearch, FiFilter, FiShoppingBag } from 'react-icons/fi'
import { apiGetAllOrders, Order, OrderStatus } from '../../services/orderService'

const OrdersManagePage = () => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [totalOrders, setTotalOrders] = useState(0)
  
  // 过滤和分页状态
  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>(
    (searchParams.get('status') as OrderStatus | '') || ''
  )
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '')
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1'))
  const limit = 10
  
  // 订单状态选项
  const statusOptions: OrderStatus[] = ['待处理', '已确认', '已发货', '已完成', '已取消']
  
  // 获取订单列表
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true)
      setError('')
      
      try {
        const { orders, total } = await apiGetAllOrders(page, limit, statusFilter)
        
        // 如果有搜索关键字，进行客户端过滤（假设没有后端搜索API）
        const filteredOrders = searchQuery
          ? orders.filter(order => 
              order.id.includes(searchQuery) || 
              order.address.name.includes(searchQuery) ||
              order.address.phone.includes(searchQuery))
          : orders
        
        setOrders(filteredOrders)
        setTotalOrders(total)
      } catch (error) {
        console.error('加载订单列表失败', error)
        setError('加载订单列表失败，请稍后再试')
      } finally {
        setLoading(false)
      }
    }
    
    fetchOrders()
  }, [page, statusFilter, searchQuery])
  
  // 更新 URL 参数
  useEffect(() => {
    const params = new URLSearchParams()
    
    if (page > 1) params.set('page', page.toString())
    if (statusFilter) params.set('status', statusFilter)
    if (searchQuery) params.set('search', searchQuery)
    
    setSearchParams(params)
  }, [page, statusFilter, searchQuery, setSearchParams])
  
  // 处理搜索
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1) // 重置到第一页
  }
  
  // 处理状态筛选
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value as OrderStatus | '')
    setPage(1) // 重置到第一页
  }
  
  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }
  
  // 获取状态标签样式
  const getStatusStyle = (status: OrderStatus) => {
    switch (status) {
      case '待处理':
        return 'bg-yellow-100 text-yellow-800'
      case '已确认':
        return 'bg-blue-100 text-blue-800'
      case '已发货':
        return 'bg-purple-100 text-purple-800'
      case '已完成':
        return 'bg-green-100 text-green-800'
      case '已取消':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }
  
  // 计算总页数
  const totalPages = Math.ceil(totalOrders / limit)
  
  if (loading && orders.length === 0) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">订单管理</h1>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {/* 搜索和筛选 */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="搜索订单号、客户名称或电话..."
                className="input w-full pr-10"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <FiSearch size={20} />
              </button>
            </div>
          </form>
          
          <div className="w-full md:w-64">
            <select
              className="input w-full"
              value={statusFilter}
              onChange={handleStatusChange}
            >
              <option value="">所有状态</option>
              {statusOptions.map(status => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {/* 订单列表 */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="p-4 bg-gray-50 border-b">
          <h2 className="text-lg font-semibold flex items-center">
            <FiShoppingBag className="mr-2" />
            订单列表 ({totalOrders})
          </h2>
        </div>
        
        {orders.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            {searchQuery || statusFilter ? '没有找到匹配的订单' : '暂无订单数据'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    订单号
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
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {order.id.substring(0, 8)}...
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{formatDate(order.createdAt)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{order.address.name}</div>
                      <div className="text-sm text-gray-500">{order.address.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        ¥{order.totalAmount.toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.items.reduce((sum, item) => sum + item.quantity, 0)} 件商品
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusStyle(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link 
                        to={`/admin/orders/${order.id}`} 
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <FiEye className="inline mr-1" />
                        查看详情
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* 分页 */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mb-6">
          <div>
            <span className="text-sm text-gray-700">
              显示 {(page - 1) * limit + 1}-{Math.min(page * limit, totalOrders)} 条，共 {totalOrders} 条
            </span>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setPage(prevPage => Math.max(prevPage - 1, 1))}
              disabled={page === 1}
              className={`btn ${page === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'btn-secondary'}`}
            >
              上一页
            </button>
            <button
              onClick={() => setPage(prevPage => Math.min(prevPage + 1, totalPages))}
              disabled={page === totalPages}
              className={`btn ${page === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'btn-secondary'}`}
            >
              下一页
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

=======
import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { FiEye, FiSearch, FiFilter, FiShoppingBag } from 'react-icons/fi'
import { apiGetAllOrders, Order, OrderStatus } from '../../services/orderService'

const OrdersManagePage = () => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [totalOrders, setTotalOrders] = useState(0)
  
  // 过滤和分页状态
  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>(
    (searchParams.get('status') as OrderStatus | '') || ''
  )
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '')
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1'))
  const limit = 10
  
  // 订单状态选项
  const statusOptions: OrderStatus[] = ['待处理', '已确认', '已发货', '已完成', '已取消']
  
  // 获取订单列表
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true)
      setError('')
      
      try {
        const { orders, total } = await apiGetAllOrders(page, limit, statusFilter)
        
        // 如果有搜索关键字，进行客户端过滤（假设没有后端搜索API）
        const filteredOrders = searchQuery
          ? orders.filter(order => 
              order.id.includes(searchQuery) || 
              order.address.name.includes(searchQuery) ||
              order.address.phone.includes(searchQuery))
          : orders
        
        setOrders(filteredOrders)
        setTotalOrders(total)
      } catch (error) {
        console.error('加载订单列表失败', error)
        setError('加载订单列表失败，请稍后再试')
      } finally {
        setLoading(false)
      }
    }
    
    fetchOrders()
  }, [page, statusFilter, searchQuery])
  
  // 更新 URL 参数
  useEffect(() => {
    const params = new URLSearchParams()
    
    if (page > 1) params.set('page', page.toString())
    if (statusFilter) params.set('status', statusFilter)
    if (searchQuery) params.set('search', searchQuery)
    
    setSearchParams(params)
  }, [page, statusFilter, searchQuery, setSearchParams])
  
  // 处理搜索
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1) // 重置到第一页
  }
  
  // 处理状态筛选
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value as OrderStatus | '')
    setPage(1) // 重置到第一页
  }
  
  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }
  
  // 获取状态标签样式
  const getStatusStyle = (status: OrderStatus) => {
    switch (status) {
      case '待处理':
        return 'bg-yellow-100 text-yellow-800'
      case '已确认':
        return 'bg-blue-100 text-blue-800'
      case '已发货':
        return 'bg-purple-100 text-purple-800'
      case '已完成':
        return 'bg-green-100 text-green-800'
      case '已取消':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }
  
  // 计算总页数
  const totalPages = Math.ceil(totalOrders / limit)
  
  if (loading && orders.length === 0) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">订单管理</h1>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {/* 搜索和筛选 */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="搜索订单号、客户名称或电话..."
                className="input w-full pr-10"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <FiSearch size={20} />
              </button>
            </div>
          </form>
          
          <div className="w-full md:w-64">
            <select
              className="input w-full"
              value={statusFilter}
              onChange={handleStatusChange}
            >
              <option value="">所有状态</option>
              {statusOptions.map(status => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {/* 订单列表 */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="p-4 bg-gray-50 border-b">
          <h2 className="text-lg font-semibold flex items-center">
            <FiShoppingBag className="mr-2" />
            订单列表 ({totalOrders})
          </h2>
        </div>
        
        {orders.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            {searchQuery || statusFilter ? '没有找到匹配的订单' : '暂无订单数据'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    订单号
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
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {order.id.substring(0, 8)}...
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{formatDate(order.createdAt)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{order.address.name}</div>
                      <div className="text-sm text-gray-500">{order.address.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        ¥{order.totalAmount.toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.items.reduce((sum, item) => sum + item.quantity, 0)} 件商品
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusStyle(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link 
                        to={`/admin/orders/${order.id}`} 
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <FiEye className="inline mr-1" />
                        查看详情
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* 分页 */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mb-6">
          <div>
            <span className="text-sm text-gray-700">
              显示 {(page - 1) * limit + 1}-{Math.min(page * limit, totalOrders)} 条，共 {totalOrders} 条
            </span>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setPage(prevPage => Math.max(prevPage - 1, 1))}
              disabled={page === 1}
              className={`btn ${page === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'btn-secondary'}`}
            >
              上一页
            </button>
            <button
              onClick={() => setPage(prevPage => Math.min(prevPage + 1, totalPages))}
              disabled={page === totalPages}
              className={`btn ${page === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'btn-secondary'}`}
            >
              下一页
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

>>>>>>> master
export default OrdersManagePage 