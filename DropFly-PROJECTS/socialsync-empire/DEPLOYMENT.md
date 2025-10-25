# SocialSync - Production Deployment Guide

## Prerequisites

1. **Supabase Account** - [supabase.com](https://supabase.com)
2. **Vercel Account** - [vercel.com](https://vercel.com)
3. **Stripe Account** - [stripe.com](https://stripe.com)
4. **OpenAI API Key** - [platform.openai.com](https://platform.openai.com)
5. **Ayrshare API Key** - [ayrshare.com](https://ayrshare.com)

## Step 1: Database Setup (Supabase)

### 1.1 Create Supabase Project
1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Enter project name: "socialsync-production"
4. Set a strong database password
5. Choose your region (closest to your users)
6. Wait for project creation (~2 minutes)

### 1.2 Apply Database Migration
1. In your Supabase project dashboard, go to "SQL Editor"
2. Click "New Query"
3. Copy the entire contents of `supabase/migrations/001_production_schema.sql`
4. Paste into the SQL editor
5. Click "Run" to execute the migration
6. Verify tables created: Go to "Table Editor" and check for:
   - users
   - content
   - posts
   - social_accounts
   - analytics
   - usage_tracking

### 1.3 Configure Authentication
1. Go to "Authentication" > "Providers"
2. Enable "Email" provider (already enabled by default)
3. Enable "Google" provider:
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create new project or select existing
   - Enable Google+ API
   - Go to "Credentials" > "Create Credentials" > "OAuth 2.0 Client ID"
   - Add authorized redirect URI: `https://<your-project-ref>.supabase.co/auth/v1/callback`
   - Copy Client ID and Client Secret
   - Paste into Supabase Google provider settings
4. Configure email templates (optional):
   - Go to "Authentication" > "Email Templates"
   - Customize signup confirmation, password reset templates

### 1.4 Get API Keys
1. Go to "Settings" > "API"
2. Copy these values:
   - **Project URL**: `https://<your-project-ref>.supabase.co`
   - **Project API Key (anon public)**: `eyJ...` (public key)
   - **Service Role Key**: `eyJ...` (secret, never expose)

## Step 2: Stripe Setup

### 2.1 Create Products and Prices
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Switch to Test mode (toggle in top right)
3. Go to "Products" > "Add Product"
4. Create 3 products:

**Starter Plan**
- Name: "SocialSync Starter"
- Pricing: $29/month (recurring)
- Copy the Price ID (starts with `price_`)

**Creator Plan**
- Name: "SocialSync Creator"
- Pricing: $79/month (recurring)
- Mark as "Popular"
- Copy the Price ID

**Agency Plan**
- Name: "SocialSync Agency"
- Pricing: $199/month (recurring)
- Copy the Price ID

### 2.2 Get API Keys
1. Go to "Developers" > "API Keys"
2. Copy:
   - **Publishable key**: `pk_test_...`
   - **Secret key**: `sk_test_...`

### 2.3 Setup Webhook
1. Go to "Developers" > "Webhooks"
2. Click "Add endpoint"
3. URL: `https://<your-vercel-domain>/api/stripe/webhook`
4. Select events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
5. Copy the **Webhook signing secret**: `whsec_...`

## Step 3: Environment Variables

Create a `.env.local` file in the project root:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...your-anon-key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Price IDs
STRIPE_PRICE_STARTER=price_...starter
STRIPE_PRICE_CREATOR=price_...creator
STRIPE_PRICE_AGENCY=price_...agency

# OpenAI
OPENAI_API_KEY=sk-...

# Ayrshare
AYRSHARE_API_KEY=your-ayrshare-key

# App URL (will change after deployment)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Step 4: Vercel Deployment

### 4.1 Prepare for Deployment
1. Make sure all code is committed:
```bash
git add .
git commit -m "🚀 Prepare for production deployment"
```

2. Push to GitHub:
```bash
git push origin main
```

### 4.2 Deploy to Vercel
1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Configure project:
   - Framework Preset: Next.js
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `.next`

### 4.3 Add Environment Variables
1. In Vercel project settings, go to "Environment Variables"
2. Add all variables from `.env.local` (except `NEXT_PUBLIC_APP_URL`)
3. For each variable:
   - Name: Variable name (e.g., `NEXT_PUBLIC_SUPABASE_URL`)
   - Value: The actual value
   - Environment: Production, Preview, Development (check all)

### 4.4 Deploy
1. Click "Deploy"
2. Wait for build to complete (~2-3 minutes)
3. Copy your production URL: `https://your-app.vercel.app`

### 4.5 Update Environment Variables
1. Go back to Vercel Environment Variables
2. Update `NEXT_PUBLIC_APP_URL` to your production URL
3. Redeploy: Deployments > Latest > "Redeploy"

## Step 5: Update Stripe Webhook

1. Go to Stripe Dashboard > Webhooks
2. Edit your webhook endpoint
3. Update URL to: `https://your-app.vercel.app/api/stripe/webhook`
4. Save

## Step 6: Verify Deployment

### 6.1 Test Authentication
1. Visit your production URL
2. Click "Get Started"
3. Sign up with email
4. Check Supabase Authentication > Users to see new user

### 6.2 Test AI Generation
1. Login to your account
2. Go to "Create"
3. Select a creator mode
4. Generate a script
5. Verify it appears in Supabase content table

### 6.3 Test Stripe Subscription
1. Go to "Pricing"
2. Select a plan
3. Use Stripe test card: `4242 4242 4242 4242`
4. Complete checkout
5. Verify subscription in Stripe Dashboard
6. Check user's subscription_tier updated in Supabase

### 6.4 Test Social Media Posting
1. Go to "Post"
2. Click "Schedule New Post"
3. Create a test post
4. Schedule for immediate posting
5. Check Ayrshare dashboard for posted content

## Step 7: Production Checklist

- [ ] Database migration applied successfully
- [ ] All environment variables configured
- [ ] Google OAuth working
- [ ] Stripe products created (3 tiers)
- [ ] Stripe webhook configured
- [ ] OpenAI API key valid
- [ ] Ayrshare API key valid
- [ ] App deployed to Vercel
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active (automatic with Vercel)
- [ ] All features tested in production

## Step 8: Switch to Production Mode

### Stripe
1. Go to Stripe Dashboard
2. Toggle from "Test mode" to "Live mode"
3. Recreate products and prices
4. Update environment variables with live keys
5. Redeploy Vercel

### Monitor
1. Set up Vercel Analytics
2. Monitor Supabase usage
3. Set up error tracking (Sentry recommended)
4. Monitor API usage and costs

## Troubleshooting

### Build Fails on Vercel
- Check build logs for specific errors
- Ensure all dependencies in package.json
- Verify TypeScript types are correct

### Authentication Not Working
- Verify Supabase URL and keys
- Check Google OAuth redirect URI
- Ensure middleware is configured correctly

### Stripe Webhook Fails
- Verify webhook secret matches
- Check endpoint URL is correct
- Look at Stripe webhook logs

### AI Generation Fails
- Verify OpenAI API key is valid
- Check API usage limits
- Monitor OpenAI API status

### Social Posting Fails
- Verify Ayrshare API key
- Check platform connection status
- Review Ayrshare logs

## Support

- **Supabase**: [supabase.com/docs](https://supabase.com/docs)
- **Vercel**: [vercel.com/docs](https://vercel.com/docs)
- **Stripe**: [stripe.com/docs](https://stripe.com/docs)
- **OpenAI**: [platform.openai.com/docs](https://platform.openai.com/docs)
- **Ayrshare**: [docs.ayrshare.com](https://docs.ayrshare.com)

## Estimated Costs (Monthly)

- **Vercel Pro**: $20/month (recommended for production)
- **Supabase Pro**: $25/month (8GB database, 50GB bandwidth)
- **OpenAI API**: ~$50-200/month (depends on usage)
- **Ayrshare**: $39-299/month (depends on plan)
- **Stripe**: 2.9% + $0.30 per transaction
- **Total**: ~$150-550/month + transaction fees
