import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useCart } from '~/hooks/useCart';
import { useOrders } from '~/hooks/useOrders';
import { Link, useNavigate } from 'react-router';
import { X, Copy, Check } from 'lucide-react';
import PhoneInput from '../components/PhoneInput';
import ConfirmationModal from '~/components/ConfirmationModal';
import PaymentModal from '~/components/PaymentModal';
import { useUser } from '~/hooks/useUser'; // Import useUser hook

interface ShippingForm {
  fullName: string;
  address: string;
  city: string;
  district: string;
  phone: string;
}

interface PaymentForm {
  method: 'EVC plus' | 'Edahab';
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  const { cartItems, loading, error, updateItemQuantity, removeItem, isUpdating, clearCart } =
    useCart();

  const {
    isSubmitting: orderSubmitting,
    submitError: orderSubmitError,
    setSubmitError: setOrderSubmitError, // Destructure the setter
    orderId,
    // loadingUserInfo, // This will be replaced by useUser's loading
    // userInfoError, // This will be replaced by useUser's error
    // fetchUserInfo, // This will be replaced by useUser's user object
    createOrder,
    processPayment,
  } = useOrders();

  const { user, loading: userLoading, error: userError } = useUser(); // Use the new hook

  const [shippingForm, setShippingForm] = useState<ShippingForm>({
    fullName: '',
    address: '',
    city: '',
    district: '',
    phone: '',
  });

