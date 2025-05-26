import React, { useState } from 'react';
import { FiStar, FiSend, FiImage } from 'react-icons/fi';
import { useAuthStore } from '../stores/authStore';
import { CreateReviewRequest, ReviewRating, apiCreateReview, mockAPI } from '../services/reviewService';

interface ReviewFormProps {
  productId: string;
  onReviewSubmitted: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ productId, onReviewSubmitted }) => {
  const { isAuthenticated, user } = useAuthStore();
  const [rating, setRating] = useState<ReviewRating>(5);
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // 处理评分变化
  const handleRatingChange = (newRating: ReviewRating) => {
    setRating(newRating);
  };
  
  // 处理鼠标悬停在星星上
  const handleRatingHover = (rating: number | null) => {
    setHoverRating(rating);
  };
  
  // 处理添加图片
  const handleAddImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    // 在实际应用中，这里应该上传图片到服务器
    // 这里我们使用本地URL作为示例
    const newImages = Array.from(e.target.files).map(file => URL.createObjectURL(file));
    setImages([...images, ...newImages]);
  };
  
  // 处理删除图片
  const handleRemoveImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };
  
  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      setError('请先登录再发表评价');
      return;
    }
    
    if (!content.trim()) {
      setError('请输入评价内容');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const reviewData: CreateReviewRequest = {
        productId,
        rating,
        content: content.trim(),
        images: images.length > 0 ? images : undefined
      };
      
      // 使用实际API或模拟API
      // await apiCreateReview(reviewData);
      await mockAPI.createReview(reviewData);
      
      // 重置表单
      setRating(5);
      setContent('');
      setImages([]);
      
      // 通知父组件评价已提交
      onReviewSubmitted();
    } catch (error: any) {
      setError(error.message || '提交评价失败，请稍后再试');
    } finally {
      setLoading(false);
    }
  };
  
  if (!isAuthenticated) {
    return (
      <div className="bg-gray-50 p-4 rounded-lg text-center">
        <p className="text-gray-600">请先登录再发表评价</p>
      </div>
    );
  }
  
  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
      <h3 className="text-lg font-medium mb-4">发表评价</h3>
      
      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4">
          {error}
        </div>
      )}
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          评分
        </label>
        <div className="flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => handleRatingChange(star as ReviewRating)}
              onMouseEnter={() => handleRatingHover(star)}
              onMouseLeave={() => handleRatingHover(null)}
              className="text-2xl focus:outline-none"
            >
              <FiStar 
                className={`w-6 h-6 ${
                  (hoverRating !== null ? star <= hoverRating : star <= rating) 
                    ? 'text-yellow-400 fill-current' 
                    : 'text-gray-300'
                }`} 
              />
            </button>
          ))}
        </div>
      </div>
      
      <div className="mb-4">
        <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
          评价内容
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2"
          placeholder="请分享您对商品的评价..."
          rows={4}
          required
          disabled={loading}
        ></textarea>
      </div>
      
      {images.length > 0 && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            已上传图片
          </label>
          <div className="flex flex-wrap gap-2">
            {images.map((image, index) => (
              <div key={index} className="relative h-20 w-20 rounded overflow-hidden group">
                <img 
                  src={image} 
                  alt={`评价图片 ${index + 1}`} 
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <span className="text-white text-xs">删除</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="flex items-center justify-between">
        <label className="inline-flex items-center cursor-pointer text-blue-600 hover:text-blue-800">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleAddImage}
            className="hidden"
            disabled={loading || images.length >= 5}
          />
          <FiImage className="mr-1" />
          <span className="text-sm">添加图片</span>
          {images.length > 0 && <span className="text-xs text-gray-500 ml-1">({images.length}/5)</span>}
        </label>
        
        <button
          type="submit"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          disabled={loading}
        >
          <FiSend className="mr-1" />
          {loading ? '提交中...' : '提交评价'}
        </button>
      </div>
    </form>
  );
};

export default ReviewForm; 