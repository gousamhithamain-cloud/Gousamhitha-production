# ✅ Vercel Deployment Checklist

## Pre-Deployment Verification

### 1. Supabase Configuration ✓
- [x] Supabase URL: `https://blsgyybaevuytmgpljyk.supabase.co`
- [x] Anon Key: Embedded in `js/supabase-client.js`
- [x] Client initialization: UMD build from CDN
- [x] All pages use version v=8 for cache busting

### 2. Database Tables ✓
Ensure these tables exist in Supabase:
- [x] users
- [x] products
- [x] cart
- [x] orders
- [x] order_items
- [x] vendors
- [x] delivery_zones

### 3. RLS Policies ✓
Verify Row Level Security policies are enabled for:
- [x] cart (user can only access their own cart)
- [x] orders (user can only see their own orders)
- [x] products (public read access)

### 4. File Structure ✓
```
ecommerce-main/
├── index.html ✓
├── shop.html ✓
├── cart.html ✓
├── checkout.html ✓
├── orders.html ✓
├── profile.html ✓
├── admin-*.html ✓
├── js/
│   ├── supabase-client.js (v=8) ✓
│   ├── supabase-auth.js ✓
│   ├── cart-handler.js ✓
│   ├── profile-handler.js ✓
│   └── mobile-menu.js ✓
├── product-display.js (v=9) ✓
├── payment.js ✓
└── vercel.json ✓
```

### 5. Vercel Configuration ✓
- [x] `vercel.json` in root with proper settings
- [x] Output directory: `ecommerce-main`
- [x] Cache headers configured
- [x] No build command needed (static site)

## Deployment Steps

### Step 1: Push to GitHub ✓
```bash
cd ecommerce-main
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

### Step 2: Connect to Vercel
1. Go to https://vercel.com
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure settings:
   - Framework Preset: **Other**
   - Root Directory: **Leave as is** (vercel.json handles this)
   - Build Command: **Leave empty**
   - Output Directory: **Leave empty** (vercel.json specifies it)
   - Install Command: **Leave empty**

### Step 3: Deploy
1. Click "Deploy"
2. Wait for deployment to complete
3. Vercel will provide a URL (e.g., your-project.vercel.app)

### Step 4: Custom Domain (Optional)
1. Go to Project Settings → Domains
2. Add your custom domain (e.g., gousamhitha.com)
3. Follow DNS configuration instructions

## Post-Deployment Testing

### Test Page: test-deployment.html
Visit: `https://your-domain.com/test-deployment.html`

This page will automatically test:
- ✓ Supabase client initialization
- ✓ Database connection
- ✓ Products table access
- ✓ Cart table access
- ✓ Orders table access
- ✓ Authentication service

### Manual Testing Checklist

1. **Home Page** (`/` or `/index.html`)
   - [ ] Page loads without errors
   - [ ] Featured products display
   - [ ] Navigation works

2. **Shop Page** (`/shop.html`)
   - [ ] Products load from Supabase
   - [ ] Category filtering works
   - [ ] Add to cart works (requires login)

3. **Authentication**
   - [ ] Sign up creates new user
   - [ ] Login works
   - [ ] Profile icon redirects to profile page when logged in
   - [ ] Admin login (admin@123.com) redirects to admin dashboard

4. **Cart** (`/cart.html`)
   - [ ] Cart items display
   - [ ] Quantity update works
   - [ ] Remove item works
   - [ ] Proceed to checkout works

5. **Checkout** (`/checkout.html`)
   - [ ] Order summary displays
   - [ ] Payment options show (UPI only for donations)
   - [ ] Order placement works
   - [ ] Stock reduces after order

6. **Orders** (`/orders.html`)
   - [ ] User orders display
   - [ ] Order details show correctly
   - [ ] Order status displays

7. **Admin Panel** (`/admin-dashboard.html`)
   - [ ] Dashboard loads
   - [ ] All admin pages accessible
   - [ ] Product management works
   - [ ] Order management works
   - [ ] Vendor management works

## Troubleshooting

### Products Not Loading
1. Open browser console (F12)
2. Check for errors
3. Verify "Supabase initialized" message appears
4. Check network tab for failed requests
5. Verify Supabase URL and key in `js/supabase-client.js`

### Authentication Issues
1. Check Supabase dashboard → Authentication → Settings
2. Verify email confirmation is disabled (for development)
3. Check Site URL is set correctly
4. Verify Redirect URLs include your domain

### CORS Errors
1. Go to Supabase dashboard → Settings → API
2. Add your Vercel domain to allowed origins
3. Redeploy if needed

### Cache Issues
1. All scripts use version parameters (`?v=8`)
2. Clear browser cache: Ctrl + Shift + Delete
3. Hard refresh: Ctrl + F5
4. Try incognito/private mode

## Success Indicators

✅ All pages load without console errors
✅ Products display on shop page
✅ Authentication works (sign up/login)
✅ Cart functionality works
✅ Checkout process completes
✅ Orders display correctly
✅ Admin panel accessible and functional

## Support

If issues persist:
1. Check browser console for specific errors
2. Verify Supabase dashboard shows no issues
3. Check Vercel deployment logs
4. Ensure all database tables and RLS policies are correct

---

**Last Updated**: March 7, 2026
**Deployment Status**: Ready ✓
