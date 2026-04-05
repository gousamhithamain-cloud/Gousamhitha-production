# Nhost Setup - Quick Start

## 🚀 Quick Setup (5 minutes)

### Step 1: Create Nhost Account
1. Go to https://nhost.io
2. Sign up (free tier available)
3. Create a new project

### Step 2: Get Your Credentials
After creating project, you'll see:
- **Subdomain**: e.g., `my-project`
- **Region**: e.g., `us-east-1`

### Step 3: Update Frontend Configuration
Edit `js/nhost-client.js`:

```javascript
export const nhost = new NhostClient({
    subdomain: "YOUR_SUBDOMAIN",  // Replace with your subdomain
    region: "YOUR_REGION"         // Replace with your region
});
```

Example:
```javascript
export const nhost = new NhostClient({
    subdomain: "gousamhitha",
    region: "us-east-1"
});
```

### Step 4: Create Database Schema
1. Go to Nhost Dashboard → SQL Editor
2. Copy entire content from `DATABASE-SCHEMA.sql`
3. Paste into SQL Editor
4. Click "Run"

### Step 5: Install Dependencies
```bash
npm install @nhost/nhost-js
```

### Step 6: Test
1. Open http://localhost:8000
2. Click profile icon
3. Sign up with test account
4. ✅ Profile modal should open

## 📋 What's Included

### Authentication
- ✅ Email/password signup
- ✅ Email/password signin
- ✅ Session management
- ✅ Logout

### Database
- ✅ Users table
- ✅ Products table
- ✅ Orders table
- ✅ Cart table
- ✅ All other tables

### Frontend
- ✅ Nhost client (`js/nhost-client.js`)
- ✅ Auth handler (`js/nhost-auth-handler.js`)
- ✅ Profile modal
- ✅ Login/signup forms

## 🔧 Configuration

### Nhost Client
File: `js/nhost-client.js`

```javascript
import { NhostClient } from "@nhost/nhost-js";

export const nhost = new NhostClient({
    subdomain: "YOUR_SUBDOMAIN",
    region: "YOUR_REGION"
});
```

### Auth Handler
File: `js/nhost-auth-handler.js`

Functions available:
- `handleSignUp(event)` - Sign up
- `handleSignIn(event)` - Sign in
- `logoutUser()` - Logout
- `showProfileModal()` - Show profile
- `updateProfileUI()` - Update UI

## 📚 Database Schema

Tables created:
1. **users** - User accounts
2. **vendors** - Vendor information
3. **categories** - Product categories
4. **products** - Product listings
5. **orders** - Customer orders
6. **order_items** - Items in orders
7. **cart** - Shopping cart
8. **delivery_charges** - Delivery pricing
9. **order_status_history** - Order tracking

## 🧪 Testing

### Test Sign Up
```
1. Click profile icon
2. Click "Sign Up"
3. Fill form:
   - Name: Test User
   - Email: test@example.com
   - Phone: 9876543210
   - Password: password123
4. Click "Create Account"
5. ✅ Profile modal opens
```

### Test Sign In
```
1. Click profile icon
2. Fill form:
   - Email: test@example.com
   - Password: password123
3. Click "Sign In"
4. ✅ Profile modal opens
```

### Test Profile Persistence
```
1. After login, refresh page (F5)
2. Click profile icon
3. ✅ Profile modal opens (not login)
4. ✅ Your details display
```

### Test Logout
```
1. In profile modal, click "Logout"
2. Confirm
3. ✅ Redirected to home
4. ✅ Profile icon returns to default
```

## 🐛 Troubleshooting

### "Nhost client not initialized"
**Solution**: Check `js/nhost-client.js` has correct subdomain and region

### "Sign up failed"
**Solution**: 
- Email might already exist
- Password must be 6+ characters
- Check browser console for error

### "Profile modal not opening"
**Solution**:
- Verify user is logged in
- Check browser console (F12)
- Verify Nhost project is active

### "Database tables not created"
**Solution**:
- Go to Nhost SQL Editor
- Run `DATABASE-SCHEMA.sql`
- Check for errors

## 📖 Documentation

- Full guide: `NHOST-MIGRATION-GUIDE.md`
- Database schema: `DATABASE-SCHEMA.sql`
- Auth handler: `js/nhost-auth-handler.js`
- Client config: `js/nhost-client.js`

## ✅ Checklist

- [ ] Create Nhost account
- [ ] Create Nhost project
- [ ] Get subdomain and region
- [ ] Update `js/nhost-client.js`
- [ ] Install `@nhost/nhost-js`
- [ ] Create database schema
- [ ] Test sign up
- [ ] Test sign in
- [ ] Test profile
- [ ] Test logout

## 🎉 Done!

Your project is now using Nhost for:
- ✅ Authentication
- ✅ PostgreSQL database
- ✅ User management
- ✅ Session management

No backend server needed!

## 📞 Support

- Nhost Docs: https://docs.nhost.io
- Nhost Community: https://community.nhost.io
- GitHub: https://github.com/nhost/nhost
