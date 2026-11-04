import { useState, useEffect } from 'react';
import type { Product, Category } from '~/types';
import { apiClient } from '~/api';

export const useHome = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [productsByCategory, setProductsByCategory] = useState<Record<string, Product[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productsResponse, categoriesResponse] = await Promise.all([
          apiClient('/products?featured=true'),
          apiClient('/categories'),
        ]);
        setFeaturedProducts(productsResponse);
        setCategories(categoriesResponse);

        const productsByCategoryPromises = categoriesResponse.map((category: Category) =>
          apiClient(`/products?categoryName=${encodeURIComponent(category.name)}`),
        );

        const productsByCategoryResponses = await Promise.all(productsByCategoryPromises);

        const productsByCategoryResult: Record<string, Product[]> = {};
        categoriesResponse.forEach((category: Category, index: number) => {
          productsByCategoryResult[category.name] = productsByCategoryResponses[index].slice(0, 5);
        });

        setProductsByCategory(productsByCategoryResult);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch home page data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { featuredProducts, categories, productsByCategory, loading, error };
};
