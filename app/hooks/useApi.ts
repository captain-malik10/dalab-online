import { useState, useEffect, useCallback } from 'react';

const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token') || localStorage.getItem('vendor_token');
  }
  return null;
};

const useApi = <T>(url: string, options: RequestInit = {}) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const stringifiedOptions = JSON.stringify(options);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const parsedOptions = JSON.parse(stringifiedOptions);
      const token = getToken();

      // Skip API call for guest users on protected endpoints
      if (!token && (url.includes('/cart') || url.includes('/wishlist') || url.includes('/user'))) {
        setLoading(false);
        return;
      }

      if (url === '') {
        setData(null);
        setLoading(false);
        return;
      }

      const headers = {
        'Content-Type': 'application/json',
        ...parsedOptions.headers,
        ...(token && { Authorization: `Bearer ${token}` }),
      };

      const response = await fetch(`http://localhost:3001/api${url}`, {
        ...parsedOptions,
        headers,
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Silently handle 401 errors for guest users
          setLoading(false);
          return;
        }
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.indexOf('application/json') !== -1) {
          const errorData = await response.json();
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        } else {
          throw new Error(`Server returned an unexpected response. Status: ${response.status}`);
        }
      }

      const result = await response.json();
      setData(result);
    } catch (e) {
      // Only set error for non-401 errors
      if (e instanceof SyntaxError) {
        setError(new Error('Failed to parse server response. Expected JSON.'));
      } else if (e instanceof Error && !e.message.includes('401')) {
        setError(e);
      }
    } finally {
      setLoading(false);
    }
  }, [url, stringifiedOptions]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};

export default useApi;
