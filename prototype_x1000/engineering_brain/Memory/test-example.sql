-- MEMORY SYSTEM TEST EXAMPLE
-- Run these queries in Supabase SQL Editor to test the Memory system

-- ========================================
-- STEP 1: Insert a test experience
-- ========================================

INSERT INTO experience_log (
  task_title,
  product_target,
  execution_gear,
  engineering_mode,
  artifact_type,
  problem,
  attempts,
  solution,
  why_it_worked,
  pattern_observed,
  would_do_differently,
  time_spent_minutes,
  project_id
) VALUES (
  'Add dark mode toggle to Settings page',
  'WEB_APP',
  'BUILD',
  'APP',
  'Component',
  'User requested a dark mode toggle in the settings page to improve accessibility',
  '[
    {"attempt": 1, "what": "CSS-only solution with media query", "result": "Flickered on page load, no persistence"},
    {"attempt": 2, "what": "localStorage + React Context API", "result": "Works perfectly, no flicker, survives refresh"}
  ]'::jsonb,
  'Implemented dark mode toggle using React Context for global state and localStorage for persistence across sessions',
  'Context API provides global theme state without prop drilling. localStorage ensures theme preference survives page refresh.',
  'All theme/preference toggles should use React Context + localStorage pattern for WEB_APP projects',
  'Start with Context API from the beginning instead of attempting CSS-only solutions',
  45
);

-- ========================================
-- STEP 2: Search for similar tasks (Recipe 2)
-- ========================================

-- Find all experiences related to "dark mode"
SELECT
  task_title,
  problem,
  solution,
  pattern_observed,
  created_at
FROM experience_log
WHERE
  search_vector @@ to_tsquery('english', 'dark & mode')
ORDER BY created_at DESC
LIMIT 5;

-- Expected result: Shows the dark mode task we just logged

-- ========================================
-- STEP 3: Insert a second similar experience
-- ========================================

INSERT INTO experience_log (
  task_title,
  product_target,
  execution_gear,
  engineering_mode,
  artifact_type,
  problem,
  attempts,
  solution,
  why_it_worked,
  pattern_observed,
  time_spent_minutes,
  project_id
) VALUES (
  'Add language preference toggle',
  'WEB_APP',
  'BUILD',
  'APP',
  'Component',
  'User needs to switch between English and Spanish',
  '[
    {"attempt": 1, "what": "React Context + localStorage", "result": "Worked on first try"}
  ]'::jsonb,
  'Implemented language toggle using React Context + localStorage pattern learned from dark mode task',
  'Same pattern as theme toggle: Context for global state, localStorage for persistence',
  'User preference toggles (theme, language, layout) all use the same Context + localStorage pattern',
  15
);

-- ========================================
-- STEP 4: Search again to see pattern
-- ========================================

-- Search for "preference" or "toggle" experiences
SELECT
  task_title,
  product_target,
  pattern_observed,
  time_spent_minutes,
  created_at
FROM experience_log
WHERE
  search_vector @@ to_tsquery('english', 'preference | toggle')
  AND product_target = 'WEB_APP'
ORDER BY created_at DESC;

-- Expected result: Shows both dark mode and language preference tasks
-- Notice: Time dropped from 45min to 15min (learning effect!)

-- ========================================
-- STEP 5: Create a pattern (Recipe 6)
-- ========================================

-- After 3+ similar tasks, we create a pattern
INSERT INTO patterns (
  title,
  observed_count,
  context_product_target,
  context_mode,
  root_cause,
  solution,
  trigger,
  evidence,
  anti_pattern,
  project_id
) VALUES (
  'User preference toggles require Context + localStorage',
  2, -- We've observed this 2 times so far
  'WEB_APP',
  'APP',
  'User preferences need global state (to avoid prop drilling) and persistence (to survive refresh)',
  'Use React Context API for global state + localStorage for persistence. Pattern: 1) Create ThemeContext, 2) Wrap app in Provider, 3) Use useContext in components, 4) Sync to localStorage on change',
  'When building any user preference toggle (theme, language, layout, density, etc.)',
  '[
    {"task_id": "dark-mode-toggle", "title": "Add dark mode toggle to Settings page"},
    {"task_id": "language-toggle", "title": "Add language preference toggle"}
  ]'::jsonb,
  'Using CSS-only solutions (no persistence, flickering) or prop drilling (maintenance burden)',
  'engineering-brain'
);

