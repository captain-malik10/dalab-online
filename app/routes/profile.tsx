import React, { useEffect } from 'react';
import useApi from '../hooks/useApi';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router';
import Header from '../components/Header';
import { useUser } from '~/hooks/useUser';

interface UserProfile {
  name: string;
  email: string;
}

const ProfileSkeleton = () => (
  <div className="p-4 sm:p-6 md:p-8 bg-[var(--color-background)]">
    <div className="max-w-2xl mx-auto">
      <div className="bg-[var(--color-surface)] rounded p-6 sm:p-8 animate-pulse shadow-sm">
        <div className="flex flex-col sm:flex-row items-center sm:space-x-8">
          <div className="flex-shrink-0 w-28 h-28 sm:w-32 sm:h-32 rounded bg-[var(--color-light)] mb-6 sm:mb-0"></div>
          <div className="flex-grow text-center sm:text-left w-full">
            <div className="h-8 bg-[var(--color-light)] rounded w-3/4 mx-auto sm:mx-0"></div>
            <div className="h-6 bg-[var(--color-light)] rounded w-1/2 mx-auto sm:mx-0 mt-3"></div>
            <div className="mt-6 flex flex-col sm:flex-row justify-center sm:justify-start space-y-3 sm:space-y-0 sm:space-x-4">
              <div className="h-11 bg-[var(--color-light)] rounded w-36"></div>
              <div className="h-11 bg-[var(--color-light)] rounded w-24"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default function ProfilePage() {
  const {
    data: profileUser,
    loading: profileLoading,
    error: profileError,
  } = useApi<UserProfile>('/users/me');
  const { logout, deleteAccount, loading: authLoading, error: authError } = useAuth();
  const navigate = useNavigate();

  const { user, loading: userLoading, error: userError } = useUser();

  useEffect(() => {
    if (userError) {
      navigate('/login');
    }
  }, [userError, navigate]);

  // Function to get initials from a name
  const getInitials = (name: string) => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length > 1 && parts[parts.length - 1]) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    if (parts.length > 0 && parts[0].length > 1) {
      return name.substring(0, 2).toUpperCase();
    }
    return name.substring(0, 1).toUpperCase();
  };

  const handleDeleteAccount = async () => {
    if (
      window.confirm('Are you sure you want to delete your account? This action cannot be undone.')
    ) {
      await deleteAccount();
    }
  };

  // Render states: loading, error, or success
  if (userLoading || profileLoading) {
    return (
      <div className="bg-[var(--color-background)] min-h-screen">
        <Header
          breadcrumbs={
            user ? { Home: '/', [user.name]: '/profile', Profile: '/profile' } : undefined
          }
        />
        <ProfileSkeleton />
      </div>
    );
  }

  if (userError || profileError || !profileUser) {
    // If there's an error or no user data, we'll be redirecting.
    // Show a message until the redirect happens.
    return (
      <div className="bg-[var(--color-background)] min-h-screen">
        <Header
          breadcrumbs={
            user ? { Home: '/', [user.name]: '/profile', Profile: '/profile' } : undefined
          }
        />
        <div className="p-8 text-center h-screen flex items-center justify-center">
          Redirecting to login...
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--color-background)] min-h-screen">
      <Header breadcrumbs={user ? { Home: '/', [user.name]: '/profile' } : undefined} />
      <div className="p-4 sm:p-6 md:p-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-[var(--color-surface)] rounded p-6 sm:p-8 shadow-sm">
            {authError && (
              <div
                className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
                role="alert"
              >
                {authError}
              </div>
            )}
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded shadow-lg p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row items-center sm:space-x-8">
                <div className="flex-shrink-0 w-28 h-28 sm:w-32 sm:h-32 rounded bg-[var(--color-primary)] flex items-center justify-center mb-6 sm:mb-0">
                  <span className="text-5xl font-bold text-white">
                    {getInitials(profileUser.name)}
                  </span>
                </div>
                <div className="flex-grow text-center sm:text-left">
                  <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-dark)]">
                    {profileUser.name}
                  </h1>
                  <p className="text-md sm:text-lg text-[var(--color-muted)] mt-1">
                    {profileUser.email}
                  </p>
                  <div className="mt-6 flex flex-col sm:flex-row justify-center sm:justify-start space-y-3 sm:space-y-0 sm:space-x-4">
                    <button
                      onClick={handleDeleteAccount}
                      disabled={authLoading}
                      className="px-5 py-2.5 rounded font-semibold border-2 border-[var(--color-accent)] text-[#9A6400] hover:bg-[var(--color-accent)] hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-accent)] transition-all duration-300 ease-in-out disabled:opacity-50"
                    >
                      {authLoading ? 'Deleting...' : 'Delete Account'}
                    </button>
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
      </div>
    </div>
  );
}
