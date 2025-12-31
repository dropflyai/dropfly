# MEMORY LOGGING RECIPE (SUPABASE)
**How to Log Experiences, Patterns, and Failures to Supabase**

---

## Prerequisites

1. Supabase project created
2. Migration run: `engineering/Memory/supabase-migration.sql`
3. Supabase client configured in your project
4. Environment variable: `SUPABASE_URL` and `SUPABASE_ANON_KEY`

---

## Recipe 1: Log Experience After Task Completion

**When**: After EVERY completed task (mandatory per Checklist.md)

**Format**:
```javascript
// Node.js / JavaScript example
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

async function logExperience(experience) {
  const { data, error } = await supabase
    .from('experience_log')
    .insert({
      task_title: experience.title,
      product_target: experience.productTarget,
      execution_gear: experience.gear,
      engineering_mode: experience.mode,
      artifact_type: experience.artifactType,
      problem: experience.problem,
      attempts: experience.attempts, // Array of {attempt: 1, what: "...", result: "..."}
      solution: experience.solution,
      why_it_worked: experience.whyItWorked,
      pattern_observed: experience.patternObserved,
      would_do_differently: experience.wouldDoDifferently,
      time_spent_minutes: experience.timeSpentMinutes,
      user_id: experience.userId, // Optional: from auth.uid()
      project_id: 'engineering-brain' // Or your project identifier
    })

  if (error) {
    console.error('Failed to log experience:', error)
    return null
  }

  return data
}

// Example usage:
await logExperience({
  title: 'Add dark mode toggle to Settings',
  productTarget: 'WEB_APP',
  gear: 'BUILD',
  mode: 'APP',
  artifactType: 'Component',
  problem: 'User needs dark mode toggle in settings page',
  attempts: [
    { attempt: 1, what: 'CSS-only solution', result: 'flickered on load' },
    { attempt: 2, what: 'localStorage + context', result: 'worked' }
  ],
  solution: 'Implemented dark mode toggle using React Context + localStorage persistence',
  whyItWorked: 'Context provides global state, localStorage survives refresh',
  patternObserved: 'All theme toggles should use Context + localStorage pattern',
  wouldDoDifferently: 'Start with Context from the beginning, avoid CSS-only attempts',
  timeSpentMinutes: 45
})
```

**SQL Alternative** (direct query):
```sql
INSERT INTO experience_log (
  task_title, product_target, execution_gear, engineering_mode, artifact_type,
  problem, attempts, solution, why_it_worked, pattern_observed,
  would_do_differently, time_spent_minutes, user_id, project_id
) VALUES (
  'Add dark mode toggle to Settings',
  'WEB_APP',
  'BUILD',
  'APP',
  'Component',
  'User needs dark mode toggle in settings page',
  '[
    {"attempt": 1, "what": "CSS-only solution", "result": "flickered on load"},
    {"attempt": 2, "what": "localStorage + context", "result": "worked"}
  ]'::jsonb,
  'Implemented dark mode toggle using React Context + localStorage persistence',
  'Context provides global state, localStorage survives refresh',
  'All theme toggles should use Context + localStorage pattern',
  'Start with Context from the beginning, avoid CSS-only attempts',
  45,
  auth.uid(), -- or NULL if not using auth
  'engineering-brain'
);
```

---

## Recipe 2: Search for Similar Past Tasks (Before Planning)

**When**: Before starting implementation (Checklist.md Preflight step)

**Query**:
```javascript
async function searchSimilarTasks(keywords, productTarget = null, mode = null) {
  let query = supabase
    .from('experience_log')
    .select('task_title, problem, solution, pattern_observed, created_at')
    .textSearch('search_vector', keywords) // Full-text search
    .order('created_at', { ascending: false })
    .limit(5)

  if (productTarget) {
    query = query.eq('product_target', productTarget)
  }

  if (mode) {
    query = query.eq('engineering_mode', mode)
  }

  const { data, error } = await query

  if (error) {
    console.error('Search failed:', error)
    return []
  }

  return data
}

// Example usage:
const pastTasks = await searchSimilarTasks('dark mode', 'WEB_APP', 'APP')
console.log('Similar past tasks:', pastTasks)
```

**SQL Alternative**:
```sql
-- Search for "dark mode" experiences in WEB_APP/APP context
SELECT
  task_title,
  problem,
  solution,
  pattern_observed,
  created_at
FROM experience_log
WHERE
  search_vector @@ to_tsquery('english', 'dark & mode')
  AND product_target = 'WEB_APP'
  AND engineering_mode = 'APP'
ORDER BY created_at DESC
LIMIT 5;
```

