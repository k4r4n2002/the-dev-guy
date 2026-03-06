/**
 * modules/comments/comments.controller.js
 */

'use strict';

const commentsService = require('./comments.service');
const ApiResponse = require('../../utils/ApiResponse');

class CommentsController {
    async getByPost(req, res) {
        const comments = await commentsService.getCommentsByPost(req.params.postId);
        res.json(ApiResponse.success(comments, 'Comments fetched'));
    }

    async add(req, res) {
        const { content, parentComment } = req.body;
        const comment = await commentsService.addComment({
            content,
            postId: req.params.postId,
            authorId: req.user.id,
            parentComment,
        });
        res.status(201).json(ApiResponse.success(comment, 'Comment added'));
    }

    async remove(req, res) {
        await commentsService.deleteComment(req.params.commentId, req.user.id);
        res.json(ApiResponse.success(null, 'Comment deleted'));
    }
}

module.exports = new CommentsController();
