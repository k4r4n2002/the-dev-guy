/**
 * hooks/useDebounce.js — Debounce Hook
 *
 * HOOKS USED: useState, useEffect
 *
 * WHY DEBOUNCE?
 * When a user types in a search box, we don't want to fire an API call on
 * every keystroke. Debouncing means we wait until the user stops typing for
 * `delay` ms before firing the request.
 *
 * HOW IT WORKS:
 * - Stores the debounced value in state
 * - On every `value` change, sets a timer to update the debounced value
 * - The cleanup function clears the timer if `value` changes again before
 *   the timer fires — this is the debounce mechanism
 *
 * USAGE:
 *   const [search, setSearch] = useState('');
 *   const debouncedSearch = useDebounce(search, 500);
 *   // Only trigger API call when debouncedSearch changes
 */

import { useState, useEffect } from 'react';

export function useDebounce(value, delay = 400) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        // Set a timer to update the debounced value after `delay` ms
        const timer = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        // Cleanup: if value changes before `delay` ms, clear the timer
        // This is THE core of debouncing
        return () => clearTimeout(timer);
    }, [value, delay]);

    return debouncedValue;
}
