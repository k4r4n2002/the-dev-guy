/**
 * pages/PostDetailPage.jsx — Single Post with Comments
 *
 * HOOKS USED: useState, useEffect, useRef, useCallback, useAuth
 *
 * KEY CONCEPTS:
 * - useRef for imperative DOM scroll (scroll-to-comments anchor)
 * - Scroll-to-anchor on page load when URL has #comments
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { postsApi, commentsApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import './PostDetailPage.css';

function formatDate(d) {
    return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function PostDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();

    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [commentText, setCommentText] = useState('');
    const [submittingComment, setSubmittingComment] = useState(false);
    const [deleting, setDeleting] = useState(false);

    // useRef: gives direct access to the DOM element without triggering re-renders
    const commentsRef = useRef(null);

    const fetchData = useCallback(async () => {
        try {
            const [postRes, commentsRes] = await Promise.all([
                postsApi.getOne(id),
                commentsApi.getByPost(id),
            ]);
            setPost(postRes.data);
            setComments(commentsRes.data || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Scroll to comments section if URL has #comments
    useEffect(() => {
        if (window.location.hash === '#comments' && commentsRef.current) {
            commentsRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [comments]);

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!commentText.trim()) return;
        setSubmittingComment(true);
        try {
            await commentsApi.add(id, { content: commentText });
            setCommentText('');
            fetchData();
        } catch (err) {
            alert(err.message);
        } finally {
            setSubmittingComment(false);
        }
    };

    const handleDeleteComment = async (commentId) => {
        try {
            await commentsApi.remove(id, commentId);
            setComments((prev) => prev.filter((c) => c._id !== commentId));
        } catch (err) {
            alert(err.message);
        }
    };

    const handleDeletePost = async () => {
        if (!window.confirm('Delete this post? This cannot be undone.')) return;
        setDeleting(true);
        try {
            await postsApi.remove(id);
            navigate('/');
        } catch (err) {
            alert(err.message);
            setDeleting(false);
        }
    };

    if (loading) return <div className="page-content"><div className="container"><div className="spinner" style={{ margin: '80px auto' }} /></div></div>;
    if (error) return <div className="page-content"><div className="container text-center text-danger"><p>⚠️ {error}</p><Link to="/" className="btn btn-secondary">← Back</Link></div></div>;
    if (!post) return null;

    const isAuthor = isAuthenticated && user?._id === post.author?._id;

    return (
        <main className="page-content">
            <div className="container">
                <Link to="/" className="back-link">← Back to Feed</Link>

                <article className="post-detail fade-in">
                    {/* Author & Meta */}
                    <div className="post-detail-meta">
                        <div className="avatar">{post.author?.username?.[0]?.toUpperCase()}</div>
                        <div>
                            <span className="post-detail-author">@{post.author?.username}</span>
                            <span className="post-detail-date">{formatDate(post.createdAt)}</span>
                        </div>
                        {isAuthor && (
                            <div className="post-detail-actions">
                                <Link to={`/posts/${id}/edit`} className="btn btn-secondary btn-sm">Edit</Link>
                                <button
                                    onClick={handleDeletePost}
                                    disabled={deleting}
                                    className="btn btn-danger btn-sm"
                                    id="delete-post-btn"
                                >
                                    {deleting ? 'Deleting…' : 'Delete'}
                                </button>
                            </div>
                        )}
                    </div>

                    <h1 className="post-detail-title">{post.title}</h1>

                    {post.tags?.length > 0 && (
                        <div className="post-detail-tags">
                            {post.tags.map((tag) => <span key={tag} className="tag">#{tag}</span>)}
                        </div>
                    )}

                    <div className="post-detail-content">{post.content}</div>

                    <div className="post-detail-footer">
                        <span>♥ {post.likeCount ?? post.likes?.length ?? 0} likes</span>
                        <span>💬 {post.commentCount ?? comments.length} comments</span>
                    </div>
                </article>

                {/* Comments section — attached to ref for scroll-to */}
                <section className="comments-section" id="comments" ref={commentsRef}>
                    <h2 className="comments-title">Comments ({comments.length})</h2>

                    {isAuthenticated ? (
                        <form className="comment-form" onSubmit={handleAddComment}>
                            <div className="form-group">
                                <textarea
                                    className="form-textarea"
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    placeholder="Share your thoughts…"
                                    rows={3}
                                    id="comment-input"
                                />
                            </div>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={submittingComment || !commentText.trim()}
                                id="submit-comment-btn"
                            >
                                {submittingComment ? 'Posting…' : 'Post Comment'}
                            </button>
                        </form>
                    ) : (
                        <p className="text-muted">
                            <Link to="/login">Log in</Link> to leave a comment.
                        </p>
                    )}

                    <div className="comments-list">
                        {comments.length === 0 && (
                            <p className="text-muted text-center" style={{ padding: '2rem' }}>No comments yet. Be first!</p>
                        )}
                        {comments.map((comment) => (
                            <div key={comment._id} className="comment-item card fade-in">
                                <div className="comment-header">
                                    <div className="avatar" style={{ width: 28, height: 28, fontSize: '0.75rem' }}>
                                        {comment.author?.username?.[0]?.toUpperCase()}
                                    </div>
                                    <span className="comment-author">@{comment.author?.username}</span>
                                    <span className="comment-date">{formatDate(comment.createdAt)}</span>
                                    {isAuthenticated && user?._id === comment.author?._id && (
                                        <button
                                            className="btn btn-ghost btn-sm"
                                            style={{ marginLeft: 'auto', color: 'var(--color-danger)' }}
                                            onClick={() => handleDeleteComment(comment._id)}
                                            id={`delete-comment-${comment._id}`}
                                        >
                                            Delete
                                        </button>
                                    )}
                                </div>
                                <p className="comment-content">{comment.content}</p>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </main>
    );
}