-- ========================================
-- STEP 6: Search for applicable patterns (Recipe 3)
-- ========================================

-- Before building a new preference feature, search for patterns
SELECT
  title,
  solution,
  trigger,
  anti_pattern,
  observed_count
FROM patterns
WHERE
  search_vector @@ to_tsquery('english', 'preference | toggle')
  AND context_product_target = 'WEB_APP'
ORDER BY observed_count DESC;

-- Expected result: Shows the "User preference toggles" pattern
-- This is pseudo-intuition: the agent "just knows" to use Context + localStorage

-- ========================================
-- STEP 7: Log a failure (Recipe 5)
-- ========================================

INSERT INTO failure_archive (
  title,
  product_target,
  engineering_mode,
  what_i_tried,
  why_i_thought_it_would_work,
  what_happened,
  why_it_failed,
  what_i_learned,
  correct_approach,
  how_to_detect,
  project_id
) VALUES (
  'CSS-only dark mode flickered on load',
  'WEB_APP',
  'APP',
  'Implemented dark mode using only CSS media query (prefers-color-scheme) without JavaScript',
  'CSS media queries are performant and require no JavaScript, seemed like cleanest solution',
  'Page loaded in light mode for ~100ms, then flickered to dark mode, creating jarring UX',
  'Browser needs to parse CSS and apply media query AFTER initial paint. JavaScript can apply theme before first paint.',
  'For user-controlled preferences (vs system preferences), JavaScript + localStorage is required to apply theme before first paint',
  'Use React Context + localStorage to apply theme class to <html> element before render. Check localStorage in early script tag if needed.',
  'If building theme toggle that users control (not just system preference detection) → needs JavaScript + storage',
  'engineering-brain'
);

-- ========================================
-- STEP 8: Search for known failures (Recipe 4)
-- ========================================

-- Before trying CSS-only approach, check if it's a known failure
SELECT
  title,
  what_i_tried,
  why_it_failed,
  correct_approach,
  how_to_detect
FROM failure_archive
WHERE
  search_vector @@ to_tsquery('english', 'CSS & dark & mode')
ORDER BY created_at DESC;

-- Expected result: Shows the CSS-only failure
-- Agent now knows to avoid this approach

-- ========================================
-- STEP 9: Analytics — Learning velocity
-- ========================================

-- How many experiences have been logged?
SELECT COUNT(*) as total_experiences FROM experience_log;

-- How many patterns have been identified?
SELECT COUNT(*) as total_patterns FROM patterns;

-- How many failures have been documented?
SELECT COUNT(*) as total_failures FROM failure_archive;

-- Average time spent per task (should decrease over time)
SELECT
  AVG(time_spent_minutes) as avg_minutes,
  COUNT(*) as task_count
FROM experience_log
WHERE created_at >= NOW() - INTERVAL '30 days';

-- ========================================
-- VERIFICATION COMPLETE
-- ========================================

-- If you see results from all queries above, the Memory system is working correctly.

-- Next steps:
-- 1. Delete test data: DELETE FROM experience_log WHERE project_id = 'engineering-brain';
-- 2. Start logging real tasks using the recipes in Engineering/Solutions/Recipes/MemoryLogging.md
-- 3. After 50 tasks, you'll start seeing patterns emerge
-- 4. After 200 tasks, you'll have pseudo-intuition

-- Expected growth trajectory:
--   50 tasks → Patterns visible
--  100 tasks → Pseudo-intuition emerges
--  200 tasks → Better than junior dev in this domain
--  500 tasks → Better than mid-level dev in this domain
-- 1000 tasks → Institutional memory authority
