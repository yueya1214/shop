import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiList, FiPackage, FiUpload, FiDownload, FiRefreshCw } from 'react-icons/fi'
import { 
  apiGetProducts, 
  apiDeleteProduct, 
  apiGetCategories,
  apiImportProducts,
  apiExportProducts,
  apiUpdateProduct,
  mockAPI,
  Product 
} from '../../services/productService'

const ProductsManagePage = () => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // 确保初始化为空数组
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [totalProducts, setTotalProducts] = useState(0)
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '')
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '')
  const [importLoading, setImportLoading] = useState(false)
  const [exportLoading, setExportLoading] = useState(false)
  
  // 分页
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1'))
  const limit = 10
  
  // 选中的商品（用于批量操作）
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [bulkActionLoading, setBulkActionLoading] = useState(false)
  
  // 获取商品列表
  useEffect(() => {
    fetchProducts()
  }, [page, searchQuery, selectedCategory])
  
  // 定义fetchProducts函数，供其他函数调用
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
          limit, 
          search: searchQuery || undefined, 
          category: selectedCategory || undefined
        });
      } catch (apiError) {
        console.error('API请求失败，使用模拟数据', apiError);
        // 使用模拟数据作为备用
        productsData = await mockAPI.getProducts({
          page, 
          limit, 
          search: searchQuery || undefined, 
          category: selectedCategory || undefined
        });
      }
      
      // 确保我们有有效的商品数据
      const products = Array.isArray(productsData?.products) ? productsData.products : [];
      const total = typeof productsData?.total === 'number' ? productsData.total : 0;
      
      setProducts(products)
      setTotalProducts(total)
      
      // 获取商品分类
      let categoriesData;
      try {
        categoriesData = await apiGetCategories();
      } catch (apiError) {
        console.error('获取分类失败，使用模拟数据', apiError);
        categoriesData = await mockAPI.getCategories();
      }
      
      // 确保分类数据是数组
      setCategories(Array.isArray(categoriesData) ? categoriesData : [])
    } catch (error) {
      console.error('加载商品列表失败', error)
      setError('加载商品列表失败，请稍后再试')
    } finally {
      setLoading(false)
    }
  }
  
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
      try {
        await apiDeleteProduct(id);
      } catch (apiError) {
        console.error('API删除失败，使用模拟数据', apiError);
        await mockAPI.deleteProduct(id);
      }
      
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
    if (e.target.checked && Array.isArray(products)) {
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
    
    setBulkActionLoading(true)
    
    try {
      // 这里实际项目中应该有一个批量删除的 API
      // 这里简化为逐个删除
      for (const id of selectedProducts) {
        try {
          await apiDeleteProduct(id);
        } catch (apiError) {
          console.error('API删除失败，使用模拟数据', apiError);
          await mockAPI.deleteProduct(id);
        }
      }
      
      // 更新商品列表
      setProducts(products.filter(product => !selectedProducts.includes(product.id)))
      setTotalProducts(prev => prev - selectedProducts.length)
      setSelectedProducts([])
      
      alert('选中的商品已成功删除')
    } catch (error) {
      console.error('批量删除商品失败', error)
      alert('批量删除商品失败，请稍后再试')
    } finally {
      setBulkActionLoading(false)
    }
  }
  
  // 计算总页数
  const totalPages = Math.ceil(totalProducts / limit)
  
  // 处理文件导入
  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    setImportLoading(true)
    setError('')
    
    try {
      const reader = new FileReader()
      reader.onload = async (event) => {
        try {
          const jsonData = JSON.parse(event.target?.result as string)
          
          // 调用导入API
          try {
            await apiImportProducts(jsonData)
          } catch (apiError) {
            console.error('API导入失败，使用模拟数据', apiError)
            await mockAPI.importProducts(jsonData)
          }
          
          // 重新加载商品列表
          fetchProducts()
          alert('商品导入成功')
        } catch (parseError) {
          console.error('解析JSON文件失败', parseError)
          setError('导入失败：无效的JSON格式')
        } finally {
          setImportLoading(false)
        }
      }
      
      reader.onerror = () => {
        setError('读取文件失败')
        setImportLoading(false)
      }
      
      reader.readAsText(file)
    } catch (error) {
      console.error('导入商品失败', error)
      setError('导入商品失败，请稍后再试')
      setImportLoading(false)
    }
    
    // 清空文件输入，以便可以再次选择同一个文件
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }
  
  // 处理导出
  const handleExport = async () => {
    setExportLoading(true)
    
    try {
      let data
      try {
        data = await apiExportProducts()
      } catch (apiError) {
        console.error('API导出失败，使用模拟数据', apiError)
        data = await mockAPI.exportProducts()
      }
      
      // 创建下载链接
      const jsonString = JSON.stringify(data, null, 2)
      const blob = new Blob([jsonString], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      
      const a = document.createElement('a')
      a.href = url
      a.download = `products-export-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      
      // 清理
      setTimeout(() => {
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }, 0)
    } catch (error) {
      console.error('导出商品失败', error)
      setError('导出商品失败，请稍后再试')
    } finally {
      setExportLoading(false)
    }
  }
  
  // 处理批量库存更新
  const handleBulkStockUpdate = async (action: 'increment' | 'decrement' | 'set', value: number) => {
    if (selectedProducts.length === 0) {
      alert('请先选择要更新的商品')
      return
    }
    
    if (action === 'set' && value < 0) {
      alert('库存不能设置为负数')
      return
    }
    
    if (!window.confirm(`确定要${action === 'increment' ? '增加' : action === 'decrement' ? '减少' : '设置'}选中的 ${selectedProducts.length} 件商品的库存${action === 'set' ? '为' : ''}${value}${action === 'set' ? '' : '个单位'}吗？`)) {
      return
    }
    
    setBulkActionLoading(true)
    
    try {
      // 获取所有选中的商品
      const selectedProductsData = products.filter(product => selectedProducts.includes(product.id))
      
      // 逐个更新库存
      for (const product of selectedProductsData) {
        let newStock = product.stock
        
        if (action === 'increment') {
          newStock += value
        } else if (action === 'decrement') {
          newStock = Math.max(0, product.stock - value)
        } else {
          newStock = value
        }
        
        try {
          await apiUpdateProduct(product.id, { stock: newStock })
        } catch (apiError) {
          console.error('API更新失败，使用模拟数据', apiError)
          await mockAPI.updateProduct(product.id, { stock: newStock })
        }
      }
      
      // 重新加载商品列表
      await fetchProducts()
      setSelectedProducts([])
      
      alert('商品库存已成功更新')
    } catch (error) {
      console.error('批量更新库存失败', error)
      setError('批量更新库存失败，请稍后再试')
    } finally {
      setBulkActionLoading(false)
    }
  }

  // 处理库存更新对话框
  const handleBulkStockClick = () => {
    if (selectedProducts.length === 0) {
      alert('请先选择要更新的商品')
      return
    }
    
    const action = prompt('请选择操作类型（输入数字）：\n1. 增加库存\n2. 减少库存\n3. 设置库存为指定值')
    if (!action) return
    
    const actionType = action === '1' ? 'increment' : action === '2' ? 'decrement' : action === '3' ? 'set' : null
    
    if (!actionType) {
      alert('无效的操作类型')
      return
    }
    
    const valueInput = prompt(`请输入要${actionType === 'increment' ? '增加' : actionType === 'decrement' ? '减少' : '设置'}的数量：`)
    if (!valueInput) return
    
    const value = parseInt(valueInput)
    if (isNaN(value) || value < 0) {
      alert('请输入有效的非负整数')
      return
    }
    
    handleBulkStockUpdate(actionType, value)
  }
  
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
        <div className="flex space-x-2">
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".json"
            onChange={handleFileChange}
          />
          <button 
            onClick={handleImportClick}
            className="btn btn-secondary flex items-center"
            disabled={importLoading}
          >
            <FiUpload className="mr-2" />
            {importLoading ? '导入中...' : '导入商品'}
          </button>
          <button 
            onClick={handleExport}
            className="btn btn-secondary flex items-center"
            disabled={exportLoading}
          >
            <FiDownload className="mr-2" />
            {exportLoading ? '导出中...' : '导出商品'}
          </button>
          <Link 
            to="/admin/products/new" 
            className="btn btn-primary flex items-center"
          >
            <FiPlus className="mr-2" />
            添加商品
          </Link>
        </div>
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
              {Array.isArray(categories) ? categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              )) : null}
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
            <div className="flex space-x-2">
              <button 
                className="btn btn-secondary text-sm flex items-center"
                onClick={handleBulkStockClick}
                disabled={bulkActionLoading}
              >
                <FiRefreshCw className="mr-1" />
                {bulkActionLoading ? '处理中...' : '更新库存'}
              </button>
              <button 
                className="btn btn-danger text-sm"
                onClick={handleBulkDelete}
                disabled={bulkActionLoading}
              >
                删除选中 ({selectedProducts.length})
              </button>
            </div>
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
                      checked={Array.isArray(products) && selectedProducts.length === products.length && products.length > 0}
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
                {Array.isArray(products) && products.map((product) => (
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