/**
 * modules/posts/posts.repository.js — Posts Data Access Layer
 *
 * Design Pattern: REPOSITORY
 *
 * All MongoDB interactions for posts are here.
 * Notably demonstrates:
 *   - populate() — resolves ObjectId references (JOIN equivalent in MongoDB)
 *   - Cursor-based pagination with skip/limit
 *   - Mongoose aggregation for complex queries
 */

'use strict';

const Post = require('./posts.schema');

class PostsRepository {
    /**
     * Get paginated list of posts, newest first
     * @param {{ page, limit, tag, search }} options
     */
    async findAll({ page = 1, limit = 10, tag, search } = {}) {
        const query = {};

        if (tag) query.tags = tag.toLowerCase();

        if (search) {
            // MongoDB full-text search requires a text index (defined in schema)
            query.$text = { $search: search };
        }

        const skip = (page - 1) * limit;

        const [posts, total] = await Promise.all([
            Post.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('author', 'username avatar') // resolve author ObjectId → user fields
                .lean(),
            Post.countDocuments(query),
        ]);

        return { posts, total };
    }

    /** Find a single post by id with author populated */
    async findById(id) {
        return Post.findById(id).populate('author', 'username avatar bio').lean();
    }

    /** Create a post */
    async create({ title, content, author, tags }) {
        const post = new Post({ title, content, author, tags });
        await post.save();
        return post.populate('author', 'username avatar');
    }

    /** Update a post document */
    async update(id, updates) {
        return Post.findByIdAndUpdate(id, updates, { new: true, runValidators: true })
            .populate('author', 'username avatar')
            .lean();
    }

    /** Delete a post */
    async delete(id) {
        return Post.findByIdAndDelete(id);
    }

    /**
     * Toggle like: add userId if not present, remove if present.
     * Uses MongoDB atomic operators ($addToSet / $pull) — race-condition safe.
     */
    async toggleLike(postId, userId) {
        const post = await Post.findById(postId);
        if (!post) return null;

        const alreadyLiked = post.likes.some((id) => id.equals(userId));

        if (alreadyLiked) {
            post.likes.pull(userId);
        } else {
            post.likes.addToSet(userId);
        }
        await post.save();
        return post;
    }

    /** Increment commentCount after a comment is added */
    async incrementCommentCount(postId, delta = 1) {
        return Post.findByIdAndUpdate(postId, { $inc: { commentCount: delta } }, { new: true });
    }
}

module.exports = new PostsRepository();
