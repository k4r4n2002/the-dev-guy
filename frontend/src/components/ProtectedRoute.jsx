/**
 * components/ProtectedRoute.jsx — Route Guard
 *
 * HOOKS USED: useAuth (→ useContext), React Router's Navigate
 *
 * Wraps a route and redirects to /login if the user is not authenticated.
 * The `replace` prop replaces the current history entry so the user
 * can't "go back" to the protected page after being redirected.
 *
 * Usage in App.jsx:
 *   <Route element={<ProtectedRoute />}>
 *     <Route path="/create" element={<CreatePostPage />} />
 *   </Route>
 */

import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute() {
    const { isAuthenticated, status } = useAuth();

    // Don't redirect while we're restoring the session from localStorage
    if (status === 'idle') return null;

    return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}
