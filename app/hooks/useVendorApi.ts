import { useState, useEffect, useCallback } from 'react';
import { API_BASE } from '~/config/api';

const getVendorToken = () => localStorage.getItem('vendor_token');

const useVendorApi = <T>(url: string, options: RequestInit = {}) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Stringify options to create a stable dependency for useCallback.
  const stringifiedOptions = JSON.stringify(options);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const parsedOptions = JSON.parse(stringifiedOptions);
      const token = getVendorToken();
      const headers = {
        'Content-Type': 'application/json',
        ...parsedOptions.headers,
        ...(token && { Authorization: `Bearer ${token}` }),
      };

      const response = await fetch(`${API_BASE}${url}`, {
        ...parsedOptions,
        headers,
      });

      if (!response.ok) {
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
      if (e instanceof SyntaxError) {
        setError(new Error('Failed to parse server response. Expected JSON.'));
      } else {
        setError(e as Error);
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

export default useVendorApi;
