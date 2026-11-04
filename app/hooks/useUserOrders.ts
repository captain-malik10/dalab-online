import { useState, useEffect, useCallback } from 'react';

interface Order {
  id: number;
  total: string;
  status: 'pending' | 'completed' | 'cancelled' | 'approved' | 'denied' | 'shipped' | 'processing';
  payment_status: 'pending' | 'paid' | 'failed';
  shipping_address: string;
  created_at: string;
  updated_at: string;
  item_count: number;
}

interface UseUserOrdersResult {
  orders: Order[];
  loading: boolean;
  error: string | null;
  fetchOrders: () => Promise<void>;
  cancelOrder: (orderId: number) => Promise<boolean>;
  deleteOrder: (orderId: number) => Promise<boolean>;
  isCancelling: boolean;
  cancelError: string | null;
  isDeleting: boolean;
  deleteError: string | null;
  markAsDelivered: (orderId: number) => Promise<boolean>;
  isDelivering: boolean;
  deliverError: string | null;
}

export function useUserOrders(): UseUserOrdersResult {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDelivering, setIsDelivering] = useState(false);
  const [deliverError, setDeliverError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token not found. Please log in.');
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:3001/api/orders', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data: Order[] = await response.json();
        setOrders(data);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to fetch orders.');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  }, []);

  const cancelOrder = useCallback(
    async (orderId: number): Promise<boolean> => {
      setIsCancelling(true);
      setCancelError(null);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setCancelError('Authentication token not found. Please log in.');
          setIsCancelling(false);
          return false;
        }

        const response = await fetch(`http://localhost:3001/api/orders/${orderId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: 'cancelled' }),
        });

        if (response.ok) {
          await fetchOrders();
          setIsCancelling(false);
          return true;
        } else {
          const errorData = await response.json();
          setCancelError(errorData.message || 'Failed to cancel order.');
          setIsCancelling(false);
          return false;
        }
      } catch (err: any) {
        setCancelError(err.message || 'An unexpected error occurred during cancellation.');
        setIsCancelling(false);
        return false;
      }
    },
    [fetchOrders],
  );

  const deleteOrder = useCallback(
    async (orderId: number): Promise<boolean> => {
      setIsDeleting(true);
      setDeleteError(null);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setDeleteError('Authentication token not found. Please log in.');
          setIsDeleting(false);
          return false;
        }

        const response = await fetch(`http://localhost:3001/api/orders/${orderId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          await fetchOrders();
          setIsDeleting(false);
          return true;
        } else {
          const errorData = await response.json();
          setDeleteError(errorData.message || 'Failed to delete order.');
          setIsDeleting(false);
          return false;
        }
      } catch (err: any) {
        setDeleteError(err.message || 'An unexpected error occurred during deletion.');
        setIsDeleting(false);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [fetchOrders],
  );

  const markAsDelivered = useCallback(
    async (orderId: number): Promise<boolean> => {
      setIsDelivering(true);
      setDeliverError(null);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setDeliverError('Authentication token not found. Please log in.');
          setIsDelivering(false);
          return false;
        }

        const response = await fetch(`http://localhost:3001/api/orders/${orderId}/delivered`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          await fetchOrders();
          setIsDelivering(false);
          return true;
        } else {
          const errorData = await response.json();
          setDeliverError(errorData.message || 'Failed to mark order as delivered.');
          setIsDelivering(false);
          return false;
        }
      } catch (err: any) {
        setDeliverError(err.message || 'An unexpected error occurred while marking as delivered.');
        setIsDelivering(false);
        return false;
      }
    },
    [fetchOrders],
  );

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return {
    orders,
    loading,
    error,
    fetchOrders,
    cancelOrder,
    deleteOrder,
    isCancelling,
    cancelError,
    isDeleting,
    deleteError,
    markAsDelivered,
    isDelivering,
    deliverError,
  };
}
