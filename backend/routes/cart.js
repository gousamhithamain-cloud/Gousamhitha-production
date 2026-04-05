const router = require('express').Router();
const { getCart, addToCart, updateCartItem, removeCartItem, clearCart } = require('../controllers/cartController');
const { validate, validateParams, schemas } = require('../middleware/validators');
const { authenticate, requireOwnership, requireResourceOwnership } = require('../middleware/auth');

// GET /api/cart/:userId
router.get('/:userId', authenticate, requireOwnership, validateParams(schemas.UserID), getCart);

// POST /api/cart — add or update item
router.post('/', authenticate, validate(schemas.addToCart), addToCart);

// PUT /api/cart/:itemId — update cart item quantity (ownership verified)
router.put('/:itemId', authenticate, requireResourceOwnership('cart', 'itemId', 'user_id'), validateParams(schemas.ItemID), validate(schemas.updateCartItem), updateCartItem);

// DELETE /api/cart/:itemId — remove item from cart (ownership verified)
router.delete('/:itemId', authenticate, requireResourceOwnership('cart', 'itemId', 'user_id'), validateParams(schemas.ItemID), removeCartItem);

// DELETE /api/cart/user/:userId — clear entire cart
router.delete('/user/:userId', authenticate, requireOwnership, validateParams(schemas.UserID), clearCart);

module.exports = router;
