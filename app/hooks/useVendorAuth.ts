import { useState } from 'react';
import { useNavigate } from 'react-router';
import type { Vendor } from '../types';
import { apiClient } from '~/api';

export const useVendorAuth = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const login = async ({ email, password }: Pick<Vendor, 'email' | 'password'>) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const result = await apiClient('/vendors/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (!result) {
        setError('Invalid email or password.');
        return;
      }

      const { token, store_name } = result;
      localStorage.setItem('vendor_token', token);
      if (store_name && typeof store_name === 'string') {
        const slug = store_name.toLowerCase().replace(/\s+/g, '-');
        navigate(`/store/${slug}/dashboard`);
      } else {
        navigate('/store/dashboard');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const registerVendorDetails = async (vendorData: Omit<Vendor, 'id'>) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const result = await apiClient('/vendors/register', {
        method: 'POST',
        body: JSON.stringify(vendorData),
      });
      setSuccess(result.message);
      return result.vendorId;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const uploadVendorFiles = async (vendorId: number, formData: FormData) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const result = await apiClient(`/vendors/register/uploads/${vendorId}`, {
        method: 'PUT',
        body: formData,
      });
      setSuccess(result.message || 'Store created successfully! Please log in.');
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('vendor_token');
    window.location.href = '/';
  };

  return { login, registerVendorDetails, uploadVendorFiles, logout, loading, error, success };
};
