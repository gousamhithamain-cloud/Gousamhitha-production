# 🔒 SECURITY AUDIT REPORT — Gousamhitha Organic Store
**Date:** April 9, 2026  
**Auditor:** Kiro AI Security Analysis  
**Stack:** Vanilla JS Frontend · Node.js/Express Backend · Supabase (PostgreSQL)  
**Verdict:** ⚠️ PARTIALLY READY — Critical issues must be fixed before production

---

## 🔐 1. API KEY & SECRET EXPOSURE CHECK

### ❌ CRITICAL — Supabase Keys Hardcoded in Frontend JS

**File:** `js/supabase-init.js`

```js
const SUPABASE_URL = 'https://blsgyybaevuytmgpljyk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

The **Supabase Anon Key** is fully exposed in a public frontend file. While the anon key is designed to be public, it still allows direct database queries if Row Level Security (RLS) is misconfigured. Combined with the Supabase URL, anyone can attempt direct DB access.

**Fix:**
- Ensure RLS policies are enabled on ALL Supabase tables
- Remove `supabase-init.js` from production — all DB access should go through your backend API
- Never expose the **Service Role Key** anywhere on the frontend

---

### ❌ CRITICAL — Google OAuth Secret in Backend .env (Committed to Repo Risk)

**File:** `backend/.env`

```
GOOGLE_CLIENT_ID=<your-client-id>.apps.googleusercontent.com   ← EXPOSED
GOOGLE_CLIENT_SECRET=GOCSPX-<redacted>                         ← EXPOSED
SUPABASE_SERVICE_KEY=eyJ...                                     ← EXPOSED
```

The `.gitignore` correctly excludes `backend/.env`. However, these credentials were shared in plain text in this session. **Rotate all of these immediately.**

**Fix:**
```bash
# Rotate immediately:
# 1. Supabase: Dashboard → Settings → API → Regenerate service key
# 2. Google Cloud: Credentials → Delete & recreate OAuth client
```

---

### ⚠️ HIGH — Google Client ID Hardcoded in Frontend

**File:** `js/auth-handler.js`

```js
const GOOGLE_CLIENT_ID = '<your-client-id>.apps.googleusercontent.com'; // hardcoded
```

Google Client IDs are technically public (they appear in OAuth flows), but hardcoding them makes rotation painful and exposes your project identity.

**Fix:** Serve it from a `/api/config/public` endpoint or inject via build-time env variable.

---

## 🔑 2. AUTHENTICATION & AUTHORIZATION

### ❌ HIGH — JWT Stored in localStorage (XSS Vulnerable)

**File:** `js/auth-handler.js`, `js/api-client.js`

```js
localStorage.setItem('token', token);
localStorage.getItem('token');
```

`localStorage` is accessible by any JavaScript on the page. A single XSS vulnerability anywhere on the site gives an attacker full access to the token.

**Fix (production):**
```js
// Use HttpOnly cookies instead — set on backend:
res.cookie('token', accessToken, {
    httpOnly: true,
    secure: true,        // HTTPS only
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
});
```

---

### ⚠️ MEDIUM — No Token Expiry Validation on Frontend

The frontend only detects expiry when a 401 is returned. There's no proactive check before making requests.

**Fix:**
```js
function isTokenExpired(token) {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.exp * 1000 < Date.now();
    } catch { return true; }
}
// Check before every API call
```

---

### ✅ GOOD — Backend Token Verification

`backend/middleware/auth.js` correctly verifies tokens via Supabase on every protected request. Role is fetched from the database, not trusted from the token payload.

---

### ⚠️ MEDIUM — Admin Role Check Only on Frontend for Page Access

**File:** `admin-dashboard.html`, `admin-db.js`

Admin pages redirect based on `user.role === 'admin'` in localStorage. A user can manually set this in DevTools and navigate to admin pages. The API calls themselves are protected, but the page loads and renders before the check.

**Fix:** Add server-side redirect or a meta-refresh check:
```js
// On admin page load, verify role via API before rendering
const res = await fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` }});
if (res.data.user.role !== 'admin') window.location.href = '/index.html';
```

---

### ✅ GOOD — RBAC Implemented on Backend

`authenticate` + `requireRole(['admin'])` middleware is applied to admin routes. The role is fetched from the database, not the JWT payload.

---

## 🌐 3. API SECURITY

### ⚠️ HIGH — Rate Limiting Too Low / Commented Out for Testing

**File:** `backend/middleware/security.js`, `backend/routes/auth.js`

```js
// POST /api/auth/signup (rate limited - temporarily disabled for testing)
router.post('/signup', validate(schemas.signup), signup);
```

Auth rate limiter is **not applied** to signup or signin routes. The comment says "temporarily disabled for testing" — this is a production risk.

