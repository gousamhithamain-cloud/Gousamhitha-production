# Vercel Environment Variables Setup

## Required Environment Variables

Add these in Vercel Dashboard → Project Settings → Environment Variables:

### 1. SUPABASE_URL
- **Key**: `SUPABASE_URL`
- **Value**: `https://blsgyybaevuytmgpljyk.supabase.co`
- **Environment**: Production, Preview, Development (select all)

### 2. SUPABASE_ANON_KEY
- **Key**: `SUPABASE_ANON_KEY`
- **Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJsc2d5eWJhZXZ1eXRtZ3BsanlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE3NjcyMjYsImV4cCI6MjA4NzM0MzIyNn0.G4gvoW-_7DxQ1y28oZEHS7OIVpsyHTlZewV02Th_meU`
- **Environment**: Production, Preview, Development (select all)

## Step-by-Step Instructions

1. **Go to Vercel Dashboard**
   - Navigate to: https://vercel.com/dashboard
   - Select your project: `gousamhitha`

2. **Open Environment Variables Settings**
   - Click on "Settings" tab
   - Click on "Environment Variables" in the left sidebar

3. **Add SUPABASE_URL**
   - Click "Add Environment Variable" button
   - Enter Key: `SUPABASE_URL`
   - Enter Value: `https://blsgyybaevuytmgpljyk.supabase.co`
   - Check all environments: Production, Preview, Development
   - Click "Save"

4. **Add SUPABASE_ANON_KEY**
   - Click "Add Environment Variable" button again
   - Enter Key: `SUPABASE_ANON_KEY`
   - Enter Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJsc2d5eWJhZXZ1eXRtZ3BsanlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE3NjcyMjYsImV4cCI6MjA4NzM0MzIyNn0.G4gvoW-_7DxQ1y28oZEHS7OIVpsyHTlZewV02Th_meU`
   - Check all environments: Production, Preview, Development
   - Click "Save"

5. **Redeploy**
   - After adding environment variables, you need to redeploy
   - Go to "Deployments" tab
   - Click the three dots (...) on the latest deployment
   - Click "Redeploy"
   - OR just push a new commit to GitHub (auto-deploys)

## How It Works

1. **Serverless Function**: `/api/config.js` reads environment variables from Vercel
2. **HTML Pages**: Load `/api/config.js` first to inject variables into `window` object
3. **Supabase Client**: Reads from `window.SUPABASE_URL` and `window.SUPABASE_ANON_KEY`
4. **Fallback**: If variables are missing, uses hardcoded defaults

## Verification

After deployment, check browser console:
- Should see: "Environment config loaded"
- Should see: "Supabase URL: https://blsgyybaevuytmgpljyk.supabase.co"
- Should see: "Supabase Key: Present"
- Should see: "✅ Supabase client initialized successfully"

## Benefits of This Approach

✅ Credentials managed centrally in Vercel
✅ Easy to update without code changes
✅ Different credentials for staging/production
✅ Fallback to hardcoded values for local development
✅ No build process required

## Local Development

For local testing, the fallback values in `js/supabase-client.js` will be used automatically.
No need to set up environment variables locally.

---

**Note**: The Supabase anon key is safe to expose in frontend code. Your database security comes from Row Level Security (RLS) policies in Supabase.
