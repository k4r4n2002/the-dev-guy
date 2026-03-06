/**
 * config/database.js — MongoDB Connection (Singleton)
 *
 * Design Pattern: SINGLETON + EVENT-DRIVEN
 *
 * Mongoose maintains an internal connection pool. We connect once and
 * mongoose.connection events keep us informed of the state.
 *
 * Key concepts:
 * - mongoose.connect() returns a Promise — always await it
 * - Connection events: 'connected', 'error', 'disconnected'
 * - We add a single SIGINT handler so Ctrl+C cleanly closes the connection
 */

'use strict';

const mongoose = require('mongoose');
const config = require('./env');

let isConnected = false;

async function connectDatabase() {
    if (isConnected) {
        console.log('📦  MongoDB already connected — reusing existing connection.');
        return;
    }

    try {
        await mongoose.connect(config.mongoUri, {
            // These options prevent deprecation warnings in Mongoose 8
            dbName: 'devlog',
        });

        isConnected = true;
        console.log('✅  MongoDB connected successfully.');
    } catch (error) {
        console.error('❌  MongoDB connection failed:', error.message);
        process.exit(1); // Fail fast — don't run the server without a DB
    }
}

// ── Connection lifecycle events ───────────────────────────────────────────────
mongoose.connection.on('disconnected', () => {
    isConnected = false;
    console.warn('⚠️  MongoDB disconnected.');
});

mongoose.connection.on('error', (err) => {
    console.error('❌  MongoDB error:', err.message);
});

// ── Graceful shutdown ─────────────────────────────────────────────────────────
// When the user Ctrl+C's the server, we close the DB connection cleanly
process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('🛑  MongoDB connection closed on SIGINT. Exiting.');
    process.exit(0);
});

module.exports = { connectDatabase };
