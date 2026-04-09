# 🔒 SUPABASE SECURITY AUDIT — Gousamhitha Organic Store
**Date:** April 9, 2026  
**Scope:** Frontend Supabase exposure, key leakage, architecture violations  
**Architecture Rule:** Frontend MUST NOT access Supabase directly — all DB access via `/api/` only

---

## 📊 EXECUTIVE SUMMARY

| Finding | Count | Severity |
|---|---|---|
| Supabase Anon Key hardcoded in frontend | 1 file | 🔴 CRITICAL |
| Direct Supabase DB queries from frontend | 3 files | 🔴 CRITICAL |
| Direct Supabase Auth calls from frontend | 4 files | 🟠 HIGH |
| Files loading `supabase-init.js` | 2 HTML files | 🟠 HIGH |
| Supabase CDN loaded in frontend | Multiple | 🟡 WARNING |
| Backend Supabase usage | Correct ✅ | 🟢 SAFE |

### **VERDICT: ❌ NOT SAFE FOR PRODUCTION**

---

## 🔍 1. SUPABASE USAGE DETECTION

### Files Where Supabase Is Initialized or Used

| File | Type | Usage | Risk |
|---|---|---|---|
| `js/supabase-init.js` | Frontend JS | `createClient()` with hardcoded keys | 🔴 CRITICAL |
| `profile-supabase.js` | Frontend JS | `supabase.auth.getUser()` | 🟠 HIGH |
| `google-auth-direct.js` | Frontend JS | `supabase.auth.signInWithOAuth()` | 🟠 HIGH |
| `product-display.js` | Frontend JS | `supabase.from()`, `supabase.auth.getUser()` | 🔴 CRITICAL |
| `js/profile-handler.js` | Frontend JS | `window.supabase.auth.getUser()` | 🟠 HIGH |
| `js/universal-search.js` | Frontend JS | Waits for `window.supabase` | 🟡 WARNING |
| `admin-add-product.html` | HTML (inline) | `supabase.from('products').insert()`, `supabase.from('vendors')` | 🔴 CRITICAL |
| `admin-payouts.html` | HTML (inline) | `supabase.from('vendor_payouts')`, `.update()` | 🔴 CRITICAL |
| `admin-orders-OLD-BACKUP.html` | HTML (backup) | `supabase.from('orders')`, realtime channel | 🟡 WARNING (backup file) |
| `admin-dashboard.html` | HTML | Loads `supabase-init.js` | 🟠 HIGH |
| `admin-add-product.html` | HTML | Loads `supabase-init.js` | 🟠 HIGH |

---

## 🔑 2. KEY EXPOSURE CHECK

### ❌ CRITICAL — Supabase Anon Key Hardcoded in `js/supabase-init.js`

```
File: js/supabase-init.js (lines 5-6)

SUPABASE_URL  = "https://blsgyybaevuytmgpljyk.supabase.co"
SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...anon...role..." ← EXPOSED
```

**Key Type:** `anon` (public role)  
**Risk Level:** 🔴 CRITICAL in this context

While the anon key is technically "public-facing" in Supabase's design, exposing it in your frontend is **unnecessary and dangerous** because:

1. Your architecture uses a backend API — the frontend should NEVER need Supabase credentials
2. If Row Level Security (RLS) is misconfigured on ANY table, the anon key allows direct read/write to your database
3. The key is visible to every user who opens DevTools → Sources

**Service Role Key Check:** The service role key was NOT found in any frontend file. It is correctly stored only in `backend/.env`. ✅

---

## 🚨 3. RISK CLASSIFICATION

### 🔴 CRITICAL — Direct Database Writes from Frontend

**File: `admin-add-product.html` (inline script)**

```js
// Line 310-314 — DIRECT DB INSERT FROM BROWSER
const { data, error } = await window.supabase
    .from('products')
    .insert([newProduct])
    .select();
```

This inserts a product directly into the database from the browser, bypassing:
- Backend validation
- Authentication middleware
- Rate limiting
- Audit logging
- Business logic

**File: `admin-payouts.html` (inline script)**

```js
// Direct DB update from browser
const { error } = await window.supabase
    .from('vendor_payouts')
    .update({ payout_status: 'paid', ... })
```

Marking payouts as paid directly from the browser with no backend verification is a **financial data integrity risk**.

