# Vercel Deployment Guide - Fix 404 Errors

This guide will help you deploy your Gousamhitha e-commerce app to Vercel without 404 errors.

## Prerequisites
- Vercel account (free at vercel.com)
- GitHub repository with your code
- Node.js 16+ installed

## Step 1: Push Code to GitHub

All code has been pushed to GitHub. Make sure your main branch is up to date:

```bash
git status
git push
```

## Step 2: Import Project in Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **"New Project"** or **"Import Project"**
3. Select **GitHub** as the provider
4. Search for your repository: `GOUSAMHITHA-MAIN/Gousamhitha`
5. Click **Import**

## Step 3: Configure Project Settings

### Build & Output Settings
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### Environment Variables

Add these environment variables in Vercel Dashboard (Settings → Environment Variables):

#### Frontend Variables (Client-side)
```
VITE_API_URL=https://your-backend-url.herokuapp.com
VITE_SUPABASE_URL=https://blsgyybaevuytmgpljyk.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJsc2d5eWJhZXZ1eXRtZ3BsanlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE3NjcyMjYsImV4cCI6MjA4NzM0MzIyNn0.G4gvoW-_7DxQ1y28oZEHS7OIVpsyHTlZewV02Th_meU
```

**IMPORTANT**: Only add variables that should be public (VITE_ prefix). Do NOT add sensitive keys like `SUPABASE_SERVICE_KEY`.

## Step 4: Fix 404 Errors

The `vercel.json` file has been updated with proper SPA routing configuration. This includes:

- ✅ Proper build command and output directory
- ✅ SPA fallback routing (all non-matched routes → index.html)
- ✅ Asset caching headers for performance
- ✅ HTML file routing support

### What the fix does:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "routes": [
    {
      "src": "(.*)",
      "dest": "/index.html",
      "status": 200
    }
  ]
}
```

This ensures that when a user navigates to any route not explicitly found, it falls back to `index.html` (your SPA entry point).

## Step 5: Deploy

1. After configuring environment variables, click **Deploy**
2. Wait for the deployment to complete (usually 2-3 minutes)
3. Once deployed, you'll get a live URL like `https://gousamhitha.vercel.app`

## Step 6: Test the Deployment

Visit your Vercel URL and test:

1. **Homepage**: `https://yourdomain.vercel.app/`
2. **Shop Page**: `https://yourdomain.vercel.app/shop.html`
3. **Product Page**: `https://yourdomain.vercel.app/product.html`
4. **Admin Panel**: `https://yourdomain.vercel.app/admin-dashboard.html`
5. **Cart**: `https://yourdomain.vercel.app/cart.html`
6. **Checkout**: `https://yourdomain.vercel.app/checkout.html`

If you get 404 errors, try:
- Hard refresh: `Ctrl+Shift+Delete` (Windows) or `Cmd+Shift+Delete` (Mac)
- Clear browser cache
- Redeploy from Vercel dashboard

## Step 7: Setup Custom Domain (Optional)

1. In Vercel Dashboard → Settings → Domains
2. Add your custom domain (e.g., `yourdomain.com`)
3. Follow Vercel's DNS configuration instructions
4. Update your DNS records at your domain provider

## Troubleshooting

### Problem: Still getting 404 errors
**Solution:**
- Check that `vercel.json` is properly configured
- Ensure `dist` folder exists in the build output
- Check build logs in Vercel dashboard for errors
- Try clearing Vercel cache and redeploying

### Problem: Environment variables not loading
**Solution:**
- Variables must have `VITE_` prefix to be available in browser
- Restart the build after adding variables
- They won't appear in JS immediately; rebuild required

### Problem: API calls failing (CORS errors)
**Solution:**
- Ensure `VITE_API_URL` points to your backend URL
- Backend must have CORS enabled for your Vercel domain
- Update backend CORS configuration if needed

### Problem: Assets not loading (CSS/JS broken)
**Solution:**
- Check vite.config.js output directory is `dist`
- Ensure assets are being bundled correctly
- Check browser DevTools Network tab for 404s on specific assets

## Files Modified for Deployment

- ✅ `vercel.json` - Updated routing configuration
- ✅ `.vercelignore` - Updated to ignore unnecessary files
- ✅ `package.json` - Build scripts configured

## Backend Deployment

If your backend is also deployed (e.g., Heroku, Railway, Render):
1. Update `VITE_API_URL` to point to your deployed backend
2. Ensure backend CORS allows your Vercel domain
3. Test API calls from deployed frontend

## Performance Optimization

The configuration includes:
- **Asset caching**: Static files cached for 1 year
- **HTML caching**: HTML files cached for 1 hour (allows updates)
- **Bundle optimization**: Chunking for better performance
- **Minification**: Automatic via Vite

## Security Notes

- ✅ Never commit `.env` files with secrets
- ✅ Use Vercel's environment variables for sensitive data
- ✅ Only expose variables with `VITE_` prefix to browser
- ✅ Keep `SUPABASE_SERVICE_KEY` secret (server-only)

## Verification Checklist

Before marking deployment as complete:

- [ ] Local build works: `npm run build`
- [ ] Build creates `dist` folder with index.html
- [ ] Vercel dashboard shows successful deployment
- [ ] Homepage loads without 404
- [ ] Navigation between pages works
- [ ] API calls work (if applicable)
- [ ] Images load correctly
- [ ] CSS styling is applied
- [ ] No console errors in browser DevTools

## Next Steps

After successful deployment:
1. Set up a custom domain
2. Configure SSL/TLS (automatic with Vercel)
3. Set up analytics monitoring
4. Configure CI/CD for automatic deploys on push

## Support

For issues:
- Check [Vercel Documentation](https://vercel.com/docs)
- Review deployment logs in Vercel dashboard
- Add error tracking (Sentry, LogRocket, etc.)

---

**Last Updated**: April 10, 2026
**Version**: 1.0
