/**
 * hooks/useToast.js — Toast Notification Queue
 *
 * HOOKS USED: useReducer, useCallback, useRef
 *
 * Manages a queue of toast notifications. Demonstrates useReducer for
 * list state and useRef for the auto-dismiss timer.
 *
 * USAGE:
 *   const { toasts, showToast } = useToast();
 *   showToast('Post created!', 'success');
 *   showToast('Something went wrong', 'error');
 */

import { useReducer, useCallback, useRef } from 'react';

const toastReducer = (state, action) => {
    switch (action.type) {
        case 'ADD':
            return [...state, action.payload];
        case 'REMOVE':
            return state.filter((t) => t.id !== action.payload);
        default:
            return state;
    }
};

export function useToast(defaultDuration = 3500) {
    const [toasts, dispatch] = useReducer(toastReducer, []);
    // useRef for timers — we don't want timer IDs to trigger re-renders
    const timerRef = useRef({});

    const showToast = useCallback(
        (message, type = 'info') => {
            const id = `toast-${Date.now()}-${Math.random()}`;

            dispatch({ type: 'ADD', payload: { id, message, type } });

            // Auto-remove after duration
            timerRef.current[id] = setTimeout(() => {
                dispatch({ type: 'REMOVE', payload: id });
                delete timerRef.current[id];
            }, defaultDuration);
        },
        [defaultDuration]
    );

    const dismissToast = useCallback((id) => {
        clearTimeout(timerRef.current[id]);
        delete timerRef.current[id];
        dispatch({ type: 'REMOVE', payload: id });
    }, []);

    return { toasts, showToast, dismissToast };
}
