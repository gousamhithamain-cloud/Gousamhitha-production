# Vite Migration Guide - Step by Step

## Overview
This guide will help you migrate your existing frontend to Vite WITHOUT breaking functionality.

**Important**: This migration is designed to be safe and incremental. We'll keep your existing code structure and only add the bundler layer.

---

## ⚠️ BEFORE YOU START

### 1. Backup Your Project
```bash
# Create a backup
cp -r Gousamhitha-main Gousamhitha-main-backup
```

### 2. Commit Current State (if using Git)
```bash
git add .
git commit -m "Before Vite migration"
```

---

## 📋 MIGRATION STEPS

### Step 1: Initialize Vite Project

**1.1 Navigate to your project**
```bash
cd Gousamhitha-main
```

**1.2 Initialize npm (if not already done)**
```bash
npm init -y
```

**1.3 Install Vite**
```bash
npm install --save-dev vite
```

**1.4 Update package.json**

Add these scripts to your `package.json`:
```json
{
  "name": "gousamhitha-ecommerce",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "backend": "cd backend && npm start"
  },
  "devDependencies": {
    "vite": "^5.0.0"
  }
}
```

---

### Step 2: Create Vite Configuration

**2.1 Create `vite.config.js` in root**

See the `vite.config.js` file created in your project.

This configuration:
- Sets root directory to current folder
- Configures all HTML pages as entry points
- Sets up proxy for backend API
- Preserves your existing folder structure

---

### Step 3: Reorganize Project Structure (Minimal Changes)

**Current Structure** (keep as-is):
```
Gousamhitha-main/
├── index.html
├── shop.html
├── cart.html
├── checkout.html
├── login.html
├── signup.html
├── profile.html
├── admin-*.html
├── css/
├── js/
├── images/
└── backend/
```

**No folder restructuring needed!** Vite will work with your existing structure.

---

### Step 4: Update HTML Files

**IMPORTANT**: We'll update HTML files to use a single entry script instead of multiple script tags.

**4.1 Update index.html**

Replace all `<script src="...">` tags at the bottom with:
```html
<!-- Remove all these: -->
<!-- <script src="js/category-filter-system.js"></script> -->
<!-- <script src="js/back-button.js"></script> -->
<!-- etc... -->

<!-- Replace with single entry: -->
<script type="module" src="/js/main.js"></script>
```

**4.2 Repeat for all HTML files**
- shop.html → `<script type="module" src="/js/shop-main.js"></script>`
- cart.html → `<script type="module" src="/js/cart-main.js"></script>`
- checkout.html → `<script type="module" src="/js/checkout-main.js"></script>`
- login.html → `<script type="module" src="/js/login-main.js"></script>`
- signup.html → `<script type="module" src="/js/signup-main.js"></script>`
- profile.html → `<script type="module" src="/js/profile-main.js"></script>`
- admin pages → `<script type="module" src="/js/admin-main.js"></script>`

---

### Step 5: Create Entry Files

**5.1 Create `/js/main.js` (for index.html)**

This file imports all scripts needed for the home page:
```javascript
// Main entry point for index.html
import './category-filter-system.js';
import './back-button.js';
import './error-suppression-ultra.js';
import './universal-search.js';
import './mobile-menu.js';
import './bottom-nav.js';
import './cart-count-updater.js';
// Add all other scripts needed for home page
```

**5.2 Create entry files for other pages**

See the entry files created in your `/js` folder:
- `main.js` - Home page
- `shop-main.js` - Shop page
- `cart-main.js` - Cart page
- `checkout-main.js` - Checkout page
- `login-main.js` - Login page
- `signup-main.js` - Signup page
- `profile-main.js` - Profile page
- `admin-main.js` - Admin pages

---

### Step 6: Handle Global Variables

**Problem**: Your current scripts use global scope. Vite uses modules which have isolated scope.

**Solution**: We'll use a hybrid approach - keep most code as-is but ensure global variables are accessible.

**6.1 For scripts that need global access, add to window object**

Example in `js/api-client.js`:
```javascript
// Existing code
const API_BASE = window.API_BASE_URL || 'http://localhost:4000/api';

// Make it globally accessible
window.API_BASE = API_BASE;
window.ProductsAPI = ProductsAPI;
window.CartAPI = CartAPI;
// etc...
```

**6.2 Or keep scripts as non-module temporarily**

In HTML, you can still use regular scripts for problematic files:
```html
<script src="/js/config.js"></script> <!-- Non-module -->
<script type="module" src="/js/main.js"></script> <!-- Module -->
```

