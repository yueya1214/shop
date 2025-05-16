<<<<<<< HEAD
import React, { useState, useEffect } from 'react'
import { FiSave, FiImage } from 'react-icons/fi'
import { Product } from '../services/productService'

interface ProductFormProps {
  initialData?: Partial<Product>
  onSubmit: (data: Partial<Product>) => void
  isLoading: boolean
  categories: string[]
}

const ProductForm: React.FC<ProductFormProps> = ({ initialData, onSubmit, isLoading, categories }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    price: initialData?.price?.toString() || '',
    description: initialData?.description || '',
    image: initialData?.image || '',
    category: initialData?.category || '',
    stock: initialData?.stock?.toString() || '0'
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  // 当初始数据改变时更新表单
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        price: initialData.price?.toString() || '',
        description: initialData.description || '',
        image: initialData.image || '',
        category: initialData.category || '',
        stock: initialData.stock?.toString() || '0'
      })
    }
  }, [initialData])
  
  // 处理输入变化
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // 清除相关错误
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }
  
  // 表单提交
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // 验证表单
    const newErrors: Record<string, string> = {}
    
    if (!formData.name.trim()) {
      newErrors.name = '商品名称不能为空'
    }
    
    if (!formData.price.trim()) {
      newErrors.price = '价格不能为空'
    } else if (isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      newErrors.price = '价格必须是大于0的数字'
    }
    
    if (!formData.category) {
      newErrors.category = '请选择分类'
    }
    
    if (!formData.image.trim()) {
      newErrors.image = '图片URL不能为空'
    }
    
    if (isNaN(Number(formData.stock)) || Number(formData.stock) < 0) {
      newErrors.stock = '库存必须是大于或等于0的数字'
    }
    
    // 如果有错误，则设置错误并中止提交
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    
    // 提交数据
    onSubmit({
      name: formData.name,
      price: parseFloat(formData.price),
      description: formData.description,
      image: formData.image,
      category: formData.category,
      stock: parseInt(formData.stock)
    })
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="name" className="block text-gray-700 mb-1">
            商品名称 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`input w-full ${errors.name ? 'border-red-500' : ''}`}
            placeholder="输入商品名称"
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
        </div>
        
        <div>
          <label htmlFor="price" className="block text-gray-700 mb-1">
            价格 (¥) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleChange}
            className={`input w-full ${errors.price ? 'border-red-500' : ''}`}
            placeholder="0.00"
            min="0"
            step="0.01"
          />
          {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
        </div>
        
        <div>
          <label htmlFor="category" className="block text-gray-700 mb-1">
            分类 <span className="text-red-500">*</span>
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className={`input w-full ${errors.category ? 'border-red-500' : ''}`}
          >
            <option value="">选择分类</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
            <option value="新分类">+ 添加新分类</option>
          </select>
          {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
          
          {formData.category === '新分类' && (
            <div className="mt-2">
              <input
                type="text"
                name="newCategory"
                className="input w-full"
                placeholder="输入新分类名称"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  setFormData(prev => ({ ...prev, category: e.target.value }))
                }
              />
            </div>
          )}
        </div>
        
        <div>
          <label htmlFor="stock" className="block text-gray-700 mb-1">
            库存
          </label>
          <input
            type="number"
            id="stock"
            name="stock"
            value={formData.stock}
            onChange={handleChange}
            className={`input w-full ${errors.stock ? 'border-red-500' : ''}`}
            placeholder="0"
            min="0"
          />
          {errors.stock && <p className="text-red-500 text-sm mt-1">{errors.stock}</p>}
        </div>
        
        <div className="md:col-span-2">
          <label htmlFor="image" className="block text-gray-700 mb-1">
            图片URL <span className="text-red-500">*</span>
          </label>
          <div className="flex">
            <input
              type="text"
              id="image"
              name="image"
              value={formData.image}
              onChange={handleChange}
              className={`input w-full ${errors.image ? 'border-red-500' : ''}`}
              placeholder="https://example.com/image.jpg"
            />
          </div>
          {errors.image && <p className="text-red-500 text-sm mt-1">{errors.image}</p>}
          
          {formData.image && (
            <div className="mt-2 flex items-center">
              <div className="h-20 w-20 rounded border overflow-hidden">
                <img
                  src={formData.image}
                  alt="商品预览"
                  className="h-full w-full object-cover"
                  onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                    e.currentTarget.src = 'https://via.placeholder.com/150?text=图片加载失败'
                  }}
                />
              </div>
              <p className="ml-2 text-sm text-gray-500">图片预览</p>
            </div>
          )}
        </div>
        
        <div className="md:col-span-2">
          <label htmlFor="description" className="block text-gray-700 mb-1">
            商品描述
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="input w-full h-32"
            placeholder="输入商品描述..."
          />
        </div>
      </div>
      
      <div className="flex justify-end">
        <button
          type="submit"
          className="btn btn-primary flex items-center"
          disabled={isLoading}
        >
          <FiSave className="mr-2" />
          {isLoading ? '保存中...' : '保存商品'}
        </button>
      </div>
    </form>
  )
}

