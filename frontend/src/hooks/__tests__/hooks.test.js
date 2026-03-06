/**
 * frontend/src/hooks/__tests__/hooks.test.js
 *
 * Unit tests for custom hooks using Vitest + React Testing Library.
 *
 * Run: npm test  (from the frontend/ directory)
 */

import { renderHook, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useDebounce } from '../useDebounce';
import { usePagination } from '../usePagination';
import { useLocalStorage } from '../useLocalStorage';

// ── useDebounce ──────────────────────────────────────────────────────────
describe('useDebounce', () => {
    beforeEach(() => { vi.useFakeTimers(); });
    afterEach(() => { vi.useRealTimers(); });

    it('returns the initial value immediately', () => {
        const { result } = renderHook(() => useDebounce('hello', 300));
        expect(result.current).toBe('hello');
    });

    it('does not update before the delay has elapsed', () => {
        const { result, rerender } = renderHook(
            ({ value }) => useDebounce(value, 300),
            { initialProps: { value: 'hello' } }
        );

        rerender({ value: 'world' });
        act(() => { vi.advanceTimersByTime(200); }); // only 200ms, not 300ms

        expect(result.current).toBe('hello'); // still old value
    });

    it('updates to the latest value after the delay', () => {
        const { result, rerender } = renderHook(
            ({ value }) => useDebounce(value, 300),
            { initialProps: { value: 'hello' } }
        );

        rerender({ value: 'world' });
        act(() => { vi.advanceTimersByTime(300); });

        expect(result.current).toBe('world');
    });

    it('only fires once for rapid successive changes (debounce behaviour)', () => {
        const { result, rerender } = renderHook(
            ({ value }) => useDebounce(value, 300),
            { initialProps: { value: 'a' } }
        );

        rerender({ value: 'ab' });
        act(() => { vi.advanceTimersByTime(100); });
        rerender({ value: 'abc' });
        act(() => { vi.advanceTimersByTime(100); });
        rerender({ value: 'abcd' });
        act(() => { vi.advanceTimersByTime(300); }); // now the timer fires

        expect(result.current).toBe('abcd'); // only the last value
    });
});

// ── usePagination ────────────────────────────────────────────────────────
describe('usePagination', () => {
    it('starts on page 1 with correct total pages', () => {
        const { result } = renderHook(() =>
            usePagination({ total: 45, limit: 10 })
        );

        expect(result.current.page).toBe(1);
        expect(result.current.totalPages).toBe(5);
    });

    it('hasPrev is false on page 1, true on page 2', () => {
        const { result } = renderHook(() =>
            usePagination({ total: 30, limit: 10 })
        );

        expect(result.current.hasPrev).toBe(false);

        act(() => { result.current.next(); });
        expect(result.current.hasPrev).toBe(true);
    });

    it('hasNext is false on the last page', () => {
        const { result } = renderHook(() =>
            usePagination({ total: 10, limit: 10 })
        );

        expect(result.current.hasNext).toBe(false);
    });

    it('goTo clamps to valid page range', () => {
        const { result } = renderHook(() =>
            usePagination({ total: 30, limit: 10 })
        );

        act(() => { result.current.goTo(0); });  // below min
        expect(result.current.page).toBe(1);

        act(() => { result.current.goTo(999); }); // above max
        expect(result.current.page).toBe(3);
    });

    it('reset returns to page 1', () => {
        const { result } = renderHook(() =>
            usePagination({ total: 30, limit: 10 })
        );

        act(() => { result.current.next(); });
        expect(result.current.page).toBe(2);

        act(() => { result.current.reset(); });
        expect(result.current.page).toBe(1);
    });

    it('pageNumbers contains the correct array', () => {
        const { result } = renderHook(() =>
            usePagination({ total: 30, limit: 10 })
        );

        expect(result.current.pageNumbers).toEqual([1, 2, 3]);
    });
});

// ── useLocalStorage ──────────────────────────────────────────────────────
describe('useLocalStorage', () => {
    beforeEach(() => { localStorage.clear(); });

    it('returns the initial value when nothing is stored', () => {
        const { result } = renderHook(() =>
            useLocalStorage('test_key', 'default')
        );

        expect(result.current[0]).toBe('default');
    });

    it('persists a value to localStorage', () => {
        const { result } = renderHook(() =>
            useLocalStorage('test_key', '')
        );

        act(() => { result.current[1]('saved'); });

        expect(result.current[0]).toBe('saved');
        expect(localStorage.getItem('test_key')).toBe('"saved"');
    });

    it('reads a pre-existing value from localStorage', () => {
        localStorage.setItem('existing_key', JSON.stringify('pre-set'));

        const { result } = renderHook(() =>
            useLocalStorage('existing_key', 'ignored-default')
        );

        expect(result.current[0]).toBe('pre-set');
    });
});