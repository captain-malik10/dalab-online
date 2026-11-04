import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, Edit, Trash2 } from 'lucide-react';

interface AdminDeliveryActionsPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  onDetails: () => void;
  onUpdate: () => void;
  onUnassign: () => void;
}

const AdminDeliveryActionsPopover: React.FC<AdminDeliveryActionsPopoverProps> = ({
  isOpen,
  onClose,
  onDetails,
  onUpdate,
  onUnassign,
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
          className="absolute top-8 right-0 mt-2 w-48 bg-[var(--color-background)] rounded shadow-lg z-50"
          onClick={(e) => e.stopPropagation()}
        >
          <ul className="text-[var(--color-muted)]">
            <li className="px-4 py-2 hover:bg-gray-100/10">
              <button onClick={onDetails} className="flex items-center space-x-2 w-full">
                <Eye size={16} />
                <span>Details</span>
              </button>
            </li>
            <li className="px-4 py-2 hover:bg-gray-100/10">
              <button onClick={onUpdate} className="flex items-center space-x-2 w-full">
                <Edit size={16} />
                <span>Update</span>
              </button>
            </li>
            <li className="px-4 py-2 hover:bg-gray-100/10">
              <button
                onClick={onUnassign}
                className="flex items-center space-x-2 w-full text-red-500"
              >
                <Trash2 size={16} />
                <span>Unassign</span>
              </button>
            </li>
          </ul>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AdminDeliveryActionsPopover;
