import { useState, useCallback } from 'react';
import type { Product } from '../types';
import useVendorApi from './useVendorApi';
import { API_BASE } from '~/config/api';

export const useVendorProducts = () => {
  const { data: products, loading, error, refetch } = useVendorApi<Product[]>('/vendors/products');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<Error | null>(null);

  const apiFetch = async (url: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('vendor_token');
    const headers = new Headers({
      'Content-Type': 'application/json',
      ...options.headers,
    });
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    const response = await fetch(`${API_BASE}/vendors${url}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'API request failed');
    }

    if (response.status === 204 || options.method === 'DELETE') {
      return;
    }

    return response.json();
  };

  const createProduct = useCallback(
    async (productData: Omit<Product, 'id' | 'vendor_id'>) => {
      setIsSubmitting(true);
      setSubmitError(null);
      try {
        await apiFetch('/products', {
          method: 'POST',
          body: JSON.stringify(productData),
        });
        refetch();
      } catch (e: any) {
        setSubmitError(e);
      } finally {
        setIsSubmitting(false);
      }
    },
    [refetch],
  );

  const updateProduct = useCallback(
    async (productId: number, productData: Partial<Product>) => {
      setIsSubmitting(true);
      setSubmitError(null);
      try {
        await apiFetch(`/products/${productId}`, {
          method: 'put',
          body: JSON.stringify(productData),
        });
        refetch();
      } catch (e: any) {
        setSubmitError(e);
      } finally {
        setIsSubmitting(false);
      }
    },
    [refetch],
  );

  const deleteProduct = useCallback(
    async (productId: number) => {
      setIsSubmitting(true);
      setSubmitError(null);
      try {
        await apiFetch(`/products/${productId}`, {
          method: 'DELETE',
        });
        refetch();
      } catch (e: any) {
        setSubmitError(e);
      } finally {
        setIsSubmitting(false);
      }
    },
    [refetch],
  );

  return {
    products,
    loading,
    error,
    createProduct,
    updateProduct,
    deleteProduct,
    isSubmitting,
    submitError,
    refetch,
  };
};
