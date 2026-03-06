/**
 * hooks/useLocalStorage.js — Persistent State in localStorage
 *
 * HOOKS USED: useState, useCallback
 *
 * Works exactly like useState, but the value is persisted in localStorage
 * and survives page refreshes.
 *
 * USAGE:
 *   const [theme, setTheme] = useLocalStorage('theme', 'dark');
 */

import { useState, useCallback } from 'react';

export function useLocalStorage(key, initialValue) {
    // Initialize state from localStorage (or fall back to initialValue)
    const [storedValue, setStoredValue] = useState(() => {
        try {
            const item = window.localStorage.getItem(key);
            // JSON.parse handles null (missing key) by throwing, which we catch
            return item ? JSON.parse(item) : initialValue;
        } catch {
            return initialValue;
        }
    });

    // Wrapped setter: updates both React state AND localStorage
    const setValue = useCallback(
        (value) => {
            try {
                // Allow function updaters: setValue(prev => prev + 1)
                const valueToStore = value instanceof Function ? value(storedValue) : value;
                setStoredValue(valueToStore);
                window.localStorage.setItem(key, JSON.stringify(valueToStore));
            } catch (err) {
                console.warn(`useLocalStorage: failed to set "${key}"`, err);
            }
        },
        [key, storedValue]
    );

    return [storedValue, setValue];
}
