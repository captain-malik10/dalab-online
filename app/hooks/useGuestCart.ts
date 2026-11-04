import { useState, useCallback, useEffect } from 'react';

// Define the type for a cart item (same as useCart)
export interface GuestCartItem {
  id: number; // This will be a temporary ID for localStorage
  quantity: number;
  productId: number;
  name: string;
  price: string;
  image_urls: string[];
  category_name: string;
  vendor_name: string;
}

// Guest cart hook for users without authentication
export const useGuestCart = () => {
  const [cartItems, setCartItems] = useState<GuestCartItem[]>(() => {
    // Initialize with localStorage data if available
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem('guestCart');
      if (savedCart) {
        try {
          const parsedCart = JSON.parse(savedCart);
          console.log('Initializing cart with localStorage data:', parsedCart);
          return parsedCart;
        } catch (error) {
          console.error('Error parsing initial guest cart:', error);
          localStorage.removeItem('guestCart');
        }
      }
    }
    return [];
  });
  const [isUpdating, setIsUpdating] = useState(false);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.log('Saving cart to localStorage:', cartItems);
      if (cartItems.length > 0) {
        localStorage.setItem('guestCart', JSON.stringify(cartItems));
        console.log('Cart saved successfully');
      } else {
        localStorage.removeItem('guestCart');
        console.log('Cart cleared from localStorage');
      }
    }
  }, [cartItems]);

  const addItem = useCallback((productId: number, quantity: number, productData: any) => {
    console.log('Adding item to guest cart:', {
      productId,
      quantity,
      productData,
    });
    setIsUpdating(true);

    setCartItems((prev) => {
      console.log('Current cart items before adding:', prev);

      // Load current cart from localStorage to ensure we have the latest data
      let currentCart = prev;
      if (typeof window !== 'undefined') {
        const savedCart = localStorage.getItem('guestCart');
        if (savedCart) {
          try {
            const parsedCart = JSON.parse(savedCart);
            if (parsedCart.length > prev.length) {
              console.log('Found more items in localStorage, using that:', parsedCart);
              currentCart = parsedCart;
            }
          } catch (error) {
            console.error('Error parsing cart from localStorage:', error);
          }
        }
      }

      const existingItemIndex = currentCart.findIndex((item) => item.productId === productId);

      if (existingItemIndex !== -1) {
        // Item exists, update quantity
        console.log('Item exists, updating quantity');
        const updatedItems = [...currentCart];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + quantity,
        };
        console.log('Updated cart items:', updatedItems);
        return updatedItems;
      } else {
        // Item doesn't exist, add new item
        console.log("Item doesn't exist, adding new item");
        const newItem: GuestCartItem = {
          id: Date.now() + Math.random(), // More unique ID
          quantity,
          productId,
          name: productData.name,
          price: productData.price,
          image_urls: productData.image_urls || [],
          category_name: productData.category_name || '',
          vendor_name: productData.vendor_name || '',
        };
        const newItems = [...currentCart, newItem];
        console.log('Previous items:', currentCart);
        console.log('New item:', newItem);
        console.log('Combined new cart items:', newItems);
        return newItems;
      }
    });

    setTimeout(() => setIsUpdating(false), 500);
  }, []);

  const updateItemQuantity = useCallback((itemId: number, quantity: number) => {
    setIsUpdating(true);

    setCartItems((prev) => {
      if (quantity <= 0) {
        return prev.filter((item) => item.id !== itemId);
      }
      return prev.map((item) => (item.id === itemId ? { ...item, quantity } : item));
    });

    setTimeout(() => setIsUpdating(false), 500);
  }, []);

  const removeItem = useCallback((itemId: number) => {
    setIsUpdating(true);

    setCartItems((prev) => prev.filter((item) => item.id !== itemId));

    setTimeout(() => setIsUpdating(false), 500);
  }, []);

  const clearCart = useCallback(() => {
    setIsUpdating(true);
    setCartItems([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('guestCart');
    }
    setTimeout(() => setIsUpdating(false), 500);
  }, []);

  // Migrate guest cart to authenticated cart
  const migrateToAuthenticatedCart = useCallback(async () => {
    if (cartItems.length === 0) return;

    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      // Add each item to the authenticated cart
      for (const item of cartItems) {
        await fetch('http://localhost:3001/api/cart/items', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            productId: item.productId,
            quantity: item.quantity,
          }),
        });
      }

      // Clear guest cart after successful migration
      clearCart();
    } catch (error) {
      console.error('Error migrating cart:', error);
    }
  }, [cartItems, clearCart]);

  return {
    cartItems,
    loading: false,
    error: null,
    isUpdating,
    addItem,
    updateItemQuantity,
    removeItem,
    clearCart,
    migrateToAuthenticatedCart,
  };
};
