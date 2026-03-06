/**
 * pages/ProfilePage.jsx — User Profile
 *
 * HOOKS USED: useLayoutEffect, useState, useEffect, useAuth
 *
 * useLayoutEffect vs useEffect:
 * - useEffect runs AFTER the browser paints (async)
 * - useLayoutEffect runs AFTER DOM mutations but BEFORE the browser paints (sync)
 * - Use useLayoutEffect when you need to read or mutate the DOM synchronously
 *   (e.g., measuring element dimensions) to avoid visual flicker
 *
 * Here we use it to measure the avatar's rendered size — a clear demonstration
 * of when to prefer useLayoutEffect over useEffect.
 */

import { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { postsApi } from '../api/client';
import PostCard from '../components/PostCard';
import './ProfilePage.css';

export default function ProfilePage() {
    const { user, isAuthenticated } = useAuth();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [avatarSize, setAvatarSize] = useState({ width: 0, height: 0 });

    // useRef: reference to the avatar DOM element for measurement
    const avatarRef = useRef(null);

    // useLayoutEffect: read DOM size synchronously before paint to avoid flicker
    // This runs after every render where user changes, measuring the avatar element
    useLayoutEffect(() => {
        if (avatarRef.current) {
            const { offsetWidth, offsetHeight } = avatarRef.current;
            setAvatarSize({ width: offsetWidth, height: offsetHeight });
        }
    }, [user]);

    const fetchMyPosts = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const res = await postsApi.getAll({ limit: 50 });
            // Filter to only show this user's posts (in a real app, add ?author=me endpoint)
            const mine = (res.data || []).filter((p) => p.author?._id === user._id);
            setPosts(mine);
        } catch {
            // Silently fail — not critical
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => { fetchMyPosts(); }, [fetchMyPosts]);

    if (!isAuthenticated) {
        return (
            <main className="page-content">
                <div className="container text-center">
                    <p className="text-muted">Please <Link to="/login">log in</Link> to view your profile.</p>
                </div>
            </main>
        );
    }

    return (
        <main className="page-content">
            <div className="container">
                {/* Profile Header */}
                <div className="profile-header card fade-in">
                    {/* Avatar — ref attached for useLayoutEffect measurement */}
                    <div
                        className="avatar avatar-lg"
                        ref={avatarRef}
                        title={`Avatar size: ${avatarSize.width}×${avatarSize.height}px (measured via useLayoutEffect)`}
                    >
                        {user?.username?.[0]?.toUpperCase()}
                    </div>
                    <div className="profile-info">
                        <h1 className="profile-name text-gradient">@{user?.username}</h1>
                        <p className="profile-email text-muted">{user?.email}</p>
                        {user?.bio && <p className="profile-bio">{user.bio}</p>}
                        <p className="profile-debug text-muted" style={{ fontSize: 'var(--font-size-xs)', fontFamily: 'var(--font-mono)' }}>
                            {/* Debugging display — shows useLayoutEffect measurement */}
                            Avatar DOM size (useLayoutEffect): {avatarSize.width}×{avatarSize.height}px
                        </p>
                    </div>
                </div>

                {/* User's Posts */}
                <div className="profile-posts">
                    <div className="profile-posts-header">
                        <h2>My Posts ({posts.length})</h2>
                        <Link to="/create" className="btn btn-primary btn-sm" id="profile-create-post-btn">
                            + Write New Post
                        </Link>
                    </div>

                    {loading ? (
                        <div className="spinner" style={{ margin: '40px auto' }} />
                    ) : posts.length === 0 ? (
                        <div className="text-center text-muted" style={{ padding: 'var(--space-12)' }}>
                            <p>You haven&apos;t written any posts yet.</p>
                            <Link to="/create" className="btn btn-primary" style={{ marginTop: 'var(--space-4)' }}>
                                Write your first post
                            </Link>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                            {posts.map((post) => (
                                <PostCard key={post._id} post={post} onLikeToggle={fetchMyPosts} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
