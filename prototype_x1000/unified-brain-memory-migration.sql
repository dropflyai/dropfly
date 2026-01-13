-- ============================================================================
-- PROTOTYPE X1000 — UNIFIED BRAIN MEMORY SYSTEM
-- ============================================================================
-- Architecture: Multi-brain support for all 37 specialist brains
-- Database: Supabase (ai-brains-memory project)
--
-- TIER 1: Universal Tables (all brains read/write)
-- TIER 2: Brain-Specific Tables (domain data)
-- TIER 3: Orchestration Tables (CEO Brain coordination)
--
-- Run this in Supabase SQL Editor to create the complete memory system
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- For fuzzy text search

-- ============================================================================
-- TIER 1: UNIVERSAL TABLES (All 37 Brains)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- SHARED EXPERIENCES TABLE
-- All brains log their experiences here for cross-brain learning
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS shared_experiences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Brain identification
  brain_type TEXT NOT NULL,  -- 'engineering', 'design', 'product', 'mba', etc.

  -- Project context
  project_id TEXT,           -- 'tradefly', 'voicefly', etc.
  project_type TEXT,         -- 'web_app', 'mobile', 'saas', 'internal_tool'

  -- Experience categorization
  category TEXT NOT NULL,    -- 'success', 'failure', 'pattern', 'decision'
  domain TEXT,               -- 'authentication', 'ui', 'database', 'api', etc.

  -- Experience content
  task_summary TEXT NOT NULL,
  problem TEXT NOT NULL,
  solution TEXT NOT NULL,
  outcome TEXT,              -- 'success', 'partial', 'failed'
  outcome_details TEXT,

  -- Learning extraction
  pattern_observed TEXT,
  lessons_learned TEXT,
  would_do_differently TEXT,
  reusable_for TEXT[],       -- Contexts where this applies

  -- Metadata
  tags TEXT[] DEFAULT '{}',
  confidence_score NUMERIC(3,2) DEFAULT 0.80,  -- 0.00 to 1.00
  time_spent_minutes INTEGER,

  -- Multi-user support
  user_id UUID,

  -- Full-text search
  search_vector TSVECTOR GENERATED ALWAYS AS (
    setweight(to_tsvector('english', COALESCE(task_summary, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(problem, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(solution, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(pattern_observed, '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(array_to_string(tags, ' '), '')), 'C')
  ) STORED
);

-- Indexes for shared_experiences
CREATE INDEX IF NOT EXISTS idx_shared_exp_brain ON shared_experiences(brain_type);
CREATE INDEX IF NOT EXISTS idx_shared_exp_project ON shared_experiences(project_id);
CREATE INDEX IF NOT EXISTS idx_shared_exp_category ON shared_experiences(category);
CREATE INDEX IF NOT EXISTS idx_shared_exp_domain ON shared_experiences(domain);
CREATE INDEX IF NOT EXISTS idx_shared_exp_created ON shared_experiences(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_shared_exp_tags ON shared_experiences USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_shared_exp_search ON shared_experiences USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_shared_exp_reusable ON shared_experiences USING GIN(reusable_for);

-- ----------------------------------------------------------------------------
-- SHARED PATTERNS TABLE
-- Extracted patterns from 3+ similar experiences across all brains
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS shared_patterns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Pattern identification
  brain_type TEXT NOT NULL,
  pattern_name TEXT NOT NULL,
  pattern_type TEXT,         -- 'solution', 'anti-pattern', 'workflow', 'decision'

  -- Pattern content
  trigger TEXT NOT NULL,     -- When to apply this pattern
  solution TEXT NOT NULL,    -- What to do
  rationale TEXT,            -- Why it works
  anti_pattern TEXT,         -- What NOT to do

  -- Applicability
  applicable_contexts TEXT[] DEFAULT '{}',  -- ['web_app', 'saas', 'fintech']
  applicable_brains TEXT[] DEFAULT '{}',    -- ['engineering', 'design']
  prerequisites TEXT[],

  -- Confidence tracking
  observed_count INTEGER DEFAULT 1,
  success_count INTEGER DEFAULT 1,
  failure_count INTEGER DEFAULT 0,
  confidence_score NUMERIC(3,2) DEFAULT 0.80,

  -- Evidence
  source_experience_ids UUID[] DEFAULT '{}',

  -- Metadata
  tags TEXT[] DEFAULT '{}',
  user_id UUID,

  -- Full-text search
  search_vector TSVECTOR GENERATED ALWAYS AS (
    setweight(to_tsvector('english', COALESCE(pattern_name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(trigger, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(solution, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(rationale, '')), 'C')
  ) STORED
);

-- Indexes for shared_patterns
CREATE INDEX IF NOT EXISTS idx_shared_pat_brain ON shared_patterns(brain_type);
CREATE INDEX IF NOT EXISTS idx_shared_pat_type ON shared_patterns(pattern_type);
CREATE INDEX IF NOT EXISTS idx_shared_pat_contexts ON shared_patterns USING GIN(applicable_contexts);
CREATE INDEX IF NOT EXISTS idx_shared_pat_brains ON shared_patterns USING GIN(applicable_brains);
CREATE INDEX IF NOT EXISTS idx_shared_pat_confidence ON shared_patterns(confidence_score DESC);
CREATE INDEX IF NOT EXISTS idx_shared_pat_observed ON shared_patterns(observed_count DESC);
CREATE INDEX IF NOT EXISTS idx_shared_pat_search ON shared_patterns USING GIN(search_vector);

-- ----------------------------------------------------------------------------
-- SHARED FAILURES TABLE
-- Failed approaches to prevent repeating mistakes across brains
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS shared_failures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Failure identification
  brain_type TEXT NOT NULL,
  project_id TEXT,

  -- Failure categorization
  failure_type TEXT NOT NULL,  -- 'usability', 'technical', 'business', 'trust', 'conversion'
  severity TEXT DEFAULT 'medium',  -- 'low', 'medium', 'high', 'critical'
  domain TEXT,

  -- Failure content
  title TEXT NOT NULL,
  what_was_attempted TEXT NOT NULL,
  expected_outcome TEXT,
  actual_outcome TEXT NOT NULL,
  why_it_failed TEXT NOT NULL,

  -- Resolution
  correct_approach TEXT NOT NULL,
  prevention_rule TEXT,        -- One-line rule to prevent this
  detection_signs TEXT[],      -- Warning signs to watch for

  -- Impact
  time_wasted_minutes INTEGER,
  affected_areas TEXT[],

  -- Metadata
  tags TEXT[] DEFAULT '{}',
  user_id UUID,

  -- Full-text search
  search_vector TSVECTOR GENERATED ALWAYS AS (
    setweight(to_tsvector('english', COALESCE(title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(what_was_attempted, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(why_it_failed, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(correct_approach, '')), 'B')
  ) STORED
);

-- Indexes for shared_failures
CREATE INDEX IF NOT EXISTS idx_shared_fail_brain ON shared_failures(brain_type);
CREATE INDEX IF NOT EXISTS idx_shared_fail_project ON shared_failures(project_id);
CREATE INDEX IF NOT EXISTS idx_shared_fail_type ON shared_failures(failure_type);
CREATE INDEX IF NOT EXISTS idx_shared_fail_severity ON shared_failures(severity);
CREATE INDEX IF NOT EXISTS idx_shared_fail_created ON shared_failures(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_shared_fail_tags ON shared_failures USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_shared_fail_search ON shared_failures USING GIN(search_vector);


-- ============================================================================
-- TIER 2: BRAIN-SPECIFIC TABLES
-- ============================================================================

-- ----------------------------------------------------------------------------
-- DESIGN BRAIN TABLES
-- ----------------------------------------------------------------------------

-- Design DNA: Extracted design language from projects
CREATE TABLE IF NOT EXISTS design_dna (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Project identification
  project_id TEXT NOT NULL,
  project_name TEXT NOT NULL,

  -- Context
  industry TEXT,             -- 'fintech', 'healthcare', 'saas', 'ecommerce'
  design_mode TEXT,          -- 'MODE_SAAS', 'MODE_INTERNAL', 'MODE_AGENTIC'
  platform TEXT,             -- 'web', 'mobile', 'both'

  -- DNA Content (JSONB for flexibility)
  dna_summary TEXT[],        -- 3-5 bullet summary
  grid_rules JSONB,          -- { columns, gutters, max_width, layout_type }
  typography_rules JSONB,    -- { font_stack, scale, hierarchy_levels }
  color_tokens JSONB,        -- { backgrounds, surfaces, accents, text, semantic }
  component_rules JSONB,     -- { buttons, cards, inputs, navigation }
  interaction_rules JSONB,   -- { hover, focus, active, loading }
  motion_rules JSONB,        -- { timing, easing, principles }

  -- Differentiation
  signature_move TEXT,
  differentiation_plan TEXT[],

  -- Quality
  ux_score_avg NUMERIC(3,2),
  originality_score NUMERIC(3,2),

  -- References
  reference_urls TEXT[],

  user_id UUID
);

CREATE INDEX IF NOT EXISTS idx_design_dna_project ON design_dna(project_id);
CREATE INDEX IF NOT EXISTS idx_design_dna_industry ON design_dna(industry);
CREATE INDEX IF NOT EXISTS idx_design_dna_mode ON design_dna(design_mode);

-- Design References: Analyzed reference images
CREATE TABLE IF NOT EXISTS design_references (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  project_id TEXT,
  dna_id UUID REFERENCES design_dna(id),

  reference_url TEXT,
  reference_type TEXT,       -- 'competitor', 'inspiration', 'style_guide'

  -- User intent
  what_they_like TEXT,
  what_to_avoid TEXT,
  differentiation_intent TEXT,

  -- Extracted teardown (JSONB)
  visual_teardown JSONB,     -- Full extraction from VisualTeardownSchema

  user_id UUID
);

CREATE INDEX IF NOT EXISTS idx_design_ref_project ON design_references(project_id);
CREATE INDEX IF NOT EXISTS idx_design_ref_dna ON design_references(dna_id);

-- Design UX Scores: Quality tracking per screen
CREATE TABLE IF NOT EXISTS design_ux_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  project_id TEXT NOT NULL,
  screen_name TEXT NOT NULL,
  design_phase TEXT,         -- 'BUILD', 'SHIP', 'REVIEW'

  -- 9 Dimensions (1-5 each)
  clarity_score INTEGER,
  hierarchy_score INTEGER,
  speed_to_action_score INTEGER,
  state_completeness_score INTEGER,
  cognitive_load_score INTEGER,
  copy_quality_score INTEGER,
  mode_alignment_score INTEGER,
  accessibility_score INTEGER,
  originality_score INTEGER,

  -- Aggregate
  average_score NUMERIC(3,2),
  verdict TEXT,              -- 'PASS', 'REFACTOR_REQUIRED'

  notes TEXT,
  user_id UUID
);

CREATE INDEX IF NOT EXISTS idx_design_ux_project ON design_ux_scores(project_id);
CREATE INDEX IF NOT EXISTS idx_design_ux_verdict ON design_ux_scores(verdict);

-- Design Style Decisions: Token and style learnings
CREATE TABLE IF NOT EXISTS design_style_decisions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  project_id TEXT,
  industry TEXT,

  decision_type TEXT,        -- 'color', 'typography', 'spacing', 'component', 'interaction'
  decision_made TEXT NOT NULL,
  alternatives_considered TEXT[],

  result TEXT,               -- 'positive', 'negative', 'neutral'
  why_it_worked_or_failed TEXT,
  reusable_insight TEXT,

  tags TEXT[] DEFAULT '{}',
  user_id UUID
);

CREATE INDEX IF NOT EXISTS idx_design_style_type ON design_style_decisions(decision_type);
CREATE INDEX IF NOT EXISTS idx_design_style_industry ON design_style_decisions(industry);
CREATE INDEX IF NOT EXISTS idx_design_style_result ON design_style_decisions(result);

-- ----------------------------------------------------------------------------
-- ENGINEERING BRAIN TABLES (Migrate existing + add new)
-- ----------------------------------------------------------------------------

-- Engineering Architecture Decisions
CREATE TABLE IF NOT EXISTS eng_architecture_decisions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  project_id TEXT NOT NULL,
  decision_type TEXT,        -- 'database', 'api', 'frontend', 'infrastructure'

  title TEXT NOT NULL,
  context TEXT NOT NULL,
  decision TEXT NOT NULL,
  rationale TEXT NOT NULL,
  consequences TEXT[],
  alternatives_rejected TEXT[],

  status TEXT DEFAULT 'accepted',  -- 'proposed', 'accepted', 'deprecated', 'superseded'
  superseded_by UUID,

  tags TEXT[] DEFAULT '{}',
  user_id UUID
);

CREATE INDEX IF NOT EXISTS idx_eng_arch_project ON eng_architecture_decisions(project_id);
CREATE INDEX IF NOT EXISTS idx_eng_arch_type ON eng_architecture_decisions(decision_type);
CREATE INDEX IF NOT EXISTS idx_eng_arch_status ON eng_architecture_decisions(status);

-- Engineering Tech Debt Tracker
CREATE TABLE IF NOT EXISTS eng_tech_debt (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  project_id TEXT NOT NULL,

  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT,             -- File/component location
  debt_type TEXT,            -- 'code', 'architecture', 'testing', 'documentation'

  severity TEXT DEFAULT 'medium',  -- 'low', 'medium', 'high', 'critical'
  effort_estimate TEXT,      -- 'small', 'medium', 'large'

  reason_incurred TEXT,
  proposed_solution TEXT,

  status TEXT DEFAULT 'open',  -- 'open', 'in_progress', 'resolved', 'wont_fix'
  resolved_at TIMESTAMPTZ,

  tags TEXT[] DEFAULT '{}',
  user_id UUID
);

CREATE INDEX IF NOT EXISTS idx_eng_debt_project ON eng_tech_debt(project_id);
CREATE INDEX IF NOT EXISTS idx_eng_debt_severity ON eng_tech_debt(severity);
CREATE INDEX IF NOT EXISTS idx_eng_debt_status ON eng_tech_debt(status);

-- ----------------------------------------------------------------------------
-- PRODUCT BRAIN TABLES
-- ----------------------------------------------------------------------------

-- Product Features
CREATE TABLE IF NOT EXISTS product_features (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  project_id TEXT NOT NULL,

  feature_name TEXT NOT NULL,
  description TEXT NOT NULL,
  user_story TEXT,

  -- Prioritization
  priority TEXT,             -- 'critical', 'high', 'medium', 'low'
  rice_score NUMERIC(5,2),
  ice_score NUMERIC(5,2),

  -- Status
  status TEXT DEFAULT 'proposed',  -- 'proposed', 'approved', 'in_progress', 'shipped', 'rejected'

  -- Outcomes
  success_metrics TEXT[],
  actual_impact TEXT,

  tags TEXT[] DEFAULT '{}',
  user_id UUID
);

CREATE INDEX IF NOT EXISTS idx_product_feat_project ON product_features(project_id);
CREATE INDEX IF NOT EXISTS idx_product_feat_priority ON product_features(priority);
CREATE INDEX IF NOT EXISTS idx_product_feat_status ON product_features(status);

-- Product User Research
CREATE TABLE IF NOT EXISTS product_user_research (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  project_id TEXT NOT NULL,
  research_type TEXT,        -- 'interview', 'survey', 'usability_test', 'analytics'

  title TEXT NOT NULL,
  methodology TEXT,
  participants_count INTEGER,

  key_findings TEXT[] NOT NULL,
  insights TEXT[],
  action_items TEXT[],

  raw_data_location TEXT,

  tags TEXT[] DEFAULT '{}',
  user_id UUID
);

CREATE INDEX IF NOT EXISTS idx_product_research_project ON product_user_research(project_id);
CREATE INDEX IF NOT EXISTS idx_product_research_type ON product_user_research(research_type);

-- ----------------------------------------------------------------------------
-- OPTIONS TRADING BRAIN TABLES
-- ----------------------------------------------------------------------------

-- Trading Strategies
CREATE TABLE IF NOT EXISTS trading_strategies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  strategy_name TEXT NOT NULL,
  strategy_type TEXT,        -- 'iron_condor', 'covered_call', 'spread', 'straddle'

  description TEXT NOT NULL,
  entry_rules JSONB NOT NULL,
  exit_rules JSONB NOT NULL,
  risk_parameters JSONB,

  -- Performance
  win_rate NUMERIC(5,2),
  avg_return NUMERIC(8,2),
  max_drawdown NUMERIC(8,2),
  sharpe_ratio NUMERIC(5,2),

  -- Status
  status TEXT DEFAULT 'testing',  -- 'testing', 'active', 'paused', 'retired'

  backtest_results JSONB,
  live_results JSONB,

  tags TEXT[] DEFAULT '{}',
  user_id UUID
);

CREATE INDEX IF NOT EXISTS idx_trading_strat_type ON trading_strategies(strategy_type);
CREATE INDEX IF NOT EXISTS idx_trading_strat_status ON trading_strategies(status);

-- Trading Signals
CREATE TABLE IF NOT EXISTS trading_signals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  strategy_id UUID REFERENCES trading_strategies(id),
  signal_type TEXT,          -- 'entry', 'exit', 'adjustment'

  symbol TEXT NOT NULL,
  direction TEXT,            -- 'long', 'short'

  signal_data JSONB NOT NULL,
  confidence NUMERIC(3,2),

  executed BOOLEAN DEFAULT FALSE,
  execution_price NUMERIC(12,4),
  execution_time TIMESTAMPTZ,

  outcome TEXT,              -- 'profit', 'loss', 'break_even', 'pending'
  outcome_amount NUMERIC(12,2),

  user_id UUID
);

CREATE INDEX IF NOT EXISTS idx_trading_sig_strategy ON trading_signals(strategy_id);
CREATE INDEX IF NOT EXISTS idx_trading_sig_symbol ON trading_signals(symbol);
CREATE INDEX IF NOT EXISTS idx_trading_sig_created ON trading_signals(created_at DESC);

-- ----------------------------------------------------------------------------
-- MBA BRAIN TABLES
-- ----------------------------------------------------------------------------

-- Strategic Decisions
CREATE TABLE IF NOT EXISTS mba_strategic_decisions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  project_id TEXT,

  decision_type TEXT,        -- 'market_entry', 'pricing', 'partnership', 'pivot'
  title TEXT NOT NULL,

  context TEXT NOT NULL,
  options_considered JSONB,  -- Array of options with pros/cons
  decision_made TEXT NOT NULL,
  rationale TEXT NOT NULL,

  expected_outcome TEXT,
  actual_outcome TEXT,
  lessons_learned TEXT,

  tags TEXT[] DEFAULT '{}',
  user_id UUID
);

CREATE INDEX IF NOT EXISTS idx_mba_strat_project ON mba_strategic_decisions(project_id);
CREATE INDEX IF NOT EXISTS idx_mba_strat_type ON mba_strategic_decisions(decision_type);

-- Competitor Analysis
CREATE TABLE IF NOT EXISTS mba_competitor_analysis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  project_id TEXT,

  competitor_name TEXT NOT NULL,
  competitor_url TEXT,

  -- Analysis
  strengths TEXT[],
  weaknesses TEXT[],
  pricing_model TEXT,
  target_market TEXT,
  key_features JSONB,

  -- Our positioning
  differentiation_strategy TEXT,
  competitive_advantages TEXT[],

  threat_level TEXT,         -- 'low', 'medium', 'high'

  tags TEXT[] DEFAULT '{}',
  user_id UUID
);

CREATE INDEX IF NOT EXISTS idx_mba_comp_project ON mba_competitor_analysis(project_id);
CREATE INDEX IF NOT EXISTS idx_mba_comp_threat ON mba_competitor_analysis(threat_level);


-- ============================================================================
-- TIER 3: ORCHESTRATION TABLES (CEO Brain)
-- ============================================================================

-- Task Delegations: CEO Brain routes tasks to specialist brains
CREATE TABLE IF NOT EXISTS ceo_task_delegations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  completed_at TIMESTAMPTZ,

  -- Task info
  task_id TEXT,
  task_description TEXT NOT NULL,
  project_id TEXT,

  -- Delegation
  source_brain TEXT DEFAULT 'ceo',
  target_brain TEXT NOT NULL,
  delegation_reason TEXT,

  -- Context passed
  input_context JSONB,

  -- Result received
  output_result JSONB,

  -- Status
  status TEXT DEFAULT 'pending',  -- 'pending', 'in_progress', 'completed', 'failed'

  -- Quality
  outcome_quality TEXT,      -- 'excellent', 'good', 'acceptable', 'poor'
  feedback TEXT,

  user_id UUID
);

CREATE INDEX IF NOT EXISTS idx_ceo_deleg_target ON ceo_task_delegations(target_brain);
CREATE INDEX IF NOT EXISTS idx_ceo_deleg_project ON ceo_task_delegations(project_id);
CREATE INDEX IF NOT EXISTS idx_ceo_deleg_status ON ceo_task_delegations(status);
CREATE INDEX IF NOT EXISTS idx_ceo_deleg_created ON ceo_task_delegations(created_at DESC);

-- Brain Collaborations: Multi-brain workflows
CREATE TABLE IF NOT EXISTS ceo_brain_collaborations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  completed_at TIMESTAMPTZ,

  project_id TEXT,
  task_description TEXT NOT NULL,

  -- Brains involved
  brains_involved TEXT[] NOT NULL,
  lead_brain TEXT,

  -- Collaboration type
  collaboration_type TEXT,   -- 'sequential', 'parallel', 'iterative'
  workflow_steps JSONB,      -- Ordered steps with brain assignments

  -- Outcome
  outcome TEXT,              -- 'success', 'partial', 'failed'
  deliverables JSONB,
  lessons_learned TEXT,

  -- Meta
  duration_minutes INTEGER,

  user_id UUID
);

CREATE INDEX IF NOT EXISTS idx_ceo_collab_brains ON ceo_brain_collaborations USING GIN(brains_involved);
CREATE INDEX IF NOT EXISTS idx_ceo_collab_project ON ceo_brain_collaborations(project_id);
CREATE INDEX IF NOT EXISTS idx_ceo_collab_outcome ON ceo_brain_collaborations(outcome);

-- Conflict Resolutions: When brains disagree
CREATE TABLE IF NOT EXISTS ceo_conflict_resolutions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  project_id TEXT,

  -- Conflict parties
  brain_a TEXT NOT NULL,
  brain_b TEXT NOT NULL,

  -- Conflict details
  conflict_type TEXT,        -- 'approach', 'priority', 'resource', 'timeline'
  brain_a_position TEXT NOT NULL,
  brain_b_position TEXT NOT NULL,

  -- Resolution
  resolution TEXT NOT NULL,
  resolution_rationale TEXT NOT NULL,
  winning_brain TEXT,        -- NULL if compromise

  -- Learning
  pattern_for_future TEXT,

  user_id UUID
);

CREATE INDEX IF NOT EXISTS idx_ceo_conflict_brains ON ceo_conflict_resolutions(brain_a, brain_b);
CREATE INDEX IF NOT EXISTS idx_ceo_conflict_type ON ceo_conflict_resolutions(conflict_type);


-- ============================================================================
-- TRIGGERS & FUNCTIONS
-- ============================================================================

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_shared_patterns_updated_at
  BEFORE UPDATE ON shared_patterns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_design_dna_updated_at
  BEFORE UPDATE ON design_dna
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_features_updated_at
  BEFORE UPDATE ON product_features
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trading_strategies_updated_at
  BEFORE UPDATE ON trading_strategies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mba_competitor_updated_at
  BEFORE UPDATE ON mba_competitor_analysis
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE shared_experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_failures ENABLE ROW LEVEL SECURITY;
ALTER TABLE design_dna ENABLE ROW LEVEL SECURITY;
ALTER TABLE design_references ENABLE ROW LEVEL SECURITY;
ALTER TABLE design_ux_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE design_style_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE eng_architecture_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE eng_tech_debt ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_user_research ENABLE ROW LEVEL SECURITY;
ALTER TABLE trading_strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE trading_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE mba_strategic_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE mba_competitor_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE ceo_task_delegations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ceo_brain_collaborations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ceo_conflict_resolutions ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read access (knowledge sharing)
CREATE POLICY "Allow public read" ON shared_experiences FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON shared_patterns FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON shared_failures FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON design_dna FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON design_references FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON design_ux_scores FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON design_style_decisions FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON eng_architecture_decisions FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON eng_tech_debt FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON product_features FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON product_user_research FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON trading_strategies FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON trading_signals FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON mba_strategic_decisions FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON mba_competitor_analysis FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON ceo_task_delegations FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON ceo_brain_collaborations FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON ceo_conflict_resolutions FOR SELECT USING (true);

-- Policy: Allow insert for all (service role will be used)
CREATE POLICY "Allow insert" ON shared_experiences FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow insert" ON shared_patterns FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow insert" ON shared_failures FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow insert" ON design_dna FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow insert" ON design_references FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow insert" ON design_ux_scores FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow insert" ON design_style_decisions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow insert" ON eng_architecture_decisions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow insert" ON eng_tech_debt FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow insert" ON product_features FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow insert" ON product_user_research FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow insert" ON trading_strategies FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow insert" ON trading_signals FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow insert" ON mba_strategic_decisions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow insert" ON mba_competitor_analysis FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow insert" ON ceo_task_delegations FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow insert" ON ceo_brain_collaborations FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow insert" ON ceo_conflict_resolutions FOR INSERT WITH CHECK (true);

-- Policy: Allow update for all
CREATE POLICY "Allow update" ON shared_experiences FOR UPDATE USING (true);
CREATE POLICY "Allow update" ON shared_patterns FOR UPDATE USING (true);
CREATE POLICY "Allow update" ON shared_failures FOR UPDATE USING (true);
CREATE POLICY "Allow update" ON design_dna FOR UPDATE USING (true);
CREATE POLICY "Allow update" ON design_references FOR UPDATE USING (true);
CREATE POLICY "Allow update" ON design_ux_scores FOR UPDATE USING (true);
CREATE POLICY "Allow update" ON design_style_decisions FOR UPDATE USING (true);
CREATE POLICY "Allow update" ON eng_architecture_decisions FOR UPDATE USING (true);
CREATE POLICY "Allow update" ON eng_tech_debt FOR UPDATE USING (true);
CREATE POLICY "Allow update" ON product_features FOR UPDATE USING (true);
CREATE POLICY "Allow update" ON product_user_research FOR UPDATE USING (true);
CREATE POLICY "Allow update" ON trading_strategies FOR UPDATE USING (true);
CREATE POLICY "Allow update" ON trading_signals FOR UPDATE USING (true);
CREATE POLICY "Allow update" ON mba_strategic_decisions FOR UPDATE USING (true);
CREATE POLICY "Allow update" ON mba_competitor_analysis FOR UPDATE USING (true);
CREATE POLICY "Allow update" ON ceo_task_delegations FOR UPDATE USING (true);
CREATE POLICY "Allow update" ON ceo_brain_collaborations FOR UPDATE USING (true);
CREATE POLICY "Allow update" ON ceo_conflict_resolutions FOR UPDATE USING (true);


-- ============================================================================
-- HELPER VIEWS
-- ============================================================================

-- Recent experiences across all brains
CREATE OR REPLACE VIEW recent_all_experiences AS
SELECT
  brain_type,
  project_id,
  category,
  task_summary,
  problem,
  solution,
  pattern_observed,
  tags,
  created_at
FROM shared_experiences
WHERE created_at >= NOW() - INTERVAL '30 days'
ORDER BY created_at DESC;

-- Top patterns by confidence
CREATE OR REPLACE VIEW top_patterns_by_confidence AS
SELECT
  brain_type,
  pattern_name,
  trigger,
  solution,
  observed_count,
  confidence_score,
  applicable_contexts
FROM shared_patterns
WHERE confidence_score >= 0.70
ORDER BY confidence_score DESC, observed_count DESC;

-- Failures by brain
CREATE OR REPLACE VIEW failures_by_brain AS
SELECT
  brain_type,
  COUNT(*) as failure_count,
  array_agg(DISTINCT failure_type) as failure_types
FROM shared_failures
GROUP BY brain_type
ORDER BY failure_count DESC;

-- Design DNA summary
CREATE OR REPLACE VIEW design_dna_summary AS
SELECT
  project_name,
  industry,
  design_mode,
  signature_move,
  ux_score_avg,
  originality_score,
  created_at
FROM design_dna
ORDER BY created_at DESC;

-- Brain collaboration success rates
CREATE OR REPLACE VIEW brain_collaboration_stats AS
SELECT
  brains_involved,
  COUNT(*) as total_collaborations,
  COUNT(*) FILTER (WHERE outcome = 'success') as successes,
  ROUND(COUNT(*) FILTER (WHERE outcome = 'success')::numeric / COUNT(*)::numeric * 100, 1) as success_rate
FROM ceo_brain_collaborations
GROUP BY brains_involved
ORDER BY total_collaborations DESC;


-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
--
-- Tables created:
--   TIER 1 (Universal): shared_experiences, shared_patterns, shared_failures
--   TIER 2 (Brain-specific):
--     - Design: design_dna, design_references, design_ux_scores, design_style_decisions
--     - Engineering: eng_architecture_decisions, eng_tech_debt
--     - Product: product_features, product_user_research
--     - Trading: trading_strategies, trading_signals
--     - MBA: mba_strategic_decisions, mba_competitor_analysis
--   TIER 3 (Orchestration): ceo_task_delegations, ceo_brain_collaborations, ceo_conflict_resolutions
--
-- Total: 18 tables + 5 views
--
-- Next steps:
-- 1. Verify tables: SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
-- 2. Test insert to shared_experiences
-- 3. Update brain CLAUDE.md files to reference these tables
-- ============================================================================
