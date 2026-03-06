/**
 * modules/posts/posts.routes.js — Posts API Routes
 *
 * GET    /api/posts            — public, paginated, filterable
 * GET    /api/posts/:id        — public
 * POST   /api/posts            — private (auth required)
 * PUT    /api/posts/:id        — private (auth + ownership required)
 * DELETE /api/posts/:id        — private (auth + ownership required)
 * POST   /api/posts/:id/like   — private (toggle like)
 */

'use strict';

const express = require('express');
const postsController = require('./posts.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { validate } = require('../../middleware/validate.middleware');
const { createPostSchema, updatePostSchema } = require('./posts.validation');

const router = express.Router();

router.get('/', (req, res) => postsController.getAll(req, res));
router.get('/:id', (req, res) => postsController.getOne(req, res));
router.post('/', authenticate, validate(createPostSchema), (req, res) => postsController.create(req, res));
router.put('/:id', authenticate, validate(updatePostSchema), (req, res) => postsController.update(req, res));
router.delete('/:id', authenticate, (req, res) => postsController.remove(req, res));
router.post('/:id/like', authenticate, (req, res) => postsController.toggleLike(req, res));

module.exports = router;
