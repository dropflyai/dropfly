# Token Operations Testing Guide

**Status**: Step 5 of Token System Implementation
**Purpose**: Validate all token deductions, refunds, and error handling
**Completion Date**: 2025-10-27

---

## 🎯 Testing Overview

This guide walks through testing all 4 token-gated operations:
1. **AI Script Generation** - 7 tokens (was FREE, now fixed)
2. **Image Generation** - 5 tokens per image (was 1 token, now fixed)
3. **Social Media Posting** - 2 tokens (single) or 5 tokens (multi-platform)
4. **Video Generation** - Variable tokens based on engine/duration (already working)

---

## 📋 Pre-Test Checklist

- [ ] Dev server running on http://localhost:3001
- [ ] Supabase local instance running (or connected to cloud)
- [ ] Test account created with known email
- [ ] Browser DevTools open (F12)
- [ ] Initial token balance noted

---

## 🧪 Test Suite

### Test 1: AI Script Generation (7 tokens)

**Setup:**
1. Sign in to http://localhost:3001
2. Navigate to AI Script Generator page
3. Note current token balance

**Test 1A: Successful Generation**
- [ ] Enter topic: "How to make viral TikTok videos"
- [ ] Select creator mode: UGC
- [ ] Select platform: TikTok
- [ ] Click "Generate Script"
- [ ] **Expected**: Token balance decreases by 7 tokens
- [ ] **Expected**: Script generates successfully
- [ ] **Expected**: Response shows `tokensUsed: 7` and `newBalance`

**Test 1B: Insufficient Tokens**
- [ ] Manually set token balance to 5 (via Supabase SQL or admin panel)
- [ ] Try to generate script (requires 7 tokens)
- [ ] **Expected**: Error message: "Not enough tokens. Required: 7, Available: 5"
- [ ] **Expected**: No tokens deducted
- [ ] **Expected**: No OpenAI API call made

**Test 1C: OpenAI Failure (Refund Test)**
- [ ] Temporarily set invalid OpenAI API key in `.env.local`
- [ ] Try to generate script
- [ ] **Expected**: Tokens deducted initially
- [ ] **Expected**: Error message displayed
- [ ] **Expected**: Tokens REFUNDED after failure
- [ ] **Expected**: Token transaction shows "refunded" status
- [ ] [ ] Restore valid OpenAI API key

---

### Test 2: Image Generation (5 tokens per image)

**Setup:**
1. Navigate to Image Generator page
2. Note current token balance

**Test 2A: Single Image Generation**
- [ ] Enter prompt: "A futuristic city at sunset"
- [ ] Set numImages: 1
- [ ] Click "Generate Image"
- [ ] **Expected**: Token balance decreases by 5 tokens
- [ ] **Expected**: Image generates successfully
- [ ] **Expected**: Response shows `tokensUsed: 5` and `newBalance`

**Test 2B: Multiple Image Generation**
- [ ] Enter prompt: "Abstract art"
- [ ] Set numImages: 3
- [ ] Click "Generate Images"
- [ ] **Expected**: Token balance decreases by 15 tokens (5 × 3)
- [ ] **Expected**: 3 images generate successfully
- [ ] **Expected**: Response shows `tokensUsed: 15`

**Test 2C: Insufficient Tokens**
- [ ] Manually set token balance to 3
- [ ] Try to generate 1 image (requires 5 tokens)
- [ ] **Expected**: Error message: "Not enough tokens. Required: 5, Available: 3"
- [ ] **Expected**: No tokens deducted
- [ ] **Expected**: No FAL.AI API call made

**Test 2D: FAL.AI Failure (Refund Test)**
- [ ] Temporarily set invalid FAL.AI API key in `.env.local`
- [ ] Try to generate image
- [ ] **Expected**: Tokens deducted initially
- [ ] **Expected**: Error message displayed
- [ ] **Expected**: Tokens REFUNDED after failure
- [ ] **Expected**: Response shows `tokensRefunded: 5`
- [ ] [ ] Restore valid FAL.AI API key

---

### Test 3: Social Media Posting (2 or 5 tokens)

**Setup:**
1. Navigate to Social Media Posting page
2. Note current token balance

