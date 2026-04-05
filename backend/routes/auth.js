const router = require('express').Router();
const { signup, signin, signout, getMe, refreshToken, forgotPassword, assignAdmin } = require('../controllers/authController');
const { validate, schemas } = require('../middleware/validators');
const { authLimiter } = require('../middleware/security');
const { authenticate, requireRole } = require('../middleware/auth');

// POST /api/auth/signup (rate limited)
router.post('/signup', authLimiter, validate(schemas.signup), signup);

// POST /api/auth/signin (rate limited)
router.post('/signin', authLimiter, validate(schemas.signin), signin);

// POST /api/auth/signout
router.post('/signout', signout);

// GET /api/auth/me — verify token
router.get('/me', getMe);

// POST /api/auth/refresh — refresh access token
router.post('/refresh', validate(schemas.refreshToken), refreshToken);

// POST /api/auth/forgot-password
router.post('/forgot-password', validate(schemas.forgotPassword), forgotPassword);

// POST /api/auth/assign-admin — assign admin role (admin only)
router.post('/assign-admin', authenticate, requireRole(['admin']), validate(schemas.assignAdmin), assignAdmin);

module.exports = router;
