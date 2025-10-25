-- LegalFlow Pro - Enterprise Backend Framework
-- Multi-tenant Law Firm Case Management System
-- Database Schema with Attorney-Client Privilege Protection
-- Created: 2025-08-17

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "unaccent";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- CORE TENANT MANAGEMENT
-- =============================================================================

-- Law Firms (Tenants) - Root isolation level
CREATE TABLE law_firms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    bar_number VARCHAR(50) UNIQUE,
    address JSONB,
    phone VARCHAR(20),
    email VARCHAR(255),
    website VARCHAR(255),
    logo_url TEXT,
    billing_info JSONB,
    subscription_tier VARCHAR(50) DEFAULT 'professional',
    settings JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User management with role-based access
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    law_firm_id UUID NOT NULL REFERENCES law_firms(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('firm_admin', 'partner', 'senior_associate', 'associate', 'paralegal', 'case_manager', 'hr_staff', 'client')),
    bar_number VARCHAR(50), -- For licensed attorneys
    phone VARCHAR(20),
    avatar_url TEXT,
    department VARCHAR(100),
    hourly_rate DECIMAL(10,2), -- For billing
    permissions JSONB DEFAULT '{}',
    last_login_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(law_firm_id, email)
);

-- =============================================================================
-- CLIENT MANAGEMENT
-- =============================================================================

-- Client organizations and individuals
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    law_firm_id UUID NOT NULL REFERENCES law_firms(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('individual', 'corporation', 'partnership', 'llc', 'non_profit')),
    name VARCHAR(255) NOT NULL,
    legal_name VARCHAR(255),
    client_number VARCHAR(50) NOT NULL,
    primary_contact_id UUID, -- References client_contacts
    billing_address JSONB,
    mailing_address JSONB,
    tax_id VARCHAR(50),
    industry VARCHAR(100),
    website VARCHAR(255),
    notes TEXT,
    conflict_check_status VARCHAR(50) DEFAULT 'pending',
    conflict_checked_by UUID REFERENCES users(id),
    conflict_checked_at TIMESTAMPTZ,
    intake_date DATE,
    client_status VARCHAR(50) DEFAULT 'active' CHECK (client_status IN ('active', 'inactive', 'former', 'potential')),
    is_privileged BOOLEAN DEFAULT true, -- Attorney-client privilege applies
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(law_firm_id, client_number)
);

-- Client contact persons
CREATE TABLE client_contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    law_firm_id UUID NOT NULL REFERENCES law_firms(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    title VARCHAR(100),
    email VARCHAR(255),
    phone VARCHAR(20),
    mobile VARCHAR(20),
    is_primary BOOLEAN DEFAULT false,
    is_authorized_representative BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign key constraint after client_contacts is created
ALTER TABLE clients ADD CONSTRAINT fk_clients_primary_contact 
    FOREIGN KEY (primary_contact_id) REFERENCES client_contacts(id);

-- =============================================================================
-- CASE MANAGEMENT
-- =============================================================================

-- Legal cases
CREATE TABLE cases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    law_firm_id UUID NOT NULL REFERENCES law_firms(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    case_number VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    practice_area VARCHAR(100) NOT NULL,
    case_type VARCHAR(100),
    court_jurisdiction VARCHAR(255),
    court_case_number VARCHAR(100),
    opposing_party VARCHAR(255),
    opposing_counsel VARCHAR(255),
    opposing_counsel_firm VARCHAR(255),
    lead_attorney_id UUID NOT NULL REFERENCES users(id),
    status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'pending', 'closed', 'settled', 'dismissed', 'won', 'lost')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    billing_type VARCHAR(50) DEFAULT 'hourly' CHECK (billing_type IN ('hourly', 'flat_fee', 'contingency', 'retainer')),
    billing_rate DECIMAL(10,2),
    estimated_hours DECIMAL(8,2),
    budget_amount DECIMAL(12,2),
    opened_date DATE NOT NULL,
    closed_date DATE,
    statute_of_limitations DATE,
    next_court_date DATE,
    case_value DECIMAL(15,2),
    settlement_amount DECIMAL(15,2),
    is_confidential BOOLEAN DEFAULT true,
    retention_policy_years INTEGER DEFAULT 7,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(law_firm_id, case_number)
);

-- Case team assignments
CREATE TABLE case_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    law_firm_id UUID NOT NULL REFERENCES law_firms(id) ON DELETE CASCADE,
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL CHECK (role IN ('lead_attorney', 'associate_attorney', 'paralegal', 'case_manager', 'researcher')),
    assigned_date DATE DEFAULT CURRENT_DATE,
    hourly_rate DECIMAL(10,2),
    is_active BOOLEAN DEFAULT true,
    permissions JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(case_id, user_id, role)
);

