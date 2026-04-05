// Security Middleware
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const xss = require('xss-clean');

// Rate limiting configuration
const createRateLimiter = (windowMs, max, message) => {
    return rateLimit({
        windowMs,
        max,
        message: { success: false, error: message },
        standardHeaders: true,
        legacyHeaders: false,
        // Skip successful requests from count
        skipSuccessfulRequests: false,
        // Skip failed requests from count
        skipFailedRequests: false
    });
};

// General API rate limiter - 100 requests per 15 minutes
const apiLimiter = createRateLimiter(
    15 * 60 * 1000, // 15 minutes
    100,
    'Too many requests from this IP, please try again later'
);

// Strict rate limiter for auth endpoints - 5 requests per 15 minutes
const authLimiter = createRateLimiter(
    15 * 60 * 1000, // 15 minutes
    5,
    'Too many authentication attempts, please try again later'
);

// Moderate rate limiter for write operations - 20 requests per 15 minutes
const writeLimiter = createRateLimiter(
    15 * 60 * 1000, // 15 minutes
    20,
    'Too many write requests, please slow down'
);

// Helmet configuration for security headers
const helmetConfig = helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", 'data:', 'https:'],
        },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" }
});

// XSS protection middleware
const xssProtection = xss();

// Input sanitization middleware
const sanitizeInput = (req, res, next) => {
    // Sanitize query parameters
    if (req.query) {
        Object.keys(req.query).forEach(key => {
            if (typeof req.query[key] === 'string') {
                req.query[key] = req.query[key].trim();
            }
        });
    }

    // Sanitize body parameters
    if (req.body) {
        Object.keys(req.body).forEach(key => {
            if (typeof req.body[key] === 'string') {
                req.body[key] = req.body[key].trim();
            }
        });
    }

    next();
};

// CORS configuration
const corsOptions = {
    origin: function (origin, callback) {
        const allowedOrigins = [
            process.env.FRONTEND_URL,
            'http://localhost:3000',
            'http://127.0.0.1:3000',
            'http://localhost:5500',
            'http://127.0.0.1:5500'
        ].filter(Boolean);

        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

module.exports = {
    apiLimiter,
    authLimiter,
    writeLimiter,
    helmetConfig,
    xssProtection,
    sanitizeInput,
    corsOptions
};
