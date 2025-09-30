/**
 * useFilterAPI: Hook for handling API requests with filters
 */

import { useState, useCallback } from 'react';
import type { FilterRoot, APIConfig } from '../types';
import { sendFilter, buildFilterUrl } from '../core/api';

interface UseFilterAPIReturn {
  loading: boolean;
  error: Error | null;
  data: unknown;
  send: (filter: FilterRoot, config: APIConfig) => Promise<void>;
  buildUrl: (filter: FilterRoot, baseUrl: string, paramName?: string) => string;
  reset: () => void;
}

export function useFilterAPI(): UseFilterAPIReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<unknown>(null);

  const send = useCallback(async (filter: FilterRoot, config: APIConfig) => {
    setLoading(true);
    setError(null);

    try {
      const result = await sendFilter(filter, config);
      setData(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setData(null);
  }, []);

  return {
    loading,
    error,
    data,
    send,
    buildUrl: buildFilterUrl,
    reset,
  };
}