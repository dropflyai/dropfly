-- AI BRAINS MEMORY SYSTEM
-- Architecture: Multi-brain support via project_id column
-- Current: Engineering Brain (experience_log, patterns, failure_archive)
-- Future: Design Brain, Options Trader Brain, MBA Brain (separate tables added later)
--
-- Run this in your Supabase SQL Editor to create Memory tables
-- Project: Create new Supabase project named "ai-brains-memory" or similar

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- ENGINEERING BRAIN TABLES
-- ========================================

-- ========================================
-- EXPERIENCE LOG TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS experience_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Task metadata
  task_title TEXT NOT NULL,
  product_target TEXT NOT NULL,
  execution_gear TEXT NOT NULL,
  engineering_mode TEXT NOT NULL,
  artifact_type TEXT,

  -- Task details
  problem TEXT NOT NULL,
  attempts JSONB DEFAULT '[]'::jsonb,
  solution TEXT NOT NULL,
  why_it_worked TEXT NOT NULL,
  pattern_observed TEXT,
  would_do_differently TEXT,
  time_spent_minutes INTEGER,

  -- Multi-user support
  user_id UUID REFERENCES auth.users(id),
  project_id TEXT,

  -- Search optimization
  search_vector TSVECTOR GENERATED ALWAYS AS (
    to_tsvector('english',
      task_title || ' ' ||
      problem || ' ' ||
      solution || ' ' ||
      COALESCE(pattern_observed, '')
    )
  ) STORED
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_experience_log_created_at ON experience_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_experience_log_product_target ON experience_log(product_target);
CREATE INDEX IF NOT EXISTS idx_experience_log_gear ON experience_log(execution_gear);
CREATE INDEX IF NOT EXISTS idx_experience_log_mode ON experience_log(engineering_mode);
CREATE INDEX IF NOT EXISTS idx_experience_log_user ON experience_log(user_id);
CREATE INDEX IF NOT EXISTS idx_experience_log_project ON experience_log(project_id);
CREATE INDEX IF NOT EXISTS idx_experience_log_search ON experience_log USING GIN(search_vector);

