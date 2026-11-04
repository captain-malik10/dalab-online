import { useState, useEffect } from 'react';
import type { Product } from '~/types';

interface ProductFilters {
  categoryName?: string;
  vendorName?: string;
  minPrice?: number;
  maxPrice?: number;
  featured?: boolean;
}

interface UseProductsReturn {
  products: Product[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useProducts(filters?: ProductFilters): UseProductsReturn {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams();
      if (filters?.categoryName) queryParams.append('categoryName', filters.categoryName);
      if (filters?.vendorName) queryParams.append('vendorName', filters.vendorName);
      if (filters?.minPrice) queryParams.append('minPrice', filters.minPrice.toString());
      if (filters?.maxPrice) queryParams.append('maxPrice', filters.maxPrice.toString());
      if (filters?.featured !== undefined)
        queryParams.append('featured', filters.featured.toString());

      const response = await fetch(`/api/products?${queryParams.toString()}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.statusText}`);
      }

      const data = await response.json();
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [
    filters?.categoryName,
    filters?.vendorName,
    filters?.minPrice,
    filters?.maxPrice,
    filters?.featured,
  ]);

  return {
    products,
    loading,
    error,
    refetch: fetchProducts,
  };
}
