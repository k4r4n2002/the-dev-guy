/**
 * modules/posts/posts.controller.js — Posts HTTP Handlers (thin layer)
 */

'use strict';

const postsService = require('./posts.service');
const ApiResponse = require('../../utils/ApiResponse');

class PostsController {
    async getAll(req, res) {
        const { page = 1, limit = 10, tag, search } = req.query;
        const { posts, pagination } = await postsService.getAllPosts({
            page: parseInt(page),
            limit: parseInt(limit),
            tag,
            search,
        });
        res.json(ApiResponse.success(posts, 'Posts fetched', pagination));
    }

    async getOne(req, res) {
        const post = await postsService.getPostById(req.params.id);
        res.json(ApiResponse.success(post, 'Post fetched'));
    }

    async create(req, res) {
        const { title, content, tags } = req.body;
        const post = await postsService.createPost({ title, content, tags, author: req.user.id });
        res.status(201).json(ApiResponse.success(post, 'Post created'));
    }

    async update(req, res) {
        const post = await postsService.updatePost(req.params.id, req.user.id, req.body);
        res.json(ApiResponse.success(post, 'Post updated'));
    }

    async remove(req, res) {
        await postsService.deletePost(req.params.id, req.user.id);
        res.json(ApiResponse.success(null, 'Post deleted'));
    }

    async toggleLike(req, res) {
        const result = await postsService.toggleLike(req.params.id, req.user.id);
        res.json(ApiResponse.success(result, result.liked ? 'Post liked' : 'Post unliked'));
    }
}

module.exports = new PostsController();
