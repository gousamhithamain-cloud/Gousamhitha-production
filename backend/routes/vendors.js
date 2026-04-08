const router = require('express').Router();
const { getVendors, getVendorById, createVendor, updateVendor, deleteVendor } = require('../controllers/vendorController');
const { validate, validateQuery, validateParams, schemas } = require('../middleware/validators');
const { authenticate, requireRole } = require('../middleware/auth');

// GET /api/vendors (no auth required for listing)
router.get('/', getVendors);

// GET /api/vendors/:id (no auth required)
router.get('/:id', getVendorById);

// POST /api/vendors (no auth required for now)
router.post('/', createVendor);

// PUT /api/vendors/:id (admin only)
router.put('/:id', authenticate, requireRole(['admin']), validateParams(schemas.UUID), updateVendor);

// DELETE /api/vendors/:id (admin only)
router.delete('/:id', authenticate, requireRole(['admin']), validateParams(schemas.UUID), deleteVendor);

module.exports = router;
