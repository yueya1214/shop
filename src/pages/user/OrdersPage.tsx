<<<<<<< HEAD
import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiPackage, FiChevronRight, FiRefreshCw } from 'react-icons/fi'
import { apiGetUserOrders, Order, mockAPI } from '../../services/orderService'
import LoadingSpinner from '../../components/LoadingSpinner'
import ErrorAlert from '../../components/ErrorAlert'

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

// 订单状态对应的样式
const statusStyles: Record<string, string> = {
  'pending': 'bg-yellow-100 text-yellow-800',
  'paid': 'bg-blue-100 text-blue-800',
  'shipped': 'bg-purple-100 text-purple-800',
  'delivered': 'bg-green-100 text-green-800',
  'cancelled': 'bg-gray-100 text-gray-800'
}

// 订单状态显示文本
const statusText: Record<string, string> = {
  'pending': '待支付',
  'paid': '已支付',
  'shipped': '已发货',
  'delivered': '已送达',
  'cancelled': '已取消'
}

const OrdersPage: React.FC = () => {
  const navigate = useNavigate()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  
  // 加载订单数据
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true)
      setError('')
      
      try {
        // 使用实际API或模拟API
        // const result = await apiGetUserOrders(page, 10)
        const result = await mockAPI.getUserOrders(page, 10)
        setOrders(result.orders)
        setTotalPages(Math.ceil(result.total / result.limit))
      } catch (error) {
        console.error('加载订单失败', error)
        setError('加载订单失败，请稍后再试')
      } finally {
        setLoading(false)
      }
    }
    
    fetchOrders()
  }, [page])
  
  // 处理刷新
  const handleRefresh = () => {
    setLoading(true)
    setError('')
    
    // 使用实际API或模拟API
    // apiGetUserOrders(page, 10)
    mockAPI.getUserOrders(page, 10)
      .then(result => {
        setOrders(result.orders)
        setTotalPages(Math.ceil(result.total / result.limit))
      })
      .catch(error => {
        console.error('刷新订单失败', error)
        setError('刷新订单失败，请稍后再试')
      })
      .finally(() => {
        setLoading(false)
      })
  }
  
  // 切换页码
  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">我的订单</h1>
        <button 
          className="flex items-center text-gray-600 hover:text-blue-600"
          onClick={handleRefresh}
          disabled={loading}
        >
          <FiRefreshCw className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
          刷新
        </button>
      </div>
      
      {loading && orders.length === 0 ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : error ? (
        <ErrorAlert message={error} onRetry={handleRefresh} />
      ) : orders.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <div className="mb-4 text-gray-400">
            <FiPackage size={64} className="mx-auto" />
          </div>
          <h2 className="text-xl font-semibold mb-2">暂无订单记录</h2>
          <p className="text-gray-500 mb-6">您还没有创建任何订单</p>
          <Link to="/" className="btn btn-primary">
            去购物
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {orders.map(order => (
              <div 
                key={order.id} 
                className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => navigate(`/order/${order.id}`)}
              >
                <div className="p-4 border-b flex justify-between items-center">
                  <div>
                    <span className="text-gray-500 mr-4">订单编号: {order.id.slice(0, 8)}</span>
                    <span className="text-gray-500">{formatDate(order.createdAt)}</span>
                  </div>
                  <div className="flex items-center">
                    <span 
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        statusStyles[order.status] || 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {statusText[order.status] || order.status}
                    </span>
                    <FiChevronRight className="ml-2 text-gray-400" />
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex">
                      {order.items.slice(0, 3).map((item, index) => (
                        <div key={index} className="h-16 w-16 -ml-2 first:ml-0 rounded-md overflow-hidden border border-gray-200">
                          <img 
                            src={item.image} 
                            alt={item.name}
                            className="h-full w-full object-cover" 
                          />
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <div className="h-16 w-16 -ml-2 flex items-center justify-center bg-gray-100 rounded-md border border-gray-200 text-sm text-gray-500">
                          +{order.items.length - 3}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-gray-500 text-sm">共 {order.items.length} 件商品</div>
                      <div className="text-lg font-bold text-blue-600">¥{order.total.toFixed(2)}</div>
                    </div>
                  </div>
                  
                  <div className="text-gray-500 text-sm truncate">
                    收货地址: {order.address.province}{order.address.city}{order.address.district}{order.address.address}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* 分页 */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <div className="flex space-x-2">
                <button
                  className="btn btn-secondary"
                  disabled={page === 1}
                  onClick={() => handlePageChange(page - 1)}
                >
                  上一页
                </button>
                
                <span className="px-4 py-2 bg-white border rounded-md">
                  {page} / {totalPages}
                </span>
                
                <button
                  className="btn btn-secondary"
                  disabled={page === totalPages}
                  onClick={() => handlePageChange(page + 1)}
                >
                  下一页
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

=======
import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiPackage, FiChevronRight, FiRefreshCw } from 'react-icons/fi'
import { apiGetUserOrders, Order, mockAPI } from '../../services/orderService'
import LoadingSpinner from '../../components/LoadingSpinner'
import ErrorAlert from '../../components/ErrorAlert'

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

// 订单状态对应的样式
const statusStyles: Record<string, string> = {
  'pending': 'bg-yellow-100 text-yellow-800',
  'paid': 'bg-blue-100 text-blue-800',
  'shipped': 'bg-purple-100 text-purple-800',
  'delivered': 'bg-green-100 text-green-800',
  'cancelled': 'bg-gray-100 text-gray-800'
}

// 订单状态显示文本
const statusText: Record<string, string> = {
  'pending': '待支付',
  'paid': '已支付',
  'shipped': '已发货',
  'delivered': '已送达',
  'cancelled': '已取消'
}

const OrdersPage: React.FC = () => {
  const navigate = useNavigate()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  
  // 加载订单数据
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true)
      setError('')
      
      try {
        // 使用实际API或模拟API
        // const result = await apiGetUserOrders(page, 10)
        const result = await mockAPI.getUserOrders(page, 10)
        setOrders(result.orders)
        setTotalPages(Math.ceil(result.total / result.limit))
      } catch (error) {
        console.error('加载订单失败', error)
        setError('加载订单失败，请稍后再试')
      } finally {
        setLoading(false)
      }
    }
    
    fetchOrders()
  }, [page])
  
  // 处理刷新
  const handleRefresh = () => {
    setLoading(true)
    setError('')
    
    // 使用实际API或模拟API
    // apiGetUserOrders(page, 10)
    mockAPI.getUserOrders(page, 10)
      .then(result => {
        setOrders(result.orders)
        setTotalPages(Math.ceil(result.total / result.limit))
      })
      .catch(error => {
        console.error('刷新订单失败', error)
        setError('刷新订单失败，请稍后再试')
      })
      .finally(() => {
        setLoading(false)
      })
  }
  
  // 切换页码
  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">我的订单</h1>
        <button 
          className="flex items-center text-gray-600 hover:text-blue-600"
          onClick={handleRefresh}
          disabled={loading}
        >
          <FiRefreshCw className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
          刷新
        </button>
      </div>
      
      {loading && orders.length === 0 ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : error ? (
        <ErrorAlert message={error} onRetry={handleRefresh} />
      ) : orders.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <div className="mb-4 text-gray-400">
            <FiPackage size={64} className="mx-auto" />
          </div>
          <h2 className="text-xl font-semibold mb-2">暂无订单记录</h2>
          <p className="text-gray-500 mb-6">您还没有创建任何订单</p>
          <Link to="/" className="btn btn-primary">
            去购物
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {orders.map(order => (
              <div 
                key={order.id} 
                className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => navigate(`/order/${order.id}`)}
              >
                <div className="p-4 border-b flex justify-between items-center">
                  <div>
                    <span className="text-gray-500 mr-4">订单编号: {order.id.slice(0, 8)}</span>
                    <span className="text-gray-500">{formatDate(order.createdAt)}</span>
                  </div>
                  <div className="flex items-center">
                    <span 
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        statusStyles[order.status] || 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {statusText[order.status] || order.status}
                    </span>
                    <FiChevronRight className="ml-2 text-gray-400" />
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex">
                      {order.items.slice(0, 3).map((item, index) => (
                        <div key={index} className="h-16 w-16 -ml-2 first:ml-0 rounded-md overflow-hidden border border-gray-200">
                          <img 
                            src={item.image} 
                            alt={item.name}
                            className="h-full w-full object-cover" 
                          />
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <div className="h-16 w-16 -ml-2 flex items-center justify-center bg-gray-100 rounded-md border border-gray-200 text-sm text-gray-500">
                          +{order.items.length - 3}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-gray-500 text-sm">共 {order.items.length} 件商品</div>
                      <div className="text-lg font-bold text-blue-600">¥{order.total.toFixed(2)}</div>
                    </div>
                  </div>
                  
                  <div className="text-gray-500 text-sm truncate">
                    收货地址: {order.address.province}{order.address.city}{order.address.district}{order.address.address}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* 分页 */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <div className="flex space-x-2">
                <button
                  className="btn btn-secondary"
                  disabled={page === 1}
                  onClick={() => handlePageChange(page - 1)}
                >
                  上一页
                </button>
                
                <span className="px-4 py-2 bg-white border rounded-md">
                  {page} / {totalPages}
                </span>
                
                <button
                  className="btn btn-secondary"
                  disabled={page === totalPages}
                  onClick={() => handlePageChange(page + 1)}
                >
                  下一页
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

>>>>>>> master
export default OrdersPage 