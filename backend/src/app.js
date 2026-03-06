/**
 * app.js — Express Application Factory
 *
 * Design Pattern: FACTORY FUNCTION
 *
 * Instead of creating the Express app as a module-level singleton, we export
 * a `createApp()` function. This is the standard way to build testable Express
 * applications — tests can call createApp() to get a fresh instance each time
 * without shared state.
 *
 * This file:
 *   1. Creates the Express app
 *   2. Attaches global middleware (helmet, cors, morgan, JSON parser)
 *   3. Mounts all feature routers under /api
 *   4. Mounts the 404 handler and error handler LAST
 *
 * Note: We require('express-async-errors') at the module top — this patches
 * async route handlers so that thrown errors are forwarded to next(err)
 * automatically, eliminating the need for try/catch in controllers.
 */

'use strict';

require('express-async-errors'); // Patch async route handlers globally

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const config = require('./config/env');

// Routes
const authRoutes = require('./modules/auth/auth.routes');
const postsRoutes = require('./modules/posts/posts.routes');
const commentsRoutes = require('./modules/comments/comments.routes');

// Middleware
const errorMiddleware = require('./middleware/error.middleware');

function createApp() {
    const app = express();

    // ── Security & Parsing ─────────────────────────────────────────────────────
    // helmet sets secure HTTP headers (X-Frame-Options, Content-Security-Policy, etc.)
    app.use(helmet());

    // cors restricts which origins can call the API
    app.use(
        cors({
            origin: config.corsOrigins,
            credentials: true, // Allow cookies/Authorization header
        })
    );

    // Parse JSON request bodies
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true }));

    // HTTP request logger — 'dev' format is concise and colorful
    if (config.isDevelopment) {
        app.use(morgan('dev'));
    } else {
        app.use(morgan('combined')); // Apache-style log for production
    }

    // ── Health Check ───────────────────────────────────────────────────────────
    // Simple endpoint used by Kubernetes liveness/readiness probes
    app.get('/api/health', (_req, res) => {
        res.json({ status: 'ok', environment: config.nodeEnv, timestamp: new Date().toISOString() });
    });

    // ── API Routes ─────────────────────────────────────────────────────────────
    app.use('/api/auth', authRoutes);
    app.use('/api/posts', postsRoutes);

    // Comments are nested under posts: /api/posts/:postId/comments
    app.use('/api/posts/:postId/comments', commentsRoutes);

    // ── 404 Handler ───────────────────────────────────────────────────────────
    app.use((_req, res) => {
        res.status(404).json({ success: false, message: 'Route not found' });
    });

    // ── Global Error Handler (MUST be last) ───────────────────────────────────
    app.use(errorMiddleware);

    return app;
}

module.exports = { createApp };
