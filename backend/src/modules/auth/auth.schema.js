/**
 * modules/auth/auth.schema.js — User Mongoose Schema
 *
 * KEY CONCEPTS:
 * - Mongoose Schema defines the shape of documents in MongoDB
 * - `select: false` hides passwordHash from queries by default (security!)
 * - Pre-save hooks run before .save() — perfect for hashing passwords
 * - Instance methods let us add behaviour to documents
 * - timestamps: true adds createdAt and updatedAt automatically
 */

'use strict';

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: [true, 'Username is required'],
            unique: true,
            trim: true,
            minlength: [3, 'Username must be at least 3 characters'],
            maxlength: [30, 'Username cannot exceed 30 characters'],
            // Lowercase transform ensures case-insensitive uniqueness
            lowercase: true,
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            trim: true,
            lowercase: true,
            match: [/^\S+@\S+\.\S+$/, 'Invalid email format'],
        },
        passwordHash: {
            type: String,
            required: [true, 'Password is required'],
            select: false, // NEVER returned in queries unless explicitly selected
        },
        bio: {
            type: String,
            maxlength: [300, 'Bio cannot exceed 300 characters'],
            default: '',
        },
        avatar: {
            type: String, // URL to avatar image
            default: '',
        },
    },
    {
        timestamps: true, // auto adds createdAt, updatedAt
        // Virtual fields are not stored in DB but can be computed and included in JSON
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// ── Pre-save Hook: Hash the password before saving ─────────────────────────
// This runs every time .save() is called. We only re-hash if passwordHash changed.
userSchema.pre('save', async function (next) {
    // `this` refers to the document being saved
    if (!this.isModified('passwordHash')) return next();

    const SALT_ROUNDS = 12;
    this.passwordHash = await bcrypt.hash(this.passwordHash, SALT_ROUNDS);
    next();
});

// ── Instance Method: Compare a plaintext password against the stored hash ──
userSchema.methods.comparePassword = async function (plaintext) {
    return bcrypt.compare(plaintext, this.passwordHash);
};

// ── Virtual: Derive a "name" used in responses ─────────────────────────────
userSchema.virtual('displayName').get(function () {
    return `@${this.username}`;
});

const User = mongoose.model('User', userSchema);

module.exports = User;