-- =============================================================================
-- DOCUMENT MANAGEMENT WITH ENCRYPTION
-- =============================================================================

-- Document categories and types
CREATE TABLE document_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    law_firm_id UUID NOT NULL REFERENCES law_firms(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_privileged BOOLEAN DEFAULT false,
    retention_years INTEGER DEFAULT 7,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(law_firm_id, name)
);

-- Legal documents with encryption and version control
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    law_firm_id UUID NOT NULL REFERENCES law_firms(id) ON DELETE CASCADE,
    case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    category_id UUID REFERENCES document_categories(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL, -- Encrypted storage path
    file_size BIGINT,
    mime_type VARCHAR(100),
    file_hash VARCHAR(128), -- For integrity verification
    encryption_key_id VARCHAR(100), -- Reference to encryption key
    version_number INTEGER DEFAULT 1,
    parent_document_id UUID REFERENCES documents(id), -- For versioning
    document_type VARCHAR(100),
    is_privileged BOOLEAN DEFAULT true,
    is_work_product BOOLEAN DEFAULT false,
    privilege_holder VARCHAR(100), -- Attorney-client, work product, etc.
    access_level VARCHAR(50) DEFAULT 'internal' CHECK (access_level IN ('public', 'internal', 'confidential', 'restricted')),
    retention_date DATE,
    created_by UUID NOT NULL REFERENCES users(id),
    reviewed_by UUID REFERENCES users(id),
    approved_by UUID REFERENCES users(id),
    signed_by UUID REFERENCES users(id),
    signature_data JSONB, -- Electronic signature metadata
    is_template BOOLEAN DEFAULT false,
    template_variables JSONB,
    search_content TEXT, -- Encrypted searchable content
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Document access log for audit trails
CREATE TABLE document_access_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    law_firm_id UUID NOT NULL REFERENCES law_firms(id) ON DELETE CASCADE,
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL CHECK (action IN ('view', 'download', 'edit', 'delete', 'share', 'print')),
    ip_address INET,
    user_agent TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- ELECTRONIC SIGNATURES
-- =============================================================================

-- Signature workflows and requests
CREATE TABLE signature_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    law_firm_id UUID NOT NULL REFERENCES law_firms(id) ON DELETE CASCADE,
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    case_id UUID REFERENCES cases(id),
    client_id UUID REFERENCES clients(id),
    title VARCHAR(255) NOT NULL,
    message TEXT,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled', 'expired')),
    expires_at TIMESTAMPTZ,
    completion_redirect_url TEXT,
    created_by UUID NOT NULL REFERENCES users(id),
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Individual signature requirements within a request
CREATE TABLE signature_requirements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    law_firm_id UUID NOT NULL REFERENCES law_firms(id) ON DELETE CASCADE,
    signature_request_id UUID NOT NULL REFERENCES signature_requests(id) ON DELETE CASCADE,
    signer_email VARCHAR(255) NOT NULL,
    signer_name VARCHAR(255) NOT NULL,
    signer_role VARCHAR(100),
    signature_type VARCHAR(50) DEFAULT 'electronic' CHECK (signature_type IN ('electronic', 'digital', 'witness')),
    page_number INTEGER,
    x_position INTEGER,
    y_position INTEGER,
    is_required BOOLEAN DEFAULT true,
    signed_at TIMESTAMPTZ,
    signature_data JSONB, -- Digital signature metadata
    ip_address INET,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- COMMUNICATIONS AND MESSAGING
-- =============================================================================

-- Internal and external communications
CREATE TABLE communications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    law_firm_id UUID NOT NULL REFERENCES law_firms(id) ON DELETE CASCADE,
    case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('email', 'phone', 'meeting', 'letter', 'fax', 'note')),
    direction VARCHAR(20) NOT NULL CHECK (direction IN ('inbound', 'outbound', 'internal')),
    subject VARCHAR(255),
    content TEXT,
    participants JSONB, -- Array of participants with roles
    from_user_id UUID REFERENCES users(id),
    to_contacts JSONB, -- External contacts
    cc_users JSONB, -- Internal users
    attachments JSONB, -- Document references
    communication_date TIMESTAMPTZ NOT NULL,
    is_privileged BOOLEAN DEFAULT true,
    privilege_type VARCHAR(100),
    billing_minutes INTEGER DEFAULT 0,
    billable_rate DECIMAL(10,2),
    is_billable BOOLEAN DEFAULT false,
    follow_up_date DATE,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- TIME TRACKING AND BILLING
-- =============================================================================

