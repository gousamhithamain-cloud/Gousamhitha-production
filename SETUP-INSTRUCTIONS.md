# Setup Instructions - Nhost Integration

## ✅ Current Status

Your Nhost project is configured with:
- **Subdomain**: `gousamhitha`
- **Region**: `eu-central-1`
- **Frontend**: Ready
- **Database Schema**: Ready

---

## 🚀 Installation Steps

### Step 1: Install Dependencies
```bash
npm install
```

This will install:
- `@nhost/nhost-js` - Nhost client library

### Step 2: Create Database Schema

1. **Go to Nhost Dashboard**
   - URL: https://nhost.io/dashboard
   - Login with your account

2. **Navigate to SQL Editor**
   - Click on your project
   - Go to "SQL Editor" tab

3. **Create Tables**
   - Open `DATABASE-SCHEMA.sql` file
   - Copy entire content
   - Paste into Nhost SQL Editor
   - Click "Run"

4. **Verify Tables Created**
   - Go to "Database" tab
   - You should see these tables:
     - users
     - vendors
     - categories
     - products
     - orders
     - order_items
     - cart
     - delivery_charges
     - order_status_history

### Step 3: Start Frontend

```bash
npm start
```

This will start a local server on `http://localhost:8000`

### Step 4: Test Authentication

#### Test 1: Sign Up
1. Open http://localhost:8000
2. Click profile icon (top right)
3. Click "Sign Up" tab
4. Fill form:
   - Full Name: `Test User`
   - Email: `test@example.com`
   - Mobile: `9876543210`
   - Password: `password123`
   - Confirm Password: `password123`
5. Click "Create Account"
6. ✅ Profile modal should open
7. ✅ User should appear in Nhost Dashboard → Authentication → Users

#### Test 2: Sign In
1. Click profile icon
2. Fill form:
   - Email: `test@example.com`
   - Password: `password123`
3. Click "Sign In"
4. ✅ Profile modal should open with your details

#### Test 3: Profile Persistence
1. After login, refresh page (F5)
2. Click profile icon
3. ✅ Profile modal should open (not login modal)
4. ✅ Your details should display

#### Test 4: Logout
1. In profile modal, click "Logout"
2. Confirm logout
3. ✅ Redirected to home page
4. ✅ Profile icon returns to default state

---

## 📋 Verification Checklist

### Frontend
- [ ] `npm install` completed successfully
- [ ] `@nhost/nhost-js` installed
- [ ] `js/nhost-client.js` has correct credentials
- [ ] `js/nhost-auth-handler.js` is present
- [ ] `index.html` references Nhost scripts

### Nhost Dashboard
- [ ] Project created
- [ ] SQL Editor accessible
- [ ] Database schema created
- [ ] All tables visible in Database tab
- [ ] Authentication tab shows created users

### Authentication
- [ ] Sign up works
- [ ] User appears in Nhost Dashboard
- [ ] Sign in works
- [ ] Profile modal opens after login
- [ ] Profile persists after page refresh
- [ ] Logout works

---

## 🔧 Configuration Files

### `js/nhost-client.js`
```javascript
export const nhost = new NhostClient({
    subdomain: "gousamhitha",
    region: "eu-central-1"
});
```

### `js/nhost-auth-handler.js`
Contains:
- `handleSignUp()` - Sign up logic
- `handleSignIn()` - Sign in logic
- `logoutUser()` - Logout logic
- `showProfileModal()` - Profile display
- `updateProfileUI()` - UI updates

### `DATABASE-SCHEMA.sql`
Contains all table definitions for:
- users
- vendors
- categories
- products
- orders
- order_items
- cart
- delivery_charges
- order_status_history

---

## 📊 Project Structure

```
ecommerce-main/
├── js/
│   ├── nhost-client.js              # Nhost configuration
│   ├── nhost-auth-handler.js        # Authentication logic
│   ├── error-handler.js
│   ├── toast.js
│   └── mobile-menu.js
├── index.html                       # Main page
├── package.json                     # Dependencies
├── DATABASE-SCHEMA.sql              # Database schema
├── SETUP-INSTRUCTIONS.md            # This file
├── NHOST-CONFIGURED.md              # Configuration details
├── NHOST-MIGRATION-GUIDE.md         # Full migration guide
└── ... (other files)
```

---

## 🧪 Testing the System

### Quick Test
```bash
# 1. Install dependencies
npm install

# 2. Start server
npm start

# 3. Open browser
# http://localhost:8000

# 4. Test sign up
# Click profile icon → Sign Up → Fill form → Create Account

# 5. Verify in Nhost Dashboard
# Go to Authentication → Users → See your new user
```

---

## 🐛 Troubleshooting

### Issue: "Module not found: @nhost/nhost-js"
**Solution**:
```bash
npm install @nhost/nhost-js
```

### Issue: "Cannot find module '@nhost/nhost-js'"
**Solution**:
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Issue: "Sign up failed"
**Possible causes**:
- Email already registered
- Password less than 6 characters
- Nhost project not active

**Solution**:
- Check browser console (F12) for error
- Try different email
- Verify Nhost project is running

### Issue: "Profile modal not opening"
**Possible causes**:
- User not logged in
- Nhost client not initialized
- JavaScript error

**Solution**:
- Check browser console (F12)
- Verify `js/nhost-client.js` has correct credentials
- Refresh page

### Issue: "Users not appearing in Nhost Dashboard"
**Solution**:
- Go to Nhost Dashboard
- Click on your project
- Go to "Authentication" tab
- Click "Users"
- Refresh page
- Users should appear

### Issue: "Database tables not created"
**Solution**:
1. Go to Nhost Dashboard
2. Click on your project
3. Go to "SQL Editor"
4. Copy content from `DATABASE-SCHEMA.sql`
5. Paste into SQL Editor
6. Click "Run"
7. Check for errors

---

## 📚 Documentation Files

- **SETUP-INSTRUCTIONS.md** - This file (setup guide)
- **NHOST-CONFIGURED.md** - Configuration details
- **NHOST-MIGRATION-GUIDE.md** - Full migration guide
- **NHOST-SETUP.md** - Quick setup guide
- **DATABASE-SCHEMA.sql** - Database schema
- **MIGRATION-COMPLETE.md** - Migration summary

---

## 🎯 Next Steps

1. ✅ Install dependencies: `npm install`
2. ✅ Create database schema in Nhost SQL Editor
3. ✅ Start frontend: `npm start`
4. ✅ Test authentication
5. ⬜ Add product management
6. ⬜ Add order management
7. ⬜ Add admin dashboard
8. ⬜ Deploy to production

---

## 🚀 Deployment

### Frontend Deployment
```bash
npm run build
# Deploy to Vercel, Netlify, or your hosting
```

### Nhost Deployment
- No deployment needed
- Automatically hosted
- Configure custom domain in Nhost Dashboard

---

## 📞 Support

- **Nhost Docs**: https://docs.nhost.io
- **Nhost Community**: https://community.nhost.io
- **GitHub**: https://github.com/nhost/nhost

---

## ✅ Ready to Go!

Your project is configured and ready to use Nhost for:
- ✅ Authentication
- ✅ PostgreSQL database
- ✅ User management
- ✅ Session management

**Start with**: `npm install` then `npm start`
