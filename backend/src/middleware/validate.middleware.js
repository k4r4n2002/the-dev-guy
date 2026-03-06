/**
 * middleware/validate.middleware.js — Joi Validation Factory
 *
 * Design Pattern: FACTORY FUNCTION — this module exports a function that
 * RETURNS a middleware. This is a very common Express pattern.
 *
 * Usage:
 *   const { validate } = require('./middleware/validate.middleware');
 *   const { registerSchema } = require('./modules/auth/auth.validation');
 *
 *   router.post('/register', validate(registerSchema), authController.register);
 *
 * The factory accepts a Joi schema and returns an Express middleware that:
 *   1. Validates req.body against the schema
 *   2. If valid: attaches the coerced value back to req.body and calls next()
 *   3. If invalid: throws ApiError(400) with all validation messages joined
 */

'use strict';

const ApiError = require('../utils/ApiError');

/**
 * @param {import('joi').ObjectSchema} schema - Joi schema to validate against
 * @returns {import('express').RequestHandler}
 */
function validate(schema) {
    return (req, _res, next) => {
        const { error, value } = schema.validate(req.body, {
            abortEarly: false,   // collect ALL errors, not just the first one
            stripUnknown: true,  // remove any keys not in the schema
        });

        if (error) {
            const message = error.details.map((d) => d.message).join(', ');
            throw ApiError.badRequest(message);
        }

        // Replace req.body with the Joi-coerced value (e.g., trimmed strings, type coercion)
        req.body = value;
        next();
    };
}

module.exports = { validate };
