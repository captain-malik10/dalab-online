import { useState, useCallback } from 'react';
import useApi from './useApi';
import { useCart } from './useCart';

// Define the type for a wishlist item
export interface WishlistItem {
  id: number; // This is the wishlist_item id
  productId: number;
  name: string;
  price: string;
  image_urls: string[];
  description: string;
  category_name: string;
  vendor_name: string;
  averageRating: number | null;
  totalReviews: number;
  timesSold: number;
}

// The hook itself
export const useWishlist = () => {
  // Only fetch wishlist data if user is authenticated
  const isAuthenticated = typeof window !== 'undefined' ? !!localStorage.getItem('token') : false;
  const {
    data: wishlistItems,
    loading,
    error,
    refetch,
  } = useApi<WishlistItem[]>(isAuthenticated ? '/wishlist' : '');
  const { refetchCart } = useCart(); // Get the cart refetch function

  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<Error | null>(null);

  // Re-usable API fetcher for mutations
  const mutateWishlist = async (url: string, options: RequestInit) => {
    setIsUpdating(true);
    setUpdateError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/wishlist${url}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Wishlist operation failed');
      }

      // Refetch the wishlist data
      refetch();
    } catch (e: any) {
      setUpdateError(e);
      // Re-throw the error if you want the calling component to be able to catch it
      throw e;
    } finally {
      setIsUpdating(false);
    }
  };

  const addItem = useCallback((productId: number) => {
    return mutateWishlist('/items', {
      method: 'POST',
      body: JSON.stringify({ productId }),
    });
  }, []);

  const removeItem = useCallback((itemId: number) => {
    return mutateWishlist(`/items/${itemId}`, {
      method: 'DELETE',
    });
  }, []);

  const moveToCart = useCallback(
    async (itemId: number) => {
      try {
        await mutateWishlist(`/items/${itemId}/move-to-cart`, {
          method: 'POST',
        });
        // After moving, refetch the cart as well
        refetchCart();
      } catch (e) {
        // The error is already set by mutateWishlist, but you could add more handling here if needed
        console.error('Failed to move item to cart:', e);
      }
    },
    [refetchCart],
  );

  return {
    wishlistItems: Array.isArray(wishlistItems) ? wishlistItems : [], // Ensure it's always an array
    loading,
    error,
    isUpdating,
    updateError,
    addItem,
    removeItem,
    moveToCart,
    refetchWishlist: refetch,
  };
};
