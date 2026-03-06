/**
 * pages/CreatePostPage.jsx — New Post Form
 *
 * HOOKS USED: useState, useMemo, useCallback, useNavigate, useAuth
 *
 * useMemo demonstrates: computing character count without a side effect.
 * useCallback: memoizes the submit handler so it's stable across renders.
 */

import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { postsApi } from '../api/client';
import './CreatePostPage.css';

const CONTENT_MAX = 50000;
const TITLE_MAX = 150;

export default function CreatePostPage() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ title: '', content: '', tags: '' });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        setError('');
    };

    // useMemo: derived values computed only when their dependencies change
    const titleRemaining = useMemo(() => TITLE_MAX - formData.title.length, [formData.title]);
    const contentRemaining = useMemo(() => CONTENT_MAX - formData.content.length, [formData.content]);

    // useCallback: stable reference so this function doesn't cause child re-renders
    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        try {
            const tags = formData.tags
                .split(',')
                .map((t) => t.trim())
                .filter(Boolean);

            const res = await postsApi.create({ title: formData.title, content: formData.content, tags });
            navigate(`/posts/${res.data._id}`);
        } catch (err) {
            setError(err.message);
            setSubmitting(false);
        }
    }, [formData, navigate]);

    return (
        <main className="page-content">
            <div className="container">
                <div className="create-post-header fade-in">
                    <h1 className="text-gradient" style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 700 }}>
                        Write a Post
                    </h1>
                    <p className="text-muted">Share your knowledge with the DevLog community</p>
                </div>

                <form onSubmit={handleSubmit} className="create-post-form card fade-in" id="create-post-form">
                    <div className="form-group">
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <label className="form-label" htmlFor="title">Title</label>
                            <span className={`char-count ${titleRemaining < 20 ? 'warn' : ''}`}>
                                {titleRemaining} remaining
                            </span>
                        </div>
                        <input
                            id="title"
                            name="title"
                            type="text"
                            className="form-input"
                            placeholder="An interesting post title…"
                            value={formData.title}
                            onChange={handleChange}
                            maxLength={TITLE_MAX}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <label className="form-label" htmlFor="content">Content</label>
                            <span className={`char-count ${contentRemaining < 200 ? 'warn' : ''}`}>
                                {contentRemaining} remaining
                            </span>
                        </div>
                        <textarea
                            id="content"
                            name="content"
                            className="form-textarea"
                            placeholder="Write your post here…"
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
                            placeholder="javascript, react, node"
                            value={formData.tags}
                            onChange={handleChange}
                        />
                        <small className="text-muted">Up to 10 tags</small>
                    </div>

                    {error && <p className="form-error">{error}</p>}

                    <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end' }}>
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => navigate('/')}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={submitting}
                            id="publish-btn"
                        >
                            {submitting ? 'Publishing…' : 'Publish Post'}
                        </button>
                    </div>
                </form>
            </div>
        </main>
    );
}
