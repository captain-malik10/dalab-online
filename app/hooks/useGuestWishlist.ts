import { useState, useCallback, useEffect } from 'react';
import { API_BASE } from '~/config/api';

// Define the type for a wishlist item
export interface GuestWishlistItem {
  id: number; // This will be a temporary ID for localStorage
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

// Guest wishlist hook for users without authentication
export const useGuestWishlist = () => {
  const [wishlistItems, setWishlistItems] = useState<GuestWishlistItem[]>(() => {
    // Initialize with localStorage data if available
    if (typeof window !== 'undefined') {
      const savedWishlist = localStorage.getItem('guestWishlist');
      if (savedWishlist) {
        try {
          return JSON.parse(savedWishlist);
        } catch (error) {
          console.error('Error parsing initial guest wishlist:', error);
          localStorage.removeItem('guestWishlist');
        }
      }
    }
    return [];
  });
  const [isUpdating, setIsUpdating] = useState(false);

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (wishlistItems.length > 0) {
        localStorage.setItem('guestWishlist', JSON.stringify(wishlistItems));
      } else {
        localStorage.removeItem('guestWishlist');
      }
    }
  }, [wishlistItems]);

  const addItem = useCallback((productData: any) => {
    setIsUpdating(true);
    setWishlistItems((prev) => {
      const existingItem = prev.find((item) => item.productId === productData.id);
      if (existingItem) {
        return prev;
      }
      const newItem: GuestWishlistItem = {
        id: Date.now() + Math.random(),
        productId: productData.id,
        name: productData.name,
        price: productData.price,
        image_urls: productData.image_urls || [],
        description: productData.description || '',
        category_name: productData.category_name || '',
        vendor_name: productData.vendor_name || '',
        averageRating: productData.averageRating || null,
        totalReviews: productData.totalReviews || 0,
        timesSold: productData.timesSold || 0,
      };
      return [...prev, newItem];
    });
    setTimeout(() => setIsUpdating(false), 500);
  }, []);

  const removeItem = useCallback((productId: number) => {
    setIsUpdating(true);
    setWishlistItems((prev) => prev.filter((item) => item.productId !== productId));
    setTimeout(() => setIsUpdating(false), 500);
  }, []);

  const clearWishlist = useCallback(() => {
    setIsUpdating(true);
    setWishlistItems([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('guestWishlist');
    }
    setTimeout(() => setIsUpdating(false), 500);
  }, []);

  // Migrate guest wishlist to authenticated wishlist
  const migrateToAuthenticatedWishlist = useCallback(async () => {
    if (wishlistItems.length === 0) return;

    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      for (const item of wishlistItems) {
        await fetch(`${API_BASE}/wishlist/items`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            productId: item.productId,
          }),
        });
      }

      clearWishlist();
    } catch (error) {
      console.error('Error migrating wishlist:', error);
    }
  }, [wishlistItems, clearWishlist]);

  return {
    wishlistItems,
    loading: false,
    error: null,
    isUpdating,
    addItem,
    removeItem,
    clearWishlist,
    migrateToAuthenticatedWishlist,
  };
};
