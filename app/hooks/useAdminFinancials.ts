import { useState, useEffect } from 'react';
import { apiClient } from 'app/api';
import { toast } from 'react-toastify';

export interface Financials {
  id: number;
  store_name: string;
  isVerified: boolean;
  total_revenue: number;
  monthly_revenue: number;
  total_orders: number;
}

export const useAdminFinancials = () => {
  const [financials, setFinancials] = useState<Financials[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFinancials = async () => {
    try {
      setLoading(true);
      const response = await apiClient('/admin/financials');
      setFinancials(response);
    } catch (error) {
      toast.error('Failed to fetch financials.');
      console.error('Failed to fetch financials:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinancials();
  }, []);

  return { financials, loading, refetch: fetchFinancials };
};
