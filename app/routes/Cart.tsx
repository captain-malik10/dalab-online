import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useCart } from '~/hooks/useCart';
import { useGuestCart } from '~/hooks/useGuestCart';
import { Link } from 'react-router';
import CartItemCard from '../components/CartItemCard';
import LoginReminderModal from '../components/LoginReminderModal';

export default function Cart() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  const authenticatedCart = useCart();
  const guestCart = useGuestCart();

  // Handle authentication check after hydration
  useEffect(() => {
    setIsHydrated(true);
    setIsAuthenticated(!!localStorage.getItem('token'));
  }, []);

  // Use appropriate cart based on authentication status
  const { cartItems, loading, error, updateItemQuantity, removeItem, isUpdating } = isAuthenticated
    ? authenticatedCart
    : guestCart;

  console.log('Cart component - isAuthenticated:', isAuthenticated);
  console.log('Cart component - cartItems:', cartItems);
  console.log('Cart component - using:', isAuthenticated ? 'authenticatedCart' : 'guestCart');

  const [showLoginReminder, setShowLoginReminder] = useState(false);
  const [isCheckoutFlow, setIsCheckoutFlow] = useState(false);

  // Show login reminder for guests with items in cart
  useEffect(() => {
    if (isHydrated && !isAuthenticated && cartItems && cartItems.length > 0) {
      const hasSeenReminder = localStorage.getItem('hasSeenCartReminder');
      if (!hasSeenReminder) {
        setShowLoginReminder(true);
        localStorage.setItem('hasSeenCartReminder', 'true');
      }
    }
  }, [isHydrated, isAuthenticated, cartItems]);

  // Migrate guest cart to authenticated cart after login
  useEffect(() => {
    if (isAuthenticated && guestCart.cartItems.length > 0) {
      guestCart.migrateToAuthenticatedCart();
    }
  }, [isAuthenticated, guestCart]);

  const subtotal =
    cartItems?.reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0) ?? 0;
  const shipping = 0; // Free shipping
  const total = subtotal + shipping;

  const handleQuantityChange = (itemId: number, currentQuantity: number, change: number) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity > 0) {
      updateItemQuantity(itemId, newQuantity);
    }
  };

  // Show loading state during hydration to prevent mismatch
  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header breadcrumbs={{ Home: '/', Cart: '/cart' }} />
        <main className="container mx-auto px-4 py-8 min-h-screen">
          <div className="text-center py-12">
            <p className="text-xl text-gray-600">Loading...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header breadcrumbs={{ Home: '/', Cart: '/cart' }} />
      <main className="container mx-auto px-4 py-8 min-h-screen">
        {loading && <p>Loading cart...</p>}
        {error && <p className="text-red-500">Error loading cart: {error.message}</p>}

        {!loading && !error && (
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            <div className="w-full lg:w-2/3 bg-white rounded shadow-sm p-6">
              {cartItems && cartItems.length > 0 ? (
                cartItems.map((item) => (
                  <CartItemCard
                    key={item.id}
                    item={item}
                    onQuantityChange={handleQuantityChange}
                    onRemove={removeItem}
                    isUpdating={isUpdating}
                  />
                ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-xl text-gray-600">Your cart is empty.</p>
                  <Link to="/shop" className="text-blue-600 hover:underline mt-2 inline-block">
                    Continue Shopping
                  </Link>
                </div>
              )}
            </div>

            <div className="w-full lg:w-1/3 lg:sticky top-8">
              <div className="bg-white rounded shadow-sm p-8 h-fit">
                <h3 className="text-xl font-bold mb-6">Order Summary</h3>
                <div className="space-y-3 text-gray-700">
                  <div className="flex justify-between text-md">
                    <span>Subtotal:</span>
                    <span className="font-medium">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-md">
                    <span>Shipping:</span>
                    <span className="font-medium text-green-600">Free</span>
                  </div>
                  <div className="border-t pt-4 mt-4 font-bold text-xl text-gray-900 flex justify-between">
                    <span>Total:</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>

                {isAuthenticated ? (
                  <Link
                    to="/checkout"
                    className="w-full mt-8 bg-blue-600 text-white py-3 rounded hover:bg-blue-700 font-semibold text-lg disabled:opacity-50 block text-center"
                  >
                    Proceed to Checkout
                  </Link>
                ) : (
                  <button
                    onClick={() => {
                      setIsCheckoutFlow(true);
                      setShowLoginReminder(true);
                    }}
                    className="w-full mt-8 bg-blue-600 text-white py-3 rounded hover:bg-blue-700 font-semibold text-lg disabled:opacity-50"
                  >
                    Proceed to Checkout
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />

      <LoginReminderModal
        isOpen={showLoginReminder}
        onClose={() => {
          setShowLoginReminder(false);
          setIsCheckoutFlow(false);
        }}
        itemCount={cartItems?.length || 0}
        isCheckoutFlow={isCheckoutFlow}
        listType="cart"
      />
    </div>
  );
}