---

### 🔴 CRITICAL — Architecture Violation in `product-display.js`

```js
// product-display.js — queries DB directly
if (window.supabase && typeof window.supabase.from === 'function') {
    loadProducts(); // calls supabase.from('products') directly
}
```

This file bypasses the backend API entirely and queries Supabase directly. The correct file `js/product-display-optimized-v2.js` already uses the backend API — `product-display.js` is a legacy file that should be removed.

---

### 🟠 HIGH — Supabase Auth Calls from Frontend

**`profile-supabase.js`:**
```js
const { data: { user }, error } = await window.supabase.auth.getUser();
```

**`js/profile-handler.js`:**
```js
const { data: { user }, error } = await window.supabase.auth.getUser();
```

**`google-auth-direct.js`:**
```js
await window.supabase.auth.signInWithOAuth({ provider: 'google', ... });
```

These files use Supabase Auth directly. The correct implementation (`js/auth-handler.js`) already uses the backend API. These are legacy files that are still being loaded.

---

### 🟡 WARNING — `js/universal-search.js` Waits for Supabase

```js
while (!window.supabase && attempts < 20) { ... }
```

This file polls for `window.supabase` to be ready before running. If `supabase-init.js` is removed, this will silently fail. The search functionality needs to be migrated to use the backend API.

---

## 🧠 4. ARCHITECTURE VALIDATION

### What SHOULD happen (correct pattern):
```
Browser → /api/products → Express Backend → Supabase → Response
```

### What IS happening in several files (violation):
```
Browser → window.supabase.from('products') → Supabase DIRECTLY ← VIOLATION
```

### Files Following Correct Architecture ✅
| File | Pattern |
|---|---|
| `js/api-client.js` | All calls via `/api/...` ✅ |
| `js/product-display-optimized-v2.js` | Uses backend API ✅ |
| `js/auth-handler.js` | Uses backend API ✅ |
| `js/cart-count-updater.js` | Uses backend API ✅ |
| `js/profile-page-handler.js` | Uses backend API ✅ |

### Files Violating Architecture ❌
| File | Violation |
|---|---|
| `js/supabase-init.js` | Initializes Supabase client in browser |
| `product-display.js` | Direct `supabase.from()` queries |
| `profile-supabase.js` | Direct `supabase.auth.getUser()` |
| `google-auth-direct.js` | Direct `supabase.auth.signInWithOAuth()` |
| `admin-add-product.html` | Direct `supabase.from('products').insert()` |
| `admin-payouts.html` | Direct `supabase.from('vendor_payouts').update()` |

---

## 🛠️ 5. REQUIRED FIXES

### Fix 1 — Delete or Disable `js/supabase-init.js` 🔴 CRITICAL

This file has no place in a backend-API architecture. Remove it entirely.

```bash
# Option A: Delete the file
rm js/supabase-init.js

# Option B: Replace with empty stub to avoid 404 errors
echo "// Supabase direct access disabled — use backend API" > js/supabase-init.js
```

Also remove the `<script>` tags loading it:
```html
<!-- REMOVE from admin-dashboard.html and admin-add-product.html: -->
<script src="js/supabase-init.js"></script>
```

---

### Fix 2 — Migrate `admin-add-product.html` to Backend API 🔴 CRITICAL

Replace direct Supabase calls with API calls:

```js
// BEFORE (direct Supabase — REMOVE):
const { data, error } = await window.supabase
    .from('products')
    .insert([newProduct])
    .select();

// AFTER (backend API — USE THIS):
const token = localStorage.getItem('token');
const res = await fetch('/api/products', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(newProduct)
});
const data = await res.json();
```

---

### Fix 3 — Migrate `admin-payouts.html` to Backend API 🔴 CRITICAL

```js
// BEFORE (direct Supabase — REMOVE):
await window.supabase.from('vendor_payouts').update({ payout_status: 'paid' }).eq('id', id);

// AFTER (backend API — USE THIS):
await fetch(`/api/vendors/payouts/${id}`, {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ payout_status: 'paid' })
});
```

---

### Fix 4 — Remove Legacy Frontend Files 🟠 HIGH

These files are superseded by their API-based equivalents but are still being loaded:

