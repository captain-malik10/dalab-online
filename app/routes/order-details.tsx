import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import Header from '~/components/Header';
import Footer from '~/components/Footer';
import { useOrderDetails } from '~/hooks/useOrderDetails';
import { useUser } from '~/hooks/useUser';
import {
  Package,
  Calendar,
  DollarSign,
  Truck,
  ShoppingCart,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import Badge from '~/components/Badge';

// Helper component for skeleton loading
const OrderDetailsSkeleton: React.FC = () => (
  <div className="bg-white rounded shadow p-6 animate-pulse">
    <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
    <div className="h-4 bg-gray-200 rounded w-1/3 mb-6"></div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-3"></div>
        <div className="h-4 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6 mb-4"></div>
      </div>
      <div>
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-3"></div>
        <div className="h-20 bg-gray-200 rounded mb-4"></div>
      </div>
    </div>

    <div className="mt-8">
      <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex items-center space-x-4 mb-4">
          <div className="h-16 w-16 bg-gray-200 rounded"></div>
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default function OrderDetailsPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const {
    orderDetails,
    loading: orderDetailsLoading,
    error: orderDetailsError,
    refetch,
  } = useOrderDetails(orderId || '');

  const { user, loading: userLoading, error: userError } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user && !userLoading && !orderDetailsLoading) {
      navigate('/login');
    }
  }, [user, userLoading, orderDetailsLoading, navigate]);

  type BadgeState = 'info' | 'warning' | 'danger' | 'success';

  const getBadgeStateForOrderStatus = (
    status:
      | 'pending'
      | 'completed'
      | 'cancelled'
      | 'approved'
      | 'denied'
      | 'shipped'
      | 'processing'
      | 'delivered',
  ): BadgeState => {
    switch (status) {
      case 'completed':
      case 'delivered':
        return 'success';
      case 'pending':
      case 'processing':
      case 'approved':
        return 'warning';
      case 'shipped':
        return 'info';
      case 'denied':
      case 'cancelled':
        return 'danger';
      default:
        return 'info'; // Fallback
    }
  };

  const baseBreadcrumbs = {
    Home: '/',
    Orders: '/orders',
    [`Order #${orderId}`]: `/orders/${orderId}`,
  };

  const breadcrumbs = user
    ? {
        Home: '/',
        [user.name]: `/profile`,
        Orders: '/orders',
        [`Order #${orderId}`]: `/orders/${orderId}`,
      }
    : baseBreadcrumbs;

  // Error state
  if (userError || orderDetailsError) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header breadcrumbs={breadcrumbs} />
        <main className="max-w-7xl w-full mx-auto px-6 py-10">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Order Details</h2>
              <p className="text-gray-600 mb-4">{userError || orderDetailsError}</p>
              <button
                onClick={refetch}
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Loading state
  if (userLoading || orderDetailsLoading || !orderDetails) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header breadcrumbs={breadcrumbs} />
        <main className="max-w-7xl w-full mx-auto px-6 py-10">
          <OrderDetailsSkeleton />
        </main>
        <Footer />
      </div>
    );
  }

  const { order, items } = orderDetails;

  const formattedCreatedAt = new Date(order.created_at).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  const formattedUpdatedAt = new Date(order.updated_at).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header breadcrumbs={breadcrumbs} />
      <main className="max-w-7xl w-full mx-auto px-6 py-10">
        <div className="bg-white rounded shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Order Summary</h2>
              <p className="flex items-center text-gray-700 mb-2">
                <DollarSign className="mr-2 text-gray-500" size={18} />
                Total:{' '}
                <span className="font-medium ml-1 text-lg">
                  ${parseFloat(order.total).toFixed(2)}
                </span>
              </p>
              <p className="flex items-center mb-2">
                <ShoppingCart className="mr-2 text-gray-500" size={18} />
                Status:{' '}
                <Badge
                  state={getBadgeStateForOrderStatus(order.status)}
                  text={order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                />
              </p>
              <p className="flex items-center mb-2">
                {order.payment_status === 'paid' ? (
                  <CheckCircle className="mr-2 text-gray-500" size={18} />
                ) : (
                  <XCircle className="mr-2 text-gray-500" size={18} />
                )}
                Payment:{' '}
                <Badge
                  state={
                    order.payment_status === 'paid'
                      ? 'success'
                      : order.payment_status === 'pending'
                        ? 'warning'
                        : 'danger'
                  }
                  text={
                    order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)
                  }
                />
              </p>
              <p className="flex items-center text-gray-700 mb-2">
                <Calendar className="mr-2 text-gray-500" size={18} />
                Placed On: {formattedCreatedAt}
              </p>
              <p className="flex items-center text-gray-700">
                <Calendar className="mr-2 text-gray-500" size={18} />
                Last Updated: {formattedUpdatedAt}
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Shipping Address</h2>
              <p className="flex items-start text-gray-700">
                <Truck className="mr-2 mt-1 text-gray-500" size={18} />
                <span className="block">
                  {order.shipping_address.split(', ').map((line, index) => (
                    <React.Fragment key={index}>
                      {line}
                      <br />
                    </React.Fragment>
                  ))}
                </span>
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Items in Order ({items.length})
          </h2>
          <div className="space-y-4">
            {items.length > 0 ? (
              items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center border-b pb-4 last:border-b-0 last:pb-0"
                >
                  <div className="flex-shrink-0 w-20 h-20 mr-4">
                    {item.image_urls && item.image_urls.length > 0 ? (
                      <img
                        src={
                          Array.isArray(item.image_urls[0])
                            ? item.image_urls[0][0]
                            : item.image_urls[0]
                        }
                        alt={item.product_name}
                        className="w-full h-full object-cover rounded"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center text-gray-500 text-xs">
                        No Image
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <Link
                      to={`/product/${item.product_id}`}
                      className="text-lg font-medium text-blue-600 hover:underline"
                    >
                      {item.product_name}
                    </Link>
                    <p className="text-gray-600">Quantity: {item.quantity}</p>
                    <p className="text-gray-600">Price: ${parseFloat(item.price).toFixed(2)}</p>
                    <p className="text-gray-800 font-medium">
                      Subtotal: ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                    </p>
                  </div>
                  <div className="text-sm text-gray-500">
                    Vendor:{' '}
                    <Link to={`/store/${item.vendor_id}`} className="hover:underline">
                      {item.vendor_name}
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-600">No items found for this order.</p>
            )}
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link
            to="/orders"
            className="text-blue-600 hover:underline flex items-center justify-center"
          >
            <Package className="mr-2" size={18} /> Back to All Orders
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
