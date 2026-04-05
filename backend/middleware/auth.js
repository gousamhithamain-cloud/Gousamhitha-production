// Authentication & Authorization Middleware
const supabase = require('../config/supabase');
const { AppError } = require('./errorHandler');

/**
 * Middleware: authenticate
 * Purpose: Verify JWT token and attach user to request
 * Usage: Add to routes that require authentication
 * 
 * Flow:
 * 1. Extract token from Authorization header
 * 2. Verify token with Supabase Auth
 * 3. Fetch user details from database (including role)
 * 4. Attach user to req.user
 * 5. Call next()
 * 
 * Errors:
 * - 401 if no token provided
 * - 401 if token is invalid
 * - 401 if token is expired
 * - 401 if user not found
 */
const authenticate = async (req, res, next) => {
    try {
        // Extract token from Authorization header
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new AppError('No authentication token provided', 401);
        }

        const token = authHeader.replace('Bearer ', '');

        // Verify token with Supabase Auth
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            throw new AppError('Invalid or expired token', 401);
        }

        // Fetch user details from database (including role)
        const { data: userProfile, error: profileError } = await supabase
            .from('users')
            .select('id, email, first_name, last_name, role')
            .eq('id', user.id)
            .single();

        if (profileError || !userProfile) {
            throw new AppError('User profile not found', 401);
        }

        // Attach user to request object
        req.user = {
            id: userProfile.id,
            email: userProfile.email,
            firstName: userProfile.first_name,
            lastName: userProfile.last_name,
            role: userProfile.role || 'customer'
        };

        // Continue to next middleware/route handler
        next();
    } catch (error) {
        // Pass error to global error handler
        next(error);
    }
};

/**
 * Middleware Factory: requireRole
 * Purpose: Restrict access based on user role
 * Usage: requireRole(['admin']) or requireRole(['admin', 'customer'])
 * 
 * Flow:
 * 1. Check if req.user exists (must run after authenticate)
 * 2. Check if req.user.role is in allowedRoles
 * 3. If yes, call next()
 * 4. If no, throw 403 error
 * 
 * @param {Array<string>} allowedRoles - Array of allowed roles
 * @returns {Function} Middleware function
 * 
 * Errors:
 * - 401 if user not authenticated (req.user missing)
 * - 403 if user role not in allowedRoles
 */
const requireRole = (allowedRoles) => {
    return (req, res, next) => {
        try {
            // Check if user is authenticated
            if (!req.user) {
                throw new AppError('Authentication required', 401);
            }

            // Check if user role is in allowed roles
            if (!allowedRoles.includes(req.user.role)) {
                throw new AppError(
                    `Access denied. Required role: ${allowedRoles.join(' or ')}`,
                    403
                );
            }

            // User has required role, continue
            next();
        } catch (error) {
            next(error);
        }
    };
};

/**
 * Middleware: requireOwnership
 * Purpose: Verify user owns the resource or is admin
 * Usage: Add after authenticate to verify resource ownership
 * 
 * Flow:
 * 1. Check if req.user exists
 * 2. Check if user is admin (bypass ownership check)
 * 3. Check if userId in params matches req.user.id
 * 4. If yes, call next()
 * 5. If no, throw 403 error
 * 
 * Errors:
 * - 401 if user not authenticated
 * - 403 if user doesn't own resource and is not admin
 */
const requireOwnership = (req, res, next) => {
    try {
        // Check if user is authenticated
        if (!req.user) {
            throw new AppError('Authentication required', 401);
        }

        // Admin can access any resource
        if (req.user.role === 'admin') {
            return next();
        }

        // Extract userId from params (could be userId, id, or itemId)
        const resourceUserId = req.params.userId || req.params.id;

        // Check if user owns the resource
        if (resourceUserId && resourceUserId !== req.user.id) {
            throw new AppError('Access denied. You can only access your own resources', 403);
        }

        // User owns the resource, continue
        next();
    } catch (error) {
        next(error);
    }
};

/**
 * Middleware Factory: requireResourceOwnership
 * Purpose: Verify user owns a resource by fetching it from database
 * Usage: requireResourceOwnership('orders', 'id', 'user_id')
 * 
 * Flow:
 * 1. Check if req.user exists
 * 2. Check if user is admin (bypass ownership check)
 * 3. Fetch resource from database using resourceId from params
 * 4. Check if resource.ownerField === req.user.id
 * 5. If yes, call next()
 * 6. If no, throw 403 error
 * 
 * @param {string} tableName - Database table name (e.g., 'orders', 'cart')
 * @param {string} paramName - Parameter name in req.params (e.g., 'id', 'orderId')
 * @param {string} ownerField - Field name in DB that contains user_id (e.g., 'user_id')
 * @returns {Function} Middleware function
 * 
 * Errors:
 * - 401 if user not authenticated
 * - 404 if resource not found
 * - 403 if user doesn't own resource and is not admin
 */
const requireResourceOwnership = (tableName, paramName, ownerField) => {
    return async (req, res, next) => {
        try {
            // Check if user is authenticated
            if (!req.user) {
                throw new AppError('Authentication required', 401);
            }

            // Admin can access any resource
            if (req.user.role === 'admin') {
                return next();
            }

            // Get resource ID from params
            const resourceId = req.params[paramName];

            if (!resourceId) {
                throw new AppError('Resource ID not provided', 400);
            }

            // Fetch resource from database
            const { data: resource, error } = await supabase
                .from(tableName)
                .select(ownerField)
                .eq('id', resourceId)
                .single();

            if (error || !resource) {
                throw new AppError('Resource not found', 404);
            }

            // Check if user owns the resource
            if (resource[ownerField] !== req.user.id) {
                throw new AppError('Access denied. You can only access your own resources', 403);
            }

            // User owns the resource, continue
            next();
        } catch (error) {
            next(error);
        }
    };
};

/**
 * Middleware: optionalAuth
 * Purpose: Attach user if token provided, but don't require it
 * Usage: Add to routes that work with or without authentication
 * 
 * Flow:
 * 1. Try to extract and verify token
 * 2. If valid, attach user to req.user
 * 3. If invalid or missing, continue without user
 * 4. Always call next()
 * 
 * Note: Never throws errors, always continues
 */
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next(); // No token, continue without user
        }

        const token = authHeader.replace('Bearer ', '');

        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            return next(); // Invalid token, continue without user
        }

        const { data: userProfile } = await supabase
            .from('users')
            .select('id, email, first_name, last_name, role')
            .eq('id', user.id)
            .single();

        if (userProfile) {
            req.user = {
                id: userProfile.id,
                email: userProfile.email,
                firstName: userProfile.first_name,
                lastName: userProfile.last_name,
                role: userProfile.role || 'customer'
            };
        }

        next();
    } catch (error) {
        // Ignore errors, continue without user
        next();
    }
};

module.exports = {
    authenticate,
    requireRole,
    requireOwnership,
    requireResourceOwnership,
    optionalAuth
};
