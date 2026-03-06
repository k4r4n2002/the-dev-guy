/**
 * pages/LoginPage.jsx — Login Form
 *
 * HOOKS USED: useState, useAuth (→ useContext), React Router
 *
 * Demonstrates:
 * - Controlled form inputs with useState
 * - Async form submission with error handling
 * - Redirect on success using useNavigate
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AuthPage.css';

export default function LoginPage() {
    const { login, isLoading } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        setError(''); // Clear error on change
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await login(formData);
            navigate('/');
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <main className="auth-page page-content">
            <div className="container">
                <div className="auth-card card fade-in">
                    <div className="auth-header">
                        <h1 className="auth-title text-gradient">Welcome back</h1>
                        <p className="text-muted">Log in to your DevLog account</p>
                    </div>

                    <form onSubmit={handleSubmit} className="auth-form" id="login-form">
                        <div className="form-group">
                            <label className="form-label" htmlFor="email">Email</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                className="form-input"
                                placeholder="you@example.com"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="password">Password</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                className="form-input"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {error && <p className="form-error" role="alert">{error}</p>}

                        <button
                            type="submit"
                            className="btn btn-primary btn-lg"
                            disabled={isLoading}
                            id="login-submit-btn"
                        >
                            {isLoading ? 'Logging in…' : 'Log In'}
                        </button>
                    </form>

                    <p className="auth-footer text-muted">
                        Don&apos;t have an account?{' '}
                        <Link to="/register">Register here</Link>
                    </p>
                </div>
            </div>
        </main>
    );
}
