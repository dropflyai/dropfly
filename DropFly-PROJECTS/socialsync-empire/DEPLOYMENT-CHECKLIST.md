# Deployment Checklist - SocialSync Empire

Complete guide for deploying SocialSync Empire to production with full automation.

## Table of Contents
1. [Pre-Deployment Setup](#pre-deployment-setup)
2. [Environment Variables](#environment-variables)
3. [Supabase Configuration](#supabase-configuration)
4. [Vercel Deployment](#vercel-deployment)
5. [Post-Deployment Verification](#post-deployment-verification)
6. [Monitoring Setup](#monitoring-setup)

---

## Pre-Deployment Setup

### 1. Local Testing Complete
- [ ] All features tested locally
- [ ] No console errors
- [ ] Build succeeds: `npm run build`
- [ ] Type check passes: `npm run type-check`
- [ ] Tests pass: `npm run test:e2e`

### 2. Code Quality
- [ ] Code reviewed
- [ ] No sensitive data in commits
- [ ] `.env.local` is in `.gitignore`
- [ ] All TODOs resolved or documented

### 3. Dependencies
- [ ] All packages up to date: `npm outdated`
- [ ] No critical vulnerabilities: `npm audit`
- [ ] Lock file committed: `package-lock.json`

---

## Environment Variables

### Required Variables (Production)

#### Database (Supabase)
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

#### AI Services
```bash
ANTHROPIC_API_KEY=sk-ant-your_production_key
OPENAI_API_KEY=sk-your_openai_key  # For transcription
```

#### Social Media
```bash
AYRSHARE_API_KEY=your_ayrshare_key
AYRSHARE_PROFILE_KEY=your_profile_key
```

#### Payments (Stripe)
```bash
STRIPE_SECRET_KEY=sk_live_your_live_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_live_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Product Price IDs (create in Stripe Dashboard)
STRIPE_STARTER_PRICE_ID=price_xxx_starter
STRIPE_PRO_PRICE_ID=price_xxx_pro
STRIPE_ENTERPRISE_PRICE_ID=price_xxx_enterprise
```

#### Application
```bash
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your_generated_secret  # Generate: openssl rand -base64 32
NODE_ENV=production
NEXT_PUBLIC_APP_VERSION=1.0.0
```

#### Optional Monitoring
```bash
SENTRY_DSN=https://your_sentry_dsn  # Error tracking
POSTHOG_API_KEY=your_posthog_key    # Analytics
```

### Setting Variables in Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Set environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add ANTHROPIC_API_KEY production
# ... repeat for all variables

# Or use Vercel Dashboard:
# Project Settings > Environment Variables
```

---

## Supabase Configuration

### 1. Create Supabase Project
1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Fill in:
   - Project name: `socialsync-empire-prod`
   - Database password: (generate strong password)
   - Region: (closest to your users)
4. Wait for project creation (2-3 minutes)

### 2. Database Schema
Run the following SQL in Supabase SQL Editor:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  token_balance INTEGER DEFAULT 0,
  tier TEXT DEFAULT 'free',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Token transactions table
CREATE TABLE IF NOT EXISTS token_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  type TEXT NOT NULL, -- 'purchase', 'consumption', 'refund'
  description TEXT,
  tool_used TEXT, -- 'caption', 'hashtag', 'hook', etc.
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trending topics table
CREATE TABLE IF NOT EXISTS trending_topics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  platform TEXT NOT NULL, -- 'youtube', 'tiktok', 'instagram'
  topic TEXT NOT NULL,
  search_volume INTEGER,
  engagement_score DECIMAL,
  keywords TEXT[],
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Error logs table
CREATE TABLE IF NOT EXISTS error_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  error_message TEXT NOT NULL,
  stack_trace TEXT,
  context JSONB,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  path TEXT,
  method TEXT,
  status_code INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scheduled posts table
CREATE TABLE IF NOT EXISTS scheduled_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  content TEXT NOT NULL,
  media_url TEXT,
  scheduled_time TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending', 'published', 'failed'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_token_transactions_user_id ON token_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_token_transactions_created_at ON token_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_trending_topics_platform ON trending_topics(platform);
CREATE INDEX IF NOT EXISTS idx_trending_topics_updated ON trending_topics(last_updated);
CREATE INDEX IF NOT EXISTS idx_error_logs_created_at ON error_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_user_id ON scheduled_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_scheduled_time ON scheduled_posts(scheduled_time);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 3. Storage Buckets
Create these buckets in Supabase Storage:

```sql
-- Run in SQL Editor
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('videos', 'videos', true),
  ('images', 'images', true),
  ('thumbnails', 'thumbnails', true),
  ('transcripts', 'transcripts', true);
```

### 4. Row Level Security (RLS) Policies

```sql
-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE trending_topics ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Token transactions policies
CREATE POLICY "Users can view own transactions"
  ON token_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert transactions"
  ON token_transactions FOR INSERT
  WITH CHECK (true);

-- Scheduled posts policies
CREATE POLICY "Users can view own posts"
  ON scheduled_posts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own posts"
  ON scheduled_posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own posts"
  ON scheduled_posts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own posts"
  ON scheduled_posts FOR DELETE
  USING (auth.uid() = user_id);

-- Trending topics policies (public read)
CREATE POLICY "Anyone can view trending topics"
  ON trending_topics FOR SELECT
  USING (true);

-- Storage policies
CREATE POLICY "Users can upload own files"
  ON storage.objects FOR INSERT
  WITH CHECK (auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Anyone can view public files"
  ON storage.objects FOR SELECT
  USING (bucket_id IN ('videos', 'images', 'thumbnails', 'transcripts'));

CREATE POLICY "Users can delete own files"
  ON storage.objects FOR DELETE
  USING (auth.uid()::text = (storage.foldername(name))[1]);
```

### 5. Supabase Configuration Checklist
- [ ] Project created
- [ ] Database schema executed
- [ ] Storage buckets created
- [ ] RLS policies enabled
- [ ] API keys copied to Vercel
- [ ] Email templates configured (Settings > Auth > Email Templates)
- [ ] Site URL set (Settings > Auth > Site URL): `https://yourdomain.com`
- [ ] Redirect URLs added (Settings > Auth > Redirect URLs): `https://yourdomain.com/**`

---

## Vercel Deployment

### 1. Connect Repository
1. Go to [https://vercel.com/new](https://vercel.com/new)
2. Import Git Repository
3. Select your GitHub/GitLab repo
4. Configure project:
   - Framework Preset: Next.js
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `.next`

### 2. Environment Variables
1. Go to Project Settings > Environment Variables
2. Add all variables from [Environment Variables](#environment-variables) section
3. Set for: Production, Preview, Development (as needed)

### 3. Cron Jobs Configuration
Create `vercel.json` in project root:

```json
{
  "crons": [
    {
      "path": "/api/cron/refresh-trends",
      "schedule": "0 */6 * * *"
    },
    {
      "path": "/api/cron/analytics-refresh",
      "schedule": "0 0 * * *"
    },
    {
      "path": "/api/cron/cleanup-errors",
      "schedule": "0 2 * * 0"
    }
  ]
}
```

### 4. Domain Configuration
1. Go to Project Settings > Domains
2. Add your custom domain
3. Update DNS records:
   - Type: CNAME
   - Name: @ (or www)
   - Value: cname.vercel-dns.com
4. Wait for SSL certificate (automatic, 2-3 minutes)

### 5. Deployment
```bash
# Deploy to production
vercel --prod

# Or push to main branch (auto-deploy)
git push origin main
```

### 6. Vercel Configuration Checklist
- [ ] Repository connected
- [ ] Environment variables set
- [ ] Cron jobs configured
- [ ] Domain added and verified
- [ ] SSL certificate active
- [ ] Build successful
- [ ] Deployment live

---

## Post-Deployment Verification

### 1. Health Check
```bash
curl https://yourdomain.com/api/health
```
Expected response:
```json
{
  "status": "healthy",
  "checks": {
    "database": { "status": "up", "latency": 45 },
    "storage": { "status": "up" }
  },
  "version": "1.0.0"
}
```

### 2. Authentication Flow
- [ ] Sign up new user
- [ ] Verify email received
- [ ] Log in successfully
- [ ] Password reset works
- [ ] Session persists after refresh

### 3. Token System
- [ ] Purchase tokens (test with Stripe test mode first)
- [ ] Verify tokens added to balance
- [ ] Use AI tool (verify token deduction)
- [ ] Check transaction history

### 4. AI Tools
- [ ] Generate caption
- [ ] Generate hashtags
- [ ] Generate hooks
- [ ] Create thumbnail
- [ ] Transcribe video
- [ ] Use calendar tool

### 5. Trending Topics
- [ ] View trending topics
- [ ] Verify topics refresh
- [ ] Check multiple platforms

### 6. Cron Jobs
- [ ] Check cron logs in Vercel dashboard
- [ ] Verify trending topics updated within 6 hours
- [ ] Check error logs table is not filling up

### 7. Performance
- [ ] Page load time < 3 seconds
- [ ] API response time < 500ms
- [ ] No console errors
- [ ] Mobile responsive
- [ ] Lighthouse score > 90

---

## Monitoring Setup

### 1. Vercel Analytics
1. Go to Project > Analytics
2. Enable Web Analytics
3. Monitor:
   - Page views
   - Response times
   - Error rates
   - Visitor locations

### 2. Supabase Monitoring
1. Go to Supabase Project > Reports
2. Monitor:
   - Database usage
   - API requests
   - Storage usage
   - Active connections

### 3. Custom Monitoring Dashboard
Create monitoring script:

```javascript
// monitoring/health-check.js
const CHECK_INTERVAL = 5 * 60 * 1000 // 5 minutes

async function checkHealth() {
  try {
    const response = await fetch('https://yourdomain.com/api/health')
    const data = await response.json()

    if (data.status !== 'healthy') {
      // Send alert (Slack, email, etc.)
      await sendAlert({
        severity: 'high',
        message: 'Health check failed',
        details: data
      })
    }

    // Log metrics
    console.log('Health check:', {
      status: data.status,
      dbLatency: data.checks.database.latency,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    await sendAlert({
      severity: 'critical',
      message: 'Health check endpoint unreachable',
      error: error.message
    })
  }
}

setInterval(checkHealth, CHECK_INTERVAL)
```

### 4. Error Tracking (Optional - Sentry)
1. Create Sentry project at [sentry.io](https://sentry.io)
2. Add DSN to environment variables
3. Install: `npm install @sentry/nextjs`
4. Configure `sentry.client.config.js` and `sentry.server.config.js`

### 5. Uptime Monitoring (Recommended)
Use one of these services:
- UptimeRobot (free tier: 50 monitors)
- Better Uptime
- Pingdom
- StatusCake

Monitor these endpoints:
- `https://yourdomain.com` (200)
- `https://yourdomain.com/api/health` (200)
- `https://yourdomain.com/api/trends/youtube` (200)

---

## Rollback Plan

### If Deployment Fails
1. Check build logs in Vercel
2. Verify environment variables
3. Test build locally: `npm run build`
4. Rollback to previous deployment:
   ```bash
   vercel rollback
   ```

### If Database Migration Fails
1. Restore from Supabase backup
2. Go to Database > Backups
3. Restore latest working backup
4. Re-run failed migrations

### Emergency Contacts
- Supabase Support: support@supabase.io
- Vercel Support: support@vercel.com
- Stripe Support: support@stripe.com

---

## Production Checklist Summary

### Before Launch
- [ ] All tests passing
- [ ] Environment variables set
- [ ] Supabase configured
- [ ] Stripe products created
- [ ] Domain configured
- [ ] SSL certificate active

### During Launch
- [ ] Deploy to production
- [ ] Run health check
- [ ] Test critical flows
- [ ] Verify cron jobs
- [ ] Monitor error logs

### After Launch
- [ ] Set up monitoring
- [ ] Enable alerts
- [ ] Document any issues
- [ ] Plan first maintenance window
- [ ] Celebrate launch! 🎉

---

## Cost Monitoring

### Monthly Cost Tracking
```
Service              | Expected | Actual | Status
---------------------|----------|--------|--------
Supabase Pro         | $25      | $__    | ✅
Anthropic API        | $60      | $__    | ✅
OpenAI API           | $20      | $__    | ✅
Ayrshare             | $50      | $__    | ✅
Vercel Pro           | $20      | $__    | ✅
---------------------|----------|--------|--------
TOTAL                | $175     | $__    |
```

### Usage Alerts
Set up billing alerts:
- Supabase: Settings > Billing > Set spending cap
- Anthropic: Console > Billing > Set monthly limit
- Vercel: Project Settings > Billing > Set budget alert

---

## Support & Maintenance

### Regular Maintenance Tasks
- [ ] Weekly: Review error logs
- [ ] Weekly: Check system health
- [ ] Monthly: Update dependencies
- [ ] Monthly: Review costs
- [ ] Quarterly: Performance audit
- [ ] Quarterly: Security review

### Backup Schedule
- Database: Daily automatic (Supabase)
- Storage: Weekly manual export
- Environment config: After each change

### Documentation
Keep these updated:
- [ ] API documentation
- [ ] User guides
- [ ] Troubleshooting guides
- [ ] Changelog

---

## Success Metrics

Track these KPIs:
- Uptime: Target > 99.5%
- Response time: Target < 500ms
- Error rate: Target < 0.1%
- User satisfaction: Target > 4.5/5
- Token usage: Monitor daily active users

---

## Deployment Complete!

Your SocialSync Empire is now live at: `https://yourdomain.com`

Next steps:
1. Monitor health dashboard
2. Test all features in production
3. Onboard first users
4. Gather feedback
5. Iterate and improve

For issues, see [TESTING-GUIDE.md](./TESTING-GUIDE.md) troubleshooting section.
