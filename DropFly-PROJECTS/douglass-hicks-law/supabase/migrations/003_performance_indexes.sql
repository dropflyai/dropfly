-- LegalFlow Pro - Performance Optimization Indexes
-- Strategic indexes for legal document search and query optimization
-- Designed for law firm operations and large-scale document management
-- Created: 2025-08-17

-- =============================================================================
-- ADVANCED FULL-TEXT SEARCH INDEXES
-- =============================================================================

-- Legal document full-text search with legal terminology weighting
CREATE INDEX idx_documents_advanced_search ON documents USING gin(
    setweight(to_tsvector('english', title), 'A') ||
    setweight(to_tsvector('english', COALESCE(description, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(search_content, '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(document_type, '')), 'D')
);

-- Case full-text search for case titles, descriptions, and parties
CREATE INDEX idx_cases_full_search ON cases USING gin(
    setweight(to_tsvector('english', case_number), 'A') ||
    setweight(to_tsvector('english', title), 'A') ||
    setweight(to_tsvector('english', COALESCE(description, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(opposing_party, '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(opposing_counsel, '')), 'C') ||
    setweight(to_tsvector('english', practice_area), 'B')
);

-- Client search across names, legal names, and notes
CREATE INDEX idx_clients_full_search ON clients USING gin(
    setweight(to_tsvector('english', name), 'A') ||
    setweight(to_tsvector('english', COALESCE(legal_name, '')), 'A') ||
    setweight(to_tsvector('english', client_number), 'A') ||
    setweight(to_tsvector('english', COALESCE(notes, '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(industry, '')), 'D')
);

-- Communications content search
CREATE INDEX idx_communications_content_search ON communications USING gin(
    setweight(to_tsvector('english', COALESCE(subject, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(content, '')), 'B')
);

-- Legal research search
CREATE INDEX idx_legal_research_search ON legal_research USING gin(
    setweight(to_tsvector('english', title), 'A') ||
    setweight(to_tsvector('english', research_question), 'A') ||
    setweight(to_tsvector('english', COALESCE(summary, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(conclusions, '')), 'B')
);

-- Case law citations search
CREATE INDEX idx_case_law_search ON case_law_citations USING gin(
    setweight(to_tsvector('english', citation), 'A') ||
    setweight(to_tsvector('english', COALESCE(case_name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(legal_issue, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(holding, '')), 'B')
);

-- =============================================================================
-- COMPOUND INDEXES FOR COMPLEX QUERIES
-- =============================================================================

-- Multi-tenant security and performance
CREATE INDEX idx_users_firm_role_active ON users(law_firm_id, role, is_active);
CREATE INDEX idx_clients_firm_status_type ON clients(law_firm_id, client_status, type);
CREATE INDEX idx_cases_firm_status_area ON cases(law_firm_id, status, practice_area);
CREATE INDEX idx_documents_firm_case_privileged ON documents(law_firm_id, case_id, is_privileged) WHERE case_id IS NOT NULL;
CREATE INDEX idx_documents_firm_client_privileged ON documents(law_firm_id, client_id, is_privileged) WHERE client_id IS NOT NULL;

-- Case-centric queries (most common in legal workflows)
CREATE INDEX idx_case_assignments_case_active ON case_assignments(case_id, is_active);
CREATE INDEX idx_documents_case_category_type ON documents(case_id, category_id, document_type) WHERE case_id IS NOT NULL;
CREATE INDEX idx_time_entries_case_date_billable ON time_entries(case_id, date, is_billable);
CREATE INDEX idx_communications_case_date_type ON communications(case_id, communication_date, type) WHERE case_id IS NOT NULL;
CREATE INDEX idx_tasks_case_status_priority ON tasks(case_id, status, priority) WHERE case_id IS NOT NULL;

-- Client-centric queries
CREATE INDEX idx_cases_client_status_lead ON cases(client_id, status, lead_attorney_id);
CREATE INDEX idx_communications_client_date_privileged ON communications(client_id, communication_date, is_privileged) WHERE client_id IS NOT NULL;
CREATE INDEX idx_invoices_client_status_date ON invoices(client_id, status, invoice_date);

-- User activity and workload tracking
CREATE INDEX idx_time_entries_user_date_case ON time_entries(user_id, date, case_id);
CREATE INDEX idx_tasks_assigned_status_due ON tasks(assigned_to, status, due_date);
CREATE INDEX idx_calendar_events_user_start_time ON calendar_events(law_firm_id, start_datetime) 
    WHERE participants ? current_setting('app.current_user_id', true);

-- Billing and financial queries
CREATE INDEX idx_time_entries_billable_billed_firm ON time_entries(law_firm_id, is_billable, is_billed, date);
CREATE INDEX idx_expenses_billable_billed_firm ON expenses(law_firm_id, is_billable, is_billed, date);
CREATE INDEX idx_invoices_firm_status_date ON invoices(law_firm_id, status, due_date);

-- =============================================================================
-- DATE AND TIME-BASED INDEXES
-- =============================================================================

-- Calendar and deadline management
CREATE INDEX idx_calendar_events_firm_date_range ON calendar_events(law_firm_id, start_datetime, end_datetime);
CREATE INDEX idx_cases_court_dates ON cases(law_firm_id, next_court_date) WHERE next_court_date IS NOT NULL;
CREATE INDEX idx_cases_statute_limitations ON cases(law_firm_id, statute_of_limitations) WHERE statute_of_limitations IS NOT NULL;
CREATE INDEX idx_tasks_due_dates ON tasks(law_firm_id, due_date, status) WHERE due_date IS NOT NULL;

-- Document retention and compliance
CREATE INDEX idx_documents_retention_date ON documents(law_firm_id, retention_date) WHERE retention_date IS NOT NULL;
CREATE INDEX idx_data_retention_dates ON data_retention_log(law_firm_id, retention_date, destruction_date);

-- Time-based reporting
CREATE INDEX idx_time_entries_monthly_reporting ON time_entries(law_firm_id, date_trunc('month', date), is_billable);
CREATE INDEX idx_communications_monthly ON communications(law_firm_id, date_trunc('month', communication_date));

-- =============================================================================
-- SECURITY AND PRIVILEGE INDEXES
-- =============================================================================

-- Attorney-client privilege enforcement
CREATE INDEX idx_documents_privilege_access ON documents(law_firm_id, is_privileged, access_level, case_id);
CREATE INDEX idx_communications_privilege ON communications(law_firm_id, is_privileged, case_id, client_id);

-- Document access auditing
CREATE INDEX idx_document_access_log_doc_user_time ON document_access_log(document_id, user_id, created_at);
CREATE INDEX idx_audit_log_entity_action_time ON audit_log(entity_type, entity_id, action, created_at);

-- Conflict checking
CREATE INDEX idx_clients_conflict_check ON clients(law_firm_id, conflict_check_status, conflict_checked_at);

-- =============================================================================
-- JSONB INDEXES FOR COMPLEX DATA
-- =============================================================================

-- Document metadata and settings
CREATE INDEX idx_documents_signature_data ON documents USING gin(signature_data) WHERE signature_data IS NOT NULL;
CREATE INDEX idx_law_firms_settings ON law_firms USING gin(settings);
CREATE INDEX idx_users_permissions ON users USING gin(permissions);

-- Communication participants
CREATE INDEX idx_communications_participants ON communications USING gin(participants);
CREATE INDEX idx_calendar_events_participants ON calendar_events USING gin(participants);

-- Task dependencies
CREATE INDEX idx_tasks_dependencies ON tasks USING gin(dependencies) WHERE dependencies IS NOT NULL;

-- Client and case addresses
CREATE INDEX idx_clients_billing_address ON clients USING gin(billing_address) WHERE billing_address IS NOT NULL;
CREATE INDEX idx_clients_mailing_address ON clients USING gin(mailing_address) WHERE mailing_address IS NOT NULL;

-- =============================================================================
-- PARTIAL INDEXES FOR COMMON FILTERS
-- =============================================================================

-- Active records only
CREATE INDEX idx_users_active_firm ON users(law_firm_id, role) WHERE is_active = true;
CREATE INDEX idx_law_firms_active ON law_firms(name, slug) WHERE is_active = true;
CREATE INDEX idx_case_assignments_active ON case_assignments(case_id, user_id) WHERE is_active = true;

-- Open/active cases
CREATE INDEX idx_cases_open ON cases(law_firm_id, lead_attorney_id, practice_area) WHERE status IN ('open', 'pending');
CREATE INDEX idx_tasks_open ON tasks(assigned_to, due_date, priority) WHERE status IN ('pending', 'in_progress');

-- Billable time entries
CREATE INDEX idx_time_entries_billable_unbilled ON time_entries(case_id, user_id, date) WHERE is_billable = true AND is_billed = false;
CREATE INDEX idx_expenses_billable_unbilled ON expenses(case_id, user_id, date) WHERE is_billable = true AND is_billed = false;

-- Unpaid invoices
CREATE INDEX idx_invoices_unpaid ON invoices(law_firm_id, client_id, due_date) WHERE status IN ('sent', 'overdue');

-- Privileged documents
CREATE INDEX idx_documents_privileged_case ON documents(case_id, document_type, created_at) WHERE is_privileged = true;
CREATE INDEX idx_documents_work_product ON documents(case_id, created_by, created_at) WHERE is_work_product = true;

-- =============================================================================
-- UNIQUE CONSTRAINTS FOR DATA INTEGRITY
-- =============================================================================

-- Ensure unique case numbers within firms
CREATE UNIQUE INDEX idx_cases_unique_number_firm ON cases(law_firm_id, case_number);

-- Ensure unique client numbers within firms
CREATE UNIQUE INDEX idx_clients_unique_number_firm ON clients(law_firm_id, client_number);

-- Ensure unique invoice numbers within firms
CREATE UNIQUE INDEX idx_invoices_unique_number_firm ON invoices(law_firm_id, invoice_number);

-- One primary contact per client
CREATE UNIQUE INDEX idx_client_contacts_one_primary ON client_contacts(client_id) WHERE is_primary = true;

-- Unique email per law firm for users
CREATE UNIQUE INDEX idx_users_unique_email_firm ON users(law_firm_id, email);

-- =============================================================================
-- EXPRESSION INDEXES FOR COMPUTED QUERIES
-- =============================================================================

-- Case age calculation
CREATE INDEX idx_cases_age ON cases(law_firm_id, (CURRENT_DATE - opened_date)) WHERE status IN ('open', 'pending');

-- Document age
CREATE INDEX idx_documents_age ON documents(law_firm_id, (CURRENT_DATE - created_at::date));

-- Time entry total amounts
CREATE INDEX idx_time_entries_amounts ON time_entries(case_id, (duration_minutes * hourly_rate / 60.0)) WHERE is_billable = true;

-- Overdue tasks
CREATE INDEX idx_tasks_overdue ON tasks(assigned_to, (due_date - CURRENT_DATE)) 
    WHERE due_date IS NOT NULL AND status IN ('pending', 'in_progress');

-- =============================================================================
-- COVERING INDEXES FOR READ-HEAVY QUERIES
-- =============================================================================

-- Cover common document queries
CREATE INDEX idx_documents_cover_case_list ON documents(case_id, law_firm_id) 
    INCLUDE (title, document_type, created_at, created_by, file_size);

-- Cover case listing queries
CREATE INDEX idx_cases_cover_list ON cases(law_firm_id, status) 
    INCLUDE (case_number, title, client_id, lead_attorney_id, practice_area, opened_date);

-- Cover client listing queries
CREATE INDEX idx_clients_cover_list ON clients(law_firm_id, client_status) 
    INCLUDE (name, client_number, primary_contact_id, intake_date);

-- Cover time entry reporting
CREATE INDEX idx_time_entries_cover_reporting ON time_entries(case_id, date) 
    INCLUDE (user_id, duration_minutes, hourly_rate, is_billable, description);

-- =============================================================================
-- ANALYZE TABLES FOR OPTIMAL QUERY PLANNING
-- =============================================================================

-- Update table statistics for query planner
ANALYZE law_firms;
ANALYZE users;
ANALYZE clients;
ANALYZE client_contacts;
ANALYZE cases;
ANALYZE case_assignments;
ANALYZE documents;
ANALYZE document_categories;
ANALYZE communications;
ANALYZE time_entries;
ANALYZE expenses;
ANALYZE invoices;
ANALYZE calendar_events;
ANALYZE tasks;
ANALYZE legal_research;
ANALYZE case_law_citations;
ANALYZE signature_requests;
ANALYZE audit_log;

-- =============================================================================
-- PERFORMANCE MONITORING VIEWS
-- =============================================================================

-- Create view for monitoring slow queries
CREATE OR REPLACE VIEW slow_queries AS
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    min_time,
    max_time,
    stddev_time
FROM pg_stat_statements 
WHERE mean_time > 100 -- Queries taking more than 100ms on average
ORDER BY mean_time DESC;

-- Create view for index usage statistics
CREATE OR REPLACE VIEW index_usage_stats AS
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_tup_read,
    idx_tup_fetch,
    idx_scan,
    CASE 
        WHEN idx_scan = 0 THEN 'UNUSED'
        WHEN idx_scan < 100 THEN 'LOW USAGE'
        ELSE 'ACTIVE'
    END as usage_status
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;

-- Create view for table size monitoring
CREATE OR REPLACE VIEW table_sizes AS
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
    pg_total_relation_size(schemaname||'.'||tablename) as size_bytes
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

COMMIT;