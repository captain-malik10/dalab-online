import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router';
import { Home, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface ModernHeaderPopoverProps {
  isOpen: boolean;
  onClose: () => void;
}

const ModernHeaderPopover: React.FC<ModernHeaderPopoverProps> = ({ isOpen, onClose }) => {
  const { logout } = useAuth();
  const popoverVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0 },
  };

  const handleLogout = (e: React.MouseEvent) => {
    e.stopPropagation();
    logout();
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
              <Link to="/" className="flex items-center space-x-2">
                <Home size={16} />
                <span>Go Home</span>
              </Link>
            </li>
            <li>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 w-full px-4 py-2 text-red-500 hover:bg-red-500/10"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </li>
          </ul>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ModernHeaderPopover;
