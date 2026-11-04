import { Outlet, useLocation, useNavigate } from 'react-router';
import ModernHeader from '../../components/ModernHeader';
import Sidebar from '../../components/Sidebar';
import { useEffect } from 'react';

export default function StoreLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const isStoreIndex = location.pathname === '/store';

  useEffect(() => {
    const token = localStorage.getItem('vendor_token');
    if (!token && !isStoreIndex) {
      navigate('/login');
    }
  }, [location, navigate, isStoreIndex]);

  if (isStoreIndex) {
    return <Outlet />;
  }

  return (
    <div className="flex h-screen bg-[var(--color-background)] text-[var(--color-dark)]">
      <Sidebar type="store" />
      <div className="flex-1 flex flex-col overflow-hidden">
        <ModernHeader />
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <div className="p-4">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
