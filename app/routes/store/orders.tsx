import React from 'react';
import Table from '~/components/Table';
import { useVendorOrders } from '~/hooks/useVendorOrders';
import type { Order } from '~/types';
import DateFormatter from '~/components/DateFormatter';
import Badge from '~/components/Badge';

export default function OrdersPage() {
  const { orders, loading, error } = useVendorOrders();

  const columns = [
    { header: 'Order ID', accessor: 'id' as keyof Order },
    { header: 'Customer Name', accessor: 'customer_name' as keyof Order },
    {
      header: 'Total',
      accessor: 'total' as keyof Order,
      Cell: ({ row }: { row: Order }) => <span>${row.total}</span>,
    },
    {
      header: 'Your Cut',
      accessor: 'store_cut' as keyof Order,
      Cell: ({ row }: { row: Order }) => <span>${row.store_cut || '0.00'}</span>,
    },
    {
      header: 'Status',
      accessor: 'status' as keyof Order,
      Cell: ({ row }: { row: Order }) => {
        const status = row.status || 'pending';
        const state =
          status === 'completed' || status === 'approved'
            ? 'success'
            : status === 'processing'
              ? 'info'
              : status === 'pending' || status === 'shipped'
                ? 'warning'
                : 'danger';
        return <Badge state={state} text={status} />;
      },
    },
    {
      header: 'Date',
      accessor: 'created_at' as keyof Order,
      Cell: ({ row }: { row: Order }) => <DateFormatter dateString={row.created_at} />,
    },
  ];

  if (loading) {
    return <div>Loading orders...</div>;
  }

  if (error) {
    return <div>Error loading orders: {error.message}</div>;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Orders</h1>
        <p className="mt-2 text-gray-600 mb-6 dark:text-gray-400">
          Manage and view your store's orders here.
        </p>
      </div>
      <Table columns={columns} data={orders || []} />
    </div>
  );
}
