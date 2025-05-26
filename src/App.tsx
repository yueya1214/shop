import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'

// 用户页面组件
import UserLayout from './layouts/UserLayout'
import HomePage from './pages/user/HomePage'
import ProductDetailPage from './pages/user/ProductDetailPage'
import CartPage from './pages/user/CartPage'
import CheckoutPage from './pages/user/CheckoutPage'
import OrdersPage from './pages/user/OrdersPage'
import OrderDetailPage from './pages/user/OrderDetailPage'
import ProfilePage from './pages/user/ProfilePage'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import DeliveryInfoPage from './pages/user/DeliveryInfoPage'
import CustomerServicePage from './pages/user/CustomerServicePage'

// 管理员页面组件
import AdminLayout from './layouts/AdminLayout'
import DashboardPage from './pages/admin/DashboardPage'
import ProductsManagePage from './pages/admin/ProductsManagePage'
import ProductCreatePage from './pages/admin/ProductCreatePage'
import ProductEditPage from './pages/admin/ProductEditPage'
import OrdersManagePage from './pages/admin/OrdersManagePage'
import AdminOrderDetailPage from './pages/admin/OrderDetailPage'
import AdminLoginPage from './pages/auth/AdminLoginPage'

// 保护路由组件
const ProtectedRoute = ({ children, isAdmin = false }: { children: React.ReactNode, isAdmin?: boolean }) => {
  const { user, isAuthenticated } = useAuthStore()
  
  if (!isAuthenticated) {
    return <Navigate to={isAdmin ? "/admin/login" : "/login"} />
  }
  
  if (isAdmin && user?.role !== 'admin') {
    return <Navigate to="/" />
  }
  
  return <>{children}</>
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 用户路由 */}
        <Route path="/" element={<UserLayout />}>
          <Route index element={<HomePage />} />
          <Route path="product/:id" element={<ProductDetailPage />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="checkout" element={
            <ProtectedRoute children={<CheckoutPage />} />
          } />
          <Route path="orders" element={
            <ProtectedRoute children={<OrdersPage />} />
          } />
          <Route path="order/:id" element={
            <ProtectedRoute children={<OrderDetailPage />} />
          } />
          <Route path="profile" element={
            <ProtectedRoute children={<ProfilePage />} />
          } />
          <Route path="delivery-info" element={<DeliveryInfoPage />} />
          <Route path="customer-service" element={<CustomerServicePage />} />
        </Route>
        
        {/* 管理员路由 */}
        <Route path="/admin" element={
          <ProtectedRoute isAdmin children={<AdminLayout />} />
        }>
          <Route index element={<DashboardPage />} />
          <Route path="products" element={<ProductsManagePage />} />
          <Route path="products/new" element={<ProductCreatePage />} />
          <Route path="products/:id/edit" element={<ProductEditPage />} />
          <Route path="orders" element={<OrdersManagePage />} />
          <Route path="orders/:id" element={<AdminOrderDetailPage />} />
        </Route>
        
        {/* 认证路由 */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        
        {/* 404 路由 */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App 