/**
 * modules/auth/auth.controller.js — HTTP Request Handlers
 *
 * Design Pattern: CONTROLLER (thin layer)
 *
 * Controllers are intentionally thin. Their only job is:
 *   1. Extract data from req (body, params, user)
 *   2. Call the service
 *   3. Send the response
 *
 * NO business logic here. No DB queries. Just HTTP in → service → HTTP out.
 *
 * The express-async-errors package ensures any thrown error is automatically
 * caught and forwarded to errorMiddleware — no try/catch needed here.
 */

'use strict';

const authService = require('./auth.service');
const ApiResponse = require('../../utils/ApiResponse');

class AuthController {
    async register(req, res) {
        const { username, email, password, bio } = req.body;
        const result = await authService.register({ username, email, password, bio });
        res.status(201).json(ApiResponse.success(result, 'Registration successful'));
    }

    async login(req, res) {
        const { email, password } = req.body;
        const result = await authService.login({ email, password });
        res.status(200).json(ApiResponse.success(result, 'Login successful'));
    }

    async getMe(req, res) {
        const user = await authService.getMe(req.user.id);
        res.status(200).json(ApiResponse.success(user, 'Profile fetched'));
    }
}

module.exports = new AuthController();