**Test 3A: Single Platform Post (2 tokens)**
- [ ] Enter content: "Test post from SocialSync Empire"
- [ ] Select platform: Twitter (single)
- [ ] Click "Post"
- [ ] **Expected**: Token balance decreases by 2 tokens
- [ ] **Expected**: Post submitted successfully
- [ ] **Expected**: Response shows `tokensUsed: 2` and `newBalance`

**Test 3B: Multi-Platform Post (5 tokens)**
- [ ] Enter content: "Another test post"
- [ ] Select platforms: Twitter + Instagram + Facebook (multiple)
- [ ] Click "Post"
- [ ] **Expected**: Token balance decreases by 5 tokens
- [ ] **Expected**: Post submitted to all platforms
- [ ] **Expected**: Response shows `tokensUsed: 5`

**Test 3C: Insufficient Tokens (Single)**
- [ ] Manually set token balance to 1
- [ ] Try to post to single platform (requires 2 tokens)
- [ ] **Expected**: Error message: "Not enough tokens. Required: 2, Available: 1"
- [ ] **Expected**: No tokens deducted
- [ ] **Expected**: No Ayrshare API call made

**Test 3D: Insufficient Tokens (Multi)**
- [ ] Manually set token balance to 3
- [ ] Try to post to multiple platforms (requires 5 tokens)
- [ ] **Expected**: Error message: "Not enough tokens. Required: 5, Available: 3"
- [ ] **Expected**: No tokens deducted

**Note**: Social posting does NOT refund on failure because Ayrshare API succeeds/fails immediately (not async like AI generation).

---

### Test 4: Daily Limits

**Setup:**
1. Check current subscription tier and daily limit
2. Note current daily usage

**Test 4A: Within Daily Limit**
- [ ] Perform any token operation within daily limit
- [ ] **Expected**: Operation succeeds
- [ ] **Expected**: Daily usage increments correctly

**Test 4B: Exceeding Daily Limit**
- [ ] Manually set daily usage to match daily limit (via SQL)
- [ ] Try any token operation
- [ ] **Expected**: Error message: "Daily token limit exceeded"
- [ ] **Expected**: No tokens deducted
- [ ] **Expected**: Operation blocked

---

### Test 5: Token Transaction Logging

**Setup:**
1. Open Supabase dashboard
2. Navigate to `token_transactions` table

**Validation:**
- [ ] All token deductions logged with correct:
  - `user_id`
  - `operation` (script_generation, image_generation, social_post, etc.)
  - `amount` (negative for deductions)
  - `description`
  - `metadata` (JSON with operation details)
  - `created_at`
- [ ] Refunds logged with:
  - `transaction_type: 'refund'`
  - `refunded_transaction_id` (references original transaction)
  - `reason` (error message)
- [ ] Balance calculations are correct

---

### Test 6: Free Tier Economics

**Setup:**
1. Create new free tier account (300 tokens/month)
2. Note starting balance: 300 tokens

**Validation:**
- [ ] Generate 5 scripts (7 × 5 = 35 tokens)
- [ ] Generate 10 images (5 × 10 = 50 tokens)
- [ ] Post 5 times single platform (2 × 5 = 10 tokens)
- [ ] Generate 2 budget videos (Hailuo, ~30 tokens each = 60 tokens)
- [ ] **Total used**: ~155 tokens
- [ ] **Remaining**: ~145 tokens
- [ ] **Actual cost to us**: $0.50-$0.70 (under $4 target ✅)

**Free Tier Burn Calculation:**
```
300 tokens = $3.00 retail value
Actual burn (worst case):
- 5 scripts × $0.02 = $0.10
- 10 images × $0.015 = $0.15
- 5 posts × $0 (subscription) = $0
- 2 videos × $0.28 = $0.56
Total burn: $0.81 per user/month ✅ (under $4 target)
```

---

## 🔍 Browser Console Testing Commands

For authenticated testing, use these commands in browser DevTools console:

### Test Script Generation:
```javascript
fetch('/api/ai/generate-script', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    topic: 'Test topic',
    creatorMode: 'ugc',
    platform: 'TikTok',
    duration: '30 seconds'
  })
}).then(r => r.json()).then(console.log).catch(console.error);
```