-- ========================================
-- PATTERNS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS patterns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Pattern metadata
  title TEXT NOT NULL,
  observed_count INTEGER DEFAULT 1 NOT NULL,
  context_product_target TEXT,
  context_mode TEXT,

  -- Pattern details
  root_cause TEXT NOT NULL,
  solution TEXT NOT NULL,
  trigger TEXT NOT NULL,
  evidence JSONB DEFAULT '[]'::jsonb,
  anti_pattern TEXT,

  -- Multi-user support
  user_id UUID REFERENCES auth.users(id),
  project_id TEXT,

  -- Search optimization
  search_vector TSVECTOR GENERATED ALWAYS AS (
    to_tsvector('english',
      title || ' ' ||
      root_cause || ' ' ||
      solution || ' ' ||
      trigger || ' ' ||
      COALESCE(anti_pattern, '')
    )
  ) STORED
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_patterns_created_at ON patterns(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_patterns_observed_count ON patterns(observed_count DESC);
CREATE INDEX IF NOT EXISTS idx_patterns_product_target ON patterns(context_product_target);
CREATE INDEX IF NOT EXISTS idx_patterns_mode ON patterns(context_mode);
CREATE INDEX IF NOT EXISTS idx_patterns_user ON patterns(user_id);
CREATE INDEX IF NOT EXISTS idx_patterns_project ON patterns(project_id);
CREATE INDEX IF NOT EXISTS idx_patterns_search ON patterns USING GIN(search_vector);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_patterns_updated_at
  BEFORE UPDATE ON patterns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- FAILURE ARCHIVE TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS failure_archive (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Failure metadata
  title TEXT NOT NULL,
  product_target TEXT,
  engineering_mode TEXT,
  artifact_type TEXT,

  -- Failure details
  what_i_tried TEXT NOT NULL,
  why_i_thought_it_would_work TEXT NOT NULL,
  what_happened TEXT NOT NULL,
  why_it_failed TEXT NOT NULL,
  what_i_learned TEXT NOT NULL,
  correct_approach TEXT NOT NULL,
  how_to_detect TEXT,

  -- Multi-user support
  user_id UUID REFERENCES auth.users(id),
  project_id TEXT,

  -- Search optimization
  search_vector TSVECTOR GENERATED ALWAYS AS (
    to_tsvector('english',
      title || ' ' ||
      what_i_tried || ' ' ||
      why_it_failed || ' ' ||
      what_i_learned || ' ' ||
      correct_approach || ' ' ||
      COALESCE(how_to_detect, '')
    )
  ) STORED
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_failure_archive_created_at ON failure_archive(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_failure_archive_product_target ON failure_archive(product_target);
CREATE INDEX IF NOT EXISTS idx_failure_archive_mode ON failure_archive(engineering_mode);
CREATE INDEX IF NOT EXISTS idx_failure_archive_user ON failure_archive(user_id);
CREATE INDEX IF NOT EXISTS idx_failure_archive_project ON failure_archive(project_id);
CREATE INDEX IF NOT EXISTS idx_failure_archive_search ON failure_archive USING GIN(search_vector);

-- ========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================

-- Enable RLS on all tables
ALTER TABLE experience_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE failure_archive ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read all entries (knowledge sharing)
CREATE POLICY "Allow public read access" ON experience_log
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access" ON patterns
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access" ON failure_archive
  FOR SELECT USING (true);

-- Policy: Authenticated users can insert their own entries
CREATE POLICY "Users can insert their own entries" ON experience_log
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert their own entries" ON patterns
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert their own entries" ON failure_archive
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own entries
CREATE POLICY "Users can update their own entries" ON experience_log
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own entries" ON patterns
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own entries" ON failure_archive
  FOR UPDATE USING (auth.uid() = user_id);

-- ========================================
-- HELPER VIEWS
-- ========================================

-- View: Recent experiences (last 30 days)
CREATE OR REPLACE VIEW recent_experiences AS
SELECT
  task_title,
  product_target,
  execution_gear,
  engineering_mode,
  problem,
  solution,
  pattern_observed,
  created_at
FROM experience_log
WHERE created_at >= NOW() - INTERVAL '30 days'
ORDER BY created_at DESC;

-- View: Top patterns (by observation count)
CREATE OR REPLACE VIEW top_patterns AS
SELECT
  title,
  observed_count,
  context_product_target,
  context_mode,
  solution,
  trigger,
  created_at
FROM patterns
ORDER BY observed_count DESC, created_at DESC;

-- View: Recent failures (last 90 days)
CREATE OR REPLACE VIEW recent_failures AS
SELECT
  title,
  product_target,
  what_i_tried,
  why_it_failed,
  correct_approach,
  created_at
FROM failure_archive
WHERE created_at >= NOW() - INTERVAL '90 days'
ORDER BY created_at DESC;

-- ========================================
-- USAGE EXAMPLES
-- ========================================

-- Example 1: Log a new experience
-- INSERT INTO experience_log (
--   task_title, product_target, execution_gear, engineering_mode, artifact_type,
--   problem, attempts, solution, why_it_worked, pattern_observed, time_spent_minutes,
--   user_id, project_id
-- ) VALUES (
--   'Add dark mode toggle to Settings',
--   'WEB_APP',
--   'BUILD',
--   'APP',
--   'Component',
--   'User needs dark mode toggle in settings page',
--   '[{"attempt": 1, "what": "CSS-only solution", "result": "flickered on load"}, {"attempt": 2, "what": "localStorage + context", "result": "worked"}]'::jsonb,
--   'Implemented dark mode toggle using React Context + localStorage persistence',
--   'Context provides global state, localStorage survives refresh',
--   'All theme toggles should use Context + localStorage pattern',
--   45,
--   auth.uid(),
--   'engineering-brain'
-- );

-- Example 2: Search for similar past tasks
-- SELECT task_title, problem, solution, pattern_observed
-- FROM experience_log
-- WHERE search_vector @@ to_tsquery('english', 'dark & mode')
-- ORDER BY created_at DESC
-- LIMIT 5;

-- Example 3: Find applicable patterns
-- SELECT title, solution, trigger
-- FROM patterns
-- WHERE context_product_target = 'WEB_APP'
--   AND search_vector @@ to_tsquery('english', 'auth | authentication')
-- ORDER BY observed_count DESC;

-- Example 4: Check for known failure modes
-- SELECT title, why_it_failed, correct_approach
-- FROM failure_archive
-- WHERE search_vector @@ to_tsquery('english', 'supabase & migration')
-- ORDER BY created_at DESC;

-- ========================================
-- MIGRATION COMPLETE
-- ========================================
-- Next steps:
-- 1. Run this migration in your Supabase SQL Editor
-- 2. Verify tables created: SELECT * FROM experience_log;
-- 3. Use queries from Engineering/Solutions/Recipes/MemoryLogging.md
