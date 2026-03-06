/**
 * modules/comments/comments.repository.js
 */

'use strict';

const Comment = require('./comments.schema');

class CommentsRepository {
    async findByPost(postId) {
        return Comment.find({ post: postId })
            .sort({ createdAt: -1 })
            .populate('author', 'username avatar')
            .populate('parentComment', '_id')
            .lean();
    }

    async findById(id) {
        return Comment.findById(id).lean();
    }

    async create({ content, post, author, parentComment }) {
        const comment = new Comment({ content, post, author, parentComment: parentComment || null });
        await comment.save();
        return comment.populate('author', 'username avatar');
    }

    async delete(id) {
        return Comment.findByIdAndDelete(id);
    }
}

module.exports = new CommentsRepository();
