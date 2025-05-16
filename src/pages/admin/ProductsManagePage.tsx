import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiList, FiPackage } from 'react-icons/fi'
import { 
  apiGetProducts, 
  apiDeleteProduct, 
  apiGetCategories,
  Product 
} from '../../services/productService'

const ProductsManagePage = () => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [totalProducts, setTotalProducts] = useState(0)
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '')
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '')
  
  // 分页
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1'))
  const limit = 10
  
  // 选中的商品（用于批量操作）
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  
  // 获取商品列表
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      setError('')
      
      try {
        // 获取商品列表
        const { products, total } = await apiGetProducts(
          page, 
          limit, 
          searchQuery, 
          selectedCategory
        )
        
        setProducts(products)
        setTotalProducts(total)
        
        // 获取商品分类
        const categories = await apiGetCategories()
        setCategories(categories)
      } catch (error) {
        console.error('加载商品列表失败', error)
        setError('加载商品列表失败，请稍后再试')
      } finally {
        setLoading(false)
      }
    }
    
    fetchProducts()
  }, [page, searchQuery, selectedCategory])
  
  // 更新 URL 参数
  useEffect(() => {
    const params = new URLSearchParams()
    
    if (page > 1) params.set('page', page.toString())
    if (searchQuery) params.set('search', searchQuery)
    if (selectedCategory) params.set('category', selectedCategory)
    
    setSearchParams(params)
  }, [page, searchQuery, selectedCategory, setSearchParams])
  
  // 处理搜索
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1) // 重置到第一页
  }
  
  // 处理分类筛选
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value)
    setPage(1) // 重置到第一页
  }
  
  // 处理删除商品
  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm('确定要删除此商品吗？此操作无法撤销。')) {
      return
    }
    
    try {
      await apiDeleteProduct(id)
      setProducts(products.filter(product => product.id !== id))
      setTotalProducts(prev => prev - 1)
      alert('商品已成功删除')
    } catch (error) {
      console.error('删除商品失败', error)
      alert('删除商品失败，请稍后再试')
    }
  }
  
  // 处理批量选择
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedProducts(products.map(product => product.id))
    } else {
      setSelectedProducts([])
    }
  }
  
  const handleSelectProduct = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedProducts([...selectedProducts, id])
    } else {
      setSelectedProducts(selectedProducts.filter(productId => productId !== id))
    }
  }
  
  // 处理批量删除
  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0) {
      alert('请先选择要删除的商品')
      return
    }
    
    if (!window.confirm(`确定要删除选中的 ${selectedProducts.length} 件商品吗？此操作无法撤销。`)) {
      return
    }
    
    try {
      // 这里实际项目中应该有一个批量删除的 API
      // 这里简化为逐个删除
      for (const id of selectedProducts) {
        await apiDeleteProduct(id)
      }
      
      // 更新商品列表
      setProducts(products.filter(product => !selectedProducts.includes(product.id)))
      setTotalProducts(prev => prev - selectedProducts.length)
      setSelectedProducts([])
      
      alert('选中的商品已成功删除')
    } catch (error) {
      console.error('批量删除商品失败', error)
      alert('批量删除商品失败，请稍后再试')
    }
  }
  
  // 计算总页数
  const totalPages = Math.ceil(totalProducts / limit)
  
  if (loading && products.length === 0) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">商品管理</h1>
        <Link 
          to="/admin/products/new" 
          className="btn btn-primary flex items-center"
        >
          <FiPlus className="mr-2" />
          添加商品
        </Link>
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
                placeholder="搜索商品..."
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
              value={selectedCategory}
              onChange={handleCategoryChange}
            >
              <option value="">所有分类</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {/* 商品列表 */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold flex items-center">
            <FiPackage className="mr-2" />
            商品列表 ({totalProducts})
          </h2>
          
          {selectedProducts.length > 0 && (
            <button 
              className="btn btn-danger text-sm"
              onClick={handleBulkDelete}
            >
              删除选中 ({selectedProducts.length})
            </button>
          )}
        </div>
        
        {products.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            {searchQuery || selectedCategory ? '没有找到匹配的商品' : '暂无商品数据'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="w-12 px-4 py-3">
                    <input
                      type="checkbox"
                      className="h-4 w-4"
                      checked={selectedProducts.length === products.length}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    商品
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    价格
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    类别
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    库存
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        className="h-4 w-4"
                        checked={selectedProducts.includes(product.id)}
                        onChange={(e) => handleSelectProduct(product.id, e.target.checked)}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <img
                            className="h-10 w-10 rounded-md object-cover"
                            src={product.image}
                            alt={product.name}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {product.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">¥{product.price.toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {product.stock > 0 ? product.stock : '缺货'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link 
                        to={`/admin/products/${product.id}/edit`} 
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        <FiEdit2 className="inline" /> 编辑
                      </Link>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <FiTrash2 className="inline" /> 删除
                      </button>
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
              显示 {(page - 1) * limit + 1}-{Math.min(page * limit, totalProducts)} 条，共 {totalProducts} 条
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

export default ProductsManagePage 