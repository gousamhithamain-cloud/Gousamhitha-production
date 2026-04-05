/**
 * Standardized API Response Formatter
 * Ensures all responses follow a consistent structure
 */

class ApiResponse {
    constructor(statusCode, data = null, message = 'Success') {
        this.success = statusCode < 400;
        this.statusCode = statusCode;
        this.data = data;
        this.message = message;
        this.timestamp = new Date().toISOString();
    }
}

// Success response
const successResponse = (res, statusCode = 200, data = null, message = 'Success') => {
    return res.status(statusCode).json(new ApiResponse(statusCode, data, message));
};

// Created response
const createdResponse = (res, data = null, message = 'Resource created successfully') => {
    return res.status(201).json(new ApiResponse(201, data, message));
};

// Error response
const errorResponse = (res, statusCode = 500, message = 'Internal server error') => {
    return res.status(statusCode).json(new ApiResponse(statusCode, null, message));
};

// Batch response
const batchResponse = (res, statusCode = 200, items = [], total = 0, message = 'Success') => {
    return res.status(statusCode).json({
        success: statusCode < 400,
        statusCode,
        data: {
            items,
            total,
            count: items.length
        },
        message,
        timestamp: new Date().toISOString()
    });
};

// Pagination response
const paginatedResponse = (res, items = [], page = 1, limit = 10, total = 0, message = 'Success') => {
    const totalPages = Math.ceil(total / limit);
    return res.status(200).json({
        success: true,
        statusCode: 200,
        data: {
            items,
            pagination: {
                page,
                limit,
                total,
                totalPages,
                hasMore: page < totalPages
            }
        },
        message,
        timestamp: new Date().toISOString()
    });
};

module.exports = {
    ApiResponse,
    successResponse,
    createdResponse,
    errorResponse,
    batchResponse,
    paginatedResponse
};
