# Test Credentials & Setup Guide

## Backend Server Status

Before testing login, ensure your backend server is running:

```bash
cd backend
npm start
```

The backend should be running on: `http://localhost:4000`

## Testing Login

### Option 1: Create a New Account

1. Click the "Sign Up" tab in the modal
2. Fill in the form:
   - Full Name: Test User
   - Email: test@example.com
   - Mobile: 1234567890
   - Password: Test@123
   - Confirm Password: Test@123
3. Click "Create Account"

### Option 2: Use Existing Account

If you already have an account in your Supabase database, use those credentials.

### Option 3: Admin Login

For admin access, you need to:
1. Create a regular account first
2. Update the user's role in the database to 'admin'
3. Or use the admin assignment endpoint (requires existing admin)

## Database Setup

Make sure your Supabase database has:

1. **Users table** with columns:
   - id (uuid, primary key)
   - email (text, unique)
   - full_name (text)
   - phone (text)
   - role (text, default: 'user')
   - created_at (timestamp)

2. **Run the migration** to add the role column:
   ```bash
   # Execute the SQL in: backend/migrations/001_add_role_column.sql
   ```

## Troubleshooting

### "Failed to fetch" Error

This means the backend is not running or not accessible. Check:

1. Backend server is running on port 4000
2. No CORS errors in browser console
3. Backend .env file has correct Supabase credentials

### "Login error: TypeError: Failed to fetch"

The frontend cannot connect to the backend API. Verify:

```javascript
// In browser console, check:
console.log(window.API_BASE_URL);
// Should show: http://localhost:4000/api
```

### Backend Not Starting

Check:
1. `cd backend && npm install` - Install dependencies
2. `.env` file exists with valid Supabase credentials
3. Port 4000 is not already in use

## Current Configuration

- Frontend: http://localhost:5175/ (Vite dev server)
- Backend: http://localhost:4000/ (Express server)
- API Base: http://localhost:4000/api

## Quick Test

1. Open browser console (F12)
2. Try to sign up with test credentials
3. Check Network tab for API calls
4. Look for any error messages

## Google Sign-In

Currently showing "Google Sign-In is not yet configured" - this is a placeholder.
To implement Google OAuth, you'll need to:
1. Set up Google OAuth credentials
2. Configure Supabase Auth providers
3. Implement the OAuth flow in the frontend