---

## Recipe 3: Find Applicable Patterns (Before Planning)

**When**: Before starting implementation (Checklist.md Preflight step)

**Query**:
```javascript
async function findApplicablePatterns(keywords, productTarget = null, mode = null) {
  let query = supabase
    .from('patterns')
    .select('title, solution, trigger, anti_pattern, observed_count')
    .textSearch('search_vector', keywords)
    .order('observed_count', { ascending: false })
    .limit(5)

  if (productTarget) {
    query = query.eq('context_product_target', productTarget)
  }

  if (mode) {
    query = query.eq('context_mode', mode)
  }

  const { data, error } = await query

  if (error) {
    console.error('Pattern search failed:', error)
    return []
  }

  return data
}

// Example usage:
const patterns = await findApplicablePatterns('authentication', 'WEB_APP', 'APP')
console.log('Applicable patterns:', patterns)
```

**SQL Alternative**:
```sql
-- Find authentication patterns for WEB_APP
SELECT
  title,
  solution,
  trigger,
  anti_pattern,
  observed_count
FROM patterns
WHERE
  search_vector @@ to_tsquery('english', 'authentication | auth')
  AND context_product_target = 'WEB_APP'
ORDER BY observed_count DESC
LIMIT 5;
```

---

## Recipe 4: Check for Known Failure Modes (Before Implementation)

**When**: Before trying a specific approach (Checklist.md Preflight step)

**Query**:
```javascript
async function checkFailureModes(keywords, productTarget = null) {
  let query = supabase
    .from('failure_archive')
    .select('title, what_i_tried, why_it_failed, correct_approach, how_to_detect')
    .textSearch('search_vector', keywords)
    .order('created_at', { ascending: false })
    .limit(5)

  if (productTarget) {
    query = query.eq('product_target', productTarget)
  }

  const { data, error } = await query

  if (error) {
    console.error('Failure search failed:', error)
    return []
  }

  return data
}

// Example usage:
const failures = await checkFailureModes('supabase migration', 'WEB_APP')
console.log('Known failure modes:', failures)
```

**SQL Alternative**:
```sql
-- Check for Supabase migration failures
SELECT
  title,
  what_i_tried,
  why_it_failed,
  correct_approach,
  how_to_detect
FROM failure_archive
WHERE
  search_vector @@ to_tsquery('english', 'supabase & migration')
ORDER BY created_at DESC
LIMIT 5;
```

---

## Recipe 5: Log a Failure (After Failed Attempt)

**When**: After an approach fails (before or during implementation)

**Format**:
```javascript
async function logFailure(failure) {
  const { data, error } = await supabase
    .from('failure_archive')
    .insert({
      title: failure.title,
      product_target: failure.productTarget,
      engineering_mode: failure.mode,
      artifact_type: failure.artifactType,
      what_i_tried: failure.whatITried,
      why_i_thought_it_would_work: failure.whyIThoughtItWouldWork,
      what_happened: failure.whatHappened,
      why_it_failed: failure.whyItFailed,
      what_i_learned: failure.whatILearned,
      correct_approach: failure.correctApproach,
      how_to_detect: failure.howToDetect,
      user_id: failure.userId,
      project_id: 'engineering-brain'
    })

  if (error) {
    console.error('Failed to log failure:', error)
    return null
  }

  return data
}

// Example usage:
await logFailure({
  title: 'Redis caching made latency worse',
  productTarget: 'API_SERVICE',
  mode: 'API',
  whatITried: 'Added Redis caching layer on same server as API to reduce database queries',
  whyIThoughtItWouldWork: 'Caching should reduce DB load and improve response time',
  whatHappened: 'Latency increased from 150ms to 220ms',
  whyItFailed: 'Cache was on same server as API. Network round-trip to Redis (70ms) was slower than optimized DB query (50ms)',
  whatILearned: 'Caching only helps if cache is closer to client than data source, OR if cache hit rate is very high (>90%)',
  correctApproach: 'Use CDN caching (closer to client) or client-side caching. Server-side caching only helps for expensive queries (>200ms)',
  howToDetect: 'If adding caching to fast queries (<100ms) → probably won\'t help. Always measure before/after latency.'
})
```

---

## Recipe 6: Propose a Pattern (After 3+ Similar Tasks)

**When**: After completing 3+ similar tasks (Checklist.md Completion Gate)

**Process**:
1. Search `experience_log` for similar tasks (by keywords, Product Target, Mode)
2. Identify commonality across 3+ experiences
3. Propose pattern using format below
4. Get user confirmation
5. Insert into `patterns` table

