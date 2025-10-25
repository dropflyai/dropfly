-- LegalFlow Pro - Audit Trails and Compliance Monitoring
-- Comprehensive auditing system for legal compliance
-- Data retention, privilege tracking, and regulatory compliance
-- Created: 2025-08-17

-- =============================================================================
-- ENHANCED AUDIT TRIGGERS AND FUNCTIONS
-- =============================================================================

-- Function to capture detailed change information
CREATE OR REPLACE FUNCTION enhanced_audit_trigger_function()
RETURNS TRIGGER AS $$
DECLARE
    old_data JSONB;
    new_data JSONB;
    changed_fields JSONB := '{}';
    field_name TEXT;
    law_firm_id_val UUID;
    user_id_val UUID;
BEGIN
    -- Get law firm ID from either NEW or OLD record
    law_firm_id_val := COALESCE(NEW.law_firm_id, OLD.law_firm_id);
    
    -- Get current user ID from session
    user_id_val := NULLIF(current_setting('app.current_user_id', true), '')::UUID;
    
    -- Convert records to JSONB
    old_data := CASE WHEN TG_OP = 'DELETE' OR TG_OP = 'UPDATE' THEN row_to_json(OLD)::JSONB ELSE NULL END;
    new_data := CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN row_to_json(NEW)::JSONB ELSE NULL END;
    
    -- For UPDATE operations, capture only changed fields
    IF TG_OP = 'UPDATE' THEN
        FOR field_name IN SELECT key FROM jsonb_each(new_data) LOOP
            IF old_data->field_name IS DISTINCT FROM new_data->field_name THEN
                changed_fields := changed_fields || jsonb_build_object(
                    field_name, 
                    jsonb_build_object(
                        'old_value', old_data->field_name,
                        'new_value', new_data->field_name
                    )
                );
            END IF;
        END LOOP;
    END IF;
    
    -- Insert comprehensive audit record
    INSERT INTO audit_log (
        law_firm_id,
        user_id,
        entity_type,
        entity_id,
        action,
        old_values,
        new_values,
        changed_fields,
        ip_address,
        user_agent,
        session_id,
        notes
    ) VALUES (
        law_firm_id_val,
        user_id_val,
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        CASE TG_OP
            WHEN 'INSERT' THEN 'create'
            WHEN 'UPDATE' THEN 'update'
            WHEN 'DELETE' THEN 'delete'
        END,
        old_data,
        new_data,
        CASE WHEN TG_OP = 'UPDATE' THEN changed_fields ELSE NULL END,
        NULLIF(current_setting('app.client_ip', true), '')::INET,
        NULLIF(current_setting('app.user_agent', true), ''),
        NULLIF(current_setting('app.session_id', true), ''),
        CASE 
            WHEN TG_OP = 'DELETE' THEN 'Record deleted'
            WHEN TG_OP = 'INSERT' THEN 'Record created'
            WHEN TG_OP = 'UPDATE' THEN 'Record updated: ' || array_to_string(ARRAY(SELECT key FROM jsonb_each(changed_fields)), ', ')
        END
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add changed_fields column to audit_log if not exists
ALTER TABLE audit_log ADD COLUMN IF NOT EXISTS changed_fields JSONB;

-- Update audit triggers to use enhanced function
DROP TRIGGER IF EXISTS audit_law_firms ON law_firms;
DROP TRIGGER IF EXISTS audit_users ON users;
DROP TRIGGER IF EXISTS audit_clients ON clients;
DROP TRIGGER IF EXISTS audit_cases ON cases;
DROP TRIGGER IF EXISTS audit_documents ON documents;
DROP TRIGGER IF EXISTS audit_communications ON communications;
DROP TRIGGER IF EXISTS audit_time_entries ON time_entries;

CREATE TRIGGER audit_law_firms AFTER INSERT OR UPDATE OR DELETE ON law_firms FOR EACH ROW EXECUTE FUNCTION enhanced_audit_trigger_function();
CREATE TRIGGER audit_users AFTER INSERT OR UPDATE OR DELETE ON users FOR EACH ROW EXECUTE FUNCTION enhanced_audit_trigger_function();
CREATE TRIGGER audit_clients AFTER INSERT OR UPDATE OR DELETE ON clients FOR EACH ROW EXECUTE FUNCTION enhanced_audit_trigger_function();
CREATE TRIGGER audit_cases AFTER INSERT OR UPDATE OR DELETE ON cases FOR EACH ROW EXECUTE FUNCTION enhanced_audit_trigger_function();
CREATE TRIGGER audit_documents AFTER INSERT OR UPDATE OR DELETE ON documents FOR EACH ROW EXECUTE FUNCTION enhanced_audit_trigger_function();
CREATE TRIGGER audit_communications AFTER INSERT OR UPDATE OR DELETE ON communications FOR EACH ROW EXECUTE FUNCTION enhanced_audit_trigger_function();
CREATE TRIGGER audit_time_entries AFTER INSERT OR UPDATE OR DELETE ON time_entries FOR EACH ROW EXECUTE FUNCTION enhanced_audit_trigger_function();

-- Add audit triggers for remaining tables
CREATE TRIGGER audit_case_assignments AFTER INSERT OR UPDATE OR DELETE ON case_assignments FOR EACH ROW EXECUTE FUNCTION enhanced_audit_trigger_function();
CREATE TRIGGER audit_signature_requests AFTER INSERT OR UPDATE OR DELETE ON signature_requests FOR EACH ROW EXECUTE FUNCTION enhanced_audit_trigger_function();
CREATE TRIGGER audit_expenses AFTER INSERT OR UPDATE OR DELETE ON expenses FOR EACH ROW EXECUTE FUNCTION enhanced_audit_trigger_function();
CREATE TRIGGER audit_invoices AFTER INSERT OR UPDATE OR DELETE ON invoices FOR EACH ROW EXECUTE FUNCTION enhanced_audit_trigger_function();
CREATE TRIGGER audit_calendar_events AFTER INSERT OR UPDATE OR DELETE ON calendar_events FOR EACH ROW EXECUTE FUNCTION enhanced_audit_trigger_function();
CREATE TRIGGER audit_tasks AFTER INSERT OR UPDATE OR DELETE ON tasks FOR EACH ROW EXECUTE FUNCTION enhanced_audit_trigger_function();
CREATE TRIGGER audit_legal_research AFTER INSERT OR UPDATE OR DELETE ON legal_research FOR EACH ROW EXECUTE FUNCTION enhanced_audit_trigger_function();

-- =============================================================================
-- COMPLIANCE MONITORING TABLES
-- =============================================================================

-- Compliance requirements tracking
CREATE TABLE compliance_requirements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    law_firm_id UUID NOT NULL REFERENCES law_firms(id) ON DELETE CASCADE,
    regulation_type VARCHAR(100) NOT NULL, -- GDPR, CCPA, SOX, Bar Rules, etc.
    requirement_name VARCHAR(255) NOT NULL,
    description TEXT,
    compliance_category VARCHAR(100), -- data_protection, financial, ethical, etc.
    risk_level VARCHAR(20) DEFAULT 'medium' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
    frequency VARCHAR(50), -- daily, weekly, monthly, quarterly, annually
    responsible_role VARCHAR(100),
    deadline_days INTEGER, -- Days before deadline to alert
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Compliance monitoring and checks
CREATE TABLE compliance_checks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    law_firm_id UUID NOT NULL REFERENCES law_firms(id) ON DELETE CASCADE,
    requirement_id UUID NOT NULL REFERENCES compliance_requirements(id) ON DELETE CASCADE,
    check_date DATE NOT NULL,
    check_type VARCHAR(50) NOT NULL, -- automated, manual, audit
    status VARCHAR(50) NOT NULL CHECK (status IN ('compliant', 'non_compliant', 'pending', 'remediated')),
    findings TEXT,
    risk_assessment TEXT,
    remediation_required BOOLEAN DEFAULT false,
    remediation_deadline DATE,
    remediation_notes TEXT,
    checked_by UUID REFERENCES users(id),
    reviewed_by UUID REFERENCES users(id),
    evidence_document_id UUID REFERENCES documents(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Legal holds for litigation
CREATE TABLE legal_holds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    law_firm_id UUID NOT NULL REFERENCES law_firms(id) ON DELETE CASCADE,
    case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
    hold_name VARCHAR(255) NOT NULL,
    description TEXT,
    custodians JSONB, -- Array of custodian information
    scope_criteria TEXT, -- What data/documents are covered
    date_range_start DATE,
    date_range_end DATE,
    issued_date DATE NOT NULL,
    issued_by UUID NOT NULL REFERENCES users(id),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'released', 'superseded')),
    release_date DATE,
    release_reason TEXT,
    release_approved_by UUID REFERENCES users(id),
    auto_extend BOOLEAN DEFAULT false,
    review_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Data subject requests (GDPR, CCPA compliance)
