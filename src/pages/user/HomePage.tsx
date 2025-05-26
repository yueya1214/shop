import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { FiShoppingCart, FiSearch } from 'react-icons/fi'
import { useCartStore } from '../../stores/cartStore'
import { apiGetProducts, apiGetCategories, Product, mockAPI } from '../../services/productService'

const HomePage = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [totalProducts, setTotalProducts] = useState(0)
  const [page, setPage] = useState(1)
  const { addItem } = useCartStore()
  
  // 处理URL中的查询参数
  useEffect(() => {
    const category = searchParams.get('category') || ''
    const search = searchParams.get('search') || ''
    const pageParam = searchParams.get('page')
    
    setSelectedCategory(category)
    setSearchQuery(search)
    setPage(pageParam ? parseInt(pageParam) : 1)
  }, [searchParams])
  
  // 加载分类
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await apiGetCategories()
        setCategories(data)
      } catch (error) {
        console.error('加载分类失败', error)
      }
    }
    
    fetchCategories()
  }, [])
  
  // 加载商品
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      setError('')
      
      try {
        // 尝试从API获取数据
        let productsData;
        try {
          // 使用正确的参数格式调用 API
          productsData = await apiGetProducts({
            page, 
            limit: 8, 
            search: searchQuery || undefined, 
            category: selectedCategory || undefined
          });
        } catch (apiError) {
          console.error('API请求失败，使用模拟数据', apiError);
          // 使用模拟数据作为备用
          productsData = await mockAPI.getProducts({
            page, 
            limit: 8, 
            search: searchQuery || undefined, 
            category: selectedCategory || undefined
          });
        }
        
        // 确保我们有有效的商品数据
        const products = Array.isArray(productsData?.products) ? productsData.products : [];
        const total = typeof productsData?.total === 'number' ? productsData.total : 0;
        
        setProducts(products)
        setTotalProducts(total)
      } catch (error) {
        console.error('加载商品失败', error)
        setError('加载商品失败，请稍后再试')
      } finally {
        setLoading(false)
      }
    }
    
    fetchProducts()
  }, [page, searchQuery, selectedCategory])
  
  // 处理搜索
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    
    if (searchQuery) {
      params.append('search', searchQuery)
    }
    
    if (selectedCategory) {
      params.append('category', selectedCategory)
    }
    
    params.append('page', '1')
    
    navigate(`/?${params.toString()}`)
  }
  
  // 处理分类选择
  const handleCategoryChange = (category: string) => {
    const params = new URLSearchParams()
    
    if (searchQuery) {
      params.append('search', searchQuery)
    }
    
    if (category !== selectedCategory) {
      params.append('category', category)
    }
    
    params.append('page', '1')
    
    navigate(`/?${params.toString()}`)
  }
  
  // 处理分页
  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams()
    
    if (searchQuery) {
      params.append('search', searchQuery)
    }
    
    if (selectedCategory) {
      params.append('category', selectedCategory)
    }
    
    params.append('page', newPage.toString())
    
    navigate(`/?${params.toString()}`)
  }
  
  // 添加到购物车
  const handleAddToCart = (product: Product) => {
    addItem(product)
  }
  
  // 计算总页数
  const totalPages = Math.ceil(totalProducts / 8)
  
  return (
    <div>
      {/* 搜索和筛选区域 */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          {/* 搜索框 */}
          <form onSubmit={handleSearch} className="w-full md:w-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="搜索商品..."
                className="input w-full md:w-80"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="absolute right-3 top-2.5 text-gray-500">
                <FiSearch size={18} />
              </button>
            </div>
          </form>
          
          {/* 分类筛选 */}
          <div className="flex flex-wrap gap-2">
            <button
              className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                selectedCategory === '' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              onClick={() => handleCategoryChange('')}
            >
              全部
            </button>
            
            {Array.isArray(categories) && categories.map(category => (
              <button
                key={category}
                className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                  selectedCategory === category 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                onClick={() => handleCategoryChange(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* 商品列表 */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-500">{error}</p>
          <button 
            className="mt-4 btn btn-primary"
            onClick={() => navigate(0)}
          >
            重试
          </button>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">没有找到符合条件的商品</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.isArray(products) && products.map(product => (
              <div key={product.id} className="card group">
                {/* 商品图片 */}
                <div 
                  className="w-full h-48 bg-gray-200 rounded-t-lg overflow-hidden cursor-pointer"
                  onClick={() => navigate(`/product/${product.id}`)}
                >
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
                
                {/* 商品信息 */}
                <div className="p-4">
                  <h3 
                    className="text-lg font-semibold mb-1 cursor-pointer hover:text-blue-600"
                    onClick={() => navigate(`/product/${product.id}`)}
                  >
                    {product.name}
                  </h3>
                  <p className="text-gray-500 text-sm mb-2 line-clamp-2">{product.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-blue-600 font-semibold">¥{product.price.toFixed(2)}</span>
                    <button 
                      className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700"
                      onClick={() => handleAddToCart(product)}
                      aria-label="加入购物车"
                    >
                      <FiShoppingCart size={16} />
                    </button>
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

export default HomePage 