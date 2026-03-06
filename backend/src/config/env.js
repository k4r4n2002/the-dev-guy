/**
 * config/env.js — Singleton Environment Configuration
 *
 * Design Pattern: SINGLETON
 *
 * We read and validate ALL environment variables in one place at startup.
 * If a required variable is missing, the process exits immediately ("fail fast").
 * This means you get a clear error at startup rather than a mysterious crash
 * deep inside a request handler.
 *
 * Usage:
 *   const config = require('./config/env');
 *   console.log(config.port); // 5000
 */

'use strict';

require('dotenv').config();

/**
 * Validates a required env var and throws if missing.
 * @param {string} name - Environment variable name
 * @param {string} [defaultValue] - Optional default value
 * @returns {string}
 */
function require_env(name, defaultValue) {
  const value = process.env[name] || defaultValue;
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

// Build and freeze the config object (immutable after creation)
const config = Object.freeze({
  // Server
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  isDevelopment: (process.env.NODE_ENV || 'development') === 'development',
  isProduction: process.env.NODE_ENV === 'production',

  // Database
  mongoUri: require_env('MONGODB_URI'),

  // JWT
  jwtSecret: require_env('JWT_SECRET'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',

  // CORS — split comma-separated string into an array
  corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:5173')
    .split(',')
    .map((o) => o.trim()),
});

module.exports = config;
