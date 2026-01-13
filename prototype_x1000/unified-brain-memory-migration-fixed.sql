-- ============================================================================
-- PROTOTYPE X1000 — UNIFIED BRAIN MEMORY SYSTEM (FIXED)
-- ============================================================================
-- Architecture: Multi-brain support for all 37 specialist brains
-- Database: Supabase (ai-brains-memory project)
--
-- TIER 1: Universal Tables (all brains read/write)
-- TIER 2: Brain-Specific Tables (domain data)
-- TIER 3: Orchestration Tables (CEO Brain coordination)
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================================
-- TIER 1: UNIVERSAL TABLES (All 37 Brains)
-- ============================================================================

-- SHARED EXPERIENCES TABLE
CREATE TABLE IF NOT EXISTS shared_experiences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  brain_type TEXT NOT NULL,
  project_id TEXT,
  project_type TEXT,
  category TEXT NOT NULL,
  domain TEXT,
  task_summary TEXT NOT NULL,
  problem TEXT NOT NULL,
  solution TEXT NOT NULL,
  outcome TEXT,
  outcome_details TEXT,
  pattern_observed TEXT,
  lessons_learned TEXT,
  would_do_differently TEXT,
  reusable_for TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  confidence_score NUMERIC(3,2) DEFAULT 0.80,
  time_spent_minutes INTEGER,
  user_id UUID,
  search_vector TSVECTOR
);

CREATE INDEX IF NOT EXISTS idx_shared_exp_brain ON shared_experiences(brain_type);
CREATE INDEX IF NOT EXISTS idx_shared_exp_project ON shared_experiences(project_id);
CREATE INDEX IF NOT EXISTS idx_shared_exp_category ON shared_experiences(category);
CREATE INDEX IF NOT EXISTS idx_shared_exp_domain ON shared_experiences(domain);
CREATE INDEX IF NOT EXISTS idx_shared_exp_created ON shared_experiences(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_shared_exp_tags ON shared_experiences USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_shared_exp_search ON shared_experiences USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_shared_exp_reusable ON shared_experiences USING GIN(reusable_for);

-- SHARED PATTERNS TABLE
CREATE TABLE IF NOT EXISTS shared_patterns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  brain_type TEXT NOT NULL,
  pattern_name TEXT NOT NULL,
  pattern_type TEXT,
  trigger TEXT NOT NULL,
  solution TEXT NOT NULL,
  rationale TEXT,
  anti_pattern TEXT,
  evidence_count INTEGER DEFAULT 1,
  evidence_ids UUID[] DEFAULT '{}',
  applies_to TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  confidence_score NUMERIC(3,2) DEFAULT 0.80,
  verified BOOLEAN DEFAULT FALSE,
  search_vector TSVECTOR
);

CREATE INDEX IF NOT EXISTS idx_shared_pat_brain ON shared_patterns(brain_type);
CREATE INDEX IF NOT EXISTS idx_shared_pat_type ON shared_patterns(pattern_type);
CREATE INDEX IF NOT EXISTS idx_shared_pat_tags ON shared_patterns USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_shared_pat_applies ON shared_patterns USING GIN(applies_to);
CREATE INDEX IF NOT EXISTS idx_shared_pat_search ON shared_patterns USING GIN(search_vector);

-- SHARED FAILURES TABLE
CREATE TABLE IF NOT EXISTS shared_failures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  brain_type TEXT NOT NULL,
  project_id TEXT,
  failure_type TEXT NOT NULL,
  severity TEXT DEFAULT 'medium',
  error_message TEXT,
  context TEXT NOT NULL,
  root_cause TEXT,
  attempted_solutions JSONB DEFAULT '[]',
  final_resolution TEXT,
  prevention_strategy TEXT,
  tags TEXT[] DEFAULT '{}',
  resolved BOOLEAN DEFAULT FALSE,
  search_vector TSVECTOR
);

CREATE INDEX IF NOT EXISTS idx_shared_fail_brain ON shared_failures(brain_type);
CREATE INDEX IF NOT EXISTS idx_shared_fail_type ON shared_failures(failure_type);
CREATE INDEX IF NOT EXISTS idx_shared_fail_severity ON shared_failures(severity);
CREATE INDEX IF NOT EXISTS idx_shared_fail_resolved ON shared_failures(resolved);
CREATE INDEX IF NOT EXISTS idx_shared_fail_tags ON shared_failures USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_shared_fail_search ON shared_failures USING GIN(search_vector);

