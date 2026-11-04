import React from 'react';
import { X } from 'lucide-react';

interface AdminOrderApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApprove: () => void;
  onDeny: () => void;
  orderId: number;
  customerName: string;
  total: string;
  customerPhone: string;
}

const AdminOrderApprovalModal: React.FC<AdminOrderApprovalModalProps> = ({
  isOpen,
  onClose,
  onApprove,
  onDeny,
  orderId,
  customerName,
  total,
  customerPhone,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-[var(--color-background)] text-[var(--color-foreground)] rounded shadow-xl w-full max-w-md relative p-6">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
        >
          <X size={20} />
        </button>
        <div className="text-center">
          <h3 className="text-xl font-semibold mb-2">Approve payment for {customerName}'s order</h3>
          <p className="text-gray-400 mb-1">Did you receive ${total} at</p>
          <p className="text-green-500 text-2xl font-bold mb-6">{customerPhone}</p>
          <div className="flex justify-center gap-4">
            <button
              onClick={onApprove}
              className="px-6 py-3 rounded bg-blue-600 hover:bg-blue-700 text-white font-medium flex-1"
            >
              Approve payment
            </button>
            <button
              onClick={onDeny}
              className="px-6 py-3 rounded bg-red-600 hover:bg-red-700 text-white font-medium flex-1"
            >
              Deny payment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrderApprovalModal;
