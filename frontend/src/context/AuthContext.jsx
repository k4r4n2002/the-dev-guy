/**
 * context/AuthContext.jsx — Authentication State Machine
 *
 * HOOKS USED: useReducer, useContext, useEffect, useCallback
 *
 * WHY useReducer INSTEAD OF useState?
 * Auth state has multiple sub-states (idle, loading, authenticated, error).
 * When you have state transitions that depend on multiple pieces of state,
 * useReducer gives you a predictable, testable state machine.
 *
 * STATE SHAPE:
 * {
 *   status: 'idle' | 'loading' | 'authenticated' | 'unauthenticated',
 *   user: null | { _id, username, email, ... },
 *   error: null | string
 * }
 *
 * USAGE (in any component):
 *   import { useAuth } from '../context/AuthContext';
 *   const { user, login, logout, isAuthenticated } = useAuth();
 */

import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { authApi } from '../api/client';

// ── Actions ────────────────────────────────────────────────────────────────
const AuthActions = {
    LOADING: 'LOADING',
    LOGIN_SUCCESS: 'LOGIN_SUCCESS',
    LOGOUT: 'LOGOUT',
    ERROR: 'ERROR',
    RESTORE: 'RESTORE',
};

// ── Reducer ────────────────────────────────────────────────────────────────
const initialState = {
    status: 'idle',
    user: null,
    error: null,
};

function authReducer(state, action) {
    switch (action.type) {
        case AuthActions.LOADING:
            return { ...state, status: 'loading', error: null };

        case AuthActions.LOGIN_SUCCESS:
            return { status: 'authenticated', user: action.payload, error: null };

        case AuthActions.LOGOUT:
            return { status: 'unauthenticated', user: null, error: null };

        case AuthActions.ERROR:
            return { ...state, status: 'unauthenticated', error: action.payload };

        case AuthActions.RESTORE:
            // Called on mount to restore session from localStorage
            return action.payload
                ? { status: 'authenticated', user: action.payload, error: null }
                : { status: 'unauthenticated', user: null, error: null };

        default:
            return state;
    }
}

// ── Context ────────────────────────────────────────────────────────────────
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [state, dispatch] = useReducer(authReducer, initialState);

    // ── Restore session on mount (useEffect) ─────────────────────────────────
    useEffect(() => {
        const storedUser = localStorage.getItem('devlog_user');
        const storedToken = localStorage.getItem('devlog_token');

        if (storedUser && storedToken) {
            dispatch({ type: AuthActions.RESTORE, payload: JSON.parse(storedUser) });
        } else {
            dispatch({ type: AuthActions.RESTORE, payload: null });
        }
    }, []);

    // ── Listen for the auth:logout event from the Axios interceptor ──────────
    useEffect(() => {
        const handleForceLogout = () => {
            localStorage.removeItem('devlog_token');
            localStorage.removeItem('devlog_user');
            dispatch({ type: AuthActions.LOGOUT });
        };
        window.addEventListener('auth:logout', handleForceLogout);
        return () => window.removeEventListener('auth:logout', handleForceLogout);
    }, []);

    // ── Actions (useCallback prevents re-creation on every render) ────────────
    const login = useCallback(async (credentials) => {
        dispatch({ type: AuthActions.LOADING });
        try {
            const response = await authApi.login(credentials);
            const { user, token } = response.data;
            localStorage.setItem('devlog_token', token);
            localStorage.setItem('devlog_user', JSON.stringify(user));
            dispatch({ type: AuthActions.LOGIN_SUCCESS, payload: user });
        } catch (err) {
            dispatch({ type: AuthActions.ERROR, payload: err.message });
            throw err; // Re-throw so the form can catch it
        }
    }, []);

    const register = useCallback(async (userData) => {
        dispatch({ type: AuthActions.LOADING });
        try {
            const response = await authApi.register(userData);
            const { user, token } = response.data;
            localStorage.setItem('devlog_token', token);
            localStorage.setItem('devlog_user', JSON.stringify(user));
            dispatch({ type: AuthActions.LOGIN_SUCCESS, payload: user });
        } catch (err) {
            dispatch({ type: AuthActions.ERROR, payload: err.message });
            throw err;
        }
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('devlog_token');
        localStorage.removeItem('devlog_user');
        dispatch({ type: AuthActions.LOGOUT });
    }, []);

    const value = {
        user: state.user,
        status: state.status,
        error: state.error,
        isAuthenticated: state.status === 'authenticated',
        isLoading: state.status === 'loading',
        login,
        register,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Custom hook to consume AuthContext.
 * Throws if used outside of AuthProvider (helps catch mistakes early).
 */
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within <AuthProvider>');
    }
    return context;
}
