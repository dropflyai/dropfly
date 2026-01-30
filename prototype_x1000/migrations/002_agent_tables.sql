-- Migration 002: Agent system tables
-- Adds tables for tracking agent executions and brain builds

-- ============================================================================
-- AGENT RUNS TABLE
-- Track every agent execution for debugging, analytics, and learning
-- ============================================================================

CREATE TABLE IF NOT EXISTS agent_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_type TEXT NOT NULL,                    -- engineering, design, mba, ceo, brain_builder
    task_input TEXT NOT NULL,                    -- Original task/prompt
    task_output TEXT,                            -- Final response
    success BOOLEAN DEFAULT false,               -- Whether task completed successfully
    tool_calls JSONB DEFAULT '[]'::jsonb,        -- Array of tool calls made
    tokens_used INTEGER,                         -- Total tokens consumed
    model TEXT,                                  -- Model used (e.g., claude-sonnet-4)
    created_at TIMESTAMPTZ DEFAULT NOW(),

    -- Indexes for common queries
    CONSTRAINT agent_runs_agent_type_check CHECK (
        agent_type IN ('engineering', 'design', 'mba', 'ceo', 'brain_builder', 'options_trading', 'product')
    )
);

CREATE INDEX IF NOT EXISTS idx_agent_runs_agent_type ON agent_runs(agent_type);
CREATE INDEX IF NOT EXISTS idx_agent_runs_created_at ON agent_runs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_runs_success ON agent_runs(success);

-- ============================================================================
-- BRAIN BUILDS TABLE
-- Track brain generation attempts by the Brain Builder meta-agent
-- ============================================================================

CREATE TABLE IF NOT EXISTS brain_builds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brain_name TEXT NOT NULL,                    -- Name of the brain being built
    validation_passed BOOLEAN DEFAULT false,     -- Whether quality validation passed
    files_created TEXT[] DEFAULT '{}',           -- Array of file paths created
    validation_errors TEXT[] DEFAULT '{}',       -- Array of validation error messages
    template_brain TEXT,                         -- Which brain was used as template
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_brain_builds_brain_name ON brain_builds(brain_name);
CREATE INDEX IF NOT EXISTS idx_brain_builds_validation_passed ON brain_builds(validation_passed);
CREATE INDEX IF NOT EXISTS idx_brain_builds_created_at ON brain_builds(created_at DESC);

-- ============================================================================
-- TASK DELEGATIONS TABLE (CEO Brain)
-- Track how CEO routes tasks to specialist agents
-- ============================================================================

CREATE TABLE IF NOT EXISTS ceo_task_delegations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_input TEXT NOT NULL,                    -- Original user request
    decomposed_tasks JSONB DEFAULT '[]'::jsonb,  -- Array of sub-tasks created
    delegated_to TEXT[] DEFAULT '{}',            -- Which agents were delegated to
    routing_reasoning TEXT,                      -- Why this routing was chosen
    success BOOLEAN DEFAULT false,
    completion_summary TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ceo_delegations_created_at ON ceo_task_delegations(created_at DESC);

-- ============================================================================
-- BRAIN COLLABORATIONS TABLE
-- Track multi-brain workflows where agents call other agents
-- ============================================================================

CREATE TABLE IF NOT EXISTS ceo_brain_collaborations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_agent TEXT NOT NULL,                  -- Agent that initiated
    child_agent TEXT NOT NULL,                   -- Agent that was called
    task_description TEXT NOT NULL,
    result_summary TEXT,
    success BOOLEAN DEFAULT false,
    parent_run_id UUID REFERENCES agent_runs(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_brain_collaborations_parent ON ceo_brain_collaborations(parent_agent);
CREATE INDEX IF NOT EXISTS idx_brain_collaborations_child ON ceo_brain_collaborations(child_agent);

-- ============================================================================
-- AGENT METRICS VIEW
-- Aggregated metrics for monitoring agent performance
-- ============================================================================

CREATE OR REPLACE VIEW agent_metrics AS
SELECT
    agent_type,
    COUNT(*) as total_runs,
    SUM(CASE WHEN success THEN 1 ELSE 0 END) as successful_runs,
    ROUND(100.0 * SUM(CASE WHEN success THEN 1 ELSE 0 END) / COUNT(*), 2) as success_rate,
    AVG(tokens_used) as avg_tokens,
    DATE_TRUNC('day', created_at) as run_date
FROM agent_runs
GROUP BY agent_type, DATE_TRUNC('day', created_at)
ORDER BY run_date DESC, agent_type;

-- ============================================================================
-- RLS POLICIES (if using Supabase Auth)
-- ============================================================================

-- Enable RLS
ALTER TABLE agent_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE brain_builds ENABLE ROW LEVEL SECURITY;
ALTER TABLE ceo_task_delegations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ceo_brain_collaborations ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (for agents)
CREATE POLICY "Service role can manage agent_runs" ON agent_runs
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role can manage brain_builds" ON brain_builds
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role can manage ceo_task_delegations" ON ceo_task_delegations
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role can manage ceo_brain_collaborations" ON ceo_brain_collaborations
    FOR ALL USING (true) WITH CHECK (true);

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE agent_runs IS 'Tracks every agent execution for analytics and debugging';
COMMENT ON TABLE brain_builds IS 'Tracks brain generation attempts by Brain Builder agent';
COMMENT ON TABLE ceo_task_delegations IS 'Tracks how CEO agent routes tasks to specialists';
COMMENT ON TABLE ceo_brain_collaborations IS 'Tracks multi-agent collaborations';
COMMENT ON VIEW agent_metrics IS 'Aggregated daily metrics per agent type';
