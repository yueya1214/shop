import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiTrash2, FiMinus, FiPlus, FiArrowRight } from 'react-icons/fi'
import { useCartStore } from '../../stores/cartStore'
import { useAuthStore } from '../../stores/authStore'

const CartPage = () => {
  const { items, removeItem, updateQuantity, clearCart, totalPrice, syncCart } = useCartStore()
  const { isAuthenticated, user } = useAuthStore()
  const navigate = useNavigate()
  const [isClearing, setIsClearing] = useState(false)
  
  // 组件加载时同步购物车
  useEffect(() => {
    syncCart(user?.id);
  }, [syncCart, user?.id]);
  
  // 处理结算
  const handleCheckout = () => {
    if (!isAuthenticated) {
      if (window.confirm('请先登录再进行结算。是否前往登录页面？')) {
        navigate('/login', { state: { from: '/cart' } })
      }
      return
    }
    
    navigate('/checkout')
  }
  
  // 处理清空购物车
  const handleClearCart = () => {
    if (window.confirm('确定要清空购物车吗？')) {
      setIsClearing(true)
      // 添加动画效果
      setTimeout(() => {
        clearCart()
        setIsClearing(false)
      }, 300)
    }
  }
  
  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mb-4 text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold mb-4">购物车是空的</h2>
        <p className="text-gray-500 mb-6">快去添加一些商品吧！</p>
        <Link to="/" className="btn btn-primary">
          浏览商品
        </Link>
      </div>
    )
  }
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">购物车</h1>
      
      <div className={`transition-opacity duration-300 ${isClearing ? 'opacity-30' : 'opacity-100'}`}>
        {/* 购物车商品列表 */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left py-3 px-4">商品</th>
                  <th className="text-center py-3 px-4">单价</th>
                  <th className="text-center py-3 px-4">数量</th>
                  <th className="text-center py-3 px-4">小计</th>
                  <th className="text-center py-3 px-4">操作</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(items) && items.map(item => (
                  <tr key={item.id} className="border-t">
                    <td className="py-4 px-4">
                      <div className="flex items-center">
                        <Link to={`/product/${item.id}`} className="block h-16 w-16 flex-shrink-0">
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className="h-full w-full object-cover"
                          />
                        </Link>
                        <Link 
                          to={`/product/${item.id}`}
                          className="ml-4 text-gray-800 hover:text-blue-600"
                        >
                          {item.name}
                        </Link>
                      </div>
                    </td>
                    <td className="text-center py-4 px-4">
                      ¥{item.price.toFixed(2)}
                    </td>
                    <td className="text-center py-4 px-4">
                      <div className="flex items-center justify-center">
                        <button 
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          aria-label="减少数量"
                        >
                          <FiMinus size={16} />
                        </button>
                        <span className="mx-3 w-8 text-center">{item.quantity}</span>
                        <button 
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          aria-label="增加数量"
                        >
                          <FiPlus size={16} />
                        </button>
                      </div>
                    </td>
                    <td className="text-center py-4 px-4 font-semibold">
                      ¥{(item.price * item.quantity).toFixed(2)}
                    </td>
                    <td className="text-center py-4 px-4">
                      <button 
                        className="text-red-500 hover:text-red-700"
                        onClick={() => removeItem(item.id)}
                        aria-label="删除商品"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* 购物车底部 */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <button 
              className="btn btn-secondary text-sm"
              onClick={handleClearCart}
            >
              清空购物车
            </button>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-600">商品总计:</span>
              <span className="text-xl font-bold text-blue-600">¥{totalPrice().toFixed(2)}</span>
            </div>
            <button 
              className="btn btn-primary w-full flex items-center justify-center"
              onClick={handleCheckout}
            >
              去结算
              <FiArrowRight className="ml-2" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CartPage 