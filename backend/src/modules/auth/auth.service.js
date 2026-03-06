/**
 * modules/auth/auth.service.js — Authentication Business Logic
 *
 * Design Pattern: SERVICE LAYER
 *
 * The Service Layer sits between the Controller (HTTP) and the Repository (DB).
 * It contains pure business logic:
 *   - Should a user be allowed to register? (Is the email taken?)
 *   - How do we generate a JWT?
 *   - What data does the caller need back?
 *
 * The controller just calls the service and sends the result.
 * The repository just runs DB queries.
 * The service is where the LOGIC lives.
 */

'use strict';

const jwt = require('jsonwebtoken');
const config = require('../../config/env');
const authRepository = require('./auth.repository');
const ApiError = require('../../utils/ApiError');

class AuthService {
    /**
     * Register a new user
     * @param {{ username, email, password, bio }} data
     * @returns {{ user: object, token: string }}
     */
    async register({ username, email, password, bio }) {
        // Business rule: email must be unique
        const existingEmail = await authRepository.findByEmail(email);
        if (existingEmail) throw ApiError.conflict('Email is already registered');

        // Business rule: username must be unique
        const existingUsername = await authRepository.findByUsername(username);
        if (existingUsername) throw ApiError.conflict('Username is already taken');

        // Create the user (the pre-save hook will hash the password)
        const user = await authRepository.create({ username, email, password, bio });

        const token = this._generateToken(user);
        return { user: this._sanitize(user), token };
    }

    /**
     * Log in an existing user
     * @param {{ email, password }} credentials
     * @returns {{ user: object, token: string }}
     */
    async login({ email, password }) {
        // Explicitly select passwordHash (it has select:false on the schema)
        const user = await authRepository.findByEmailWithPassword(email);
        if (!user) throw ApiError.unauthorized('Invalid email or password');

        const passwordMatches = await user.comparePassword(password);
        if (!passwordMatches) throw ApiError.unauthorized('Invalid email or password');

        const token = this._generateToken(user);
        return { user: this._sanitize(user), token };
    }

    /**
     * Get the currently authenticated user's profile
     * @param {string} userId - From req.user.id (decoded JWT)
     */
    async getMe(userId) {
        const user = await authRepository.findById(userId);
        if (!user) throw ApiError.notFound('User not found');
        return this._sanitize(user);
    }

    // ── Private helpers ────────────────────────────────────────────────────────
    _generateToken(user) {
        return jwt.sign(
            { id: user._id, username: user.username, email: user.email },
            config.jwtSecret,
            { expiresIn: config.jwtExpiresIn }
        );
    }

    /** Remove sensitive fields before sending user data to the client */
    _sanitize(user) {
        const { passwordHash, __v, ...safe } = user.toObject ? user.toObject() : user;
        return safe;
    }
}

module.exports = new AuthService();
