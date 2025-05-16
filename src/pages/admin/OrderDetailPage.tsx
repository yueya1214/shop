<<<<<<< HEAD
import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { 
  FiArrowLeft, 
  FiPackage, 
  FiUser, 
  FiCalendar, 
  FiClock, 
  FiTruck, 
  FiCheck, 
  FiX,
  FiSave,
  FiInfo 
} from 'react-icons/fi'
import { apiGetOrder, apiUpdateOrderStatus, Order, OrderStatus } from '../../services/orderService'

const OrderDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | ''>('')
  
  // 订单状态选项
  const statusOptions: OrderStatus[] = ['待处理', '已确认', '已发货', '已完成', '已取消']
  
  useEffect(() => {
    if (!id) return
    
    const fetchOrder = async () => {
      setLoading(true)
      setError('')
      
      try {
        const data = await apiGetOrder(id)
        setOrder(data)
        setSelectedStatus(data.status)
      } catch (error) {
        console.error('加载订单详情失败', error)
        setError('加载订单详情失败，请稍后再试')
      } finally {
        setLoading(false)
      }
    }
    
    fetchOrder()
  }, [id])
  
  // 处理状态更新
  const handleStatusUpdate = async () => {
    if (!order || !selectedStatus || selectedStatus === order.status) return
    
    setUpdatingStatus(true)
    
    try {
      const updatedOrder = await apiUpdateOrderStatus(order.id, selectedStatus)
      setOrder(updatedOrder)
      alert('订单状态已更新')
    } catch (error) {
      console.error('更新订单状态失败', error)
      alert('更新订单状态失败，请稍后再试')
    } finally {
      setUpdatingStatus(false)
    }
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
  
  // 获取状态图标
  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case '待处理':
        return <FiClock />
      case '已确认':
        return <FiInfo />
      case '已发货':
        return <FiTruck />
      case '已完成':
        return <FiCheck />
      case '已取消':
        return <FiX />
      default:
        return <FiClock />
    }
  }
  
  // 获取状态样式
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
  
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }
  
  if (error || !order) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error || '订单不存在'}</p>
        <button 
          className="mt-4 btn btn-primary"
          onClick={() => navigate('/admin/orders')}
        >
          返回订单列表
        </button>
      </div>
    )
  }
  
  return (
    <div>
      <div className="flex items-center mb-6">
        <button 
          className="text-gray-600 hover:text-blue-600 flex items-center"
          onClick={() => navigate('/admin/orders')}
        >
          <FiArrowLeft className="mr-2" />
          返回订单列表
        </button>
        <h1 className="text-2xl font-bold ml-4">订单详情</h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧信息面板 */}
        <div className="lg:col-span-2">
          {/* 订单信息卡片 */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
            <div className="p-4 bg-gray-50 border-b">
              <h2 className="text-lg font-semibold flex items-center">
                <FiPackage className="mr-2" />
                订单信息
              </h2>
            </div>
            <div className="p-6">
              <div className="mb-6 flex flex-wrap gap-4">
                <div className="flex items-center bg-gray-100 rounded-md p-2 text-sm">
                  <span className="font-semibold mr-2">订单ID:</span>
                  <span className="text-gray-700">{order.id}</span>
                </div>
                <div className="flex items-center bg-gray-100 rounded-md p-2 text-sm">
                  <span className="font-semibold mr-2">用户ID:</span>
                  <span className="text-gray-700">{order.userId}</span>
                </div>
                <div className="flex items-center bg-gray-100 rounded-md p-2 text-sm">
                  <FiCalendar className="mr-1" />
                  <span className="font-semibold mr-2">创建时间:</span>
                  <span className="text-gray-700">{formatDate(order.createdAt)}</span>
                </div>
                <div className="flex items-center bg-gray-100 rounded-md p-2 text-sm">
                  <FiCalendar className="mr-1" />
                  <span className="font-semibold mr-2">更新时间:</span>
                  <span className="text-gray-700">{formatDate(order.updatedAt)}</span>
                </div>
                <div className="flex items-center bg-gray-100 rounded-md p-2 text-sm">
                  <span className={`px-2 py-1 rounded-full flex items-center ${getStatusStyle(order.status)}`}>
                    {getStatusIcon(order.status)}
                    <span className="ml-1">{order.status}</span>
                  </span>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-md font-semibold mb-2 flex items-center">
                  <FiUser className="mr-2" />
                  收货信息
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-md">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">收货人</p>
                    <p className="font-medium">{order.address.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">联系电话</p>
                    <p className="font-medium">{order.address.phone}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-500 mb-1">收货地址</p>
                    <p className="font-medium">
                      {order.address.province} {order.address.city} {order.address.district} {order.address.street}
                      {order.address.zipCode && ` (${order.address.zipCode})`}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* 商品列表卡片 */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
            <div className="p-4 bg-gray-50 border-b">
              <h2 className="text-lg font-semibold">订单商品</h2>
            </div>
            <ul className="divide-y">
              {order.items.map((item, index) => (
                <li key={index} className="flex py-4 px-6">
                  <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="ml-4 flex flex-1 flex-col">
                    <div>
                      <div className="flex justify-between">
                        <h3 className="text-base font-medium text-gray-900">{item.name}</h3>
                        <p className="text-sm font-medium text-gray-900">¥{item.price.toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="flex flex-1 items-end justify-between">
                      <p className="text-gray-500 text-sm">数量: {item.quantity}</p>
                      <p className="text-right font-medium">小计: ¥{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="p-4 border-t bg-gray-50 text-right">
              <div className="text-gray-600">总计 {order.items.reduce((sum, item) => sum + item.quantity, 0)} 件商品</div>
              <div className="text-xl font-bold text-blue-600">¥{order.totalAmount.toFixed(2)}</div>
            </div>
          </div>
        </div>
        
        {/* 右侧操作面板 */}
        <div>
          {/* 订单状态管理 */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
            <div className="p-4 bg-gray-50 border-b">
              <h2 className="text-lg font-semibold">更新订单状态</h2>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">当前状态</label>
                <div className={`px-3 py-2 rounded-md ${getStatusStyle(order.status)}`}>
                  <div className="flex items-center font-medium">
                    {getStatusIcon(order.status)}
                    <span className="ml-2">{order.status}</span>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-700 mb-2">新状态</label>
                <select
                  className="input w-full"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as OrderStatus)}
                >
                  <option value="" disabled>选择新状态</option>
                  {statusOptions.map((status) => (
                    <option
                      key={status}
                      value={status}
                      disabled={status === order.status}
                    >
                      {status}
                    </option>
                  ))}
                </select>
              </div>
              
              <button
                className="btn btn-primary w-full flex items-center justify-center"
                onClick={handleStatusUpdate}
                disabled={updatingStatus || !selectedStatus || selectedStatus === order.status}
              >
                <FiSave className="mr-2" />
                {updatingStatus ? '更新中...' : '更新状态'}
              </button>
            </div>
          </div>
          
          {/* 其他操作 */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4 bg-gray-50 border-b">
              <h2 className="text-lg font-semibold">快速操作</h2>
            </div>
            <div className="p-6">
              <Link 
                to={`/admin/users/${order.userId}`} 
                className="btn btn-secondary w-full flex items-center justify-center mb-3"
              >
                <FiUser className="mr-2" />
                查看客户信息
              </Link>
              
              <button 
                className="btn w-full bg-gray-100 text-gray-800 hover:bg-gray-200 flex items-center justify-center"
                onClick={() => window.print()}
              >
                <FiPackage className="mr-2" />
                打印订单
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

=======
import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { 
  FiArrowLeft, 
  FiPackage, 
  FiUser, 
  FiCalendar, 
  FiClock, 
  FiTruck, 
  FiCheck, 
  FiX,
  FiSave,
  FiInfo 
} from 'react-icons/fi'
import { apiGetOrder, apiUpdateOrderStatus, Order, OrderStatus } from '../../services/orderService'

const OrderDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | ''>('')
  
  // 订单状态选项
  const statusOptions: OrderStatus[] = ['待处理', '已确认', '已发货', '已完成', '已取消']
  
  useEffect(() => {
    if (!id) return
    
    const fetchOrder = async () => {
      setLoading(true)
      setError('')
      
      try {
        const data = await apiGetOrder(id)
        setOrder(data)
        setSelectedStatus(data.status)
      } catch (error) {
        console.error('加载订单详情失败', error)
        setError('加载订单详情失败，请稍后再试')
      } finally {
        setLoading(false)
      }
    }
    
    fetchOrder()
  }, [id])
  
  // 处理状态更新
  const handleStatusUpdate = async () => {
    if (!order || !selectedStatus || selectedStatus === order.status) return
    
    setUpdatingStatus(true)
    
    try {
      const updatedOrder = await apiUpdateOrderStatus(order.id, selectedStatus)
      setOrder(updatedOrder)
      alert('订单状态已更新')
    } catch (error) {
      console.error('更新订单状态失败', error)
      alert('更新订单状态失败，请稍后再试')
    } finally {
      setUpdatingStatus(false)
    }
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
  
  // 获取状态图标
  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case '待处理':
        return <FiClock />
      case '已确认':
        return <FiInfo />
      case '已发货':
        return <FiTruck />
      case '已完成':
        return <FiCheck />
      case '已取消':
        return <FiX />
      default:
        return <FiClock />
    }
  }
  
  // 获取状态样式
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
  
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }
  
  if (error || !order) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error || '订单不存在'}</p>
        <button 
          className="mt-4 btn btn-primary"
          onClick={() => navigate('/admin/orders')}
        >
          返回订单列表
        </button>
      </div>
    )
  }
  
  return (
    <div>
      <div className="flex items-center mb-6">
        <button 
          className="text-gray-600 hover:text-blue-600 flex items-center"
          onClick={() => navigate('/admin/orders')}
        >
          <FiArrowLeft className="mr-2" />
          返回订单列表
        </button>
        <h1 className="text-2xl font-bold ml-4">订单详情</h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧信息面板 */}
        <div className="lg:col-span-2">
          {/* 订单信息卡片 */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
            <div className="p-4 bg-gray-50 border-b">
              <h2 className="text-lg font-semibold flex items-center">
                <FiPackage className="mr-2" />
                订单信息
              </h2>
            </div>
            <div className="p-6">
              <div className="mb-6 flex flex-wrap gap-4">
                <div className="flex items-center bg-gray-100 rounded-md p-2 text-sm">
                  <span className="font-semibold mr-2">订单ID:</span>
                  <span className="text-gray-700">{order.id}</span>
                </div>
                <div className="flex items-center bg-gray-100 rounded-md p-2 text-sm">
                  <span className="font-semibold mr-2">用户ID:</span>
                  <span className="text-gray-700">{order.userId}</span>
                </div>
                <div className="flex items-center bg-gray-100 rounded-md p-2 text-sm">
                  <FiCalendar className="mr-1" />
                  <span className="font-semibold mr-2">创建时间:</span>
                  <span className="text-gray-700">{formatDate(order.createdAt)}</span>
                </div>
                <div className="flex items-center bg-gray-100 rounded-md p-2 text-sm">
                  <FiCalendar className="mr-1" />
                  <span className="font-semibold mr-2">更新时间:</span>
                  <span className="text-gray-700">{formatDate(order.updatedAt)}</span>
                </div>
                <div className="flex items-center bg-gray-100 rounded-md p-2 text-sm">
                  <span className={`px-2 py-1 rounded-full flex items-center ${getStatusStyle(order.status)}`}>
                    {getStatusIcon(order.status)}
                    <span className="ml-1">{order.status}</span>
                  </span>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-md font-semibold mb-2 flex items-center">
                  <FiUser className="mr-2" />
                  收货信息
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-md">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">收货人</p>
                    <p className="font-medium">{order.address.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">联系电话</p>
                    <p className="font-medium">{order.address.phone}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-500 mb-1">收货地址</p>
                    <p className="font-medium">
                      {order.address.province} {order.address.city} {order.address.district} {order.address.street}
                      {order.address.zipCode && ` (${order.address.zipCode})`}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* 商品列表卡片 */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
            <div className="p-4 bg-gray-50 border-b">
              <h2 className="text-lg font-semibold">订单商品</h2>
            </div>
            <ul className="divide-y">
              {order.items.map((item, index) => (
                <li key={index} className="flex py-4 px-6">
                  <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="ml-4 flex flex-1 flex-col">
                    <div>
                      <div className="flex justify-between">
                        <h3 className="text-base font-medium text-gray-900">{item.name}</h3>
                        <p className="text-sm font-medium text-gray-900">¥{item.price.toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="flex flex-1 items-end justify-between">
                      <p className="text-gray-500 text-sm">数量: {item.quantity}</p>
                      <p className="text-right font-medium">小计: ¥{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="p-4 border-t bg-gray-50 text-right">
              <div className="text-gray-600">总计 {order.items.reduce((sum, item) => sum + item.quantity, 0)} 件商品</div>
              <div className="text-xl font-bold text-blue-600">¥{order.totalAmount.toFixed(2)}</div>
            </div>
          </div>
        </div>
        
        {/* 右侧操作面板 */}
        <div>
          {/* 订单状态管理 */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
            <div className="p-4 bg-gray-50 border-b">
              <h2 className="text-lg font-semibold">更新订单状态</h2>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">当前状态</label>
                <div className={`px-3 py-2 rounded-md ${getStatusStyle(order.status)}`}>
                  <div className="flex items-center font-medium">
                    {getStatusIcon(order.status)}
                    <span className="ml-2">{order.status}</span>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-700 mb-2">新状态</label>
                <select
                  className="input w-full"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as OrderStatus)}
                >
                  <option value="" disabled>选择新状态</option>
                  {statusOptions.map((status) => (
                    <option
                      key={status}
                      value={status}
                      disabled={status === order.status}
                    >
                      {status}
                    </option>
                  ))}
                </select>
              </div>
              
              <button
                className="btn btn-primary w-full flex items-center justify-center"
                onClick={handleStatusUpdate}
                disabled={updatingStatus || !selectedStatus || selectedStatus === order.status}
              >
                <FiSave className="mr-2" />
                {updatingStatus ? '更新中...' : '更新状态'}
              </button>
            </div>
          </div>
          
          {/* 其他操作 */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4 bg-gray-50 border-b">
              <h2 className="text-lg font-semibold">快速操作</h2>
            </div>
            <div className="p-6">
              <Link 
                to={`/admin/users/${order.userId}`} 
                className="btn btn-secondary w-full flex items-center justify-center mb-3"
              >
                <FiUser className="mr-2" />
                查看客户信息
              </Link>
              
              <button 
                className="btn w-full bg-gray-100 text-gray-800 hover:bg-gray-200 flex items-center justify-center"
                onClick={() => window.print()}
              >
                <FiPackage className="mr-2" />
                打印订单
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

>>>>>>> master
export default OrderDetailPage 