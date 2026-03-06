/**
 * pages/EditPostPage.jsx — Edit an Existing Post
 *
 * HOOKS USED: useState, useEffect, useCallback, useNavigate, useParams, useAuth
 *
 * Flow:
 *  1. Fetch the post by ID (pre-populate form)
 *  2. Guard: redirect away if user is not the author
 *  3. On submit: PATCH the post via postsApi.update()
 */

import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { postsApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import './CreatePostPage.css'; // reuse the same styles

const CONTENT_MAX = 50000;
const TITLE_MAX = 150;

export default function EditPostPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();

    const [formData, setFormData] = useState({ title: '', content: '', tags: '' });
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    // Load the existing post and pre-populate the form
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login', { replace: true });
            return;
        }

        postsApi.getOne(id)
            .then((res) => {
                const post = res.data;
                // Guard: only the author can edit
                if (post.author._id !== user._id) {
                    navigate('/', { replace: true });
                    return;
                }
                setFormData({
                    title: post.title || '',
                    content: post.content || '',
                    tags: (post.tags || []).join(', '),
                });
            })
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, [id, user, isAuthenticated, navigate]);

    const handleChange = (e) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        setError('');
    };

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        try {
            const tags = formData.tags
                .split(',')
                .map((t) => t.trim())
                .filter(Boolean);

            await postsApi.update(id, { title: formData.title, content: formData.content, tags });
            navigate(`/posts/${id}`);
        } catch (err) {
            setError(err.message);
            setSubmitting(false);
        }
    }, [id, formData, navigate]);

    if (loading) {
        return (
            <main className="page-content">
                <div className="container">
                    <div className="spinner" style={{ margin: '80px auto' }} />
                </div>
            </main>
        );
    }

    return (
        <main className="page-content">
            <div className="container">
                <div className="create-post-header fade-in">
                    <h1 className="text-gradient" style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 700 }}>
                        Edit Post
                    </h1>
                    <p className="text-muted">Your changes will be published immediately</p>
                </div>

                <form onSubmit={handleSubmit} className="create-post-form card fade-in" id="edit-post-form">
                    <div className="form-group">
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <label className="form-label" htmlFor="title">Title</label>
                            <span className={`char-count ${TITLE_MAX - formData.title.length < 20 ? 'warn' : ''}`}>
                                {TITLE_MAX - formData.title.length} remaining
                            </span>
                        </div>
                        <input
                            id="title"
                            name="title"
                            type="text"
                            className="form-input"
                            value={formData.title}
                            onChange={handleChange}
                            maxLength={TITLE_MAX}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <label className="form-label" htmlFor="content">Content</label>
                            <span className={`char-count ${CONTENT_MAX - formData.content.length < 200 ? 'warn' : ''}`}>
                                {CONTENT_MAX - formData.content.length} remaining
                            </span>
                        </div>
                        <textarea
                            id="content"
                            name="content"
                            className="form-textarea"
                            value={formData.content}
                            onChange={handleChange}
                            maxLength={CONTENT_MAX}
                            rows={12}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="tags">Tags (comma-separated)</label>
                        <input
                            id="tags"
                            name="tags"
                            type="text"
                            className="form-input"
                            value={formData.tags}
                            onChange={handleChange}
                        />
                    </div>

                    {error && <p className="form-error">{error}</p>}

                    <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end' }}>
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => navigate(`/posts/${id}`)}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={submitting}
                            id="save-edit-btn"
                        >
                            {submitting ? 'Saving…' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </main>
    );
}
