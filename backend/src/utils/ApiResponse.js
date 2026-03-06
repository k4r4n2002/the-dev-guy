/**
 * utils/ApiResponse.js — Standardized API Response Shape
 *
 * WHY STANDARDIZE RESPONSES?
 * Every endpoint should return the same JSON shape. This makes it trivial
 * for the frontend to handle responses — it always knows where to find the
 * data, the message, and the pagination info.
 *
 * Shape:
 * {
 *   "success": true,
 *   "message": "Posts fetched successfully",
 *   "data": [...],
 *   "pagination": { "page": 1, "limit": 10, "total": 45, "pages": 5 }
 * }
 *
 * Usage in a controller:
 *   res.status(200).json(ApiResponse.success(posts, 'Posts fetched', pagination));
 *   res.status(201).json(ApiResponse.success(post, 'Post created'));
 */

'use strict';

class ApiResponse {
    /**
     * Successful response
     * @param {*} data - The payload to return
     * @param {string} [message='Success'] - Human-readable message
     * @param {object|null} [pagination] - Optional pagination metadata
     */
    static success(data, message = 'Success', pagination = null) {
        const response = {
            success: true,
            message,
            data,
        };

        if (pagination) {
            response.pagination = pagination;
        }

        return response;
    }

    /**
     * Build a pagination metadata object from query params and total count
     * @param {number} page - Current page (1-indexed)
     * @param {number} limit - Items per page
     * @param {number} total - Total number of documents
     */
    static paginate(page, limit, total) {
        return {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / limit),
        };
    }
}

module.exports = ApiResponse;