-- Time entries for billing and case management
CREATE TABLE time_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    law_firm_id UUID NOT NULL REFERENCES law_firms(id) ON DELETE CASCADE,
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    duration_minutes INTEGER NOT NULL,
    description TEXT NOT NULL,
    task_type VARCHAR(100), -- Research, drafting, meeting, court, etc.
    hourly_rate DECIMAL(10,2) NOT NULL,
    total_amount DECIMAL(10,2) GENERATED ALWAYS AS (duration_minutes / 60.0 * hourly_rate) STORED,
    is_billable BOOLEAN DEFAULT true,
    is_billed BOOLEAN DEFAULT false,
    invoice_id UUID, -- References invoices table
    notes TEXT,
    timer_started_at TIMESTAMPTZ,
    timer_stopped_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Expense tracking
CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    law_firm_id UUID NOT NULL REFERENCES law_firms(id) ON DELETE CASCADE,
    case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100), -- Travel, filing fees, copying, etc.
    vendor VARCHAR(255),
    receipt_document_id UUID REFERENCES documents(id),
    is_billable BOOLEAN DEFAULT true,
    is_billed BOOLEAN DEFAULT false,
    invoice_id UUID,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invoice generation and management
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    law_firm_id UUID NOT NULL REFERENCES law_firms(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    case_id UUID REFERENCES cases(id),
    invoice_number VARCHAR(100) NOT NULL,
    invoice_date DATE NOT NULL,
    due_date DATE NOT NULL,
    subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
    tax_rate DECIMAL(5,4) DEFAULT 0,
    tax_amount DECIMAL(12,2) DEFAULT 0,
    total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    paid_amount DECIMAL(12,2) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
    payment_terms VARCHAR(100),
    notes TEXT,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(law_firm_id, invoice_number)
);

-- =============================================================================
-- COURT DATES AND CALENDAR MANAGEMENT
-- =============================================================================

-- Court and event calendar
CREATE TABLE calendar_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    law_firm_id UUID NOT NULL REFERENCES law_firms(id) ON DELETE CASCADE,
    case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_type VARCHAR(100) NOT NULL, -- Court hearing, deposition, meeting, deadline
    start_datetime TIMESTAMPTZ NOT NULL,
    end_datetime TIMESTAMPTZ,
    location VARCHAR(255),
    court_room VARCHAR(100),
    judge_name VARCHAR(255),
    participants JSONB, -- Attendees and their roles
    preparation_time_hours DECIMAL(4,2),
    travel_time_hours DECIMAL(4,2),
    status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'rescheduled', 'completed', 'cancelled')),
    reminder_times JSONB, -- Array of reminder intervals
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Calendar notifications and reminders
CREATE TABLE calendar_reminders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    law_firm_id UUID NOT NULL REFERENCES law_firms(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES calendar_events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reminder_type VARCHAR(50) NOT NULL CHECK (reminder_type IN ('email', 'sms', 'push', 'system')),
    reminder_time TIMESTAMPTZ NOT NULL,
    message TEXT,
    is_sent BOOLEAN DEFAULT false,
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- LEGAL RESEARCH AND CASE LAW
-- =============================================================================

-- Legal research projects and case law
CREATE TABLE legal_research (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    law_firm_id UUID NOT NULL REFERENCES law_firms(id) ON DELETE CASCADE,
    case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    research_question TEXT NOT NULL,
    jurisdiction VARCHAR(255),
    practice_area VARCHAR(100),
    status VARCHAR(50) DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'archived')),
    summary TEXT,
    conclusions TEXT,
    researcher_id UUID NOT NULL REFERENCES users(id),
    reviewed_by UUID REFERENCES users(id),
    hours_spent DECIMAL(6,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Citations and case law references
CREATE TABLE case_law_citations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    law_firm_id UUID NOT NULL REFERENCES law_firms(id) ON DELETE CASCADE,
    research_id UUID REFERENCES legal_research(id) ON DELETE CASCADE,
    case_id UUID REFERENCES cases(id),
    citation VARCHAR(500) NOT NULL,
    case_name VARCHAR(255),
    court VARCHAR(255),
    decision_date DATE,
    jurisdiction VARCHAR(255),
    legal_issue TEXT,
    holding TEXT,
    relevance_score INTEGER CHECK (relevance_score BETWEEN 1 AND 10),
    notes TEXT,
    document_id UUID REFERENCES documents(id), -- Full case document
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- TASK AND WORKFLOW MANAGEMENT
-- =============================================================================

-- Case tasks and deadlines
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    law_firm_id UUID NOT NULL REFERENCES law_firms(id) ON DELETE CASCADE,
    case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
    assigned_to UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    task_type VARCHAR(100), -- Discovery, drafting, research, filing, etc.
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled', 'on_hold')),
    due_date DATE,
    estimated_hours DECIMAL(6,2),
    actual_hours DECIMAL(6,2),
    parent_task_id UUID REFERENCES tasks(id),
    dependencies JSONB, -- Task IDs this task depends on
    completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage BETWEEN 0 AND 100),
    completed_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- AUDIT TRAIL AND COMPLIANCE
