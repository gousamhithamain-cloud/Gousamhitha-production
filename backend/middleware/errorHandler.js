// Global Error Handler Middleware
// Catches all errors and returns standardized responses

const { ApiResponse } = require('../utils/response');

class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}

// Enhanced error logging
const logError = (err, req) => {
    const timestamp = new Date().toISOString();
    const errorInfo = {
        timestamp,
        message: err.message,
        statusCode: err.statusCode || 500,
        path: req.path,
        method: req.method,
        ip: req.ip,
        query: req.query,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    };

    // Log to console
    console.error('❌ Error:', JSON.stringify(errorInfo, null, 2));

    // In production, you could send this to a logging service (e.g., Winston, Sentry)
    if (process.env.NODE_ENV === 'production') {
        // TODO: Send to error tracking service
        // Example: logger.error(errorInfo)
    }
};

// Error handler middleware
const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;
    error.statusCode = err.statusCode || 500;

    // Log error
    logError(err, req);

    // Handle specific error types

    // Supabase duplicate key error
    if (err.code === '23505') {
        error = new AppError('This record already exists. Please check your input.', 409);
    }

    // Supabase validation error
    if (err.name === 'ValidationError' || err.code === '42601') {
        error = new AppError('Invalid data format provided', 400);
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        error = new AppError('Invalid authentication token', 401);
    }

    if (err.name === 'TokenExpiredError') {
        error = new AppError('Authentication token has expired', 401);
    }

    // Validation errors from Joi
    if (err.statusCode === 400 && err.isOperational) {
        error.statusCode = 400;
    }

    // CORS errors
    if (err.message && err.message.includes('CORS')) {
        error = new AppError('Cross-Origin Request Blocked', 403);
    }

    // Send error response with standardized format
    const response = new ApiResponse(
        error.statusCode,
        null,
        error.message || 'Internal server error'
    );

    res.status(error.statusCode).json({
        ...response,
        success: false,
        error: error.message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

// Async handler wrapper to catch errors in async functions
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// 404 handler
const notFound = (req, res, next) => {
    const error = new AppError(`Route not found: ${req.originalUrl}`, 404);
    next(error);
};

// Catch-all error handler (must be last middleware)
const globalErrorHandler = (err, req, res, next) => {
    // Prevent duplicate error handling
    if (res.headersSent) {
        return next(err);
    }

    // If error is not operational, it's a programming error
    if (!err.isOperational && err.statusCode !== 400) {
        console.error('💥 PROGRAMMING ERROR - Not operational:', {
            name: err.name,
            message: err.message,
            stack: err.stack
        });

        return res.status(500).json(new ApiResponse(
            500,
            null,
            'An unexpected error occurred. Please try again later.'
        ));
    }

    errorHandler(err, req, res, next);
};

module.exports = { errorHandler, globalErrorHandler, asyncHandler, AppError, notFound, logError };
