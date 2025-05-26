import React, { useState, useEffect } from 'react';
import { FiTrash2, FiSearch, FiStar, FiFilter } from 'react-icons/fi';
import { Review, mockAPI, mockReviews, apiDeleteReview, ReviewRating } from '../../services/reviewService';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorAlert from '../../components/ErrorAlert';

const ReviewsManagePage: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRating, setFilterRating] = useState<ReviewRating | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  // 加载所有评价
  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      setError('');
      
      try {
        // 在实际应用中，这里应该调用专门的管理员API获取所有评价
        // 这里我们简单地使用现有的模拟数据
        const allReviews = mockReviews.slice((page - 1) * 10, page * 10);
        setReviews(allReviews);
        setTotalPages(Math.ceil(mockReviews.length / 10));
      } catch (error) {
        console.error('加载评价失败', error);
        setError('加载评价失败，请稍后再试');
      } finally {
        setLoading(false);
      }
    };
    
    fetchReviews();
  }, [page]);
  
  // 处理删除评价
  const handleDeleteReview = async (id: string) => {
    if (window.confirm('确定要删除这条评价吗？此操作不可撤销。')) {
      setDeleteLoading(true);
      
      try {
        // 使用实际API或模拟API
        // await apiDeleteReview(id);
        await mockAPI.deleteReview(id);
        
        // 更新评价列表
        setReviews(reviews.filter(review => review.id !== id));
      } catch (error: any) {
        alert(error.message || '删除评价失败');
      } finally {
        setDeleteLoading(false);
      }
    }
  };
  
  // 处理搜索
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 过滤评价
    const filtered = mockReviews.filter((review: Review) => {
      const matchesSearch = searchTerm 
        ? review.content.toLowerCase().includes(searchTerm.toLowerCase()) || 
          review.userName.toLowerCase().includes(searchTerm.toLowerCase())
        : true;
        
      const matchesRating = filterRating 
        ? review.rating === filterRating 
        : true;
        
      return matchesSearch && matchesRating;
    });
    
    setReviews(filtered.slice(0, 10));
    setTotalPages(Math.ceil(filtered.length / 10));
    setPage(1);
  };
  
  // 重置过滤器
  const handleResetFilters = () => {
    setSearchTerm('');
    setFilterRating(null);
    
    // 重新加载所有评价
    setReviews(mockReviews.slice(0, 10));
    setTotalPages(Math.ceil(mockReviews.length / 10));
    setPage(1);
  };
  
  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  if (loading && reviews.length === 0) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }
  
  if (error) {
    return <ErrorAlert message={error} />;
  }
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">评价管理</h1>
      
      {/* 搜索和过滤 */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
          <div className="flex-grow">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="搜索评价内容或用户名..."
                className="pl-10 w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex items-center">
            <label className="mr-2 whitespace-nowrap">
              <FiFilter className="inline mr-1" />
              按评分筛选:
            </label>
            <select
              className="border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2"
              value={filterRating || ''}
              onChange={(e) => setFilterRating(e.target.value ? parseInt(e.target.value) as ReviewRating : null)}
            >
              <option value="">全部评分</option>
              <option value="5">5星</option>
              <option value="4">4星</option>
              <option value="3">3星</option>
              <option value="2">2星</option>
              <option value="1">1星</option>
            </select>
          </div>
          
          <div className="flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              搜索
            </button>
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              重置
            </button>
          </div>
        </form>
      </div>
      
      {/* 评价列表 */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {reviews.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            没有找到符合条件的评价
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">用户</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">评分</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">内容</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">商品ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">时间</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reviews.map((review) => (
                  <tr key={review.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full overflow-hidden">
                          <img 
                            src={review.userAvatar || 'https://via.placeholder.com/40'} 
                            alt={review.userName} 
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{review.userName}</div>
                          <div className="text-xs text-gray-500">{review.userId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <FiStar 
                            key={i} 
                            className={`${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'} w-4 h-4`} 
                          />
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 line-clamp-2">{review.content}</div>
                      {review.images && review.images.length > 0 && (
                        <div className="mt-1 flex space-x-1">
                          {review.images.map((image, index) => (
                            <div key={index} className="h-8 w-8 rounded overflow-hidden">
                              <img 
                                src={image} 
                                alt={`评价图片 ${index + 1}`} 
                                className="h-full w-full object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {review.productId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(review.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleDeleteReview(review.id)}
                        className="text-red-600 hover:text-red-900"
                        disabled={deleteLoading}
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
        <div className="flex justify-center mt-6">
          <div className="flex space-x-2">
            <button
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              上一页
            </button>
            
            <span className="px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700">
              {page} / {totalPages}
            </span>
            
            <button
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
            >
              下一页
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewsManagePage; 