### Test Image Generation:
```javascript
fetch('/api/image/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prompt: 'A beautiful sunset',
    model: 'flux-dev',
    numImages: 1
  })
}).then(r => r.json()).then(console.log).catch(console.error);
```

### Test Social Posting (Single):
```javascript
fetch('/api/social/post', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    content: 'Test post',
    platforms: ['twitter'],
    mediaUrls: []
  })
}).then(r => r.json()).then(console.log).catch(console.error);
```

### Test Social Posting (Multi):
```javascript
fetch('/api/social/post', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    content: 'Test post',
    platforms: ['twitter', 'instagram'],
    mediaUrls: []
  })
}).then(r => r.json()).then(console.log).catch(console.error);
```

---

## 📊 Expected Results Summary

| Operation | Token Cost | API Cost | Margin | Refund on Fail? |
|-----------|-----------|----------|---------|-----------------|
| AI Script Generation | 7 tokens | $0.02 | 71% ✅ | YES |
| Image Generation (1x) | 5 tokens | $0.015 | 70% ✅ | YES |
| Social Post (single) | 2 tokens | $0 (subscription) | 100% ✅ | NO |
| Social Post (multi) | 5 tokens | $0 (subscription) | 100% ✅ | NO |
| Video Generation | Variable | Variable | 70% ✅ | YES |

---

## ✅ Validation Checklist

**Token Deduction:**
- [ ] All operations deduct tokens BEFORE API calls
- [ ] Insufficient tokens block operations
- [ ] Daily limits are enforced
- [ ] Token balance updates correctly
- [ ] Transactions are logged

**Error Handling:**
- [ ] Clear error messages for insufficient tokens
- [ ] Daily limit errors are descriptive
- [ ] API failures are caught and handled
- [ ] Network errors don't deduct tokens

**Refund Mechanism:**
- [ ] Script generation refunds on OpenAI failure
- [ ] Image generation refunds on FAL.AI failure
- [ ] Refunds are logged in transactions table
- [ ] Balance is restored correctly

**Profit Margins:**
- [ ] All operations maintain 70%+ margin
- [ ] Free tier burn stays under $4/month
- [ ] Token costs match actual API costs × 3.33

**User Experience:**
- [ ] Token costs displayed before operations
- [ ] Balance updates in real-time
- [ ] Error messages are user-friendly
- [ ] Refunds happen automatically

---

## 🐛 Known Issues / Edge Cases

1. **Social posting doesn't refund** - This is intentional because Ayrshare succeeds/fails immediately
2. **Daily limits reset at midnight UTC** - Ensure timezone handling is correct
3. **Token balance can go negative if concurrent requests** - Consider adding database locking
4. **Refunds don't restore daily usage** - Feature or bug? Decide.

---

## 📝 SQL Queries for Testing

### Check Token Balance:
```sql
SELECT balance, daily_limit, daily_used, daily_reset_at
FROM user_tokens
WHERE user_id = 'your-user-id';
```

### View Recent Transactions:
```sql
SELECT *
FROM token_transactions
WHERE user_id = 'your-user-id'
ORDER BY created_at DESC
LIMIT 20;
```

### Manually Set Balance (for testing):
```sql
UPDATE user_tokens
SET balance = 5
WHERE user_id = 'your-user-id';
```

### Manually Set Daily Usage (for testing):
```sql
UPDATE user_tokens
SET daily_used = daily_limit
WHERE user_id = 'your-user-id';
```

### View All Refunds:
```sql
SELECT *
FROM token_transactions
WHERE transaction_type = 'refund'
ORDER BY created_at DESC;
```

---

## ✅ When Testing is Complete

After all tests pass:
1. Mark Step 5 as completed in todo list
2. Commit all changes to git
3. Deploy to Vercel staging
4. Run smoke tests in production
5. Monitor for 24-48 hours
6. Celebrate 🎉

**Files Modified:**
- `src/lib/tokens/token-config.ts` ✅
- `src/app/api/ai/generate-script/route.ts` ✅
- `src/app/api/image/generate/route.ts` ✅
- `src/app/api/social/post/route.ts` ✅

**Status**: Ready for testing ✅