**Fix:**
```js
router.post('/signup', authLimiter, validate(schemas.signup), signup);
router.post('/signin', authLimiter, validate(schemas.signin), signin);
```

---

### ⚠️ MEDIUM — General Rate Limit Too Generous

100 requests per 15 minutes per IP is easily exhausted by the frontend's polling (cart count every 30s, bottom-nav every 5s). This caused 429 errors in testing.

**Fix:**
```js
// Increase general limit, tighten auth limit
const apiLimiter = createRateLimiter(15 * 60 * 1000, 500, '...');   // 500/15min
const authLimiter = createRateLimiter(15 * 60 * 1000, 10, '...');   // 10/15min (keep strict)
```

---

### ✅ GOOD — Joi Validation on All Endpoints

`backend/middleware/validators.js` has comprehensive Joi schemas for all routes including UUID validation, enum validation, and field length limits. `stripUnknown: true` prevents parameter pollution.

---

### ✅ GOOD — Protected Routes Use authenticate Middleware

Cart, orders, and admin routes all require the `authenticate` middleware. Products (read) are public, which is correct.

---

## 🛡️ 4. COMMON VULNERABILITIES (OWASP)

### XSS — ⚠️ PARTIAL RISK

- `xss-clean` middleware is applied on the backend ✅
- Helmet CSP is configured ✅
- **BUT:** CSP has `'unsafe-inline'` for styles, weakening protection
- Frontend uses `innerHTML` in several places (product cards, cart items) with data from the API — if the API ever returns malicious data, it renders directly

**Fix:**
```js
// Replace innerHTML with textContent where possible
// Or sanitize before inserting:
element.innerHTML = DOMPurify.sanitize(apiData);
```

---

### CSRF — ⚠️ LOW RISK (Currently)

No CSRF tokens are implemented. Since the API uses `Authorization: Bearer` headers (not cookies), CSRF is not currently exploitable. **However**, if you switch to HttpOnly cookies (recommended), CSRF protection becomes mandatory.

**Fix (when using cookies):**
```js
const csrf = require('csurf');
app.use(csrf({ cookie: true }));
```

---

### SQL Injection — ✅ NOT VULNERABLE

All database queries go through Supabase's parameterized query builder. No raw SQL string concatenation found.

---

### Broken Access Control — ⚠️ MEDIUM

**IDOR Risk in Cart:** `GET /api/cart/:userId` — a logged-in user can request another user's cart by changing the userId in the URL. The backend doesn't verify that `req.user.id === req.params.userId`.

**Fix:**
```js
// In cartController.js getCart:
if (req.user.id !== userId && req.user.role !== 'admin') {
    throw new AppError('Access denied', 403);
}
```

Same issue exists in order endpoints — verify ownership before returning data.

---

### Insecure Direct Object Reference (IDOR) — ❌ HIGH

**File:** `backend/controllers/cartController.js`, `backend/controllers/orderController.js`

Any authenticated user can access any other user's cart or orders by guessing/knowing their UUID. This is a direct IDOR vulnerability.

**Fix:** Add ownership check to all user-scoped endpoints:
```js
// Middleware to verify resource ownership
const verifyOwnership = (userIdParam) => (req, res, next) => {
    if (req.params[userIdParam] !== req.user.id && req.user.role !== 'admin') {
        return next(new AppError('Access denied', 403));
    }
    next();
};
```

---

## 📦 5. DATA VALIDATION & SANITIZATION

### ✅ GOOD — Comprehensive Joi Schemas

All backend routes use Joi validation with:
- UUID format validation for IDs
- String length limits
- Enum validation for status fields
- Phone number regex (`/^[0-9]{10}$/`)
- Email format validation

### ⚠️ MEDIUM — Weak Password Policy

**File:** `backend/middleware/validators.js`

```js
password: Joi.string().min(6).max(100).required()
```

Minimum 6 characters with no complexity requirements is weak.

**Fix:**
```js
password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({ 'string.pattern.base': 'Password must contain uppercase, lowercase, and a number' })
```

---

### ⚠️ LOW — Frontend Validation Can Be Bypassed

All frontend form validation can be bypassed by calling the API directly. This is acceptable **only if** backend validation is comprehensive (which it is). No action needed beyond ensuring backend validation stays complete.

---

## 🔒 6. PASSWORD & USER SECURITY

### ✅ GOOD — Password Hashing via Supabase

Passwords are handled entirely by Supabase Auth, which uses bcrypt with proper salting. No plaintext passwords are stored.

### ⚠️ MEDIUM — Google OAuth Fallback Creates Weak Password

**File:** `backend/controllers/googleAuthController.js`

```js
password: `google_${googleId}_${Date.now()}`
```

