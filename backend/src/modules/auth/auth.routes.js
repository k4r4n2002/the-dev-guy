/**
 * modules/auth/auth.routes.js — Auth Route Definitions
 *
 * Each route applies:
 *   1. Optional: validate() middleware to validate the request body
 *   2. Optional: authenticate middleware to require a logged-in user
 *   3. The controller method (actual handler)
 *
 * POST /api/auth/register  — public
 * POST /api/auth/login     — public
 * GET  /api/auth/me        — private (requires JWT)
 */

'use strict';

const express = require('express');
const authController = require('./auth.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { validate } = require('../../middleware/validate.middleware');
const { registerSchema, loginSchema } = require('./auth.validation');

const router = express.Router();

router.post('/register', validate(registerSchema), (req, res) => authController.register(req, res));
router.post('/login', validate(loginSchema), (req, res) => authController.login(req, res));
router.get('/me', authenticate, (req, res) => authController.getMe(req, res));

module.exports = router;
