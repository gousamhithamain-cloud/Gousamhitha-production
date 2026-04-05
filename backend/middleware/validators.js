// Request Validation Middleware using Joi
const Joi = require('joi');
const { AppError } = require('./errorHandler');

// Validation middleware factory for request body
const validate = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body, {
            abortEarly: false, // Return all errors
            stripUnknown: true // Remove unknown fields
        });

        if (error) {
            const errorMessage = error.details.map(detail => detail.message).join(', ');
            return next(new AppError(errorMessage, 400));
        }

        // Replace req.body with validated and sanitized data
        req.body = value;
        next();
    };
};

// Validation middleware factory for query parameters
const validateQuery = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.query, {
            abortEarly: false,
            stripUnknown: true
        });

        if (error) {
            const errorMessage = error.details.map(detail => detail.message).join(', ');
            return next(new AppError(errorMessage, 400));
        }

        req.query = value;
        next();
    };
};

// Validation middleware factory for path parameters
const validateParams = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.params, {
            abortEarly: false,
            stripUnknown: true
        });

        if (error) {
            const errorMessage = error.details.map(detail => detail.message).join(', ');
            return next(new AppError(errorMessage, 400));
        }

        req.params = value;
        next();
    };
};

// Validation schemas
const schemas = {
    // Product validation
    createProduct: Joi.object({
        name: Joi.string().trim().min(2).max(200).required()
            .messages({
                'string.empty': 'Product name is required',
                'string.min': 'Product name must be at least 2 characters',
                'string.max': 'Product name cannot exceed 200 characters'
            }),
        category: Joi.string().trim().min(2).max(100).required()
            .messages({
                'string.empty': 'Category is required'
            }),
        price: Joi.number().positive().precision(2).required()
            .messages({
                'number.base': 'Price must be a number',
                'number.positive': 'Price must be positive'
            }),
        stock: Joi.number().integer().min(0).required()
            .messages({
                'number.base': 'Stock must be a number',
                'number.integer': 'Stock must be an integer',
                'number.min': 'Stock cannot be negative'
            }),
        image_url: Joi.string().uri().allow('', null).optional(),
        unit: Joi.string().trim().max(50).allow('', null).optional(),
        unit_quantity: Joi.string().trim().max(50).allow('', null).optional(),
        display_unit: Joi.string().trim().max(100).allow('', null).optional()
    }),

    updateProduct: Joi.object({
        name: Joi.string().trim().min(2).max(200).optional(),
        category: Joi.string().trim().min(2).max(100).optional(),
        price: Joi.number().positive().precision(2).optional(),
        stock: Joi.number().integer().min(0).optional(),
        image_url: Joi.string().uri().allow('', null).optional(),
        unit: Joi.string().trim().max(50).allow('', null).optional(),
        unit_quantity: Joi.string().trim().max(50).allow('', null).optional(),
        display_unit: Joi.string().trim().max(100).allow('', null).optional(),
        in_stock: Joi.boolean().optional()
    }).min(1), // At least one field must be present

    // Cart validation
    addToCart: Joi.object({
        user_id: Joi.string().uuid().required()
            .messages({
                'string.empty': 'User ID is required',
                'string.guid': 'Invalid user ID format'
            }),
        product_id: Joi.string().uuid().required()
            .messages({
                'string.empty': 'Product ID is required',
                'string.guid': 'Invalid product ID format'
            }),
        quantity: Joi.number().integer().min(1).max(100).required()
            .messages({
                'number.base': 'Quantity must be a number',
                'number.integer': 'Quantity must be an integer',
                'number.min': 'Quantity must be at least 1',
                'number.max': 'Quantity cannot exceed 100'
            })
    }),

    updateCartItem: Joi.object({
        quantity: Joi.number().integer().min(1).max(100).required()
            .messages({
                'number.base': 'Quantity must be a number',
                'number.min': 'Quantity must be at least 1',
                'number.max': 'Quantity cannot exceed 100'
            })
    }),

    // Order validation
    createOrder: Joi.object({
        user_id: Joi.string().uuid().required(),
        customer_name: Joi.string().trim().min(2).max(200).required()
            .messages({
                'string.empty': 'Customer name is required',
                'string.min': 'Name must be at least 2 characters'
            }),
        customer_email: Joi.string().email().required()
            .messages({
                'string.empty': 'Email is required',
                'string.email': 'Invalid email format'
            }),
        customer_phone: Joi.string().pattern(/^[0-9]{10}$/).allow('', null).optional()
            .messages({
                'string.pattern.base': 'Phone must be 10 digits'
            }),
        delivery_address: Joi.string().trim().min(10).max(500).required()
            .messages({
                'string.empty': 'Delivery address is required',
                'string.min': 'Address must be at least 10 characters'
            }),
        city: Joi.string().trim().max(100).allow('', null).optional(),
        pincode: Joi.string().pattern(/^[0-9]{6}$/).allow('', null).optional()
            .messages({
                'string.pattern.base': 'Pincode must be 6 digits'
            }),
        order_notes: Joi.string().trim().max(500).allow('', null).optional(),
        subtotal: Joi.number().positive().precision(2).required(),
        delivery_charge: Joi.number().min(0).precision(2).default(0),
        total_amount: Joi.number().positive().precision(2).required()
            .messages({
                'number.positive': 'Total amount must be positive'
            }),
        payment_method: Joi.string().valid('COD', 'UPI', 'Card', 'NetBanking').default('COD'),
        items: Joi.array().items(
            Joi.object({
                product_id: Joi.string().uuid().required(),
                product_name: Joi.string().required(),
                quantity: Joi.number().integer().min(1).required(),
                price: Joi.number().positive().required()
            })
        ).min(1).required()
            .messages({
                'array.min': 'Order must contain at least one item'
            })
    }),

    updateOrderStatus: Joi.object({
        status: Joi.string().valid('Pending', 'Packed', 'Shipped', 'Delivered', 'Cancelled').required()
            .messages({
                'any.only': 'Invalid status value'
            })
    }),

    updatePaymentStatus: Joi.object({
        payment_status: Joi.string().valid('Pending', 'Paid', 'Failed', 'Refunded').required()
            .messages({
                'any.only': 'Invalid payment status. Must be one of: Pending, Paid, Failed, Refunded'
            })
    }),

    // User validation
    createUser: Joi.object({
        id: Joi.string().uuid().required(),
        email: Joi.string().email().required(),
        first_name: Joi.string().trim().min(1).max(100).required(),
        last_name: Joi.string().trim().max(100).allow('', null).optional(),
        phone: Joi.string().pattern(/^[0-9]{10}$/).allow('', null).optional()
    }),

    updateUser: Joi.object({
        first_name: Joi.string().trim().min(1).max(100).optional(),
        last_name: Joi.string().trim().max(100).allow('', null).optional(),
        phone: Joi.string().pattern(/^[0-9]{10}$/).allow('', null).optional()
    }).min(1),

    // Auth validation
    signup: Joi.object({
        email: Joi.string().email().required()
            .messages({
                'string.email': 'Invalid email format'
            }),
        password: Joi.string().min(6).max(100).required()
            .messages({
                'string.min': 'Password must be at least 6 characters',
                'string.max': 'Password cannot exceed 100 characters'
            }),
        full_name: Joi.string().trim().min(2).max(200).required()
            .messages({
                'string.empty': 'Full name is required'
            }),
        phone: Joi.string().pattern(/^[0-9]{10}$/).allow('', null).optional()
    }),

    signin: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required()
    }),

    refreshToken: Joi.object({
        refresh_token: Joi.string().required()
            .messages({
                'string.empty': 'Refresh token is required'
            })
    }),

    forgotPassword: Joi.object({
        email: Joi.string().email().required()
            .messages({
                'string.empty': 'Email is required',
                'string.email': 'Invalid email format'
            })
    }),

    assignAdmin: Joi.object({
        userId: Joi.string().uuid().required()
            .messages({
                'string.empty': 'User ID is required',
                'string.guid': 'Invalid user ID format'
            })
    }),

    // Query validation
    getProducts: Joi.object({
        category: Joi.string().trim().optional(),
        search: Joi.string().trim().optional(),
        page: Joi.number().integer().min(1).optional(),
        limit: Joi.number().integer().min(1).max(100).optional(),
        sort: Joi.string().valid('name', 'price', 'created_at').optional()
    }),

    getOrders: Joi.object({
        page: Joi.number().integer().min(1).optional(),
        limit: Joi.number().integer().min(1).max(100).optional(),
        status: Joi.string().valid('Pending', 'Packed', 'Shipped', 'Delivered', 'Cancelled').optional(),
        sortBy: Joi.string().valid('created_at', 'customer_name', 'total_amount').optional()
    }),

    getUserOrders: Joi.object({
        page: Joi.number().integer().min(1).optional(),
        limit: Joi.number().integer().min(1).max(100).optional()
    }),

    UUID: Joi.object({
        id: Joi.string().guid({ version: 'uuidv4' }).required()
            .messages({
                'string.guid': 'Invalid ID format'
            })
    }),

    UserID: Joi.object({
        userId: Joi.string().guid({ version: 'uuidv4' }).required()
            .messages({
                'string.guid': 'Invalid user ID format'
            })
    }),

    ItemID: Joi.object({
        itemId: Joi.string().guid({ version: 'uuidv4' }).required()
            .messages({
                'string.guid': 'Invalid item ID format'
            })
    })
};

module.exports = { validate, validateQuery, validateParams, schemas };
