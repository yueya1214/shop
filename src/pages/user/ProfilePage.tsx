import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiUser, FiMail, FiSave, FiLogOut } from 'react-icons/fi'
import { useAuthStore } from '../../stores/authStore'
import { apiGetMe, apiUpdateMe, mockAPI } from '../../services/authService'
import LoadingSpinner from '../../components/LoadingSpinner'
import ErrorAlert from '../../components/ErrorAlert'

interface ProfileForm {
  name: string
  email: string
}

const ProfilePage: React.FC = () => {
  const navigate = useNavigate()
  const { user, logout, updateUser } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [profileForm, setProfileForm] = useState<ProfileForm>({
    name: '',
    email: ''
  })
  
  // 加载用户信息
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return
      
      setLoading(true)
      setError('')
      
      try {
        // 使用实际API或模拟API
        // const userData = await apiGetMe()
        const userData = await mockAPI.getMe()
        setProfileForm({
          name: userData.name,
          email: userData.email
        })
      } catch (error) {
        console.error('加载个人资料失败', error)
        setError('加载个人资料失败，请稍后再试')
      } finally {
        setLoading(false)
      }
    }
    
    fetchProfile()
  }, [user])
  
  // 处理表单输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setProfileForm(prev => ({
      ...prev,
      [name]: value
    }))
  }
  
  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!profileForm.name.trim()) {
      setError('姓名不能为空')
      return
    }
    
    setSaving(true)
    setError('')
    setSuccess('')
    
    try {
      // 使用实际API或模拟API
      // const updatedUser = await apiUpdateMe({
      //   name: profileForm.name
      // })
      const updatedUser = await mockAPI.updateMe({
        name: profileForm.name
      })
      
      // 更新全局状态
      updateUser(updatedUser)
      
      setSuccess('个人资料已更新')
      
      // 清除成功消息
      setTimeout(() => {
        setSuccess('')
      }, 3000)
    } catch (error) {
      console.error('更新个人资料失败', error)
      setError('更新个人资料失败，请稍后再试')
    } finally {
      setSaving(false)
    }
  }
  
  // 处理退出登录
  const handleLogout = () => {
    if (window.confirm('确定要退出登录吗？')) {
      logout()
      navigate('/')
    }
  }
  
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner text="加载个人资料..." />
      </div>
    )
  }
  
  if (!user) {
    navigate('/login')
    return null
  }
  
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">个人资料</h1>
      
      {error && <ErrorAlert message={error} />}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="name" className="block text-gray-700 mb-2 font-medium">
                <FiUser className="inline mr-2" />
                姓名
              </label>
              <input
                type="text"
                id="name"
                name="name"
                className="input w-full"
                value={profileForm.name}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="email" className="block text-gray-700 mb-2 font-medium">
                <FiMail className="inline mr-2" />
                电子邮箱
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="input w-full bg-gray-100"
                value={profileForm.email}
                disabled
                readOnly
              />
              <p className="text-gray-500 text-sm mt-1">邮箱地址不可更改</p>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <button
                type="submit"
                className="btn btn-primary flex items-center justify-center"
                disabled={saving}
              >
                <FiSave className="mr-2" />
                {saving ? '保存中...' : '保存更改'}
              </button>
              
              <button
                type="button"
                className="btn btn-secondary flex items-center justify-center"
                onClick={handleLogout}
              >
                <FiLogOut className="mr-2" />
                退出登录
              </button>
            </div>
          </form>
        </div>
      </div>
      
      <div className="mt-8 bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 bg-gray-50 border-b">
          <h2 className="text-lg font-semibold">账户信息</h2>
        </div>
        <div className="p-6">
          <div className="mb-4">
            <p className="text-gray-500 text-sm">账户类型</p>
            <p className="font-medium">
              {user.role === 'admin' ? '管理员' : '普通用户'}
              {user.role === 'admin' && (
                <span className="ml-2 bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs">
                  可访问管理后台
                </span>
              )}
            </p>
          </div>
          
          <div>
            <p className="text-gray-500 text-sm">账户 ID</p>
            <p className="font-medium text-gray-700">{user.id}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage 