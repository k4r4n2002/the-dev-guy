/**
 * pages/FeedPage.jsx — Main Post Feed
 *
 * HOOKS USED: useState, useEffect, useMemo, useCallback, usePagination,
 *             useDebounce, useLocalStorage
 *
 * This page is the main demo of data fetching patterns:
 * - Paginated list with search
 * - Debounced search input (no API call on every keystroke)
 * - usePagination for page controls
 * - Like toggle with parent-controlled refetch
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { postsApi } from '../api/client';
import PostCard from '../components/PostCard';
import { useDebounce } from '../hooks/useDebounce';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { usePagination } from '../hooks/usePagination';
import './FeedPage.css';

export default function FeedPage() {
    const [posts, setPosts] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // useLocalStorage: search term persists across page refreshes.
    // Try it: type a search, refresh the page — the term is still there!
    // This is why useLocalStorage is more useful than useState for this case.
    const [search, setSearch] = useLocalStorage('devlog_feed_search', '');

    const debouncedSearch = useDebounce(search, 500);
    const { page, totalPages, pageNumbers, goTo, hasPrev, hasNext, prev, next, reset } =
        usePagination({ total, limit: 10 });

    // Reset to page 1 whenever search changes
    useEffect(() => { reset(); }, [debouncedSearch]); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchPosts = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await postsApi.getAll({ page, limit: 10, search: debouncedSearch || undefined });
            setPosts(res.data);
            setTotal(res.pagination?.total ?? 0);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [page, debouncedSearch]);

    useEffect(() => { fetchPosts(); }, [fetchPosts]);

    // useMemo: compute stats from posts without re-running on every render
    const stats = useMemo(() => ({
        totalLikes: posts.reduce((sum, p) => sum + (p.likeCount ?? p.likes?.length ?? 0), 0),
        totalComments: posts.reduce((sum, p) => sum + (p.commentCount ?? 0), 0),
    }), [posts]);

    return (
        <main className="page-content">
            <div className="container">
                {/* Hero */}
                <div className="feed-hero fade-in">
                    <h1 className="feed-title text-gradient">DevLog Feed</h1>
                    <p className="feed-subtitle">Posts from the dev community</p>
                    {posts.length > 0 && (
                        <div className="feed-stats">
                            <span>{stats.totalLikes} ♥ likes</span>
                            <span>{stats.totalComments} 💬 comments</span>
                            <span>{total} posts</span>
                        </div>
                    )}
                </div>

                {/* Search */}
                <div className="feed-search">
                    <input
                        id="feed-search-input"
                        type="search"
                        className="form-input"
                        placeholder="Search posts…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {/* Post list */}
                {loading ? (
                    <div className="feed-loading">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="card skeleton" style={{ height: 200 }} />
                        ))}
                    </div>
                ) : error ? (
                    <div className="feed-error text-danger text-center">
                        <p>⚠️ {error}</p>
                        <button className="btn btn-secondary" onClick={fetchPosts}>Retry</button>
                    </div>
                ) : posts.length === 0 ? (
                    <div className="feed-empty text-center text-muted">
                        <p style={{ fontSize: '3rem' }}>✦</p>
                        <p>No posts found. Be the first to write!</p>
                    </div>
                ) : (
                    <div className="feed-list">
                        {posts.map((post) => (
                            <PostCard key={post._id} post={post} onLikeToggle={fetchPosts} />
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="pagination" role="navigation" aria-label="Page navigation">
                        <button className="btn btn-ghost btn-sm" onClick={prev} disabled={!hasPrev} id="page-prev">
                            ← Prev
                        </button>
                        {pageNumbers.map((n) => (
                            <button
                                key={n}
                                className={`btn btn-sm ${n === page ? 'btn-primary' : 'btn-ghost'}`}
                                onClick={() => goTo(n)}
                                id={`page-${n}`}
                            >
                                {n}
                            </button>
                        ))}
                        <button className="btn btn-ghost btn-sm" onClick={next} disabled={!hasNext} id="page-next">
                            Next →
                        </button>
                    </div>
                )}
            </div>
        </main>
    );
}
