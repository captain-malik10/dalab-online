import { useState, useCallback } from 'react';
import type { Vendor } from '../types';
import useVendorApi from './useVendorApi';

export const useVendorProfile = () => {
  const { data: profile, loading, error, refetch } = useVendorApi<Vendor>('/vendors/me');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<Error | null>(null);

  const updateProfile = useCallback(
    async (vendorData: Partial<Vendor>) => {
      setIsUpdating(true);
      setUpdateError(null);
      try {
        const token = localStorage.getItem('vendor_token');
        const response = await fetch(`http://localhost:3001/api/vendors/me`, {
          method: 'put',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(vendorData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to update profile');
        }

        refetch(); // Refetch profile data after update
      } catch (e: any) {
        setUpdateError(e);
      } finally {
        setIsUpdating(false);
      }
    },
    [refetch],
  );

  return { profile, loading, error, updateProfile, isUpdating, updateError };
};