  const [paymentForm, setPaymentForm] = useState<PaymentForm>({
    method: 'EVC plus',
  });

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const subtotal =
    cartItems?.reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0) ?? 0;
  const shipping = 0; // Free shipping
  const total = subtotal + shipping;

  // Handle authentication check and redirect
  useEffect(() => {
    setIsHydrated(true);
    const token = localStorage.getItem('token');
    const isAuth = !!token;
    setIsAuthenticated(isAuth);

    // Redirect unauthenticated users to cart
    if (!isAuth) {
      navigate('/cart');
      return;
    }
  }, [navigate]);

  // Auto-fill form for authenticated users using useUser hook
  useEffect(() => {
    if (user && !userLoading) {
      let formattedPhone = user.phone || '';
      if (formattedPhone && !formattedPhone.startsWith('+')) {
        if (formattedPhone.startsWith('252')) {
          formattedPhone = `+${formattedPhone}`;
        } else {
          formattedPhone = `+252${formattedPhone}`;
        }
      }

      setShippingForm((prev) => ({
        ...prev,
        fullName: user.name || '',
        phone: formattedPhone,
      }));
    }
  }, [isHydrated, isAuthenticated, user, userLoading]); // Add user and userLoading to dependencies

  // Auto-select payment method based on phone number
  useEffect(() => {
    const localPhoneNumber = shippingForm.phone.replace('+252', '').trim();
    if (localPhoneNumber.startsWith('61')) {
      handlePaymentChange('EVC plus');
    } else if (localPhoneNumber.startsWith('62')) {
      handlePaymentChange('Edahab');
    } else {
      handlePaymentChange('EVC plus'); // Default
    }
  }, [shippingForm.phone]);

  // Removed fetchAndSetUserInfo as it's no longer needed

  // Note: Guest info saving removed since we redirect unauthenticated users to cart

  const handleQuantityChange = (itemId: number, currentQuantity: number, change: number) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity > 0) {
      updateItemQuantity(itemId, newQuantity);
    }
  };

  const handleShippingChange = (field: keyof ShippingForm, value: string) => {
    setShippingForm((prev) => ({ ...prev, [field]: value }));
  };

  const handlePaymentChange = (method: 'EVC plus' | 'Edahab') => {
    setPaymentForm((prev) => ({ ...prev, method }));
  };

  const generatePaymentCode = () => {
    const [whole, decimalRaw = ''] = total.toFixed(2).split('.');

    const decimal = decimalRaw.replace(/0+$/, '');

    const middlePart = decimal ? `${whole}*${decimal}` : `${whole}`;

    if (paymentForm.method === 'EVC plus') {
      return `*712*61000000*${middlePart}#`;
    } else {
      return `*712*62000000*${middlePart}#`;
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatePaymentCode());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handlePlaceOrder = () => {
    if (!cartItems || cartItems.length === 0) {
      setOrderSubmitError('Your cart is empty');
      return;
    }

    // Validate shipping form
    const requiredFields: (keyof ShippingForm)[] = [
      'fullName',
      'address',
      'city',
      'district',
      'phone',
    ];
    const missingFields = requiredFields.filter((field) => !shippingForm[field].trim());

    if (missingFields.length > 0) {
      setOrderSubmitError(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }

    setOrderSubmitError(null); // Clear previous errors
    setShowPaymentModal(true);
  };

  const handleCreateOrder = async () => {
    setShowPaymentModal(false);

    try {
      const shippingAddress = `${shippingForm.address}, ${shippingForm.city}, ${shippingForm.district}`;

      const newOrderId = await createOrder({
        shipping_address: shippingAddress,
      });

      if (newOrderId) {
        const paymentSuccess = await processPayment({
          orderId: newOrderId,
          method: paymentForm.method,
          phone_number: shippingForm.phone,
        });

        if (paymentSuccess) {
          await clearCart();
          setShowConfirmationModal(true);
        } else {
          // Error handled by hook, just ensure modal doesn't show
        }
      } else {
        // Error handled by hook
      }
    } catch (error: any) {
      // Error handled by hook
    } finally {
      // Managed by hook
    }
  };

  const handleConfirmationClose = () => {
    setShowConfirmationModal(false);
    navigate('/orders');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header breadcrumbs={{ Home: '/', Cart: '/cart', Checkout: '/checkout' }} />
      <main className="container mx-auto px-4 py-8 min-h-screen">
        {!isHydrated && (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600">Loading...</p>
          </div>
        )}

        {isHydrated && isAuthenticated && (
          <>
            {(loading || userLoading) && <p>Loading...</p>}
            {(error || userError) && (
              <p className="text-red-500">Error: {error?.message || userError}</p>
            )}
            {!loading && !error && !userLoading && !userError && (
              <div className="flex flex-col lg:flex-row gap-6 items-start">
                <div className="w-full lg:w-2/3 space-y-6">
                  <div className="bg-white rounded shadow-sm p-6">
                    <h2 className="text-xl font-bold mb-4">Shipping Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          value={shippingForm.fullName}
                          onChange={(e) => handleShippingChange('fullName', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter your full name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone Number *
                        </label>
                        <PhoneInput
                          value={shippingForm.phone}
                          onChange={(value) => handleShippingChange('phone', value)}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Address *
                        </label>
                        <textarea
                          value={shippingForm.address}
                          onChange={(e) => handleShippingChange('address', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows={3}
                          placeholder="Enter your complete address"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          City *
                        </label>
                        <input
                          type="text"
                          value={shippingForm.city}
                          onChange={(e) => handleShippingChange('city', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter your city"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          District *
                        </label>
                        <input
                          type="text"
                          value={shippingForm.district}
                          onChange={(e) => handleShippingChange('district', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter your district"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded shadow-sm p-6">
                    <h2 className="text-xl font-bold mb-4">Payment Method</h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Choose Payment Method *
                        </label>
                        <div className="flex gap-4">
                          <button
                            type="button"
                            onClick={() => handlePaymentChange('EVC plus')}
                            className={`flex-1 py-3 px-4 rounded border-2 font-medium transition-colors ${
                              paymentForm.method === 'EVC plus'
                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                            }`}
                          >
                            EVC Plus
                          </button>
                          <button
                            type="button"
                            onClick={() => handlePaymentChange('Edahab')}
                            className={`flex-1 py-3 px-4 rounded border-2 font-medium transition-colors ${
                              paymentForm.method === 'Edahab'
                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                            }`}
                          >
                            Edahab
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="w-full lg:w-1/3 lg:sticky top-8">
                  <div className="bg-white rounded shadow-sm p-8 h-fit">
                    <h3 className="text-xl font-bold mb-6">Order Summary</h3>

                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-800 mb-3">Items</h4>
                      <div className="space-y-2">
                        {cartItems && cartItems.length > 0 ? (
                          cartItems.map((item) => (
                            <div
                              key={item.id}
                              className="flex justify-between items-center text-sm"
                            >
                              <span className="text-gray-700">
                                {item.name} ({item.quantity})
                              </span>
                              <span className="font-medium">
                                ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                              </span>
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-500 text-sm">No items in cart</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3 text-gray-700 border-t pt-4">
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

                    {orderSubmitError && (
                      <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                        {orderSubmitError}
                      </div>
                    )}

                    <button
                      onClick={handlePlaceOrder}
                      disabled={!cartItems || cartItems.length === 0 || orderSubmitting}
                      className="w-full mt-8 bg-blue-600 text-white py-3 rounded hover:bg-blue-700 font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {orderSubmitting ? 'Processing Order...' : 'Place Order'}
                    </button>

                    <Link
                      to="/cart"
                      className="block text-center text-blue-600 hover:underline mt-4"
                    >
                      ← Back to Cart
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
      <Footer />

      {showPaymentModal && (
        <PaymentModal
          setShowPaymentModal={setShowPaymentModal}
          generatePaymentCode={generatePaymentCode}
          copyToClipboard={copyToClipboard}
          copied={copied}
          createOrder={handleCreateOrder}
          isSubmitting={orderSubmitting}
        />
      )}

      {showConfirmationModal && (
        <ConfirmationModal
          isOpen={showConfirmationModal}
          onClose={handleConfirmationClose}
          onConfirm={handleConfirmationClose}
          title="Order Successful!"
          message="Your order has been placed successfully. You can view your order details in the orders page."
          icon={
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <Check className="text-green-600" size={28} />
            </div>
          }
          confirmButtonText="View Orders"
          confirmButtonClassName="bg-blue-600 hover:bg-blue-700"
        />
      )}
    </div>
  );
}
