import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { FiShoppingCart, FiArrowLeft } from 'react-icons/fi'
import { useCartStore } from '../../stores/cartStore'
import { apiGetProduct, Product } from '../../services/productService'
import ProductReviews from '../../components/ProductReviews'

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [quantity, setQuantity] = useState(1)
  const { addItem } = useCartStore()
  
  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return
      
      setLoading(true)
      setError('')
      
      try {
        const data = await apiGetProduct(id)
        setProduct(data)
      } catch (error) {
        console.error('加载商品详情失败', error)
        setError('加载商品详情失败，请稍后再试')
      } finally {
        setLoading(false)
      }
    }
    
    fetchProduct()
  }, [id])
  
  const handleAddToCart = () => {
    if (!product) return
    
    // 添加商品到购物车
    addItem(product, quantity)
    
    // 显示添加成功提示
    window.alert(`已将 ${quantity} 件 ${product.name} 加入购物车`)
  }
  
  const handleQuantityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setQuantity(parseInt(e.target.value))
  }
  
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }
  
  if (error || !product) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error || '商品不存在'}</p>
        <button 
          className="mt-4 btn btn-primary"
          onClick={() => navigate(-1)}
        >
          返回
        </button>
      </div>
    )
  }
  
  return (
    <div>
      {/* 返回按钮 */}
      <button 
        className="flex items-center text-gray-600 hover:text-blue-600 mb-6"
        onClick={() => navigate(-1)}
      >
        <FiArrowLeft className="mr-2" />
        返回
      </button>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="md:flex">
          {/* 商品图片 */}
          <div className="md:w-1/2">
            <img 
              src={product.image} 
              alt={product.name} 
              className="w-full h-80 md:h-96 object-cover"
            />
          </div>
          
          {/* 商品信息 */}
          <div className="p-6 md:w-1/2">
            <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
            <p className="text-blue-600 text-2xl font-bold mb-4">¥{product.price.toFixed(2)}</p>
            
            <div className="mb-6">
              <p className="text-gray-500 mb-4">{product.description}</p>
              <p className="text-gray-700">
                <span className="font-semibold">分类：</span>
                <span className="bg-gray-200 px-2 py-1 rounded text-sm">{product.category}</span>
              </p>
              <p className="text-gray-700 mt-2">
                <span className="font-semibold">库存：</span>
                {product.stock > 0 ? (
                  <span className="text-green-600">{product.stock} 件</span>
                ) : (
                  <span className="text-red-600">已售罄</span>
                )}
              </p>
            </div>
            
            {/* 购买选项 */}
            {product.stock > 0 ? (
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex items-center">
                  <label htmlFor="quantity" className="mr-2">数量：</label>
                  <select 
                    id="quantity" 
                    value={quantity} 
                    onChange={handleQuantityChange}
                    className="input py-1"
                  >
                    {[...Array(Math.min(10, product.stock))].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1}
                      </option>
                    ))}
                  </select>
                </div>
                
                <button 
                  className="btn btn-primary flex items-center justify-center"
                  onClick={handleAddToCart}
                >
                  <FiShoppingCart className="mr-2" />
                  加入购物车
                </button>
              </div>
            ) : (
              <button 
                className="btn btn-secondary w-full sm:w-auto"
                disabled
              >
                已售罄
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* 商品评价区域 */}
      {product && <ProductReviews productId={product.id} />}
    </div>
  )
}

export default ProductDetailPage 