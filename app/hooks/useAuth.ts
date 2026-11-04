import { useState } from 'react';
import { useNavigate } from 'react-router';
import type { User } from '../types';
import { API_BASE } from '~/config/api';

const apiFetch = async (url: string, options: RequestInit = {}) => {
  const response = await fetch(`${API_BASE}${url}`, options);

  if (!response.ok) {
    console.error(`HTTP error! status: ${response.status}`);
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.indexOf('application/json') !== -1) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    } else {
      throw new Error(`Server returned an unexpected response. Status: ${response.status}`);
    }
  }

  // For DELETE requests, there might not be a JSON body to parse
  if (options.method === 'DELETE') {
    return;
  }

  return response.json();
};

export const useAuth = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const login = async ({ email, password }: Pick<User, 'email' | 'password'>) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const { token } = await apiFetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', token);

        // Migrate guest cart to authenticated cart if it exists
        const guestCart = localStorage.getItem('guestCart');
        if (guestCart) {
          try {
            const cartItems = JSON.parse(guestCart);
            for (const item of cartItems) {
              await apiFetch('/cart/items', {
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
            localStorage.removeItem('guestCart');
            localStorage.removeItem('hasSeenCartReminder');
          } catch (migrationError) {
            console.error('Error migrating cart:', migrationError);
            // Don't fail login if cart migration fails
          }
        }
      }

      navigate('/');
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  const register = async (userData: User) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await apiFetch('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      setSuccess('Account created successfully! You can now log in.');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.clear();
    }
    window.location.href = '/login';
  };

  const deleteAccount = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      await apiFetch('/user', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      logout();
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  return { login, register, logout, deleteAccount, loading, error, success };
};