---

### Step 7: Fix Import Issues

**7.1 Update CSS imports in HTML**

Change:
```html
<link rel="stylesheet" href="styles.css?v=3">
```

To:
```html
<link rel="stylesheet" href="/styles.css">
```

Vite handles cache busting automatically.

**7.2 Update asset paths**

Change:
```html
<img src="images/logo.png">
```

To:
```html
<img src="/images/logo.png">
```

Always use absolute paths from root with `/`.

---

### Step 8: Test Development Server

**8.1 Start Vite dev server**
```bash
npm run dev
```

**8.2 Open browser**
```
http://localhost:5173
```

**8.3 Check for errors**
- Open browser console
- Check if all scripts load
- Test navigation between pages
- Verify all features work

**8.4 Common issues and fixes**

**Issue**: "Failed to resolve module"
**Fix**: Check import paths, ensure files exist

**Issue**: "Uncaught ReferenceError: X is not defined"
**Fix**: Add `window.X = X` to make it global

**Issue**: "CORS error"
**Fix**: Check vite.config.js proxy settings

---

### Step 9: Build for Production

**9.1 Create production build**
```bash
npm run build
```

**9.2 Check output**
```
dist/
├── index.html
├── shop.html
├── assets/
│   ├── index-[hash].js
│   ├── shop-[hash].js
│   └── style-[hash].css
└── images/
```

**9.3 Preview production build**
```bash
npm run preview
```

Open `http://localhost:4173` and test.

---

### Step 10: Update Deployment

**10.1 Update `.gitignore`**
```
node_modules/
dist/
.env
.env.local
```

**10.2 Update `vercel.json`**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "cleanUrls": true,
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "http://your-backend-url/api/$1"
    }
  ]
}
```

**10.3 Deploy**
```bash
# Vercel will automatically detect Vite
vercel --prod
```

---

## 🔧 TROUBLESHOOTING

### Issue: Scripts not loading
**Solution**: Check browser console, verify import paths

### Issue: Global variables undefined
**Solution**: Add `window.variableName = variableName` in the script

### Issue: CSS not loading
**Solution**: Import CSS in main.js: `import '../styles.css'`

### Issue: Images not found
**Solution**: Use absolute paths: `/images/logo.png`

### Issue: Backend API not accessible
**Solution**: Check vite.config.js proxy configuration

---

## ✅ VERIFICATION CHECKLIST

After migration, verify:

- [ ] Home page loads without errors
- [ ] Shop page displays products
- [ ] Cart functionality works
- [ ] Checkout process works
- [ ] Login/Signup works
- [ ] Profile page loads
- [ ] Admin pages work
- [ ] All images load
- [ ] All CSS styles apply
- [ ] Mobile responsive works
- [ ] Backend API calls work
- [ ] No console errors
- [ ] Production build works
- [ ] Deployment successful

---

## 📊 EXPECTED RESULTS

### Before Migration:
- 75+ separate HTTP requests for JS files
- No optimization
- Slow page loads
- Manual cache busting

### After Migration:
- 3-5 optimized bundles
- Automatic code splitting
- Tree shaking (unused code removed)
- Minification (40-60% smaller)
- Fast HMR in development
- Automatic cache busting

---

## 🚀 NEXT STEPS (Optional Improvements)

After successful migration, you can gradually:

1. **Convert to proper ES modules**
   - Remove global variables
   - Use import/export properly

2. **Install npm packages**
   ```bash
   npm install @supabase/supabase-js
   ```

3. **Add TypeScript** (optional)
   ```bash
   npm install --save-dev typescript
   ```

4. **Optimize images**
   ```bash
   npm install --save-dev vite-plugin-image-optimizer
   ```

---

## 📝 ROLLBACK PLAN

If something goes wrong:

1. **Stop Vite server**: Ctrl+C
2. **Restore backup**: `cp -r Gousamhitha-main-backup/* Gousamhitha-main/`
3. **Or revert Git commit**: `git reset --hard HEAD~1`

---

## 🎯 SUMMARY

**Estimated Time**: 2-4 hours  
**Difficulty**: Medium  
**Risk**: Low (can rollback easily)  
**Impact**: High (significant performance improvement)

**Key Points**:
- Keep existing code structure
- Minimal code changes
- Incremental migration
- Easy rollback if needed

---

**Migration Guide Version**: 1.0  
**Last Updated**: [Current Date]  
**Status**: Ready to execute
