/**
 * App.jsx — Root Application Component & Router
 *
 * HOOKS USED: useToast (custom)
 *
 * Sets up React Router v6 routes:
 * - Public routes: /, /login, /register, /posts/:id
 * - Protected routes (require auth): /create, /profile
 *
 * The <AuthProvider> wraps the entire app so any component can call useAuth().
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useToast } from './hooks/useToast';

// Components
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Toast from './components/Toast';

// Pages
import FeedPage from './pages/FeedPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PostDetailPage from './pages/PostDetailPage';
import CreatePostPage from './pages/CreatePostPage';
import ProfilePage from './pages/ProfilePage';

function AppContent() {
    const { toasts, showToast, dismissToast } = useToast();

    // Expose showToast globally so Axios interceptors or anywhere can call it
    // (A more advanced pattern would use a custom event or Zustand store)
    window.__showToast = showToast;

    return (
        <>
            <Navbar />
            <Routes>
                {/* Public routes */}
                <Route path="/" element={<FeedPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/posts/:id" element={<PostDetailPage />} />

                {/* Protected routes — wrapped in <ProtectedRoute> */}
                <Route element={<ProtectedRoute />}>
                    <Route path="/create" element={<CreatePostPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                </Route>

                {/* 404 fallback */}
                <Route
                    path="*"
                    element={
                        <main className="page-content">
                            <div className="container text-center" style={{ paddingTop: '4rem' }}>
                                <h1 className="text-gradient" style={{ fontSize: '4rem' }}>404</h1>
                                <p className="text-muted">Page not found</p>
                            </div>
                        </main>
                    }
                />
            </Routes>
            <Toast toasts={toasts} onDismiss={dismissToast} />
        </>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <AppContent />
            </AuthProvider>
        </BrowserRouter>
    );
}
