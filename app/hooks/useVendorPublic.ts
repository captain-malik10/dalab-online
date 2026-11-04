import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '~/api';
import type { Vendor } from '~/types'; // Assuming Vendor type is defined here

// Extend the Vendor type to include aggregated data
export interface PublicVendorDetails extends Vendor {
  email: string; // Added email
  product_count: number;
  averageRating: number;
  totalReviews: number;
}

interface UseVendorPublicReturn {
  vendor: PublicVendorDetails | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useVendorPublic(vendorId: string | number): UseVendorPublicReturn {
  const [vendor, setVendor] = useState<PublicVendorDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVendorDetails = useCallback(async () => {
    if (!vendorId) {
      setError('Vendor ID is missing.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data: PublicVendorDetails = await apiClient(`/vendors-public/${vendorId}`);
      setVendor(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch vendor details.');
    } finally {
      setLoading(false);
    }
  }, [vendorId]);

  useEffect(() => {
    fetchVendorDetails();
  }, [fetchVendorDetails]);

  return {
    vendor,
    loading,
    error,
    refetch: fetchVendorDetails,
  };
}
