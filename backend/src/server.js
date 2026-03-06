/**
 * server.js — Application Entry Point
 *
 * This is the ONLY file that:
 *   1. Calls createApp() to get the configured Express app
 *   2. Connects to MongoDB
 *   3. Starts listening on the configured port
 *
 * Keeping the entry point separate from app.js means we can import app.js
 * in tests without starting the server or connecting to a real database.
 */

'use strict';

const { createApp } = require('./app');
const { connectDatabase } = require('./config/database');
const config = require('./config/env');

async function startServer() {
    // 1. Connect to MongoDB first — fail fast if it's unreachable
    await connectDatabase();

    // 2. Create the configured Express app
    const app = createApp();

    // 3. Start listening
    const server = app.listen(config.port, () => {
        console.log('');
        console.log('============================================================');
        console.log(`  🚀  DevLog API is running!`);
        console.log(`  Environment : ${config.nodeEnv}`);
        console.log(`  Port        : ${config.port}`);
        console.log(`  API Base    : http://localhost:${config.port}/api`);
        console.log(`  Health      : http://localhost:${config.port}/api/health`);
        console.log('============================================================');
        console.log('');
    });

    // Graceful shutdown on unhandled errors
    process.on('unhandledRejection', (err) => {
        console.error('💥  Unhandled Promise Rejection:', err);
        server.close(() => process.exit(1));
    });
}

startServer();
