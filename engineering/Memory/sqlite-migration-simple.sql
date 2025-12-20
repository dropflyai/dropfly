-- AI BRAINS MEMORY SYSTEM - SQLITE VERSION (Simplified)
-- Architecture: Multi-brain support via project_id column
-- Current: Engineering Brain (experience_log, patterns, failure_archive)
-- Future: Design Brain, Options Trader Brain, MBA Brain (separate tables added later)
--
-- This schema mirrors the Supabase schema for seamless migration later
-- Database file: engineering/Memory/brain-memory.db

-- ========================================
-- ENGINEERING BRAIN TABLES
-- ========================================

-- ========================================
-- EXPERIENCE LOG TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS experience_log (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,

  -- Task metadata
  task_title TEXT NOT NULL,
  product_target TEXT NOT NULL,
  execution_gear TEXT NOT NULL,
  engineering_mode TEXT NOT NULL,
  artifact_type TEXT,

  -- Task details
  problem TEXT NOT NULL,
  attempts TEXT DEFAULT '[]', -- JSON array
  solution TEXT NOT NULL,
  why_it_worked TEXT NOT NULL,
  pattern_observed TEXT,
  would_do_differently TEXT,
  time_spent_minutes INTEGER,

  -- Multi-user support (for future Supabase migration)
  user_id TEXT,
  project_id TEXT DEFAULT 'engineering-brain'
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_experience_log_created_at ON experience_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_experience_log_product_target ON experience_log(product_target);
CREATE INDEX IF NOT EXISTS idx_experience_log_gear ON experience_log(execution_gear);
CREATE INDEX IF NOT EXISTS idx_experience_log_mode ON experience_log(engineering_mode);
CREATE INDEX IF NOT EXISTS idx_experience_log_project ON experience_log(project_id);

-- ========================================
-- PATTERNS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS patterns (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,

  -- Pattern metadata
  title TEXT NOT NULL,
  observed_count INTEGER DEFAULT 1 NOT NULL,
  context_product_target TEXT,
  context_mode TEXT,

  -- Pattern details
  root_cause TEXT NOT NULL,
  solution TEXT NOT NULL,
  trigger TEXT NOT NULL,
  evidence TEXT DEFAULT '[]', -- JSON array
  anti_pattern TEXT,

  -- Multi-user support
  user_id TEXT,
  project_id TEXT DEFAULT 'engineering-brain'
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_patterns_created_at ON patterns(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_patterns_observed_count ON patterns(observed_count DESC);
CREATE INDEX IF NOT EXISTS idx_patterns_product_target ON patterns(context_product_target);
CREATE INDEX IF NOT EXISTS idx_patterns_mode ON patterns(context_mode);
CREATE INDEX IF NOT EXISTS idx_patterns_project ON patterns(project_id);

-- Trigger to update updated_at on changes
CREATE TRIGGER IF NOT EXISTS patterns_updated_at AFTER UPDATE ON patterns BEGIN
  UPDATE patterns SET updated_at = CURRENT_TIMESTAMP WHERE id = new.id;
END;

-- ========================================
-- FAILURE ARCHIVE TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS failure_archive (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,

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
  user_id TEXT,
  project_id TEXT DEFAULT 'engineering-brain'
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_failure_archive_created_at ON failure_archive(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_failure_archive_product_target ON failure_archive(product_target);
CREATE INDEX IF NOT EXISTS idx_failure_archive_mode ON failure_archive(engineering_mode);
CREATE INDEX IF NOT EXISTS idx_failure_archive_project ON failure_archive(project_id);

-- ========================================
-- HELPER VIEWS
-- ========================================

-- View: Recent experiences (last 30 days)
CREATE VIEW IF NOT EXISTS recent_experiences AS
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
WHERE created_at >= datetime('now', '-30 days')
ORDER BY created_at DESC;

-- View: Top patterns (by observation count)
CREATE VIEW IF NOT EXISTS top_patterns AS
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
CREATE VIEW IF NOT EXISTS recent_failures AS
SELECT
  title,
  product_target,
  what_i_tried,
  why_it_failed,
  correct_approach,
  created_at
FROM failure_archive
WHERE created_at >= datetime('now', '-90 days')
ORDER BY created_at DESC;

-- ========================================
-- MIGRATION COMPLETE
-- ========================================
-- Database file: engineering/Memory/brain-memory.db
-- Schema compatible with Supabase for seamless migration
-- Note: Full-text search via LIKE queries for now (FTS5 can be added later if needed)
