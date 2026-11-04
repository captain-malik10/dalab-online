import { useState, useCallback } from 'react';
import useApi from './useApi';
import { API_BASE } from '~/config/api';

// Define the type for a cart item
export interface CartItem {
  id: number; // This is the cart_item id
  quantity: number;
  productId: number;
  name: string;
  price: string;
  image_urls: string[];
  category_name: string;
  vendor_name: string;
}

// The hook itself
export const useCart = () => {
  // Only fetch cart data if user is authenticated
  const isAuthenticated = typeof window !== 'undefined' ? !!localStorage.getItem('token') : false;
  const {
    data: cartItems,
    loading,
    error,
    refetch,
  } = useApi<CartItem[]>(isAuthenticated ? '/cart' : '');

  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<Error | null>(null);

  // Re-usable API fetcher for mutations
  const mutateCart = async (url: string, options: RequestInit) => {
    setIsUpdating(true);
    setUpdateError(null);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

      if (!token) {
        throw new Error('Please log in to manage your cart');
      }

      const response = await fetch(`${API_BASE}/cart${url}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          ...options.headers,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Please log in to manage your cart');
        }
        const errorData = await response.json();
        throw new Error(errorData.message || 'Cart operation failed');
      }

      // Refetch the cart data to show the update
      refetch();
    } catch (e: any) {
      setUpdateError(e);
      throw e; // Re-throw to allow components to handle it
    } finally {
      setIsUpdating(false);
    }
  };

  const addItem = useCallback((productId: number, quantity: number) => {
    return mutateCart('/items', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity }),
    });
  }, []);

  const updateItemQuantity = useCallback((itemId: number, quantity: number) => {
    return mutateCart(`/items/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });
  }, []);

  const removeItem = useCallback((itemId: number) => {
    return mutateCart(`/items/${itemId}`, {
      method: 'DELETE',
    });
  }, []);

  const clearCart = useCallback(() => {
    return mutateCart('/', {
      method: 'DELETE',
    });
  }, []);

  return {
    cartItems,
    loading, // Loading state for fetching
    error, // Error state for fetching
    isUpdating, // Loading state for mutations
    updateError, // Error state for mutations
    addItem,
    updateItemQuantity,
    removeItem,
    clearCart,
    refetchCart: refetch,
  };
};
