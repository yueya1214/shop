import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { FiArrowLeft, FiPackage } from 'react-icons/fi'
import { 
  apiGetProduct, 
  apiUpdateProduct, 
  apiGetCategories,
  Product
} from '../../services/productService'
import ProductForm from '../../components/ProductForm'
import LoadingSpinner from '../../components/LoadingSpinner'
import ErrorAlert from '../../components/ErrorAlert'

const ProductEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [product, setProduct] = useState<Product | null>(null)
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  
  // 加载商品数据
  useEffect(() => {
    const fetchData = async () => {
      if (!id) return
      
      setLoading(true)
      setError('')
      
      try {
        // 并行请求商品和分类
        const [productData, categoriesData] = await Promise.all([
          apiGetProduct(id),
          apiGetCategories()
        ])
        
        setProduct(productData)
        setCategories(categoriesData)
      } catch (error) {
        console.error('加载商品数据失败', error)
        setError('加载商品数据失败，请稍后再试')
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [id])
  
  // 处理表单提交
  const handleSubmit = async (data: Partial<Product>) => {
    if (!id) return
    
    setSaving(true)
    setError('')
    
    try {
      const updatedProduct = await apiUpdateProduct(id, data)
      setProduct(updatedProduct)
      alert('商品更新成功')
      navigate('/admin/products')
    } catch (error) {
      console.error('更新商品失败', error)
      setError('更新商品失败，请稍后再试')
    } finally {
      setSaving(false)
    }
  }
  
  const handleRetry = () => {
    if (id) {
      setLoading(true)
      apiGetProduct(id)
        .then(product => setProduct(product))
        .catch(error => {
          console.error('重试加载商品失败', error)
          setError('重试加载商品失败，请稍后再试')
        })
        .finally(() => setLoading(false))
    }
  }
  
  return (
    <div>
      <div className="flex items-center mb-6">
        <Link 
          to="/admin/products" 
          className="text-gray-600 hover:text-blue-600 flex items-center"
        >
          <FiArrowLeft className="mr-2" />
          返回商品列表
        </Link>
        <h1 className="text-2xl font-bold ml-4">编辑商品</h1>
      </div>
      
      {error && <ErrorAlert message={error} onRetry={handleRetry} />}
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="p-6 flex justify-center">
            <LoadingSpinner text="加载商品数据..." />
          </div>
        ) : !product ? (
          <div className="p-6 text-center">
            <FiPackage className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">商品不存在</h3>
            <p className="mt-1 text-sm text-gray-500">未找到此商品或已被删除</p>
            <div className="mt-6">
              <Link to="/admin/products" className="btn btn-primary">
                返回商品列表
              </Link>
            </div>
          </div>
        ) : (
          <div className="p-6">
            <ProductForm
              initialData={product}
              onSubmit={handleSubmit}
              isLoading={saving}
              categories={categories}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductEditPage 