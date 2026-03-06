/**
 * utils/ApiError.js — Custom Application Error Class
 *
 * WHY A CUSTOM ERROR CLASS?
 * JavaScript's built-in `Error` class doesn't carry HTTP status codes.
 * By extending it, we can throw a single, typed error anywhere in the
 * codebase and the centralized error middleware will know exactly which
 * HTTP status code to respond with.
 *
 * Usage:
 *   throw new ApiError(404, 'Post not found');
 *   throw new ApiError(401, 'Unauthorized');
 *
 * The error middleware (middleware/error.middleware.js) catches these and
 * sends a consistent JSON response.
 */

'use strict';

class ApiError extends Error {
    /**
     * @param {number} statusCode - HTTP status code (e.g., 400, 401, 404, 500)
     * @param {string} message - Human-readable error message
     * @param {boolean} [isOperational=true] - Is this a known/expected error?
     */
    constructor(statusCode, message, isOperational = true) {
        super(message);

        this.name = 'ApiError';
        this.statusCode = statusCode;
        this.isOperational = isOperational; // vs programmer errors (bugs)

        // Preserve proper stack trace in V8 (Node.js/Chrome)
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, ApiError);
        }
    }

    // ── Factory helpers (make instantiation expressive) ────────────────────────
    static badRequest(message = 'Bad Request') {
        return new ApiError(400, message);
    }

    static unauthorized(message = 'Unauthorized') {
        return new ApiError(401, message);
    }

    static forbidden(message = 'Forbidden') {
        return new ApiError(403, message);
    }

    static notFound(message = 'Not Found') {
        return new ApiError(404, message);
    }

    static conflict(message = 'Conflict') {
        return new ApiError(409, message);
    }

    static internal(message = 'Internal Server Error') {
        return new ApiError(500, message, false);
    }
}

module.exports = ApiError;
