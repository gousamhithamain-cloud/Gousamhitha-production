require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Import middleware
const { globalErrorHandler, notFound } = require('./middleware/errorHandler');
const { helmetConfig, xssProtection, sanitizeInput, corsOptions, apiLimiter } = require('./middleware/security');

// Import routes
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');
const userRoutes = require('./routes/users');
const authRoutes = require('./routes/auth');
const vendorRoutes = require('./routes/vendors');
const deliveryRoutes = require('./routes/delivery');
const payoutRoutes = require('./routes/payouts');

const app = express();
const PORT = process.env.PORT || 4000;

// ── Security Middleware ───────────────────────────────────────────────────────
app.use(helmetConfig); // Security headers
app.use(cors(corsOptions)); // CORS configuration - MUST BE EARLY

// ── Body Parsing & Sanitization ───────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(xssProtection); // XSS protection
app.use(sanitizeInput); // Sanitize all inputs

// ── Request Logging ───────────────────────────────────────────────────────────
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

// ── Rate Limiting ─────────────────────────────────────────────────────────────
app.use('/api/', apiLimiter); // Apply rate limiting to all API routes

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/delivery', deliveryRoutes);
app.use('/api/payouts', payoutRoutes);

// ── Health Check ──────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// ── 404 Handler ───────────────────────────────────────────────────────────────
app.use(notFound);

// ── Global Error Handler (MUST BE LAST) ────────────────────────────────────────
app.use(globalErrorHandler);

// ── Start Server ──────────────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║         Gousamhitha API Server Started                    ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔒 Security: Helmet, XSS Protection, Rate Limiting enabled`);
    console.log(`📝 Validation: Joi validation enabled`);
    console.log(`✅ Error Handling: Global error handler with standardized responses`);
    console.log('');
});
