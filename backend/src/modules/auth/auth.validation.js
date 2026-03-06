/**
 * modules/auth/auth.validation.js — Joi Validation Schemas
 *
 * Joi schemas define the "contract" for request bodies.
 * They're used with the validate() middleware factory.
 *
 * Benefits:
 * - Validation logic lives separate from controller
 * - Self-documenting — easy to see exactly what each endpoint accepts
 * - Joi coerces types (e.g., trims whitespace) before the request reaches the controller
 */

'use strict';

const Joi = require('joi');

const registerSchema = Joi.object({
    username: Joi.string().alphanum().min(3).max(30).trim().required().messages({
        'string.alphanum': 'Username can only contain letters and numbers',
        'string.min': 'Username must be at least 3 characters',
        'string.max': 'Username cannot exceed 30 characters',
        'any.required': 'Username is required',
    }),
    email: Joi.string().email().trim().lowercase().required().messages({
        'string.email': 'Please enter a valid email address',
        'any.required': 'Email is required',
    }),
    password: Joi.string().min(8).required().messages({
        'string.min': 'Password must be at least 8 characters',
        'any.required': 'Password is required',
    }),
    bio: Joi.string().max(300).optional().allow(''),
});

const loginSchema = Joi.object({
    email: Joi.string().email().trim().lowercase().required(),
    password: Joi.string().required(),
});

module.exports = { registerSchema, loginSchema };
