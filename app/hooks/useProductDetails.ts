import { useState, useEffect } from 'react';

export interface ProductDetailsResponse {
  product: {
    id: number;
    name: string;
    price: number | string;
    description: string;
    image_urls: string[];
    isFeatured: boolean;
    stock: number;
    created_at: string;
    updated_at: string;
    category: {
      id: number;
      name: string;
      image_url: string;
    };
  };
  store: {
    id: number;
    name: string;
    description: string;
    country: string;
    city: string;
    district: string;
    logo_url: string;
    isVerified: boolean;
    status: string;
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
  relatedProducts: Array<{
    id: number;
    name: string;
    price: number | string;
    image_urls: string[];
    isFeatured: boolean;
    vendor_name: string;
  }>;
}

interface UseProductDetailsReturn {
  productDetails: ProductDetailsResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useProductDetails(productId: string | number): UseProductDetailsReturn {
  const [productDetails, setProductDetails] = useState<ProductDetailsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/products/${productId}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch product details: ${response.statusText}`);
      }

      const data = await response.json();
      setProductDetails(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch product details');
      console.error('Error fetching product details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (productId) {
      fetchProductDetails();
    }
  }, [productId]);

  return {
    productDetails,
    loading,
    error,
    refetch: fetchProductDetails,
  };
}
