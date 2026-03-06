/**
 * hooks/useIntersectionObserver.js — Infinite Scroll / Lazy Load Hook
 *
 * HOOKS USED: useRef, useEffect, useState
 *
 * Uses the browser's IntersectionObserver API to detect when an element
 * enters the viewport. Perfect for infinite scroll or lazy loading images.
 *
 * HOW IT WORKS:
 * - Attach `ref` to a sentinel element at the bottom of a list
 * - `isIntersecting` becomes true when it scrolls into view
 * - Trigger loadMore() in response
 *
 * USAGE:
 *   const { ref, isIntersecting } = useIntersectionObserver({ threshold: 0.1 });
 *   useEffect(() => { if (isIntersecting) loadMore(); }, [isIntersecting]);
 *   <div ref={ref} /> // Sentinel element
 */

import { useRef, useEffect, useState } from 'react';

export function useIntersectionObserver({ threshold = 0.1, rootMargin = '0px' } = {}) {
    const ref = useRef(null);
    const [isIntersecting, setIsIntersecting] = useState(false);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const observer = new IntersectionObserver(
            ([entry]) => setIsIntersecting(entry.isIntersecting),
            { threshold, rootMargin }
        );

        observer.observe(element);

        // Cleanup: stop observing when component unmounts
        return () => observer.disconnect();
    }, [threshold, rootMargin]);

    return { ref, isIntersecting };
}
