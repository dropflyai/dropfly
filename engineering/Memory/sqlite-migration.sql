-- AI BRAINS MEMORY SYSTEM - SQLITE VERSION
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

-- Full-text search (SQLite FTS5)
CREATE VIRTUAL TABLE IF NOT EXISTS experience_log_fts USING fts5(
  task_title,
  problem,
  solution,
  pattern_observed,
  content='experience_log',
  content_rowid='rowid'
);

-- Triggers to keep FTS table in sync
CREATE TRIGGER IF NOT EXISTS experience_log_fts_insert AFTER INSERT ON experience_log BEGIN
  INSERT INTO experience_log_fts(rowid, task_title, problem, solution, pattern_observed)
  VALUES (new.rowid, new.task_title, new.problem, new.solution, new.pattern_observed);
END;

CREATE TRIGGER IF NOT EXISTS experience_log_fts_delete AFTER DELETE ON experience_log BEGIN
  DELETE FROM experience_log_fts WHERE rowid = old.rowid;
END;

CREATE TRIGGER IF NOT EXISTS experience_log_fts_update AFTER UPDATE ON experience_log BEGIN
  DELETE FROM experience_log_fts WHERE rowid = old.rowid;
  INSERT INTO experience_log_fts(rowid, task_title, problem, solution, pattern_observed)
  VALUES (new.rowid, new.task_title, new.problem, new.solution, new.pattern_observed);
END;

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

-- Full-text search
CREATE VIRTUAL TABLE IF NOT EXISTS patterns_fts USING fts5(
  title,
  root_cause,
  solution,
  trigger,
  anti_pattern,
  content='patterns',
  content_rowid='rowid'
);

-- Triggers to keep FTS table in sync
CREATE TRIGGER IF NOT EXISTS patterns_fts_insert AFTER INSERT ON patterns BEGIN
  INSERT INTO patterns_fts(rowid, title, root_cause, solution, trigger, anti_pattern)
  VALUES (new.rowid, new.title, new.root_cause, new.solution, new.trigger, new.anti_pattern);
END;

CREATE TRIGGER IF NOT EXISTS patterns_fts_delete AFTER DELETE ON patterns BEGIN
  DELETE FROM patterns_fts WHERE rowid = old.rowid;
END;

CREATE TRIGGER IF NOT EXISTS patterns_fts_update AFTER UPDATE ON patterns BEGIN
  DELETE FROM patterns_fts WHERE rowid = old.rowid;
  INSERT INTO patterns_fts(rowid, title, root_cause, solution, trigger, anti_pattern)
  VALUES (new.rowid, new.title, new.root_cause, new.solution, new.trigger, new.anti_pattern);
END;

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

-- Full-text search
CREATE VIRTUAL TABLE IF NOT EXISTS failure_archive_fts USING fts5(
  title,
  what_i_tried,
  why_it_failed,
  what_i_learned,
  correct_approach,
  how_to_detect,
  content='failure_archive',
  content_rowid='rowid'
);

-- Triggers to keep FTS table in sync
CREATE TRIGGER IF NOT EXISTS failure_archive_fts_insert AFTER INSERT ON failure_archive BEGIN
  INSERT INTO failure_archive_fts(rowid, title, what_i_tried, why_it_failed, what_i_learned, correct_approach, how_to_detect)
  VALUES (new.rowid, new.title, new.what_i_tried, new.why_it_failed, new.what_i_learned, new.correct_approach, new.how_to_detect);
END;

CREATE TRIGGER IF NOT EXISTS failure_archive_fts_delete AFTER DELETE ON failure_archive BEGIN
  DELETE FROM failure_archive_fts WHERE rowid = old.rowid;
END;

CREATE TRIGGER IF NOT EXISTS failure_archive_fts_update AFTER UPDATE ON failure_archive BEGIN
  DELETE FROM failure_archive_fts WHERE rowid = old.rowid;
  INSERT INTO failure_archive_fts(rowid, title, what_i_tried, why_it_failed, what_i_learned, correct_approach, how_to_detect)
  VALUES (new.rowid, new.title, new.what_i_tried, new.why_it_failed, new.what_i_learned, new.correct_approach, new.how_to_detect);
END;

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
