/**
 * middleware/auth.middleware.js — JWT Authentication Middleware
 *
 * This middleware:
 *   1. Reads the Authorization header: "Bearer <token>"
 *   2. Verifies the JWT using the secret from config
 *   3. Attaches the decoded payload to req.user
 *   4. Calls next() to pass control to the route handler
 *
 * If anything fails, it throws an ApiError(401) which the error
 * middleware will format into a clean JSON response.
 *
 * USAGE: Attach to any route that requires authentication:
 *   router.get('/me', authenticate, userController.getMe);
 */

'use strict';

const jwt = require('jsonwebtoken');
const config = require('../config/env');
const ApiError = require('../utils/ApiError');

async function authenticate(req, _res, next) {
    const authHeader = req.headers.authorization;

    // Header must be: "Bearer <token>"
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw ApiError.unauthorized('No token provided — add Authorization: Bearer <token>');
    }

    const token = authHeader.split(' ')[1];

    // jwt.verify throws if invalid or expired — error.middleware catches it
    const decoded = jwt.verify(token, config.jwtSecret);

    // Attach the decoded payload so downstream handlers can read req.user
    req.user = decoded;

    next();
}

module.exports = { authenticate };
