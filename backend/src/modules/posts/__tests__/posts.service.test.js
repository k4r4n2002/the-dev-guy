/**
 * backend/src/modules/posts/__tests__/posts.routes.test.js
 *
 * Integration tests for the Posts API.
 * These tests spin up the full Express app (without a real DB) by mocking
 * the service layer. This verifies that routing, middleware, validation,
 * and HTTP response shaping all work together correctly.
 *
 * Run: npm test  (from the backend/ directory)
 */

'use strict';

jest.mock('../posts.service');
jest.mock('../../../config/env', () => ({
    jwtSecret: 'test-secret-for-jest',
    jwtExpiresIn: '1d',
    isDevelopment: true,
    isProduction: false,
    nodeEnv: 'test',
    port: 5000,
    corsOrigins: ['http://localhost:5173'],
    mongoUri: 'mongodb://localhost/test', // never actually connected in tests
}));
// Prevent the real DB from being required
jest.mock('../../../config/database', () => ({ connectDatabase: jest.fn() }));

const request = require('supertest');
const { createApp } = require('../../../app');
const postsService = require('../posts.service');
const jwt = require('jsonwebtoken');

// ── Helpers ─────────────────────────────────────────────────────────────────
function makeToken(payload = {}) {
    return jwt.sign(
        { id: 'user123', username: 'testuser', email: 'test@example.com', ...payload },
        'test-secret-for-jest',
        { expiresIn: '1d' }
    );
}

function makePost(overrides = {}) {
    return {
        _id: 'post123',
        title: 'Test Post',
        content: 'This is the post content for testing.',
        author: { _id: 'user123', username: 'testuser', avatar: '' },
        tags: ['jest', 'testing'],
        likes: [],
        likeCount: 0,
        commentCount: 0,
        createdAt: new Date().toISOString(),
        ...overrides,
    };
}

let app;

beforeAll(() => {
    app = createApp();
});

beforeEach(() => {
    jest.clearAllMocks();
});

// ── GET /api/posts ────────────────────────────────────────────────────────
describe('GET /api/posts', () => {
    it('returns paginated posts with 200', async () => {
        postsService.getAllPosts.mockResolvedValue({
            posts: [makePost()],
            pagination: { page: 1, limit: 10, total: 1, pages: 1 },
        });

        const res = await request(app).get('/api/posts');

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveLength(1);
        expect(res.body.pagination).toBeDefined();
    });

    it('passes search query param to the service', async () => {
        postsService.getAllPosts.mockResolvedValue({ posts: [], pagination: {} });

        await request(app).get('/api/posts?search=react&page=2');

        expect(postsService.getAllPosts).toHaveBeenCalledWith(
            expect.objectContaining({ search: 'react', page: 2 })
        );
    });
});

// ── GET /api/posts/:id ────────────────────────────────────────────────────
describe('GET /api/posts/:id', () => {
    it('returns a single post with 200', async () => {
        postsService.getPostById.mockResolvedValue(makePost());

        const res = await request(app).get('/api/posts/post123');

        expect(res.status).toBe(200);
        expect(res.body.data._id).toBe('post123');
    });

    it('returns 404 when post is not found', async () => {
        const ApiError = require('../../../utils/ApiError');
        postsService.getPostById.mockRejectedValue(ApiError.notFound('Post not found'));

        const res = await request(app).get('/api/posts/nonexistent');

        expect(res.status).toBe(404);
        expect(res.body.success).toBe(false);
    });
});

// ── POST /api/posts ───────────────────────────────────────────────────────
describe('POST /api/posts', () => {
    it('creates a post and returns 201 when authenticated', async () => {
        postsService.createPost.mockResolvedValue(makePost());

        const res = await request(app)
            .post('/api/posts')
            .set('Authorization', `Bearer ${makeToken()}`)
            .send({ title: 'Test Post', content: 'Long enough content here for validation.', tags: ['jest'] });

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
    });

    it('returns 401 when no auth token is provided', async () => {
        const res = await request(app)
            .post('/api/posts')
            .send({ title: 'Test Post', content: 'Some content here.' });

        expect(res.status).toBe(401);
    });

    it('returns 400 when title is missing', async () => {
        const res = await request(app)
            .post('/api/posts')
            .set('Authorization', `Bearer ${makeToken()}`)
            .send({ content: 'Content without a title.' });

        expect(res.status).toBe(400);
    });

    it('returns 400 when content is too short', async () => {
        const res = await request(app)
            .post('/api/posts')
            .set('Authorization', `Bearer ${makeToken()}`)
            .send({ title: 'Valid Title', content: 'Short' });

        expect(res.status).toBe(400);
    });
});

// ── DELETE /api/posts/:id ─────────────────────────────────────────────────
describe('DELETE /api/posts/:id', () => {
    it('deletes a post and returns 200 when authenticated', async () => {
        postsService.deletePost.mockResolvedValue(undefined);

        const res = await request(app)
            .delete('/api/posts/post123')
            .set('Authorization', `Bearer ${makeToken()}`);

        expect(res.status).toBe(200);
        expect(postsService.deletePost).toHaveBeenCalledWith('post123', 'user123');
    });

    it('returns 401 when unauthenticated', async () => {
        const res = await request(app).delete('/api/posts/post123');
        expect(res.status).toBe(401);
    });
});

// ── Health check ──────────────────────────────────────────────────────────
describe('GET /api/health', () => {
    it('returns 200 with status ok', async () => {
        const res = await request(app).get('/api/health');
        expect(res.status).toBe(200);
        expect(res.body.status).toBe('ok');
    });
});