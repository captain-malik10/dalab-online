import { useState, useCallback } from 'react';
import { API_BASE } from '~/config/api';

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
}

interface Store {
  id: number;
  store_name: string;
  email: string;
  isVerified: boolean;
  country: string;
  city: string;
  logo_url: string;
  status: string;
}

interface OrderItem {
  id: number;
  product_id: number;
  name: string;
  description: string;
  quantity: number;
  price: string;
  image_urls: string[];
}

interface Delivery {
  id: number;
  order_id: number;
  tracking_number: string;
  status: string;
  delivery_address: string;
}

interface OrderDetails {
  id: number;
  total: string;
  status: 'pending' | 'completed' | 'cancelled' | 'approved' | 'denied' | 'shipped' | 'processing';
  payment_status: 'pending' | 'paid' | 'failed';
  shipping_address: string;
  created_at: string;
  updated_at: string;
}

interface Order {
  order: OrderDetails;
  customer: Customer;
  store?: Store | null;
  items?: OrderItem[];
  delivery?: Delivery | null;
}

export function useAdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/admin/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch orders');
      const data: Order[] = await res.json();
      setOrders(data);
    } catch (err: any) {
      setError(err.message || 'Error fetching orders');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchOrderById = useCallback(async (orderId: number) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/admin/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch order');
      const data: Order = await res.json();
      setCurrentOrder(data);
      return data;
    } catch (err: any) {
      setError(err.message || 'Error fetching order');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const approveOrder = useCallback(async (orderId: number) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/admin/orders/${orderId}/approve`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to approve order');
      return true;
    } catch (err: any) {
      setError(err.message || 'Error approving order');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const denyOrder = useCallback(async (orderId: number) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/admin/orders/${orderId}/deny`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to deny order');
      return true;
    } catch (err: any) {
      setError(err.message || 'Error denying order');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const assignDelivery = useCallback(async (orderId: number, trackingNumber: string) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/admin/orders/${orderId}/assign-delivery`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tracking_number: trackingNumber }),
      });
      if (!res.ok) throw new Error('Failed to assign delivery');
      return true;
    } catch (err: any) {
      setError(err.message || 'Error assigning delivery');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    orders,
    currentOrder,
    loading,
    error,
    fetchOrders,
    fetchOrderById,
    approveOrder,
    denyOrder,
    assignDelivery,
  };
}
