import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, Trash2 } from 'lucide-react';

interface AdminProductActionsPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  onDetails: () => void;
  onDelete: () => void;
}

const AdminProductActionsPopover: React.FC<AdminProductActionsPopoverProps> = ({
  isOpen,
  onClose,
  onDetails,
  onDelete,
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
            <li className="px-4 py-2 hover:bg-red-500/10">
              <button
                onClick={onDelete}
                className="flex items-center space-x-2 w-full text-red-500"
              >
                <Trash2 size={16} />
                <span>Delete</span>
              </button>
            </li>
          </ul>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AdminProductActionsPopover;
