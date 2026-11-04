import React, { useState } from 'react';
import { Link } from 'react-router';
import { BadgeDollarSign, Heart, ShoppingBag, X } from 'lucide-react';
import { useAuth } from '~/hooks/useAuth';

interface LoginReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemCount: number;
  isCheckoutFlow?: boolean; // New prop to indicate if user clicked "Proceed to Checkout"
  listType: 'cart' | 'wishlist';
}

export default function LoginReminderModal({
  isOpen,
  onClose,
  itemCount,
  isCheckoutFlow = false,
  listType,
}: LoginReminderModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const { login, register, loading, error } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    try {
      if (isLoginMode) {
        // Login
        await login({ email, password });
        onClose(); // Close modal after successful login
      } else {
        // Register
        if (password !== confirmPassword) {
          setLocalError("Passwords don't match!");
          return;
        }
        await register({
          name,
          email,
          password,
          phone: '', // Optional field
          role: 'customer', // Default role for regular users
        });
        // Note: register will navigate to login page, so we don't need to close modal
      }
    } catch (err) {
      // Error is handled by useAuth hook, but we can also set local error
      console.error('Auth error:', err);
    }
  };

  const title = isCheckoutFlow
    ? isLoginMode
      ? 'Login to Continue'
      : 'Create Account to Checkout'
    : isLoginMode
      ? `Login to Save ${listType === 'cart' ? 'Cart' : 'Wishlist'}`
      : 'Create Account';

  const icon = isCheckoutFlow ? (
    <BadgeDollarSign size={32} className="text-blue-600" />
  ) : listType === 'cart' ? (
    <ShoppingBag size={32} className="text-blue-600" />
  ) : (
    <Heart size={32} className="text-blue-600" />
  );

  const heading = isCheckoutFlow ? 'Complete Your Purchase!' : "Don't Lose Your Items!";

  const message = isCheckoutFlow ? (
    <>
      You have <span className="font-semibold text-blue-600">{itemCount}</span> item
      {itemCount !== 1 ? 's' : ''} in your cart. Please login or create an account to complete your
      checkout and secure your order.
    </>
  ) : (
    <>
      You have <span className="font-semibold text-blue-600">{itemCount}</span> item
      {itemCount !== 1 ? 's' : ''} in your {listType}. Create an account or login to save your{' '}
      {listType} and access it from any device.
    </>
  );

  const buttonText = loading
    ? isLoginMode
      ? 'Logging in...'
      : 'Creating Account...'
    : isLoginMode
      ? isCheckoutFlow
        ? 'Login to Continue'
        : `Login to Save ${listType === 'cart' ? 'Cart' : 'Wishlist'}`
      : isCheckoutFlow
        ? 'Create Account to Checkout'
        : 'Create Account';

  return (
    <div className="fixed inset-0 bg-black/10 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-lg text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded text-sm p-1.5"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            {icon}
          </div>

          <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">{heading}</h3>

          <p className="text-gray-600 mb-6 text-center">{message}</p>

          {(error || localError) && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error || localError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLoginMode && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required={!isLoginMode}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your full name"
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your password"
              />
            </div>

            {!isLoginMode && (
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required={!isLoginMode}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Confirm your password"
                />
              </div>
            )}

            <div className="space-y-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {buttonText}
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={() => {
                  setIsLoginMode(!isLoginMode);
                  setLocalError(null);
                  // Clear form fields when switching modes
                  setEmail('');
                  setPassword('');
                  setConfirmPassword('');
                  setName('');
                }}
                className="w-full bg-gray-100 text-gray-700 py-3 rounded hover:bg-gray-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoginMode ? 'Create New Account' : 'Already have an account? Login'}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full text-gray-500 py-2 hover:text-gray-700 text-sm"
              >
                Continue as Guest
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
