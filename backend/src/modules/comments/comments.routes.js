/**
 * modules/comments/comments.routes.js
 *
 * GET    /api/posts/:postId/comments          — public
 * POST   /api/posts/:postId/comments          — private
 * DELETE /api/posts/:postId/comments/:commentId — private (author only)
 */

'use strict';

const express = require('express');
const commentsController = require('./comments.controller');
const { authenticate } = require('../../middleware/auth.middleware');

// mergeParams: true is needed to access :postId from the parent router
const router = express.Router({ mergeParams: true });

router.get('/', (req, res) => commentsController.getByPost(req, res));
router.post('/', authenticate, (req, res) => commentsController.add(req, res));
router.delete('/:commentId', authenticate, (req, res) => commentsController.remove(req, res));

module.exports = router;
