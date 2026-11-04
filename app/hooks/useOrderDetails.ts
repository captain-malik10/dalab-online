import { useState, useEffect, useCallback } from 'react';

interface OrderItem {
  id: number;
  quantity: number;
  price: string;
  product_id: number;
  product_name: string;
  image_urls: string[]; // Assuming this is an array of image URLs
  vendor_id: number;
  vendor_name: string;
  category_name: string;
}

interface OrderDetailsResponse {
  order: {
    id: number;
    total: string;
    status: 'pending' | 'completed' | 'cancelled' | 'approved' | 'denied' | 'shipped' | 'processing';
    payment_status: 'pending' | 'paid' | 'failed';
    shipping_address: string;
    created_at: string;
    updated_at: string;
  };
  items: OrderItem[];
}

interface UseOrderDetailsResult {
  orderDetails: OrderDetailsResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useOrderDetails(orderId: string): UseOrderDetailsResult {
  const [orderDetails, setOrderDetails] = useState<OrderDetailsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDetails = useCallback(async () => {
    if (!orderId) {
      setError('Order ID is missing.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token not found. Please log in.');
        setLoading(false);
        return;
      }

      const response = await fetch(`http://localhost:3001/api/orders/${orderId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data: OrderDetailsResponse = await response.json();
        setOrderDetails(data);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to fetch order details.');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  return {
    orderDetails,
    loading,
    error,
    refetch: fetchDetails,
  };
}
