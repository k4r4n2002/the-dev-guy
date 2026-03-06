/**
 * modules/posts/posts.service.js — Posts Business Logic
 *
 * Authorization check: only the post author can edit or delete their post.
 * This is a business rule → belongs in the service, not the controller.
 */

'use strict';

const postsRepository = require('./posts.repository');
const ApiError = require('../../utils/ApiError');
const ApiResponse = require('../../utils/ApiResponse');

class PostsService {
    async getAllPosts({ page = 1, limit = 10, tag, search } = {}) {
        const { posts, total } = await postsRepository.findAll({ page, limit, tag, search });
        const pagination = ApiResponse.paginate(page, limit, total);
        return { posts, pagination };
    }

    async getPostById(postId) {
        const post = await postsRepository.findById(postId);
        if (!post) throw ApiError.notFound('Post not found');
        return post;
    }

    async createPost({ title, content, author, tags }) {
        return postsRepository.create({ title, content, author, tags });
    }

    async updatePost(postId, requestingUserId, updates) {
        const post = await postsRepository.findById(postId);
        if (!post) throw ApiError.notFound('Post not found');

        // Authorization: only the author can edit
        if (post.author._id.toString() !== requestingUserId.toString()) {
            throw ApiError.forbidden('You can only edit your own posts');
        }

        return postsRepository.update(postId, updates);
    }

    async deletePost(postId, requestingUserId) {
        const post = await postsRepository.findById(postId);
        if (!post) throw ApiError.notFound('Post not found');

        if (post.author._id.toString() !== requestingUserId.toString()) {
            throw ApiError.forbidden('You can only delete your own posts');
        }

        await postsRepository.delete(postId);
    }

    async toggleLike(postId, userId) {
        const post = await postsRepository.toggleLike(postId, userId);
        if (!post) throw ApiError.notFound('Post not found');
        return { liked: post.likes.some((id) => id.equals(userId)), likeCount: post.likes.length };
    }
}

module.exports = new PostsService();