CREATE TABLE data_subject_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    law_firm_id UUID NOT NULL REFERENCES law_firms(id) ON DELETE CASCADE,
    request_type VARCHAR(50) NOT NULL CHECK (request_type IN ('access', 'rectification', 'erasure', 'portability', 'restriction', 'objection')),
    subject_name VARCHAR(255) NOT NULL,
    subject_email VARCHAR(255),
    subject_phone VARCHAR(20),
    request_date DATE NOT NULL,
    request_details TEXT,
    legal_basis TEXT, -- Legal basis for processing
    response_deadline DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'received' CHECK (status IN ('received', 'processing', 'completed', 'rejected', 'extended')),
    assigned_to UUID REFERENCES users(id),
    response_provided_date DATE,
    response_method VARCHAR(100),
    response_document_id UUID REFERENCES documents(id),
    rejection_reason TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Privileged information tracking
CREATE TABLE privilege_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    law_firm_id UUID NOT NULL REFERENCES law_firms(id) ON DELETE CASCADE,
    entity_type VARCHAR(100) NOT NULL, -- documents, communications, etc.
    entity_id UUID NOT NULL,
    privilege_type VARCHAR(100) NOT NULL, -- attorney-client, work-product, etc.
    privilege_holder VARCHAR(255), -- Who can claim privilege
    privilege_date DATE NOT NULL,
    asserted_by UUID NOT NULL REFERENCES users(id),
    waived_date DATE,
    waived_by UUID REFERENCES users(id),
    waiver_reason TEXT,
    disclosure_log JSONB, -- Track any disclosures
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ethical compliance tracking
CREATE TABLE ethical_compliance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    law_firm_id UUID NOT NULL REFERENCES law_firms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    compliance_type VARCHAR(100) NOT NULL, -- CLE, bar_dues, malpractice_insurance, etc.
    requirement_name VARCHAR(255) NOT NULL,
    due_date DATE NOT NULL,
    completion_date DATE,
    certification_number VARCHAR(100),
    issuing_authority VARCHAR(255),
    renewal_required BOOLEAN DEFAULT true,
    renewal_interval_months INTEGER,
    next_renewal_date DATE,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'overdue', 'expired')),
    reminder_sent_date DATE,
    evidence_document_id UUID REFERENCES documents(id),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- DATA RETENTION AND DESTRUCTION
