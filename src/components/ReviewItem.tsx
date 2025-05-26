import React from 'react';
import { FiStar, FiTrash2 } from 'react-icons/fi';
import { Review } from '../services/reviewService';
import { useAuthStore } from '../stores/authStore';

interface ReviewItemProps {
  review: Review;
  onDelete?: (id: string) => void;
}

const ReviewItem: React.FC<ReviewItemProps> = ({ review, onDelete }) => {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';
  
  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(date);
  };
  
  return (
    <div className="border-b border-gray-200 py-4">
      <div className="flex justify-between">
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full overflow-hidden flex-shrink-0">
            <img 
              src={review.userAvatar || 'https://via.placeholder.com/40'} 
              alt={review.userName} 
              className="h-full w-full object-cover"
            />
          </div>
          <div className="ml-3">
            <div className="font-medium">{review.userName}</div>
            <div className="text-xs text-gray-500">{formatDate(review.createdAt)}</div>
          </div>
        </div>
        
        {isAdmin && onDelete && (
          <button 
            onClick={() => onDelete(review.id)}
            className="text-red-500 hover:text-red-700 transition-colors"
            title="删除评价"
          >
            <FiTrash2 size={18} />
          </button>
        )}
      </div>
      
      <div className="mt-2">
        <div className="flex items-center mb-2">
          {[...Array(5)].map((_, i) => (
            <FiStar 
              key={i} 
              className={`${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'} w-4 h-4`} 
            />
          ))}
        </div>
        <p className="text-gray-700">{review.content}</p>
      </div>
      
      {review.images && review.images.length > 0 && (
        <div className="mt-3 flex space-x-2">
          {review.images.map((image, index) => (
            <div key={index} className="h-20 w-20 rounded overflow-hidden">
              <img 
                src={image} 
                alt={`评价图片 ${index + 1}`} 
                className="h-full w-full object-cover"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewItem; 