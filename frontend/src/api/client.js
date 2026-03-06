/**
 * api/client.js — Axios HTTP Client
 *
 * CONCEPTS COVERED:
 * - Axios instance with base URL (from environment variable)
 * - Request interceptors — runs before every request
 *   → Attaches the JWT from localStorage to Authorization header
 * - Response interceptors — runs after every response
 *   → Handles 401 (expired token) by clearing auth state
 *
 * WHY A SHARED AXIOS INSTANCE?
 * If we did `axios.get(...)` everywhere, we'd need to manually add headers
 * every time. A single configured instance (exported as `apiClient`)
 * applies the auth header to EVERY request automatically.
 */

import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Create a dedicated axios instance (not the global axios object)
const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 15000, // 15 second timeout
});

// ── Request Interceptor ────────────────────────────────────────────────────
// Runs before every outgoing request
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('devlog_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ── Response Interceptor ───────────────────────────────────────────────────
// Runs after every response (including errors)
apiClient.interceptors.response.use(
    // Success (2xx) — just return the response data directly
    (response) => response.data,
    // Error (non-2xx) — normalize and re-throw
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid — clear auth state and redirect to login
            localStorage.removeItem('devlog_token');
            localStorage.removeItem('devlog_user');
            window.dispatchEvent(new CustomEvent('auth:logout'));
        }

        // Normalize the error message so callers always get a string
        const message =
            error.response?.data?.message ||
            error.message ||
            'An unexpected error occurred';

        return Promise.reject(new Error(message));
    }
);

// ── API Endpoint Helpers ────────────────────────────────────────────────────
export const authApi = {
    register: (data) => apiClient.post('/auth/register', data),
    login: (data) => apiClient.post('/auth/login', data),
    getMe: () => apiClient.get('/auth/me'),
};

export const postsApi = {
    getAll: (params) => apiClient.get('/posts', { params }),
    getOne: (id) => apiClient.get(`/posts/${id}`),
    create: (data) => apiClient.post('/posts', data),
    update: (id, data) => apiClient.put(`/posts/${id}`, data),
    remove: (id) => apiClient.delete(`/posts/${id}`),
    toggleLike: (id) => apiClient.post(`/posts/${id}/like`),
};

export const commentsApi = {
    getByPost: (postId) => apiClient.get(`/posts/${postId}/comments`),
    add: (postId, data) => apiClient.post(`/posts/${postId}/comments`, data),
    remove: (postId, commentId) => apiClient.delete(`/posts/${postId}/comments/${commentId}`),
};

export default apiClient;
