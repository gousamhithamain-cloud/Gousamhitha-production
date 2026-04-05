# Gousamhitha - Organic E-Commerce Platform

## 🎯 Project Overview

A modern e-commerce platform for organic products with:
- ✅ Nhost Authentication (Email/Password)
- ✅ PostgreSQL Database
- ✅ Real-time User Management
- ✅ Product Catalog
- ✅ Shopping Cart
- ✅ Order Management

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Create Database Schema
1. Go to https://nhost.io/dashboard
2. Login to your account
3. Click "gousamhitha" project
4. Go to "SQL Editor"
5. Copy content from `DATABASE-SCHEMA.sql`
6. Paste and run

### 3. Start Frontend
```bash
npm start
```

### 4. Open Browser
```
http://localhost:8000
```

---

## 📋 Nhost Configuration

```
Subdomain: gousamhitha
Region: eu-central-1
GraphQL: https://gousamhitha.eu-central-1.nhost.run/v1/graphql
Backend: https://gousamhitha.eu-central-1.nhost.run
```

---

## 🔐 Authentication

### Sign Up
- Click profile icon
- Click "Sign Up"
- Fill form and submit
- User created in Nhost

### Sign In
- Click profile icon
- Enter credentials
- Profile modal opens

### Profile
- View user details
- Edit profile (coming soon)
- Logout

---

## 📊 Database Tables

- **users** - User accounts
- **vendors** - Vendor information
- **categories** - Product categories
- **products** - Product listings
- **orders** - Customer orders
- **order_items** - Items in orders
- **cart** - Shopping cart
- **delivery_charges** - Delivery pricing
- **order_status_history** - Order tracking

---

## 📁 Project Structure

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
├── NHOST-COMPLETE-SETUP.md          # Complete setup guide
├── SETUP-INSTRUCTIONS.md            # Step-by-step setup
├── NHOST-CONFIGURED.md              # Configuration details
└── ... (other files)
```

---

## 🧪 Testing

### Test Sign Up
1. Click profile icon
2. Click "Sign Up"
3. Fill form:
   - Name: Test User
   - Email: test@example.com
   - Phone: 9876543210
   - Password: password123
4. Click "Create Account"
5. ✅ Profile modal opens

### Test Sign In
1. Click profile icon
2. Enter credentials
3. Click "Sign In"
4. ✅ Profile modal opens

### Test Profile Persistence
1. After login, refresh page (F5)
2. Click profile icon
3. ✅ Profile modal opens (not login)

### Test Logout
1. In profile modal, click "Logout"
2. ✅ Redirected to home

---

## 📚 Documentation

| File | Purpose |
|------|---------|
| NHOST-COMPLETE-SETUP.md | Complete setup guide |
| SETUP-INSTRUCTIONS.md | Step-by-step instructions |
| NHOST-CONFIGURED.md | Configuration details |
| NHOST-MIGRATION-GUIDE.md | Migration guide |
| DATABASE-SCHEMA.sql | Database schema |
| README.md | This file |

---

## 🔧 Configuration

### Nhost Client (`js/nhost-client.js`)
```javascript
export const nhost = new NhostClient({
    subdomain: "gousamhitha",
    region: "eu-central-1"
});
```

### Auth Handler (`js/nhost-auth-handler.js`)
- Sign up logic
- Sign in logic
- Profile management
- Logout logic

---

## 🎯 Features

✅ **Authentication**
- Email/password signup
- Email/password signin
- Session management
- Logout

✅ **User Management**
- User profiles
- User metadata
- Session persistence

✅ **Database**
- PostgreSQL
- Multiple tables
- Relationships
- Indexes

✅ **Frontend**
- Responsive design
- Profile modal
- Login/signup forms
- Error handling

---

## 🚀 Deployment

### Frontend
```bash
npm run build
# Deploy to Vercel, Netlify, or your hosting
```

### Nhost
- No deployment needed
- Automatically hosted
- Configure custom domain

---

## 🐛 Troubleshooting

### "npm: command not found"
Install Node.js from https://nodejs.org

### "Module not found: @nhost/nhost-js"
```bash
npm install @nhost/nhost-js
```

### "Sign up failed"
- Check email is not already registered
- Verify password is 6+ characters
- Check browser console (F12)

### "Profile modal not opening"
- Check browser console (F12)
- Verify user is logged in
- Refresh page

### "Database tables not created"
- Go to Nhost SQL Editor
- Run `DATABASE-SCHEMA.sql`
- Check for errors

---

## 📞 Support

- **Nhost Docs**: https://docs.nhost.io
- **Nhost Community**: https://community.nhost.io
- **GitHub**: https://github.com/nhost/nhost

---

## 📋 Checklist

- [ ] Install dependencies: `npm install`
- [ ] Create database schema in Nhost
- [ ] Start frontend: `npm start`
- [ ] Test sign up
- [ ] Test sign in
- [ ] Test profile
- [ ] Test logout
- [ ] Verify users in Nhost Dashboard

---

## 🎉 Ready!

Your project is fully configured with Nhost. Start with:

```bash
npm install
npm start
```

Then follow the setup guide in `NHOST-COMPLETE-SETUP.md`

---

## 📝 License

ISC

---

## 👨‍💻 Author

Gousamhitha Organic Products

---

**Happy coding! 🚀**
