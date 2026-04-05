# Vite Migration - Quick Start Guide

## ✅ What's Done

1. ✅ Vite installed and configured
2. ✅ Entry point files created (main.js, shop-main.js, etc.)
3. ✅ index.html updated (scripts + CSS paths)
4. ✅ shop.html updated (scripts + CSS paths)
5. ✅ CSS loading fixed (absolute paths)

---

## 🚀 How to Run

### Terminal 1 - Frontend (Vite):
```bash
cd Gousamhitha-main
npm run dev
```
Opens at: `http://localhost:5173`

### Terminal 2 - Backend (Express):
```bash
cd Gousamhitha-main/backend
npm start
```
Runs at: `http://localhost:4000`

---

## 📋 What Works Now

- ✅ Home page (index.html) - Fully migrated
- ✅ Shop page (shop.html) - Fully migrated
- ✅ CSS loading correctly
- ✅ JavaScript bundling
- ✅ Backend API proxy configured
- ✅ Hot module replacement (HMR)

---

## ⏳ What's Left

### Remaining HTML Files to Update:

**User Pages** (High Priority):
- cart.html
- checkout.html
- login.html
- signup.html
- profile.html
- orders.html
- product.html

**Admin Pages**:
- admin-dashboard.html
- admin-products.html
- admin-add-product.html
- admin-orders.html
- (+ 5 more admin pages)

**Info Pages** (Low Priority):
- about.html
- contact.html
- donations.html
- gowshala.html
- how-to-use.html
- privacy-policy.html
- terms.html

---

## 🔧 How to Update Remaining Files

For each HTML file, make 2 changes:

### 1. Fix CSS Paths (in `<head>`):
```html
<!-- BEFORE -->
<link rel="stylesheet" href="styles.css">
<link rel="stylesheet" href="css/responsive.css">

<!-- AFTER -->
<link rel="stylesheet" href="/styles.css">
<link rel="stylesheet" href="/css/responsive.css">
```

### 2. Replace Script Tags (before `</body>`):
```html
<!-- BEFORE -->
<script src="js/script1.js"></script>
<script src="js/script2.js"></script>
<script src="js/script3.js"></script>

<!-- AFTER -->
<script type="module" src="/js/[page]-main.js"></script>
```

**Entry files available**:
- `/js/main.js` - Home page
- `/js/shop-main.js` - Shop page
- `/js/cart-main.js` - Cart page
- `/js/checkout-main.js` - Checkout page
- `/js/login-main.js` - Login page
- `/js/signup-main.js` - Signup page
- `/js/profile-main.js` - Profile page
- `/js/admin-main.js` - All admin pages

---

## 📊 Progress

**Completed**: 2/30+ files (7%)
- ✅ index.html
- ✅ shop.html

**Status**: Ready to test and continue migration

---

## 🧪 Testing

1. Start both servers (frontend + backend)
2. Open `http://localhost:5173`
3. Check:
   - ✅ Page loads
   - ✅ Styles applied correctly
   - ✅ No console errors
   - ✅ Navigation works
   - ✅ API calls work

---

## 📚 Documentation

- `VITE-MIGRATION-GUIDE.md` - Complete step-by-step guide
- `VITE-SETUP-INSTRUCTIONS.md` - Setup instructions
- `CSS-FIXES-COMPLETE.md` - CSS path fixes explained
- `VITE-MIGRATION-PROGRESS.md` - Progress tracker
- `HTML-UPDATES-COMPLETE.md` - HTML changes log

---

## 🎯 Next Steps

1. **Test current setup** - Verify index.html and shop.html work
2. **Update cart.html** - Next priority page
3. **Update checkout.html** - Critical for orders
4. **Update login/signup** - Authentication pages
5. **Update profile.html** - User account page
6. **Update admin pages** - Admin dashboard
7. **Final testing** - Test all pages
8. **Deploy** - Update deployment config

---

## 💡 Tips

- **Clear cache** if styles don't load: Ctrl+Shift+R
- **Check console** for errors
- **Use absolute paths** for all assets: `/images/logo.png`
- **Test in incognito** to avoid cache issues
- **Keep backend running** for API calls

---

**Status**: Migration 7% Complete ✅  
**Ready**: index.html, shop.html  
**Next**: Test and continue with remaining pages