This deterministic password pattern could be guessed if `googleId` is known (Google sub IDs are sometimes public). Use `crypto.randomBytes` instead:

```js
const crypto = require('crypto');
password: crypto.randomBytes(32).toString('hex')
```

---

## 🧾 7. ERROR HANDLING & LOGGING

### ✅ GOOD — Centralized Error Handler

`backend/middleware/errorHandler.js` catches all errors and returns standardized responses. Stack traces are only included in development mode.

### ⚠️ MEDIUM — Stack Traces in Development Mode Leak Structure

```js
...(process.env.NODE_ENV === 'development' && { stack: err.stack })
```

This is correct behavior, but ensure `NODE_ENV=production` is set in your deployment environment. If it's not set, it defaults to development and leaks stack traces.

**Fix:** Add to deployment checklist: `NODE_ENV=production` must be set.

### ⚠️ LOW — Verbose Console Logging in Auth Middleware

**File:** `backend/middleware/auth.js`

```js
console.log('🔐 AUTHENTICATE - START');
console.log('📍 Path:', req.path);
console.log('🔑 Auth Header:', req.headers.authorization ? 'Present' : 'Missing');
```

Every authenticated request logs to console. In production this creates noise and can fill disk space.

**Fix:**
```js
if (process.env.NODE_ENV !== 'production') {
    console.log('🔐 AUTHENTICATE - START');
}
```

---

## 📁 8. FILE UPLOAD SECURITY

### ⚠️ MEDIUM — Images Stored as Base64 in Database

Product images appear to be stored as base64 strings or URLs in the database. No dedicated file upload endpoint was found.

**Risks:**
- Base64 images bloat the database significantly
- No file type validation
- No size limits enforced at upload time

**Fix:** Use Supabase Storage or Cloudinary for image uploads:
```js
// Validate before upload
const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
const maxSize = 5 * 1024 * 1024; // 5MB
if (!allowedTypes.includes(file.mimetype)) throw new AppError('Invalid file type', 400);
if (file.size > maxSize) throw new AppError('File too large', 400);
```

---

## 🌍 9. CORS & HEADERS

### ⚠️ HIGH — CORS Allows All Origins in Non-Production

**File:** `backend/middleware/security.js`

```js
if (process.env.NODE_ENV !== 'production') {
    callback(null, true); // Allows ALL origins
}
```

Since `NODE_ENV` is not set in `.env`, this effectively allows all origins always.

**Fix:**
```js
// In backend/.env:
NODE_ENV=production

// Or explicitly whitelist:
const allowedOrigins = [
    'https://your-vercel-app.vercel.app',
    'http://localhost:5173'
];
```

---

### ✅ GOOD — Helmet Configured

Helmet is applied with CSP, CORP, and COEP settings.

### ⚠️ LOW — CSP Has unsafe-inline for Styles

```js
styleSrc: ["'self'", "'unsafe-inline'"],
```

This weakens XSS protection. Inline styles should be moved to CSS files.

---

## 🚀 10. PERFORMANCE & DOS PROTECTION

### ⚠️ HIGH — Frontend Polling Hammers the API

**File:** `js/bottom-nav.js`, `js/cart-count-updater.js`

```js
setInterval(updateCartCount, 5000);   // Every 5 seconds
setInterval(() => this.updateCartCount(), 30000); // Every 30 seconds
```

Multiple polling intervals running simultaneously caused 429 rate limit errors in testing. This is a self-inflicted DoS.

**Fix:** Use event-driven updates instead of polling:
```js
// Dispatch custom event when cart changes
window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { count } }));
// Listen instead of polling
window.addEventListener('cartUpdated', updateBadge);
```

---

### ✅ GOOD — Body Size Limit Set

```js
app.use(express.json({ limit: '10mb' }));
```

10MB limit prevents large payload attacks.

---

## 📱 11. FRONTEND SECURITY

### ❌ CRITICAL — Supabase Anon Key Exposed in Public JS

**File:** `js/supabase-init.js`

Full Supabase credentials are in a publicly accessible JavaScript file. Anyone visiting the site can extract these from browser DevTools.

**Immediate Fix:** Remove or disable `supabase-init.js` in production. All data access goes through the backend API.

---

### ⚠️ MEDIUM — Token in localStorage Accessible to All Scripts

Any third-party script (analytics, ads, CDN-loaded libraries) loaded on the page can read `localStorage.getItem('token')`.

---

### ⚠️ LOW — Admin Check Bypassable via DevTools

```js
// In admin pages:
if (user.role !== 'admin') window.location.href = '/index.html';
```

A user can set `localStorage.setItem('user', JSON.stringify({...role:'admin'}))` and bypass the redirect. The API calls will still fail (backend is protected), but the admin UI will render.

