/**
 * modules/auth/auth.repository.js — Data Access Layer (Repository Pattern)
 *
 * Design Pattern: REPOSITORY
 *
 * The Repository Pattern abstracts all database interactions into a single
 * class. Nothing outside this file should ever call User.find() or User.save()
 * directly. This gives us:
 *
 *   1. TESTABILITY — swap the Mongoose model with a mock in unit tests
 *   2. SEPARATION OF CONCERNS — service layer never touches Mongoose syntax
 *   3. SINGLE PLACE to optimize DB queries (add indexes, pagination, lean())
 *
 * "Lean" queries (.lean()) return plain JS objects instead of full Mongoose
 * documents — much faster for read-only operations.
 */

'use strict';

const User = require('./auth.schema');

class AuthRepository {
    /**
     * Create a new user document (password must already be set to plain text;
     * the pre-save hook will hash it).
     */
    async create({ username, email, password, bio }) {
        const user = new User({ username, email, passwordHash: password, bio });
        await user.save();
        return user;
    }

    /**
     * Find user by email (includes passwordHash for comparison)
     * We explicitly select '+passwordHash' because the field has select:false
     */
    async findByEmailWithPassword(email) {
        return User.findOne({ email }).select('+passwordHash');
    }

    /** Find user by email without the password field */
    async findByEmail(email) {
        return User.findOne({ email }).lean();
    }

    /** Find user by MongoDB _id */
    async findById(id) {
        return User.findById(id).lean();
    }

    /** Find user by username */
    async findByUsername(username) {
        return User.findOne({ username }).lean();
    }

    /** Update a user document by id */
    async update(id, updates) {
        return User.findByIdAndUpdate(id, updates, { new: true, runValidators: true }).lean();
    }
}

// Export a single instance — Singleton
module.exports = new AuthRepository();
