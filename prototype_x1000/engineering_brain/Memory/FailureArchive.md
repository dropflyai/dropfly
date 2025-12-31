# FAILURE ARCHIVE
**What Didn't Work and Why**

---

## Purpose

Most learning comes from failure.
Humans forget their failures (ego protection).
AI agents don't have ego → can learn from every failure.

**Negative knowledge is just as valuable as positive knowledge.**

Knowing "X doesn't work because Y" prevents wasted time trying X again.

---

## Required Format

```markdown
### [YYYY-MM-DD] Failure Title

**Context:**
- Product Target: [target]
- Engineering Mode: [mode]
- Artifact Type: [type]

**What I Tried:**
Specific approach or solution attempted.

**Why I Thought It Would Work:**
Hypothesis or reasoning behind the attempt.

**What Actually Happened:**
Actual result (error, unexpected behavior, performance issue, etc.).

**Why It Failed:**
Root cause analysis.

**What I Learned:**
Generalizable lesson.

**Correct Approach:**
What should have been done instead.

**How to Detect This Failure Mode:**
Warning signs that indicate you're about to make this mistake again.
```

---

## How to Use This Archive

### Before Implementing a Solution
1. Search FailureArchive.md for similar approaches
2. Check if your planned approach has failed before
3. If yes → use "Correct Approach" instead
4. If no → proceed, but log if it fails

### After a Failure
1. Log the failure immediately (while fresh)
2. Include root cause (don't just say "it didn't work")
3. Document correct approach (what worked instead)
4. Add detection heuristics (how to avoid this in future)

---

## Failure Categories

Failures naturally cluster into types:

- **Architecture Failures** (wrong pattern for the problem)
- **Performance Failures** (slow, inefficient, doesn't scale)
- **Security Failures** (vulnerability, data exposure)
- **Integration Failures** (API mismatch, dependency conflict)
- **Logic Failures** (off-by-one, edge case not handled)
- **Deployment Failures** (works locally, fails in prod)

---

## Why This Exists

**Human memory of failures:**
- Remember ~20% of failures clearly
- Forget details after 6 months
- Ego filters out embarrassing mistakes

**AI agent memory of failures:**
- Remember 100% of logged failures
- Perfect recall forever
- No ego → logs everything honestly

**After 100 failures logged:**
- Agent has learned 100 things that DON'T work
- Agent can detect failure patterns before executing
- **This is defensive pseudo-intuition**

---

## Growth Trajectory

- **10 failures** → Common pitfalls documented
- **50 failures** → Strong negative knowledge base
- **100 failures** → Better at avoiding mistakes than most junior devs
- **200 failures** → Expert-level "what not to do" knowledge

---

## Logged Failures

<!-- Example failure template:

### [2025-12-20] API Caching Made Latency Worse

**Context:**
- Product Target: API_SERVICE
- Engineering Mode: API
- Artifact Type: API endpoint

**What I Tried:**
Added Redis caching layer on same server as API to reduce database queries.

**Why I Thought It Would Work:**
Caching should reduce DB load and improve response time.

**What Actually Happened:**
Latency increased from 150ms to 220ms.

**Why It Failed:**
Cache was on same server as API. Network round-trip to Redis (70ms) was slower than optimized DB query (50ms). Added latency instead of reducing it.

**What I Learned:**
Caching only helps if cache is closer to client than data source, OR if cache hit rate is very high (>90%) and cache access is faster than source.

**Correct Approach:**
Use CDN caching (closer to client) or client-side caching. Server-side caching only helps for expensive queries (>200ms).

**How to Detect This Failure Mode:**
- If adding caching to fast queries (<100ms) → probably won't help
- If cache is same distance from client as DB → probably won't help
- Always measure before/after latency

-->

<!-- All failures logged below this line -->
