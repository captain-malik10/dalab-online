import React, { useEffect } from 'react';
import Header from '~/components/Header';
import Footer from '~/components/Footer';
import { useUserOrders } from '~/hooks/useUserOrders';
import OrderCard from '~/components/OrderCard';
import { Link, useNavigate } from 'react-router';
import { useUser } from '~/hooks/useUser';

export default function OrdersPage() {
  const {
    orders,
    loading: ordersLoading,
    error: ordersError,
    cancelOrder,
    deleteOrder,
    isCancelling,
    cancelError,
    markAsDelivered,
    isDelivering,
    deliverError,
    isDeleting,
    deleteError,
  } = useUserOrders();

  const { user, loading: userLoading, error: userError } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user && !userLoading && !ordersLoading) {
      navigate('/login');
    }
  }, [user, userLoading, ordersLoading, navigate]);

  if (userLoading || ordersLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header
          breadcrumbs={user ? { Home: '/', [user.name]: '/profile', Orders: '/orders' } : undefined}
        />
        <main className="container mx-auto px-4 py-8 min-h-screen">
          <p className="text-center text-xl text-gray-600">Loading orders...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (userError || ordersError) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header
          breadcrumbs={user ? { Home: '/', [user.name]: '/profile', Orders: '/orders' } : undefined}
        />
        <main className="container mx-auto px-4 py-8 min-h-screen">
          <p className="text-center text-xl text-red-600">Error: {userError || ordersError}</p>
        </main>
        <Footer />
      </div>
    );
  }

  const anyError = cancelError || deleteError || deliverError;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        breadcrumbs={user ? { Home: '/', [user.name]: '/profile', Orders: '/orders' } : undefined}
      />
      <main className="container mx-auto px-4 py-8 min-h-screen">
        {anyError && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
            role="alert"
          >
            <strong className="font-bold">Action Error!</strong>
            <span className="block sm:inline"> {anyError}</span>
          </div>
        )}

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600">You haven't placed any orders yet.</p>
            <Link to="/shop" className="text-blue-600 hover:underline mt-2 inline-block">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {orders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onCancelOrder={cancelOrder}
                onDeleteOrder={deleteOrder}
                onMarkAsDelivered={markAsDelivered}
                isCancelling={isCancelling}
                isDeleting={isDeleting}
                isMarking={isDelivering}
              />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
