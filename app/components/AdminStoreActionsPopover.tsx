import React from 'react';

interface AdminStoreActionsPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  onDetails: () => void;
  onApprove: () => void;
  onDeny: () => void;
  vendorStatus: string;
}

export default function AdminStoreActionsPopover({
  isOpen,
  onClose,
  onDetails,
  onApprove,
  onDeny,
  vendorStatus,
}: AdminStoreActionsPopoverProps) {
  if (!isOpen) return null;

  return (
    <div
      className="absolute right-0 mt-2 w-48 bg-white rounded shadow-lg z-10 border border-gray-200"
      onMouseLeave={onClose} // Close when mouse leaves the popover
    >
      <ul className="py-1">
        <li>
          <button
            onClick={onDetails}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            View Details
          </button>
        </li>
        {vendorStatus === 'pending' && (
          <>
            <li>
              <button
                onClick={onApprove}
                className="w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-gray-100"
              >
                Approve
              </button>
            </li>
            <li>
              <button
                onClick={onDeny}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
              >
                Deny
              </button>
            </li>
          </>
        )}
      </ul>
    </div>
  );
}
