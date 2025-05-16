import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { FiArrowLeft } from 'react-icons/fi'
import { 
  apiCreateProduct, 
  apiGetCategories, 
  Product
} from '../../services/productService'
import ProductForm from '../../components/ProductForm'
import LoadingSpinner from '../../components/LoadingSpinner'
import ErrorAlert from '../../components/ErrorAlert'

const ProductCreatePage: React.FC = () => {
  const navigate = useNavigate()
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  
  // 加载商品分类
  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true)
      setError('')
      
      try {
        const data = await apiGetCategories()
        setCategories(data)
      } catch (error) {
        console.error('加载分类失败', error)
        setError('加载分类失败，请稍后再试')
      } finally {
        setLoading(false)
      }
    }
    
    fetchCategories()
  }, [])
  
  // 处理表单提交
  const handleSubmit = async (data: Partial<Product>) => {
    setSaving(true)
    setError('')
    
    try {
      // 创建新商品
      await apiCreateProduct({
        name: data.name || '',
        price: data.price || 0,
        description: data.description || '',
        image: data.image || '',
        category: data.category || '',
        stock: data.stock || 0
      })
      
      alert('商品创建成功')
      navigate('/admin/products')
    } catch (error) {
      console.error('创建商品失败', error)
      setError('创建商品失败，请稍后再试')
    } finally {
      setSaving(false)
    }
  }
  
  const handleRetry = () => {
    setLoading(true)
    apiGetCategories()
      .then(data => setCategories(data))
      .catch(error => {
        console.error('重试加载分类失败', error)
        setError('重试加载分类失败，请稍后再试')
      })
      .finally(() => setLoading(false))
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
        <h1 className="text-2xl font-bold ml-4">添加新商品</h1>
      </div>
      
      {error && <ErrorAlert message={error} onRetry={handleRetry} />}
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="p-6 flex justify-center">
            <LoadingSpinner text="加载分类数据..." />
          </div>
        ) : (
          <div className="p-6">
            <ProductForm
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

export default ProductCreatePage 