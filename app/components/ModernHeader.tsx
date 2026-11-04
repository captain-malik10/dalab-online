import React, { useState, useRef, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useUser } from '../hooks/useUser';
import useVendorApi from '../hooks/useVendorApi';
import type { Vendor } from '../types';
import ModernHeaderPopover from './ModernHeaderPopover';

const ModernHeader: React.FC = () => {
  const { user } = useUser();
  const { data: vendor } = useVendorApi<Vendor>('/vendors/me');
  const [isPopoverOpen, setPopoverOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = (event: MouseEvent) => {
    if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
      setPopoverOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getInitials = (name: string) => {
    if (!name) return '';
    const names = name.split(' ');
    return names
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <header className="w-full bg-[var(--color-background)] p-4 flex justify-between items-center">
      <div>
        <h1 className="text-lg font-bold">
          {user?.role === 'admin' ? 'Admin' : vendor?.store_name || 'Store Name'}
        </h1>
        {user && (
          <p className="text-sm text-[var(--color-muted)]">
            {getGreeting()}! {user.name}
          </p>
        )}
      </div>
      <div className="flex items-center space-x-4">
        {user && (
          <div className="relative" ref={popoverRef}>
            <button
              onClick={() => setPopoverOpen(!isPopoverOpen)}
              className="w-10 h-10 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white font-bold cursor-pointer"
            >
              {getInitials(user.name)}
            </button>
            <ModernHeaderPopover isOpen={isPopoverOpen} onClose={() => setPopoverOpen(false)} />
          </div>
        )}
      </div>
    </header>
  );
};

export default ModernHeader;
