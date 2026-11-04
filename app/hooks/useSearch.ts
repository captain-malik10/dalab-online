import { useState, useEffect } from 'react';
import useApi from './useApi';
import type { Product, Vendor } from '~/types';

interface SearchResult {
  products: Product[];
  stores: Vendor[];
}

export const useSearch = (query: string) => {
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300); // 300ms debounce delay

    return () => {
      clearTimeout(handler);
    };
  }, [query]);

  const {
    data: searchResults,
    loading,
    error,
    refetch,
  } = useApi<SearchResult>(debouncedQuery ? `/search?q=${debouncedQuery}` : '');

  return { searchResults, loading, error, refetch };
};
