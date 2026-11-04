import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, CheckCircle, XCircle, Truck } from 'lucide-react';

interface AdminOrderActionsPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  onDetails: () => void;
  onApprove: () => void;
  onDeny: () => void;
  onAssignDelivery: () => void;
  orderStatus: string;
}

const AdminOrderActionsPopover: React.FC<AdminOrderActionsPopoverProps> = ({
  isOpen,
  onClose,
  onDetails,
  onApprove,
  onDeny,
  onAssignDelivery,
  orderStatus,
}) => {
  const popoverVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={popoverVariants}
          transition={{ duration: 0.2 }}
          className="absolute top-12 right-0 mt-2 w-48 bg-[var(--color-background)] rounded shadow-lg z-50"
          onClick={onClose}
        >
          <ul className="text-[var(--color-muted)]">
            <li className="px-4 py-2 hover:bg-gray-100/10">
              <button onClick={onDetails} className="flex items-center space-x-2 w-full">
                <Eye size={16} />
                <span>Details</span>
              </button>
            </li>
            {orderStatus === 'pending' && (
              <>
                <li className="px-4 py-2 hover:bg-green-500/10">
                  <button
                    onClick={onApprove}
                    className="flex items-center space-x-2 w-full text-green-500"
                  >
                    <CheckCircle size={16} />
                    <span>Approve</span>
                  </button>
                </li>
                <li className="px-4 py-2 hover:bg-red-500/10">
                  <button
                    onClick={onDeny}
                    className="flex items-center space-x-2 w-full text-red-500"
                  >
                    <XCircle size={16} />
                    <span>Deny</span>
                  </button>
                </li>
              </>
            )}
            {orderStatus === 'processing' && (
              <li className="px-4 py-2 hover:bg-blue-500/10">
                <button
                  onClick={onAssignDelivery}
                  className="flex items-center space-x-2 w-full text-blue-500"
                >
                  <Truck size={16} />
                  <span>Assign Delivery</span>
                </button>
              </li>
            )}
            {orderStatus === 'shipped' && (
              <li className="px-4 py-2 hover:bg-blue-500/10">
                <button
                  onClick={onAssignDelivery}
                  className="flex items-center space-x-2 w-full text-blue-500"
                >
                  <Truck size={16} />
                  <span>Update Delivery</span>
                </button>
              </li>
            )}
          </ul>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AdminOrderActionsPopover;
