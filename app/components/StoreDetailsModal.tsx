import React from 'react';
import { X, Check, FileText, X as XIcon, BadgeCheck, Building } from 'lucide-react';
import type { VendorDetails } from '~/types';

interface StoreDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  vendor: VendorDetails | null;
  onApprove: () => void;
  onDeny: () => void;
  onActivate: () => void; // New prop for activating a rejected store
  onInactivate: () => void; // New prop for inactivating an approved store
}

const DetailItem = ({ label, value }: { label: string; value: string | undefined | null }) => (
  <div>
    <p className="text-xs text-gray-500">{label}</p>
    <p className="font-medium text-gray-800">{value || 'N/A'}</p>
  </div>
);

const StoreDetailsModal: React.FC<StoreDetailsModalProps> = ({
  isOpen,
  onClose,
  vendor,
  onApprove,
  onDeny,
  onActivate,
  onInactivate,
}) => {
  if (!isOpen || !vendor) {
    return null;
  }

  const getInitials = (name: string) => {
    if (!name) return '?';
    return name.substring(0, 2).toUpperCase();
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="fixed inset-0 bg-black/10 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="p-5 border-b flex items-start justify-between">
          <div className="flex items-center">
            <div className="w-16 h-16 rounded bg-gray-100 flex items-center justify-center mr-4">
              {vendor.store.logo_url ? (
                <img
                  src={vendor.store.logo_url}
                  alt="Store Logo"
                  className="w-full h-full object-cover rounded"
                />
              ) : (
                <Building size={32} className="text-gray-400" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-gray-900">{vendor.store.store_name}</h2>
                {!!vendor.store.isVerified && <BadgeCheck size={20} className="text-green-500" />}
              </div>
              <p className="text-sm text-gray-500">{vendor.store.email}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <div className="flex flex-col gap-8">
            <div>
              <h3 className="font-semibold text-gray-800 mb-3">Store Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <DetailItem label="Status" value={vendor.store.status} />
                <DetailItem label="Country" value={vendor.store.country} />
                <DetailItem label="City" value={vendor.store.city} />
                <DetailItem label="District" value={vendor.store.district} />
                <DetailItem label="Registered" value={formatDate(vendor.store.created_at)} />
                <DetailItem label="Last Updated" value={formatDate(vendor.store.updated_at)} />
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-3">Owner Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <DetailItem label="Name" value={vendor.owner.name} />
                <DetailItem label="Email" value={vendor.owner.email} />
                <DetailItem label="Phone" value={vendor.owner.phone} />
                <DetailItem label="Role" value={vendor.owner.role} />
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-gray-50 border-t flex justify-end items-center space-x-3">
          {vendor.store.license_url && (
            <a
              href={vendor.store.license_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded shadow-sm hover:bg-gray-50"
            >
              <FileText size={16} className="mr-2" />
              <span>View Documents</span>
            </a>
          )}

          {vendor.store.status === 'pending' && (
            <>
              <button
                onClick={onDeny}
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded shadow-sm hover:bg-red-700"
              >
                <XIcon size={16} className="mr-2" />
                <span>Deny</span>
              </button>
              <button
                onClick={onApprove}
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded shadow-sm hover:bg-green-700"
              >
                <Check size={16} className="mr-2" />
                <span>Approve</span>
              </button>
            </>
          )}

          {vendor.store.status === 'approved' && (
            <button
              onClick={onInactivate}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded shadow-sm hover:bg-red-700"
            >
              <XIcon size={16} className="mr-2" />
              <span>In-activate</span>
            </button>
          )}

          {vendor.store.status === 'rejected' && (
            <button
              onClick={onActivate}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded shadow-sm hover:bg-green-700"
            >
              <Check size={16} className="mr-2" />
              <span>Activate</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default StoreDetailsModal;
