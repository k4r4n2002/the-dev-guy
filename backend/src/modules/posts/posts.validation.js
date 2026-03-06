/**
 * modules/posts/posts.validation.js — Joi validation for posts
 */

'use strict';

const Joi = require('joi');

const createPostSchema = Joi.object({
    title: Joi.string().min(3).max(150).trim().required(),
    content: Joi.string().min(10).max(50000).required(),
    tags: Joi.array().items(Joi.string().max(30)).max(10).default([]),
});

const updatePostSchema = Joi.object({
    title: Joi.string().min(3).max(150).trim(),
    content: Joi.string().min(10).max(50000),
    tags: Joi.array().items(Joi.string().max(30)).max(10),
}).min(1); // At least one field must be provided

module.exports = { createPostSchema, updatePostSchema };