-- ============================================================================
-- TIER 2: BRAIN-SPECIFIC TABLES
-- ============================================================================

-- DESIGN BRAIN: Design DNA
CREATE TABLE IF NOT EXISTS design_dna (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  project_id TEXT,
  project_name TEXT NOT NULL,
  reference_url TEXT,
  reference_type TEXT,
  grid_system JSONB DEFAULT '{}',
  typography_scale JSONB DEFAULT '{}',
  color_tokens JSONB DEFAULT '{}',
  spacing_tokens JSONB DEFAULT '{}',
  component_styles JSONB DEFAULT '{}',
  interaction_patterns JSONB DEFAULT '{}',
  motion_system JSONB DEFAULT '{}',
  signature_move TEXT,
  differentiation_notes TEXT,
  similarity_score NUMERIC(3,2),
  tags TEXT[] DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_design_dna_project ON design_dna(project_id);

-- DESIGN BRAIN: References
CREATE TABLE IF NOT EXISTS design_references (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  project_id TEXT,
  reference_url TEXT NOT NULL,
  reference_type TEXT,
  visual_teardown JSONB DEFAULT '{}',
  extracted_patterns JSONB DEFAULT '{}',
  user_intent TEXT,
  what_to_copy TEXT,
  what_not_to_copy TEXT,
  differentiation_plan TEXT,
  dna_id UUID REFERENCES design_dna(id),
  tags TEXT[] DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_design_ref_project ON design_references(project_id);
CREATE INDEX IF NOT EXISTS idx_design_ref_dna ON design_references(dna_id);

-- DESIGN BRAIN: UX Scores
CREATE TABLE IF NOT EXISTS design_ux_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  project_id TEXT,
  screen_name TEXT NOT NULL,
  usability_score INTEGER CHECK (usability_score >= 1 AND usability_score <= 5),
  accessibility_score INTEGER CHECK (accessibility_score >= 1 AND accessibility_score <= 5),
  clarity_score INTEGER CHECK (clarity_score >= 1 AND clarity_score <= 5),
  efficiency_score INTEGER CHECK (efficiency_score >= 1 AND efficiency_score <= 5),
  learnability_score INTEGER CHECK (learnability_score >= 1 AND learnability_score <= 5),
  delight_score INTEGER CHECK (delight_score >= 1 AND delight_score <= 5),
  consistency_score INTEGER CHECK (consistency_score >= 1 AND consistency_score <= 5),
  error_prevention_score INTEGER CHECK (error_prevention_score >= 1 AND error_prevention_score <= 5),
  originality_score INTEGER CHECK (originality_score >= 1 AND originality_score <= 5),
  average_score NUMERIC(3,2),
  pass_fail TEXT,
  notes TEXT,
  improvement_suggestions JSONB DEFAULT '[]'
);

CREATE INDEX IF NOT EXISTS idx_ux_scores_project ON design_ux_scores(project_id);
CREATE INDEX IF NOT EXISTS idx_ux_scores_pass ON design_ux_scores(pass_fail);

-- DESIGN BRAIN: Style Decisions
CREATE TABLE IF NOT EXISTS design_style_decisions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  project_id TEXT,
  decision_type TEXT NOT NULL,
  decision TEXT NOT NULL,
  rationale TEXT,
  alternatives_considered JSONB DEFAULT '[]',
  constraints TEXT,
  outcome TEXT,
  tags TEXT[] DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_style_dec_project ON design_style_decisions(project_id);
CREATE INDEX IF NOT EXISTS idx_style_dec_type ON design_style_decisions(decision_type);

-- ENGINEERING BRAIN: Architecture Decisions
CREATE TABLE IF NOT EXISTS eng_architecture_decisions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  project_id TEXT,
  adr_number INTEGER,
  title TEXT NOT NULL,
  status TEXT DEFAULT 'proposed',
  context TEXT NOT NULL,
  decision TEXT NOT NULL,
  consequences TEXT,
  alternatives JSONB DEFAULT '[]',
  related_adrs UUID[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_eng_adr_project ON eng_architecture_decisions(project_id);
CREATE INDEX IF NOT EXISTS idx_eng_adr_status ON eng_architecture_decisions(status);

-- ENGINEERING BRAIN: Tech Debt
CREATE TABLE IF NOT EXISTS eng_tech_debt (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  project_id TEXT,
  debt_type TEXT NOT NULL,
  location TEXT,
  description TEXT NOT NULL,
  impact TEXT,
  effort_estimate TEXT,
  priority_score INTEGER DEFAULT 5,
  status TEXT DEFAULT 'identified',
  resolution_notes TEXT,
  resolved_at TIMESTAMPTZ,
  tags TEXT[] DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_tech_debt_project ON eng_tech_debt(project_id);
CREATE INDEX IF NOT EXISTS idx_tech_debt_status ON eng_tech_debt(status);
CREATE INDEX IF NOT EXISTS idx_tech_debt_priority ON eng_tech_debt(priority_score DESC);

-- PRODUCT BRAIN: Features
CREATE TABLE IF NOT EXISTS product_features (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  project_id TEXT,
  feature_name TEXT NOT NULL,
  description TEXT,
  user_story TEXT,
  acceptance_criteria JSONB DEFAULT '[]',
  priority TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'proposed',
  effort_estimate TEXT,
  business_value TEXT,
  dependencies UUID[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_product_feat_project ON product_features(project_id);
CREATE INDEX IF NOT EXISTS idx_product_feat_status ON product_features(status);
CREATE INDEX IF NOT EXISTS idx_product_feat_priority ON product_features(priority);

-- PRODUCT BRAIN: User Research
CREATE TABLE IF NOT EXISTS product_user_research (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  project_id TEXT,
  research_type TEXT NOT NULL,
  participant_count INTEGER,
  methodology TEXT,
  key_findings JSONB DEFAULT '[]',
  insights TEXT,
  recommendations JSONB DEFAULT '[]',
  quotes JSONB DEFAULT '[]',
  artifacts_urls TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_user_research_project ON product_user_research(project_id);
CREATE INDEX IF NOT EXISTS idx_user_research_type ON product_user_research(research_type);

-- TRADING BRAIN: Strategies
CREATE TABLE IF NOT EXISTS trading_strategies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  strategy_name TEXT NOT NULL,
  strategy_type TEXT NOT NULL,
  description TEXT,
  entry_rules JSONB DEFAULT '{}',
  exit_rules JSONB DEFAULT '{}',
  risk_parameters JSONB DEFAULT '{}',
  backtest_results JSONB DEFAULT '{}',
  live_performance JSONB DEFAULT '{}',
  status TEXT DEFAULT 'development',
  notes TEXT,
  tags TEXT[] DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_trading_strat_type ON trading_strategies(strategy_type);
CREATE INDEX IF NOT EXISTS idx_trading_strat_status ON trading_strategies(status);

-- TRADING BRAIN: Signals
CREATE TABLE IF NOT EXISTS trading_signals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  strategy_id UUID REFERENCES trading_strategies(id),
  signal_type TEXT NOT NULL,
  symbol TEXT NOT NULL,
  direction TEXT NOT NULL,
  entry_price NUMERIC(12,4),
  stop_loss NUMERIC(12,4),
  take_profit NUMERIC(12,4),
  confidence NUMERIC(3,2),
  status TEXT DEFAULT 'pending',
  execution_price NUMERIC(12,4),
  exit_price NUMERIC(12,4),
  pnl NUMERIC(12,4),
  notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_trading_sig_strategy ON trading_signals(strategy_id);
CREATE INDEX IF NOT EXISTS idx_trading_sig_symbol ON trading_signals(symbol);
CREATE INDEX IF NOT EXISTS idx_trading_sig_status ON trading_signals(status);
CREATE INDEX IF NOT EXISTS idx_trading_sig_created ON trading_signals(created_at DESC);

-- MBA BRAIN: Strategic Decisions
CREATE TABLE IF NOT EXISTS mba_strategic_decisions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  project_id TEXT,
  decision_area TEXT NOT NULL,
  decision TEXT NOT NULL,
  context TEXT,
  analysis JSONB DEFAULT '{}',
  alternatives JSONB DEFAULT '[]',
  risks JSONB DEFAULT '[]',
  expected_outcome TEXT,
  actual_outcome TEXT,
  lessons_learned TEXT,
  tags TEXT[] DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_mba_dec_project ON mba_strategic_decisions(project_id);
CREATE INDEX IF NOT EXISTS idx_mba_dec_area ON mba_strategic_decisions(decision_area);

-- MBA BRAIN: Competitor Analysis
CREATE TABLE IF NOT EXISTS mba_competitor_analysis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  project_id TEXT,
  competitor_name TEXT NOT NULL,
  website_url TEXT,
  strengths JSONB DEFAULT '[]',
  weaknesses JSONB DEFAULT '[]',
  pricing_info JSONB DEFAULT '{}',
  market_position TEXT,
  differentiation_opportunities TEXT,
  threat_level TEXT DEFAULT 'medium',
  notes TEXT,
  tags TEXT[] DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_mba_comp_project ON mba_competitor_analysis(project_id);
CREATE INDEX IF NOT EXISTS idx_mba_comp_threat ON mba_competitor_analysis(threat_level);

-- ============================================================================
-- TIER 3: ORCHESTRATION TABLES (CEO Brain)
-- ============================================================================

-- CEO BRAIN: Task Delegations
CREATE TABLE IF NOT EXISTS ceo_task_delegations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  project_id TEXT,
  original_task TEXT NOT NULL,
  delegated_to TEXT NOT NULL,
  delegation_rationale TEXT,
  subtasks JSONB DEFAULT '[]',
  status TEXT DEFAULT 'pending',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  result_summary TEXT,
  quality_score NUMERIC(3,2),
  notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_ceo_del_project ON ceo_task_delegations(project_id);
CREATE INDEX IF NOT EXISTS idx_ceo_del_brain ON ceo_task_delegations(delegated_to);
CREATE INDEX IF NOT EXISTS idx_ceo_del_status ON ceo_task_delegations(status);

-- CEO BRAIN: Brain Collaborations
CREATE TABLE IF NOT EXISTS ceo_brain_collaborations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  project_id TEXT,
  task_id UUID REFERENCES ceo_task_delegations(id),
  brains_involved TEXT[] NOT NULL,
  collaboration_type TEXT,
  workflow_definition JSONB DEFAULT '{}',
  handoff_points JSONB DEFAULT '[]',
  status TEXT DEFAULT 'active',
  completed_at TIMESTAMPTZ,
  outcome_summary TEXT,
  learnings TEXT
);

CREATE INDEX IF NOT EXISTS idx_ceo_collab_project ON ceo_brain_collaborations(project_id);
CREATE INDEX IF NOT EXISTS idx_ceo_collab_brains ON ceo_brain_collaborations USING GIN(brains_involved);
CREATE INDEX IF NOT EXISTS idx_ceo_collab_status ON ceo_brain_collaborations(status);

-- CEO BRAIN: Conflict Resolutions
CREATE TABLE IF NOT EXISTS ceo_conflict_resolutions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  project_id TEXT,
  collaboration_id UUID REFERENCES ceo_brain_collaborations(id),
  conflicting_brains TEXT[] NOT NULL,
  conflict_type TEXT NOT NULL,
  conflict_description TEXT NOT NULL,
  brain_positions JSONB DEFAULT '{}',
  resolution TEXT NOT NULL,
  resolution_rationale TEXT,
  precedent_set BOOLEAN DEFAULT FALSE,
  tags TEXT[] DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_ceo_conflict_project ON ceo_conflict_resolutions(project_id);
CREATE INDEX IF NOT EXISTS idx_ceo_conflict_brains ON ceo_conflict_resolutions USING GIN(conflicting_brains);

-- ============================================================================
-- TRIGGERS FOR SEARCH VECTORS
-- ============================================================================

CREATE OR REPLACE FUNCTION update_search_vector_experiences()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.task_summary, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.problem, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.solution, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.pattern_observed, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_search_vector_patterns()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.pattern_name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.trigger, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.solution, '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_search_vector_failures()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.failure_type, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.context, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.root_cause, '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_experiences_search ON shared_experiences;
CREATE TRIGGER trg_experiences_search
  BEFORE INSERT OR UPDATE ON shared_experiences
  FOR EACH ROW EXECUTE FUNCTION update_search_vector_experiences();

DROP TRIGGER IF EXISTS trg_patterns_search ON shared_patterns;
CREATE TRIGGER trg_patterns_search
  BEFORE INSERT OR UPDATE ON shared_patterns
  FOR EACH ROW EXECUTE FUNCTION update_search_vector_patterns();

DROP TRIGGER IF EXISTS trg_failures_search ON shared_failures;
CREATE TRIGGER trg_failures_search
  BEFORE INSERT OR UPDATE ON shared_failures
  FOR EACH ROW EXECUTE FUNCTION update_search_vector_failures();

-- ============================================================================
-- UPDATED_AT TRIGGERS
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_patterns_updated ON shared_patterns;
CREATE TRIGGER trg_patterns_updated
  BEFORE UPDATE ON shared_patterns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_strategies_updated ON trading_strategies;
CREATE TRIGGER trg_strategies_updated
  BEFORE UPDATE ON trading_strategies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_competitor_updated ON mba_competitor_analysis;
CREATE TRIGGER trg_competitor_updated
  BEFORE UPDATE ON mba_competitor_analysis
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

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

-- Public read policies (all experiences are shared knowledge)
CREATE POLICY "Public read shared_experiences" ON shared_experiences FOR SELECT USING (true);
CREATE POLICY "Public read shared_patterns" ON shared_patterns FOR SELECT USING (true);
CREATE POLICY "Public read shared_failures" ON shared_failures FOR SELECT USING (true);
CREATE POLICY "Public read design_dna" ON design_dna FOR SELECT USING (true);
CREATE POLICY "Public read design_references" ON design_references FOR SELECT USING (true);
CREATE POLICY "Public read design_ux_scores" ON design_ux_scores FOR SELECT USING (true);
CREATE POLICY "Public read design_style_decisions" ON design_style_decisions FOR SELECT USING (true);
CREATE POLICY "Public read eng_architecture_decisions" ON eng_architecture_decisions FOR SELECT USING (true);
CREATE POLICY "Public read eng_tech_debt" ON eng_tech_debt FOR SELECT USING (true);
CREATE POLICY "Public read product_features" ON product_features FOR SELECT USING (true);
CREATE POLICY "Public read product_user_research" ON product_user_research FOR SELECT USING (true);
CREATE POLICY "Public read trading_strategies" ON trading_strategies FOR SELECT USING (true);
CREATE POLICY "Public read trading_signals" ON trading_signals FOR SELECT USING (true);
CREATE POLICY "Public read mba_strategic_decisions" ON mba_strategic_decisions FOR SELECT USING (true);
CREATE POLICY "Public read mba_competitor_analysis" ON mba_competitor_analysis FOR SELECT USING (true);
CREATE POLICY "Public read ceo_task_delegations" ON ceo_task_delegations FOR SELECT USING (true);
CREATE POLICY "Public read ceo_brain_collaborations" ON ceo_brain_collaborations FOR SELECT USING (true);
CREATE POLICY "Public read ceo_conflict_resolutions" ON ceo_conflict_resolutions FOR SELECT USING (true);

-- Insert policies (service role and authenticated)
CREATE POLICY "Service insert shared_experiences" ON shared_experiences FOR INSERT WITH CHECK (true);
CREATE POLICY "Service insert shared_patterns" ON shared_patterns FOR INSERT WITH CHECK (true);
CREATE POLICY "Service insert shared_failures" ON shared_failures FOR INSERT WITH CHECK (true);
CREATE POLICY "Service insert design_dna" ON design_dna FOR INSERT WITH CHECK (true);
CREATE POLICY "Service insert design_references" ON design_references FOR INSERT WITH CHECK (true);
CREATE POLICY "Service insert design_ux_scores" ON design_ux_scores FOR INSERT WITH CHECK (true);
CREATE POLICY "Service insert design_style_decisions" ON design_style_decisions FOR INSERT WITH CHECK (true);
CREATE POLICY "Service insert eng_architecture_decisions" ON eng_architecture_decisions FOR INSERT WITH CHECK (true);
CREATE POLICY "Service insert eng_tech_debt" ON eng_tech_debt FOR INSERT WITH CHECK (true);
CREATE POLICY "Service insert product_features" ON product_features FOR INSERT WITH CHECK (true);
CREATE POLICY "Service insert product_user_research" ON product_user_research FOR INSERT WITH CHECK (true);
CREATE POLICY "Service insert trading_strategies" ON trading_strategies FOR INSERT WITH CHECK (true);
CREATE POLICY "Service insert trading_signals" ON trading_signals FOR INSERT WITH CHECK (true);
CREATE POLICY "Service insert mba_strategic_decisions" ON mba_strategic_decisions FOR INSERT WITH CHECK (true);
CREATE POLICY "Service insert mba_competitor_analysis" ON mba_competitor_analysis FOR INSERT WITH CHECK (true);
CREATE POLICY "Service insert ceo_task_delegations" ON ceo_task_delegations FOR INSERT WITH CHECK (true);
CREATE POLICY "Service insert ceo_brain_collaborations" ON ceo_brain_collaborations FOR INSERT WITH CHECK (true);
CREATE POLICY "Service insert ceo_conflict_resolutions" ON ceo_conflict_resolutions FOR INSERT WITH CHECK (true);

-- Update policies
CREATE POLICY "Service update shared_experiences" ON shared_experiences FOR UPDATE USING (true);
CREATE POLICY "Service update shared_patterns" ON shared_patterns FOR UPDATE USING (true);
CREATE POLICY "Service update shared_failures" ON shared_failures FOR UPDATE USING (true);
CREATE POLICY "Service update design_dna" ON design_dna FOR UPDATE USING (true);
CREATE POLICY "Service update design_references" ON design_references FOR UPDATE USING (true);
CREATE POLICY "Service update design_ux_scores" ON design_ux_scores FOR UPDATE USING (true);
CREATE POLICY "Service update design_style_decisions" ON design_style_decisions FOR UPDATE USING (true);
CREATE POLICY "Service update eng_architecture_decisions" ON eng_architecture_decisions FOR UPDATE USING (true);
CREATE POLICY "Service update eng_tech_debt" ON eng_tech_debt FOR UPDATE USING (true);
CREATE POLICY "Service update product_features" ON product_features FOR UPDATE USING (true);
CREATE POLICY "Service update product_user_research" ON product_user_research FOR UPDATE USING (true);
CREATE POLICY "Service update trading_strategies" ON trading_strategies FOR UPDATE USING (true);
CREATE POLICY "Service update trading_signals" ON trading_signals FOR UPDATE USING (true);
CREATE POLICY "Service update mba_strategic_decisions" ON mba_strategic_decisions FOR UPDATE USING (true);
CREATE POLICY "Service update mba_competitor_analysis" ON mba_competitor_analysis FOR UPDATE USING (true);
CREATE POLICY "Service update ceo_task_delegations" ON ceo_task_delegations FOR UPDATE USING (true);
CREATE POLICY "Service update ceo_brain_collaborations" ON ceo_brain_collaborations FOR UPDATE USING (true);
CREATE POLICY "Service update ceo_conflict_resolutions" ON ceo_conflict_resolutions FOR UPDATE USING (true);

-- ============================================================================
-- HELPER VIEWS
-- ============================================================================

CREATE OR REPLACE VIEW recent_experiences AS
SELECT * FROM shared_experiences
ORDER BY created_at DESC
LIMIT 100;

CREATE OR REPLACE VIEW active_patterns AS
SELECT * FROM shared_patterns
WHERE verified = true
ORDER BY confidence_score DESC;

CREATE OR REPLACE VIEW unresolved_failures AS
SELECT * FROM shared_failures
WHERE resolved = false
ORDER BY created_at DESC;

CREATE OR REPLACE VIEW brain_activity_summary AS
SELECT
  brain_type,
  COUNT(*) as total_experiences,
  COUNT(CASE WHEN category = 'success' THEN 1 END) as successes,
  COUNT(CASE WHEN category = 'failure' THEN 1 END) as failures,
  AVG(confidence_score) as avg_confidence
FROM shared_experiences
GROUP BY brain_type
ORDER BY total_experiences DESC;

CREATE OR REPLACE VIEW project_health AS
SELECT
  project_id,
  COUNT(DISTINCT brain_type) as brains_used,
  COUNT(*) as total_entries,
  MAX(created_at) as last_activity
FROM shared_experiences
WHERE project_id IS NOT NULL
GROUP BY project_id
ORDER BY last_activity DESC;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
-- Tables: 18
-- Indexes: 50+
-- Triggers: 6
-- Views: 5
-- RLS Policies: 54
-- ============================================================================
