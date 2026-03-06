/**
 * components/Navbar.jsx — Top Navigation Bar
 *
 * HOOKS USED: useAuth (custom → useContext), React Router's useNavigate
 *
 * Features:
 * - Shows logo and nav links
 * - Shows user avatar and logout when authenticated
 * - Shows Login/Register when not authenticated
 */

import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className="navbar">
            <div className="container navbar-inner">
                {/* Brand */}
                <Link to="/" className="navbar-brand">
                    <span className="navbar-logo">✦</span>
                    <span className="text-gradient">DevLog</span>
                </Link>

                {/* Nav links */}
                <nav className="navbar-links" aria-label="Main navigation">
                    <NavLink to="/" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                        Feed
                    </NavLink>
                    {isAuthenticated && (
                        <NavLink
                            to="/create"
                            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
                        >
                            Write
                        </NavLink>
                    )}
                </nav>

                {/* Auth area */}
                <div className="navbar-auth">
                    {isAuthenticated ? (
                        <div className="navbar-user">
                            <Link to="/profile" className="navbar-avatar-link">
                                <div className="avatar" title={user?.username}>
                                    {user?.username?.[0]?.toUpperCase()}
                                </div>
                                <span className="navbar-username">@{user?.username}</span>
                            </Link>
                            <button className="btn btn-ghost btn-sm" onClick={handleLogout} id="logout-btn">
                                Logout
                            </button>
                        </div>
                    ) : (
                        <div className="navbar-guest">
                            <Link to="/login" className="btn btn-ghost btn-sm" id="login-nav-btn">
                                Login
                            </Link>
                            <Link to="/register" className="btn btn-primary btn-sm" id="register-nav-btn">
                                Register
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
