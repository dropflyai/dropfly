# Testing Guide - SocialSync Empire

Complete manual and automated testing instructions for all automation phases.

## Table of Contents
1. [Manual Testing Checklist](#manual-testing-checklist)
2. [Automated Testing](#automated-testing)
3. [Testing Cron Jobs Locally](#testing-cron-jobs-locally)
4. [Production Smoke Tests](#production-smoke-tests)
5. [Performance Testing](#performance-testing)

---

## Manual Testing Checklist

### Phase 1: Token System & Analytics
- [ ] **Token Purchase Flow**
  - [ ] Purchase 100 tokens (Starter tier)
  - [ ] Purchase 500 tokens (Pro tier)
  - [ ] Purchase 1000 tokens (Enterprise tier)
  - [ ] Verify Stripe payment completion
  - [ ] Check tokens added to user balance

- [ ] **Token Consumption**
  - [ ] Generate AI caption (verify -10 tokens)
  - [ ] Generate hashtags (verify -5 tokens)
  - [ ] Generate hooks (verify -8 tokens)
  - [ ] Create thumbnail (verify -15 tokens)
  - [ ] Transcribe video (verify -20 tokens)
  - [ ] Use calendar tool (verify -3 tokens)

- [ ] **Token Analytics**
  - [ ] View usage dashboard
  - [ ] Check transaction history
  - [ ] Verify usage graphs display correctly
  - [ ] Export usage report

### Phase 2: Trending Topics Integration
- [ ] **Topic Discovery**
  - [ ] Navigate to /trends
  - [ ] View trending topics for YouTube
  - [ ] View trending topics for TikTok
  - [ ] View trending topics for Instagram
  - [ ] Check topic refresh works

- [ ] **Content Generation with Trends**
  - [ ] Generate caption using trending topic
  - [ ] Generate hashtags from trending topic
  - [ ] Create post with trending keywords
  - [ ] Verify content relevance

- [ ] **Cron Job Monitoring**
  - [ ] Check last update timestamp
  - [ ] Verify topics refresh every 6 hours
  - [ ] Check topic diversity (10+ topics per platform)

### Phase 3: AI Tools Frontend
- [ ] **Caption Generator**
  - [ ] Enter topic and platform
  - [ ] Generate caption
  - [ ] Copy to clipboard
  - [ ] Save as draft
  - [ ] Verify token deduction

- [ ] **Hashtag Generator**
  - [ ] Enter content description
  - [ ] Select platform
  - [ ] Generate hashtags (20-30 tags)
  - [ ] Copy individual tags
  - [ ] Copy all tags

- [ ] **Hook Generator**
  - [ ] Enter content topic
  - [ ] Generate 5 hook variations
  - [ ] Copy preferred hook
  - [ ] Regenerate if needed

- [ ] **Thumbnail Generator**
  - [ ] Upload image or enter prompt
  - [ ] Generate thumbnail
  - [ ] Download result
  - [ ] Check quality and dimensions

- [ ] **Video Transcription**
  - [ ] Upload video file
  - [ ] Start transcription
  - [ ] View timestamped segments
  - [ ] Download as TXT
  - [ ] Download as SRT
  - [ ] Copy to clipboard

- [ ] **Calendar Tool**
  - [ ] View content calendar
  - [ ] Schedule post for specific date/time
  - [ ] Edit scheduled post
  - [ ] Delete scheduled post
  - [ ] Check timezone handling

### Phase 4: Error Handling & Monitoring
- [ ] **Health Check**
  - [ ] Access `/api/health`
  - [ ] Verify 200 OK response
  - [ ] Check database status: "up"
  - [ ] Check storage status: "up"
  - [ ] Verify latency metrics

- [ ] **Error Logging**
  - [ ] Trigger an error (invalid API call)
  - [ ] Check console logs
  - [ ] Verify error in database
  - [ ] Check error stats endpoint

---

## Automated Testing

### Setup Playwright Tests
```bash
# Install dependencies
npm install -D @playwright/test

# Run all tests
npm run test:e2e

# Run specific test file
npx playwright test tests/ai-tools-caption.spec.ts

# Run with UI mode
npx playwright test --ui

# Debug mode
npx playwright test --debug
```

### Existing Test Coverage
- ✅ AI Caption Generator (`tests/ai-tools-caption.spec.ts`)
- ✅ AI Hashtag Generator (`tests/ai-tools-hashtag.spec.ts`)
- ✅ AI Hook Generator (`tests/ai-tools-hook.spec.ts`)
- ✅ AI Thumbnail Generator (`tests/ai-tools-thumbnail.spec.ts`)
- ✅ AI Transcription Tool (`tests/ai-tools-transcribe.spec.ts`)
- ✅ AI Calendar Tool (`tests/ai-tools-calendar.spec.ts`)

### Running Token Tests
```bash
# Test token operations
npx tsx test-token-operations.ts

# Expected output:
# ✅ Token purchase successful
# ✅ Token consumption tracked
# ✅ Balance updated correctly
# ✅ Transaction logged
```

### CI/CD Integration
Add to `.github/workflows/test.yml`:
```yaml
name: E2E Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
```

---

## Testing Cron Jobs Locally

### Method 1: Direct API Call
```bash
# Trigger trending topics refresh
curl -X GET http://localhost:3000/api/cron/refresh-trends

# Trigger token analytics update
curl -X GET http://localhost:3000/api/cron/analytics-refresh

# Trigger error log cleanup
curl -X GET http://localhost:3000/api/cron/cleanup-errors
```

### Method 2: Vercel Cron Testing
```bash
# Install Vercel CLI
npm i -g vercel

# Test cron job locally
vercel dev

# In another terminal
curl http://localhost:3000/api/cron/refresh-trends
```

### Method 3: Schedule Override
Temporarily change cron schedule in `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/cron/refresh-trends",
    "schedule": "*/5 * * * *"  // Every 5 minutes for testing
  }]
}
```

### Verification Checklist
- [ ] Check cron job logs in Vercel dashboard
- [ ] Verify database updates after cron run
- [ ] Check error logs for failures
- [ ] Monitor execution time
- [ ] Verify no duplicate executions

---

## Production Smoke Tests

### Post-Deployment Checklist
Run these tests immediately after deploying to production:

#### 1. Health Check
```bash
curl https://yourdomain.com/api/health
# Expected: {"status":"healthy","checks":{...}}
```

#### 2. Authentication
- [ ] Sign up new user
- [ ] Log in existing user
- [ ] Password reset flow
- [ ] Session persistence

#### 3. Core Features
- [ ] Purchase tokens
- [ ] Generate AI content (1 of each tool)
- [ ] View trending topics
- [ ] Schedule a post
- [ ] Check token balance updates

#### 4. Cron Jobs
- [ ] Check last trending topics update (should be < 6 hours)
- [ ] Verify analytics dashboard shows recent data
- [ ] Check error logs are not accumulating

#### 5. Performance
- [ ] Page load time < 3 seconds
- [ ] AI generation < 10 seconds
- [ ] API response time < 500ms
- [ ] No console errors

### Monitoring Setup
Add to production monitoring:
```javascript
// Health check every 5 minutes
setInterval(async () => {
  const response = await fetch('https://yourdomain.com/api/health')
  const data = await response.json()

  if (data.status !== 'healthy') {
    // Alert team (Slack, email, etc.)
    console.error('Health check failed:', data)
  }
}, 5 * 60 * 1000)
```

---

## Performance Testing

### Load Testing with k6
```javascript
// load-test.js
import http from 'k6/http'
import { check, sleep } from 'k6'

export const options = {
  vus: 10, // 10 virtual users
  duration: '30s',
}

export default function () {
  const res = http.get('https://yourdomain.com/api/health')
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  })
  sleep(1)
}
```

Run: `k6 run load-test.js`

### Database Query Performance
```sql
-- Check slow queries
SELECT
  query,
  calls,
  total_time / calls as avg_time_ms,
  min_time,
  max_time
FROM pg_stat_statements
WHERE total_time / calls > 100
ORDER BY avg_time_ms DESC
LIMIT 20;
```

### Frontend Performance
- Use Lighthouse CI for automated testing
- Target scores: Performance > 90, Accessibility > 95
- Monitor Core Web Vitals (LCP, FID, CLS)

---

## Troubleshooting Common Issues

### Tests Failing Locally
1. Check environment variables (`.env.local`)
2. Ensure Supabase is running
3. Clear browser cache: `npx playwright test --clear-cache`
4. Check Node version: `node -v` (should be 18+)

### Cron Jobs Not Running
1. Verify `vercel.json` configuration
2. Check Vercel project settings > Cron Jobs
3. Review execution logs in Vercel dashboard
4. Ensure production deployment is active

### Token Deduction Not Working
1. Check database connection
2. Verify token balance before/after operation
3. Review transaction logs in `token_transactions` table
4. Check for error logs in `error_logs` table

### AI Tools Timeout
1. Increase timeout in API routes (default 60s)
2. Check OpenAI/Anthropic API status
3. Verify API keys are valid
4. Monitor rate limits

---

## Test Data Cleanup

### Clear Test Data
```sql
-- Delete test users (replace with actual test user IDs)
DELETE FROM profiles WHERE email LIKE '%test%';

-- Clear test transactions
DELETE FROM token_transactions WHERE created_at < NOW() - INTERVAL '7 days';

-- Clear old error logs
DELETE FROM error_logs WHERE created_at < NOW() - INTERVAL '30 days';
```

### Reset Token Balance (Development Only)
```sql
-- Give test user 1000 tokens
UPDATE profiles
SET token_balance = 1000
WHERE email = 'test@example.com';
```

---

## Reporting Issues

When reporting bugs, include:
1. Steps to reproduce
2. Expected vs actual behavior
3. Browser/device information
4. Screenshots or screen recordings
5. Console logs (if applicable)
6. User ID or email (for token/auth issues)

Create issues in GitHub with label: `bug`, `testing`, or `cron-job`
