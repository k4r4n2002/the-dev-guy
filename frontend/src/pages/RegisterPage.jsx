/**
 * pages/RegisterPage.jsx — Registration Form
 *
 * HOOKS USED: useState, useAuth, React Router
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AuthPage.css';

export default function RegisterPage() {
    const { register, isLoading } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ username: '', email: '', password: '', bio: '' });
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await register(formData);
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
                        <h1 className="auth-title text-gradient">Join DevLog</h1>
                        <p className="text-muted">Create your developer blog account</p>
                    </div>

                    <form onSubmit={handleSubmit} className="auth-form" id="register-form">
                        <div className="form-group">
                            <label className="form-label" htmlFor="username">Username</label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                className="form-input"
                                placeholder="devguru"
                                value={formData.username}
                                onChange={handleChange}
                                required
                                minLength={3}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="reg-email">Email</label>
                            <input
                                id="reg-email"
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
                            <label className="form-label" htmlFor="reg-password">Password</label>
                            <input
                                id="reg-password"
                                name="password"
                                type="password"
                                className="form-input"
                                placeholder="At least 8 characters"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                minLength={8}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="bio">Bio (optional)</label>
                            <input
                                id="bio"
                                name="bio"
                                type="text"
                                className="form-input"
                                placeholder="A short intro about you"
                                value={formData.bio}
                                onChange={handleChange}
                                maxLength={300}
                            />
                        </div>

                        {error && <p className="form-error" role="alert">{error}</p>}

                        <button
                            type="submit"
                            className="btn btn-primary btn-lg"
                            disabled={isLoading}
                            id="register-submit-btn"
                        >
                            {isLoading ? 'Creating account…' : 'Create Account'}
                        </button>
                    </form>

                    <p className="auth-footer text-muted">
                        Already have an account?{' '}
                        <Link to="/login">Log in</Link>
                    </p>
                </div>
            </div>
        </main>
    );
}
