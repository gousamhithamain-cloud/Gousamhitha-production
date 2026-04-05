const router = require('express').Router();
const { getAllOrders, getUserOrders, getOrderById, createOrder, updateOrderStatus, updatePaymentStatus, deleteOrder } = require('../controllers/orderController');
const { validate, validateParams, validateQuery, schemas } = require('../middleware/validators');
const { authenticate, requireRole, requireOwnership, requireResourceOwnership } = require('../middleware/auth');

// GET /api/orders (admin - all orders)
router.get('/', authenticate, requireRole(['admin']), validateQuery(schemas.getOrders), getAllOrders);

// POST /api/orders — create new order
router.post('/', authenticate, validate(schemas.createOrder), createOrder);

// GET /api/orders/user/:userId — get user's orders
router.get('/user/:userId', authenticate, requireOwnership, validateParams(schemas.UserID), validateQuery(schemas.getUserOrders), getUserOrders);

// GET /api/orders/:id — get single order
router.get('/:id', authenticate, requireResourceOwnership('orders', 'id', 'user_id'), validateParams(schemas.UUID), getOrderById);

// PUT /api/orders/:id/status (admin only)
router.put('/:id/status', authenticate, requireRole(['admin']), validateParams(schemas.UUID), validate(schemas.updateOrderStatus), updateOrderStatus);

// PUT /api/orders/:id/payment-status (admin only)
router.put('/:id/payment-status', authenticate, requireRole(['admin']), validateParams(schemas.UUID), validate(schemas.updatePaymentStatus), updatePaymentStatus);

// DELETE /api/orders/:id (admin only)
router.delete('/:id', authenticate, requireRole(['admin']), validateParams(schemas.UUID), deleteOrder);

module.exports = router;
