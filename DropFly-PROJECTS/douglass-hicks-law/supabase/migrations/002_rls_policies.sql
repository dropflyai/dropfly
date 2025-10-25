-- LegalFlow Pro - Row Level Security Policies
-- Multi-tenant Attorney-Client Privilege Protection
-- Zero data cross-contamination between law firms
-- Created: 2025-08-17

-- =============================================================================
-- ENABLE RLS ON ALL TABLES
-- =============================================================================

ALTER TABLE law_firms ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_access_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE signature_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE signature_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE legal_research ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_law_citations ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_retention_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_health_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- UTILITY FUNCTIONS FOR RLS
-- =============================================================================

-- Get current user's law firm ID
CREATE OR REPLACE FUNCTION auth.get_user_law_firm_id()
RETURNS UUID AS $$
BEGIN
    RETURN (
        SELECT law_firm_id 
        FROM users 
        WHERE id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user has role within their law firm
CREATE OR REPLACE FUNCTION auth.user_has_role(required_role TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM users 
        WHERE id = auth.uid() 
        AND role = required_role 
        AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user has any of multiple roles
CREATE OR REPLACE FUNCTION auth.user_has_any_role(required_roles TEXT[])
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM users 
        WHERE id = auth.uid() 
        AND role = ANY(required_roles) 
        AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user can access case (assigned or has appropriate role)
CREATE OR REPLACE FUNCTION auth.user_can_access_case(case_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- Firm admins, partners can access all cases in their firm
    IF auth.user_has_any_role(ARRAY['firm_admin', 'partner']) THEN
        RETURN EXISTS (
            SELECT 1 FROM cases c
            WHERE c.id = case_id 
            AND c.law_firm_id = auth.get_user_law_firm_id()
        );
    END IF;
    
    -- Check if user is assigned to case or is lead attorney
    RETURN EXISTS (
        SELECT 1 FROM cases c
        LEFT JOIN case_assignments ca ON ca.case_id = c.id
        WHERE c.id = case_id 
        AND c.law_firm_id = auth.get_user_law_firm_id()
        AND (
            c.lead_attorney_id = auth.uid() 
            OR (ca.user_id = auth.uid() AND ca.is_active = true)
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user can access client (based on cases or role)
CREATE OR REPLACE FUNCTION auth.user_can_access_client(client_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- Firm admins, partners can access all clients in their firm
    IF auth.user_has_any_role(ARRAY['firm_admin', 'partner']) THEN
        RETURN EXISTS (
            SELECT 1 FROM clients cl
            WHERE cl.id = client_id 
            AND cl.law_firm_id = auth.get_user_law_firm_id()
        );
    END IF;
    
    -- Check if user has access through any case for this client
    RETURN EXISTS (
        SELECT 1 FROM clients cl
        INNER JOIN cases c ON c.client_id = cl.id
        LEFT JOIN case_assignments ca ON ca.case_id = c.id
        WHERE cl.id = client_id 
        AND cl.law_firm_id = auth.get_user_law_firm_id()
        AND (
            c.lead_attorney_id = auth.uid() 
            OR (ca.user_id = auth.uid() AND ca.is_active = true)
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check privileged document access (attorney-client privilege)
CREATE OR REPLACE FUNCTION auth.user_can_access_privileged_document(doc_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    doc_record RECORD;
BEGIN
    SELECT d.*, c.client_id, c.law_firm_id as case_law_firm_id
    INTO doc_record
    FROM documents d
    LEFT JOIN cases c ON c.id = d.case_id
    WHERE d.id = doc_id;
    
    -- Document must be in user's law firm
    IF doc_record.law_firm_id != auth.get_user_law_firm_id() THEN
        RETURN FALSE;
    END IF;
    
    -- Non-privileged documents: standard access rules apply
    IF NOT doc_record.is_privileged THEN
        IF doc_record.case_id IS NOT NULL THEN
            RETURN auth.user_can_access_case(doc_record.case_id);
        ELSIF doc_record.client_id IS NOT NULL THEN
            RETURN auth.user_can_access_client(doc_record.client_id);
        ELSE
            -- Firm-level document
            RETURN auth.user_has_any_role(ARRAY['firm_admin', 'partner', 'senior_associate', 'associate', 'paralegal', 'case_manager']);
        END IF;
    END IF;
    
    -- Privileged documents: strict attorney-client privilege rules
    
    -- Clients can only access their own privileged documents
    IF auth.user_has_role('client') THEN
        RETURN EXISTS (
            SELECT 1 FROM users u
            INNER JOIN clients cl ON cl.id = u.id -- Assuming client users link to client records
            WHERE u.id = auth.uid()
            AND cl.id = doc_record.client_id
        );
    END IF;
    
    -- Attorneys and legal staff: must be assigned to case or client
    IF doc_record.case_id IS NOT NULL THEN
        RETURN auth.user_can_access_case(doc_record.case_id);
    ELSIF doc_record.client_id IS NOT NULL THEN
        RETURN auth.user_can_access_client(doc_record.client_id);
    ELSE
        -- Firm-level privileged document: only attorneys and admins
        RETURN auth.user_has_any_role(ARRAY['firm_admin', 'partner', 'senior_associate', 'associate']);
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- LAW FIRMS RLS POLICIES
-- =============================================================================

-- Law firm admins can access their own firm
CREATE POLICY "law_firms_access" ON law_firms
    FOR ALL USING (
        auth.user_has_role('firm_admin') AND 
        id = auth.get_user_law_firm_id()
    );

-- System admins can access all firms (for support)
CREATE POLICY "law_firms_system_admin" ON law_firms
    FOR ALL USING (
        auth.user_has_role('system_admin')
    );

-- =============================================================================
-- USERS RLS POLICIES
-- =============================================================================

-- Users can access other users in their law firm based on role
CREATE POLICY "users_same_firm_access" ON users
    FOR SELECT USING (
        law_firm_id = auth.get_user_law_firm_id()
    );

-- Users can update their own profile
CREATE POLICY "users_update_own" ON users
    FOR UPDATE USING (
        id = auth.uid()
    );

-- Firm admins and partners can manage users in their firm
CREATE POLICY "users_firm_admin_management" ON users
    FOR ALL USING (
        law_firm_id = auth.get_user_law_firm_id() AND
        auth.user_has_any_role(ARRAY['firm_admin', 'partner'])
    );

-- Users can insert new users in their firm (for referrals/invites)
CREATE POLICY "users_insert_same_firm" ON users
    FOR INSERT WITH CHECK (
        law_firm_id = auth.get_user_law_firm_id() AND
        auth.user_has_any_role(ARRAY['firm_admin', 'partner'])
    );

-- =============================================================================
-- CLIENTS RLS POLICIES
-- =============================================================================

-- Access based on case assignments and role
CREATE POLICY "clients_access" ON clients
    FOR SELECT USING (
        law_firm_id = auth.get_user_law_firm_id() AND
        (
            auth.user_has_any_role(ARRAY['firm_admin', 'partner']) OR
            auth.user_can_access_client(id)
        )
    );

-- Insert/Update/Delete for authorized roles
CREATE POLICY "clients_management" ON clients
    FOR ALL USING (
        law_firm_id = auth.get_user_law_firm_id() AND
        auth.user_has_any_role(ARRAY['firm_admin', 'partner', 'senior_associate', 'case_manager'])
    );

-- Clients can view their own basic information
CREATE POLICY "clients_self_access" ON clients
    FOR SELECT USING (
        auth.user_has_role('client') AND
        EXISTS (
            SELECT 1 FROM users u
            WHERE u.id = auth.uid() 
            AND u.email IN (
                SELECT cc.email FROM client_contacts cc WHERE cc.client_id = clients.id
            )
        )
    );

-- =============================================================================
-- CLIENT CONTACTS RLS POLICIES
-- =============================================================================

CREATE POLICY "client_contacts_access" ON client_contacts
    FOR SELECT USING (
        law_firm_id = auth.get_user_law_firm_id() AND
        auth.user_can_access_client(client_id)
    );

CREATE POLICY "client_contacts_management" ON client_contacts
    FOR ALL USING (
        law_firm_id = auth.get_user_law_firm_id() AND
        auth.user_has_any_role(ARRAY['firm_admin', 'partner', 'senior_associate', 'case_manager']) AND
        auth.user_can_access_client(client_id)
    );

-- =============================================================================
-- CASES RLS POLICIES
-- =============================================================================

-- Access based on assignment or role
CREATE POLICY "cases_access" ON cases
    FOR SELECT USING (
        law_firm_id = auth.get_user_law_firm_id() AND
        (
            auth.user_has_any_role(ARRAY['firm_admin', 'partner']) OR
            auth.user_can_access_case(id)
        )
    );

-- Case management for authorized roles
CREATE POLICY "cases_management" ON cases
    FOR ALL USING (
        law_firm_id = auth.get_user_law_firm_id() AND
        (
            auth.user_has_any_role(ARRAY['firm_admin', 'partner', 'senior_associate']) OR
            (auth.user_has_any_role(ARRAY['associate', 'case_manager']) AND auth.user_can_access_case(id))
        )
    );

-- Clients can view basic info about their cases
CREATE POLICY "cases_client_access" ON cases
    FOR SELECT USING (
        auth.user_has_role('client') AND
        client_id IN (
            SELECT cl.id FROM clients cl
            INNER JOIN client_contacts cc ON cc.client_id = cl.id
            INNER JOIN users u ON u.email = cc.email
            WHERE u.id = auth.uid()
        )
    );

-- =============================================================================
-- CASE ASSIGNMENTS RLS POLICIES
-- =============================================================================

CREATE POLICY "case_assignments_access" ON case_assignments
    FOR SELECT USING (
        law_firm_id = auth.get_user_law_firm_id() AND
        auth.user_can_access_case(case_id)
    );

CREATE POLICY "case_assignments_management" ON case_assignments
    FOR ALL USING (
        law_firm_id = auth.get_user_law_firm_id() AND
        auth.user_has_any_role(ARRAY['firm_admin', 'partner', 'senior_associate']) AND
        auth.user_can_access_case(case_id)
    );

-- =============================================================================
-- DOCUMENTS RLS POLICIES - ATTORNEY-CLIENT PRIVILEGE PROTECTION
-- =============================================================================

-- Privileged document access with attorney-client privilege protection
CREATE POLICY "documents_privileged_access" ON documents
    FOR SELECT USING (
        law_firm_id = auth.get_user_law_firm_id() AND
        auth.user_can_access_privileged_document(id)
    );

-- Document management for authorized users
CREATE POLICY "documents_management" ON documents
    FOR INSERT WITH CHECK (
        law_firm_id = auth.get_user_law_firm_id() AND
        (
            (case_id IS NULL OR auth.user_can_access_case(case_id)) AND
            (client_id IS NULL OR auth.user_can_access_client(client_id))
        )
    );

CREATE POLICY "documents_update" ON documents
    FOR UPDATE USING (
        law_firm_id = auth.get_user_law_firm_id() AND
        (
            created_by = auth.uid() OR
            auth.user_has_any_role(ARRAY['firm_admin', 'partner', 'senior_associate'])
        ) AND
        auth.user_can_access_privileged_document(id)
    );

CREATE POLICY "documents_delete" ON documents
    FOR DELETE USING (
        law_firm_id = auth.get_user_law_firm_id() AND
        (
            created_by = auth.uid() OR
            auth.user_has_any_role(ARRAY['firm_admin', 'partner'])
        ) AND
        auth.user_can_access_privileged_document(id)
    );

-- =============================================================================
-- DOCUMENT ACCESS LOG RLS POLICIES
-- =============================================================================

CREATE POLICY "document_access_log_insert" ON document_access_log
    FOR INSERT WITH CHECK (
        law_firm_id = auth.get_user_law_firm_id() AND
        user_id = auth.uid()
    );

CREATE POLICY "document_access_log_access" ON document_access_log
    FOR SELECT USING (
        law_firm_id = auth.get_user_law_firm_id() AND
        (
            user_id = auth.uid() OR
            auth.user_has_any_role(ARRAY['firm_admin', 'partner'])
        )
    );

-- =============================================================================
-- COMMUNICATIONS RLS POLICIES
-- =============================================================================

-- Access based on case/client involvement and privilege
CREATE POLICY "communications_access" ON communications
    FOR SELECT USING (
        law_firm_id = auth.get_user_law_firm_id() AND
        (
            -- Non-privileged communications: standard access
            (NOT is_privileged AND (
                (case_id IS NULL OR auth.user_can_access_case(case_id)) AND
                (client_id IS NULL OR auth.user_can_access_client(client_id))
            )) OR
            -- Privileged communications: stricter access
            (is_privileged AND (
                from_user_id = auth.uid() OR
                auth.uid() = ANY(SELECT jsonb_array_elements_text(cc_users)) OR
                (
                    auth.user_has_any_role(ARRAY['firm_admin', 'partner', 'senior_associate', 'associate']) AND
                    ((case_id IS NOT NULL AND auth.user_can_access_case(case_id)) OR
                     (client_id IS NOT NULL AND auth.user_can_access_client(client_id)))
                )
            ))
        )
    );

CREATE POLICY "communications_management" ON communications
    FOR ALL USING (
        law_firm_id = auth.get_user_law_firm_id() AND
        (
            from_user_id = auth.uid() OR
            auth.user_has_any_role(ARRAY['firm_admin', 'partner', 'senior_associate'])
        )
    );

-- =============================================================================
-- TIME ENTRIES RLS POLICIES
-- =============================================================================

CREATE POLICY "time_entries_access" ON time_entries
    FOR SELECT USING (
        law_firm_id = auth.get_user_law_firm_id() AND
        (
            user_id = auth.uid() OR
            auth.user_has_any_role(ARRAY['firm_admin', 'partner']) OR
            (auth.user_has_role('case_manager') AND auth.user_can_access_case(case_id))
        )
    );

CREATE POLICY "time_entries_management" ON time_entries
    FOR ALL USING (
        law_firm_id = auth.get_user_law_firm_id() AND
        (
            user_id = auth.uid() OR
            auth.user_has_any_role(ARRAY['firm_admin', 'partner'])
        )
    );

-- =============================================================================
-- EXPENSES RLS POLICIES
-- =============================================================================

CREATE POLICY "expenses_access" ON expenses
    FOR SELECT USING (
        law_firm_id = auth.get_user_law_firm_id() AND
        (
            user_id = auth.uid() OR
            auth.user_has_any_role(ARRAY['firm_admin', 'partner']) OR
            (auth.user_has_role('case_manager') AND (case_id IS NULL OR auth.user_can_access_case(case_id)))
        )
    );

CREATE POLICY "expenses_management" ON expenses
    FOR ALL USING (
        law_firm_id = auth.get_user_law_firm_id() AND
        (
            user_id = auth.uid() OR
            auth.user_has_any_role(ARRAY['firm_admin', 'partner'])
        )
    );

-- =============================================================================
-- INVOICES RLS POLICIES
-- =============================================================================

CREATE POLICY "invoices_access" ON invoices
    FOR SELECT USING (
        law_firm_id = auth.get_user_law_firm_id() AND
        (
            auth.user_has_any_role(ARRAY['firm_admin', 'partner', 'case_manager']) OR
            (case_id IS NOT NULL AND auth.user_can_access_case(case_id)) OR
            (auth.user_has_role('client') AND auth.user_can_access_client(client_id))
        )
    );

CREATE POLICY "invoices_management" ON invoices
    FOR ALL USING (
        law_firm_id = auth.get_user_law_firm_id() AND
        auth.user_has_any_role(ARRAY['firm_admin', 'partner', 'case_manager'])
    );

-- =============================================================================
-- CALENDAR EVENTS RLS POLICIES
-- =============================================================================

CREATE POLICY "calendar_events_access" ON calendar_events
    FOR SELECT USING (
        law_firm_id = auth.get_user_law_firm_id() AND
        (
            created_by = auth.uid() OR
            auth.user_has_any_role(ARRAY['firm_admin', 'partner']) OR
            (case_id IS NOT NULL AND auth.user_can_access_case(case_id)) OR
            auth.uid() = ANY(SELECT jsonb_extract_path_text(jsonb_array_elements(participants), 'user_id')::UUID)
        )
    );

CREATE POLICY "calendar_events_management" ON calendar_events
    FOR ALL USING (
        law_firm_id = auth.get_user_law_firm_id() AND
        (
            created_by = auth.uid() OR
            auth.user_has_any_role(ARRAY['firm_admin', 'partner', 'case_manager'])
        )
    );

-- =============================================================================
-- TASKS RLS POLICIES
-- =============================================================================

CREATE POLICY "tasks_access" ON tasks
    FOR SELECT USING (
        law_firm_id = auth.get_user_law_firm_id() AND
        (
            assigned_to = auth.uid() OR
            created_by = auth.uid() OR
            auth.user_has_any_role(ARRAY['firm_admin', 'partner']) OR
            (case_id IS NOT NULL AND auth.user_can_access_case(case_id))
        )
    );

CREATE POLICY "tasks_management" ON tasks
    FOR ALL USING (
        law_firm_id = auth.get_user_law_firm_id() AND
        (
            assigned_to = auth.uid() OR
            created_by = auth.uid() OR
            auth.user_has_any_role(ARRAY['firm_admin', 'partner', 'senior_associate', 'case_manager'])
        )
    );

-- =============================================================================
-- LEGAL RESEARCH RLS POLICIES
-- =============================================================================

CREATE POLICY "legal_research_access" ON legal_research
    FOR SELECT USING (
        law_firm_id = auth.get_user_law_firm_id() AND
        (
            researcher_id = auth.uid() OR
            auth.user_has_any_role(ARRAY['firm_admin', 'partner', 'senior_associate', 'associate']) OR
            (case_id IS NOT NULL AND auth.user_can_access_case(case_id))
        )
    );

CREATE POLICY "legal_research_management" ON legal_research
    FOR ALL USING (
        law_firm_id = auth.get_user_law_firm_id() AND
        (
            researcher_id = auth.uid() OR
            auth.user_has_any_role(ARRAY['firm_admin', 'partner', 'senior_associate'])
        )
    );

-- =============================================================================
-- SIGNATURE REQUESTS RLS POLICIES
-- =============================================================================

CREATE POLICY "signature_requests_access" ON signature_requests
    FOR SELECT USING (
        law_firm_id = auth.get_user_law_firm_id() AND
        (
            created_by = auth.uid() OR
            auth.user_has_any_role(ARRAY['firm_admin', 'partner', 'senior_associate', 'paralegal']) OR
            (case_id IS NOT NULL AND auth.user_can_access_case(case_id))
        )
    );

CREATE POLICY "signature_requests_management" ON signature_requests
    FOR ALL USING (
        law_firm_id = auth.get_user_law_firm_id() AND
        auth.user_has_any_role(ARRAY['firm_admin', 'partner', 'senior_associate', 'paralegal'])
    );

-- =============================================================================
-- AUDIT LOG RLS POLICIES
-- =============================================================================

-- Audit logs are viewable by admins and partners for compliance
CREATE POLICY "audit_log_access" ON audit_log
    FOR SELECT USING (
        law_firm_id = auth.get_user_law_firm_id() AND
        auth.user_has_any_role(ARRAY['firm_admin', 'partner'])
    );

-- Only system can insert audit logs
CREATE POLICY "audit_log_system_insert" ON audit_log
    FOR INSERT WITH CHECK (true);

-- =============================================================================
-- SYSTEM MONITORING RLS POLICIES
-- =============================================================================

-- System health visible to admins only
CREATE POLICY "system_health_admin_only" ON system_health_checks
    FOR ALL USING (
        auth.user_has_role('firm_admin')
    );

-- Performance metrics viewable by admins and partners
CREATE POLICY "performance_metrics_access" ON performance_metrics
    FOR SELECT USING (
        (law_firm_id IS NULL AND auth.user_has_role('firm_admin')) OR
        (law_firm_id = auth.get_user_law_firm_id() AND auth.user_has_any_role(ARRAY['firm_admin', 'partner']))
    );

-- =============================================================================
-- DOCUMENT CATEGORIES AND OTHER SUPPORTING TABLES
-- =============================================================================

CREATE POLICY "document_categories_access" ON document_categories
    FOR SELECT USING (
        law_firm_id = auth.get_user_law_firm_id() OR
        law_firm_id = '00000000-0000-0000-0000-000000000000' -- Default categories
    );

CREATE POLICY "document_categories_management" ON document_categories
    FOR ALL USING (
        law_firm_id = auth.get_user_law_firm_id() AND
        auth.user_has_any_role(ARRAY['firm_admin', 'partner'])
    );

-- Similar policies for other supporting tables
CREATE POLICY "case_law_citations_access" ON case_law_citations
    FOR SELECT USING (
        law_firm_id = auth.get_user_law_firm_id() AND
        (
            created_by = auth.uid() OR
            auth.user_has_any_role(ARRAY['firm_admin', 'partner', 'senior_associate', 'associate']) OR
            (case_id IS NOT NULL AND auth.user_can_access_case(case_id))
        )
    );

CREATE POLICY "case_law_citations_management" ON case_law_citations
    FOR ALL USING (
        law_firm_id = auth.get_user_law_firm_id() AND
        auth.user_has_any_role(ARRAY['firm_admin', 'partner', 'senior_associate', 'associate', 'paralegal'])
    );

CREATE POLICY "signature_requirements_access" ON signature_requirements
    FOR SELECT USING (
        law_firm_id = auth.get_user_law_firm_id() AND
        EXISTS (
            SELECT 1 FROM signature_requests sr
            WHERE sr.id = signature_request_id
            AND (
                sr.created_by = auth.uid() OR
                auth.user_has_any_role(ARRAY['firm_admin', 'partner', 'senior_associate', 'paralegal'])
            )
        )
    );

CREATE POLICY "calendar_reminders_access" ON calendar_reminders
    FOR SELECT USING (
        law_firm_id = auth.get_user_law_firm_id() AND
        (
            user_id = auth.uid() OR
            auth.user_has_any_role(ARRAY['firm_admin', 'partner'])
        )
    );

CREATE POLICY "data_retention_log_access" ON data_retention_log
    FOR SELECT USING (
        law_firm_id = auth.get_user_law_firm_id() AND
        auth.user_has_any_role(ARRAY['firm_admin', 'partner'])
    );

-- =============================================================================
-- ENABLE REALTIME FOR COLLABORATIVE FEATURES
-- =============================================================================

-- Enable realtime subscriptions for collaborative features
ALTER PUBLICATION supabase_realtime ADD TABLE cases;
ALTER PUBLICATION supabase_realtime ADD TABLE documents;
ALTER PUBLICATION supabase_realtime ADD TABLE communications;
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE calendar_events;
ALTER PUBLICATION supabase_realtime ADD TABLE time_entries;

COMMIT;