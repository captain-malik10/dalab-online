import React, { useState, useEffect } from 'react';
import { useAdminVendors } from '~/hooks/useAdminVendors';
import { useNavigate } from 'react-router';
import { EllipsisVertical } from 'lucide-react';
import AdminStoreActionsPopover from '~/components/AdminStoreActionsPopover';
import StoreDetailsModal from '~/components/StoreDetailsModal';
import Table from '~/components/Table';
import { useDateFormatter } from '~/hooks/useDateFormatter';
import type { Vendor, VendorDetails } from '~/types';
import Badge from '~/components/Badge';

// Create a dedicated component for the date cell to correctly use the hook
const DateCell = ({ value }: { value: string }) => {
  const formattedDate = useDateFormatter(value);
  return <span>{formattedDate}</span>;
};

export default function AdminStoresPage() {
  const { vendors, loading, error, fetchVendors, approveVendor, denyVendor, fetchVendorDetails } =
    useAdminVendors();
  const navigate = useNavigate();

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<VendorDetails | null>(null);

  const handleDetails = async (vendorId: number) => {
    const details = await fetchVendorDetails(vendorId);
    if (details) {
      setSelectedVendor(details);
      setIsModalOpen(true);
    }
  };

  const handleApprove = async (vendorId: number) => {
    await approveVendor(vendorId);
    if (isModalOpen) {
      setIsModalOpen(false);
      fetchVendors();
    }
  };

  const handleDeny = async (vendorId: number) => {
    await denyVendor(vendorId);
    if (isModalOpen) {
      setIsModalOpen(false);
      fetchVendors();
    }
  };

  const handleActivate = async (vendorId: number) => {
    await approveVendor(vendorId);
    setIsModalOpen(false);
    fetchVendors();
  };

  const handleInactivate = async (vendorId: number) => {
    await denyVendor(vendorId);
    setIsModalOpen(false);
    fetchVendors();
  };

  if (loading) {
    return <p>Loading stores...</p>;
  }

  if (error) {
    return <p className="text-red-500">Error: {error.message}</p>;
  }

  const columns = [
    { header: 'ID', accessor: 'id' },
    { header: 'Store Name', accessor: 'store_name' },
    { header: 'Email', accessor: 'email' },
    {
      header: 'Status',
      accessor: 'status',
      Cell: ({ value }: { value: string }) => {
        const state =
          value === 'approved' || value === 'active'
            ? 'success'
            : value === 'pending'
              ? 'warning'
              : 'danger';
        return <Badge state={state} text={value} />;
      },
    },
    {
      header: 'Total Income',
      accessor: 'total_income',
      Cell: ({ value }: { value: string | number }) => (
        <span>${parseFloat(String(value || 0)).toFixed(2)}</span>
      ),
    },
    {
      header: 'Verified',
      accessor: 'isVerified',
      Cell: ({ value }: { value: boolean }) => (value ? 'Yes' : 'No'),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      Cell: ({ row }: { row: Vendor }) => (
        <div className="relative">
          <EllipsisVertical
            className="cursor-pointer"
            onClick={() => row.id && handleDetails(row.id)}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="">
      <h1 className="text-2xl font-bold">Admin Stores</h1>
      <p className="mt-2 text-gray-600 mb-6">
        Here you can manage all the vendor stores on the platform.
      </p>
      <Table columns={columns} data={vendors || []} noDataMessage="No stores found" />

      <StoreDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        vendor={selectedVendor}
        onApprove={() => selectedVendor?.store.id && handleApprove(selectedVendor.store.id)}
        onDeny={() => selectedVendor?.store.id && handleDeny(selectedVendor.store.id)}
        onActivate={() => selectedVendor?.store.id && handleActivate(selectedVendor.store.id)}
        onInactivate={() => selectedVendor?.store.id && handleInactivate(selectedVendor.store.id)}
      />
    </div>
  );
}