**Format**:
```javascript
async function proposePattern(pattern) {
  // First: verify evidence exists (3+ similar tasks)
  const { data: evidence } = await supabase
    .from('experience_log')
    .select('id, task_title, pattern_observed')
    .textSearch('search_vector', pattern.evidenceKeywords)
    .eq('product_target', pattern.productTarget)
    .limit(10)

  if (!evidence || evidence.length < 3) {
    console.warn('Not enough evidence for pattern (need 3+ similar tasks)')
    return null
  }

  // Then: insert pattern
  const { data, error } = await supabase
    .from('patterns')
    .insert({
      title: pattern.title,
      observed_count: evidence.length,
      context_product_target: pattern.productTarget,
      context_mode: pattern.mode,
      root_cause: pattern.rootCause,
      solution: pattern.solution,
      trigger: pattern.trigger,
      evidence: evidence.map(e => ({ id: e.id, title: e.task_title })),
      anti_pattern: pattern.antiPattern,
      user_id: pattern.userId,
      project_id: 'engineering-brain'
    })

  if (error) {
    console.error('Failed to create pattern:', error)
    return null
  }

  return data
}

// Example usage:
await proposePattern({
  title: 'State-changing forms need CSRF protection',
  productTarget: 'WEB_APP',
  mode: 'APP',
  rootCause: 'State-changing forms are vulnerable to cross-site request forgery',
  solution: 'Always add CSRF token to forms that POST/PUT/DELETE',
  trigger: 'When building any form that changes server state',
  antiPattern: 'Building forms without CSRF protection, adding it later after security review',
  evidenceKeywords: 'form & (CSRF | security)'
})
```

---

## Recipe 7: Analytics Queries (Optional)

**Most logged experiences by Product Target**:
```sql
SELECT
  product_target,
  COUNT(*) as task_count,
  AVG(time_spent_minutes) as avg_time_minutes
FROM experience_log
GROUP BY product_target
ORDER BY task_count DESC;
```

**Pattern effectiveness (by observation count)**:
```sql
SELECT
  title,
  observed_count,
  context_product_target,
  created_at
FROM patterns
WHERE observed_count >= 5
ORDER BY observed_count DESC;
```

**Failure categories**:
```sql
SELECT
  product_target,
  engineering_mode,
  COUNT(*) as failure_count
FROM failure_archive
GROUP BY product_target, engineering_mode
ORDER BY failure_count DESC;
```

**Learning velocity (tasks logged over time)**:
```sql
SELECT
  DATE_TRUNC('week', created_at) as week,
  COUNT(*) as tasks_logged
FROM experience_log
GROUP BY week
ORDER BY week DESC
LIMIT 12;
```

---

## Integration Options

### Option A: Manual Logging (Quick Start)
Use Supabase dashboard SQL Editor to run queries manually after each task.

**Pros**: No code changes, works immediately
**Cons**: Manual, easy to forget

### Option B: CLI Script (Recommended)
Create a Node.js script that prompts for experience details and logs to Supabase.

**Pros**: Fast, consistent format, can be aliased
**Cons**: Requires Node.js setup

### Option C: Git Hook (Advanced)
Post-commit hook that prompts for experience log if task seems complete.

**Pros**: Automatic trigger, never forget
**Cons**: Can interrupt flow, requires hook setup

### Option D: IDE Extension (Future)
VSCode/Cursor extension with UI for logging experiences.

**Pros**: Best UX, contextual
**Cons**: Requires extension development

---

## Recommended Workflow

### Before Planning (Preflight)
```bash
# 1. Search for similar past tasks
# Run Recipe 2 query with task keywords

# 2. Find applicable patterns
# Run Recipe 3 query with task keywords

# 3. Check for known failure modes
# Run Recipe 4 query with planned approach keywords
```

### After Completion (Mandatory)
```bash
# 1. Log experience (ALWAYS REQUIRED)
# Run Recipe 1 with task details

# 2. If 3+ similar tasks exist, propose pattern
# Run Recipe 6 to create pattern

# 3. If failures occurred, log failure
# Run Recipe 5 for each failed approach
```

---

## Environment Setup

**.env file**:
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

**Supabase client initialization**:
```javascript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

export default supabase
```

---

## Next Steps

1. Run `/engineering/Memory/supabase-migration.sql` in Supabase SQL Editor
2. Verify tables created: `SELECT * FROM experience_log;`
3. Choose integration option (A, B, C, or D)
4. Log your first experience using Recipe 1
5. After 3 similar tasks, propose first pattern using Recipe 6

---

**This recipe enables compounding learning. The more you log, the smarter the system becomes.**
