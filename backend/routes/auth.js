const router = require('express').Router();
const { signup, signin, signout, getMe, refreshToken, forgotPassword, assignAdmin } = require('../controllers/authController');
const { googleSignIn } = require('../controllers/googleAuthController');
const { validate, schemas } = require('../middleware/validators');
const { authLimiter } = require('../middleware/security');
const { authenticate, requireRole } = require('../middleware/auth');

// POST /api/auth/signup (rate limited - temporarily disabled for testing)
router.post('/signup', validate(schemas.signup), signup);

// POST /api/auth/signin (rate limited - temporarily disabled for testing)
router.post('/signin', validate(schemas.signin), signin);

// POST /api/auth/signout
router.post('/signout', signout);

// GET /api/auth/me — verify token
router.get('/me', getMe);

// POST /api/auth/refresh — refresh access token
router.post('/refresh', validate(schemas.refreshToken), refreshToken);

// POST /api/auth/forgot-password
router.post('/forgot-password', validate(schemas.forgotPassword), forgotPassword);

// POST /api/auth/google — Google Sign-In
router.post('/google', googleSignIn);

// POST /api/auth/assign-admin — assign admin role (admin only)
router.post('/assign-admin', authenticate, requireRole(['admin']), validate(schemas.assignAdmin), assignAdmin);

module.exports = router;
