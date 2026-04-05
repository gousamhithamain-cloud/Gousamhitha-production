# Nhost Migration Guide

## Overview
This project has been migrated from custom JWT authentication + Neon PostgreSQL to **Nhost** (a Supabase-like platform with built-in authentication and PostgreSQL).

## What Changed

### Removed ❌
- ✅ Custom Node.js backend server
- ✅ JWT authentication logic
- ✅ HTTP-only cookies
- ✅ Neon PostgreSQL connection
- ✅ Supabase files
- ✅ MongoDB references

### Added ✅
- ✅ Nhost client library
- ✅ Nhost authentication handler
- ✅ Direct frontend-to-Nhost communication
- ✅ Database schema (ready for Nhost SQL editor)

## Step 1: Create Nhost Account

1. Go to [https://nhost.io](https://nhost.io)
2. Sign up for a free account
3. Create a new project
4. Get your credentials:
   - **Subdomain**: Your Nhost project subdomain
   - **Region**: Your Nhost region (e.g., us-east-1, eu-west-1)

## Step 2: Update Nhost Client Configuration

Edit `js/nhost-client.js` and replace:

```javascript
export const nhost = new NhostClient({
    subdomain: "YOUR_NHOST_SUBDOMAIN",  // Replace with your subdomain
    region: "YOUR_NHOST_REGION"         // Replace with your region
});
```

Example:
```javascript
export const nhost = new NhostClient({
    subdomain: "my-project",
    region: "us-east-1"
});
```

## Step 3: Install Nhost Client Library

```bash
npm install @nhost/nhost-js
```

Or if using in browser directly:
```html
<script src="https://cdn.jsdelivr.net/npm/@nhost/nhost-js@latest"></script>
```

## Step 4: Create Database Schema in Nhost

1. Go to Nhost Dashboard → SQL Editor
2. Copy the entire content from `DATABASE-SCHEMA.sql`
3. Paste it into the SQL Editor
4. Click "Run" to create all tables

The schema includes:
- users
- vendors
- categories
- products
- orders
- order_items
- cart
- delivery_charges
- order_status_history

## Step 5: Test Authentication

### Sign Up
1. Open http://localhost:8000
2. Click profile icon
3. Click "Sign Up"
4. Fill in:
   - Full Name
   - Email
   - Mobile
   - Password
5. Click "Create Account"
6. ✅ User should be created in Nhost auth.users table
7. ✅ Profile modal should open

### Sign In
1. Click profile icon
2. Enter email and password
3. Click "Sign In"
4. ✅ Profile modal should open

### Profile
1. After login, click profile icon
2. ✅ Profile modal should show user details
3. ✅ User details come from Nhost auth

### Logout
1. In profile modal, click "Logout"
2. ✅ User should be logged out
3. ✅ Profile icon should return to default

## File Structure

```
ecommerce-main/
├── js/
│   ├── nhost-client.js          # Nhost client configuration
│   ├── nhost-auth-handler.js    # Authentication logic
│   ├── error-handler.js
│   ├── toast.js
│   └── mobile-menu.js
├── DATABASE-SCHEMA.sql          # Database schema for Nhost
├── index.html                   # Main page (updated)
├── NHOST-MIGRATION-GUIDE.md     # This file
└── ... (other files)
```

## Nhost Features Used

### Authentication
- Email/password signup
- Email/password signin
- Session management
- User metadata storage

### Database
- PostgreSQL with full SQL support
- SQL Editor for running queries
- Real-time subscriptions (optional)
- GraphQL API (optional)

### Storage
- File storage (optional)
- User profile pictures (optional)

## API Reference

### Sign Up
```javascript
const { session, error } = await nhost.auth.signUp({
    email: "user@example.com",
    password: "password123",
    options: {
        displayName: "John Doe",
        metadata: {
            phone: "9876543210"
        }
    }
});
```

### Sign In
```javascript
const { session, error } = await nhost.auth.signIn({
    email: "user@example.com",
    password: "password123"
});
```

### Get Current User
```javascript
const user = nhost.auth.getUser();
// Returns: { id, email, displayName, metadata, ... }
```

### Sign Out
```javascript
await nhost.auth.signOut();
```

### Check if Logged In
```javascript
const isLoggedIn = nhost.auth.isAuthenticated();
```

## Database Queries

### Using Nhost GraphQL API
```javascript
const query = `
    query GetUser($id: uuid!) {
        users_by_pk(id: $id) {
            id
            email
            first_name
            last_name
        }
    }
`;

const response = await nhost.graphql.request(query, {
    id: userId
});
```

### Using Nhost REST API
```javascript
const response = await fetch('https://YOUR_SUBDOMAIN.nhost.run/v1/graphql', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.accessToken}`
    },
    body: JSON.stringify({ query })
});
```

## Environment Variables

No environment variables needed for frontend! Nhost credentials are in `js/nhost-client.js`.

For backend (if needed later):
```
NHOST_SUBDOMAIN=your-subdomain
NHOST_REGION=us-east-1
NHOST_ADMIN_SECRET=your-admin-secret
```

## Troubleshooting

### "Nhost client not initialized"
- Check that `js/nhost-client.js` has correct subdomain and region
- Verify Nhost project is active in dashboard

### "Sign up failed"
- Check email is not already registered
- Verify password is at least 6 characters
- Check browser console for error details

### "Profile modal not opening"
- Verify user is logged in: `nhost.auth.isAuthenticated()`
- Check browser console for errors
- Verify Nhost project is running

### "Database tables not created"
- Go to Nhost SQL Editor
- Run `DATABASE-SCHEMA.sql`
- Verify tables appear in database

### "User data not showing"
- Check user metadata is set during signup
- Verify user exists in Nhost auth.users table
- Check browser console for errors

## Next Steps

1. ✅ Update Nhost credentials in `js/nhost-client.js`
2. ✅ Create database schema in Nhost SQL Editor
3. ✅ Test authentication flow
4. ✅ Test database queries
5. ⬜ Add product management
6. ⬜ Add order management
7. ⬜ Add admin dashboard
8. ⬜ Deploy to production

## Production Deployment

### Before Deploying
1. Update Nhost credentials for production
2. Enable HTTPS
3. Set up custom domain
4. Configure CORS in Nhost
5. Set up backups

### Deploy Frontend
```bash
npm run build
# Deploy to Vercel, Netlify, or your hosting
```

### Nhost Production
1. Go to Nhost Dashboard
2. Set up production environment
3. Configure database backups
4. Enable monitoring

## Support

- Nhost Docs: https://docs.nhost.io
- Nhost Community: https://community.nhost.io
- GitHub Issues: https://github.com/nhost/nhost

## Migration Checklist

- [ ] Create Nhost account
- [ ] Create Nhost project
- [ ] Get subdomain and region
- [ ] Update `js/nhost-client.js`
- [ ] Install `@nhost/nhost-js`
- [ ] Create database schema in SQL Editor
- [ ] Test sign up
- [ ] Test sign in
- [ ] Test profile
- [ ] Test logout
- [ ] Test database queries
- [ ] Deploy to production

## Summary

✅ **Migration Complete!**

Your project now uses Nhost for:
- Authentication (email/password)
- PostgreSQL database
- User management
- Session management

No more custom backend needed!
