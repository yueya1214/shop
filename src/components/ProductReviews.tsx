import React, { useState } from 'react';
import { FiMessageSquare } from 'react-icons/fi';
import ReviewForm from './ReviewForm';
import ReviewList from './ReviewList';

interface ProductReviewsProps {
  productId: string;
}

const ProductReviews: React.FC<ProductReviewsProps> = ({ productId }) => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // 处理评价提交成功
  const handleReviewSubmitted = () => {
    // 刷新评价列表
    setRefreshTrigger(prev => prev + 1);
  };
  
  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold mb-4 flex items-center">
        <FiMessageSquare className="mr-2" />
        商品评价
      </h2>
      
      <div className="mb-6">
        <ReviewForm productId={productId} onReviewSubmitted={handleReviewSubmitted} />
      </div>
      
      <div key={refreshTrigger}>
        <ReviewList productId={productId} />
      </div>
    </div>
  );
};

export default ProductReviews; 