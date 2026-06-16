/*
 * ============================================================
 *  PAGINATION UTILITY
 *  Parses, validates, and applies pagination to Mongoose queries.
 *
 *  Usage in controllers:
 *    const { page, limit, skip } = parsePagination(req);
 *    const [results, total] = await Promise.all([
 *        Model.find(filter).sort(...).skip(skip).limit(limit).lean(),
 *        Model.countDocuments(filter),
 *    ]);
 *    return res.json(paginatedResponse(200, results, total, page, limit, "msg"));
 * ============================================================
 */

import { ApiError } from "./ApiError.js";

const DEFAULT_PAGE  = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT     = 100;

/**
 * Parse and validate pagination query parameters.
 * @param {Request} req - Express request object
 * @returns {{ page: number, limit: number, skip: number }}
 */
export const parsePagination = (req) => {
    let page  = parseInt(req.query.page,  10) || DEFAULT_PAGE;
    let limit = parseInt(req.query.limit, 10) || DEFAULT_LIMIT;

    if (page < 1) page = DEFAULT_PAGE;

    if (limit > MAX_LIMIT) {
        throw new ApiError(400, `limit cannot exceed ${MAX_LIMIT}. Requested: ${limit}`);
    }
    if (limit < 1) limit = DEFAULT_LIMIT;

    const skip = (page - 1) * limit;
    return { page, limit, skip };
};

/**
 * Build a standardized paginated API response.
 * Wraps data inside the existing ApiResponse-compatible shape.
 */
export const paginatedResponse = (statusCode, results, totalRecords, page, limit, message) => {
    const totalPages = Math.ceil(totalRecords / limit);

    return {
        statusCode,
        success: statusCode < 400,
        message,
        page,
        limit,
        totalRecords,
        totalPages,
        data: results,
    };
};
