/**
 * hooks/usePagination.js — Pagination State Hook
 *
 * HOOKS USED: useState, useMemo
 *
 * Manages page number state and computes derived pagination values.
 * useMemo ensures the derived values are only recalculated when inputs change.
 *
 * USAGE:
 *   const { page, totalPages, goTo, next, prev, hasPrev, hasNext }
 *     = usePagination({ total: 45, limit: 10 });
 */

import { useState, useMemo } from 'react';

export function usePagination({ total = 0, limit = 10, initialPage = 1 } = {}) {
    const [page, setPage] = useState(initialPage);

    // useMemo: only recompute when total, limit, or page changes
    const derived = useMemo(() => {
        const totalPages = Math.max(1, Math.ceil(total / limit));
        return {
            totalPages,
            hasPrev: page > 1,
            hasNext: page < totalPages,
            // Generate an array of page numbers for rendering buttons
            pageNumbers: Array.from({ length: totalPages }, (_, i) => i + 1),
        };
    }, [total, limit, page]);

    const goTo = (n) => setPage(Math.max(1, Math.min(n, derived.totalPages)));
    const next = () => goTo(page + 1);
    const prev = () => goTo(page - 1);
    const reset = () => setPage(1);

    return { page, ...derived, goTo, next, prev, reset };
}
