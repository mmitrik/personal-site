# Vercel Deployment Guide

## Pre-Deployment Checklist

### Environment Variables (CRITICAL STEP)
Add these to Vercel Dashboard → Project Settings → Environment Variables:

**Set each variable individually:**
1. `NEXT_PUBLIC_SUPABASE_URL` = `https://vtjhoyuwvqjblxnnbboh.supabase.co`
2. `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `[copy from your .env.local file]`
3. `SUPABASE_SERVICE_ROLE_KEY` = `[copy from your .env.local file]`

**Important:** Set all variables for "Production", "Preview", and "Development" environments.

### Supabase Configuration
1. Go to Supabase Dashboard → Settings → Authentication
2. Update Site URL to your Vercel domain
3. Add redirect URLs for your domain

### Domain Configuration
After deployment, update these files:
1. Replace `NEXT_PUBLIC_SITE_URL` in environment variables
2. Update Supabase authentication settings

## Deployment Commands

```bash
# Install Vercel CLI (if not already installed)
npm i -g vercel

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

## Post-Deployment Testing

1. Test authentication (sign up/sign in)
2. Test post creation
3. Test post editing/deletion
4. Verify environment variables are working
5. Check browser console for errors

## Troubleshooting

### Common Issues:
- **Authentication fails**: Check Supabase Site URL and Redirect URLs
- **Environment variables not working**: Ensure they're set in Vercel Dashboard
- **API routes fail**: Check that lib/ imports are working correctly
- **Database connection fails**: Verify Supabase URL and keys

### Debug Steps:
1. Check Vercel function logs
2. Verify environment variables in Vercel Dashboard
3. Test API endpoints directly
4. Check browser network tab for failed requests