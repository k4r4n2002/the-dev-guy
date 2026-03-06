/**
 * middleware/error.middleware.js — Centralized Error Handler
 *
 * WHY CENTRALIZED ERROR HANDLING?
 * Instead of writing try/catch in every route handler (or duplicating
 * res.status(500).json(...) everywhere), we funnel all errors through
 * one 4-argument Express middleware that handles every case.
 *
 * Express identifies a middleware as an error handler by its 4 parameters:
 *   (err, req, res, next)
 *
 * HOW IT WORKS:
 *   1. Any route throws an error (or calls next(err))
 *   2. express-async-errors patches async routes to call next(err) automatically
 *   3. Express skips all normal middleware and calls this handler
 */

'use strict';

const config = require('../config/env');
const ApiError = require('../utils/ApiError');

// eslint-disable-next-line no-unused-vars
function errorMiddleware(err, req, res, next) {
    // Default to 500
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';

    // ── Mongoose validation error ─────────────────────────────────────────────
    if (err.name === 'ValidationError') {
        statusCode = 400;
        // Collect all field-level validation messages
        message = Object.values(err.errors)
            .map((e) => e.message)
            .join(', ');
    }

    // ── Mongoose duplicate key (unique constraint violation) ──────────────────
    if (err.code === 11000) {
        statusCode = 409;
        const field = Object.keys(err.keyValue || {})[0] || 'field';
        message = `${field} already exists`;
    }

    // ── Mongoose cast error (invalid ObjectId format) ─────────────────────────
    if (err.name === 'CastError') {
        statusCode = 400;
        message = `Invalid value for field: ${err.path}`;
    }

    // ── JWT errors ────────────────────────────────────────────────────────────
    if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token';
    }
    if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token expired — please log in again';
    }

    // ── Build response ────────────────────────────────────────────────────────
    const response = {
        success: false,
        message,
    };

    // Include stack trace in development mode only
    if (config.isDevelopment && !(err instanceof ApiError)) {
        response.stack = err.stack;
    }

    // Log server errors (500+) always; log client errors (4xx) in dev
    if (statusCode >= 500) {
        console.error('🚨  Server Error:', err);
    } else if (config.isDevelopment) {
        console.warn(`⚠️  Client Error [${statusCode}]:`, message);
    }

    res.status(statusCode).json(response);
}

module.exports = errorMiddleware;
