import React from 'react';
import { useNavigate } from 'react-router';
import useVendorApi from '../../hooks/useVendorApi';
import { useVendorAuth } from '../../hooks/useVendorAuth';

interface StoreProfile {
  store_name: string;
  email: string;
  description: string | null;
  location: string | null;
  logo_url: string | null;
}

const StoreSettingsSkeleton = () => (
  <div className="p-4 sm:p-6 md:p-8">
    <div className="max-w-4xl mx-auto">
      <div className="bg-[var(--color-surface)] rounded p-6 sm:p-8 animate-pulse shadow-sm">
        <div className="flex flex-col sm:flex-row items-center sm:space-x-8">
          <div className="flex-shrink-0 w-full sm:w-1/3 h-40 sm:h-auto rounded bg-[var(--color-light)] mb-6 sm:mb-0"></div>
          <div className="flex-grow text-center sm:text-left w-full">
            <div className="h-8 bg-[var(--color-light)] rounded w-3/4 mx-auto sm:mx-0"></div>
            <div className="h-6 bg-[var(--color-light)] rounded w-1/2 mx-auto sm:mx-0 mt-3"></div>
            <div className="h-6 bg-[var(--color-light)] rounded w-2/3 mx-auto sm:mx-0 mt-2"></div>
            <div className="mt-6 flex flex-col sm:flex-row justify-center sm:justify-start space-y-3 sm:space-y-0 sm:space-x-4">
              <div className="h-11 bg-[var(--color-light)] rounded w-24"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default function SettingsPage() {
  const { data: store, loading, error } = useVendorApi<StoreProfile>('/vendors/me');
  const { logout, loading: authLoading } = useVendorAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (error) {
      navigate('/store');
    }
  }, [error, navigate]);

  const getStoreInitials = (name: string) => {
    if (!name) return 'S';
    return name.substring(0, 1).toUpperCase();
  };

  if (loading) {
    return <StoreSettingsSkeleton />;
  }

  if (error || !store) {
    return (
      <div className="p-8 text-center h-screen flex items-center justify-center">
        Redirecting to login...
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Store Settings</h2>
      <div className="w-full mx-auto">
        <div className="bg-[var(--color-surface)] rounded p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row items-stretch sm:space-x-8">
            <div className="flex-shrink-0 w-1/6 rounded bg-[var(--color-primary)] flex items-center justify-center overflow-hidden">
              {store.logo_url ? (
                <img
                  src={store.logo_url}
                  alt={`${store.store_name} logo`}
                  className="w-full h-full object-cover rounded"
                />
              ) : (
                <span className="text-6xl font-bold text-white">
                  {getStoreInitials(store.store_name)}
                </span>
              )}
            </div>
            <div className="flex-grow text-center sm:text-left flex flex-col justify-center mt-6 sm:mt-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-dark)]">
                {store.store_name}
              </h1>
              <p className="text-md sm:text-lg text-[var(--color-muted)] mt-1">{store.email}</p>
              {store.description && (
                <p className="text-md text-[var(--color-dark)] mt-2">{store.description}</p>
              )}
              {store.location && (
                <p className="text-sm text-[var(--color-muted)] mt-1">Location: {store.location}</p>
              )}
              <div className="mt-6 flex flex-col sm:flex-row justify-center sm:justify-start space-y-3 sm:space-y-0 sm:space-x-4">
                <button
                  onClick={logout}
                  disabled={authLoading}
                  className="px-5 py-2.5 rounded font-semibold bg-[var(--color-accent)] text-[var(--color-dark)] hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-accent)] transition-opacity duration-300 disabled:opacity-50"
                >
                  {authLoading ? 'Logging out...' : 'Logout'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
