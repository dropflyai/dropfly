# 🔖 CHECKPOINT - Token System Implementation

**Date:** 2025-10-27
**Status:** Analysis complete, ready to implement fixes
**Priority:** HIGH - Currently bleeding money on some operations

---

## ✅ COMPLETED

1. **Deep-dive cost analysis** - See `COST-ANALYSIS.md`
2. **API pricing research** - Verified FAL.AI, OpenAI, Ayrshare costs
3. **Free tier burn calculation** - $0.71-$0.90/month (well under $4 target) ✅
4. **Profit margin audit** - Found 3 critical issues

---

## 🚨 ISSUES FOUND

### 1. AI Script Generation - NOT USING TOKENS
- **File:** `src/app/api/ai/generate-script/route.ts` (lines 22-58)
- **Problem:** Uses old subscription limits, doesn't deduct tokens
- **Cost to us:** $0.02 per script (OpenAI GPT-4o)
- **Should charge:** 7 tokens ($0.07 for 70% margin)
- **Current:** FREE = money bleed 💸

### 2. Image Generation - LOSING MONEY
- **File:** `src/app/api/image/generate/route.ts` (lines 22-45)
- **Problem:** Only charges 1 token ($0.01)
- **Cost to us:** ~$0.015 per image
- **Should charge:** 5 tokens ($0.05 for 70% margin)
- **Current:** Losing $0.005 per image ❌

### 3. Social Media Posting - NOT USING TOKENS
- **File:** `src/app/api/social/post/route.ts` (lines 24-51)
- **Problem:** No token check at all
- **Should charge:** 2-5 tokens (for fair usage & tier differentiation)
- **Current:** FREE = potential abuse

---

## 📋 NEXT STEPS (In Order)

### Step 1: Update Token Config
**File:** `src/lib/tokens/token-config.ts`

```typescript
// LINE 44-48: Update script_generation
{
  operation: 'script_generation',
  baseTokens: 7, // CHANGE FROM 10 → 7
  description: 'AI script generation with GPT-4o',
},

// ADD NEW ENTRY after line 48:
{
  operation: 'image_generation',
  baseTokens: 5,
  description: 'AI image generation (per image)',
},
```

### Step 2: Fix AI Script Generation API
**File:** `src/app/api/ai/generate-script/route.ts`

Add token deduction logic similar to video generation:
1. Import `tokenService` at top
2. Calculate cost: `tokenService.calculateCost('script_generation')`
3. Deduct tokens BEFORE calling OpenAI (line ~60)
4. Refund tokens if OpenAI call fails

**Pattern to follow:** See `src/app/api/video/generate/route.ts:39-119`

### Step 3: Fix Image Generation API
**File:** `src/app/api/image/generate/route.ts`

Update line 23 and add refund mechanism:
```typescript
// LINE 23: Change from 1 to 5
const tokensNeeded = numImages * 5; // CHANGE FROM: numImages

// ADD REFUND on failure (after line 35-38)
if (!result.success && deductionResult.transaction) {
  await tokenService.refundTokens(
    user.id,
    deductionResult.transaction.id,
    `Image generation failed: ${result.error}`
  );
}
```

### Step 4: Fix Social Media Posting API
**File:** `src/app/api/social/post/route.ts`

Add token check before posting:
```typescript
// ADD after line 22 (before ayrshare call)
import { tokenService } from '@/lib/tokens/token-service';

// Determine token cost
const operation = platforms.length > 1
  ? 'social_post_multi_platform'
  : 'social_post';
const tokenCost = tokenService.calculateCost(operation);

// Deduct tokens
const deductionResult = await tokenService.deductTokens({
  userId: user.id,
  operation,
  cost: tokenCost,
  description: `Social post to ${platforms.join(', ')}`,
  metadata: { platforms, content: content.substring(0, 100) },
});

if (!deductionResult.success) {
  return NextResponse.json(
    { error: deductionResult.error, errorCode: deductionResult.errorCode },
    { status: 403 }
  );
}
```

### Step 5: Test Everything
1. Test AI script generation with insufficient tokens
2. Test image generation with new pricing
3. Test social posting with token gates
4. Verify refunds work on failures
5. Check free tier stays under $4/month burn

---

## 📊 EXPECTED RESULTS AFTER FIXES

| Operation | Cost to Us | Tokens Charged | $ Charged | Margin |
|-----------|------------|----------------|-----------|---------|
| Budget video (5s) | $0.10 | 33 | $0.33 | 70% ✅ |
| AI script | $0.02 | 7 | $0.07 | 71% ✅ |
| Image | $0.015 | 5 | $0.05 | 70% ✅ |
| Social post | $0 | 2 | $0.02 | 100% ✅ |

**Free tier burn:** $0.71-$0.90/month (well under $4 target) ✅

---

## 🎯 VALIDATION CHECKLIST

After implementing fixes, verify:

- [ ] Script generation deducts 7 tokens
- [ ] Script generation refunds on OpenAI failure
- [ ] Image generation deducts 5 tokens per image
- [ ] Image generation refunds on failure
- [ ] Social posting deducts 2 or 5 tokens
- [ ] All operations return proper error when insufficient tokens
- [ ] Token transactions logged correctly in database
- [ ] Free tier can generate ~5-9 videos + scripts + images
- [ ] Daily limits still enforced
- [ ] All profit margins at 70%+

---

## 📂 FILES TO MODIFY

1. `src/lib/tokens/token-config.ts` (update costs)
2. `src/app/api/ai/generate-script/route.ts` (add tokens)
3. `src/app/api/image/generate/route.ts` (fix pricing + refund)
4. `src/app/api/social/post/route.ts` (add tokens)

---

## 📚 REFERENCE DOCUMENTS

- **Full cost analysis:** `COST-ANALYSIS.md`
- **Token service:** `src/lib/tokens/token-service.ts`
- **Working example:** `src/app/api/video/generate/route.ts`
- **Token config:** `src/lib/tokens/token-config.ts`

---

## 💡 NOTES

- Video generation already has perfect 70% margin implementation
- Use it as the pattern for other APIs
- Formula: `(Cost × 100) × 3.33 = Tokens charged`
- 1 token = $0.01 to user
- Always deduct tokens BEFORE calling external APIs
- Always refund on failure
- Log all transactions for audit trail

---

**Resume here:** Start with Step 1 (Update Token Config) and work through all 5 steps in order.
