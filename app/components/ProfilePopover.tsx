import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router';
import { User, Archive, Star, Store, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useUser } from '../hooks/useUser';

interface ProfilePopoverProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProfilePopover: React.FC<ProfilePopoverProps> = ({ isOpen, onClose }) => {
  const { logout } = useAuth();
  const { user } = useUser();
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
              <Link to="/profile" className="flex items-center space-x-2">
                <User size={16} />
                <span>Profile</span>
              </Link>
            </li>
            {user?.role === 'admin' && (
              <li className="px-4 py-2 hover:bg-gray-100/10">
                <Link to="/admin" className="flex items-center space-x-2">
                  <LayoutDashboard size={16} />
                  <span>Dashboard</span>
                </Link>
              </li>
            )}
            <li className="px-4 py-2 hover:bg-gray-100/10">
              <Link to="/orders" className="flex items-center space-x-2">
                <Archive size={16} />
                <span>Orders</span>
              </Link>
            </li>
            <li className="px-4 py-2 hover:bg-gray-100/10">
              <Link to="/reviews" className="flex items-center space-x-2">
                <Star size={16} />
                <span>Reviews</span>
              </Link>
            </li>
            {user?.role !== 'admin' && (
              <li className="px-4 py-2 hover:bg-gray-100/10">
                <Link to="/store" className="flex items-center space-x-2">
                  <Store size={16} />
                  <span>Store</span>
                </Link>
              </li>
            )}
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

export default ProfilePopover;
