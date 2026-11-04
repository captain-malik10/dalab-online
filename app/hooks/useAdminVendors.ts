import { useState, useCallback } from 'react';
import { apiClient } from '~/api';
import type { Vendor } from '~/types';

export function useAdminVendors() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const fetchVendors = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient('/admin/vendors');
      setVendors(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateVendorStatus = useCallback(
    async (vendorId: number, status: 'approved' | 'rejected') => {
      try {
        await apiClient(`/admin/vendors/${vendorId}/status`, {
          method: 'PUT',
          body: JSON.stringify({ status }),
        });
        // Refetch vendors to update the list
        await fetchVendors();
        return true;
      } catch (err) {
        setError(err);
        return false;
      }
    },
    [fetchVendors],
  );

  const approveVendor = (vendorId: number) => updateVendorStatus(vendorId, 'approved');
  const denyVendor = (vendorId: number) => updateVendorStatus(vendorId, 'rejected');

  const fetchVendorDetails = useCallback(async (vendorId: number) => {
    setLoading(true);
    try {
      const data = await apiClient(`/admin/vendors/${vendorId}`);
      return data;
    } catch (err) {
      setError(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { vendors, loading, error, fetchVendors, approveVendor, denyVendor, fetchVendorDetails };
}
