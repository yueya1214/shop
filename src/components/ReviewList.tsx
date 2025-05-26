import React, { useState, useEffect } from 'react';
import { FiMessageSquare } from 'react-icons/fi';
import { Review, apiGetProductReviews, mockAPI, apiDeleteReview } from '../services/reviewService';
import ReviewItem from './ReviewItem';
import LoadingSpinner from './LoadingSpinner';
import ErrorAlert from './ErrorAlert';
import { useAuthStore } from '../stores/authStore';

interface ReviewListProps {
  productId: string;
}

const ReviewList: React.FC<ReviewListProps> = ({ productId }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';
  
  // 加载评价数据
  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      setError('');
      
      try {
        // 使用实际API或模拟API
        // const result = await apiGetProductReviews(productId, page, 5);
        const result = await mockAPI.getProductReviews(productId, page, 5);
        setReviews(result.reviews);
        setTotalPages(Math.ceil(result.total / result.limit));
      } catch (error) {
        console.error('加载评价失败', error);
        setError('加载评价失败，请稍后再试');
      } finally {
        setLoading(false);
      }
    };
    
    fetchReviews();
  }, [productId, page]);
  
  // 处理删除评价
  const handleDeleteReview = async (id: string) => {
    if (!isAdmin) return;
    
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
  
  // 切换页码
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
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
  
  if (reviews.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg">
        <FiMessageSquare className="mx-auto text-gray-400 mb-3" size={32} />
        <p className="text-gray-500">暂无评价</p>
      </div>
    );
  }
  
  return (
    <div className={`${deleteLoading ? 'opacity-50 pointer-events-none' : ''}`}>
      <div className="space-y-4">
        {reviews.map(review => (
          <ReviewItem 
            key={review.id} 
            review={review} 
            onDelete={isAdmin ? handleDeleteReview : undefined}
          />
        ))}
      </div>
      
      {/* 分页 */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
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
    </div>
  );
};

export default ReviewList; 