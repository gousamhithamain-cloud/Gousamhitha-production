const router = require('express').Router();
const { getUserById, createUser, updateUser, deleteUser } = require('../controllers/userController');
const { validate, validateParams, schemas } = require('../middleware/validators');
const { authenticate, requireRole, requireOwnership } = require('../middleware/auth');

// POST /api/users — create user profile
router.post('/', validate(schemas.createUser), createUser);

// GET /api/users/:id — requires authentication + ownership (or admin)
router.get('/:id', authenticate, requireOwnership, validateParams(schemas.UUID), getUserById);

// PUT /api/users/:id — requires authentication + ownership (or admin)
router.put('/:id', authenticate, requireOwnership, validateParams(schemas.UUID), validate(schemas.updateUser), updateUser);

// DELETE /api/users/:id — admin only
router.delete('/:id', authenticate, requireRole(['admin']), validateParams(schemas.UUID), deleteUser);

module.exports = router;
