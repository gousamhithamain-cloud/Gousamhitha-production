const router = require('express').Router();
const { getProducts, getProductById, createProduct, updateProduct, deleteProduct } = require('../controllers/productController');
const { validate, validateQuery, validateParams, schemas } = require('../middleware/validators');
const { authenticate, requireRole } = require('../middleware/auth');

// GET /api/products
router.get('/', validateQuery(schemas.getProducts), getProducts);

// GET /api/products/:id
router.get('/:id', validateParams(schemas.UUID), getProductById);

// POST /api/products (admin only)
router.post('/', authenticate, requireRole(['admin']), validate(schemas.createProduct), createProduct);

// PUT /api/products/:id (admin only)
router.put('/:id', authenticate, requireRole(['admin']), validateParams(schemas.UUID), validate(schemas.updateProduct), updateProduct);

// DELETE /api/products/:id (admin only)
router.delete('/:id', authenticate, requireRole(['admin']), validateParams(schemas.UUID), deleteProduct);

module.exports = router;
