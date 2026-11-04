import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { EllipsisVertical } from 'lucide-react';
import { useAdminDeliveries, type Delivery } from '~/hooks/useAdminDeliveries';
import Table, { type Column } from '~/components/Table';
import InputModal from '~/components/InputModal';
import ConfirmationModal from '~/components/ConfirmationModal';
import AdminDeliveryActionsPopover from '~/components/AdminDeliveryActionsPopover';
import Badge from '~/components/Badge';

export default function DeliveriesPage() {
  const { deliveries, loading, error, fetchDeliveries, updateTrackingNumber, unassignDelivery } =
    useAdminDeliveries();
  const navigate = useNavigate();

  const [popoverOpenId, setPopoverOpenId] = useState<number | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isUnassignModalOpen, setIsUnassignModalOpen] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [updateError, setUpdateError] = useState<string | null>(null);

  useEffect(() => {
    fetchDeliveries();
  }, [fetchDeliveries]);

  const handleOpenPopover = (deliveryId: number) => {
    setPopoverOpenId(deliveryId);
  };

  const handleClosePopover = () => {
    setPopoverOpenId(null);
  };

  const handleDetails = (orderId: number) => {
    navigate(`/admin/orders/${orderId}`);
    handleClosePopover();
  };

  const handleUpdateClick = (delivery: Delivery) => {
    setSelectedDelivery(delivery);
    setTrackingNumber(delivery.tracking_number);
    setIsUpdateModalOpen(true);
    handleClosePopover();
  };

  const handleUnassignClick = (delivery: Delivery) => {
    setSelectedDelivery(delivery);
    setIsUnassignModalOpen(true);
    handleClosePopover();
  };

  const handleUpdateSubmit = useCallback(async () => {
    if (!selectedDelivery || !trackingNumber) {
      setUpdateError('Tracking number is required.');
      return;
    }
    setUpdateError(null);

    const success = await updateTrackingNumber(selectedDelivery.id, trackingNumber);
    if (success) {
      setIsUpdateModalOpen(false);
      setSelectedDelivery(null);
      setTrackingNumber('');
    } else {
      setUpdateError('Failed to update tracking number. Please try again.');
    }
  }, [selectedDelivery, trackingNumber, updateTrackingNumber]);

  const handleUnassignConfirm = useCallback(async () => {
    if (selectedDelivery) {
      const success = await unassignDelivery(selectedDelivery.id);
      if (success) {
        setIsUnassignModalOpen(false);
        setSelectedDelivery(null);
      }
    }
  }, [selectedDelivery, unassignDelivery]);

  const columns: Column<Delivery>[] = [
    { header: 'Order ID', accessor: 'order_id' },
    { header: 'Tracking Number', accessor: 'tracking_number' },
    {
      header: 'Status',
      accessor: 'status',
      Cell: ({ value }: { value: string }) => {
        const state =
          value === 'delivered'
            ? 'success'
            : value === 'shipped'
              ? 'warning'
              : value === 'pending'
                ? 'warning'
                : 'danger';
        return <Badge state={state} text={value} />;
      },
    },
    { header: 'Customer Name', accessor: 'customer_name' },
    { header: 'Delivery Address', accessor: 'delivery_address' },
    {
      header: 'Actions',
      accessor: 'id',
      Cell: ({ row }: { row: Delivery }) => (
        <div className="relative">
          <EllipsisVertical className="cursor-pointer" onClick={() => handleOpenPopover(row.id)} />
          <AdminDeliveryActionsPopover
            isOpen={popoverOpenId === row.id}
            onClose={handleClosePopover}
            onDetails={() => handleDetails(row.order_id)}
            onUpdate={() => handleUpdateClick(row)}
            onUnassign={() => handleUnassignClick(row)}
          />
        </div>
      ),
    },
  ];

  if (loading) return <p>Loading deliveries...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold">Deliveries</h1>
      <p className="mt-2 text-gray-600 mb-6">
        Here you can manage all the deliveries on the platform.
      </p>
      <div className="mt-4">
        <Table columns={columns} data={deliveries} noDataMessage="No deliveries found" />
      </div>

      {selectedDelivery && (
        <>
          <InputModal
            isOpen={isUpdateModalOpen}
            onClose={() => setIsUpdateModalOpen(false)}
            onConfirm={handleUpdateSubmit}
            title="Update Tracking Number"
            message={`Update the tracking number for order #${selectedDelivery.order_id}:`}
            inputValue={trackingNumber}
            onInputChange={setTrackingNumber}
            placeholder="Tracking Number"
            error={updateError}
            inputType="text"
          />
          <ConfirmationModal
            isOpen={isUnassignModalOpen}
            onClose={() => setIsUnassignModalOpen(false)}
            onConfirm={handleUnassignConfirm}
            title="Unassign Delivery"
            message={`Are you sure you want to unassign the delivery for order #${selectedDelivery.order_id}? This will move the order back to 'processing'.`}
          />
        </>
      )}
    </div>
  );
}