-- =============================================================================

-- Enhanced data retention policies
CREATE TABLE data_retention_policies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    law_firm_id UUID NOT NULL REFERENCES law_firms(id) ON DELETE CASCADE,
    policy_name VARCHAR(255) NOT NULL,
    entity_type VARCHAR(100) NOT NULL, -- Table name or document type
    retention_period_years INTEGER NOT NULL,
    retention_criteria TEXT, -- Conditions for retention
    destruction_method VARCHAR(100) DEFAULT 'secure_deletion',
    legal_hold_exception BOOLEAN DEFAULT true, -- Suspend destruction if on legal hold
    client_consent_required BOOLEAN DEFAULT false,
    review_before_destruction BOOLEAN DEFAULT true,
    responsible_role VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_by UUID NOT NULL REFERENCES users(id),
    approved_by UUID REFERENCES users(id),
    effective_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scheduled data destruction
CREATE TABLE data_destruction_schedule (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    law_firm_id UUID NOT NULL REFERENCES law_firms(id) ON DELETE CASCADE,
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID NOT NULL,
    scheduled_destruction_date DATE NOT NULL,
    retention_policy_id UUID NOT NULL REFERENCES data_retention_policies(id),
    legal_hold_active BOOLEAN DEFAULT false,
    legal_hold_ids JSONB, -- Array of legal hold IDs preventing destruction
    client_consent_obtained BOOLEAN DEFAULT true,
    review_required BOOLEAN DEFAULT true,
    reviewed_by UUID REFERENCES users(id),
    review_date DATE,
    review_approved BOOLEAN,
    review_notes TEXT,
    destruction_executed BOOLEAN DEFAULT false,
    destruction_date DATE,
    destruction_method VARCHAR(100),
    destruction_certificate_id UUID REFERENCES documents(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- COMPLIANCE AUTOMATION FUNCTIONS
-- =============================================================================

-- Function to automatically schedule data for destruction based on retention policies
CREATE OR REPLACE FUNCTION schedule_data_destruction()
RETURNS VOID AS $$
DECLARE
    policy_record RECORD;
    entity_record RECORD;
    destruction_date DATE;
BEGIN
    -- Process each active retention policy
    FOR policy_record IN 
        SELECT * FROM data_retention_policies WHERE is_active = true
    LOOP
        -- Find entities that need to be scheduled for destruction
        EXECUTE format('
            INSERT INTO data_destruction_schedule (
                law_firm_id, 
                entity_type, 
                entity_id, 
                scheduled_destruction_date, 
                retention_policy_id,
                review_required
            )
            SELECT 
                $1, 
                $2, 
                id, 
                created_at::date + interval ''%s years'',
                $3,
                $4
            FROM %I 
            WHERE law_firm_id = $1 
            AND created_at::date + interval ''%s years'' <= CURRENT_DATE
            AND id NOT IN (
                SELECT entity_id 
                FROM data_destruction_schedule 
                WHERE entity_type = $2 
                AND law_firm_id = $1
            )',
            policy_record.retention_period_years,
            policy_record.entity_type,
            policy_record.retention_period_years
        ) USING 
            policy_record.law_firm_id,
            policy_record.entity_type,
            policy_record.id,
            policy_record.review_before_destruction;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check legal holds before destruction
CREATE OR REPLACE FUNCTION check_legal_holds_for_destruction()
RETURNS VOID AS $$
BEGIN
    -- Update destruction schedule to reflect active legal holds
    UPDATE data_destruction_schedule 
    SET 
        legal_hold_active = true,
        legal_hold_ids = (
            SELECT jsonb_agg(lh.id)
            FROM legal_holds lh
            WHERE lh.status = 'active'
            AND lh.law_firm_id = data_destruction_schedule.law_firm_id
            AND (
                -- Check if entity is covered by legal hold
                (entity_type = 'cases' AND lh.case_id = entity_id) OR
                (entity_type = 'documents' AND EXISTS (
                    SELECT 1 FROM documents d 
                    WHERE d.id = entity_id 
                    AND (d.case_id = lh.case_id OR d.client_id IN (
                        SELECT client_id FROM cases WHERE id = lh.case_id
                    ))
                )) OR
                (entity_type = 'communications' AND EXISTS (
                    SELECT 1 FROM communications c
                    WHERE c.id = entity_id
                    AND (c.case_id = lh.case_id OR c.client_id IN (
                        SELECT client_id FROM cases WHERE id = lh.case_id
                    ))
                ))
            )
        )
    WHERE scheduled_destruction_date <= CURRENT_DATE + interval '30 days'
    AND NOT destruction_executed;
    
    -- Clear legal holds for inactive holds
    UPDATE data_destruction_schedule 
    SET 
        legal_hold_active = false,
        legal_hold_ids = NULL
    WHERE legal_hold_active = true
    AND NOT EXISTS (
        SELECT 1 FROM legal_holds lh
        WHERE lh.status = 'active'
        AND lh.law_firm_id = data_destruction_schedule.law_firm_id
        AND lh.id = ANY(SELECT jsonb_array_elements_text(legal_hold_ids)::UUID)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate compliance reports
CREATE OR REPLACE FUNCTION generate_compliance_report(
    p_law_firm_id UUID,
    p_start_date DATE DEFAULT CURRENT_DATE - interval '30 days',
    p_end_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
    compliance_summary JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT jsonb_build_object(
        'report_period', jsonb_build_object(
            'start_date', p_start_date,
            'end_date', p_end_date
        ),
        'compliance_checks', (
            SELECT jsonb_build_object(
                'total_checks', COUNT(*),
                'compliant', COUNT(*) FILTER (WHERE status = 'compliant'),
                'non_compliant', COUNT(*) FILTER (WHERE status = 'non_compliant'),
                'pending', COUNT(*) FILTER (WHERE status = 'pending'),
                'by_requirement', jsonb_agg(jsonb_build_object(
                    'requirement', cr.requirement_name,
                    'status', cc.status,
                    'check_date', cc.check_date
                ))
            )
            FROM compliance_checks cc
            JOIN compliance_requirements cr ON cr.id = cc.requirement_id
            WHERE cc.law_firm_id = p_law_firm_id
            AND cc.check_date BETWEEN p_start_date AND p_end_date
        ),
        'legal_holds', (
            SELECT jsonb_build_object(
                'active_holds', COUNT(*) FILTER (WHERE status = 'active'),
                'total_holds', COUNT(*),
                'holds_detail', jsonb_agg(jsonb_build_object(
                    'hold_name', hold_name,
                    'status', status,
                    'issued_date', issued_date
                ))
            )
            FROM legal_holds
            WHERE law_firm_id = p_law_firm_id
        ),
        'data_destruction', (
            SELECT jsonb_build_object(
                'scheduled', COUNT(*) FILTER (WHERE NOT destruction_executed),
                'executed', COUNT(*) FILTER (WHERE destruction_executed),
                'on_hold', COUNT(*) FILTER (WHERE legal_hold_active),
                'pending_review', COUNT(*) FILTER (WHERE review_required AND review_date IS NULL)
            )
            FROM data_destruction_schedule
            WHERE law_firm_id = p_law_firm_id
        ),
        'privilege_assertions', (
            SELECT jsonb_build_object(
                'total_assertions', COUNT(*),
                'active_privileges', COUNT(*) FILTER (WHERE waived_date IS NULL),
                'waived_privileges', COUNT(*) FILTER (WHERE waived_date IS NOT NULL),
                'by_type', jsonb_object_agg(privilege_type, type_count)
            )
            FROM (
                SELECT privilege_type, COUNT(*) as type_count
                FROM privilege_log
                WHERE law_firm_id = p_law_firm_id
                AND privilege_date BETWEEN p_start_date AND p_end_date
                GROUP BY privilege_type
            ) privilege_summary
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- COMPLIANCE MONITORING TRIGGERS
-- =============================================================================

-- Trigger to automatically create privilege log entries for privileged documents
CREATE OR REPLACE FUNCTION auto_privilege_logging()
RETURNS TRIGGER AS $$
BEGIN
    -- Log privilege for new privileged documents
    IF NEW.is_privileged = true AND (OLD IS NULL OR OLD.is_privileged = false) THEN
        INSERT INTO privilege_log (
            law_firm_id,
            entity_type,
            entity_id,
            privilege_type,
            privilege_holder,
            privilege_date,
            asserted_by
        ) VALUES (
            NEW.law_firm_id,
            'documents',
            NEW.id,
            CASE 
                WHEN NEW.is_work_product THEN 'work-product'
                ELSE 'attorney-client'
            END,
            COALESCE(NEW.privilege_holder, 'Client'),
            CURRENT_DATE,
            COALESCE(NULLIF(current_setting('app.current_user_id', true), '')::UUID, NEW.created_by)
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_auto_privilege_logging 
    AFTER INSERT OR UPDATE ON documents 
    FOR EACH ROW EXECUTE FUNCTION auto_privilege_logging();

-- Trigger for compliance deadline notifications
CREATE OR REPLACE FUNCTION compliance_deadline_check()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if compliance deadline is approaching
    IF NEW.due_date - CURRENT_DATE <= 7 AND OLD.reminder_sent_date IS NULL THEN
        -- Insert notification (would integrate with notification system)
        INSERT INTO audit_log (
            law_firm_id,
            user_id,
            entity_type,
            entity_id,
            action,
            notes
        ) VALUES (
            NEW.law_firm_id,
            NEW.user_id,
            'ethical_compliance',
            NEW.id,
            'deadline_warning',
            format('Compliance deadline approaching: %s due on %s', 
                NEW.requirement_name, NEW.due_date)
        );
        
        NEW.reminder_sent_date := CURRENT_DATE;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_compliance_deadline_check 
    BEFORE UPDATE ON ethical_compliance 
    FOR EACH ROW EXECUTE FUNCTION compliance_deadline_check();

-- =============================================================================
-- COMPLIANCE VIEWS AND REPORTS
-- =============================================================================

-- View for compliance dashboard
CREATE VIEW compliance_dashboard AS
SELECT 
    lf.id as law_firm_id,
    lf.name as law_firm_name,
    (
        SELECT COUNT(*) 
        FROM compliance_checks cc 
        WHERE cc.law_firm_id = lf.id 
        AND cc.check_date >= CURRENT_DATE - interval '30 days'
        AND cc.status = 'non_compliant'
    ) as recent_violations,
    (
        SELECT COUNT(*) 
        FROM legal_holds lh 
        WHERE lh.law_firm_id = lf.id 
        AND lh.status = 'active'
    ) as active_legal_holds,
    (
        SELECT COUNT(*) 
        FROM data_destruction_schedule dds 
        WHERE dds.law_firm_id = lf.id 
        AND dds.scheduled_destruction_date <= CURRENT_DATE 
        AND NOT dds.destruction_executed
        AND NOT dds.legal_hold_active
    ) as pending_destructions,
    (
        SELECT COUNT(*) 
        FROM ethical_compliance ec 
        WHERE ec.law_firm_id = lf.id 
        AND ec.due_date <= CURRENT_DATE + interval '30 days'
        AND ec.status = 'pending'
    ) as upcoming_compliance_deadlines
FROM law_firms lf
WHERE lf.is_active = true;

-- View for audit trail summary
CREATE VIEW audit_summary AS
SELECT 
    al.law_firm_id,
    al.entity_type,
    COUNT(*) as total_events,
    COUNT(*) FILTER (WHERE al.action = 'create') as creates,
    COUNT(*) FILTER (WHERE al.action = 'update') as updates,
    COUNT(*) FILTER (WHERE al.action = 'delete') as deletes,
    COUNT(DISTINCT al.user_id) as unique_users,
    MAX(al.created_at) as last_activity,
    COUNT(*) FILTER (WHERE al.created_at >= CURRENT_DATE - interval '7 days') as recent_activity
FROM audit_log al
GROUP BY al.law_firm_id, al.entity_type;

-- =============================================================================
-- SCHEDULED COMPLIANCE JOBS
-- =============================================================================

-- Schedule daily compliance checks
SELECT cron.schedule(
    'daily-compliance-check',
    '0 2 * * *', -- Daily at 2 AM
    $$
    SELECT schedule_data_destruction();
    SELECT check_legal_holds_for_destruction();
    $$
);

-- Schedule weekly compliance reports
SELECT cron.schedule(
    'weekly-compliance-report',
    '0 6 * * 1', -- Monday at 6 AM
    $$
    INSERT INTO system_health_checks (check_name, status, message, response_time_ms)
    SELECT 
        'Weekly Compliance Check',
        CASE 
            WHEN violation_count > 0 THEN 'warning'
            ELSE 'healthy'
        END,
        format('Found %s compliance violations this week', violation_count),
        0
    FROM (
        SELECT COUNT(*) as violation_count
        FROM compliance_checks 
        WHERE status = 'non_compliant' 
        AND check_date >= CURRENT_DATE - interval '7 days'
    ) violations;
    $$
);

COMMIT;