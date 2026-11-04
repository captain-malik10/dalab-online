import { useState, useEffect } from 'react';
import StarRating from '../StarRating';
import { apiClient } from '~/api';

interface ProductDetailsTabsProps {
  product: {
    id: number;
    name: string;
    price: number | string;
    description?: string;
    stock: number;
    image_urls?: string[];
    category: {
      id: number;
      name: string;
      image_url: string;
    };
  };
  reviews: {
    averageRating: number;
    totalReviews: number;
    reviews: Array<{
      id: number;
      rating: number;
      comment: string;
      created_at: string;
      customer_name: string;
      customer_id: number;
    }>;
  };
}

const tabs = ['Description', 'Reviews'];

export default function ProductDetailsTabs({
  product,

  reviews: initialReviews,
}: ProductDetailsTabsProps) {
  const [activeTab, setActiveTab] = useState('Description');

  const [rating, setRating] = useState(0);

  const [comment, setComment] = useState('');

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [displayReviews, setDisplayReviews] = useState(initialReviews.reviews);

  const [showAllReviews, setShowAllReviews] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');

    setIsLoggedIn(!!token);
  }, []);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0 || comment.trim() === '') {
      alert('Please provide a rating and a comment.');

      return;
    }

    try {
      const newReview = await apiClient('/reviews', {
        method: 'POST',

        body: JSON.stringify({
          product_id: product.id,

          rating,

          comment,
        }),
      });

      setDisplayReviews([newReview, ...displayReviews]);

      setRating(0);

      setComment('');
    } catch (error) {
      console.error('Failed to submit review:', error);

      alert('Failed to submit review. Please try again.');
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'Description':
        return (
          <div className="text-gray-700 text-sm leading-relaxed">
            {product.description ? (
              <p className="mb-3">{product.description}</p>
            ) : (
              <p className="mb-3">No description available for this product.</p>
            )}

            <ul className="list-disc list-inside space-y-1">
              <li>Category: {product.category.name}</li>

              <li>Stock: {product.stock} available</li>

              <li>
                Price: $
                {(typeof product.price === 'string'
                  ? parseFloat(product.price)
                  : product.price
                ).toFixed(2)}
              </li>
            </ul>
          </div>
        );

      case 'Reviews':
        const reviewsToShow = showAllReviews ? displayReviews : displayReviews.slice(0, 3);

        return (
          <div className="text-gray-600 text-sm space-y-4">
            <div>
              <p className="font-medium mb-2">
                {'⭐'.repeat(Math.round(initialReviews.averageRating))}{' '}
                {initialReviews.averageRating.toFixed(1)} average rating based on{' '}
                {initialReviews.totalReviews} reviews
              </p>
            </div>

            {reviewsToShow.length > 0 ? (
              <div className="space-y-3">
                {reviewsToShow.map((review) => (
                  <div key={review.id} className="border-l-2 border-gray-200 pl-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-800">{review.customer_name}</span>

                      <span className="text-yellow-500">{'⭐'.repeat(review.rating)}</span>
                    </div>

                    <p className="text-gray-600">{review.comment}</p>

                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(review.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p>No reviews yet. Be the first to review this product!</p>
            )}

            {isLoggedIn && (
              <form onSubmit={handleReviewSubmit} className="mt-4">
                <h3 className="font-medium text-lg mb-2">Write a review</h3>

                <div className="flex items-center mb-2">
                  <StarRating rating={rating} setRating={setRating} />
                </div>

                <div className="flex items-center">
                  <input
                    type="text"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="What did you think of the product?"
                    className="flex-grow border rounded-l p-2 text-sm"
                  />

                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded-r hover:bg-blue-700 text-sm"
                  >
                    Submit
                  </button>
                </div>
              </form>
            )}

            {displayReviews.length > 3 && !showAllReviews && (
              <button
                onClick={() => setShowAllReviews(true)}
                className="text-blue-600 hover:underline text-sm font-medium mt-2"
              >
                See more
              </button>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-white mt-10 p-6 rounded shadow-sm border">
      <div className="flex gap-6 border-b border-gray-200 mb-4">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-2 text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-blue-500'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="mt-2">{renderContent()}</div>
    </div>
  );
}

ProductDetailsTabs.Skeleton = function ProductDetailsTabsSkeleton() {
  return (
    <div className="bg-white mt-10 p-6 rounded shadow-sm border animate-pulse">
      <div className="flex gap-6 border-b border-gray-200 mb-4">
        <div className="h-6 bg-gray-200 rounded w-24"></div>

        <div className="h-6 bg-gray-200 rounded w-24"></div>
      </div>

      <div className="space-y-3 mt-2">
        <div className="h-4 bg-gray-200 rounded w-full"></div>

        <div className="h-4 bg-gray-200 rounded w-full"></div>

        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      </div>
    </div>
  );
};
