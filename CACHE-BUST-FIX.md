# Critical Fix: Cache Busting for Vercel

## Problem
Vercel is serving OLD cached versions of JavaScript files, causing:
- `SUPABASE_CONFIG is not defined` errors
- `supabase is not defined` errors

## Solution
Add version parameters to ALL script tags to force cache refresh.

## Files That Need Version Parameters

### Format:
```html
<script src="js/config.js?v=20260301"></script>
<script src="supabase-auth.js?v=20260301"></script>
```

### Why This Works:
- Browser sees `?v=20260301` as a NEW file
- Forces download of latest version
- Bypasses Vercel and browser cache

## Quick Fix Command

Run this in your terminal to update version on all files:
```bash
# Update version number whenever you make changes
# Change 20260301 to current date (YYYYMMDD format)
```

## After Pushing:
1. Wait for Vercel to deploy (1-2 min)
2. Hard refresh browser (Ctrl+F5)
3. Check console for success messages

## Version History:
- v20260220 - Initial deployment
- v20260301 - Fixed SUPABASE_CONFIG error
