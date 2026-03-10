-- X2000 Memory System Schema
-- Run this in the Supabase SQL Editor
-- This creates/updates tables for patterns, learnings, and skills

-- ============================================
-- SHARED PATTERNS TABLE
-- ============================================
-- Drop and recreate to ensure correct schema
DROP TABLE IF EXISTS shared_patterns CASCADE;

CREATE TABLE shared_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  trigger TEXT NOT NULL,
  solution TEXT NOT NULL,
  context TEXT[] DEFAULT '{}',
  success_rate NUMERIC DEFAULT 1.0,
  usage_count INTEGER DEFAULT 0,
  created_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  tags TEXT[] DEFAULT '{}'
);

-- Indexes for patterns
CREATE INDEX idx_shared_patterns_created_by ON shared_patterns(created_by);
CREATE INDEX idx_shared_patterns_success_rate ON shared_patterns(success_rate DESC);
CREATE INDEX idx_shared_patterns_tags ON shared_patterns USING GIN(tags);

-- ============================================
-- BRAIN LEARNINGS TABLE
-- ============================================
DROP TABLE IF EXISTS brain_learnings CASCADE;

CREATE TABLE brain_learnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('success', 'failure', 'insight', 'decision')),
  source TEXT NOT NULL,
  task_id TEXT,
  description TEXT NOT NULL,
  root_cause TEXT,
  recommendation TEXT NOT NULL,
  confidence NUMERIC DEFAULT 0.5 CHECK (confidence >= 0 AND confidence <= 1),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  applied_count INTEGER DEFAULT 0,
  tags TEXT[] DEFAULT '{}'
);

-- Indexes for learnings
CREATE INDEX idx_brain_learnings_source ON brain_learnings(source);
CREATE INDEX idx_brain_learnings_type ON brain_learnings(type);
CREATE INDEX idx_brain_learnings_confidence ON brain_learnings(confidence DESC);
CREATE INDEX idx_brain_learnings_tags ON brain_learnings USING GIN(tags);
CREATE INDEX idx_brain_learnings_created_at ON brain_learnings(created_at DESC);

-- ============================================
-- SHARED EXPERIENCES (SKILLS) TABLE
-- ============================================
DROP TABLE IF EXISTS shared_experiences CASCADE;

CREATE TABLE shared_experiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  implementation TEXT NOT NULL,
  input_schema JSONB DEFAULT '{}',
  output_schema JSONB DEFAULT '{}',
  created_by TEXT NOT NULL,
  adopted_by TEXT[] DEFAULT '{}',
  usage_count INTEGER DEFAULT 0,
  success_rate NUMERIC DEFAULT 1.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for skills
CREATE INDEX idx_shared_experiences_created_by ON shared_experiences(created_by);
CREATE INDEX idx_shared_experiences_category ON shared_experiences(category);
CREATE INDEX idx_shared_experiences_usage_count ON shared_experiences(usage_count DESC);
CREATE INDEX idx_shared_experiences_adopted_by ON shared_experiences USING GIN(adopted_by);

-- ============================================
-- BRAIN BUILDS TABLE (for tracking brain activity)
-- ============================================
DROP TABLE IF EXISTS brain_builds CASCADE;

CREATE TABLE brain_builds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brain_type TEXT NOT NULL,
  task_id TEXT NOT NULL,
  task_subject TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'in_progress', 'completed', 'failed')),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  duration_ms INTEGER,
  result JSONB,
  error TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for brain builds
CREATE INDEX idx_brain_builds_brain_type ON brain_builds(brain_type);
CREATE INDEX idx_brain_builds_status ON brain_builds(status);
CREATE INDEX idx_brain_builds_created_at ON brain_builds(created_at DESC);

-- ============================================
-- BRAIN DECISIONS TABLE (for auditing)
-- ============================================
DROP TABLE IF EXISTS brain_decisions CASCADE;

CREATE TABLE brain_decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  description TEXT NOT NULL,
  options JSONB DEFAULT '[]',
  selected_option TEXT,
  rationale TEXT,
  participants TEXT[] DEFAULT '{}',
  debate_id UUID,
  outcome TEXT CHECK (outcome IN ('positive', 'negative', 'neutral', 'pending')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  evaluated_at TIMESTAMP WITH TIME ZONE
);