-- =============================================================================

-- Comprehensive audit log for all system actions
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    law_firm_id UUID NOT NULL REFERENCES law_firms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    entity_type VARCHAR(100) NOT NULL, -- Table name
    entity_id UUID NOT NULL,
    action VARCHAR(50) NOT NULL CHECK (action IN ('create', 'read', 'update', 'delete', 'login', 'logout', 'export', 'print')),
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    session_id VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Data retention and compliance tracking
CREATE TABLE data_retention_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    law_firm_id UUID NOT NULL REFERENCES law_firms(id) ON DELETE CASCADE,
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID NOT NULL,
    retention_date DATE NOT NULL,
    destruction_date DATE,
    retention_reason VARCHAR(255),
    legal_hold BOOLEAN DEFAULT false,
    legal_hold_reason TEXT,
    destroyed_by UUID REFERENCES users(id),
    destruction_method VARCHAR(100),
    certification_document_id UUID REFERENCES documents(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- SYSTEM MONITORING AND HEALTH
-- =============================================================================

-- System health monitoring
CREATE TABLE system_health_checks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    check_name VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('healthy', 'warning', 'critical', 'unknown')),
    message TEXT,
    response_time_ms INTEGER,
    checked_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

-- Performance metrics
CREATE TABLE performance_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    law_firm_id UUID REFERENCES law_firms(id),
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(15,4) NOT NULL,
    metric_unit VARCHAR(20),
    tags JSONB,
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- TRIGGER FUNCTIONS FOR AUDIT TRAIL
-- =============================================================================

