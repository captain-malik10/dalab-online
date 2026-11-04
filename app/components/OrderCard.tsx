import React from 'react';
import {
  Package,
  Calendar,
  DollarSign,
  ShoppingCart,
  XCircle,
  Eye,
  Trash,
  CheckCircle,
} from 'lucide-react';
import { Link } from 'react-router';
import Badge from '~/components/Badge';

interface Order {
  id: number;
  total: string;
  status:
    | 'pending'
    | 'completed'
    | 'cancelled'
    | 'approved'
    | 'denied'
    | 'shipped'
    | 'processing'
    | 'delivered';
  payment_status: 'pending' | 'paid' | 'failed';
  shipping_address: string;
  created_at: string;
  updated_at: string;
  item_count: number;
}

interface OrderCardProps {
  order: Order;
  onCancelOrder: (orderId: number) => void;
  onDeleteOrder: (orderId: number) => void;
  onMarkAsDelivered: (orderId: number) => void;
  isCancelling: boolean;
  isDeleting: boolean;
  isMarking: boolean;
}

const OrderCard: React.FC<OrderCardProps> = ({
  order,
  onCancelOrder,
  onDeleteOrder,
  onMarkAsDelivered,
  isCancelling,
  isDeleting,
  isMarking,
}) => {
  const formattedDate = new Date(order.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const details = [
    {
      label: 'Placed On',
      icon: <Calendar className="text-gray-500" size={16} />,
      value: formattedDate,
    },
    {
      label: 'Total Amount',
      icon: <DollarSign className="text-gray-500" size={16} />,
      value: `$${order.total}`,
    },
    {
      label: 'Order Status',
      icon: <ShoppingCart className="text-gray-500" size={16} />,
      value: (
        <Badge
          state={
            order.status === 'completed' || order.status === 'delivered'
              ? 'success'
              : order.status === 'pending' ||
                  order.status === 'processing' ||
                  order.status === 'approved'
                ? 'warning'
                : order.status === 'shipped'
                  ? 'info'
                  : 'danger'
          }
          text={order.status.charAt(0).toUpperCase() + order.status.slice(1)}
        />
      ),
    },
    {
      label: 'Payment Status',
      icon: <DollarSign className="text-gray-500" size={16} />,
      value: (
        <Badge
          state={
            order.payment_status === 'paid'
              ? 'success'
              : order.payment_status === 'pending'
                ? 'warning'
                : 'danger'
          }
          text={order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
        />
      ),
    },
    {
      label: 'Items',
      icon: <Eye className="text-gray-500" size={16} />,
      value: <span className="font-semibold">{order.item_count}</span>,
    },
  ];

  return (
    <div className="bg-white rounded shadow-md p-6 flex flex-col justify-between h-full">
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Package className="mr-2 text-blue-600" size={20} />
          Order #{order.id}
        </h3>

        <div className="space-y-2 text-gray-700 text-sm">
          {details.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2">
              {item.icon}
              <span className="text-gray-600">{item.label}:</span>{' '}
              <span className="font-semibold">{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 flex flex-col space-y-2">
        <Link
          to={`/orders/${order.id}`}
          className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Eye className="mr-2" size={16} />
          View Details
        </Link>

        {order.status === 'pending' && (
          <button
            onClick={() => onCancelOrder(order.id)}
            disabled={isCancelling}
            className="flex items-center justify-center px-4 py-2 border border-red-600 text-sm font-medium rounded shadow-sm text-red-600 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <XCircle className="mr-2" size={16} />
            {isCancelling ? 'Cancelling...' : 'Cancel Order'}
          </button>
        )}

        {order.status === 'cancelled' && (
          <button
            onClick={() => onDeleteOrder(order.id)}
            disabled={isDeleting}
            className="flex items-center justify-center px-4 py-2 border border-red-600 text-sm font-medium rounded shadow-sm text-red-600 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash className="mr-2" size={16} />
            {isDeleting ? 'Deleting...' : 'Delete Order'}
          </button>
        )}

        {order.status === 'shipped' && (
          <button
            onClick={() => onMarkAsDelivered(order.id)}
            disabled={isMarking}
            className="flex items-center justify-center px-4 py-2 border border-green-600 text-sm font-medium rounded shadow-sm text-green-600 bg-white hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckCircle className="mr-2" size={16} />
            {isMarking ? 'Marking...' : 'Mark as Delivered'}
          </button>
        )}
      </div>
    </div>
  );
};

export default OrderCard;
