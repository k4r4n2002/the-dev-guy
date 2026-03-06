/**
 * modules/posts/posts.schema.js — Post Mongoose Schema
 *
 * KEY CONCEPTS:
 * - ObjectId references (ref) create relationships between collections
 * - Indexes speed up common queries (.index())
 * - Array of ObjectIds for "likes" (efficient for toggle like/unlike)
 * - Virtual for computed fields (likeCount, commentCount)
 */

'use strict';

const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Post title is required'],
            trim: true,
            maxlength: [150, 'Title cannot exceed 150 characters'],
        },
        content: {
            type: String,
            required: [true, 'Post content is required'],
            maxlength: [50000, 'Content cannot exceed 50000 characters'],
        },
        // Reference to the User who authored this post
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true, // fast lookup by author
        },
        tags: {
            type: [String],
            default: [],
            // Normalize tags to lowercase and remove duplicates before saving
        },
        // Array of User ObjectIds who liked this post — length = likeCount
        likes: {
            type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
            default: [],
        },
        // Denormalized comment count for fast display without an extra query
        commentCount: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// ── Indexes ────────────────────────────────────────────────────────────────
postSchema.index({ createdAt: -1 });        // Feed sorted by newest
postSchema.index({ tags: 1 });              // Filter by tag
postSchema.index({ title: 'text', content: 'text' }); // Full-text search

// ── Virtuals ───────────────────────────────────────────────────────────────
postSchema.virtual('likeCount').get(function () {
    return this.likes.length;
});

// ── Pre-save: normalize tags ───────────────────────────────────────────────
postSchema.pre('save', function (next) {
    if (this.isModified('tags')) {
        this.tags = [...new Set(this.tags.map((t) => t.toLowerCase().trim()))];
    }
    next();
});

const Post = mongoose.model('Post', postSchema);
module.exports = Post;