-- Generic audit trigger function
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_log (
        law_firm_id,
        user_id,
        entity_type,
        entity_id,
        action,
        old_values,
        new_values,
        ip_address,
        session_id
    ) VALUES (
        COALESCE(NEW.law_firm_id, OLD.law_firm_id),
        NULLIF(current_setting('app.current_user_id', true), '')::UUID,
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        CASE TG_OP
            WHEN 'INSERT' THEN 'create'
            WHEN 'UPDATE' THEN 'update'
            WHEN 'DELETE' THEN 'delete'
        END,
        CASE TG_OP WHEN 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
        CASE TG_OP WHEN 'INSERT' THEN row_to_json(NEW) WHEN 'UPDATE' THEN row_to_json(NEW) ELSE NULL END,
        NULLIF(current_setting('app.client_ip', true), '')::INET,
        NULLIF(current_setting('app.session_id', true), '')
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit triggers to all major tables
CREATE TRIGGER audit_law_firms AFTER INSERT OR UPDATE OR DELETE ON law_firms FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_users AFTER INSERT OR UPDATE OR DELETE ON users FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_clients AFTER INSERT OR UPDATE OR DELETE ON clients FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_cases AFTER INSERT OR UPDATE OR DELETE ON cases FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_documents AFTER INSERT OR UPDATE OR DELETE ON documents FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_communications AFTER INSERT OR UPDATE OR DELETE ON communications FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_time_entries AFTER INSERT OR UPDATE OR DELETE ON time_entries FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- =============================================================================
-- UPDATED_AT TRIGGERS
-- =============================================================================

-- Generic updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_law_firms_updated_at BEFORE UPDATE ON law_firms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cases_updated_at BEFORE UPDATE ON cases FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_legal_research_updated_at BEFORE UPDATE ON legal_research FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- INITIAL INDEXES (Performance Optimization)
-- =============================================================================

-- Law firms
CREATE INDEX idx_law_firms_slug ON law_firms(slug);
CREATE INDEX idx_law_firms_active ON law_firms(is_active);

-- Users
CREATE INDEX idx_users_law_firm_id ON users(law_firm_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(law_firm_id, role);
CREATE INDEX idx_users_active ON users(law_firm_id, is_active);

-- Clients
CREATE INDEX idx_clients_law_firm_id ON clients(law_firm_id);
CREATE INDEX idx_clients_client_number ON clients(law_firm_id, client_number);
CREATE INDEX idx_clients_status ON clients(law_firm_id, client_status);
CREATE INDEX idx_clients_search ON clients USING gin(to_tsvector('english', name || ' ' || COALESCE(legal_name, '')));

-- Cases
CREATE INDEX idx_cases_law_firm_id ON cases(law_firm_id);
CREATE INDEX idx_cases_client_id ON cases(client_id);
CREATE INDEX idx_cases_case_number ON cases(law_firm_id, case_number);
CREATE INDEX idx_cases_lead_attorney ON cases(lead_attorney_id);
CREATE INDEX idx_cases_status ON cases(law_firm_id, status);
CREATE INDEX idx_cases_practice_area ON cases(law_firm_id, practice_area);
CREATE INDEX idx_cases_court_dates ON cases(next_court_date) WHERE next_court_date IS NOT NULL;
CREATE INDEX idx_cases_search ON cases USING gin(to_tsvector('english', title || ' ' || COALESCE(description, '')));

-- Documents
CREATE INDEX idx_documents_law_firm_id ON documents(law_firm_id);
CREATE INDEX idx_documents_case_id ON documents(case_id);
CREATE INDEX idx_documents_client_id ON documents(client_id);
CREATE INDEX idx_documents_created_by ON documents(created_by);
CREATE INDEX idx_documents_type ON documents(law_firm_id, document_type);
CREATE INDEX idx_documents_privileged ON documents(law_firm_id, is_privileged);
CREATE INDEX idx_documents_search ON documents USING gin(to_tsvector('english', title || ' ' || COALESCE(description, '') || ' ' || COALESCE(search_content, '')));

-- Time entries
CREATE INDEX idx_time_entries_law_firm_id ON time_entries(law_firm_id);
CREATE INDEX idx_time_entries_case_id ON time_entries(case_id);
CREATE INDEX idx_time_entries_user_id ON time_entries(user_id);
CREATE INDEX idx_time_entries_date ON time_entries(law_firm_id, date);
CREATE INDEX idx_time_entries_billable ON time_entries(law_firm_id, is_billable);

-- Communications
CREATE INDEX idx_communications_law_firm_id ON communications(law_firm_id);
CREATE INDEX idx_communications_case_id ON communications(case_id);
CREATE INDEX idx_communications_client_id ON communications(client_id);
CREATE INDEX idx_communications_date ON communications(law_firm_id, communication_date);
CREATE INDEX idx_communications_type ON communications(law_firm_id, type);

-- Calendar events
CREATE INDEX idx_calendar_events_law_firm_id ON calendar_events(law_firm_id);
CREATE INDEX idx_calendar_events_case_id ON calendar_events(case_id);
CREATE INDEX idx_calendar_events_start_time ON calendar_events(start_datetime);
CREATE INDEX idx_calendar_events_type ON calendar_events(law_firm_id, event_type);

-- Audit log
CREATE INDEX idx_audit_log_law_firm_id ON audit_log(law_firm_id);
CREATE INDEX idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX idx_audit_log_entity ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at);

-- Tasks
CREATE INDEX idx_tasks_law_firm_id ON tasks(law_firm_id);
CREATE INDEX idx_tasks_case_id ON tasks(case_id);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_due_date ON tasks(due_date) WHERE due_date IS NOT NULL;
CREATE INDEX idx_tasks_status ON tasks(law_firm_id, status);

-- Performance monitoring indexes
CREATE INDEX idx_performance_metrics_firm_time ON performance_metrics(law_firm_id, recorded_at);
CREATE INDEX idx_system_health_checks_time ON system_health_checks(checked_at);

-- =============================================================================
-- SAMPLE DATA AND INITIAL SETUP
-- =============================================================================

-- Insert default document categories
INSERT INTO document_categories (id, law_firm_id, name, description, is_privileged, retention_years) VALUES
    (uuid_generate_v4(), '00000000-0000-0000-0000-000000000000', 'Pleadings', 'Court filings and pleadings', true, 10),
    (uuid_generate_v4(), '00000000-0000-0000-0000-000000000000', 'Discovery', 'Discovery documents and responses', true, 7),
    (uuid_generate_v4(), '00000000-0000-0000-0000-000000000000', 'Correspondence', 'Client and opposing counsel correspondence', true, 7),
    (uuid_generate_v4(), '00000000-0000-0000-0000-000000000000', 'Contracts', 'Agreements and contracts', true, 15),
    (uuid_generate_v4(), '00000000-0000-0000-0000-000000000000', 'Research', 'Legal research and memoranda', true, 5),
    (uuid_generate_v4(), '00000000-0000-0000-0000-000000000000', 'Evidence', 'Evidence and exhibits', true, 10),
    (uuid_generate_v4(), '00000000-0000-0000-0000-000000000000', 'Administrative', 'Administrative and billing documents', false, 7);

COMMIT;