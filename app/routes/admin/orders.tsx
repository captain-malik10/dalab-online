import React, { useState, useCallback, useEffect } from 'react';
import { useAdminOrders } from '~/hooks/useAdminOrders';
import { useNavigate } from 'react-router';
import { EllipsisVertical } from 'lucide-react';
import AdminOrderActionsPopover from '~/components/AdminOrderActionsPopover';
import Table from '~/components/Table';
import InputModal from '~/components/InputModal';
import AdminOrderApprovalModal from '~/components/AdminOrderApprovalModal';
import { useDateFormatter } from '~/hooks/useDateFormatter';
import Badge from '~/components/Badge';

export default function AdminOrdersPage() {
  const { orders, loading, error, fetchOrders, approveOrder, denyOrder, assignDelivery } =
    useAdminOrders();
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const [popoverOpenId, setPopoverOpenId] = useState<number | null>(null);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [selectedOrderForApproval, setSelectedOrderForApproval] = useState<any | null>(null);
  const [isAssignDeliveryModalOpen, setIsAssignDeliveryModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [trackingNumber, setTrackingNumber] = useState<string>('');
  const [assignDeliveryError, setAssignDeliveryError] = useState<string | null>(null);

  const handleOpenPopover = (orderId: number) => {
    setPopoverOpenId(orderId);
  };

  const handleClosePopover = () => {
    setPopoverOpenId(null);
  };

  const handleDetails = (orderId: number) => {
    navigate(`/admin/orders/${orderId}`);
    handleClosePopover();
  };

  const handleApproveClick = (order: any) => {
    setSelectedOrderForApproval(order);
    setIsApprovalModalOpen(true);
    handleClosePopover();
  };

  const handleDenyClick = (order: any) => {
    setSelectedOrderForApproval(order);
    setIsApprovalModalOpen(true);
    handleClosePopover();
  };

  const handleApproveAction = async () => {
    if (selectedOrderForApproval) {
      const success = await approveOrder(selectedOrderForApproval.id);
      if (success) {
        fetchOrders();
      }
      setIsApprovalModalOpen(false);
      setSelectedOrderForApproval(null);
    }
  };

  const handleDenyAction = async () => {
    if (selectedOrderForApproval) {
      const success = await denyOrder(selectedOrderForApproval.id);
      if (success) {
        fetchOrders();
      }
      setIsApprovalModalOpen(false);
      setSelectedOrderForApproval(null);
    }
  };

  const handleAssignDeliveryClick = (orderId: number) => {
    setSelectedOrderId(orderId);
    setIsAssignDeliveryModalOpen(true);
    handleClosePopover();
  };

  const handleAssignDeliverySubmit = useCallback(async () => {
    if (!selectedOrderId || !trackingNumber) {
      setAssignDeliveryError('Tracking number is required.');
      return;
    }
    setAssignDeliveryError(null);

    const success = await assignDelivery(selectedOrderId, trackingNumber);
    if (success) {
      fetchOrders();
      setIsAssignDeliveryModalOpen(false);
      setTrackingNumber('');
    } else {
      setAssignDeliveryError('Failed to assign delivery. Please try again.');
    }
  }, [selectedOrderId, trackingNumber, assignDelivery, fetchOrders]);

  console.log('AdminOrdersPage - Loading:', loading);
  console.log('AdminOrdersPage - Error:', error);
  console.log('AdminOrdersPage - Orders:', orders);

  if (loading) {
    return <p>Loading orders...</p>;
  }

  if (error) {
    return (
      <p className="text-red-500">
        Error: {(error as any) instanceof Error ? (error as any).message : error}
      </p>
    );
  }

  const columns = [
    { header: 'Order ID', accessor: 'id' },
    { header: 'Customer Name', accessor: 'customer.name' },
    {
      header: 'Total',
      accessor: 'total',
      Cell: ({ value }: { value: string }) => <span>${value}</span>,
    },
    {
      header: 'Status',
      accessor: 'status',
      Cell: ({ value }: { value: string }) => {
        const state =
          value === 'delivered' || value === 'completed'
            ? 'success'
            : value === 'shipped'
              ? 'info'
              : value === 'processing' || value === 'pending'
                ? 'warning'
                : 'danger';
        return <Badge state={state} text={value} />;
      },
    },
    {
      header: 'Payment Status',
      accessor: 'payment_status',
      Cell: ({ value }: { value: string }) => {
        const state = value === 'paid' ? 'success' : value === 'pending' ? 'warning' : 'danger';
        return <Badge state={state} text={value} />;
      },
    },
    {
      header: 'Created At',
      accessor: 'created_at',
      Cell: ({ value }: { value: string }) => {
        const formattedDate = useDateFormatter(value);
        return <span>{formattedDate}</span>;
      },
    },
    {
      header: 'Actions',
      accessor: 'actions',
      Cell: ({ row }: { row: any }) => (
        <div className="relative">
          <EllipsisVertical className="cursor-pointer" onClick={() => handleOpenPopover(row.id)} />
          <AdminOrderActionsPopover
            isOpen={popoverOpenId === row.id}
            onClose={handleClosePopover}
            onDetails={() => handleDetails(row.id)}
            onApprove={() => handleApproveClick(row)}
            onDeny={() => handleDenyClick(row)}
            onAssignDelivery={() => handleAssignDeliveryClick(row.id)}
            orderStatus={row.status}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="">
      <h1 className="text-2xl font-bold">Admin Orders</h1>
      <p className="mt-2 text-gray-600 mb-6">Here you can manage all the orders on the platform.</p>
      <Table columns={columns} data={orders || []} noDataMessage="No orders found" />

      {selectedOrderForApproval && (
        <AdminOrderApprovalModal
          isOpen={isApprovalModalOpen}
          onClose={() => setIsApprovalModalOpen(false)}
          onApprove={handleApproveAction}
          onDeny={handleDenyAction}
          orderId={selectedOrderForApproval.id}
          customerName={selectedOrderForApproval.customer.name}
          total={selectedOrderForApproval.total}
          customerPhone={selectedOrderForApproval.customer.phone}
        />
      )}

      <InputModal
        isOpen={isAssignDeliveryModalOpen}
        onClose={() => setIsAssignDeliveryModalOpen(false)}
        onConfirm={handleAssignDeliverySubmit}
        title="Assign Delivery"
        message="Enter the tracking number (phone number) for delivery:"
        inputValue={trackingNumber}
        onInputChange={setTrackingNumber}
        placeholder="Tracking Number (Phone Number)"
        error={assignDeliveryError}
        inputType="text"
      />
    </div>
  );
}
