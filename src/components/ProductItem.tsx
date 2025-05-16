import { Link } from 'react-router-dom'
import { FiShoppingCart, FiInfo } from 'react-icons/fi'
import { Product } from '../services/productService'
import { useCartStore } from '../stores/cartStore'

interface ProductItemProps {
  product: Product
}

const ProductItem = ({ product }: ProductItemProps) => {
  const { addItem } = useCartStore()
  
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image
    })
    
    // 显示添加到购物车的提示
    alert(`已将 ${product.name} 添加到购物车`)
  }
  
  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden transition-transform hover:shadow-lg hover:-translate-y-1">
      <Link to={`/products/${product.id}`} className="block">
        <div className="h-48 overflow-hidden">
          <img 
            src={product.image} 
            alt={product.name} 
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="p-4">
          <h3 className="font-medium text-gray-900 mb-1 truncate">{product.name}</h3>
          <p className="text-gray-500 text-sm h-10 line-clamp-2">{product.description}</p>
          
          <div className="mt-2 flex justify-between items-center">
            <span className="text-blue-600 font-bold">¥{product.price.toFixed(2)}</span>
            <div className="flex space-x-2">
              <button
                onClick={handleAddToCart}
                className="p-2 text-white bg-blue-600 rounded-full hover:bg-blue-700 transition-colors"
                title="添加到购物车"
              >
                <FiShoppingCart size={16} />
              </button>
              
              <Link
                to={`/products/${product.id}`}
                className="p-2 text-white bg-gray-600 rounded-full hover:bg-gray-700 transition-colors"
                title="查看详情"
              >
                <FiInfo size={16} />
              </Link>
            </div>
          </div>
        </div>
      </Link>
    </div>
  )
}

export default ProductItem 