# Fix Authentication Issues

## Problem
Sign In/Sign Up buttons not responding or showing "Email not confirmed" error.

## Solutions

### 1. Disable Email Confirmation in Supabase (CRITICAL)

Go to your Supabase Dashboard:
1. Open https://supabase.com/dashboard
2. Select project: **Gousamhitha** (ttxsrnzvfybidbptkpuv)
3. Go to **Authentication** → **Providers** → **Email**
4. Find the setting: **"Confirm email"**
5. **TURN IT OFF** (disable it)
6. Click **Save**

This is required for development/testing. Users can sign up and login immediately without email verification.

### 2. Clear Rate Limits

In the same Supabase Dashboard:
1. Go to **Authentication** → **Rate Limits**
2. Find "Email signups per hour"
3. Increase the limit to 100 or higher
4. Click **Save**

### 3. Test with Fresh Email

The rate limit might be tied to specific emails you've been testing with.

Try these email formats:
- `yourname+test1@gmail.com`
- `yourname+test2@gmail.com`
- `yourname+test3@gmail.com`

Gmail treats these as different emails, but they all go to `yourname@gmail.com`

### 4. Clear Browser Cache

1. Press `Ctrl + Shift + Delete` (Windows) or `Cmd + Shift + Delete` (Mac)
2. Select "Cached images and files"
3. Click "Clear data"
4. Refresh the page with `Ctrl + F5`

### 5. Verify Supabase Connection

Open browser console (F12) and check for:
- ✅ "Supabase connected successfully"
- ✅ "Supabase auth handler initialized"

If you don't see these, refresh the page.

### 6. Test Authentication Flow

After making the changes above:

1. Restart your server:
   ```bash
   python -m http.server 8000
   ```

2. Open: http://localhost:8000/ecommerce-main/index.html

3. Click the profile icon (top right)

4. Click "Sign Up" tab

5. Fill in the form with a NEW email (use the + trick above)

6. Click "Create Account"

7. You should see "Account created successfully!" and be logged in immediately

### 7. If Still Not Working

Try the debug page:
1. Open: http://localhost:8000/ecommerce-main/test-signup-debug.html
2. Change the email to something unique
3. Click "Test Signup"
4. Check the debug output for detailed error information
5. Share the debug output if you need help

## Common Errors and Fixes

### "Email not confirmed"
- **Fix**: Disable email confirmation in Supabase (step 1 above)

### "Email rate limit exceeded"
- **Fix**: Wait 15 minutes OR use a different email OR increase rate limits (step 2 above)

### "Invalid login credentials"
- **Fix**: Make sure you're using the correct email/password OR create a new account first

### Buttons not responding
- **Fix**: Clear cache (step 4) and refresh page
- **Fix**: Check console for JavaScript errors
- **Fix**: Make sure Supabase scripts are loaded (check console for green checkmarks)

## Quick Test Account

For immediate testing, you can use the admin account:
- Email: `gowsamhitha123@gmail.com`
- Password: `123456`

This should work immediately and redirect you to the admin dashboard.
