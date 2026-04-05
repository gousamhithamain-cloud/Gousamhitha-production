# ✅ Working Test Credentials

## System Status

- ✅ Frontend: http://localhost:5175/ (Vite - Running)
- ✅ Backend: http://localhost:4000/ (Express - Running)
- ✅ Database: Supabase (Connected)
- ✅ API: Working (20 products loaded)

## How to Test Login

### Option 1: Create a New Account (Recommended)

1. Go to http://localhost:5175/
2. Click the profile icon (top right)
3. Click "Sign Up" tab
4. Fill in the form:
   ```
   Full Name: Test User
   Email: test@example.com
   Mobile: 9876543210
   Password: Test@123
   Confirm Password: Test@123
   ```
5. Click "Create Account"
6. You'll be automatically logged in

### Option 2: Use Existing Account

If you already have an account in your Supabase database, use those credentials:
- Email: your-email@example.com
- Password: your-password

## Testing the Login Flow

1. **Open the login modal**:
   - Click the profile icon in the navbar
   - Modal should open with "Sign In" and "Sign Up" tabs

2. **Sign Up (First Time)**:
   - Switch to "Sign Up" tab
   - Enter your details
   - Click "Create Account"
   - Should see "Account created successfully!"
   - Page will reload and you'll be logged in

3. **Sign In (Returning User)**:
   - Enter your email/mobile
   - Enter your password
   - Click "Sign In"
   - Should see "Login successful!"
   - Page will reload

4. **Check Login Status**:
   - After login, click profile icon again
   - Should see dropdown with your name and email
   - Options: "My Orders" and "Logout"

5. **Logout**:
   - Click "Logout" in the dropdown
   - Will redirect to home page
   - Profile icon returns to login state

## Admin Access

To access admin dashboard:

1. Create a regular account first
2. Update the user's role in Supabase:
   - Go to Supabase Dashboard
   - Table Editor → users table
   - Find your user
   - Change `role` column from 'user' to 'admin'
3. Login again
4. You'll be redirected to admin dashboard

## Troubleshooting

### "Failed to fetch" Error
- Backend is not running
- Solution: Check terminal for backend errors

### "Login error: Invalid credentials"
- Wrong email/password
- Solution: Try creating a new account

### "Email already exists"
- Account already created
- Solution: Use "Sign In" instead of "Sign Up"

## Current Configuration

```
Frontend URL: http://localhost:5175/
Backend URL: http://localhost:4000/
API Base: http://localhost:4000/api
Supabase Project: blsgyybaevuytmgpljyk
```

## Quick Test Commands

Open browser console (F12) and run:

```javascript
// Check if user is logged in
console.log(localStorage.getItem('auth_user'));

// Check auth token
console.log(localStorage.getItem('auth_token'));

// Check API base URL
console.log(window.API_BASE_URL);
```

## Next Steps

1. ✅ Backend configured with Supabase credentials
2. ✅ Frontend and backend running
3. ✅ Login modal working
4. 🔄 Create your first account and test login
5. 🔄 Test the complete user flow
