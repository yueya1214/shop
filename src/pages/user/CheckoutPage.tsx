<<<<<<< HEAD
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiArrowLeft, FiShoppingBag } from 'react-icons/fi'
import { useCartStore } from '../../stores/cartStore'
import { apiCreateOrder } from '../../services/orderService'

interface AddressForm {
  name: string
  phone: string
  province: string
  city: string
  district: string
  street: string
  zipCode: string
}

const CheckoutPage = () => {
  const navigate = useNavigate()
  const { items, totalPrice, clearCart } = useCartStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [address, setAddress] = useState<AddressForm>({
    name: '',
    phone: '',
    province: '',
    city: '',
    district: '',
    street: '',
    zipCode: ''
  })
  
  // 检查购物车是否为空
  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mb-4 text-gray-400">
          <FiShoppingBag size={64} className="mx-auto" />
        </div>
        <h2 className="text-xl font-semibold mb-4">购物车是空的，无法结算</h2>
        <button 
          className="btn btn-primary"
          onClick={() => navigate('/')}
        >
          去选购商品
        </button>
      </div>
    )
  }
  
  // 处理表单输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setAddress(prev => ({ ...prev, [name]: value }))
  }
  
  // 处理提交订单
  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // 表单验证
    if (!address.name || !address.phone || !address.province || 
        !address.city || !address.street) {
      setError('请填写必要的收货信息')
      return
    }
    
    if (!/^1[3-9]\d{9}$/.test(address.phone)) {
      setError('请输入正确的手机号码')
      return
    }
    
    setLoading(true)
    setError('')
    
    try {
      // 准备订单数据
      const orderData = {
        items: items.map(item => ({
          id: item.id,
          quantity: item.quantity
        })),
        address: address
      }
      
      // 调用创建订单API
      const order = await apiCreateOrder(orderData)
      
      // 清空购物车
      clearCart()
      
      // 跳转到订单详情页
      navigate(`/order/${order.id}`, { 
        state: { 
          isNewOrder: true, 
          message: '订单已成功提交！' 
        } 
      })
    } catch (error) {
      console.error('提交订单失败', error)
      setError('提交订单失败，请稍后再试')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div>
      <div className="flex items-center mb-6">
        <button 
          className="text-gray-600 hover:text-blue-600 flex items-center"
          onClick={() => navigate('/cart')}
        >
          <FiArrowLeft className="mr-2" />
          返回购物车
        </button>
        <h1 className="text-2xl font-bold ml-4">结算</h1>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 订单信息 */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
            <div className="p-4 bg-gray-50 border-b">
              <h2 className="text-lg font-semibold">收货地址</h2>
            </div>
            <div className="p-6">
              <form onSubmit={handleSubmitOrder}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="name" className="block text-gray-700 mb-1">收货人姓名 <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      className="input w-full"
                      value={address.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-gray-700 mb-1">手机号码 <span className="text-red-500">*</span></label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      className="input w-full"
                      value={address.phone}
                      onChange={handleInputChange}
                      pattern="^1[3-9]\d{9}$"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label htmlFor="province" className="block text-gray-700 mb-1">省份 <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      id="province"
                      name="province"
                      className="input w-full"
                      value={address.province}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="city" className="block text-gray-700 mb-1">城市 <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      className="input w-full"
                      value={address.city}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="district" className="block text-gray-700 mb-1">区/县</label>
                    <input
                      type="text"
                      id="district"
                      name="district"
                      className="input w-full"
                      value={address.district}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="street" className="block text-gray-700 mb-1">详细地址 <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      id="street"
                      name="street"
                      className="input w-full"
                      value={address.street}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="zipCode" className="block text-gray-700 mb-1">邮政编码</label>
                    <input
                      type="text"
                      id="zipCode"
                      name="zipCode"
                      className="input w-full"
                      value={address.zipCode}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </form>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4 bg-gray-50 border-b">
              <h2 className="text-lg font-semibold">订单商品</h2>
            </div>
            <ul className="divide-y">
              {items.map(item => (
                <li key={item.id} className="flex py-4 px-6">
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
          </div>
        </div>
        
        {/* 订单摘要 */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
            <h2 className="text-lg font-semibold mb-4">订单摘要</h2>
            
            <div className="border-t pt-4">
              <div className="flex justify-between py-2">
                <span className="text-gray-600">商品总价</span>
                <span>¥{totalPrice().toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">运费</span>
                <span>¥0.00</span>
              </div>
              <div className="flex justify-between py-2 font-semibold">
                <span>合计</span>
                <span className="text-blue-600 text-xl">¥{totalPrice().toFixed(2)}</span>
              </div>
            </div>
            
            <button
              className="btn btn-primary w-full mt-6"
              onClick={handleSubmitOrder}
              disabled={loading}
            >
              {loading ? '处理中...' : '提交订单'}
            </button>
            
            <p className="text-sm text-gray-500 mt-4">
              点击"提交订单"，即表示您同意我们的服务条款和隐私政策。
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

=======
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiArrowLeft, FiShoppingBag } from 'react-icons/fi'
import { useCartStore } from '../../stores/cartStore'
import { apiCreateOrder } from '../../services/orderService'

interface AddressForm {
  name: string
  phone: string
  province: string
  city: string
  district: string
  street: string
  zipCode: string
}

const CheckoutPage = () => {
  const navigate = useNavigate()
  const { items, totalPrice, clearCart } = useCartStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [address, setAddress] = useState<AddressForm>({
    name: '',
    phone: '',
    province: '',
    city: '',
    district: '',
    street: '',
    zipCode: ''
  })
  
  // 检查购物车是否为空
  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mb-4 text-gray-400">
          <FiShoppingBag size={64} className="mx-auto" />
        </div>
        <h2 className="text-xl font-semibold mb-4">购物车是空的，无法结算</h2>
        <button 
          className="btn btn-primary"
          onClick={() => navigate('/')}
        >
          去选购商品
        </button>
      </div>
    )
  }
  
  // 处理表单输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setAddress(prev => ({ ...prev, [name]: value }))
  }
  
  // 处理提交订单
  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // 表单验证
    if (!address.name || !address.phone || !address.province || 
        !address.city || !address.street) {
      setError('请填写必要的收货信息')
      return
    }
    
    if (!/^1[3-9]\d{9}$/.test(address.phone)) {
      setError('请输入正确的手机号码')
      return
    }
    
    setLoading(true)
    setError('')
    
    try {
      // 准备订单数据
      const orderData = {
        items: items.map(item => ({
          id: item.id,
          quantity: item.quantity
        })),
        address: address
      }
      
      // 调用创建订单API
      const order = await apiCreateOrder(orderData)
      
      // 清空购物车
      clearCart()
      
      // 跳转到订单详情页
      navigate(`/order/${order.id}`, { 
        state: { 
          isNewOrder: true, 
          message: '订单已成功提交！' 
        } 
      })
    } catch (error) {
      console.error('提交订单失败', error)
      setError('提交订单失败，请稍后再试')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div>
      <div className="flex items-center mb-6">
        <button 
          className="text-gray-600 hover:text-blue-600 flex items-center"
          onClick={() => navigate('/cart')}
        >
          <FiArrowLeft className="mr-2" />
          返回购物车
        </button>
        <h1 className="text-2xl font-bold ml-4">结算</h1>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 订单信息 */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
            <div className="p-4 bg-gray-50 border-b">
              <h2 className="text-lg font-semibold">收货地址</h2>
            </div>
            <div className="p-6">
              <form onSubmit={handleSubmitOrder}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="name" className="block text-gray-700 mb-1">收货人姓名 <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      className="input w-full"
                      value={address.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-gray-700 mb-1">手机号码 <span className="text-red-500">*</span></label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      className="input w-full"
                      value={address.phone}
                      onChange={handleInputChange}
                      pattern="^1[3-9]\d{9}$"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label htmlFor="province" className="block text-gray-700 mb-1">省份 <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      id="province"
                      name="province"
                      className="input w-full"
                      value={address.province}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="city" className="block text-gray-700 mb-1">城市 <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      className="input w-full"
                      value={address.city}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="district" className="block text-gray-700 mb-1">区/县</label>
                    <input
                      type="text"
                      id="district"
                      name="district"
                      className="input w-full"
                      value={address.district}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="street" className="block text-gray-700 mb-1">详细地址 <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      id="street"
                      name="street"
                      className="input w-full"
                      value={address.street}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="zipCode" className="block text-gray-700 mb-1">邮政编码</label>
                    <input
                      type="text"
                      id="zipCode"
                      name="zipCode"
                      className="input w-full"
                      value={address.zipCode}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </form>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4 bg-gray-50 border-b">
              <h2 className="text-lg font-semibold">订单商品</h2>
            </div>
            <ul className="divide-y">
              {items.map(item => (
                <li key={item.id} className="flex py-4 px-6">
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
          </div>
        </div>
        
        {/* 订单摘要 */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
            <h2 className="text-lg font-semibold mb-4">订单摘要</h2>
            
            <div className="border-t pt-4">
              <div className="flex justify-between py-2">
                <span className="text-gray-600">商品总价</span>
                <span>¥{totalPrice().toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">运费</span>
                <span>¥0.00</span>
              </div>
              <div className="flex justify-between py-2 font-semibold">
                <span>合计</span>
                <span className="text-blue-600 text-xl">¥{totalPrice().toFixed(2)}</span>
              </div>
            </div>
            
            <button
              className="btn btn-primary w-full mt-6"
              onClick={handleSubmitOrder}
              disabled={loading}
            >
              {loading ? '处理中...' : '提交订单'}
            </button>
            
            <p className="text-sm text-gray-500 mt-4">
              点击"提交订单"，即表示您同意我们的服务条款和隐私政策。
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

>>>>>>> master
export default CheckoutPage 