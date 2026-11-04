import { useState, useCallback } from 'react';
import { apiClient } from '~/api';

export interface Delivery {
  id: number;
  order_id: number;
  tracking_number: string;
  status: string;
  delivery_address: string;
  created_at: string;
  customer_name: string;
}

export function useAdminDeliveries() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDeliveries = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient('/admin/deliveries');
      setDeliveries(data);
    } catch (err: any) {
      setError(err.message || 'Error fetching deliveries');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateTrackingNumber = useCallback(
    async (deliveryId: number, trackingNumber: string) => {
      setLoading(true);
      setError(null);
      try {
        await apiClient(`/admin/deliveries/${deliveryId}`, {
          method: 'PUT',
          body: JSON.stringify({ tracking_number: trackingNumber }),
        });
        await fetchDeliveries(); // Refetch after update
        return true;
      } catch (err: any) {
        setError(err.message || 'Error updating tracking number');
        return false;
      } finally {
        setLoading(false);
      }
    },
    [fetchDeliveries],
  );

  const unassignDelivery = useCallback(
    async (deliveryId: number) => {
      setLoading(true);
      setError(null);
      try {
        await apiClient(`/admin/deliveries/${deliveryId}`, {
          method: 'DELETE',
        });
        await fetchDeliveries(); // Refetch after delete
        return true;
      } catch (err: any) {
        setError(err.message || 'Error unassigning delivery');
        return false;
      } finally {
        setLoading(false);
      }
    },
    [fetchDeliveries],
  );

  return {
    deliveries,
    loading,
    error,
    fetchDeliveries,
    updateTrackingNumber,
    unassignDelivery,
  };
}
