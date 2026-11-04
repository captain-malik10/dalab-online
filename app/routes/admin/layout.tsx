import { Outlet, useNavigate } from 'react-router';
import ModernHeader from '../../components/ModernHeader';
import Sidebar from '../../components/Sidebar';
import { useEffect } from 'react';
import { useUser } from '~/hooks/useUser';

export default function AdminLayout() {
  const navigate = useNavigate();
  const { user, loading } = useUser();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    if (!loading && user && user.role !== 'admin') {
      navigate('/');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return <p>Loading...</p>;
  }

  return user && user.role === 'admin' ? (
    <div className="flex h-screen bg-[var(--color-background)] text-[var(--color-dark)]">
      <Sidebar type="admin" />
      <div className="flex-1 flex flex-col overflow-hidden">
        <ModernHeader />
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <div className="p-4">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  ) : null;
}