=======
import React, { useState, useEffect } from 'react'
import { FiSave, FiImage } from 'react-icons/fi'
import { Product } from '../services/productService'

interface ProductFormProps {
  initialData?: Partial<Product>
  onSubmit: (data: Partial<Product>) => void
  isLoading: boolean
  categories: string[]
}

const ProductForm: React.FC<ProductFormProps> = ({ initialData, onSubmit, isLoading, categories }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    price: initialData?.price?.toString() || '',
    description: initialData?.description || '',
    image: initialData?.image || '',
    category: initialData?.category || '',
    stock: initialData?.stock?.toString() || '0'
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  // 当初始数据改变时更新表单
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        price: initialData.price?.toString() || '',
        description: initialData.description || '',
        image: initialData.image || '',
        category: initialData.category || '',
        stock: initialData.stock?.toString() || '0'
      })
    }
  }, [initialData])
  
  // 处理输入变化
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // 清除相关错误
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }
  
  // 表单提交
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // 验证表单
    const newErrors: Record<string, string> = {}
    
    if (!formData.name.trim()) {
      newErrors.name = '商品名称不能为空'
    }
    
    if (!formData.price.trim()) {
      newErrors.price = '价格不能为空'
    } else if (isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      newErrors.price = '价格必须是大于0的数字'
    }
    
    if (!formData.category) {
      newErrors.category = '请选择分类'
    }
    
    if (!formData.image.trim()) {
      newErrors.image = '图片URL不能为空'
    }
    
    if (isNaN(Number(formData.stock)) || Number(formData.stock) < 0) {
      newErrors.stock = '库存必须是大于或等于0的数字'
    }
    
    // 如果有错误，则设置错误并中止提交
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    
    // 提交数据
    onSubmit({
      name: formData.name,
      price: parseFloat(formData.price),
      description: formData.description,
      image: formData.image,
      category: formData.category,
      stock: parseInt(formData.stock)
    })
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="name" className="block text-gray-700 mb-1">
            商品名称 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`input w-full ${errors.name ? 'border-red-500' : ''}`}
            placeholder="输入商品名称"
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
        </div>
        
        <div>
          <label htmlFor="price" className="block text-gray-700 mb-1">
            价格 (¥) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleChange}
            className={`input w-full ${errors.price ? 'border-red-500' : ''}`}
            placeholder="0.00"
            min="0"
            step="0.01"
          />
          {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
        </div>
        
        <div>
          <label htmlFor="category" className="block text-gray-700 mb-1">
            分类 <span className="text-red-500">*</span>
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className={`input w-full ${errors.category ? 'border-red-500' : ''}`}
          >
            <option value="">选择分类</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
            <option value="新分类">+ 添加新分类</option>
          </select>
          {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
          
          {formData.category === '新分类' && (
            <div className="mt-2">
              <input
                type="text"
                name="newCategory"
                className="input w-full"
                placeholder="输入新分类名称"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  setFormData(prev => ({ ...prev, category: e.target.value }))
                }
              />
            </div>
          )}
        </div>
        
        <div>
          <label htmlFor="stock" className="block text-gray-700 mb-1">
            库存
          </label>
          <input
            type="number"
            id="stock"
            name="stock"
            value={formData.stock}
            onChange={handleChange}
            className={`input w-full ${errors.stock ? 'border-red-500' : ''}`}
            placeholder="0"
            min="0"
          />
          {errors.stock && <p className="text-red-500 text-sm mt-1">{errors.stock}</p>}
        </div>
        
        <div className="md:col-span-2">
          <label htmlFor="image" className="block text-gray-700 mb-1">
            图片URL <span className="text-red-500">*</span>
          </label>
          <div className="flex">
            <input
              type="text"
              id="image"
              name="image"
              value={formData.image}
              onChange={handleChange}
              className={`input w-full ${errors.image ? 'border-red-500' : ''}`}
              placeholder="https://example.com/image.jpg"
            />
          </div>
          {errors.image && <p className="text-red-500 text-sm mt-1">{errors.image}</p>}
          
          {formData.image && (
            <div className="mt-2 flex items-center">
              <div className="h-20 w-20 rounded border overflow-hidden">
                <img
                  src={formData.image}
                  alt="商品预览"
                  className="h-full w-full object-cover"
                  onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                    e.currentTarget.src = 'https://via.placeholder.com/150?text=图片加载失败'
                  }}
                />
              </div>
              <p className="ml-2 text-sm text-gray-500">图片预览</p>
            </div>
          )}
        </div>
        
        <div className="md:col-span-2">
          <label htmlFor="description" className="block text-gray-700 mb-1">
            商品描述
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="input w-full h-32"
            placeholder="输入商品描述..."
          />
        </div>
      </div>
      
      <div className="flex justify-end">
        <button
          type="submit"
          className="btn btn-primary flex items-center"
          disabled={isLoading}
        >
          <FiSave className="mr-2" />
          {isLoading ? '保存中...' : '保存商品'}
        </button>
      </div>
    </form>
  )
}

>>>>>>> master
export default ProductForm 