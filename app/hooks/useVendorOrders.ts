import useVendorApi from './useVendorApi';
import type { Order } from '../types';

export const useVendorOrders = () => {
  const { data: orders, loading, error, refetch } = useVendorApi<Order[]>('/vendors/orders');
  return { orders, loading, error, refetch };
};

export const useVendorOrder = (orderId: number) => {
  const {
    data: order,
    loading,
    error,
    refetch,
  } = useVendorApi<Order>(`/vendors/orders/${orderId}`);
  return { order, loading, error, refetch };
};
