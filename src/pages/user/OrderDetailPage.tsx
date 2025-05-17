import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { FiArrowLeft, FiCheckCircle, FiClock } from 'react-icons/fi'
import { apiGetOrder, Order } from '../../services/orderService'

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
const statusStyles = {
  '待处理': { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: FiClock },
  '已确认': { bg: 'bg-blue-100', text: 'text-blue-800', icon: FiClock },
  '已发货': { bg: 'bg-purple-100', text: 'text-purple-800', icon: FiClock },
  '已完成': { bg: 'bg-green-100', text: 'text-green-800', icon: FiCheckCircle },
  '已取消': { bg: 'bg-gray-100', text: 'text-gray-800', icon: FiClock }
}

const OrderDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  // 获取位置状态数据
  const locationState = location.state as { isNewOrder?: boolean; message?: string } | null
  
  useEffect(() => {
    if (!id) return
    
    const fetchOrder = async () => {
      setLoading(true)
      setError('')
      
      try {
        const data = await apiGetOrder(id)
        setOrder(data)
      } catch (error) {
        console.error('加载订单详情失败', error)
        setError('加载订单详情失败，请稍后再试')
      } finally {
        setLoading(false)
      }
    }
    
    fetchOrder()
  }, [id])
  
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
          onClick={() => navigate('/orders')}
        >
          返回订单列表
        </button>
      </div>
    )
  }
  
  // 获取订单状态样式
  const StatusIcon = statusStyles[order.status]?.icon || FiClock
  const statusBg = statusStyles[order.status]?.bg || 'bg-gray-100'
  const statusText = statusStyles[order.status]?.text || 'text-gray-800'
  
  return (
    <div>
      {/* 成功提示 */}
      {locationState?.isNewOrder && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6 flex items-center">
          <FiCheckCircle className="mr-2" />
          <span>{locationState.message || '订单已成功提交！'}</span>
        </div>
      )}
      
      <div className="flex items-center mb-6">
        <button 
          className="text-gray-600 hover:text-blue-600 flex items-center"
          onClick={() => navigate('/orders')}
        >
          <FiArrowLeft className="mr-2" />
          返回订单列表
        </button>
        <h1 className="text-2xl font-bold ml-4">订单详情</h1>
      </div>
      
      {/* 订单状态 */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="p-6 flex items-center">
          <div className={`p-3 rounded-full ${statusBg} ${statusText} mr-4`}>
            <StatusIcon size={24} />
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-1">
              订单状态: {order.status}
            </h2>
            <p className="text-gray-500">
              订单编号: {order.id}
            </p>
            <p className="text-gray-500">
              下单时间: {formatDate(order.createdAt)}
            </p>
          </div>
        </div>
      </div>
      
      {/* 订单商品 */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="p-4 bg-gray-50 border-b">
          <h2 className="text-lg font-semibold">订单商品</h2>
        </div>
        <ul className="divide-y">
          {Array.isArray(order.items) && order.items.map((item, index) => (
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
          <div className="text-gray-600">总计 {Array.isArray(order.items) ? order.items.reduce((sum, item) => sum + item.quantity, 0) : 0} 件商品</div>
          <div className="text-xl font-bold text-blue-600">¥{(order.total || (order as any).totalAmount || 0).toFixed(2)}</div>
        </div>
      </div>
      
      {/* 收货信息 */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="p-4 bg-gray-50 border-b">
          <h2 className="text-lg font-semibold">收货信息</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-500 text-sm mb-1">收货人</p>
              <p className="font-medium">{order.address.name}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm mb-1">联系电话</p>
              <p className="font-medium">{order.address.phone}</p>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-gray-500 text-sm mb-1">收货地址</p>
            <p className="font-medium">
              {order.address.province} {order.address.city} {order.address.district} {order.address.street}
              {order.address.zipCode && ` (${order.address.zipCode})`}
            </p>
          </div>
        </div>
      </div>
      
      {/* 订单操作 */}
      {(order.status === '待处理' || order.status === '已确认') && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 bg-gray-50 border-b">
            <h2 className="text-lg font-semibold">订单操作</h2>
          </div>
          <div className="p-6">
            <button 
              className="btn btn-danger"
              onClick={() => {
                if (window.confirm('确定要取消该订单吗？')) {
                  // 这里应该调用取消订单的API
                  alert('订单取消功能尚未实现')
                }
              }}
            >
              取消订单
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default OrderDetailPage 