-- Index for decisions
CREATE INDEX idx_brain_decisions_created_at ON brain_decisions(created_at DESC);
CREATE INDEX idx_brain_decisions_participants ON brain_decisions USING GIN(participants);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
-- Enable RLS but allow service role full access
ALTER TABLE shared_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE brain_learnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE brain_builds ENABLE ROW LEVEL SECURITY;
ALTER TABLE brain_decisions ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (for X2000 agent writes)
CREATE POLICY "Service role has full access to patterns"
  ON shared_patterns FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role has full access to learnings"
  ON brain_learnings FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role has full access to experiences"
  ON shared_experiences FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role has full access to builds"
  ON brain_builds FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role has full access to decisions"
  ON brain_decisions FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Allow anon key read access (for querying from CLI)
CREATE POLICY "Anon can read patterns"
  ON shared_patterns FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anon can read learnings"
  ON brain_learnings FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anon can read experiences"
  ON shared_experiences FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anon can read builds"
  ON brain_builds FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anon can read decisions"
  ON brain_decisions FOR SELECT
  TO anon
  USING (true);

-- Allow anon key write access for development
CREATE POLICY "Anon can insert patterns"
  ON shared_patterns FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anon can update patterns"
  ON shared_patterns FOR UPDATE
  TO anon
  USING (true);

CREATE POLICY "Anon can insert learnings"
  ON brain_learnings FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anon can update learnings"
  ON brain_learnings FOR UPDATE
  TO anon
  USING (true);

CREATE POLICY "Anon can insert experiences"
  ON shared_experiences FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anon can update experiences"
  ON shared_experiences FOR UPDATE
  TO anon
  USING (true);

CREATE POLICY "Anon can insert builds"
  ON brain_builds FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anon can update builds"
  ON brain_builds FOR UPDATE
  TO anon
  USING (true);

CREATE POLICY "Anon can insert decisions"
  ON brain_decisions FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anon can update decisions"
  ON brain_decisions FOR UPDATE
  TO anon
  USING (true);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_x2000_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for shared_experiences
CREATE TRIGGER update_shared_experiences_updated_at
  BEFORE UPDATE ON shared_experiences
  FOR EACH ROW
  EXECUTE FUNCTION update_x2000_updated_at();

-- Function to increment usage and update success rate
CREATE OR REPLACE FUNCTION increment_pattern_usage(
  pattern_id UUID,
  was_successful BOOLEAN
)
RETURNS void AS $$
DECLARE
  current_rate NUMERIC;
  current_count INTEGER;
  alpha NUMERIC := 0.1;
BEGIN
  SELECT success_rate, usage_count INTO current_rate, current_count
  FROM shared_patterns
  WHERE id = pattern_id;

  UPDATE shared_patterns
  SET
    usage_count = current_count + 1,
    success_rate = current_rate * (1 - alpha) + (CASE WHEN was_successful THEN 1 ELSE 0 END) * alpha,
    last_used_at = NOW()
  WHERE id = pattern_id;
END;
$$ LANGUAGE plpgsql;

-- Function to increment skill usage
CREATE OR REPLACE FUNCTION increment_skill_usage(
  skill_id UUID,
  was_successful BOOLEAN
)
RETURNS void AS $$
DECLARE
  current_rate NUMERIC;
  current_count INTEGER;
  alpha NUMERIC := 0.1;
BEGIN
  SELECT success_rate, usage_count INTO current_rate, current_count
  FROM shared_experiences
  WHERE id = skill_id;

  UPDATE shared_experiences
  SET
    usage_count = current_count + 1,
    success_rate = current_rate * (1 - alpha) + (CASE WHEN was_successful THEN 1 ELSE 0 END) * alpha,
    updated_at = NOW()
  WHERE id = skill_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- VERIFICATION
-- ============================================
-- Run this to verify tables were created correctly
SELECT
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('shared_patterns', 'brain_learnings', 'shared_experiences', 'brain_builds', 'brain_decisions')
ORDER BY table_name, ordinal_position;
