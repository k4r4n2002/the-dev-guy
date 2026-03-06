/**
 * components/PostCard.jsx — Post Preview Card
 *
 * HOOKS USED: useCallback (for like handler), useAuth
 *
 * Displays a post summary in the feed with:
 * - Title, excerpt, author, date, tags, like count
 * - Like/unlike button (for authenticated users)
 */

import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { postsApi } from '../api/client';
import './PostCard.css';

function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
    });
}

export default function PostCard({ post, onLikeToggle }) {
    const { isAuthenticated, user } = useAuth();
    const [liking, setLiking] = useState(false);

    const liked = isAuthenticated && post.likes?.some((id) => id === user?._id);

    // useCallback: memoize the toggle to avoid re-creating on every render
    const handleLike = useCallback(async (e) => {
        e.preventDefault(); // Don't navigate to post detail
        if (!isAuthenticated || liking) return;

        setLiking(true);
        try {
            await postsApi.toggleLike(post._id);
            onLikeToggle?.(post._id); // Notify parent to refetch
        } catch (err) {
            console.error('Like toggle failed:', err.message);
        } finally {
            setLiking(false);
        }
    }, [isAuthenticated, liking, post._id, onLikeToggle]);

    const excerpt = post.content?.slice(0, 200) + (post.content?.length > 200 ? '…' : '');

    return (
        <article className="post-card card fade-in">
            <Link to={`/posts/${post._id}`} className="post-card-link">
                <div className="post-card-header">
                    <div className="post-card-author">
                        <div className="avatar">
                            {post.author?.username?.[0]?.toUpperCase()}
                        </div>
                        <div>
                            <span className="post-card-username">@{post.author?.username}</span>
                            <span className="post-card-date">{formatDate(post.createdAt)}</span>
                        </div>
                    </div>
                </div>

                <h2 className="post-card-title">{post.title}</h2>
                <p className="post-card-excerpt">{excerpt}</p>

                {post.tags?.length > 0 && (
                    <div className="post-card-tags">
                        {post.tags.slice(0, 4).map((tag) => (
                            <span key={tag} className="tag">#{tag}</span>
                        ))}
                    </div>
                )}
            </Link>

            <div className="post-card-footer">
                <button
                    className={`like-btn ${liked ? 'liked' : ''}`}
                    onClick={handleLike}
                    disabled={!isAuthenticated || liking}
                    title={isAuthenticated ? 'Like post' : 'Login to like'}
                    id={`like-btn-${post._id}`}
                >
                    <span className="like-icon">{liked ? '♥' : '♡'}</span>
                    <span>{post.likeCount ?? post.likes?.length ?? 0}</span>
                </button>
                <span className="comment-count">
                    💬 {post.commentCount ?? 0}
                </span>
                <Link to={`/posts/${post._id}`} className="read-more">
                    Read more →
                </Link>
            </div>
        </article>
    );
}
