import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '~/api';
import type { User } from '~/types'; // Assuming User type is defined here

interface UseUserReturn {
  user: User | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useUser(): UseUserReturn {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserDetails = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      setUser(null);
      setError('No authentication token found.'); // Added this line
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data: User = await apiClient('/users/me');
      setUser(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch user details.');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserDetails();
  }, [fetchUserDetails]);

  return {
    user,
    loading,
    error,
    refetch: fetchUserDetails,
  };
}
