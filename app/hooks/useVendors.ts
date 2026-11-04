import { useState, useEffect } from 'react';

export interface Vendor {
  id: number;
  store_name: string;
  description?: string;
  country?: string;
  city?: string;
  district?: string;
  logo_url?: string;
  isVerified: boolean;
  status: string;
  product_count: number;
  created_at: string;
  updated_at: string;
}

interface UseVendorsReturn {
  vendors: Vendor[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useVendors(): UseVendorsReturn {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/vendors-public');

      if (!response.ok) {
        throw new Error(`Failed to fetch vendors: ${response.statusText}`);
      }

      const data = await response.json();
      setVendors(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch vendors');
      console.error('Error fetching vendors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  return {
    vendors,
    loading,
    error,
    refetch: fetchVendors,
  };
}