| Legacy File (Remove) | Replacement (Keep) |
|---|---|
| `product-display.js` | `js/product-display-optimized-v2.js` ✅ |
| `profile-supabase.js` | `js/profile-page-handler.js` ✅ |
| `google-auth-direct.js` | `js/auth-handler.js` (Google section) ✅ |
| `js/profile-handler.js` | `js/auth-handler.js` ✅ |

Check which HTML files load these and remove the `<script>` tags:
```bash
# Find which pages load legacy files
grep -r "profile-supabase\|google-auth-direct\|product-display\.js" --include="*.html" .
```

---

### Fix 5 — Migrate `js/universal-search.js` 🟡 WARNING

Replace the Supabase polling with a backend API call:

```js
// BEFORE:
while (!window.supabase && attempts < 20) { ... }
const { data } = await window.supabase.from('products').select('name').ilike('name', `%${query}%`);

// AFTER:
const res = await fetch(`/api/products?search=${encodeURIComponent(query)}`);
const data = await res.json();
```

---

## 🔒 6. BACKEND CHECK

### ✅ Backend Supabase Usage is CORRECT

| Check | Status |
|---|---|
| Service role key in `backend/.env` only | ✅ SAFE |
| Service role key NOT in any frontend file | ✅ SAFE |
| `backend/config/supabase.js` reads from `process.env` | ✅ SAFE |
| All backend controllers use parameterized Supabase queries | ✅ SAFE |
| No raw SQL string concatenation | ✅ SAFE |

```js
// backend/config/supabase.js — CORRECT pattern:
const supabase = createClient(
    process.env.SUPABASE_URL,        // from .env ✅
    process.env.SUPABASE_SERVICE_KEY // from .env ✅
);
```

The backend is correctly configured. No changes needed there.

---

## 📋 COMPLETE FILE-LEVEL FIX PLAN

| Priority | File | Action |
|---|---|---|
| 🔴 CRITICAL | `js/supabase-init.js` | Delete or replace with empty stub |
| 🔴 CRITICAL | `admin-add-product.html` | Replace `supabase.from()` with `/api/products` calls |
| 🔴 CRITICAL | `admin-payouts.html` | Replace `supabase.from()` with `/api/vendors/payouts` calls |
| 🔴 CRITICAL | `product-display.js` | Delete (replaced by `product-display-optimized-v2.js`) |
| 🟠 HIGH | `admin-dashboard.html` | Remove `<script src="js/supabase-init.js">` |
| 🟠 HIGH | `profile-supabase.js` | Delete (replaced by `profile-page-handler.js`) |
| 🟠 HIGH | `google-auth-direct.js` | Delete (replaced by `auth-handler.js`) |
| 🟠 HIGH | `js/profile-handler.js` | Delete (replaced by `auth-handler.js`) |
| 🟡 WARNING | `js/universal-search.js` | Migrate to `/api/products?search=` |
| 🟡 WARNING | `admin-orders-OLD-BACKUP.html` | Delete (backup file, not in production) |

---

## ✅ POST-FIX VERIFICATION CHECKLIST

After applying all fixes, verify:

- [ ] `grep -r "supabase-init" --include="*.html" .` → returns nothing
- [ ] `grep -r "createClient" --include="*.js" js/` → returns nothing
- [ ] `grep -r "window.supabase.from" --include="*.html" .` → returns nothing
- [ ] `grep -r "window.supabase.auth" --include="*.html" .` → returns nothing
- [ ] `grep -r "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9" --include="*.js" js/` → returns nothing
- [ ] All admin pages load and function using `/api/` calls only
- [ ] Product display works via backend API
- [ ] Search works via backend API

---

## 🏁 FINAL VERDICT

```
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║   VERDICT: ❌ NOT SAFE FOR PRODUCTION                    ║
║                                                          ║
║   Reason: Supabase anon key is hardcoded in a public     ║
║   frontend JS file. Multiple admin pages write directly  ║
║   to the database from the browser, bypassing all        ║
║   backend security controls.                             ║
║                                                          ║
║   Fix the 4 CRITICAL items above, then re-audit.         ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
```

**Estimated fix time:** 2-4 hours  
**After fixes:** Re-run the verification checklist above. If all pass → SAFE FOR PRODUCTION ✅

---

*Generated by Kiro Security Audit — April 9, 2026*
