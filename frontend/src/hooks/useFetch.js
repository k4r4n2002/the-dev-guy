/**
 * hooks/useFetch.js — Data Fetching Hook
 *
 * HOOKS USED: useState, useEffect, useCallback, useRef
 *
 * CONCEPTS:
 * - Manages loading, error, and data states for any async operation
 * - Uses AbortController to cancel in-flight requests when the component
 *   unmounts (prevents the React "memory leak on unmounted component" warning)
 * - The `refetch` function lets callers manually trigger a re-fetch
 *
 * USAGE:
 *   const { data, loading, error, refetch } = useFetch(() => postsApi.getAll({ page: 1 }));
 */

import { useState, useEffect, useCallback, useRef } from 'react';

export function useFetch(fetchFn, deps = []) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // useRef to hold the AbortController — we don't want changes to it to
    // trigger re-renders, so a ref is perfect here
    const abortControllerRef = useRef(null);

    const execute = useCallback(async () => {
        // Cancel any previous in-flight request
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        // Create a new AbortController for this request
        abortControllerRef.current = new AbortController();

        setLoading(true);
        setError(null);

        try {
            const result = await fetchFn({ signal: abortControllerRef.current.signal });
            setData(result.data);
        } catch (err) {
            // Ignore abort errors (they're not real errors — cleanup)
            if (err.name !== 'CanceledError' && err.name !== 'AbortError') {
                setError(err.message || 'Something went wrong');
            }
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);

    useEffect(() => {
        execute();

        // Cleanup: abort the request when the component unmounts
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [execute]);

    return { data, loading, error, refetch: execute };
}