---

## 🧠 12. PRODUCTION READINESS SCORE

| Category | Score | Status |
|---|---|---|
| API Key Security | 3/10 | ❌ |
| Authentication | 6/10 | ⚠️ |
| Authorization / RBAC | 6/10 | ⚠️ |
| Input Validation | 8/10 | ✅ |
| Error Handling | 7/10 | ⚠️ |
| CORS & Headers | 5/10 | ⚠️ |
| Rate Limiting | 4/10 | ❌ |
| OWASP Top 10 | 5/10 | ⚠️ |
| Frontend Security | 4/10 | ❌ |
| DoS Protection | 5/10 | ⚠️ |

### **Overall Score: 5.3 / 10**

## ⚠️ PARTIALLY READY — NOT safe for production in current state

---

## 🛠️ 13. FIXES & RECOMMENDATIONS

### 🔴 HIGH PRIORITY (Fix Before Any Production Deployment)

| # | Issue | Fix |
|---|---|---|
| 1 | Supabase keys in `supabase-init.js` | Remove file, disable direct Supabase access from frontend |
| 2 | IDOR on cart/order endpoints | Add ownership verification middleware |
| 3 | Auth rate limiter disabled | Re-enable `authLimiter` on signin/signup routes |
| 4 | CORS allows all origins | Set `NODE_ENV=production` and whitelist specific origins |
| 5 | Rotate all credentials | Supabase service key, Google OAuth secret — both were exposed in this session |
| 6 | `NODE_ENV` not set | Add `NODE_ENV=production` to production environment |

### 🟡 MEDIUM PRIORITY (Fix Within 1 Week)

| # | Issue | Fix |
|---|---|---|
| 7 | JWT in localStorage | Migrate to HttpOnly cookies |
| 8 | Frontend polling (5s interval) | Replace with event-driven cart updates |
| 9 | Weak password policy (min 6 chars) | Enforce min 8 chars + complexity |
| 10 | Google fallback password deterministic | Use `crypto.randomBytes(32).toString('hex')` |
| 11 | Verbose auth logging in production | Gate all `console.log` behind `NODE_ENV !== 'production'` |
| 12 | No token expiry check on frontend | Add JWT decode + expiry check before API calls |

### 🟢 LOW PRIORITY (Fix Within 1 Month)

| # | Issue | Fix |
|---|---|---|
| 13 | CSP `unsafe-inline` for styles | Move inline styles to CSS files |
| 14 | Admin page renders before role check | Verify role via API before rendering admin UI |
| 15 | No CSRF protection | Add when migrating to cookie-based auth |
| 16 | No audit logging | Add Winston/Pino for security event logging |
| 17 | Image storage in DB | Migrate to Supabase Storage or Cloudinary |
| 18 | No 2FA for admin | Add TOTP-based 2FA for admin accounts |

---

## ✅ 14. FINAL PRE-DEPLOYMENT CHECKLIST

### Secrets & Configuration
- [ ] `backend/.env` is in `.gitignore` and NOT committed
- [ ] All credentials rotated (Supabase service key, Google OAuth)
- [ ] `NODE_ENV=production` set in deployment environment
- [ ] `FRONTEND_URL` set to actual production domain
- [ ] Google OAuth authorized origins updated with production domain

### Backend Security
- [ ] `authLimiter` applied to `/signin` and `/signup` routes
- [ ] CORS whitelist updated to production domain only
- [ ] IDOR fix applied to cart and order endpoints
- [ ] All `console.log` debug statements removed or gated
- [ ] `supabase-init.js` disabled/removed from production build

### Frontend Security
- [ ] `supabase-init.js` not loaded in production
- [ ] No hardcoded secrets in any `.js` file
- [ ] Admin pages verify role via API before rendering
- [ ] Token expiry checked before API calls

### Database
- [ ] RLS (Row Level Security) enabled on ALL Supabase tables
- [ ] Service role key never used from frontend
- [ ] Database backups configured

### Infrastructure
- [ ] HTTPS enforced (SSL certificate active)
- [ ] HTTP → HTTPS redirect configured
- [ ] Error tracking service configured (Sentry recommended)
- [ ] Health check endpoint monitored

---

## 📋 SUMMARY OF CRITICAL ACTIONS

```
1. ROTATE: Supabase service key + Google OAuth secret (both exposed)
2. REMOVE: js/supabase-init.js from production
3. FIX: IDOR vulnerability in cart/order endpoints
4. ENABLE: authLimiter on signin/signup routes
5. SET: NODE_ENV=production in deployment
6. WHITELIST: Specific origins in CORS config
```

**Until these 6 items are resolved, this application should NOT be deployed to production.**

---

*Generated by Kiro Security Audit — April 9, 2026*
