# Vite Setup Instructions - Quick Start

## 🚀 Quick Setup (5 Minutes)

### Step 1: Install Dependencies
```bash
cd Gousamhitha-main
npm install
```

This will install Vite and all dependencies.

---

### Step 2: Start Development Server
```bash
npm run dev
```

Your app will open at `http://localhost:5173`

---

### Step 3: Start Backend (in another terminal)
```bash
cd Gousamhitha-main/backend
npm install  # if not already done
npm start
```

Backend runs at `http://localhost:4000`

---

## ✅ Verification

1. Open `http://localhost:5173` in browser
2. Check browser console for errors
3. Test navigation between pages
4. Verify cart functionality
5. Test login/signup

---

## 🔧 Available Commands

```bash
# Development
npm run dev              # Start Vite dev server (port 5173)
npm run backend          # Start backend server (port 4000)

# Production
npm run build            # Build for production (output: dist/)
npm run preview          # Preview production build (port 4173)

# Combined (optional - requires concurrently package)
npm run dev:all          # Start both frontend and backend
```

---

## 📁 Project Structure After Migration

```
Gousamhitha-main/
├── index.html                 # Main entry HTML
├── shop.html                  # Shop page
├── cart.html                  # Cart page
├── checkout.html              # Checkout page
├── login.html                 # Login page
├── signup.html                # Signup page
├── profile.html               # Profile page
├── admin-*.html               # Admin pages
│
├── js/
│   ├── main.js               # ✨ NEW: Entry for index.html
│   ├── shop-main.js          # ✨ NEW: Entry for shop.html
│   ├── cart-main.js          # ✨ NEW: Entry for cart.html
│   ├── checkout-main.js      # ✨ NEW: Entry for checkout.html
│   ├── login-main.js         # ✨ NEW: Entry for login.html
│   ├── signup-main.js        # ✨ NEW: Entry for signup.html
│   ├── profile-main.js       # ✨ NEW: Entry for profile.html
│   ├── admin-main.js         # ✨ NEW: Entry for admin pages
│   └── [all existing files]  # All your existing JS files
│
├── css/                       # All CSS files
├── images/                    # All images
│
├── vite.config.js            # ✨ NEW: Vite configuration
├── package.json              # ✨ UPDATED: Added scripts
│
├── backend/                   # Backend (unchanged)
│   ├── server.js
│   ├── controllers/
│   ├── routes/
│   └── ...
│
└── dist/                      # ✨ NEW: Production build output
    ├── index.html
    ├── assets/
    └── ...
```

---

## 🔄 What Changed?

### Files Created:
1. `vite.config.js` - Vite configuration
2. `js/main.js` - Entry point for home page
3. `js/shop-main.js` - Entry point for shop page
4. `js/cart-main.js` - Entry point for cart page
5. `js/checkout-main.js` - Entry point for checkout page
6. `js/login-main.js` - Entry point for login page
7. `js/signup-main.js` - Entry point for signup page
8. `js/profile-main.js` - Entry point for profile page
9. `js/admin-main.js` - Entry point for admin pages

### Files Modified:
1. `package.json` - Added Vite scripts

### Files to Modify (Manual):
You need to update HTML files to use the new entry points:

**Example for index.html**:
```html
<!-- BEFORE: Multiple script tags -->
<script src="js/category-filter-system.js"></script>
<script src="js/back-button.js"></script>
<script src="js/error-suppression-ultra.js"></script>
<!-- ... many more ... -->

<!-- AFTER: Single entry point -->
<script type="module" src="/js/main.js"></script>
```

---

## 📝 Manual Steps Required

### 1. Update index.html

Find all `<script src="...">` tags at the bottom of `index.html` and replace with:
```html
<script type="module" src="/js/main.js"></script>
```

### 2. Update shop.html

Replace script tags with:
```html
<script type="module" src="/js/shop-main.js"></script>
```

### 3. Update cart.html

Replace script tags with:
```html
<script type="module" src="/js/cart-main.js"></script>
```

### 4. Update checkout.html

Replace script tags with:
```html
<script type="module" src="/js/checkout-main.js"></script>
```

### 5. Update login.html

Replace script tags with:
```html
<script type="module" src="/js/login-main.js"></script>
```

### 6. Update signup.html

Replace script tags with:
```html
<script type="module" src="/js/signup-main.js"></script>
```

### 7. Update profile.html

Replace script tags with:
```html
<script type="module" src="/js/profile-main.js"></script>
```

### 8. Update admin pages

Replace script tags with:
```html
<script type="module" src="/js/admin-main.js"></script>
```

---

## 🐛 Troubleshooting

### Issue: "Cannot find module"
**Solution**: Check if the file path in the entry file is correct. Use relative paths from the entry file location.

### Issue: "Uncaught ReferenceError: X is not defined"
**Solution**: Some scripts may need global variables. Add to the script:
```javascript
window.X = X;
```

### Issue: "Failed to fetch"
**Solution**: Make sure backend is running on port 4000

### Issue: CSS not loading
**Solution**: Import CSS in the entry file:
```javascript
import '../styles.css';
```

### Issue: Images not showing
**Solution**: Use absolute paths in HTML:
```html
<img src="/images/logo.png">
```

---

## 🎯 Next Steps After Setup

1. **Test all pages** - Navigate through the entire app
2. **Check console** - Fix any errors that appear
3. **Test features** - Verify cart, checkout, login work
4. **Build production** - Run `npm run build` and test
5. **Deploy** - Update deployment config to use Vite

---

## 📊 Performance Improvements

After migration, you should see:

- **75+ files → 3-5 bundles** (90% fewer HTTP requests)
- **40-60% smaller file sizes** (minification + tree shaking)
- **Instant hot reload** during development
- **Automatic cache busting** in production
- **Faster page loads** overall

---

## 🔄 Rollback Plan

If something goes wrong:

1. Stop Vite: `Ctrl+C`
2. Restore HTML files (remove `type="module"` from script tags)
3. Remove entry files from `/js` folder
4. Continue using old setup

---

## 📞 Need Help?

Check these resources:
- Vite Documentation: https://vitejs.dev
- Migration Guide: `VITE-MIGRATION-GUIDE.md`
- Troubleshooting: See above section

---

**Setup Version**: 1.0  
**Last Updated**: [Current Date]  
**Status**: Ready to use
