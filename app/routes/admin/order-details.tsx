import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { useAdminOrders } from '~/hooks/useAdminOrders';
import { useDateFormatter } from '~/hooks/useDateFormatter';
import InfoSection from '~/components/InfoSection';

export default function AdminOrderDetailsPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const { currentOrder, loading, error, fetchOrderById } = useAdminOrders();

  useEffect(() => {
    if (orderId) {
      fetchOrderById(parseInt(orderId));
    }
  }, [orderId, fetchOrderById]);

  const createdAt = useDateFormatter(currentOrder?.order?.created_at || '');
  const updatedAt = useDateFormatter(currentOrder?.order?.updated_at || '');

  if (loading) {
    return <p>Loading order details...</p>;
  }

  if (error) {
    return <p className="text-red-500">Error: {error}</p>;
  }

  if (!currentOrder) {
    return <p>Order not found.</p>;
  }

  const orderInfoData = [
    { label: 'Total', value: `$${currentOrder.order.total}` },
    { label: 'Status', value: currentOrder.order.status },
    { label: 'Payment Status', value: currentOrder.order.payment_status },
    { label: 'Shipping Address', value: currentOrder.order.shipping_address },
    { label: 'Created At', value: createdAt },
    { label: 'Last Updated', value: updatedAt },
  ];

  const customerInfoData = currentOrder.customer
    ? [
        { label: 'Name', value: currentOrder.customer.name },
        { label: 'Email', value: currentOrder.customer.email },
        { label: 'Phone', value: currentOrder.customer.phone },
      ]
    : [];

  const storeInfoData = currentOrder.store
    ? [
        { label: 'Store Name', value: currentOrder.store.store_name },
        { label: 'Store Email', value: currentOrder.store.email },
        {
          label: 'Verified',
          value: currentOrder.store.isVerified ? 'Yes' : 'No',
        },
        {
          label: 'Location',
          value: `${currentOrder.store.city}, ${currentOrder.store.country}`,
        },
        { label: 'Status', value: currentOrder.store.status },
      ]
    : [];

  const deliveryInfoData = currentOrder.delivery
    ? [
        {
          label: 'Tracking Number',
          value: currentOrder.delivery.tracking_number,
        },
        { label: 'Status', value: currentOrder.delivery.status },
        {
          label: 'Delivery Address',
          value: currentOrder.delivery.delivery_address,
        },
      ]
    : [];

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Order Details #{currentOrder.order.id}</h2>

      <InfoSection title="Order Information" data={orderInfoData} />

      {currentOrder.customer && (
        <InfoSection title="Customer Information" data={customerInfoData} />
      )}

      {currentOrder.store && <InfoSection title="Store Information" data={storeInfoData} />}

      {currentOrder.delivery &&
        (currentOrder.order.status === 'shipped' || currentOrder.order.status === 'completed') && (
          <InfoSection title="Delivery Information" data={deliveryInfoData} />
        )}

      {currentOrder.items && currentOrder.items.length > 0 && (
        <div className="bg-white shadow rounded p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Order Items</h3>
          <div className="space-y-4">
            {currentOrder.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center space-x-4 border-b pb-4 last:border-b-0"
              >
                <img
                  src={item.image_urls[0]}
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded"
                />
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p>Quantity: {item.quantity}</p>
                  <p>Price: ${item.price}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Link to="/admin/orders" className="text-blue-600 hover:underline mt-4 inline-block">
        &larr; Back to All Orders
      </Link>
    </div>
  );
}
