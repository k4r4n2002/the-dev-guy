/**
 * modules/comments/comments.service.js
 */

'use strict';

const commentsRepository = require('./comments.repository');
const postsRepository = require('../posts/posts.repository');
const ApiError = require('../../utils/ApiError');

class CommentsService {
    async getCommentsByPost(postId) {
        const post = await postsRepository.findById(postId);
        if (!post) throw ApiError.notFound('Post not found');
        return commentsRepository.findByPost(postId);
    }

    async addComment({ content, postId, authorId, parentComment }) {
        const post = await postsRepository.findById(postId);
        if (!post) throw ApiError.notFound('Post not found');

        const comment = await commentsRepository.create({
            content,
            post: postId,
            author: authorId,
            parentComment,
        });

        // Keep denormalized comment count up to date
        await postsRepository.incrementCommentCount(postId, 1);

        return comment;
    }

    async deleteComment(commentId, requestingUserId) {
        const comment = await commentsRepository.findById(commentId);
        if (!comment) throw ApiError.notFound('Comment not found');

        if (comment.author.toString() !== requestingUserId.toString()) {
            throw ApiError.forbidden('You can only delete your own comments');
        }

        await commentsRepository.delete(commentId);

        // Decrement the post's comment count
        await postsRepository.incrementCommentCount(comment.post, -1);
    }
}

module.exports = new CommentsService();
