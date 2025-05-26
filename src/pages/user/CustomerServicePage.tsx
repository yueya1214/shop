import React, { useState } from 'react';
import { FiMessageCircle, FiPhone, FiMail, FiSend, FiUser, FiHelpCircle, FiCheck } from 'react-icons/fi';

const CustomerServicePage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    orderNumber: '',
    category: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 这里通常会发送数据到后端API
    console.log('提交的数据:', formData);
    // 显示成功提交消息
    setSubmitted(true);
    // 重置表单
    setFormData({
      name: '',
      email: '',
      orderNumber: '',
      category: '',
      message: ''
    });
    // 5秒后隐藏成功消息
    setTimeout(() => {
      setSubmitted(false);
    }, 5000);
  };
  
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">联系客服</h1>
      
      {/* 联系方式 */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">联系方式</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col items-center p-4 bg-blue-50 rounded-lg">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
              <FiPhone className="text-blue-600 text-xl" />
            </div>
            <h3 className="font-medium text-lg mb-2">电话客服</h3>
            <p className="text-gray-600 text-center">400-123-4567</p>
            <p className="text-gray-500 text-sm text-center mt-1">周一至周日 9:00-20:00</p>
          </div>
          
          <div className="flex flex-col items-center p-4 bg-green-50 rounded-lg">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
              <FiMessageCircle className="text-green-600 text-xl" />
            </div>
            <h3 className="font-medium text-lg mb-2">在线客服</h3>
            <p className="text-gray-600 text-center">点击右下角图标</p>
            <p className="text-gray-500 text-sm text-center mt-1">24小时在线服务</p>
          </div>
          
          <div className="flex flex-col items-center p-4 bg-purple-50 rounded-lg">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-3">
              <FiMail className="text-purple-600 text-xl" />
            </div>
            <h3 className="font-medium text-lg mb-2">邮件支持</h3>
            <p className="text-gray-600 text-center">support@example.com</p>
            <p className="text-gray-500 text-sm text-center mt-1">通常24小时内回复</p>
          </div>
        </div>
      </div>
      
      {/* 常见问题 */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <FiHelpCircle className="mr-2 text-blue-600" />
          常见问题
        </h2>
        <div className="space-y-4">
          <details className="border border-gray-200 rounded-md">
            <summary className="px-4 py-3 bg-gray-50 cursor-pointer font-medium">如何查询我的订单状态？</summary>
            <div className="px-4 py-3">
              <p className="text-gray-600">您可以在"我的订单"页面查看所有订单的状态。点击具体订单可以查看详细的配送信息和跟踪号。</p>
            </div>
          </details>
          
          <details className="border border-gray-200 rounded-md">
            <summary className="px-4 py-3 bg-gray-50 cursor-pointer font-medium">如何申请退款或退货？</summary>
            <div className="px-4 py-3">
              <p className="text-gray-600">在订单详情页面，您可以点击"申请退款"或"申请退货"按钮。请注意，某些商品可能不支持退货，详情请查看商品页面的退货政策。</p>
            </div>
          </details>
          
          <details className="border border-gray-200 rounded-md">
            <summary className="px-4 py-3 bg-gray-50 cursor-pointer font-medium">配送需要多长时间？</summary>
            <div className="px-4 py-3">
              <p className="text-gray-600">标准配送通常需要3-5个工作日，加急配送为1-2个工作日，部分城市支持次日达服务。具体配送时间可能因地区而异，您可以在下单时查看预计送达时间。</p>
            </div>
          </details>
          
          <details className="border border-gray-200 rounded-md">
            <summary className="px-4 py-3 bg-gray-50 cursor-pointer font-medium">如何修改我的订单？</summary>
            <div className="px-4 py-3">
              <p className="text-gray-600">订单确认后，无法直接修改订单信息。如需修改，请联系客服取消当前订单并重新下单。</p>
            </div>
          </details>
          
          <details className="border border-gray-200 rounded-md">
            <summary className="px-4 py-3 bg-gray-50 cursor-pointer font-medium">如何使用优惠券？</summary>
            <div className="px-4 py-3">
              <p className="text-gray-600">在结算页面，您可以在"优惠券"部分选择或输入优惠券代码。请注意查看优惠券的使用条件和有效期。</p>
            </div>
          </details>
        </div>
      </div>
      
      {/* 联系表单 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <FiSend className="mr-2 text-blue-600" />
          留言咨询
        </h2>
        
        {submitted ? (
          <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
            <div className="flex items-center">
              <FiCheck className="text-green-500 mr-2" size={20} />
              <span className="text-green-700 font-medium">您的留言已提交成功！我们会尽快与您联系。</span>
            </div>
          </div>
        ) : null}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                姓名
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiUser className="text-gray-400" />
                </div>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="pl-10 w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="您的姓名"
                  required
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                邮箱
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-10 w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="您的邮箱地址"
                  required
                />
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="orderNumber" className="block text-sm font-medium text-gray-700 mb-1">
                订单号（选填）
              </label>
              <input
                type="text"
                id="orderNumber"
                name="orderNumber"
                value={formData.orderNumber}
                onChange={handleChange}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="与订单相关的问题请填写"
              />
            </div>
            
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                问题类型
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">请选择问题类型</option>
                <option value="order">订单问题</option>
                <option value="delivery">配送问题</option>
                <option value="return">退货/退款</option>
                <option value="product">商品咨询</option>
                <option value="account">账户问题</option>
                <option value="other">其他问题</option>
              </select>
            </div>
          </div>
          
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
              留言内容
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows={5}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="请详细描述您的问题，以便我们更好地为您服务"
              required
            ></textarea>
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              提交留言
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerServicePage; 